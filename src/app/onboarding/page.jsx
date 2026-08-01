'use client';
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import SearchableSelect from "@/components/SearchableSelect";

// myDelsu dashboard onboarding.
// Order: covenant (drawn signature) first, then the profile steps.
//
// Anti gaming notes (see Manna-antifraud-spec.md for the full picture):
//  - Faculty is DERIVED from the matric, not chosen, so a student cannot pick a
//    faculty that contradicts their matric to jump into another cohort.
//  - Course and entry mode produce an EXPECTED GRADUATION that is computed here
//    for preview only. The authoritative value must be recomputed on the server
//    and stored against the account. It is never trusted from the client.
//  - Academic fields (matric, faculty, course, entry mode, session) are meant to
//    be locked after onboarding. Changes should go through support, not self service.
//  - Bank step resolves the real account name from the account number (name
//    enquiry) and matches it to the registered name. A typed name is never trusted.

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const CHANNEL_URL = "https://whatsapp.com/channel/0029Va4mZrK8fewhKYnjU83Y";

const BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "First Bank", code: "011" },
  { name: "GTBank", code: "058" },
  { name: "UBA", code: "033" },
  { name: "Zenith Bank", code: "057" },
  { name: "Union Bank", code: "032" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Sterling Bank", code: "232" },
  { name: "Opay", code: "999992" },
  { name: "Kuda", code: "50211" },
  { name: "Moniepoint", code: "50515" },
  { name: "PalmPay", code: "999991" }
];

// Matric format: FAC/EE/RR/NNNNNN  e.g. FOS/25/26/244182
function parseMatric(raw) {
  const m = String(raw || "").toUpperCase().replace(/\s+/g, "").match(/^([A-Z]{2,4})\/(\d{2})\/(\d{2})\/(\d{4,6})$/);
  if (!m) return null;
  const startYear = 2000 + parseInt(m[2], 10);
  return { faculty: m[1], sessionStart: startYear, session: startYear + "/" + (startYear + 1), reg: m[4] };
}

