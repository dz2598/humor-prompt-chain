import Link from "next/link";

type Chain = { name?: string | null; description?: string | null; status?: string | null };

export function ChainForm({ action, chain, submitLabel }: { action: (data: FormData) => void | Promise<void>; chain?: Chain; submitLabel: string }) {
  return <form action={action} className="editor-form">
    <label>Chain name<input name="name" required defaultValue={chain?.name || ""} placeholder="Campus caption generator" /></label>
    <label>Description<textarea name="description" rows={4} defaultValue={chain?.description || ""} placeholder="What should this pipeline produce?" /></label>
    <label>Status<select name="status" defaultValue={chain?.status || "active"}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
    <div className="form-actions"><button className="primary" type="submit">{submitLabel}</button><Link className="secondary" href="/">Cancel</Link></div>
  </form>;
}
