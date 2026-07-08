"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const NAIRA = "\u20A6";
const PRIZE_KOBO = 500000;
const money = (n) => NAIRA + (n / 100).toLocaleString("en-NG");

export default function MyDelsuAdmin() {
  const [winners, setWinners] = useState([]);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [reviewDetails, setReviewDetails] = useState(null);
  
  const [enrolConfirmed, setEnrolConfirmed] = useState(false);
  const [override, setOverride] = useState(false);
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadWinners() {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/manna/winners");
      if (res.ok) {
        const data = await res.json();
        setWinners(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load admin winners", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWinners();
  }, []);

  async function selectWinner(winner) {
    setSelectedWinner(winner);
    setEnrolConfirmed(false);
    setOverride(false);
    setNotes("");
    setDecision(null);
    setReviewDetails(null);

    // Fetch full review check details from backend
    try {
      const res = await apiFetch(`/admin/manna/review/${winner.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviewDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch winner review data", err);
    }
  }

  async function handleApprove() {
    if (!selectedWinner) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/manna/review/${selectedWinner.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          enrolment_confirmed: enrolConfirmed,
          override_graduation: override,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDecision("approved");
        flash("Payout approved successfully.");
        loadWinners();
      } else {
        flash(data.message || "Failed to approve payout.");
      }
    } catch {
      flash("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedWinner) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/manna/review/${selectedWinner.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (res.ok) {
        setDecision("rejected");
        flash("Winner rejected and redraw initiated.");
        loadWinners();
      } else {
        flash(data.message || "Failed to reject winner.");
      }
    } catch {
      flash("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  function flash(m) {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  }

  // Derived check fields from reviewDetails
  const checks = reviewDetails || {
    matric_parsed: null,
    faculty_matches: false,
    expected_graduation: null,
    past_expected: false,
    name_matched: false,
    not_repeat_winner: false
  };

  const isPending = selectedWinner?.payout_status === "pending_review";
  const canApprove = checks.faculty_matches && checks.name_matched && checks.not_repeat_winner && enrolConfirmed && (!checks.past_expected || override) && !decision;

  const totalPrizeGiven = winners.filter(w => w.payout_status === "paid" || w.payout_status === "approved").reduce((sum, w) => sum + (w.prize_kobo || PRIZE_KOBO), 0);

  return (
    <div className="adm">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {toast && <div className="toast">{toast}</div>}

      <header className="topbar">
        <div className="tb-left"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span><span className="tb-tag">Manna admin</span></div>
        <span className="tb-user">Staff Portal</span>
      </header>

      <main className="wrap">
        <div className="crumb">Weekly payout review</div>

        {selectedWinner ? (
          <section className="panel" style={{ marginBottom: "24px" }}>
            <div className="panel-head">
              <div>
                <h2>{selectedWinner.user?.name || selectedWinner.name}</h2>
                <p className="sub">{selectedWinner.user?.student_profile?.matric || selectedWinner.matric} · {selectedWinner.user?.student_profile?.course?.name || "DELSU Course"}</p>
              </div>
              <button className="ghost" onClick={() => setSelectedWinner(null)} style={{ padding: "5px 12px", fontSize: "12.5px" }}>✕ Close</button>
            </div>

            <dl className="facts">
              <div><dt>Faculty from matric</dt><dd>{checks.matric_parsed?.faculty_code || "Unknown"}</dd></div>
              <div><dt>Entry session</dt><dd>{checks.matric_parsed?.session_start ? `${checks.matric_parsed.session_start}/${checks.matric_parsed.session_start+1}` : "Unknown"}</dd></div>
              <div><dt>Expected graduation</dt><dd className={checks.past_expected ? "warn" : ""}>{checks.expected_graduation || "Unknown"}{checks.past_expected ? " · past" : ""}</dd></div>
              <div><dt>Account name</dt><dd className={checks.name_matched ? "" : "bad"}>{selectedWinner.bank_account?.resolved_account_name || "Unverified"}</dd></div>
              <div><dt>Registered name</dt><dd>{selectedWinner.user?.name}</dd></div>
            </dl>

            <ul className="checks">
              <Check state={checks.faculty_matches ? "pass" : "fail"} label="Matric faculty matches the course" detail={checks.faculty_matches ? "Consistent" : "Mismatch, possible tampering"} />
              <Check state={checks.past_expected ? "warn" : "pass"} label="Within expected time in school" detail={checks.past_expected ? "Past expected graduation, verify enrolment" : "On track"} />
              <Check state={checks.name_matched ? "pass" : "fail"} label="Account name matches registered name" detail={checks.name_matched ? "Name enquiry matched" : "Names do not match, do not pay"} />
              <Check state={checks.not_repeat_winner ? "pass" : "fail"} label="Not a repeat winner in cooldown" detail={checks.not_repeat_winner ? "First win in window" : "Recently won"} />
            </ul>

            {isPending && (
              <div className="manual">
                <label className="cbx">
                  <input type="checkbox" checked={enrolConfirmed} onChange={(e) => setEnrolConfirmed(e.target.checked)} />
                  <span>I have seen proof the student is enrolled this session (fees receipt or course registration).</span>
                </label>
                {checks.past_expected && (
                  <label className="cbx">
                    <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
                    <span>I confirm the student is still enrolled despite being past their expected graduation.</span>
                  </label>
                )}
                <div style={{ marginTop: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Review Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Provide any reasoning or verification details..." style={{ width: "100%", height: "80px", border: "1px solid var(--line)", borderRadius: "10px", padding: "10px", fontFamily: "inherit" }} />
                </div>
              </div>
            )}

            {decision === "approved" && <div className="banner ok">Payout approved. Payout reference assigned. Logged to audit trail.</div>}
            {decision === "rejected" && <div className="banner bad">Winner rejected. Cohort redraw triggered.</div>}

            {isPending && !decision && (
              <div className="actions">
                <button className="approve" disabled={!canApprove || loading} onClick={handleApprove}>Approve payout</button>
                <button className="reject" disabled={loading} onClick={handleReject}>Reject and redraw</button>
              </div>
            )}
          </section>
        ) : null}

        <section className="stats">
          <div className="stat"><span className="stat-n">{winners.length}</span><span className="stat-l">Total winners drawn</span></div>
          <div className="stat"><span className="stat-n">{money(totalPrizeGiven)}</span><span className="stat-l">Given so far</span></div>
          <div className="stat"><span className="stat-n">{winners.filter(w => w.payout_status === "pending_review").length}</span><span className="stat-l">Pending review</span></div>
        </section>

        <section className="table-card">
          <div className="table-head">
            <h3>Weekly Draw Winners</h3>
            <p>Select any winner below to run the payout gate checks, verify enrollment, and approve bank transfers.</p>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Faculty</th>
                  <th>Date Drawn</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w.id} onClick={() => selectWinner(w)} style={{ cursor: "pointer" }} className="hover-row">
                    <td style={{ fontWeight: "700" }}>{w.user?.name}</td>
                    <td>{w.draw?.cohort?.faculty?.name || "DELSU Faculty"}</td>
                    <td>{new Date(w.created_at).toLocaleDateString()}</td>
                    <td>{money(w.prize_kobo || PRIZE_KOBO)}</td>
                    <td>
                      <span className={`tag tag-${w.payout_status}`}>
                        {w.payout_status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Check({ state, label, detail }) {
  return (
    <li className={"ck " + state}>
      <span className="ck-ic">{state === "pass" ? <Tick /> : state === "warn" ? <Bang /> : <Ex />}</span>
      <span className="ck-txt"><span className="ck-l">{label}</span><span className="ck-d">{detail}</span></span>
    </li>
  );
}
function Tick() { return (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>); }
function Ex() { return (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>); }
function Bang() { return (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 8v5M12 16.5v.01" /></svg>); }

const css = `
.adm{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f5f7fa; --green:#2f7d4f; --red:#b23b3b; --amber:#b7791f; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:var(--soft); min-height:100vh; -webkit-font-smoothing:antialiased; }
.adm *{ box-sizing:border-box; }
.toast{ position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:60; background:var(--ink); color:#fff; font-size:13.5px; font-weight:600; padding:11px 18px; border-radius:11px; box-shadow:0 10px 30px rgba(15,23,42,.28); max-width:90vw; text-align:center; }

.topbar{ display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:${BLUE}; }
.tb-left{ display:flex; align-items:center; gap:8px; }
.logo-my{ color:#fff; font-weight:800; font-style:italic; font-size:22px; letter-spacing:-.5px; }
.logo-badge{ background:#fff; border-radius:5px; padding:2px 8px; transform:skewX(-9deg); }
.logo-badge-inner{ display:inline-block; transform:skewX(9deg); color:#3f6f9e; font-weight:800; font-style:italic; font-size:16px; letter-spacing:1px; }
.tb-tag{ color:#fff; font-weight:700; font-size:13px; opacity:.9; border-left:1px solid rgba(255,255,255,.4); padding-left:10px; margin-left:2px; }
.tb-user{ color:#fff; font-size:13px; font-weight:600; opacity:.9; }

.wrap{ max-width:820px; margin:0 auto; padding:26px 18px 60px; }
.crumb{ font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; margin-bottom:14px; }

.cohort{ display:grid; grid-template-columns:2fr 1fr 1.4fr; gap:14px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px 20px; }
.cohort .k{ display:block; font-size:11.5px; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); font-weight:700; margin-bottom:4px; }
.cohort .v{ font-size:15px; font-weight:700; color:var(--ink); }

.panel{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.05); }
.panel-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.panel-head h2{ font-size:20px; font-weight:800; margin:0 0 3px; }
.sub{ font-size:13px; color:var(--muted); margin:0; }

.facts{ display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; margin:20px 0 6px; padding:16px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.facts dt{ font-size:11.5px; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); font-weight:700; margin-bottom:3px; }
.facts dd{ margin:0; font-size:14.5px; font-weight:700; color:var(--ink); }
.facts dd.warn{ color:var(--amber); }
.facts dd.bad{ color:var(--red); }

.checks{ list-style:none; margin:18px 0 0; padding:0; display:flex; flex-direction:column; gap:10px; }
.ck{ display:flex; align-items:flex-start; gap:11px; }
.ck-ic{ width:24px; height:24px; flex:none; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; margin-top:1px; }
.ck.pass .ck-ic{ background:var(--green); }
.ck.fail .ck-ic{ background:var(--red); }
.ck.warn .ck-ic{ background:var(--amber); }
.ck-txt{ display:flex; flex-direction:column; }
.ck-l{ font-size:14.5px; font-weight:700; }
.ck-d{ font-size:12.5px; color:var(--muted); margin-top:1px; }
.ck.fail .ck-d{ color:var(--red); }
.ck.warn .ck-d{ color:var(--amber); }

.manual{ margin-top:20px; display:flex; flex-direction:column; gap:12px; background:#f9fafc; border:1px solid var(--line); border-radius:14px; padding:16px; }
.cbx{ display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--body); line-height:1.5; cursor:pointer; }
.cbx input{ margin-top:2px; width:17px; height:17px; accent-color:var(--blue); flex:none; }

.banner{ margin-top:18px; border-radius:12px; padding:14px 16px; font-size:13.5px; font-weight:600; line-height:1.5; }
.banner.ok{ background:#eefaf1; border:1px solid #cdeed9; color:#1f6b41; }
.banner.bad{ background:#fdecec; border:1px solid #f5c6c6; color:var(--red); }

.actions{ display:flex; gap:12px; margin-top:22px; }
.approve{ background:var(--green); color:#fff; border:none; border-radius:12px; padding:13px 26px; font-size:14.5px; font-weight:700; cursor:pointer; }
.approve:disabled{ background:#c3ccd6; cursor:default; }
.reject{ background:#fff; color:var(--red); border:1px solid #f0d2d2; border-radius:12px; padding:13px 26px; font-size:14.5px; font-weight:700; cursor:pointer; }
.reject:hover{ background:#fdf2f2; }

.stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin:26px 0 0; }
.stat{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px 20px; text-align:center; }
.stat-n{ display:block; font-size:24px; font-weight:800; letter-spacing:-.02em; color:var(--ink); }
.stat-l{ display:block; font-size:12.5px; color:var(--muted); margin-top:3px; }

.table-card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:22px; margin-top:16px; }
.table-head h3{ font-size:16px; font-weight:800; margin:0 0 5px; }
.table-head p{ font-size:13px; color:var(--muted); margin:0 0 14px; line-height:1.55; }
.table-scroll{ overflow-x:auto; }
table{ width:100%; border-collapse:collapse; font-size:13.5px; }
thead th{ text-align:left; font-size:11.5px; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); font-weight:700; padding:0 12px 10px 0; border-bottom:1px solid var(--line); white-space:nowrap; }
tbody td{ padding:12px 12px 12px 0; border-bottom:1px solid #f1f3f6; color:var(--body); }
.hover-row:hover{ background:#f8fafc; }

.tag{ font-size:11.5px; font-weight:800; letter-spacing:.3px; border-radius:999px; padding:3px 10px; white-space:nowrap; text-transform:uppercase; }
.tag-paid{ color:var(--green); background:#eefaf1; border:1px solid #cdeed9; }
.tag-approved{ color:var(--green); background:#eefaf1; border:1px solid #cdeed9; }
.tag-pending_review{ color:var(--amber); background:#fdf6e7; border:1px solid #f0e2c6; }
.tag-rejected{ color:var(--red); background:#fdecec; border:1px solid #f5c6c6; }

.ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); border-radius:11px; padding:11px 20px; font-size:14.5px; font-weight:700; text-decoration:none; white-space:nowrap; cursor:pointer; }

@media (max-width:640px){
  .facts{ grid-template-columns:1fr; }
  .stats{ grid-template-columns:1fr; }
  .actions{ flex-direction:column; }
  .approve, .reject{ width:100%; }
}
`;