export default function MyDelsuOnboarding() {
  const { user, refreshProfile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signErr, setSignErr] = useState("");

  const [open, setOpen] = useState("matric");
  const [err, setErr] = useState({});

  // matric
  const [matric, setMatric] = useState("");
  const [parsed, setParsed] = useState(null);
  const [savedMatric, setSavedMatric] = useState(false);
  // course
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [entryMode, setEntryMode] = useState("UTME");
  const [expGrad, setExpGrad] = useState("");
  const [savedCourse, setSavedCourse] = useState(false);
  // whatsapp + channel
  const [wa, setWa] = useState("");
  const [savedWa, setSavedWa] = useState(false);
  const [joined, setJoined] = useState(false);
  // bank
  const [bank, setBank] = useState("");
  const [acctNo, setAcctNo] = useState("");
  const [resolved, setResolved] = useState(null); // { name, match }
  const [demoMismatch, setDemoMismatch] = useState(false);
  const [savedBank, setSavedBank] = useState(false);
  const [verifyingBank, setVerifyingBank] = useState(false);

  // signature pad
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = (canvas.clientWidth || 300) * ratio;
    canvas.height = (canvas.clientHeight || 170) * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#20364e";
  }, [signed]); // Re-init canvas when covenant view is open

  // Set initial states from loaded user profile
  useEffect(() => {
    if (user) {
      if (user.profile?.covenant_signed_at) {
        setSigned(true);
      }
      if (user.profile?.matric) {
        setMatric(user.profile.matric);
        setSavedMatric(true);
        const p = parseMatric(user.profile.matric);
        if (p) setParsed(p);
      }
      if (user.profile?.course) {
        setCourse(user.profile.course.id);
        setSavedCourse(true);
        setEntryMode(user.profile.entry_mode?.toUpperCase() || "UTME");
        setExpGrad(user.profile.expected_graduation);
      }
      if (user.profile?.academic_locked_at) {
        setSavedCourse(true);
      }
      if (user.profile?.whatsapp) {
        setWa(user.profile.whatsapp);
        setSavedWa(true);
      }
      if (localStorage.getItem("mydelsu_joined_channel")) {
        setJoined(true);
      }
      if (user.bank_account) {
        setBank(user.bank_account.bank_name);
        setAcctNo(user.bank_account.account_number_masked);
        setResolved({ name: user.bank_account.resolved_account_name, match: true });
        setSavedBank(true);
      }

      // Automatically open the first uncompleted step
      if (!user.profile?.covenant_signed_at) {
        setSigned(false);
      } else if (!user.profile?.matric) {
        setOpen("matric");
      } else if (!user.profile?.academic_locked_at) {
        setOpen("course");
      } else if (!user.profile?.whatsapp) {
        setOpen("wa");
      } else if (!localStorage.getItem("mydelsu_joined_channel")) {
        setOpen("channel");
      } else if (!user.bank_account) {
        setOpen("bank");
      } else {
        setOpen("");
      }
    }
  }, [user]);

  // Fetch courses list for derived faculty
  useEffect(() => {
    async function loadCourses() {
      if (parsed?.faculty) {
        try {
          const res = await apiFetch(`/onboarding/faculties/${parsed.faculty}/courses`);
          if (res.ok) {
            const data = await res.json();
            setCourses(data);
          }
        } catch (e) {
          console.error("Failed to load courses list", e);
        }
      }
    }
    loadCourses();
  }, [parsed?.faculty]);

  function sigPos(e) { const r = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function sigStart(e) { e.preventDefault(); drawing.current = true; lastPt.current = sigPos(e); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} }
  function sigMove(e) { if (!drawing.current) return; e.preventDefault(); const p = sigPos(e); const ctx = canvasRef.current.getContext("2d"); ctx.beginPath(); ctx.moveTo(lastPt.current.x, lastPt.current.y); ctx.lineTo(p.x, p.y); ctx.stroke(); lastPt.current = p; if (!hasDrawn) setHasDrawn(true); }
  function sigEnd() { drawing.current = false; }
  function sigClear() { const c = canvasRef.current; const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height); setHasDrawn(false); }

  const REG_NAME = user?.name || "Student";
  const firstName = REG_NAME.split(" ")[0];
  const initials = REG_NAME.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const facultyName = user?.profile?.faculty?.name || (parsed ? parsed.faculty : null);
  const courseList = courses;

  const done = {
    email: true,
    matric: savedMatric || !!user?.profile?.matric,
    course: savedCourse || !!user?.profile?.academic_locked_at,
    wa: savedWa || !!user?.profile?.whatsapp,
    channel: joined || (typeof window !== "undefined" && !!localStorage.getItem("mydelsu_joined_channel")),
    bank: savedBank || !!user?.bank_account
  };
  const total = 6;
  const doneCount = Object.values(done).filter(Boolean).length;
  const percent = Math.round((doneCount / total) * 100);
  const complete = percent === 100;

  function setError(k, v) { setErr((e) => ({ ...e, [k]: v })); }

  async function sigSave() {
    if (!hasDrawn) return setSignErr("Please draw your signature.");
    setSignErr("");
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    try {
      const res = await apiFetch("/onboarding/covenant", {
        method: "POST",
        body: JSON.stringify({ signature: dataUrl })
      });
      if (res.ok) {
        await refreshProfile();
        setSigned(true);
      } else {
        const data = await res.json();
        setSignErr(data.message || "Failed to save covenant.");
      }
    } catch (e) {
      setSignErr("Network error. Please try again.");
    }
  }

  async function saveMatric() {
    const p = parseMatric(matric);
    if (!p) return setError("matric", "That does not look right. Use the full format, for example FOS/25/26/244182.");
    
    try {
      const res = await apiFetch("/onboarding/matric", {
        method: "POST",
        body: JSON.stringify({ matric })
      });
      const data = await res.json();
      if (res.ok) {
        setError("matric", "");
        setParsed(p);
        setSavedMatric(true);
        await refreshProfile();
        setOpen("course");
      } else {
        setError("matric", data.message || "Failed to save matric.");
      }
    } catch (e) {
      setError("matric", "Network error. Please try again.");
    }
  }

  async function saveCourse() {
    if (!parsed) return setError("course", "Add your matric number first.");
    if (!course) return setError("course", "Choose your course.");
    
    try {
      const res = await apiFetch("/onboarding/course", {
        method: "POST",
        body: JSON.stringify({
          course_id: parseInt(course, 10),
          entry_mode: entryMode.toLowerCase()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setError("course", "");
        setExpGrad(data.expected_graduation);
        setSavedCourse(true);
        await refreshProfile();
        setOpen("wa");
      } else {
        setError("course", data.message || "Failed to save course.");
      }
    } catch (e) {
      setError("course", "Network error. Please try again.");
    }
  }

  async function saveWa() {
    if (wa.replace(/\D/g, "").length < 10) return setError("wa", "Enter a valid WhatsApp number.");
    try {
      const res = await apiFetch("/onboarding/whatsapp", {
        method: "POST",
        body: JSON.stringify({ whatsapp: wa })
      });
      const data = await res.json();
      if (res.ok) {
        setError("wa", "");
        setSavedWa(true);
        await refreshProfile();
        setOpen("channel");
      } else {
        setError("wa", data.message || "Failed to save WhatsApp number.");
      }
    } catch (e) {
      setError("wa", "Network error. Please try again.");
    }
  }

  function markJoined() {
    localStorage.setItem("mydelsu_joined_channel", "true");
    setJoined(true);
    setOpen("bank");
  }

  async function verifyAccount() {
    if (!bank) return setError("bank", "Choose your bank.");
    if (acctNo.replace(/\D/g, "").length !== 10) return setError("bank", "Enter your 10 digit account number.");
    setError("bank", "");
    setResolved(null);
    setVerifyingBank(true);

    const selectedBank = BANKS.find(b => b.name === bank);
    try {
      const res = await apiFetch("/onboarding/bank", {
        method: "POST",
        body: JSON.stringify({
          bank_code: selectedBank.code,
          bank_name: selectedBank.name,
          account_number: acctNo
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResolved({ name: data.resolved_name, match: true });
      } else {
        if (data.resolved_name) {
          setResolved({ name: data.resolved_name, match: false });
        }
        setError("bank", data.message || "Verification failed.");
      }
    } catch (e) {
      setError("bank", "Network or Paystack verification error. Try again.");
    } finally {
      setVerifyingBank(false);
    }
  }

  async function saveBank() {
    if (!resolved || !resolved.match) return setError("bank", "Verify an account in your own name first.");
    setError("bank", "");
    setSavedBank(true);
    setOpen("");
    await refreshProfile();
  }

  const steps = [
    { key: "email", title: "Verify your email", desc: "Confirmed. Your account is active.", locked: true },
    { key: "matric", title: "Add your matric number", desc: "We read your faculty and session from it." },
    { key: "course", title: "Confirm your course", desc: "Pick your course and how you entered." },
    { key: "wa", title: "Add your WhatsApp number", desc: "So we can reach you if you win." },
    { key: "channel", title: "Join our WhatsApp channel", desc: "For weekly announcements and winners." },
    { key: "bank", title: "Add your bank details", desc: "Verified against your name before any payout." },
  ];

  return (
    <div className="dash">
      <style>{css}</style>

      <nav className="nav">
        <div className="logo"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span></div>
        <div className="nav-right"><span className="ava">{initials}</span><button className="burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span className="l1" /><span className="l2" /><span className="l3" /></button></div>
      </nav>

      <div className={"drawer-overlay" + (menuOpen ? " open" : "")} onClick={() => setMenuOpen(false)} />
      <aside className={"drawer" + (menuOpen ? " open" : "")} aria-hidden={!menuOpen}>
        <div className="drawer-head"><span className="drawer-user"><span className="ava small">{initials}</span>{REG_NAME}</span><button className="close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><svg viewBox="0 0 24 24" width="22" height="22" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button></div>
        <ul className="drawer-links">{["Dashboard", "Manna", "Tools", "Account settings"].map((l) => (<li key={l}><a href="#" onClick={() => setMenuOpen(false)}>{l}</a></li>))}</ul>
        <button className="drawer-out" onClick={() => setMenuOpen(false)}>Log out</button>
      </aside>

      <main className="page">
        {!signed ? (
          <section className="gate">
            <span className="gate-eyebrow">A note from Victor and Charles</span>
            <div className="gate-card">
              <p className="gate-text">We have been where you are. We know the weeks when the money did not reach, when a textbook felt like a luxury, and when the right information was almost impossible to find. School was not easy for us. But through all of it God kept us, and He put it on our hearts to build something that would look out for the next student the way we wished someone had looked out for us.</p>
              <p className="gate-text">That is myDelsu. And Manna is its heart, a small blessing given freely every Friday, to one student who needs it.</p>
              <p className="gate-text">If you are reading this, you are part of it now. We ask only one thing in return. Sign the covenant below, and promise that when your own season of blessing comes, you will reach back and lift someone else. Bless a student the way you hope to be blessed.</p>
              <p className="gate-text">We are rooting for you.</p>
              <div className="gate-signs">
                <div className="gate-sign left"><span className="sig">Victor Ijomah</span><span className="sig-line" /><span className="sig-role">Founder</span></div>
                <div className="gate-sign right"><span className="sig">Charles Sedenu</span><span className="sig-line" /><span className="sig-role">Co-founder</span></div>
              </div>
            </div>
            <div className="gate-sign-box">
              <p className="vow">I receive this blessing with thanks, and I promise that in my own season I will be a blessing to another student.</p>
              <div className="sig-top"><label>Sign with your finger or your mouse</label><button className="sig-clear" type="button" onClick={sigClear}>Clear</button></div>
              <div className="sig-pad-wrap"><canvas ref={canvasRef} className="sig-pad" onPointerDown={sigStart} onPointerMove={sigMove} onPointerUp={sigEnd} onPointerLeave={sigEnd} />{!hasDrawn && <span className="sig-ph">Sign here</span>}</div>
              {signErr && <p className="ferr">{signErr}</p>}
              <button className="save wide" onClick={sigSave}>Sign the covenant</button>
            </div>
          </section>
        ) : (
          <>
            <header className="head"><h1>Welcome, {firstName}</h1><p>Finish these steps to be eligible for the weekly draw and to be paid if you win.</p></header>

            <section className={"meter" + (complete ? " done" : "")}>
              <div className="meter-top"><span className="meter-lab">{complete ? "Profile complete" : "Profile completion"}</span><span className="meter-pc">{percent}%</span></div>
              <div className="bar"><div className="bar-fill" style={{ width: percent + "%" }} /></div>
              <p className="meter-sub">{complete ? "You are all set. You can now enter the weekly draw." : "You are " + percent + "% of the way there. Keep going."}</p>
            </section>

            <ul className="steps">
              {steps.map((s) => {
                const isDone = done[s.key];
                const isOpen = open === s.key && !s.locked;
                return (
                  <li className={"step" + (isDone ? " is-done" : "") + (isOpen ? " is-open" : "")} key={s.key}>
                    <button className="step-head" onClick={() => !s.locked && setOpen(isOpen ? "" : s.key)}>
                      <span className={"tick" + (isDone ? " on" : "")}>{isDone ? <Check /> : <span className="dot" />}</span>
                      <span className="step-txt"><span className="step-title">{s.title}</span><span className="step-desc">{s.desc}</span></span>
                      {s.locked ? <span className="pill done">Done</span> : <span className={"pill" + (isDone ? " done" : "")}>{isDone ? "Done" : "To do"}</span>}
                      {!s.locked && <svg className="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>}
                    </button>

                    {isOpen && s.key === "matric" && (
                      <div className="body">
                        <label>Matric number</label>
                        <input value={matric} onChange={(e) => setMatric(e.target.value)} placeholder="FOS/25/26/244182" />
                        {parsed && <p className="hint good">Faculty code {parsed.faculty} · {parsed.session} session</p>}
                        {err.matric && <p className="ferr">{err.matric}</p>}
                        <button className="save" onClick={saveMatric}>Save</button>
                      </div>
                    )}

                    {isOpen && s.key === "course" && (
                      <div className="body">
                        {parsed ? (
                          <>
                            <label>Faculty</label>
                            <div className="ro">{facultyName ? "Faculty of " + facultyName : "Faculty code " + parsed.faculty + " not recognised"}<span className="ro-tag">from your matric</span></div>
                            <label>Course</label>
                            <SearchableSelect
                              options={courseList.map((c) => ({ value: c.id, label: c.name }))}
                              value={course}
                              onChange={(val) => setCourse(val)}
                              placeholder="Search your course..."
                              disabled={!facultyName}
                            />
                            <label>How did you enter?</label>
                            <div className="radios">
                              <label className={"radio" + (entryMode === "UTME" ? " on" : "")}><input type="radio" name="em" checked={entryMode === "UTME"} onChange={() => setEntryMode("UTME")} />UTME, from 100 level</label>
                              <label className={"radio" + (entryMode === "DE" ? " on" : "")}><input type="radio" name="em" checked={entryMode === "DE"} onChange={() => setEntryMode("DE")} />Direct entry, from 200 level</label>
                            </div>
                            <p className="lockline">Your faculty, course, and session are set from your matric and cannot be changed here later. Contact support if anything is wrong.</p>
                            {/* Hidden, for the form only. The server recomputes and stores the authoritative value. */}
                            <input type="hidden" name="expected_graduation" value={expGrad} readOnly />
                            {err.course && <p className="ferr">{err.course}</p>}
                            <button className="save" onClick={saveCourse} disabled={!facultyName}>Save</button>
                          </>
                        ) : (<p className="body-note">Please add your matric number first.</p>)}
                      </div>
                    )}

                    {isOpen && s.key === "wa" && (
                      <div className="body"><label>WhatsApp number</label><input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="0803 000 0000" inputMode="tel" />{err.wa && <p className="ferr">{err.wa}</p>}<button className="save" onClick={saveWa}>Save</button></div>
                    )}

                    {isOpen && s.key === "channel" && (
                      <div className="body"><p className="body-note">Our channel is where we post the Monday reminder and the Friday winner. Join, then mark it done.</p><div className="row"><a className="ghost" href={CHANNEL_URL} target="_blank" rel="noreferrer">Open the channel</a><button className="save" onClick={markJoined}>I have joined</button></div></div>
                    )}

                    {isOpen && s.key === "bank" && (
                      <div className="body">
                        <div className="reg-note">Registered name <b>{REG_NAME}</b>. We check the name on your account and only pay an account in your own name.</div>
                        <label>Bank</label>
                        <SearchableSelect
                          options={BANKS.map((b) => ({ value: b.name, label: b.name }))}
                          value={bank}
                          onChange={(val) => { setBank(val); setResolved(null); }}
                          placeholder="Search your bank..."
                        />
                        <label>Account number</label>
                        <input value={acctNo} onChange={(e) => { setAcctNo(e.target.value); setResolved(null); }} placeholder="10 digit account number" inputMode="numeric" maxLength={10} />
                        <button className="ghost verify" onClick={verifyAccount} disabled={verifyingBank}>
                          {verifyingBank ? (
                            <>
                              <span className="spinner-sm" aria-hidden="true" />
                              Verifying account...
                            </>
                          ) : "Verify account"}
                        </button>
                        {verifyingBank && (
                          <div className="verifying-box">
                            <span className="spinner-blue" />
                            <span>Fetching official account holder name from Paystack...</span>
                          </div>
                        )}
                        {resolved && (<div className={"resolved" + (resolved.match ? " ok" : " bad")}>{resolved.match ? <Check /> : <XIcon />}<span>{resolved.name}</span></div>)}
                        {err.bank && <p className="ferr">{err.bank}</p>}
                        <button className="save" onClick={saveBank} disabled={!resolved || !resolved.match}>Save bank details</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {complete && (
              <div className="finish"><div className="finish-ic"><Check big /></div><div><p className="finish-t">Your profile is complete</p><p className="finish-d">You are eligible for this week&#39;s draw. When your faculty and session come up, confirm your entry each Monday.</p></div></div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Check({ big }) { const s = big ? 24 : 15; return (<svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={big ? 2.4 : 3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>); }
function XIcon() { return (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>); }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
.dash{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f5f7fa; --green:#2f7d4f; --red:#b23b3b; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:var(--soft); min-height:100vh; -webkit-font-smoothing:antialiased; }
.dash *{ box-sizing:border-box; }

.nav{ display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:${BLUE}; }
.logo{ display:flex; align-items:center; gap:7px; }
.logo-my{ color:#fff; font-weight:800; font-style:italic; font-size:24px; letter-spacing:-.5px; }
.logo-badge{ background:#fff; border-radius:5px; padding:2px 9px; transform:skewX(-9deg); box-shadow:0 2px 4px rgba(0,0,0,.18); }
.logo-badge-inner{ display:inline-block; transform:skewX(9deg); color:#3f6f9e; font-weight:800; font-style:italic; font-size:18px; letter-spacing:1px; }
.nav-right{ display:flex; align-items:center; gap:14px; }
.ava{ width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.2); color:#fff; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.5); }
.ava.small{ background:var(--blue); border-color:transparent; }
.burger{ width:26px; height:20px; background:transparent; border:none; cursor:pointer; padding:0; display:flex; flex-direction:column; justify-content:space-between; }
.burger span{ display:block; height:3px; background:#fff; border-radius:2px; }
.burger .l1{ width:100%; } .burger .l2{ width:100%; } .burger .l3{ width:70%; align-self:flex-end; }

.drawer-overlay{ position:fixed; inset:0; background:rgba(15,23,42,0); z-index:40; pointer-events:none; transition:background .3s ease; }
.drawer-overlay.open{ background:rgba(15,23,42,.4); pointer-events:auto; }
.drawer{ position:fixed; top:0; right:0; height:100%; width:290px; max-width:82vw; z-index:41; background:#fff; transform:translateX(100%); transition:transform .32s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; padding:18px 20px 24px; box-shadow:-14px 0 40px rgba(15,23,42,.14); border-left:1px solid var(--line); }
.drawer.open{ transform:translateX(0); }
.drawer-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.drawer-user{ display:flex; align-items:center; gap:9px; font-size:14px; font-weight:700; }
.close{ background:transparent; border:none; cursor:pointer; padding:4px; }
.drawer-links{ list-style:none; margin:6px 0 0; padding:0; }
.drawer-links li{ border-bottom:1px solid var(--line); }
.drawer-links a{ display:block; padding:14px 4px; color:var(--ink); text-decoration:none; font-size:15.5px; font-weight:600; }
.drawer-links a:hover{ color:var(--blue); }
.drawer-out{ margin-top:auto; background:#fff; color:var(--red); border:1px solid #f0d2d2; border-radius:11px; padding:12px; font-weight:700; font-size:14.5px; cursor:pointer; }

.page{ max-width:620px; margin:0 auto; padding:32px 18px 60px; }

.gate-eyebrow{ display:block; text-align:center; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; margin-bottom:16px; }
.gate-card{ background:#fbfaf5; border:1px solid #ece7da; border-radius:18px; padding:32px 30px; box-shadow:0 1px 2px rgba(15,23,42,.04); }
.gate-text{ font-family:Georgia,"Times New Roman",serif; font-size:16.5px; line-height:1.7; color:#2b3542; margin:0 0 16px; }
.gate-text:last-of-type{ margin-bottom:0; }
.gate-signs{ display:flex; justify-content:space-between; gap:16px; margin-top:28px; }
.gate-sign{ display:flex; flex-direction:column; min-width:0; }
.gate-sign.left{ align-items:flex-start; } .gate-sign.right{ align-items:flex-end; }
.sig{ font-family:"Dancing Script","Segoe Script",cursive; font-size:30px; font-weight:700; color:#20364e; line-height:1; white-space:nowrap; }
.sig-line{ width:140px; max-width:40vw; height:1px; background:#c9c2b0; margin:9px 0 6px; }
.sig-role{ font-size:12px; color:var(--muted); }
.gate-sign-box{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:24px; margin-top:16px; box-shadow:0 1px 2px rgba(15,23,42,.05); }
.vow{ font-size:15px; line-height:1.6; color:var(--ink); font-weight:600; margin:0 0 18px; }
.sig-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.sig-top label{ font-size:13px; font-weight:700; }
.sig-clear{ background:#fff; border:1px solid var(--line); border-radius:8px; padding:5px 12px; font-size:12.5px; font-weight:700; color:var(--muted); cursor:pointer; }
.sig-pad-wrap{ position:relative; }
.sig-pad{ width:100%; height:170px; display:block; border:1px dashed #c9c2b0; border-radius:14px; background:#fff; touch-action:none; cursor:crosshair; }
.sig-ph{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#cbd3dc; font-family:"Dancing Script","Segoe Script",cursive; font-size:28px; pointer-events:none; }
.save.wide{ width:100%; margin-top:18px; }

.head h1{ font-size:28px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.head p{ font-size:15px; color:var(--muted); margin:0; line-height:1.55; }

.meter{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:20px 22px; margin:22px 0 26px; box-shadow:0 1px 2px rgba(15,23,42,.05); }
.meter.done{ border-color:#cdeed9; background:linear-gradient(180deg,#f5fcf7,#fff); }
.meter-top{ display:flex; align-items:baseline; justify-content:space-between; }
.meter-lab{ font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--muted); }
.meter-pc{ font-size:26px; font-weight:800; letter-spacing:-.02em; }
.meter.done .meter-pc{ color:var(--green); }
.bar{ height:10px; background:#eef1f5; border-radius:999px; overflow:hidden; margin:12px 0 10px; }
.bar-fill{ height:100%; background:linear-gradient(90deg,#6d99c6,${BLUE}); border-radius:999px; transition:width .5s cubic-bezier(.2,.8,.3,1); }
.meter.done .bar-fill{ background:linear-gradient(90deg,#4bb97b,#2f7d4f); }
.meter-sub{ font-size:13px; color:var(--muted); margin:0; }

.steps{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; }
.step{ background:#fff; border:1px solid var(--line); border-radius:16px; overflow:hidden; transition:border-color .15s, box-shadow .15s; }
.step.is-open{ border-color:#d9e6f3; box-shadow:0 6px 20px rgba(15,23,42,.06); }
.step.is-done{ background:#fcfefc; }
.step-head{ width:100%; background:transparent; border:none; cursor:pointer; display:flex; align-items:center; gap:14px; padding:16px 18px; text-align:left; }
.tick{ width:26px; height:26px; flex:none; border-radius:50%; border:2px solid #d7dee6; display:flex; align-items:center; justify-content:center; color:#fff; }
.tick.on{ background:var(--green); border-color:var(--green); }
.tick .dot{ width:8px; height:8px; border-radius:50%; background:#cdd6e0; }
.step-txt{ flex:1; min-width:0; display:flex; flex-direction:column; }
.step-title{ font-size:15.5px; font-weight:700; }
.step-desc{ font-size:13px; color:var(--muted); margin-top:2px; }
.pill{ font-size:11.5px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; color:var(--blueDark); background:#eef4fb; border:1px solid #d9e6f3; border-radius:999px; padding:4px 10px; white-space:nowrap; }
.pill.done{ color:var(--green); background:#eefaf1; border-color:#cdeed9; }
.chev{ color:var(--muted); flex:none; }
.step.is-open .chev{ transform:rotate(180deg); }

.body{ padding:4px 18px 20px 58px; }
.body label{ display:block; font-size:13px; font-weight:700; margin:14px 0 7px; }
.body label:first-child{ margin-top:0; }
.body input, .body select{ width:100%; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; color:var(--ink); outline:none; background:#fff; transition:border-color .15s, box-shadow .15s; }
.body input:focus, .body select:focus{ border-color:var(--blue); box-shadow:0 0 0 3px rgba(90,138,187,.18); }
.body input:disabled, .body select:disabled{ background:#f4f6f9; color:#9aa7b4; }
.body input::placeholder{ color:#aab6c2; }
.body-note{ font-size:13.5px; color:var(--body); line-height:1.55; margin:0 0 14px; }
.hint{ font-size:13px; margin:10px 0 0; }
.hint.good{ color:var(--green); font-weight:600; }
.ro{ display:flex; align-items:center; justify-content:space-between; gap:10px; background:#f4f6f9; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; font-weight:600; color:var(--ink); }
.ro-tag{ font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); background:#fff; border:1px solid var(--line); border-radius:6px; padding:3px 8px; white-space:nowrap; }
.radios{ display:flex; flex-direction:column; gap:8px; }
.radio{ display:flex; align-items:center; gap:9px; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:14.5px; font-weight:600; cursor:pointer; margin:0 !important; }
.radio.on{ border-color:var(--blue); background:#f5f9fd; }
.radio input{ width:auto !important; accent-color:var(--blue); }
.lockline{ font-size:12.5px; color:var(--muted); line-height:1.55; margin:14px 0 0; }
.reg-note{ font-size:13px; color:var(--body); background:#fff8ed; border:1px solid #f0e2c6; border-radius:11px; padding:11px 13px; margin-bottom:14px; line-height:1.5; }
.reg-note b{ color:var(--ink); }
.verify{ margin-top:14px; display:inline-block; }
.resolved{ display:flex; align-items:center; gap:8px; margin-top:12px; padding:11px 13px; border-radius:11px; font-size:14px; font-weight:700; }
.resolved.ok{ background:#eefaf1; border:1px solid #cdeed9; color:var(--green); }
.resolved.bad{ background:#fdecec; border:1px solid #f5c6c6; color:var(--red); }
.demo-hint{ font-size:12px; color:var(--muted); margin:10px 0 0; }
.demo-link{ background:transparent; border:none; color:var(--blueDark); font-weight:700; text-decoration:underline; cursor:pointer; font-size:12px; padding:0; }
.ferr{ background:#fdecec; border:1px solid #f5c6c6; color:var(--red); font-size:13px; font-weight:600; padding:10px 12px; border-radius:10px; margin:12px 0 0; line-height:1.45; }
.save{ margin-top:16px; background:var(--blue); color:#fff; border:1px solid transparent; border-radius:11px; padding:0 24px; font-size:14.5px; font-weight:700; cursor:pointer; transition:background .15s; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; height:44px; vertical-align:middle; }
.save:hover{ background:var(--blueDark); }
.save:disabled{ background:#c3ccd6; cursor:default; }
.row{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:16px; }
.row .save, .row .ghost{ margin-top:0 !important; }
.ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); border-radius:11px; padding:0 20px; font-size:14.5px; font-weight:700; text-decoration:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; height:44px; vertical-align:middle; transition:all .15s; }
.ghost:hover{ border-color:var(--blue); color:var(--blue); }
.spinner-sm{ width:14px; height:14px; border:2px solid #cbd5e1; border-top-color:var(--blue); border-radius:50%; animation:spin 0.6s linear infinite; display:inline-block; margin-right:8px; }
.spinner-blue{ width:16px; height:16px; border:2px solid #93c5fd; border-top-color:#1d4ed8; border-radius:50%; animation:spin 0.6s linear infinite; display:inline-block; flex-shrink:0; }
@keyframes spin{ to{ transform:rotate(360deg); } }
.verifying-box{ display:flex; align-items:center; gap:10px; margin-top:12px; padding:12px 14px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:11px; font-size:13.5px; font-weight:600; color:#1e40af; }

.finish{ display:flex; align-items:center; gap:16px; background:linear-gradient(160deg,#eefaf1,#fff); border:1px solid #cdeed9; border-radius:18px; padding:22px; margin-top:24px; }
.finish-ic{ width:48px; height:48px; flex:none; border-radius:50%; background:var(--green); color:#fff; display:flex; align-items:center; justify-content:center; }
.finish-t{ font-weight:800; font-size:16px; margin:0 0 3px; }
.finish-d{ font-size:13.5px; color:var(--body); margin:0; line-height:1.55; }

@media (max-width:520px){ .head h1{ font-size:24px; } .body{ padding-left:18px; } .gate-card{ padding:24px 20px; } .gate-signs{ gap:10px; } .sig{ font-size:22px; } .sig-line{ width:104px; } }
`;
