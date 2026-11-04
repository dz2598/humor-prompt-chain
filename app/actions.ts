"use server";

import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const modelName = "gemini-3.1-flash-lite";
const text = (data: FormData, key: string) => typeof data.get(key) === "string" ? String(data.get(key)).trim() : "";

export async function createChain(data: FormData) {
  const { supabase } = await requireAdmin();
  const { data: chain, error } = await supabase.from("prompt_chains").insert({ name: text(data, "name"), description: text(data, "description") || null, status: text(data, "status") || "active" }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/chains/${chain.id}`);
}

export async function updateChain(id: number, data: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("prompt_chains").update({ name: text(data, "name"), description: text(data, "description") || null, status: text(data, "status"), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  redirect(`/chains/${id}`);
}

export async function deleteChain(id: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("prompt_chains").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function createStep(data: FormData) {
  const { supabase } = await requireAdmin();
  const chainId = Number(text(data, "chain_id"));
  const { count } = await supabase.from("prompt_chain_steps").select("id", { count: "exact", head: true }).eq("prompt_chain_id", chainId);
  const { error } = await supabase.from("prompt_chain_steps").insert({ prompt_chain_id: chainId, step_order: (count || 0) + 1, name: text(data, "name"), system_prompt: text(data, "system_prompt"), user_prompt_template: text(data, "user_prompt_template") || null });
  if (error) throw new Error(error.message);
  redirect(`/chains/${chainId}`);
}

export async function updateStep(id: number, data: FormData) {
  const { supabase } = await requireAdmin();
  const chainId = Number(text(data, "chain_id"));
  const { error } = await supabase.from("prompt_chain_steps").update({ name: text(data, "name"), system_prompt: text(data, "system_prompt"), user_prompt_template: text(data, "user_prompt_template") || null }).eq("id", id);
  if (error) throw new Error(error.message);
  redirect(`/chains/${chainId}`);
}

export async function deleteStep(id: number, chainId: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("prompt_chain_steps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const { data: remaining } = await supabase.from("prompt_chain_steps").select("id").eq("prompt_chain_id", chainId).order("step_order");
  if (remaining) await reorderSteps(chainId, remaining.map(step => Number(step.id)));
  revalidatePath(`/chains/${chainId}`);
}

export async function reorderSteps(chainId: number, orderedIds: number[]) {
  const { supabase } = await requireAdmin();
  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase.from("prompt_chain_steps").update({ step_order: -(index + 1) }).eq("id", orderedIds[index]).eq("prompt_chain_id", chainId);
    if (error) throw new Error(error.message);
  }
  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase.from("prompt_chain_steps").update({ step_order: index + 1 }).eq("id", orderedIds[index]).eq("prompt_chain_id", chainId);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/chains/${chainId}`);
}

function fill(template: string, input: string, previous: string) {
  return template.replaceAll("{{prompt}}", input).replaceAll("{{previous_output}}", previous).replaceAll("{{image_analysis}}", previous).replaceAll("{{scenario_analysis}}", previous);
}

export async function generateWithChain(chainId: number, data: FormData) {
  const { supabase, user } = await requireAdmin();
  const input = text(data, "prompt");
  if (!input) throw new Error("Enter a test prompt.");
  const { data: steps, error: stepsError } = await supabase.from("prompt_chain_steps").select("*").eq("prompt_chain_id", chainId).order("step_order");
  if (stepsError || !steps?.length) throw new Error(stepsError?.message || "Create at least one step first.");
  const { data: request, error: requestError } = await supabase.from("generation_requests").insert({ user_id: user.id, prompt_chain_id: chainId, input_prompt: input, status: "processing" }).select("id").single();
  if (requestError) throw new Error(requestError.message);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  let previous = "";
  try {
    for (const step of steps) {
      const started = performance.now();
      const template = String(step.user_prompt_template || "Input: {{prompt}}\nPrevious output: {{previous_output}}");
      const interaction = await ai.interactions.create({ model: modelName, input: [{ type: "text", text: `${step.system_prompt || ""}\n\n${fill(template, input, previous)}` }] });
      previous = interaction.output_text?.trim() || "";
      if (!previous) throw new Error(`Step ${step.step_order} returned no output.`);
      await supabase.from("llm_responses").insert({ generation_request_id: request.id, step_order: step.step_order, step_name: step.name, response_text: previous, latency_ms: Math.round(performance.now() - started) });
    }
    await supabase.from("generation_requests").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", request.id);
  } catch (error) {
    await supabase.from("generation_requests").update({ status: "failed", completed_at: new Date().toISOString() }).eq("id", request.id);
    throw error;
  }
  revalidatePath(`/chains/${chainId}`);
  redirect(`/chains/${chainId}#generated`);
}
