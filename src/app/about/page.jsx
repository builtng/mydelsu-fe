'use client';
import React, { useState } from "react";

// myDelsu · About us page. Route: /about

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const CURRENT = "/about";

const NAV = [["Manna", "/"], ["Student tools", "/tools"], ["About us", "/about"], ["Become a sponsor", "/sponsor"], ["Contact us", "/contact"], ["Sign in", "/login"]];
const FOOT = [["About", "/about"], ["Become a sponsor", "/sponsor"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Disclaimer", "/disclaimer"]];

const OFFER = [
  ["Verified information", "Accurate, verified details about admission processes, school fees, and campus policies."],
  ["Academic resources", "Digital access to past questions, course summaries, and outlines."],
  ["Student tools", "Practical utilities including aggregate checkers and CGPA calculators."],
  ["Income opportunities", "Connecting students with part time work to support their education."],
  ["Community support", "A network of current students, alumni, and staff dedicated to each other's success."],
];

export default function MyDelsuAbout() {
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
          <header className="phead"><span className="eyebrow">About us</span><h1>Built by a student, for students</h1><p className="lede">myDelsu is the definitive resource platform for Delta State University students, aspirants, and alumni, providing verified, accurate information that enhances the educational journey of the DELSU community.</p></header>

          <section className="prose">
            <p>Founded on 10 September 2019, myDelsu was born from necessity and firsthand experience. Our founder, Victor Ijomah, experienced the challenges of navigating university life with limited resources and unreliable information. Victor, who scored well but was denied admission due to misinformation, vowed to prevent other students from facing the same issue.</p>
            <p>During his time as a mathematics student at DELSU, Victor turned personal challenges into community solutions. Without the means to purchase textbooks, he created comprehensive summaries that distilled essential information. Unable to afford photocopying past questions, he meticulously documented them by hand, complete with solutions. These resources, bearing his distinctive signature, quickly gained popularity across campus and became invaluable study materials for fellow students.</p>
          </section>

          <section className="offer">
            <h2>What we offer</h2>
            <div className="offer-grid">
              {OFFER.map(([t, d]) => (<div className="offer-card" key={t}><p className="offer-t">{t}</p><p className="offer-d">{d}</p></div>))}
            </div>
          </section>

          <section className="prose">
            <h2>Our impact</h2>
            <p>What began as one student's solution to personal challenges has grown into a trusted resource that has helped thousands of DELSU students navigate their academic journey with confidence. myDelsu continues to provide essential information and create accessible study materials, ensuring equal opportunities for all students, whatever their financial situation.</p>
            <h2>Our vision</h2>
            <p>myDelsu aims to expand its impact by continuing to develop innovative tools and resources that address the evolving needs of the DELSU community. We remain committed to our founding principle, ensuring that accurate information and quality resources are accessible to every student.</p>
            <p className="closing">With God's guidance, we strive to be a light and resource for all students, helping them navigate their academic journey with confidence and spiritual grounding.</p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-top">
        <div className="foot-brand"><span className="logo-my dark">my</span><span className="logo-badge dark"><span className="logo-badge-inner">DELSU</span></span></div>
        <nav className="foot-links">{FOOT.map(([l, h]) => (<a key={l} href={h}>{l}</a>))}</nav>
      </div>
      <p className="foot-copy">&copy; 2026 myDelsu. The resource platform for DELSU students. Not affiliated with Delta State University.</p>
    </footer>
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
.phead{ margin-bottom:26px; }
.eyebrow{ font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; }
.phead h1{ font-size:36px; font-weight:800; letter-spacing:-.025em; margin:10px 0 0; line-height:1.1; }
.lede{ font-size:17px; color:var(--body); line-height:1.6; margin:16px 0 0; }

.prose p{ font-size:16px; line-height:1.75; color:var(--body); margin:0 0 16px; }
.prose h2{ font-size:20px; font-weight:800; letter-spacing:-.01em; color:var(--ink); margin:30px 0 10px; }
.prose .closing{ font-style:italic; color:var(--ink); }

.offer{ margin:36px 0 8px; }
.offer h2{ font-size:22px; font-weight:800; margin:0 0 16px; }
.offer-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.offer-card{ border:1px solid var(--line); border-radius:14px; padding:16px 18px; background:#fff; }
.offer-t{ font-weight:800; font-size:15px; margin:0 0 4px; }
.offer-d{ font-size:13.5px; color:var(--muted); margin:0; line-height:1.55; }

.foot{ border-top:1px solid var(--line); background:var(--soft); padding:32px 20px 34px; margin-top:44px; }
.foot-top{ max-width:760px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.foot-brand{ display:flex; align-items:center; gap:7px; }
.foot-links{ display:flex; gap:8px 18px; flex-wrap:wrap; }
.foot-links a{ color:var(--body); font-size:13.5px; font-weight:600; text-decoration:none; }
.foot-links a:hover{ color:var(--blue); }
.foot-copy{ max-width:760px; margin:20px auto 0; font-size:12.5px; color:var(--muted); text-align:center; line-height:1.5; }

@media (max-width:560px){
  .phead h1{ font-size:29px; }
  .offer-grid{ grid-template-columns:1fr; }
  .foot-top{ flex-direction:column; align-items:flex-start; }
}
`;
