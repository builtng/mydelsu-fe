'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import SearchableSelect from "@/components/SearchableSelect";

// myDelsu · Account settings. Route: /settings
// Academic fields are locked. They are set once at onboarding and can only be
// changed through support, so the active cohort and expected graduation cannot
// be gamed after the fact. Bank changes require a fresh name verification.

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

export default function MyDelsuSettings() {
  const { user, refreshProfile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");

  const [bank, setBank] = useState("");
  const [acctNo, setAcctNo] = useState("");
  const [resolved, setResolved] = useState(null);
  const [bankErr, setBankErr] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      if (user.profile) {
        setWa(user.profile.whatsapp || "");
      }
      if (user.bank_account) {
        setBank(user.bank_account.bank_name || "");
        setAcctNo(user.bank_account.account_number_masked || "");
        setResolved({ name: user.bank_account.resolved_account_name, match: true });
      }
    }
  }, [user]);

  const REG_NAME = user?.name || "Student";
  const initials = REG_NAME.split(" ").map((w) => w[0]).slice(0, 2).join("");
  function flash(m) { setToast(m); setTimeout(() => setToast(null), 2600); }

  async function saveEmail() {
    try {
      const res = await apiFetch("/profile/email", {
        method: "PATCH",
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        flash("Email updated. Please check your inbox for a verification link.");
        await refreshProfile();
      } else {
        flash(data.message || "Failed to update email.");
      }
    } catch (e) {
      flash("Network error. Try again.");
    }
  }

  async function saveWa() {
    if (wa.replace(/\D/g, "").length < 10) return flash("Enter a valid WhatsApp number.");
    try {
      const res = await apiFetch("/profile/whatsapp", {
        method: "PATCH",
        body: JSON.stringify({ whatsapp: wa })
      });
      const data = await res.json();
      if (res.ok) {
        flash("WhatsApp number saved.");
        await refreshProfile();
      } else {
        flash(data.message || "Failed to update WhatsApp number.");
      }
    } catch (e) {
      flash("Network error. Try again.");
    }
  }

  async function verifyAccount() {
    if (!bank) return setBankErr("Choose your bank.");
    if (acctNo.replace(/\D/g, "").length !== 10) return setBankErr("Enter your 10 digit account number.");
    setBankErr("");
    setResolved(null);

    const selectedBank = BANKS.find(b => b.name === bank);
    try {
      const res = await apiFetch("/profile/bank", {
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
        flash("Bank details updated and verified.");
        await refreshProfile();
      } else {
        if (data.resolved_name) {
          setResolved({ name: data.resolved_name, match: false });
        }
        setBankErr(data.message || "Verification failed.");
      }
    } catch (e) {
      setBankErr("Network or Paystack verification error. Try again.");
    }
  }

  function saveBank() {
    if (!resolved || !resolved.match) return setBankErr("Verify an account in your own name first.");
    setBankErr("");
    flash("Bank details saved.");
  }

  async function savePw() {
    if (!currentPw) return setPwErr("Enter your current password.");
    if (pw.length < 8) return setPwErr("Use a password of at least 8 characters.");
    if (pw !== pw2) return setPwErr("The two passwords do not match.");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/user/password`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mydelsu_token")}`
        },
        body: JSON.stringify({
          current_password: currentPw,
          password: pw,
          password_confirmation: pw2
        }),
        credentials: "include"
      });
      if (res.ok) {
        setPwErr("");
        setCurrentPw("");
        setPw("");
        setPw2("");
        flash("Password updated.");
      } else {
        const data = await res.json();
        setPwErr(data.message || "Failed to update password.");
      }
    } catch (e) {
      setPwErr("Network error. Try again.");
    }
  }

  return (
    <div className="set">
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

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
        <header className="head"><h1>Account settings</h1><p>Keep your details up to date so we can reach you and pay you.</p></header>

        <section className="card">
          <h2>Profile</h2>
          <label>Full name</label>
          <div className="ro">{REG_NAME}<span className="ro-tag">locked</span></div>
          <p className="lockline">This is your registered name, used to verify every payout. Contact support to change it.</p>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="save" onClick={saveEmail}>Save email</button>
        </section>

        <section className="card">
          <h2>Academic details</h2>
          {user?.profile?.academic_locked_at ? (
            <div className="grid2">
              <div><span className="ro-lab">Matric number</span><div className="ro">{user.profile.matric}<span className="ro-tag">locked</span></div></div>
              <div><span className="ro-lab">Faculty</span><div className="ro">{user.profile.faculty?.name}</div></div>
              <div><span className="ro-lab">Course</span><div className="ro">{user.profile.course?.name}</div></div>
              <div><span className="ro-lab">Entry</span><div className="ro">{user.profile.entry_mode === "de" ? "Direct entry" : "UTME"} · {user.profile.expected_graduation}</div></div>
            </div>
          ) : (
            <p className="body-note">Your academic details have not been completed and locked yet. Please finish <a href="/onboarding" style={{ color: "var(--blue)", fontWeight: "600" }}>Onboarding</a>.</p>
          )}
          <p className="lockline">These are set from your matric at sign up and cannot be edited here. If something is wrong, contact support with proof and we will correct it.</p>
        </section>

        <section className="card">
          <h2>WhatsApp number</h2>
          <p className="card-sub">So we can reach you if you win.</p>
          <input value={wa} onChange={(e) => setWa(e.target.value)} inputMode="tel" placeholder="0803 000 0000" />
          <button className="save" onClick={saveWa}>Save number</button>
        </section>

        <section className="card">
          <h2>Bank details</h2>
          <div className="reg-note">Registered name <b>{REG_NAME}</b>. We check the name on your account and only pay an account in your own name.</div>
          <label>Bank</label>
          <SearchableSelect
            options={BANKS.map((b) => ({ value: b.name, label: b.name }))}
            value={bank}
            onChange={(val) => { setBank(val); setResolved(null); }}
            placeholder="Search your bank..."
          />
          <label>Account number</label>
          <input value={acctNo} onChange={(e) => { setAcctNo(e.target.value); setResolved(null); }} inputMode="numeric" maxLength={10} placeholder="10 digit account number" />
          <button className="ghost verify" onClick={verifyAccount}>Verify account</button>
          {resolved && (<div className={"resolved" + (resolved.match ? " ok" : " bad")}>{resolved.match ? <Tick /> : <Ex />}<span>{resolved.name}</span></div>)}
          {bankErr && <p className="ferr">{bankErr}</p>}
          <button className="save" onClick={saveBank} disabled={!resolved || !resolved.match}>Save bank details</button>
        </section>

        <section className="card">
          <h2>Password</h2>
          <label>Current password</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter your current password" />
          <label>New password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
          <label>Confirm password</label>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repeat your new password" />
          {pwErr && <p className="ferr">{pwErr}</p>}
          <button className="save" onClick={savePw}>Update password</button>
        </section>

        <section className="card channel">
          <div><h2>WhatsApp channel</h2><p className="card-sub">Where we post the Monday reminder and the Friday winner.</p></div>
          <a className="ghost" href={CHANNEL_URL} target="_blank" rel="noreferrer">Open the channel</a>
        </section>
      </main>
    </div>
  );
}

