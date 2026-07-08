'use client';
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

// myDelsu · Manna admin. Route: /admin/manna (staff only)
// Weekly payout review. Nothing is paid until the one winner passes every check.
// All gate checks run on the server — this UI presents the result and collects
// the admin's manual confirmations. See Manna-antifraud-spec.md.

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const NAIRA = "\u20A6";
const money = (kobo) => NAIRA + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 });

export default function MyDelsuAdminManna() {
  // Winner list (paginated)
  const [winners, setWinners] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected winner review data
  const [selectedId, setSelectedId] = useState(null);
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Manual gate overrides (admin confirmations)
  const [enrolConfirmed, setEnrolConfirmed] = useState(false);
  const [overrideGrad, setOverrideGrad] = useState(false);
  const [overrideBank, setOverrideBank] = useState(false);
  const [notes, setNotes] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [decision, setDecision] = useState(null); // 'approved' | 'rejected'

  const [submittingDraw, setSubmittingDraw] = useState(false);
  const [adminGratitudeBody, setAdminGratitudeBody] = useState("");
  const [submittingAdminGratitude, setSubmittingAdminGratitude] = useState(false);

  // Fetch winners list on mount
  useEffect(() => {
    async function loadWinners() {
      setLoadingList(true);
      try {
        const res = await apiFetch("/admin/manna/winners");
        if (res.ok) {
          const data = await res.json();
          setWinners(data.data || []);
          // Auto-select first pending_review winner
          const first = (data.data || []).find(w => w.payout_status === "pending_review");
          if (first) selectWinner(first.id);
        }
      } catch (e) {
        console.error("Failed to load winners", e);
      } finally {
        setLoadingList(false);
      }
    }
    loadWinners();
  }, []);

  async function selectWinner(id) {
    setSelectedId(id);
    setReview(null);
    setEnrolConfirmed(false);
    setOverrideGrad(false);
    setOverrideBank(false);
    setNotes("");
    setApiError("");
    setDecision(null);
    setLoadingReview(true);
    try {
      const res = await apiFetch(`/admin/manna/review/${id}`);
      if (res.ok) {
        setReview(await res.json());
      } else {
        setApiError("Could not load review data.");
      }
    } catch (e) {
      setApiError("Network error loading review.");
    } finally {
      setLoadingReview(false);
    }
  }

  async function submitApprove() {
    if (!review || submitting) return;
    setSubmitting(true);
    setApiError("");
    try {
      const res = await apiFetch(`/admin/manna/review/${review.winner_id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          enrolment_confirmed: enrolConfirmed,
          override_graduation: overrideGrad,
          override_bank_name: overrideBank,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDecision("approved");
      } else {
        setApiError(data.message || (data.failures ? data.failures.join(", ") : "Approval failed."));
      }
    } catch (e) {
      setApiError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReject() {
    if (!review || submitting) return;
    setSubmitting(true);
    setApiError("");
    try {
      const res = await apiFetch(`/admin/manna/review/${review.winner_id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (res.ok) {
        setDecision("rejected");
      } else {
        setApiError(data.message || "Rejection failed.");
      }
    } catch (e) {
      setApiError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTriggerDraw() {
    if (!confirm("Are you sure you want to trigger the weekly draw?")) return;
    setSubmittingDraw(true);
    setApiError("");
    try {
      const res = await apiFetch("/admin/manna/draws", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        alert("Draw triggered successfully! Winner is " + data.draw.winner.user.name);
        const listRes = await apiFetch("/admin/manna/winners");
        if (listRes.ok) {
          const listData = await listRes.json();
          setWinners(listData.data || []);
          if (data.draw.winner) {
            selectWinner(data.draw.winner.id);
          }
        }
      } else {
        setApiError(data.message || "Failed to trigger draw.");
      }
    } catch (e) {
      setApiError("Network error triggering draw.");
    } finally {
      setSubmittingDraw(false);
    }
  }

  async function handleAdminSubmitGratitude() {
    if (!review || submittingAdminGratitude) return;
    if (adminGratitudeBody.trim().length < 10) return;
    setSubmittingAdminGratitude(true);
    setApiError("");
    try {
      const res = await apiFetch("/gratitudes", {
        method: "POST",
        body: JSON.stringify({
          winner_id: review.winner_id,
          body: adminGratitudeBody
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Gratitude message added and approved successfully!");
        setAdminGratitudeBody("");
        selectWinner(review.winner_id);
      } else {
        setApiError(data.message || "Failed to submit gratitude.");
      }
    } catch (e) {
      setApiError("Network error submitting gratitude.");
    } finally {
      setSubmittingAdminGratitude(false);
    }
  }

  // Derive gate status from server-side data
  const gate = review?.gate ?? {};
  const isPending = review?.payout_status === "pending_review";

  const graduationOk = !gate.past_expected || overrideGrad;
  const bankOk = gate.bank_match || overrideBank;

  const canApprove = isPending &&
    !decision &&
    gate.faculty_match &&
    bankOk &&
    gate.cooldown_ok &&
    enrolConfirmed &&
    graduationOk;

  const reasons = [];
  if (!gate.faculty_match) reasons.push("Matric faculty does not match the course faculty.");
  if (!bankOk) reasons.push("Account name does not match the registered name.");
  if (!gate.cooldown_ok) reasons.push("Student won within the cooldown window.");
  if (!enrolConfirmed) reasons.push("Current session enrolment not confirmed.");
  if (gate.past_expected && !overrideGrad) reasons.push("Past expected graduation — confirm they are still enrolled.");

  return (
    <div className="adm">
      <style>{css}</style>

      <header className="topbar">
        <div className="tb-left"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span><span className="tb-tag">Manna admin</span></div>
        <span className="tb-user">Staff</span>
      </header>

      <main className="wrap">
        <div className="crumb">Weekly payout review</div>

        {/* Winners list sidebar */}
        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-head">Winners queue</div>
            <button
              onClick={handleTriggerDraw}
              disabled={submittingDraw}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--blue)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "10px"
              }}
            >
              {submittingDraw ? "Drawing..." : "🎲 Run Weekly Draw"}
            </button>
            {loadingList && <div className="sidebar-empty">Loading…</div>}
            {!loadingList && winners.length === 0 && <div className="sidebar-empty">No winners yet.</div>}
            {winners.map(w => (
              <button
                key={w.id}
                className={"sidebar-item" + (w.id === selectedId ? " active" : "")}
                onClick={() => selectWinner(w.id)}
              >
                <span className="si-name">{w.user?.name ?? "–"}</span>
                <span className={"si-status " + w.payout_status}>{w.payout_status.replace(/_/g, " ")}</span>
              </button>
            ))}
          </aside>

          <div className="main-col">
            {!selectedId && !loadingList && (
              <div className="empty-state">Select a winner from the queue to begin review.</div>
            )}

            {loadingReview && <div className="empty-state">Loading review data…</div>}

            {review && !loadingReview && (
              <>
                {/* Cohort summary */}
                <section className="cohort">
                  <div><span className="k">Cohort</span><span className="v">{review.draw?.cohort?.faculty?.name ?? "–"} · {review.draw?.cohort?.session_start ?? "–"}/{(review.draw?.cohort?.session_start ?? 0) + 1}</span></div>
                  <div><span className="k">Prize</span><span className="v">{money(review.prize_kobo ?? 500000)}</span></div>
                  <div><span className="k">Status</span><span className={"v status-" + review.payout_status}>{review.payout_status.replace(/_/g, " ")}</span></div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div><h2>{review.user_name}</h2><p className="sub">{review.matric} · {review.course} · {review.entry_mode === "de" ? "Direct entry" : "UTME"}</p></div>
                    <span className={"verdict " + (decision || (canApprove ? "ready" : "blocked"))}>
                      {decision ? (decision === "approved" ? "Approved ✓" : "Rejected") : canApprove ? "Ready" : "Needs review"}
                    </span>
                  </div>

                  <dl className="facts">
                    <div><dt>Faculty (from matric)</dt><dd>{review.faculty_from_matric ?? "–"}</dd></div>
                    <div><dt>Profile faculty</dt><dd>{review.profile_faculty ?? "–"}</dd></div>
                    <div><dt>Expected graduation</dt><dd className={gate.past_expected ? "warn" : ""}>{review.expected_graduation}{gate.past_expected ? " · past" : ""}</dd></div>
                    <div><dt>Account name (Paystack)</dt><dd className={gate.bank_match ? "" : "bad"}>{review.resolved_account_name || "–"}</dd></div>
                    <div><dt>Registered name</dt><dd>{review.registered_name}</dd></div>
                    <div><dt>Bank</dt><dd>{review.bank_name} {review.account_number_masked}</dd></div>
                    {review.last_win_date && <div><dt>Last win</dt><dd className="warn">{review.last_win_date}</dd></div>}
                    {!gate.bank_match && review.missing_name_tokens?.length > 0 && (
                      <div><dt>Missing name tokens</dt><dd className="bad">{review.missing_name_tokens.join(", ")}</dd></div>
                    )}
                  </dl>

                  <ul className="checks">
                    <CheckItem state={gate.faculty_match ? "pass" : "fail"} label="Matric faculty matches the course" detail={gate.faculty_match ? "Consistent" : "Mismatch — possible tampering"} />
                    <CheckItem state={gate.past_expected ? "warn" : "pass"} label="Within expected time in school" detail={gate.past_expected ? "Past expected graduation — verify enrolment" : "On track"} />
                    <CheckItem state={gate.bank_match ? "pass" : (overrideBank ? "warn" : "fail")} label="Account name matches registered name" detail={gate.bank_match ? "Name enquiry matched" : overrideBank ? "Admin override applied" : "Names do not match — do not pay"} />
                    <CheckItem state={gate.cooldown_ok ? "pass" : "fail"} label="Not a repeat winner in cooldown" detail={gate.cooldown_ok ? "First win in window" : "Recently won — check last win date"} />
                  </ul>

                  {isPending && !decision && (
                    <div className="manual">
                      <label className="cbx">
                        <input type="checkbox" checked={enrolConfirmed} onChange={e => setEnrolConfirmed(e.target.checked)} />
                        <span>I have seen proof the student is enrolled this session (fees receipt or course registration).</span>
                      </label>
                      {gate.past_expected && (
                        <label className="cbx">
                          <input type="checkbox" checked={overrideGrad} onChange={e => setOverrideGrad(e.target.checked)} />
                          <span>I confirm the student is still enrolled despite being past their expected graduation.</span>
                        </label>
                      )}
                      {!gate.bank_match && (
                        <label className="cbx warn-cbx">
                          <input type="checkbox" checked={overrideBank} onChange={e => setOverrideBank(e.target.checked)} />
                          <span>⚠ Override bank name mismatch — I have independently confirmed this account belongs to {review.user_name}.</span>
                        </label>
                      )}
                      <div className="notes-wrap">
                        <label className="notes-label">Notes (saved to audit log)</label>
                        <textarea className="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Reason for any override, reference number, etc." />
                      </div>
                    </div>
                  )}

                  {apiError && <div className="banner bad">{apiError}</div>}
                  {decision === "approved" && <div className="banner ok">Payout approved. {money(review.prize_kobo ?? 500000)} to {review.user_name}. Log the transfer reference and add to the Wall of Thanks with permission.</div>}
                  {decision === "rejected" && <div className="banner bad">Entry rejected. Redraw initiated for this cohort.</div>}

                  {isPending && !decision && !canApprove && reasons.length > 0 && (
                    <div className="blockers"><p className="blockers-t">Cannot approve yet</p><ul>{reasons.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                  )}

                  {isPending && !decision && (
                    <div className="actions">
                      <button className="approve" disabled={!canApprove || submitting} onClick={submitApprove}>
                        {submitting ? "Processing…" : "Approve payout"}
                      </button>
                      <button className="reject" disabled={submitting} onClick={submitReject}>
                        Reject and redraw
                      </button>
                    </div>
                  )}

                  {/* Gratitude Story section */}
                  {(review.payout_status === "paid" || review.payout_status === "approved") && (
                    <div className="manual" style={{ marginTop: "20px" }}>
                      <h3 style={{ fontSize: "11.5px", fontWeight: "800", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 6px" }}>Gratitude Story (Wall of Thanks)</h3>
                      {review.gratitude ? (
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                          <p style={{ fontStyle: "italic", margin: 0, fontSize: "13.5px", color: "var(--body)" }}>"{review.gratitude.body}"</p>
                          <span style={{ fontSize: "11px", color: "var(--muted)", display: "block", marginTop: "6px" }}>Submitted on {new Date(review.gratitude.created_at).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <p style={{ fontSize: "12.5px", color: "var(--muted)", margin: 0 }}>No gratitude message submitted yet. Add a story on behalf of the winner:</p>
                          <textarea
                            value={adminGratitudeBody}
                            onChange={(e) => setAdminGratitudeBody(e.target.value)}
                            placeholder="Write gratitude story (minimum 10 characters)..."
                            rows={3}
                            style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "13.5px", fontFamily: "inherit", resize: "vertical" }}
                          />
                          <button
                            onClick={handleAdminSubmitGratitude}
                            disabled={submittingAdminGratitude || adminGratitudeBody.trim().length < 10}
                            style={{
                              alignSelf: "flex-start",
                              padding: "8px 16px",
                              background: "var(--blue)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {submittingAdminGratitude ? "Submitting..." : "Submit Gratitude"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Past winners table */}
                <section className="table-card">
                  <div className="table-head"><h3>All winners on record</h3><p>Select any row to review. The approved/rejected badge shows the final decision.</p></div>
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Name</th><th>Matric</th><th>Draw date</th><th>Status</th></tr></thead>
                      <tbody>
                        {winners.map(w => (
                          <tr key={w.id} className={w.id === selectedId ? "active-row" : ""} style={{ cursor: "pointer" }} onClick={() => selectWinner(w.id)}>
                            <td>{w.user?.name ?? "–"}</td>
                            <td className="mono">{w.user?.profile?.matric ?? "–"}</td>
                            <td>{w.created_at ? new Date(w.created_at).toLocaleDateString("en-NG") : "–"}</td>
                            <td><span className={"tag " + w.payout_status}>{w.payout_status.replace(/_/g, " ")}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckItem({ state, label, detail }) {
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

.demo-switch{ display:flex; align-items:center; gap:8px; margin:16px 0; font-size:12.5px; color:var(--muted); font-weight:700; }
.demo-switch button{ background:#fff; border:1px solid var(--line); border-radius:9px; padding:7px 13px; font-size:12.5px; font-weight:700; color:var(--body); cursor:pointer; }
.demo-switch button.on{ background:var(--blue); border-color:var(--blue); color:#fff; }

.panel{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.05); }
.panel-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.panel-head h2{ font-size:20px; font-weight:800; margin:0 0 3px; }
.sub{ font-size:13px; color:var(--muted); margin:0; }
.verdict{ font-size:11.5px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; border-radius:999px; padding:5px 12px; white-space:nowrap; }
.verdict.ready{ color:var(--green); background:#eefaf1; border:1px solid #cdeed9; }
.verdict.blocked{ color:var(--amber); background:#fdf6e7; border:1px solid #f0e2c6; }
.verdict.approved{ color:#fff; background:var(--green); }
.verdict.rejected{ color:#fff; background:var(--red); }

.facts{ display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; margin:20px 0 6px; padding:16px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.facts div{ margin:0; }
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

.blockers{ margin-top:18px; background:#fdf6e7; border:1px solid #f0e2c6; border-radius:12px; padding:14px 16px; }
.blockers-t{ font-size:13px; font-weight:800; color:var(--amber); margin:0 0 8px; }
.blockers ul{ margin:0; padding-left:18px; }
.blockers li{ font-size:13px; color:var(--body); line-height:1.6; }

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
tbody td:first-child{ font-weight:700; color:var(--ink); }
.mono{ font-variant-numeric:tabular-nums; white-space:nowrap; }
.tag{ font-size:11.5px; font-weight:800; letter-spacing:.3px; border-radius:999px; padding:3px 10px; white-space:nowrap; }
.tag.study{ color:var(--blueDark); background:#eef4fb; border:1px solid #d9e6f3; }
.tag.grad{ color:var(--amber); background:#fdf6e7; border:1px solid #f0e2c6; }
.layout{ display:flex; gap:20px; align-items:flex-start; margin-top:16px; }
.sidebar{ width:250px; background:#fff; border:1px solid var(--line); border-radius:18px; padding:12px; display:flex; flex-direction:column; gap:8px; flex-shrink:0; }
.sidebar-head{ font-size:12px; letter-spacing:1px; text-transform:uppercase; color:var(--muted); font-weight:800; padding:4px 8px 8px; border-bottom:1px solid var(--line); margin-bottom:4px; }
.sidebar-empty{ font-size:13px; color:var(--muted); text-align:center; padding:20px 0; }
.sidebar-item{ display:flex; flex-direction:column; gap:4px; width:100%; border:none; background:transparent; padding:10px 12px; border-radius:12px; text-align:left; cursor:pointer; transition:background .15s; }
.sidebar-item:hover{ background:var(--soft); }
.sidebar-item.active{ background:var(--soft); border-left:4px solid var(--blue); }
.si-name{ font-size:14px; font-weight:700; color:var(--ink); }
.si-status{ font-size:11px; font-weight:800; letter-spacing:.3px; text-transform:uppercase; display:inline-block; align-self:flex-start; padding:2px 6px; border-radius:4px; }
.si-status.pending_review{ color:var(--amber); background:#fdf6e7; }
.si-status.paid{ color:var(--green); background:#eefaf1; }
.si-status.rejected{ color:var(--red); background:#fdecec; }
.main-col{ flex:1; display:flex; flex-direction:column; gap:16px; min-width:0; }
.empty-state{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:48px 24px; text-align:center; font-size:15px; color:var(--muted); font-weight:600; }
.active-row{ background:var(--soft); }
.warn-cbx{ background:#fdf6e7; border:1px solid #f0e2c6; border-radius:8px; padding:8px 12px; margin-top:4px; }
.notes-wrap{ display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.notes-label{ font-size:11.5px; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); font-weight:700; }
.notes{ border:1px solid var(--line); border-radius:8px; padding:10px; font-size:13.5px; font-family:inherit; resize:vertical; outline:none; }
.notes:focus{ border-color:var(--blue); }
.status-pending_review{ color:var(--amber); background:#fdf6e7; }
.status-paid{ color:var(--green); background:#eefaf1; }
.status-rejected{ color:var(--red); background:#fdecec; }

@media (max-width:640px){
  .cohort{ grid-template-columns:1fr 1fr; }
  .facts{ grid-template-columns:1fr; }
  .stats{ grid-template-columns:1fr; }
  .actions{ flex-direction:column; }
  .approve, .reject{ width:100%; }
}
`;
