'use client';
import React, { useState } from "react";

// myDelsu · Become a sponsor page. Route: /sponsor

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const NAIRA = "\u20A6";
const CURRENT = "/sponsor";
const SUPPORT_EMAIL = "hello@mydelsu.com";
const CHANNEL_URL = "https://whatsapp.com/channel/0029Va4mZrK8fewhKYnjU83Y";

const NAV = [["Manna", "/"], ["Student tools", "/tools"], ["About us", "/about"], ["Become a sponsor", "/sponsor"], ["Contact us", "/contact"], ["Sign in", "/login"]];
const FOOT = [["About", "/about"], ["Become a sponsor", "/sponsor"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Disclaimer", "/disclaimer"]];

const TIERS = [
  [NAIRA + "5,000", "One student, one Friday."],
  [NAIRA + "20,000", "A month of Fridays."],
  [NAIRA + "65,000", "A full term, thirteen Fridays."],
  ["Any amount", "Give what you can, when you can."],
];

export default function MyDelsuSponsor() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [freq, setFreq] = useState("One off");
  const [msg, setMsg] = useState("");

  function flash(m) { setToast(m); setTimeout(() => setToast(null), 2800); }
  function submit() {
    if (!name.trim() || !email.trim()) return flash("Please add your name and email.");
    flash("Thank you. We will reach out shortly to set things up.");
    setName(""); setEmail(""); setAmount(""); setMsg("");
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
          <header className="phead"><span className="eyebrow">Partner with Manna</span><h1>Become a tool in the hands of God</h1><p className="lede">Manna gives one DELSU student {NAIRA}5,000 every Friday, free. Your gift keeps that blessing going, week after week.</p></header>

          <section className="tiers">
            <h2>What your gift does</h2>
            <div className="tier-grid">{TIERS.map(([a, d]) => (<div className="tier" key={a}><p className="tier-a">{a}</p><p className="tier-d">{d}</p></div>))}</div>
            <p className="tier-note">Every naira reaches a student. Each winner is published on the Wall of Thanks, with proof of the transfer, so you can see the blessing you made possible.</p>
          </section>

          <section className="form-card">
            <h2>Tell us you are in</h2>
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <div className="two">
              <div><label>Amount</label><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={NAIRA + "5,000"} inputMode="numeric" /></div>
              <div><label>How often</label><select value={freq} onChange={(e) => setFreq(e.target.value)}><option>One off</option><option>Every month</option><option>Every term</option></select></div>
            </div>
            <label>Message (optional)</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Anything you would like us to know" />
            <button className="primary" onClick={submit}>Become a sponsor</button>
            <p className="form-note">Prefer to talk first? Reach us on <a href={"mailto:" + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a> or our <a href={CHANNEL_URL} target="_blank" rel="noreferrer">WhatsApp channel</a>.</p>
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

.tiers{ margin:10px 0 8px; }
.tiers h2{ font-size:22px; font-weight:800; margin:0 0 16px; }
.tier-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.tier{ border:1px solid var(--line); border-radius:14px; padding:18px; background:#fbfcfe; text-align:center; }
.tier-a{ font-size:22px; font-weight:800; color:var(--ink); margin:0 0 4px; letter-spacing:-.02em; }
.tier-d{ font-size:13px; color:var(--muted); margin:0; }
.tier-note{ font-size:14px; color:var(--body); line-height:1.6; margin:16px 0 0; }

.form-card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:24px; box-shadow:0 1px 2px rgba(15,23,42,.05); margin-top:26px; }
.form-card h2{ font-size:19px; font-weight:800; margin:0 0 16px; }
.form-card label{ display:block; font-size:13px; font-weight:700; margin:14px 0 7px; }
.form-card label:first-of-type{ margin-top:0; }
.form-card input, .form-card select, .form-card textarea{ width:100%; border:1px solid var(--line); border-radius:11px; padding:12px 14px; font-size:15px; font-family:inherit; color:var(--ink); outline:none; background:#fff; transition:border-color .15s, box-shadow .15s; }
.form-card input:focus, .form-card select:focus, .form-card textarea:focus{ border-color:var(--blue); box-shadow:0 0 0 3px rgba(90,138,187,.18); }
.form-card textarea{ resize:vertical; }
.two{ display:flex; gap:12px; }
.two > div{ flex:1; }
.primary{ margin-top:18px; background:var(--blue); color:#fff; border:none; border-radius:12px; padding:13px 30px; font-size:15px; font-weight:700; cursor:pointer; transition:background .15s, transform .12s; }
.primary:hover{ background:var(--blueDark); transform:translateY(-1px); }
.form-note{ font-size:13px; color:var(--muted); margin:14px 0 0; line-height:1.6; }
.form-note a{ color:var(--blueDark); text-decoration:none; font-weight:600; }
.form-note a:hover{ text-decoration:underline; }

.foot{ border-top:1px solid var(--line); background:var(--soft); padding:32px 20px 34px; margin-top:44px; }
.foot-top{ max-width:760px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.foot-brand{ display:flex; align-items:center; gap:7px; }
.foot-links{ display:flex; gap:8px 18px; flex-wrap:wrap; }
.foot-links a{ color:var(--body); font-size:13.5px; font-weight:600; text-decoration:none; }
.foot-links a:hover{ color:var(--blue); }
.foot-copy{ max-width:760px; margin:20px auto 0; font-size:12.5px; color:var(--muted); text-align:center; line-height:1.5; }

@media (max-width:560px){
  .phead h1{ font-size:29px; }
  .tier-grid{ grid-template-columns:1fr; }
  .two{ flex-direction:column; gap:0; }
  .foot-top{ flex-direction:column; align-items:flex-start; }
}
`;
