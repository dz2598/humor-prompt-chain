"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
  }

  return (
    <main className="auth-shell">
      <section className="login-card">
        <p className="eyebrow">SUPERADMIN WORKSPACE</p>
        <h1>Prompt Chain<br />Laboratory</h1>
        <p className="muted">Design multi-step AI workflows, test their output, and inspect every stage.</p>
        <button className="primary-button" onClick={signIn} disabled={loading}>
          {loading ? "Connecting…" : "Continue with Google"}
        </button>
        <p className="microcopy">Authorized superadmins only.</p>
      </section>
    </main>
  );
}
