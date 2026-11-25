import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try { await login(form); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-shell"><Navbar /><main className="auth-layout">
      <aside className="auth-aside"><div className="aside-symbol">♥</div><div className="section-kicker light">WELCOME BACK</div><h1>Your next connection could save a life.</h1><p>Sign in to continue supporting your community through LifeLink.</p><div className="aside-quote">“Alone we can do so little; together we can do so much.”</div></aside>
      <section className="auth-panel"><div className="auth-heading"><span className="section-kicker">YOUR LIFE LINK STARTS HERE</span><h2>Welcome back</h2><p>Enter your details to access your account.</p></div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form-stack">
          <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="button button-primary button-full button-large" disabled={loading}>{loading ? "Signing in…" : "Sign in"} <span>→</span></button>
        </form>
        <p className="auth-switch">New to LifeLink? <Link to="/register">Create an account</Link></p>
      </section>
    </main></div>
  );
}