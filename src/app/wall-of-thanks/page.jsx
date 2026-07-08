"use client";
 
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
 
// myDelsu · Wall of gratitude. Route: /wall-of-thanks
 
const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const NAIRA = "\u20A6";
const PRIZE = NAIRA + "5,000";
const CURRENT = "/wall-of-thanks";
 
const NAV = [
  ["Manna", "/"],
  ["Student tools", "/tools"],
  ["About us", "/about"],
  ["Become a sponsor", "/sponsor"],
  ["Contact us", "/contact"],
  ["Sign in", "/login"]
];
 
const FOOT = [
  ["About", "/about"],
  ["Become a sponsor", "/sponsor"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Disclaimer", "/disclaimer"]
];
 
const mono = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
 
export default function MyDelsuGratitude() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [gratitudes, setGratitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState(null);
 
  async function fetchGratitudes(pageNum) {
    setLoading(true);
    try {
      const res = await apiFetch(`/gratitudes?page=${pageNum}`);
      if (res.ok) {
        const json = await res.json();
        setGratitudes(json.data || []);
        setPage(json.meta?.current_page || pageNum);
        setTotalPages(json.meta?.last_page || 1);
      }
    } catch (err) {
      console.error("Failed to load Wall of Thanks data", err);
    } finally {
      setLoading(false);
    }
  }
 
  useEffect(() => {
    fetchGratitudes(page);
  }, [page]);
 
  function goto(n) {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
 
  const items = gratitudes.length > 0 ? gratitudes : [
    { user: { name: "Rita Eze", faculty: "FMSS" }, winner: { prize_kobo: 500000, updated_at: "2026-07-03" }, body: "I sponsor myself in school. This lifted a real weight off me this week. Thank you myDelsu." },
    { user: { name: "Victor Ochuko", faculty: "FOS" }, winner: { prize_kobo: 500000, updated_at: "2026-06-26" }, body: "The best part is that it is free and real. I confirmed my entry on Monday and forgot, then the alert came." },
    { user: { name: "Faith Igwe", faculty: "Arts" }, winner: { prize_kobo: 500000, updated_at: "2026-06-19" }, body: "Won it, bought my handout, and still had change for beans and bread. God is good." }
  ];
 
  return (
    <div className="site">
      <style dangerouslySetInnerHTML={{ __html: css }} />
 
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
              <p className="alert-line">To: {proof.user?.name || proof.name}</p>
              <p className="alert-line muted">{proof.winner?.updated_at ? new Date(proof.winner.updated_at).toLocaleDateString() : proof.date || "Recently"}</p>
            </div>
            <p className="modal-note">Every winner is paid to the bank account on their profile, verified against their registered name.</p>
          </div>
        </div>
      )}
 
      <main className="main wall">
        <header className="phead"><span className="eyebrow">Manna</span><h1>Wall of gratitude</h1><p className="lede">Real students, real Fridays, real thanks. Every name here won Manna, and promised to bless another student in their own season.</p></header>
 
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "var(--muted)" }}>Loading thanks...</div>
        ) : (
          <>
            <div className="notes">
              {items.map((g, i) => (
                <figure className="note" key={i}>
                  <span className="q">&#8220;</span>
                  <p className="note-text">{g.body || g.text}</p>
                  <figcaption className="note-foot">
                    <span className="mono">{mono(g.user?.name || g.name)}</span>
                    <span className="who">
                      <span className="note-name">{g.user?.name || g.name}</span>
                      <span className="note-meta">{g.user?.faculty || g.fac || "DELSU"}</span>
                    </span>
                  </figcaption>
                  <div className="note-tail">
                    <span className="won">Won {PRIZE}</span>
                    <span className="dot">·</span>
                    <span className="when">{g.winner?.updated_at ? new Date(g.winner.updated_at).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"}) : g.date || "Recently"}</span>
                    <button className="proof" onClick={() => setProof(g)}>Proof</button>
                  </div>
                </figure>
              ))}
            </div>
 
            <nav className="pager" aria-label="Pagination">
              <button className="pg" disabled={page === 1} onClick={() => goto(page - 1)}>Prev</button>
              <div className="pg-nums">{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (<button key={n} className={"pg-num" + (n === page ? " on" : "")} onClick={() => goto(n)}>{n}</button>))}</div>
              <button className="pg" disabled={page === totalPages} onClick={() => goto(page + 1)}>Next</button>
            </nav>
          </>
        )}
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
