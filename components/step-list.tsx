"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteStep, reorderSteps } from "@/app/actions";

type Step = { id: number; step_order: number; name: string; system_prompt: string | null; user_prompt_template: string | null };

export function StepList({ chainId, initialSteps }: { chainId: number; initialSteps: Step[] }) {
  const [steps, setSteps] = useState(initialSteps);
  const [dragged, setDragged] = useState<number | null>(null);

  async function move(targetId: number) {
    if (dragged === null || dragged === targetId) return;
    const from = steps.findIndex(step => step.id === dragged);
    const to = steps.findIndex(step => step.id === targetId);
    const next = [...steps];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const ordered = next.map((step, index) => ({ ...step, step_order: index + 1 }));
    setSteps(ordered);
    setDragged(null);
    await reorderSteps(chainId, ordered.map(step => step.id));
  }

  if (!steps.length) return <div className="empty-state"><p>No steps yet.</p><Link className="primary" href={`/chains/${chainId}/steps/new`}>Create first step</Link></div>;

  return <div className="step-list">
    {steps.map(step => <article key={step.id} draggable onDragStart={() => setDragged(step.id)} onDragOver={event => event.preventDefault()} onDrop={() => move(step.id)} className="step-card">
      <div className="drag-handle" title="Drag to reorder">⠿</div>
      <span className="step-number">{String(step.step_order).padStart(2, "0")}</span>
      <div className="step-copy"><h3>{step.name}</h3><p>{step.system_prompt}</p><code>{step.user_prompt_template || "No user template"}</code></div>
      <div className="record-actions"><Link className="secondary" href={`/steps/${step.id}/edit`}>Edit</Link><button className="danger-button" type="button" onClick={async () => { if (confirm(`Delete ${step.name}?`)) { await deleteStep(step.id, chainId); setSteps(current => current.filter(item => item.id !== step.id).map((item, index) => ({ ...item, step_order: index + 1 }))); } }}>Delete</button></div>
    </article>)}
  </div>;
}
