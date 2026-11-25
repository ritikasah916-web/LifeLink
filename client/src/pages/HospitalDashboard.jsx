import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const blank = { bloodGroup: "O+", units: "1", city: "", urgency: "normal", requiredBy: "", hospitalNotes: "" };

export default function HospitalDashboard() {
  const [form, setForm] = useState(blank);
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [requestData, responseData] = await Promise.all([api.get("/requests"), api.get("/responses/hospital")]);
      setRequests(requestData.requests || []);
      setResponses(responseData.responses || []);
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function createRequest(e) {
    e.preventDefault(); setSubmitting(true); setNotice(null);
    try {
      const deadline = new Date(form.requiredBy);
      if (!form.requiredBy || Number.isNaN(deadline.getTime()) || deadline <= new Date()) throw new Error("Choose a future required-by date.");
      const data = await api.post("/requests", { ...form, units: Number(form.units), requiredBy: deadline.toISOString() });
      setNotice({ type: "success", text: `Request published. ${data.matchingDonorsCount} matching donor(s) found.` });
      setForm(blank); await refresh();
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setSubmitting(false); }
  }

  async function cancelRequest(id) {
    if (!window.confirm("Cancel this blood request?")) return;
    try { const data = await api.patch(`/requests/${id}/cancel`); setNotice({ type: "success", text: data.message }); await refresh(); }
    catch (err) { setNotice({ type: "error", text: err.message }); }
  }

  const responsesFor = id => responses.filter(r => String(r.request?._id || r.request) === String(id));
  const dateTime = value => value ? new Date(value).toLocaleString() : "—";

  return <div className="app-shell"><Navbar dashboard /><main className="dashboard-wrap">
    <section className="dashboard-greeting"><div><div className="section-kicker">HOSPITAL WORKSPACE</div><h1>Care starts with a <em>connection.</em></h1><p>Publish a blood request and coordinate donor responses.</p></div><div className="hospital-icon">✚</div></section>
    {notice && <div className={`alert alert-${notice.type}`}>{notice.text}<button onClick={() => setNotice(null)}>×</button></div>}
    <div className="dashboard-columns hospital-columns">
      <section className="panel create-panel"><div className="section-kicker">NEW REQUEST</div><h2>Request blood</h2><p className="panel-description">Add the details below. Matching donors in the same city will be notified.</p>
        <form className="form-stack" onSubmit={createRequest}>
          <div className="form-two"><label>Blood group<select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>{groups.map(g => <option key={g}>{g}</option>)}</select></label><label>Units needed<input type="number" min="1" max="100" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} required /></label></div>
          <label>City<input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Gurugram" required /></label>
          <label>Urgency<select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}><option value="normal">Normal</option><option value="urgent">Urgent</option><option value="critical">Critical</option></select></label>
          <label>Needed by<input type="datetime-local" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} value={form.requiredBy} onChange={e => setForm({ ...form, requiredBy: e.target.value })} required /></label>
          <label>Additional notes <span className="optional">Optional</span><textarea rows="3" maxLength="1000" value={form.hospitalNotes} onChange={e => setForm({ ...form, hospitalNotes: e.target.value })} placeholder="Any useful information for donors…" /></label>
          <button className="button button-primary button-large button-full" disabled={submitting}>{submitting ? "Publishing…" : "Publish blood request"} <span>→</span></button>
        </form>
      </section>
      <section className="panel hospital-list-panel"><div className="panel-heading"><div><div className="section-kicker">REQUEST TRACKER</div><h2>Your requests <span className="count-chip">{requests.length}</span></h2></div><button className="text-button" onClick={refresh}>↻ Refresh</button></div>
        {loading ? <div className="empty-state">Loading requests…</div> : requests.length === 0 ? <div className="empty-state"><span>♡</span><h3>No requests yet</h3><p>Your published requests and donor responses will appear here.</p></div> :
        <div className="hospital-request-list">{requests.map(r => <article className="hospital-request-card" key={r._id}><div className="request-card-head"><span className="request-blood">{r.bloodGroup}</span><span className={`status-pill status-${r.status}`}>{r.status}</span></div><div className="hospital-request-summary"><strong>{r.units} unit{r.units > 1 ? "s" : ""} · {r.city}</strong><span className={`urgency-tag urgency-${r.urgency}`}>{r.urgency}</span></div><p className="request-deadline">Needed by {dateTime(r.requiredBy)}</p>{r.hospitalNotes && <p className="request-notes">{r.hospitalNotes}</p>}
          {r.status === "pending" && <button className="text-button danger-text" onClick={() => cancelRequest(r._id)}>Cancel request</button>}
          <div className="response-list"><h4>Donor responses ({responsesFor(r._id).length})</h4>{responsesFor(r._id).length === 0 ? <p className="muted">No responses yet.</p> : responsesFor(r._id).map(resp => <div className="response-row" key={resp._id}><div><strong>{resp.donor?.name || "Donor"}</strong><small>{dateTime(resp.respondedAt)}</small></div><div className="response-contact">{resp.status === "accepted" ? <><span className="status-pill status-fulfilled">Accepted</span><small>{resp.donor?.phone || "No phone"} · {resp.donor?.email || "No email"}</small></> : <span className="status-pill status-cancelled">Declined</span>}</div></div>)}</div>
        </article>)}</div>}
      </section>
    </div>
  </main></div>;
}