function Tick() { return (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>); }
function Ex() { return (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>); }

const css = `
.set{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f5f7fa; --green:#2f7d4f; --red:#b23b3b; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:var(--soft); min-height:100vh; -webkit-font-smoothing:antialiased; }
.set *{ box-sizing:border-box; }
.toast{ position:fixed; top:74px; left:50%; transform:translateX(-50%); z-index:60; background:var(--ink); color:#fff; font-size:13.5px; font-weight:600; padding:11px 18px; border-radius:11px; box-shadow:0 10px 30px rgba(15,23,42,.28); max-width:90vw; text-align:center; }

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

.page{ max-width:560px; margin:0 auto; padding:32px 18px 60px; }
.head{ margin-bottom:24px; }
.head h1{ font-size:28px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.head p{ font-size:15px; color:var(--muted); margin:0; }

.card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.05); margin-bottom:16px; }
.card h2{ font-size:16px; font-weight:800; margin:0 0 4px; }
.card-sub{ font-size:13px; color:var(--muted); margin:0 0 12px; line-height:1.5; }
.card label{ display:block; font-size:13px; font-weight:700; margin:14px 0 7px; }
.card h2 + label{ margin-top:8px; }
.card input, .card select{ width:100%; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; color:var(--ink); outline:none; background:#fff; transition:border-color .15s, box-shadow .15s; }
.card input:focus, .card select:focus{ border-color:var(--blue); box-shadow:0 0 0 3px rgba(90,138,187,.18); }
.card input:disabled{ background:#f4f6f9; }
.ro{ display:flex; align-items:center; justify-content:space-between; gap:10px; background:#f4f6f9; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; font-weight:700; color:var(--ink); }
.ro-tag{ font-size:10.5px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); background:#fff; border:1px solid var(--line); border-radius:6px; padding:3px 8px; }
.ro-lab{ display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px; }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.lockline{ font-size:12.5px; color:var(--muted); line-height:1.55; margin:10px 0 0; }
.reg-note{ font-size:13px; color:var(--body); background:#fff8ed; border:1px solid #f0e2c6; border-radius:11px; padding:11px 13px; margin-bottom:8px; line-height:1.5; }
.reg-note b{ color:var(--ink); }
.verify{ margin-top:14px; }
.resolved{ display:flex; align-items:center; gap:8px; margin-top:12px; padding:11px 13px; border-radius:11px; font-size:14px; font-weight:700; }
.resolved.ok{ background:#eefaf1; border:1px solid #cdeed9; color:var(--green); }
.resolved.bad{ background:#fdecec; border:1px solid #f5c6c6; color:var(--red); }
.demo-hint{ font-size:12px; color:var(--muted); margin:10px 0 0; }
.demo-link{ background:transparent; border:none; color:var(--blueDark); font-weight:700; text-decoration:underline; cursor:pointer; font-size:12px; padding:0; }
.ferr{ background:#fdecec; border:1px solid #f5c6c6; color:var(--red); font-size:13px; font-weight:600; padding:10px 12px; border-radius:10px; margin:12px 0 0; line-height:1.45; }
.save{ margin-top:16px; background:var(--blue); color:#fff; border:1px solid transparent; border-radius:11px; padding:0 24px; font-size:14.5px; font-weight:700; cursor:pointer; transition:background .15s; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; height:44px; vertical-align:middle; }
.save:hover{ background:var(--blueDark); }
.save:disabled{ background:#c3ccd6; cursor:default; }
.channel{ display:flex; align-items:center; justify-content:space-between; gap:14px; }
.channel h2{ margin-bottom:4px; }
.channel .card-sub{ margin:0; }
.ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); border-radius:11px; padding:0 20px; font-size:14.5px; font-weight:700; text-decoration:none; white-space:nowrap; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; height:44px; vertical-align:middle; transition:all .15s; }
.ghost:hover{ border-color:var(--blue); color:var(--blue); }

@media (max-width:520px){ .head h1{ font-size:24px; } .channel{ flex-direction:column; align-items:flex-start; } .grid2{ grid-template-columns:1fr; } }
`;
