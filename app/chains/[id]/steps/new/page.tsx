import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StepForm } from "@/components/step-form";
import { createStep } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function NewStepPage({ params }: { params: Promise<{ id: string }> }) {
  const chainId = Number((await params).id); const { supabase, profile } = await requireAdmin();
  const { data: chain } = await supabase.from("prompt_chains").select("name").eq("id", chainId).maybeSingle(); if (!chain) notFound();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return <AppShell name={name}><header className="page-header"><p className="eyebrow">ADD STAGE // {chain.name}</p><h1>Create prompt step</h1></header><section className="panel editor-panel"><StepForm action={createStep} chainId={chainId} submitLabel="Add step" /></section></AppShell>;
}
