import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DeleteChainButton } from "@/components/delete-chain-button";
import { StepList } from "@/components/step-list";
import { TestForm } from "@/components/test-form";
import { requireAdmin } from "@/lib/auth";

type Row = Record<string, unknown>;

export default async function ChainPage({ params }: { params: Promise<{ id: string }> }) {
  const chainId = Number((await params).id);
  if (!Number.isFinite(chainId)) notFound();
  const { supabase, profile } = await requireAdmin();
  const [{ data: chain }, { data: steps }, { data: requests }] = await Promise.all([
    supabase.from("prompt_chains").select("*").eq("id", chainId).maybeSingle(),
    supabase.from("prompt_chain_steps").select("*").eq("prompt_chain_id", chainId).order("step_order"),
    supabase.from("generation_requests").select("*").eq("prompt_chain_id", chainId).order("created_at", { ascending: false }).limit(12),
  ]);
  if (!chain) notFound();
  const requestRows = (requests || []) as Row[];
  const requestIds = requestRows.map(request => Number(request.id));
  const { data: responses, error: responsesError } = requestIds.length ? await supabase.from("llm_responses").select("*").in("generation_request_id", requestIds).order("step_order", { ascending: false }) : { data: [], error: null };
  const responsesByRequest = new Map<string, Row[]>();
  ((responses || []) as Row[]).forEach(response => {
    const key = String(response.generation_request_id);
    const group = responsesByRequest.get(key) || [];
    group.push(response);
    responsesByRequest.set(key, group);
  });
  responsesByRequest.forEach(group => group.sort((a, b) => Number(a.step_order) - Number(b.step_order)));
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return <AppShell name={name}>
    <Link className="back-link" href="/">← All chains</Link>
    <header className="chain-header"><div><div className="eyebrow">CHAIN_{String(chain.id).padStart(3, "0")}{" // "}{chain.status}</div><h1>{chain.name}</h1><p>{chain.description || "No description yet."}</p></div><div className="header-actions"><Link className="secondary" href={`/chains/${chainId}/edit`}>Edit chain</Link><DeleteChainButton id={chainId} name={String(chain.name)} /></div></header>
    <section className="workspace-grid">
      <div><div className="section-heading"><div><p className="eyebrow">EXECUTION ORDER</p><h2>Pipeline steps</h2><p>Drag a card to change the order.</p></div><Link className="primary" href={`/chains/${chainId}/steps/new`}>+ Add step</Link></div><StepList chainId={chainId} initialSteps={(steps || []).map(step => ({ id: Number(step.id), step_order: Number(step.step_order), name: String(step.name), system_prompt: step.system_prompt, user_prompt_template: step.user_prompt_template }))} /></div>
      <aside className="test-panel"><p className="eyebrow">LIVE TEST</p><h2>Run this chain</h2><p>The first step receives your image and prompt. Later steps receive the original prompt and earlier outputs.</p><TestForm chainId={chainId} stepCount={steps?.length || 0} /><small>Model: Gemini 3.1 Flash-Lite</small></aside>
    </section>
    <section id="generated" className="generated-section"><div className="section-heading"><div><p className="eyebrow">OUTPUT ARCHIVE</p><h2>Step-by-step chain runs</h2><p>Inspect every intermediate response, not just the final caption.</p></div></div><div className="output-grid">{responsesError && <p className="empty-copy">Could not load step outputs. Check the database configuration.</p>}{requestRows.map(request => { const stages = responsesByRequest.get(String(request.id)) || []; return <article className="output-card" key={String(request.id)}><div><span className={`status ${request.status}`}>{String(request.status)}</span><time>{request.created_at ? new Date(String(request.created_at)).toLocaleString() : "—"}</time></div><p className="input-label">INPUT</p><p className="input-copy">{String(request.input_prompt || "No input")}</p><div className="stage-timeline">{stages.map((stage, index) => <section className="stage-output" key={`${request.id}-${stage.step_order}`}><div className="stage-marker">{String(Number(stage.step_order) || index + 1).padStart(2, "0")}</div><div><div className="stage-meta"><strong>{String(stage.step_name || `Step ${stage.step_order}`)}</strong><span>{stage.latency_ms ? `${stage.latency_ms} ms` : "Recorded output"}</span></div><p>{String(stage.response_text || "No output recorded.")}</p></div></section>)}{!stages.length && !responsesError && <p className="empty-copy">No step outputs were recorded for this run.</p>}</div></article>; })}{!requestRows.length && <p className="empty-copy">Run the chain to create its first generated result.</p>}</div></section>
  </AppShell>;
}
