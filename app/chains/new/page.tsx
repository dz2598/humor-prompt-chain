import { AppShell } from "@/components/app-shell";
import { ChainForm } from "@/components/chain-form";
import { createChain } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function NewChainPage() {
  const { profile } = await requireAdmin();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return <AppShell name={name}><header className="page-header"><p className="eyebrow">NEW PIPELINE</p><h1>Create prompt chain</h1><p>Start with a purpose. You can add and rearrange the individual steps next.</p></header><section className="panel editor-panel"><ChainForm action={createChain} submitLabel="Create chain" /></section></AppShell>;
}
