"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function MyDelsuAuth({ initialView = "login" }) {
  const { user, login, register } = useAuth();
  
  const [view, setView] = useState(initialView);
  const [sentMode, setSentMode] = useState("register");
  
  // Registration and Login fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const toastRef = useRef(null);

  function flash(m) {
    setToast(m);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }

  function go(v) {
    setError("");
    setShowPw(false);
    setView(v);
  }

  async function doLogin() {
    if (!emailOk(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    
    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      flash("You are logged in. Taking you to your dashboard.");
      
      // Redirect after state updates
      setTimeout(() => {
        window.location.href = "/onboarding";
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function doRegister() {
    if (!name.trim()) return setError("Please enter your full name.");
    if (!emailOk(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    if (password !== confirm) return setError("The passwords do not match.");

    setLoading(true);
    setError("");

    try {
      await register(name.trim(), email.trim(), password, confirm);
      flash("Account created! A welcome email has been sent to your inbox. Taking you to your dashboard.");
      setTimeout(() => {
        window.location.href = "/onboarding";
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  }

  async function doForgot() {
    if (!emailOk(email)) return setError("Enter a valid email address.");
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/forgot-password`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send reset link.");
      }

      setSentMode("reset");
      setView("sent");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function doReset() {
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    // Retrieve reset token from URL params if present
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token") || "";

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/reset-password`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email: email.trim(),
          password,
          password_confirmation: confirm,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Password reset failed. Token may be expired.");
      }

      setPassword("");
      setConfirm("");
      setView("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {toast && <div className="toast">{toast}</div>}

      <div className="side">
        <a className="side-back" href="/">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></svg>
          Back to home
        </a>

        <div className="side-deco" aria-hidden="true">
          <span className="blob blob-a" />
          <span className="blob blob-b" />
          <SideWheat />
        </div>

        <div className="side-inner">
          <div className="logo side-logo"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span></div>
          <p className="side-tagline">The resource platform for DELSU students</p>

          <blockquote className="side-quote">
            “I will bless you, and you will be a blessing.”
            <cite>Genesis 12:2</cite>
          </blockquote>

          <ul className="side-list">
            <li><CheckDot />Weekly Manna draw &mdash; {"₦"}5,000 given away every Friday</li>
            <li><CheckDot />Free GPA and CGPA tools built for DELSU students</li>
            <li><CheckDot />A wall of real testimonies from students who won</li>
          </ul>
        </div>
      </div>

      <div className="formside">
        <a className="back" href="/">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></svg>
          Back to home
        </a>

        <div className="wrap">
          <div className="brand">
            <div className="logo"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span></div>
          </div>

          <div className="card">
          {view === "login" && (
            <>
              <h1 className="title">Welcome back</h1>
              <p className="subtitle">Log in to your account.</p>
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" disabled={loading} />
              <PwField label="Password" value={password} onChange={setPassword} show={showPw} setShow={setShowPw} forgot={() => go("forgot")} disabled={loading} />
              {error && <p className="error">{error}</p>}
              <button className="primary" onClick={doLogin} disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
              <p className="switch">New to myDelsu? <button className="link" onClick={() => go("register")}>Create an account</button></p>
            </>
          )}

          {view === "register" && (
            <>
              <h1 className="title">Create your account</h1>
              <p className="subtitle">Email and a password is all you need to start.</p>
              <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Grace Nwachukwu" disabled={loading} />
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" disabled={loading} />
              <PwField label="Password" value={password} onChange={setPassword} show={showPw} setShow={setShowPw} hint="Use at least 8 characters." disabled={loading} />
              <PwField label="Confirm password" value={confirm} onChange={setConfirm} show={showPw} setShow={setShowPw} disabled={loading} />
              {error && <p className="error">{error}</p>}
              <button className="primary" onClick={doRegister} disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
              <p className="fine">By creating an account you agree to our <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.</p>
              <p className="switch">Already have an account? <button className="link" onClick={() => go("login")}>Log in</button></p>
            </>
          )}

          {view === "forgot" && (
            <>
              <h1 className="title">Reset your password</h1>
              <p className="subtitle">Enter your email and we will send you a reset link.</p>
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" disabled={loading} />
              {error && <p className="error">{error}</p>}
              <button className="primary" onClick={doForgot} disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <p className="switch"><button className="link" onClick={() => go("login")}>Back to log in</button></p>
            </>
          )}

          {view === "sent" && (
            <div className="center">
              <div className="ic"><Envelope /></div>
              <h1 className="title">Check your email</h1>
              <p className="subtitle">
                {sentMode === "register"
                  ? <>We have sent a confirmation link to <b>{email || "your email"}</b>. Open it to activate your account and get started.</>
                  : <>We have sent a password reset link to <b>{email || "your email"}</b>. Follow it to choose a new password.</>}
              </p>
              <p className="switch"><button className="link" onClick={() => flash("Verification link resent.")}>Resend email</button><span className="sep">·</span><button className="link" onClick={() => go("login")}>Back to log in</button></p>
            </div>
          )}

          {view === "confirmed" && (
            <div className="center">
              <div className="ic ok"><Tick /></div>
              <h1 className="title">You are all set</h1>
              <p className="subtitle">Your email is confirmed. Log in to finish setting up your profile.</p>
              <button className="primary" onClick={() => go("login")}>Log in to continue</button>
            </div>
          )}

          {view === "reset" && (
            <>
              <h1 className="title">Set a new password</h1>
              <p className="subtitle">Choose a password you will remember.</p>
              <PwField label="New password" value={password} onChange={setPassword} show={showPw} setShow={setShowPw} hint="Use at least 8 characters." disabled={loading} />
              <PwField label="Confirm password" value={confirm} onChange={setConfirm} show={showPw} setShow={setShowPw} disabled={loading} />
              {error && <p className="error">{error}</p>}
              <button className="primary" onClick={doReset} disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </>
          )}

          {view === "done" && (
            <div className="center">
              <div className="ic ok"><Tick /></div>
              <h1 className="title">Password updated</h1>
              <p className="subtitle">Your password has been changed. Log in with your new password.</p>
              <button className="primary" onClick={() => go("login")}>Log in</button>
            </div>
          )}
        </div>

          <p className="foot">myDelsu, the resource platform for DELSU students.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, disabled }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" disabled={disabled} />
    </div>
  );
}

function PwField({ label, value, onChange, show, setShow, hint, forgot, disabled }) {
  return (
    <div className="field">
      <div className="field-top">
        <label>{label}</label>
        {forgot && <button className="link small" onClick={forgot} type="button" disabled={disabled}>Forgot password?</button>}
      </div>
      <div className="pw">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Enter your password" autoComplete="off" disabled={disabled} />
        <button className="eye" type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} disabled={disabled}>{show ? <EyeOff /> : <Eye />}</button>
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function Envelope() { return (<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={BLUE_DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>); }
function Tick() { return (<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2f7d4f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>); }
function Eye() { return (<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>); }
function EyeOff() { return (<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0112 4c6.5 0 10 7 10 7a13 13 0 01-2.3 3M6.6 6.6A13 13 0 002 11s3.5 7 10 7a9 9 0 004.6-1.3" /><path d="M3 3l18 18" /></svg>); }
function CheckDot() { return (<span className="check-dot"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>); }
function SideWheat() {
  return (
    <svg className="side-wheat" viewBox="0 0 120 220" width="180" height="330" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 210V60" />
      <path d="M60 60c-14-10-14-32 0-48 14 16 14 38 0 48Z" />
      <path d="M60 92c-18-7-26-24-21-44 17 4 27 18 21 44Z" />
      <path d="M60 92c18-7 26-24 21-44-17 4-27 18-21 44Z" />
      <path d="M60 128c-18-7-26-24-21-44 17 4 27 18 21 44Z" />
      <path d="M60 128c18-7 26-24 21-44-17 4-27 18-21 44Z" />
      <path d="M60 164c-18-7-26-24-21-44 17 4 27 18 21 44Z" />
      <path d="M60 164c18-7 26-24 21-44-17 4-27 18-21 44Z" />
    </svg>
  );
}

const css = `
.auth{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --amber:#c7963f; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f7f9fb; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:#fff; min-height:100vh; -webkit-font-smoothing:antialiased; display:flex; flex-direction:row; }
.auth *{ box-sizing:border-box; }
.toast{ position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:20; background:var(--ink); color:#fff; font-size:13.5px; font-weight:600; padding:11px 18px; border-radius:11px; box-shadow:0 10px 30px rgba(15,23,42,.28); max-width:90vw; text-align:center; }

/* Left brand panel (desktop only) */
.side{ display:none; position:relative; overflow:hidden; flex-direction:column; justify-content:space-between; padding:32px 44px; background:linear-gradient(155deg, var(--blueDark) 0%, var(--blue) 62%, #82abcf 100%); color:#fff; }
.side-back{ position:relative; z-index:2; display:inline-flex; align-items:center; gap:6px; color:rgba(255,255,255,.82); text-decoration:none; font-size:13.5px; font-weight:600; align-self:flex-start; }
.side-back:hover{ color:#fff; }
.side-deco{ position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.blob{ position:absolute; border-radius:50%; filter:blur(46px); opacity:.55; }
.blob-a{ width:280px; height:280px; background:var(--amber); left:-90px; bottom:-90px; opacity:.35; }
.blob-b{ width:320px; height:320px; background:#ffffff; right:-120px; top:-100px; opacity:.14; }
.side-wheat{ position:absolute; right:6%; bottom:-4%; }
.side-inner{ position:relative; z-index:2; flex:1; display:flex; flex-direction:column; justify-content:center; max-width:380px; }
.side .logo.side-logo{ margin-bottom:26px; }
.side .logo-my{ color:#fff; }
.side .logo-badge{ background:#fff; }
.side .logo-badge-inner{ color:var(--blueDark); }
.side-tagline{ font-size:14.5px; font-weight:600; color:rgba(255,255,255,.82); margin:0 0 30px; }
.side-quote{ margin:0; font-family:Georgia,"Times New Roman",serif; font-size:21px; line-height:1.5; color:#fff; }
.side-quote cite{ display:block; font-style:normal; font-size:11.5px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.68); font-weight:700; margin-top:12px; }
.side-list{ list-style:none; margin:36px 0 0; padding:0; display:flex; flex-direction:column; gap:15px; }
.side-list li{ display:flex; align-items:flex-start; gap:11px; font-size:14px; line-height:1.5; font-weight:500; color:rgba(255,255,255,.92); }
.check-dot{ flex-shrink:0; width:20px; height:20px; margin-top:1px; border-radius:50%; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; }

/* Right form panel */
.formside{ position:relative; width:100%; min-width:0; min-height:100vh; background:var(--soft); display:flex; align-items:center; justify-content:center; }
.back{ position:absolute; top:20px; left:20px; display:inline-flex; align-items:center; gap:6px; color:var(--muted); text-decoration:none; font-size:13.5px; font-weight:600; }
.back:hover{ color:var(--blue); }
.wrap{ width:100%; max-width:400px; margin:0 auto; padding:88px 20px 40px; }
.brand{ text-align:center; margin-bottom:22px; }
.logo{ display:inline-flex; align-items:center; gap:7px; }
.logo-my{ color:var(--blueDark); font-weight:800; font-style:italic; font-size:28px; letter-spacing:-.5px; }
.logo-badge{ background:var(--blue); border-radius:5px; padding:2px 9px; transform:skewX(-9deg); box-shadow:0 2px 4px rgba(0,0,0,.14); }
.logo-badge-inner{ display:inline-block; transform:skewX(9deg); color:#fff; font-weight:800; font-style:italic; font-size:20px; letter-spacing:1px; }
.brand-sub{ font-size:13px; color:var(--muted); font-weight:600; margin:12px 0 0; }
.card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:30px 28px; box-shadow:0 4px 24px rgba(15,23,42,.06); }
.title{ font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.subtitle{ font-size:14.5px; color:var(--muted); line-height:1.55; margin:0 0 22px; }
.subtitle b{ color:var(--ink); }
.field{ margin-bottom:16px; }
.field-top{ display:flex; align-items:center; justify-content:space-between; }
.field label{ display:block; font-size:13px; font-weight:700; color:var(--ink); margin-bottom:7px; }
.field input{ width:100%; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; color:var(--ink); outline:none; transition:border-color .15s, box-shadow .15s; background:#fff; }
.field input:focus{ border-color:var(--blue); box-shadow:0 0 0 3px rgba(90,138,187,.18); }
.field input::placeholder{ color:#aab6c2; }
.pw{ position:relative; }
.pw input{ padding-right:44px; }
.eye{ position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; color:var(--muted); padding:6px; display:flex; }
.eye:hover{ color:var(--blue); }
.hint{ font-size:12px; color:var(--muted); margin:7px 0 0; }
.error{ background:#fdecec; border:1px solid #f5c6c6; color:#b23b3b; font-size:13px; font-weight:600; padding:10px 12px; border-radius:10px; margin:0 0 16px; }
.primary{ width:100%; background:var(--blue); color:#fff; border:none; border-radius:12px; padding:13px; font-size:15.5px; font-weight:700; cursor:pointer; transition:background .15s, transform .12s; }
.primary:hover{ background:var(--blueDark); transform:translateY(-1px); }
.primary:disabled{ opacity:.7; cursor:default; transform:none; }
.link{ background:transparent; border:none; cursor:pointer; color:var(--blueDark); font-weight:700; font-size:inherit; padding:0; }
.link:hover{ text-decoration:underline; }
.link.small{ font-size:12.5px; margin-bottom:7px; }
.switch{ text-align:center; font-size:14px; color:var(--muted); margin:20px 0 0; }
.switch .sep{ margin:0 8px; color:var(--line); }
.fine{ font-size:12px; color:var(--muted); line-height:1.5; margin:14px 0 0; text-align:center; }
.fine a{ color:var(--blueDark); text-decoration:none; }
.fine a:hover{ text-decoration:underline; }
.center{ text-align:center; }
.ic{ width:60px; height:60px; margin:0 auto 16px; border-radius:50%; background:#eef4fb; border:1px solid #dbe7f3; display:flex; align-items:center; justify-content:center; }
.ic.ok{ background:#eefaf1; border-color:#cdeed9; }
.center .subtitle{ margin-bottom:22px; }
.foot{ text-align:center; font-size:12.5px; color:var(--muted); margin:22px 0 0; }

@media (max-width:440px){ .wrap{ padding-top:70px; } .card{ padding:24px 20px; } }

@media (min-width:900px){
  .side{ display:flex; flex:0 0 45%; max-width:560px; position:sticky; top:0; height:100vh; }
  .formside{ width:auto; flex:1; }
  .formside > .back{ display:none; }
  .formside .brand{ display:none; }
  .wrap{ padding-top:40px; }
}
`;
