import Link from "next/link";

type Step = { name?: string | null; system_prompt?: string | null; user_prompt_template?: string | null };

export function StepForm({ action, step, chainId, submitLabel }: { action: (data: FormData) => void | Promise<void>; step?: Step; chainId: number; submitLabel: string }) {
  return <form action={action} className="editor-form">
    <input type="hidden" name="chain_id" value={chainId} />
    <label>Step name<input name="name" required defaultValue={step?.name || ""} placeholder="Analyze the input" /></label>
    <label>System prompt<textarea name="system_prompt" rows={6} required defaultValue={step?.system_prompt || ""} placeholder="Tell the model what this stage should accomplish." /></label>
    <label>User template <span>Available: {"{{prompt}}"}, {"{{previous_output}}"}</span><textarea name="user_prompt_template" rows={5} defaultValue={step?.user_prompt_template || "Input: {{prompt}}\nPrevious stage: {{previous_output}}"} /></label>
    <div className="form-actions"><button className="primary" type="submit">{submitLabel}</button><Link className="secondary" href={`/chains/${chainId}`}>Cancel</Link></div>
  </form>;
}
