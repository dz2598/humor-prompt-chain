import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="auth-shell">
      <section className="login-card">
        <p className="eyebrow danger">ACCESS DENIED</p>
        <h1>This account is not an administrator.</h1>
        <p className="muted">Your Google login worked, but your profile has not been granted superadmin access.</p>
        <Link className="text-link" href="/login">Return to login</Link>
      </section>
    </main>
  );
}
