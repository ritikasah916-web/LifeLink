import { useCallback, useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [s, u, r] = await Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/requests")]);
      setStats(s); setUsers(u.users || []); setRequests(r.requests || []);
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function toggleUser(user) {
    try { const d = await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive }); setNotice({ type: "success", text: d.message }); await refresh(); }
    catch (err) { setNotice({ type: "error", text: err.message }); }
  }
  async function setRequestStatus(request, status) {
    try { const d = await api.patch(`/admin/requests/${request._id}/status`, { status }); setNotice({ type: "success", text: d.message }); await refresh(); }
    catch (err) { setNotice({ type: "error", text: err.message }); }
  }

  if (loading) return <div className="screen-loader"><div className="spinner" /><p>Loading administration workspace…</p></div>;
  const s = stats?.statistics || {};
  const cards = [["Total users", s.totalUsers], ["Donors", s.totalDonors], ["Available donors", s.availableDonors], ["Hospitals", s.totalHospitals], ["Blood requests", s.totalRequests], ["Pending", s.pendingRequests], ["Fulfilled", s.fulfilledRequests], ["Accepted responses", s.acceptedResponses]];
  return <div className="app-shell"><Navbar dashboard /><main className="dashboard-wrap admin-wrap">
    <section className="dashboard-greeting"><div><div className="section-kicker">PLATFORM OVERVIEW</div><h1>Good to see you, <em>Admin.</em></h1><p>Monitor activity and keep the LifeLink community running smoothly.</p></div><button className="button button-outline" onClick={refresh}>↻ Refresh data</button></section>
    {notice && <div className={`alert alert-${notice.type}`}>{notice.text}<button onClick={() => setNotice(null)}>×</button></div>}
    <div className="admin-tabs"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button><button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users <span>{users.length}</span></button><button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>Requests <span>{requests.length}</span></button></div>
    {tab === "overview" && <>
      <section className="admin-stat-grid">{cards.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>)}</section>
      <div className="admin-panels"><section className="panel chart-panel"><div className="section-kicker">DONOR NETWORK</div><h2>Blood group distribution</h2>{stats?.bloodGroupStats?.length ? <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.bloodGroupStats}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="_id" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Donors" fill="#c33b48" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div> : <div className="empty-state">No donor data available yet.</div>}</section>
      <section className="panel recent-panel"><div className="section-kicker">LATEST ACTIVITY</div><h2>Recent requests</h2>{(stats?.recentRequests || []).length ? stats.recentRequests.map(r => <div className="recent-item" key={r._id}><span className="mini-blood">{r.bloodGroup}</span><div><strong>{r.hospital?.name || "Hospital"}</strong><small>{r.city} · {r.units} units</small></div><span className={`status-pill status-${r.status}`}>{r.status}</span></div>) : <p className="muted">No requests yet.</p>}</section></div>
    </>}
    {tab === "users" && <section className="panel table-panel"><div className="panel-heading"><div><div className="section-kicker">COMMUNITY DIRECTORY</div><h2>Registered users</h2></div></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Donor details</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><span className="role-chip">{u.role}</span></td><td>{u.donorProfile ? `${u.donorProfile.bloodGroup} · ${u.donorProfile.city}` : "—"}</td><td><span className={`status-pill ${u.isActive ? "status-on" : "status-off"}`}>{u.isActive ? "Active" : "Inactive"}</span></td><td>{u.role !== "admin" ? <button className="table-action" onClick={() => toggleUser(u)}>{u.isActive ? "Deactivate" : "Activate"}</button> : "—"}</td></tr>)}</tbody></table></div></section>}
    {tab === "requests" && <section className="panel table-panel"><div className="panel-heading"><div><div className="section-kicker">REQUEST OVERSIGHT</div><h2>All blood requests</h2></div></div><div className="table-scroll"><table><thead><tr><th>Hospital</th><th>Group</th><th>Units</th><th>City</th><th>Urgency</th><th>Status</th><th>Update status</th></tr></thead><tbody>{requests.map(r => <tr key={r._id}><td>{r.hospital?.name || "Hospital"}</td><td>{r.bloodGroup}</td><td>{r.units}</td><td>{r.city}</td><td>{r.urgency}</td><td><span className={`status-pill status-${r.status}`}>{r.status}</span></td><td><select value={r.status} onChange={e => setRequestStatus(r, e.target.value)}><option value="pending">Pending</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div></section>}
  </main></div>;
}