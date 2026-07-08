'use client';
import React, { useState } from "react";

// myDelsu · Wall of gratitude. Route: /gratitude
// A soft brick wall background, gratitude notes, proof of payout, own pagination.

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const NAIRA = "\u20A6";
const PRIZE = NAIRA + "5,000";
const CURRENT = "/gratitude";
const PER_PAGE = 6;

const NAV = [["Manna", "/"], ["Student tools", "/tools"], ["About us", "/about"], ["Become a sponsor", "/sponsor"], ["Contact us", "/contact"], ["Sign in", "/login"]];
const FOOT = [["About", "/about"], ["Become a sponsor", "/sponsor"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Disclaimer", "/disclaimer"]];

const WALL = [
  { name: "Rita Eze", fac: "FMSS", session: "25/26", date: "3 Jul 2026", text: "I sponsor myself in school. This lifted a real weight off me this week. Thank you myDelsu." },
  { name: "Victor Ochuko", fac: "FOS", session: "24/25", date: "26 Jun 2026", text: "The best part is that it is free and real. I confirmed my entry on Monday and forgot, then the alert came." },
  { name: "Faith Igwe", fac: "Arts", session: "25/26", date: "19 Jun 2026", text: "Won it, bought my handout, and still had change for beans and bread. God is good." },
  { name: "Emmanuel Obi", fac: "Pharmacy", session: "24/25", date: "12 Jun 2026", text: "I was down to my last hundred naira. Then the Friday alert. Thank you, truly." },
  { name: "Grace Nwachukwu", fac: "Education", session: "25/26", date: "5 Jun 2026", text: "For a girl who feeds on a tight budget, five thousand naira is a lot. Thank you for seeing us." },
  { name: "Samuel Ejiro", fac: "FMSS", session: "23/24", date: "29 May 2026", text: "Manna paid for my data so I could submit my assignment online. You people are doing quiet good work." },
  { name: "Peace Adeyemi", fac: "Law", session: "25/26", date: "22 May 2026", text: "I have never won anything in my life. This week I did. I have promised to bless another student when I can." },
  { name: "Blessing Umeh", fac: "FOS", session: "25/26", date: "15 May 2026", text: "I did not believe it until the alert came in. This covered my transport for the whole month." },
  { name: "Daniel Okonkwo", fac: "Engineering", session: "24/25", date: "8 May 2026", text: "I used it to print my final year project. Small money, but it came exactly when I needed it." },
  { name: "Michael Enahoro", fac: "Arts", session: "24/25", date: "1 May 2026", text: "Small but mighty. It covered my week and reminded me that people still care." },
  { name: "Precious Ovie", fac: "Education", session: "25/26", date: "24 Apr 2026", text: "God bless the founders. May you never lack, as you have refused to let us lack." },
  { name: "Chidinma Okoli", fac: "Law", session: "24/25", date: "17 Apr 2026", text: "I have told everyone in my class to join. This is a blessing our school needed." },
  { name: "Joshua Ade", fac: "Engineering", session: "23/24", date: "10 Apr 2026", text: "Used it to fix my laptop charger so I could keep coding. Timely does not begin to describe it." },
  { name: "Andrew Efe", fac: "Engineering", session: "24/25", date: "27 Mar 2026", text: "The name Manna fits. It came like food from heaven on a hungry week." },
  { name: "Mercy Uche", fac: "FMSS", session: "25/26", date: "20 Mar 2026", text: "I kept the alert as a screenshot. My proof that God shows up through people." },
  { name: "Solomon Agbor", fac: "FOS", session: "23/24", date: "13 Mar 2026", text: "Paid for photocopies for a whole group of us reading together. A shared blessing." },
  { name: "Deborah Ike", fac: "Pharmacy", session: "25/26", date: "6 Mar 2026", text: "I entered without hope and won. Now I look forward to Fridays." },
  { name: "Sandra Odion", fac: "Law", session: "25/26", date: "27 Feb 2026", text: "Used mine to renew my transport card. Every naira counted this month." },
  { name: "Gift Aboh", fac: "Education", session: "23/24", date: "20 Feb 2026", text: "Thank you for not making it complicated. Just log in, confirm, and trust." },
  { name: "Esther Bello", fac: "Pharmacy", session: "25/26", date: "13 Feb 2026", text: "I promised in the covenant to bless someone too, and I will keep it." },
  { name: "Kelvin Ubaka", fac: "Arts", session: "24/25", date: "6 Feb 2026", text: "I am usually the one helping others. This week someone helped me. Humbling." },
  { name: "Henry Okafor", fac: "FOS", session: "24/25", date: "30 Jan 2026", text: "This platform understands students. The win was sweet, but the thought behind it is sweeter." },
  { name: "Joy Aliu", fac: "FMSS", session: "23/24", date: "23 Jan 2026", text: "My mum could not send money that week. Manna stepped in. I am grateful beyond words." },
  { name: "Israel Etim", fac: "Engineering", session: "25/26", date: "16 Jan 2026", text: "Confirmed my entry between lectures and forgot. Friday changed my week. Thank you." },
];

const mono = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function MyDelsuGratitude() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [proof, setProof] = useState(null);

  const totalPages = Math.ceil(WALL.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const slice = WALL.slice(start, start + PER_PAGE);

  function goto(n) { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }

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

      {proof && (
        <div className="modal-overlay" onClick={() => setProof(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" aria-label="Close" onClick={() => setProof(null)}><svg viewBox="0 0 24 24" width="20" height="20" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            <p className="modal-cap">Proof of payout</p>
            <div className="alert">
              <div className="alert-top"><span className="alert-from">myDelsu · Manna</span><span className="alert-when">Fri 6:04pm</span></div>
              <p className="alert-amt">{PRIZE}<span className="cr">Credit</span></p>
              <p className="alert-line">Manna weekly blessing</p>
              <p className="alert-line">To: {proof.name}</p>
              <p className="alert-line muted">{proof.date}</p>
            </div>
            <p className="modal-note">Every winner is paid to the bank account on their profile, verified against their registered name.</p>
          </div>
        </div>
      )}

      <main className="main wall">
        <header className="phead"><span className="eyebrow">Manna</span><h1>Wall of gratitude</h1><p className="lede">Real students, real Fridays, real thanks. Every name here won Manna, and promised to bless another student in their own season.</p></header>

        <div className="notes">
          {slice.map((g, i) => (
            <figure className="note" key={start + i}>
              <span className="q">&#8220;</span>
              <p className="note-text">{g.text}</p>
              <figcaption className="note-foot">
                <span className="mono">{mono(g.name)}</span>
                <span className="who"><span className="note-name">{g.name}</span><span className="note-meta">{g.fac} · {g.session}</span></span>
              </figcaption>
              <div className="note-tail"><span className="won">Won {PRIZE}</span><span className="dot">·</span><span className="when">{g.date}</span><button className="proof" onClick={() => setProof(g)}>Proof</button></div>
            </figure>
          ))}
        </div>

        <nav className="pager" aria-label="Pagination">
          <button className="pg" disabled={page === 1} onClick={() => goto(page - 1)}>Prev</button>
          <div className="pg-nums">{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (<button key={n} className={"pg-num" + (n === page ? " on" : "")} onClick={() => goto(n)}>{n}</button>))}</div>
          <button className="pg" disabled={page === totalPages} onClick={() => goto(page + 1)}>Next</button>
        </nav>
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
.site{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f5f7fa; --green:#2f7d4f; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:#fff; min-height:100vh; -webkit-font-smoothing:antialiased; display:flex; flex-direction:column; }
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

/* Brick wall */
.main{ flex:1; }
.wall{
  background-color:#e4ecf4;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Crect width='80' height='40' fill='%23e4ecf4'/%3E%3Cg fill='%23cbdcec'%3E%3Crect width='80' height='2'/%3E%3Crect y='20' width='80' height='2'/%3E%3Crect width='2' height='20'/%3E%3Crect x='40' width='2' height='20'/%3E%3Crect x='20' y='20' width='2' height='20'/%3E%3Crect x='60' y='20' width='2' height='20'/%3E%3C/g%3E%3C/svg%3E");
  padding-bottom:20px;
}
.phead{ max-width:900px; margin:0 auto; padding:44px 20px 8px; text-align:center; }
.eyebrow{ font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--blueDark); font-weight:800; }
.phead h1{ font-size:38px; font-weight:800; letter-spacing:-.025em; margin:10px 0 0; line-height:1.1; color:#22456a; }
.lede{ font-size:16.5px; color:#51667d; line-height:1.6; margin:14px auto 0; max-width:560px; }

.notes{ max-width:980px; margin:26px auto 0; padding:0 20px; column-count:3; column-gap:16px; }
.note{ break-inside:avoid; background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:14px; padding:18px 18px 16px; margin:0 0 16px; box-shadow:0 6px 18px rgba(34,69,106,.14); position:relative; }
.q{ position:absolute; top:6px; left:14px; font-family:Georgia,serif; font-size:44px; line-height:1; color:#e4ebf3; }
.note-text{ position:relative; font-size:15px; line-height:1.65; color:#33404e; margin:14px 0 16px; }
.note-foot{ display:flex; align-items:center; gap:11px; }
.mono{ width:38px; height:38px; flex:none; border-radius:50%; background:var(--blue); color:#fff; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; }
.who{ display:flex; flex-direction:column; min-width:0; }
.note-name{ font-weight:800; font-size:14.5px; color:var(--ink); }
.note-meta{ font-size:12.5px; color:var(--muted); margin-top:1px; }
.note-tail{ display:flex; align-items:center; gap:7px; margin-top:14px; padding-top:12px; border-top:1px solid #f0f2f5; font-size:12.5px; color:var(--muted); }
.won{ font-weight:800; color:var(--green); }
.dot{ color:#cbd3dc; }
.when{ }
.proof{ margin-left:auto; background:#fff; border:1px solid var(--line); border-radius:8px; padding:5px 12px; font-size:12px; font-weight:700; color:var(--blueDark); cursor:pointer; }
.proof:hover{ border-color:var(--blue); color:var(--blue); }

.pager{ max-width:980px; margin:20px auto 30px; padding:0 20px; display:flex; align-items:center; justify-content:center; gap:8px; }
.pg{ background:#fff; border:1px solid rgba(0,0,0,.1); border-radius:10px; padding:9px 16px; font-size:13.5px; font-weight:700; color:var(--ink); cursor:pointer; box-shadow:0 2px 6px rgba(34,69,106,.1); }
.pg:hover:not(:disabled){ border-color:var(--blue); color:var(--blue); }
.pg:disabled{ opacity:.4; cursor:default; }
.pg-nums{ display:flex; gap:6px; }
.pg-num{ min-width:38px; height:38px; background:#fff; border:1px solid rgba(0,0,0,.1); border-radius:10px; font-size:13.5px; font-weight:700; color:var(--ink); cursor:pointer; box-shadow:0 2px 6px rgba(34,69,106,.1); }
.pg-num:hover{ border-color:var(--blue); color:var(--blue); }
.pg-num.on{ background:var(--blue); border-color:var(--blue); color:#fff; }

/* Proof modal */
.modal-overlay{ position:fixed; inset:0; z-index:50; background:rgba(15,23,42,.5); display:flex; align-items:center; justify-content:center; padding:20px; }
.modal{ position:relative; width:100%; max-width:360px; background:#fff; border-radius:18px; padding:24px; box-shadow:0 24px 60px rgba(15,23,42,.3); }
.modal-x{ position:absolute; top:14px; right:14px; background:transparent; border:none; cursor:pointer; padding:2px; }
.modal-cap{ font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); font-weight:800; margin:0 0 14px; }
.alert{ border:1px solid var(--line); border-radius:14px; padding:16px; background:#fbfcfe; }
.alert-top{ display:flex; align-items:center; justify-content:space-between; }
.alert-from{ font-size:12.5px; font-weight:800; color:var(--blueDark); }
.alert-when{ font-size:11.5px; color:var(--muted); }
.alert-amt{ font-size:28px; font-weight:800; color:var(--green); letter-spacing:-.02em; margin:10px 0 8px; display:flex; align-items:baseline; gap:8px; }
.alert-amt .cr{ font-size:11px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; color:var(--green); background:#eafaf0; border:1px solid #cdeed9; border-radius:6px; padding:2px 7px; }
.alert-line{ font-size:13px; color:var(--body); margin:3px 0; }
.alert-line.muted{ color:var(--muted); }
.modal-note{ font-size:12.5px; color:var(--muted); line-height:1.55; margin:14px 0 0; }

.foot{ border-top:1px solid var(--line); background:var(--soft); padding:32px 20px 34px; }
.foot-top{ max-width:980px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.foot-brand{ display:flex; align-items:center; gap:7px; }
.foot-links{ display:flex; gap:8px 18px; flex-wrap:wrap; }
.foot-links a{ color:var(--body); font-size:13.5px; font-weight:600; text-decoration:none; }
.foot-links a:hover{ color:var(--blue); }
.foot-copy{ max-width:980px; margin:20px auto 0; font-size:12.5px; color:var(--muted); text-align:center; line-height:1.5; }

@media (max-width:860px){ .notes{ column-count:2; } }
@media (max-width:560px){
  .phead h1{ font-size:30px; }
  .notes{ column-count:1; }
  .foot-top{ flex-direction:column; align-items:flex-start; }
}
`;
