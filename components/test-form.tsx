"use client";

import { useActionState } from "react";
import { runChainTest } from "@/app/actions";

export function TestForm({ chainId, stepCount }: { chainId: number; stepCount: number }) {
  const [state, action, pending] = useActionState(runChainTest.bind(null, chainId), { error: "", success: false });
  return <form action={action}>
    <label htmlFor="test-image">Image (optional, up to 3 MB)</label>
    <input id="test-image" name="image" type="file" accept="image/*" />
    <textarea name="prompt" rows={8} placeholder="Example: Write a meme about realizing the assignment is due in ten minutes." />
    <button className="primary" type="submit" disabled={!stepCount || pending}>{pending ? "Generating… Please wait" : `Generate with ${stepCount} steps`}</button>
    {pending && <p role="status">Running each step. This may take a minute.</p>}
    {state.error && <p role="alert">Could not run the test: {state.error}</p>}
    {state.success && <p role="status">Test complete. See the step outputs below.</p>}
  </form>;
}
