'use client';
import React, { useState } from "react";

// myDelsu · Contact us page. Route: /contact

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const CURRENT = "/contact";
const SUPPORT_EMAIL = "hello@mydelsu.com";
const CHANNEL_URL = "https://whatsapp.com/channel/0029Va4mZrK8fewhKYnjU83Y";

const NAV = [["Manna", "/"], ["Student tools", "/tools"], ["About us", "/about"], ["Become a sponsor", "/sponsor"], ["Contact us", "/contact"], ["Sign in", "/login"]];
const FOOT = [["About", "/about"], ["Become a sponsor", "/sponsor"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Disclaimer", "/disclaimer"]];

export default function MyDelsuContact() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function flash(m) { setToast(m); setTimeout(() => setToast(null), 2800); }
  function submit() {
    if (!name.trim() || !email.trim() || !msg.trim()) return flash("Please fill in every field.");
    flash("Thanks, your message has been sent. We will reply soon.");
    setName(""); setEmail(""); setMsg("");
  }

  return (
    <div className="site">
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

      <nav className="nav">
        <a className="logo" href="/"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span></a>
        <button className="burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span className="l1" /><span className="l2" /><span className="l3" /></button>
      </nav>

      <div className={"drawer-overlay" + (menuOpen ? " open" : "")} onClick={() => setMenuOpen(false)} />
      <aside className={"drawer" + (menuOpen ? " open" : "")} aria-hidden={!menuOpen}>
        <div className="drawer-head"><span className="drawer-title">Menu</span><button className="close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><svg viewBox="0 0 24 24" width="22" height="22" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button></div>
        <ul className="drawer-links">{NAV.map(([l, h]) => (<li key={l}><a href={h} className={h === CURRENT ? "is-current" : ""}>{l}</a></li>))}</ul>
      </aside>

      <main className="main">
        <article className="page">
          <header className="phead"><span className="eyebrow">Contact us</span><h1>We would love to hear from you</h1><p className="lede">Questions, feedback, or just saying hello. Reach us in whichever way suits you.</p></header>

          <section className="ways">
            <a className="way" href={CHANNEL_URL} target="_blank" rel="noreferrer"><span className="way-ic"><Chat /></span><span><span className="way-t">WhatsApp channel</span><span className="way-d">Announcements and quick support</span></span></a>
            <a className="way" href={"mailto:" + SUPPORT_EMAIL}><span className="way-ic"><Mail /></span><span><span className="way-t">Email</span><span className="way-d">{SUPPORT_EMAIL}</span></span></a>
          </section>

          <section className="form-card">
            <h2>Send a message</h2>
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <label>Message</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="How can we help?" />
            <button className="primary" onClick={submit}>Send message</button>
          </section>
        </article>
      </main>

      <footer className="foot">
        <div className="foot-top">
          <div className="foot-brand"><span className="logo-my dark">my</span><span className="logo-badge dark"><span className="logo-badge-inner">DELSU</span></span></div>
          <nav className="foot-links">{FOOT.map(([l, h]) => (<a key={l} href={h}>{l}</a>))}</nav>
        </div>
        <p className="foot-copy">&copy; 2026 myDelsu. The resource platform for DELSU students. Not affiliated with Delta State University.</p>
      </footer>
    </div>
  );
}

function Chat() { return (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={BLUE_DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z" /></svg>); }
function Mail() { return (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={BLUE_DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>); }

const css = `
.site{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f5f7fa; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:#fff; min-height:100vh; -webkit-font-smoothing:antialiased; display:flex; flex-direction:column; }
.site *{ box-sizing:border-box; }
.toast{ position:fixed; top:74px; left:50%; transform:translateX(-50%); z-index:60; background:var(--ink); color:#fff; font-size:13.5px; font-weight:600; padding:11px 18px; border-radius:11px; box-shadow:0 10px 30px rgba(15,23,42,.28); max-width:90vw; text-align:center; }

.nav{ position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:${BLUE}; }
.logo{ display:flex; align-items:center; gap:7px; text-decoration:none; }
.logo-my{ color:#fff; font-weight:800; font-style:italic; font-size:24px; letter-spacing:-.5px; }
.logo-my.dark{ color:var(--blueDark); }
.logo-badge{ background:#fff; border-radius:5px; padding:2px 9px; transform:skewX(-9deg); box-shadow:0 2px 4px rgba(0,0,0,.18); }
.logo-badge.dark{ background:var(--blue); box-shadow:none; }
.logo-badge-inner{ display:inline-block; transform:skewX(9deg); color:#3f6f9e; font-weight:800; font-style:italic; font-size:18px; letter-spacing:1px; }
.logo-badge.dark .logo-badge-inner{ color:#fff; }
.burger{ width:26px; height:20px; background:transparent; border:none; cursor:pointer; padding:0; display:flex; flex-direction:column; justify-content:space-between; }
.burger span{ display:block; height:3px; background:#fff; border-radius:2px; }
.burger .l1{ width:100%; } .burger .l2{ width:100%; } .burger .l3{ width:70%; align-self:flex-end; }

.drawer-overlay{ position:fixed; inset:0; background:rgba(15,23,42,0); z-index:40; pointer-events:none; transition:background .3s ease; }
.drawer-overlay.open{ background:rgba(15,23,42,.4); pointer-events:auto; }
.drawer{ position:fixed; top:0; right:0; height:100%; width:290px; max-width:82vw; z-index:41; background:#fff; transform:translateX(100%); transition:transform .32s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; padding:18px 20px 24px; box-shadow:-14px 0 40px rgba(15,23,42,.14); border-left:1px solid var(--line); }
.drawer.open{ transform:translateX(0); }
.drawer-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.drawer-title{ color:var(--muted); font-size:12px; letter-spacing:3px; text-transform:uppercase; font-weight:700; }
.close{ background:transparent; border:none; cursor:pointer; padding:4px; }
.drawer-links{ list-style:none; margin:8px 0 0; padding:0; }
.drawer-links li{ border-bottom:1px solid var(--line); }
.drawer-links a{ display:block; padding:14px 4px; color:var(--ink); text-decoration:none; font-size:15.5px; font-weight:600; }
.drawer-links a:hover{ color:var(--blue); }
.drawer-links a.is-current{ color:var(--blue); }

.main{ flex:1; }
.page{ max-width:760px; margin:0 auto; padding:44px 20px 20px; }
.phead{ margin-bottom:26px; }
.eyebrow{ font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; }
.phead h1{ font-size:36px; font-weight:800; letter-spacing:-.025em; margin:10px 0 0; line-height:1.1; }
.lede{ font-size:17px; color:var(--body); line-height:1.6; margin:16px 0 0; }

.ways{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:8px; }
.way{ display:flex; align-items:center; gap:12px; border:1px solid var(--line); border-radius:14px; padding:16px; text-decoration:none; background:#fff; transition:border-color .15s, box-shadow .15s, transform .15s; }
.way:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(15,23,42,.07); border-color:#d9e6f3; }
.way-ic{ width:44px; height:44px; flex:none; border-radius:12px; background:#eef4fb; border:1px solid #dbe7f3; display:flex; align-items:center; justify-content:center; }
.way-t{ display:block; font-weight:800; font-size:15px; color:var(--ink); }
.way-d{ display:block; font-size:13px; color:var(--muted); margin-top:2px; }

.form-card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:24px; box-shadow:0 1px 2px rgba(15,23,42,.05); margin-top:26px; }
.form-card h2{ font-size:19px; font-weight:800; margin:0 0 16px; }
.form-card label{ display:block; font-size:13px; font-weight:700; margin:14px 0 7px; }
.form-card label:first-of-type{ margin-top:0; }
.form-card input, .form-card textarea{ width:100%; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; font-family:inherit; color:var(--ink); outline:none; background:#fff; transition:border-color .15s, box-shadow .15s; }
.form-card input:focus, .form-card textarea:focus{ border-color:var(--blue); box-shadow:0 0 0 3px rgba(90,138,187,.18); }
.form-card textarea{ resize:vertical; }
.primary{ margin-top:18px; background:var(--blue); color:#fff; border:none; border-radius:12px; padding:13px 30px; font-size:15px; font-weight:700; cursor:pointer; transition:background .15s, transform .12s; }
.primary:hover{ background:var(--blueDark); transform:translateY(-1px); }

.foot{ border-top:1px solid var(--line); background:var(--soft); padding:32px 20px 34px; margin-top:44px; }
.foot-top{ max-width:760px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.foot-brand{ display:flex; align-items:center; gap:7px; }
.foot-links{ display:flex; gap:8px 18px; flex-wrap:wrap; }
.foot-links a{ color:var(--body); font-size:13.5px; font-weight:600; text-decoration:none; }
.foot-links a:hover{ color:var(--blue); }
.foot-copy{ max-width:760px; margin:20px auto 0; font-size:12.5px; color:var(--muted); text-align:center; line-height:1.5; }

@media (max-width:560px){
  .phead h1{ font-size:29px; }
  .ways{ grid-template-columns:1fr; }
  .foot-top{ flex-direction:column; align-items:flex-start; }
}
`;
