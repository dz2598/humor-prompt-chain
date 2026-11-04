import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StepForm } from "@/components/step-form";
import { updateStep } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function EditStepPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); const { supabase, profile } = await requireAdmin();
  const { data: step } = await supabase.from("prompt_chain_steps").select("*").eq("id", id).maybeSingle(); if (!step) notFound();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return <AppShell name={name}><header className="page-header"><p className="eyebrow">STEP_{String(step.step_order).padStart(2, "0")}</p><h1>Edit prompt step</h1></header><section className="panel editor-panel"><StepForm action={updateStep.bind(null, id)} step={step} chainId={Number(step.prompt_chain_id)} submitLabel="Save step" /></section></AppShell>;
}
