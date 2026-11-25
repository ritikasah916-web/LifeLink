import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getSocket } from "../services/socket";

const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const dateLabel = value => value ? new Date(value).toLocaleString() : "Not specified";

export default function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [responding, setResponding] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      const [profileData, requestData] = await Promise.all([api.get("/donors/me"), api.get("/requests/matching")]);
      setProfile(profileData.donor);
      setRequests(requestData.requests || []);
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = data => {
      setNotice({ type: "success", text: `New ${data.bloodGroup} request in ${data.city}.` });
      load();
    };
    socket.on("new-blood-request", handler);
    return () => socket.off("new-blood-request", handler);
  }, [load]);

  async function updateProfile(patch) {
    setSaving(true);
    try {
      const data = await api.patch("/donors/me", patch);
      setProfile(data.donor);
      setNotice({ type: "success", text: "Your donor profile has been updated." });
      const matching = await api.get("/requests/matching");
      setRequests(matching.requests || []);
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setSaving(false); }
  }

  async function respond(id, status) {
    setResponding(id);
    try {
      const data = await api.post(`/responses/${id}/respond`, { status });
      setNotice({ type: "success", text: data.message });
      await load();
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setResponding(""); }
  }

  if (loading) return <div className="screen-loader"><div className="spinner" /><p>Loading your donor dashboard…</p></div>;

  return (
    <div className="app-shell"><Navbar dashboard /><main className="dashboard-wrap">
      <section className="dashboard-greeting"><div><div className="section-kicker">DONOR SPACE</div><h1>Hello, {profile?.user?.name || "there"} <span>♥</span></h1><p>Your kindness can make someone's tomorrow possible.</p></div><div className="blood-badge">{profile?.bloodGroup || "—"}<small>YOUR GROUP</small></div></section>
      {notice && <div className={`alert alert-${notice.type}`}>{notice.text}<button onClick={() => setNotice(null)}>×</button></div>}
      <div className="dashboard-columns">
        <section className="panel profile-panel"><div className="panel-heading"><div><div className="section-kicker">YOUR DETAILS</div><h2>Donor profile</h2></div><span className={`status-pill ${profile?.isAvailable ? "status-on" : "status-off"}`}>{profile?.isAvailable ? "Available" : "Unavailable"}</span></div>
          <div className="profile-detail"><span>Full name</span><strong>{profile?.user?.name}</strong></div><div className="profile-detail"><span>Email</span><strong>{profile?.user?.email}</strong></div>
          <label className="field-label">City<input defaultValue={profile?.city || ""} key={profile?.city} onBlur={e => { if (e.target.value.trim() && e.target.value.trim() !== profile?.city) updateProfile({ city: e.target.value }); }} /></label>
          <label className="field-label">Blood group<select value={profile?.bloodGroup || "O+"} onChange={e => updateProfile({ bloodGroup: e.target.value })} disabled={saving}>{groups.map(g => <option key={g}>{g}</option>)}</select></label>
          <label className="field-label">Last donation date<input type="date" value={profile?.lastDonationDate ? new Date(profile.lastDonationDate).toISOString().slice(0, 10) : ""} max={new Date().toISOString().slice(0, 10)} onChange={e => updateProfile({ lastDonationDate: e.target.value || null })} disabled={saving} /></label>
          <div className="availability-row"><div><strong>Available to donate?</strong><small>Switch off whenever you are unavailable.</small></div><button className={`toggle ${profile?.isAvailable ? "toggle-on" : ""}`} role="switch" aria-checked={Boolean(profile?.isAvailable)} onClick={() => updateProfile({ isAvailable: !profile?.isAvailable })} disabled={saving}><span /></button></div>
          <p className="fine-print">Date-based matching is a preliminary software filter only. Medical staff must confirm actual donation eligibility.</p>
        </section>
        <section className="panel requests-panel"><div className="panel-heading"><div><div className="section-kicker">MAKE AN IMPACT</div><h2>Matching requests <span className="count-chip">{requests.length}</span></h2></div><button className="text-button" onClick={load}>↻ Refresh</button></div>
          {!profile?.isAvailable ? <div className="empty-state"><span>♡</span><h3>You're marked unavailable</h3><p>Turn on your availability when you're ready to see matching requests.</p></div> :
          requests.length === 0 ? <div className="empty-state"><span>✧</span><h3>No matching requests right now</h3><p>We'll show requests matching your blood group and city here.</p></div> :
          <div className="donor-request-list">{requests.map(r => <article className="donor-request" key={r._id}><div className="request-card-head"><span className="request-blood">{r.bloodGroup}</span><span className={`urgency-tag urgency-${r.urgency}`}>{r.urgency}</span></div><h3>{r.hospital?.name || "Hospital"}</h3><div className="request-meta"><span>⌖ {r.city}</span><span>▣ {r.units} unit{r.units > 1 ? "s" : ""}</span></div><p className="request-deadline">Needed by {dateLabel(r.requiredBy)}</p>{r.hospitalNotes && <p className="request-notes">{r.hospitalNotes}</p>}<div className="request-buttons"><button className="button button-primary button-small" disabled={responding === r._id} onClick={() => respond(r._id, "accepted")}>{responding === r._id ? "Saving…" : "I can help"}</button><button className="button button-subtle button-small" disabled={responding === r._id} onClick={() => respond(r._id, "declined")}>Not available</button></div></article>)}</div>}
        </section>
      </div>
    </main></div>
  );
}