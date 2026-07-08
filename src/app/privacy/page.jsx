'use client';
import React, { useState } from "react";

// myDelsu · Privacy policy page. Route: /privacy

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const CURRENT = "/privacy";
const UPDATED = "7 July 2026";
const SUPPORT_EMAIL = "hello@mydelsu.com";

const NAV = [["Manna", "/"], ["Student tools", "/tools"], ["About us", "/about"], ["Become a sponsor", "/sponsor"], ["Contact us", "/contact"], ["Sign in", "/login"]];
const FOOT = [["About", "/about"], ["Become a sponsor", "/sponsor"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Disclaimer", "/disclaimer"]];

export default function MyDelsuPrivacy() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site">
      <style>{css}</style>

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
          <header className="phead"><span className="eyebrow">Legal</span><h1>Privacy policy</h1><p className="updated">Last updated {UPDATED}</p></header>
          <div className="prose">
            <p>This policy explains what information myDelsu collects, how we use it, and the choices you have. By using myDelsu you agree to this policy.</p>
            <h2>Information we collect</h2>
            <p>When you create an account we collect your email and password. To take part in Manna and to be paid, we collect your matric number, your WhatsApp number, and your bank details, which include your bank, account number, and account name. We also collect basic usage information to keep the service running and to improve it.</p>
            <h2>How we use your information</h2>
            <p>We use your details to run your account, to check your eligibility for the weekly draw, to reach you if you win, and to send your winnings to your bank. We use your contact details to send service messages such as the weekly reminder and the winner announcement.</p>
            <h2>How we share your information</h2>
            <p>We do not sell your information. We share it only with the service providers who help us operate, such as our payment and messaging partners, and only as far as they need it to do their work. We may disclose information where the law requires it.</p>
            <h2>Winners</h2>
            <p>If you win, we may publish limited details such as your name, faculty, and matric number as part of announcing the draw. We only publish your words of gratitude with your permission.</p>
            <h2>Keeping your information safe</h2>
            <p>We take reasonable steps to protect your information, but no service can promise perfect security. Please keep your password private.</p>
            <h2>Your choices</h2>
            <p>You can view and update your details in your account settings at any time. You can ask us to close your account and remove your information, subject to records we must keep by law.</p>
            <h2>Changes</h2>
            <p>We may update this policy from time to time. We will post the new version here with a fresh date.</p>
            <h2>Contact</h2>
            <p>Questions about your privacy can be sent to {SUPPORT_EMAIL}.</p>
          </div>
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
.phead{ margin-bottom:20px; }
.eyebrow{ font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; }
.phead h1{ font-size:36px; font-weight:800; letter-spacing:-.025em; margin:10px 0 0; line-height:1.1; }
.updated{ font-size:13px; color:var(--muted); margin:12px 0 0; }

.prose p{ font-size:15.5px; line-height:1.75; color:var(--body); margin:0 0 16px; }
.prose h2{ font-size:19px; font-weight:800; letter-spacing:-.01em; color:var(--ink); margin:28px 0 10px; }

.foot{ border-top:1px solid var(--line); background:var(--soft); padding:32px 20px 34px; margin-top:44px; }
.foot-top{ max-width:760px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.foot-brand{ display:flex; align-items:center; gap:7px; }
.foot-links{ display:flex; gap:8px 18px; flex-wrap:wrap; }
.foot-links a{ color:var(--body); font-size:13.5px; font-weight:600; text-decoration:none; }
.foot-links a:hover{ color:var(--blue); }
.foot-copy{ max-width:760px; margin:20px auto 0; font-size:12.5px; color:var(--muted); text-align:center; line-height:1.5; }

@media (max-width:560px){ .phead h1{ font-size:29px; } .foot-top{ flex-direction:column; align-items:flex-start; } }
`;
