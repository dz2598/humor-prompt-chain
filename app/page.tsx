import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";

export default async function HomePage() {
  const { supabase, profile } = await requireAdmin();
  const [{ data: chains }, { data: steps }, { data: requests }] = await Promise.all([
    supabase.from("prompt_chains").select("*").order("updated_at", { ascending: false }),
    supabase.from("prompt_chain_steps").select("id,prompt_chain_id"),
    supabase.from("generation_requests").select("id,prompt_chain_id,status"),
  ]);
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return <AppShell name={name}>
    <header className="hero"><div><p className="eyebrow">SYSTEM // PIPELINE DESIGNER</p><h1>Prompt chains,<br />made visible.</h1><p>Build multi-step AI workflows, rearrange their logic, and inspect what each pipeline produces.</p></div><Link className="primary" href="/chains/new">+ New prompt chain</Link></header>
    <section className="summary-strip"><span><b>{chains?.length || 0}</b> chains</span><span><b>{steps?.length || 0}</b> total steps</span><span><b>{requests?.filter(item => item.status === "completed").length || 0}</b> successful runs</span></section>
    <section className="section-heading"><div><p className="eyebrow">CHAIN REGISTRY</p><h2>Available pipelines</h2></div></section>
    <section className="chain-grid">
      {(chains || []).map((chain, index) => {
        const stepCount = steps?.filter(step => step.prompt_chain_id === chain.id).length || 0;
        const runCount = requests?.filter(request => request.prompt_chain_id === chain.id).length || 0;
        return <Link className="chain-card" href={`/chains/${chain.id}`} key={chain.id}><div className="chain-index">CHAIN_{String(index + 1).padStart(2, "0")}</div><span className={`status ${chain.status}`}>{chain.status}</span><h3>{chain.name}</h3><p>{chain.description || "No description yet."}</p><footer><span>{stepCount} steps</span><span>{runCount} runs</span><b>Open editor →</b></footer></Link>;
      })}
      {!chains?.length && <div className="empty-state"><p>No prompt chains yet.</p><Link className="primary" href="/chains/new">Create your first chain</Link></div>}
    </section>
  </AppShell>;
}
