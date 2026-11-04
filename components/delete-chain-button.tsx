"use client";

import { useRouter } from "next/navigation";
import { deleteChain } from "@/app/actions";

export function DeleteChainButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  return <button className="danger-button" type="button" onClick={async () => {
    if (!confirm(`Delete “${name}” and all of its steps?`)) return;
    await deleteChain(id);
    router.replace("/");
    router.refresh();
  }}>Delete chain</button>;
}
