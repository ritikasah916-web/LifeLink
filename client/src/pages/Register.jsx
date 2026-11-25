import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "donor", bloodGroup: "O+", city: "", lastDonationDate: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      const payload = { ...form };
      if (payload.role === "hospital") {
        delete payload.bloodGroup; delete payload.city; delete payload.lastDonationDate;
      } else if (!payload.lastDonationDate) delete payload.lastDonationDate;
      await register(payload);
      setSuccess("Your account has been created. Redirecting you to sign in…");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-shell"><Navbar /><main className="auth-layout register-layout">
      <aside className="auth-aside"><div className="aside-symbol">✚</div><div className="section-kicker light">JOIN THE MOVEMENT</div><h1>Be a link in someone's story.</h1><p>Whether you give, request, or coordinate help, you belong here.</p><div className="aside-points"><span>✓ A caring community</span><span>✓ Simple request matching</span><span>✓ One shared purpose</span></div></aside>
      <section className="auth-panel"><div className="auth-heading"><span className="section-kicker">CREATE YOUR ACCOUNT</span><h2>Join LifeLink</h2><p>It only takes a few details to get started.</p></div>
        {error && <div className="alert alert-error">{error}</div>}{success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-two"><label>Full name<input name="name" placeholder="Your name" value={form.name} onChange={update} required /></label><label>Phone number<input name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update} required /></label></div>
          <label>Email address<input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>
          <label>Password<input name="password" type="password" minLength="8" placeholder="At least 8 characters" value={form.password} onChange={update} required /><small>Use at least 8 characters.</small></label>
          <label>I want to join as<select name="role" value={form.role} onChange={update}><option value="donor">Blood donor</option><option value="hospital">Hospital / blood bank</option></select></label>
          {form.role === "donor" && <><div className="form-two"><label>Blood group<select name="bloodGroup" value={form.bloodGroup} onChange={update}>{groups.map(g => <option key={g}>{g}</option>)}</select></label><label>City<input name="city" placeholder="Your city" value={form.city} onChange={update} required /></label></div><label>Last blood donation date <span className="optional">(optional)</span><input name="lastDonationDate" type="date" max={new Date().toISOString().slice(0, 10)} value={form.lastDonationDate} onChange={update} /></label></>}
          <button className="button button-primary button-full button-large" disabled={loading}>{loading ? "Creating account…" : "Create account"} <span>→</span></button>
        </form>
        <p className="auth-switch">Already a member? <Link to="/login">Sign in</Link></p>
      </section>
    </main></div>
  );
}