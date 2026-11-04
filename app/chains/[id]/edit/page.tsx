import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ChainForm } from "@/components/chain-form";
import { updateChain } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function EditChainPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); const { supabase, profile } = await requireAdmin();
  const { data: chain } = await supabase.from("prompt_chains").select("*").eq("id", id).maybeSingle(); if (!chain) notFound();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return <AppShell name={name}><header className="page-header"><p className="eyebrow">CHAIN SETTINGS</p><h1>Edit prompt chain</h1></header><section className="panel editor-panel"><ChainForm action={updateChain.bind(null, id)} chain={chain} submitLabel="Save changes" /></section></AppShell>;
}
