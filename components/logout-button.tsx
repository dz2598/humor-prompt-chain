"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return <button className="nav-logout" onClick={async () => {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }}>Log out</button>;
}
