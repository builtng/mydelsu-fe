'use client';
import React, { useState, useMemo, useRef, useEffect } from "react";

// Manna, Genesis 12:2. The weekly draw page for myDelsu.

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const AMBER = "#c7963f";
const FLIP_MS = 460;
const NAIRA = "\u20A6";
const PRIZE = 5000;
const prizeText = NAIRA + PRIZE.toLocaleString();
const rnd = () => String(Math.floor(Math.random() * 10));

const SHARE_URL = "https://mydelsu.com";
const SHARE_TEXT = "Manna, a weekly blessing from myDelsu. One DELSU student wins every Friday.";

const WEEK = { faculty: "FOS", facultyName: "Faculty of Science", session: "25/26", sessionLong: "2025/2026 session", nextFaculty: "Faculty of Arts" };

const ENTRANTS = [
  { reg: "244182" }, { reg: "231045" }, { reg: "248125" }, { reg: "239540" },
  { reg: "245071" }, { reg: "238402" }, { reg: "236617" }, { reg: "242918" },
  { reg: "249507" }, { reg: "233276" }, { reg: "247260" }, { reg: "240915" },
];

const PAST_WINNERS = [
  { name: "Rita Ufuoma", matric: "LAW/23/24/239507", faculty: "Faculty of Law", date: "3 July 2026" },
  { name: "David Akpobome", matric: "FOA/24/25/248125", faculty: "Faculty of Arts", date: "26 June 2026" },
  { name: "Grace Efe", matric: "BMS/21/22/216633", faculty: "Basic Medical Sciences", date: "19 June 2026" },
  { name: "Samuel Oghene", matric: "AGR/23/24/238402", faculty: "Faculty of Agriculture", date: "12 June 2026" },
  { name: "Joy Eguono", matric: "PHA/22/23/231889", faculty: "Faculty of Pharmacy", date: "5 June 2026" },
  { name: "Faith Ovie", matric: "EDU/22/23/227145", faculty: "Faculty of Education", date: "29 May 2026" },
  { name: "Daniel Ejiro", matric: "ENG/21/22/216708", faculty: "Faculty of Engineering", date: "22 May 2026" },
  { name: "Miracle Adaeze", matric: "MSC/23/24/238221", faculty: "Management Sciences", date: "15 May 2026" },
  { name: "Gift Onome", matric: "SSC/24/25/245071", faculty: "Faculty of Social Science", date: "8 May 2026" },
  { name: "Emmanuel Tega", matric: "FOS/22/23/244182", faculty: "Faculty of Science", date: "1 May 2026" },
  { name: "Peace Uche", matric: "FOA/23/24/239540", faculty: "Faculty of Arts", date: "24 April 2026" },
  { name: "Blessing Okpako", matric: "LAW/22/23/231045", faculty: "Faculty of Law", date: "17 April 2026" },
];

const THANKS = [
  { name: "Blessing Okpako", faculty: "Faculty of Science", text: "I honestly did not believe it until the alert came in. It paid for my handout and I still had a little left. I have promised myself to bless a junior next semester.", proof: { date: "3 July 2026", ref: "MNA 2261" } },
  { name: "Emmanuel Tega", faculty: "Faculty of Law", text: "Manna came through for me in a hard week. Thank you for keeping your word. God bless myDelsu.", proof: { date: "26 June 2026", ref: "MNA 2247" } },
  { name: "Miracle Adaeze", faculty: "Management Sciences", text: "I used mine to print my project. Small money, big relief. I have already sent something to someone in my class.", proof: { date: "19 June 2026", ref: "MNA 2233" } },
  { name: "Faith Ovie", faculty: "Faculty of Education", text: "I entered every Monday not really expecting to win. When I did, I cried. Thank you for seeing students like me.", proof: { date: "12 June 2026", ref: "MNA 2219" } },
  { name: "Daniel Ejiro", faculty: "Faculty of Engineering", text: "This is more than the money. It is knowing that someone out there is rooting for you. I am paying it forward.", proof: { date: "5 June 2026", ref: "MNA 2205" } },
  { name: "Gift Onome", faculty: "Faculty of Social Science", text: "God bless the founders. I have signed the covenant with my whole heart and I mean every word of it.", proof: { date: "29 May 2026", ref: "MNA 2191" } },
];

const FAQS = [
  { q: "Who can enter Manna?", a: "Current DELSU students in the faculty and session cohort featured that week, entering with their matric number. Each week the board belongs to one cohort, and in time every faculty will have its own page." },
  { q: "Is it free?", a: "Yes. Manna is free to enter, always. There is no purchase and no subscription to take part." },
  { q: "How do I take part?", a: "Create an account, log in with your matric number, sign the covenant, and confirm your entry each Monday." },
  { q: "When does the draw happen?", a: "The board flips through the whole week and stops every Friday at 6pm on one matric number." },
  { q: "What is the covenant?", a: "A short promise to bless another student when your own season of blessing comes, in the spirit of Genesis 12:2." },
  { q: "What can I win?", a: "It is " + prizeText + " for now, given to one student every Friday, and it may grow over time." },
];

const GOD_NAMES = [
  "Jehovah Jireh", "Jehovah Rapha", "Jehovah Nissi", "Jehovah Shalom", "Jehovah Shammah",
  "Jehovah Raah", "Jehovah Tsidkenu", "El Shaddai", "El Elyon", "Adonai", "Elohim",
  "Emmanuel", "Messiah", "Redeemer", "Saviour", "Prince of Peace", "King of Kings",
  "Lord of Lords", "Lion of Judah", "Bread of Life", "Light of the World", "Good Shepherd",
  "The Way", "The Truth", "The Life", "Wonderful Counsellor", "Mighty God",
  "Everlasting Father", "Rose of Sharon", "Lamb of God", "Alpha and Omega", "The Great I Am",
  "Ancient of Days", "Rock of Ages", "Living Water", "Bright Morning Star", "Chief Cornerstone",
];

const JESUS_MESSAGES = [
  { text: "You are not here by accident. Before you knew my name, I knew yours, and I have loved you all along. Come and walk with me.", verse: "I have loved thee with an everlasting love.", ref: "Jeremiah 31:3" },
  { text: "Whatever you are carrying today, you do not have to carry it alone. Bring it to me, for my love has no conditions and no end.", verse: "Come unto me, all ye that labour, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "I see the quiet things no one else notices, the effort, the worry, the hope. You matter to me more than you know.", verse: "The very hairs of your head are all numbered.", ref: "Matthew 10:30" },
  { text: "I am not far away. I am nearer than your next breath, and I am for you. Rest here a while with me.", verse: "The Lord is nigh unto them that are of a broken heart.", ref: "Psalm 34:18" },
  { text: "You do not have to earn my love. It was yours before you did anything, and it will be yours still. Come as you are.", verse: "While we were yet sinners, Christ died for us.", ref: "Romans 5:8" },
  { text: "When the road feels heavy, look up. I am with you in it, and I will not let go of your hand.", verse: "I will never leave thee, nor forsake thee.", ref: "Hebrews 13:5" },
  { text: "I know your name, your dreams, and every tear you have cried. None of it is wasted with me.", verse: "Fear not: for I have called thee by thy name; thou art mine.", ref: "Isaiah 43:1" },
  { text: "You were made for more than striving. You were made to be loved, and I love you. Let us begin a friendship that lasts.", verse: "Ye have not chosen me, but I have chosen you.", ref: "John 15:16" },
  { text: "Even now I am working things together for your good. Trust me with today, and stay close to me.", verse: "All things work together for good to them that love God.", ref: "Romans 8:28" },
  { text: "Cast the weight you are holding onto me. I am strong enough for it, and my heart is gentle toward you.", verse: "Casting all your care upon him; for he careth for you.", ref: "1 Peter 5:7" },
];

const TOOLS = [
  { name: "GPA Calculator", desc: "Work out your semester GPA in seconds.", href: "https://delsutools.ng/tools/gpa-calculator", icon: "calc" },
  { name: "CGPA Target", desc: "Set the target you need for the class you want.", href: "https://delsutools.ng/tools/cgpa-calculator", icon: "target" },
  { name: "Degree Predictor", desc: "See the class of degree you are on track for.", href: "https://delsutools.ng/tools/degree-predictor", icon: "cap" },
  { name: "School Fees Checker", desc: "The latest fees for your department and level.", href: "https://delsutools.ng/tools/school-fees", icon: "cash" },
  { name: "Past Questions", desc: "A library of DELSU past questions and answers.", href: "https://delsutools.ng/past-questions", icon: "doc" },
  { name: "Budget Planner", desc: "Track your monthly spending and savings.", href: "https://delsutools.ng/tools/budget-planner", icon: "wallet" },
  { name: "Post UTME Calculator", desc: "Turn your JAMB and screening scores into your aggregate.", href: "https://delsutools.ng/tools/post-utme-calculator", icon: "calc" },
];

function nextFriday6pm(now) {
  const t = new Date(now);
  const target = new Date(t); target.setHours(18, 0, 0, 0);
  let add = (5 - t.getDay() + 7) % 7;
  if (add === 0 && t.getTime() >= target.getTime()) add = 7;
  target.setDate(t.getDate() + add); target.setHours(18, 0, 0, 0);
  return target.getTime();
}

function FlapTile({ value }) {
  const [prev, setPrev] = useState(value);
  const [k, setK] = useState(0);
  useEffect(() => { if (value !== prev) setK((x) => x + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const folding = value !== prev; const half = FLIP_MS / 2;
  if (!folding) return (<div className="flip"><div className="half upper"><div className="char">{value}</div></div><div className="half lower"><div className="char">{value}</div></div><div className="mid" /></div>);
  return (
    <div className="flip" style={{ "--half": half + "ms" }}>
      <div className="half upper"><div className="char">{value}</div></div>
      <div className="half lower"><div className="char">{prev}</div></div>
      <div className="flap upper-flap" key={"u" + k}><div className="char">{prev}</div></div>
      <div className="flap lower-flap" key={"l" + k} onAnimationEnd={() => setPrev(value)}><div className="char">{value}</div></div>
      <div className="mid" />
    </div>
  );
}

function Check() { return (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>); }

export default function MannaTools() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mode, setMode] = useState("idle");
  const [vals, setVals] = useState(() => Array.from({ length: 6 }, rnd));
  const [winner, setWinner] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [faqOpen, setFaqOpen] = useState(-1);
  const [fairOpen, setFairOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [entered, setEntered] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(true);
  const [sponsorMsg, setSponsorMsg] = useState(JESUS_MESSAGES[0]);
  const [proof, setProof] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  const drawRef = useRef(0);
  const pendingRef = useRef(null);
  const toastRef = useRef(null);
  const drawing = mode === "draw";

  function showToast(msg) { setToast(msg); clearTimeout(toastRef.current); toastRef.current = setTimeout(() => setToast(null), 2900); }

  // Show the sponsor message at most once a day. Uses browser storage in the
  // live app and simply shows each time if storage is unavailable in preview.
  useEffect(() => {
    setSponsorMsg(JESUS_MESSAGES[Math.floor(Math.random() * JESUS_MESSAGES.length)]);
    try {
      const key = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("manna_sponsor_day") === key) setSponsorOpen(false);
      else localStorage.setItem("manna_sponsor_day", key);
    } catch (e) { /* storage blocked, leave showing */ }
  }, []);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const diff = Math.max(0, nextFriday6pm(now) - now);
  const dd = Math.floor(diff / 86400000);
  const hh = Math.floor(diff / 3600000) % 24;
  const mm = Math.floor(diff / 60000) % 60;
  const ss = Math.floor(diff / 1000) % 60;
  const pad = (n) => String(n).padStart(2, "0");

  function entry() {
    if (!signedIn) { setAuthOpen(true); return; }
    if (!entered) { setEntered(true); showToast("You are entered for this week. Come back on Monday to enter again."); return; }
    showToast("You are already entered this week.");
  }
  const cLabel = entered ? "Entered" : "Confirm entry";
  const cDone = entered;

  function login() { setSignedIn(true); setAuthOpen(false); showToast("You are signed in. Now tap Confirm entry."); }

  const pieces = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5, dur: 3 + Math.random() * 2,
    size: 7 + Math.random() * 7, rot: Math.random() * 360,
    colour: [BLUE, AMBER, "#8fb4d6", "#dbe7f2", "#ffffff"][i % 5], round: Math.random() > 0.5,
  })), []);

  useEffect(() => {
    if (mode !== "idle") return;
    const id = setInterval(() => { setVals((v) => v.map((x) => (Math.random() < 0.6 ? rnd() : x))); }, 1050);
    return () => clearInterval(id);
  }, [mode]);

  function startDraw() {
    if (drawing) return;
    const pick = ENTRANTS[Math.floor(Math.random() * ENTRANTS.length)];
    pendingRef.current = pick; const targets = pick.reg.split("");
    setWinner(null); setMode("draw");
    const myRun = ++drawRef.current; const churn = 2;
    const runTick = (tick) => {
      if (drawRef.current !== myRun) return;
      if (tick >= churn + 6) {
        setVals(targets.slice());
        setTimeout(() => { if (drawRef.current !== myRun) return; setWinner(pendingRef.current); setConfetti(pieces); setTimeout(() => setConfetti([]), 5200); }, FLIP_MS + 140);
        return;
      }
      const k = tick - churn; const lockCount = k < 0 ? 0 : Math.min(k + 1, 6);
      setVals(targets.map((t, i) => (i < lockCount ? t : rnd())));
      const gap = FLIP_MS + (tick >= churn + 3 ? (tick - (churn + 2)) * 90 : 60);
      setTimeout(() => runTick(tick + 1), gap);
    };
    runTick(0);
  }

  function copyLink() { try { navigator.clipboard.writeText(SHARE_URL); showToast("Link copied. Thank you for sharing."); } catch (e) { showToast("Share this link: " + SHARE_URL); } }
  const enc = encodeURIComponent;
  const waHref = "https://wa.me/?text=" + enc(SHARE_TEXT + " " + SHARE_URL);
  const fbHref = "https://www.facebook.com/sharer/sharer.php?u=" + enc(SHARE_URL);
  const xHref = "https://twitter.com/intent/tweet?text=" + enc(SHARE_TEXT) + "&url=" + enc(SHARE_URL);
  const tgHref = "https://t.me/share/url?url=" + enc(SHARE_URL) + "&text=" + enc(SHARE_TEXT);

  const links = [
    ["Manna", "/"],
    ["Wall of Thanks", "/wall-of-thanks"],
    ["Student tools", "/tools"],
    ["Become a sponsor", "/sponsor"],
    ["About us", "/about"]
  ];
  const perPage = 4;
  const pageCount = Math.ceil(PAST_WINNERS.length / perPage);
  const shownWinners = PAST_WINNERS.slice(page * perPage, page * perPage + perPage);
  const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const givenAway = NAIRA + (PAST_WINNERS.length * PRIZE).toLocaleString();
  const fridays = PAST_WINNERS.length;
  const faculties = new Set(PAST_WINNERS.map((w) => w.faculty)).size;

  return (
    <div className="manna">
      <style>{css}</style>

      {toast && <div className="toast">{toast}</div>}

      {/* Sponsor message */}
      {sponsorOpen && (
        <div className="modal-overlay" onClick={() => setSponsorOpen(false)}>
          <div className="sponsor-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Close" onClick={() => setSponsorOpen(false)}><svg viewBox="0 0 24 24" width="20" height="20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            <div className="sp-icon"><Heart /></div>
            <span className="sp-eyebrow">A message from our Sponsor</span>
            <p className="sp-message">{sponsorMsg.text}</p>
            <p className="sp-verse">{sponsorMsg.verse}<span className="sp-vref">{sponsorMsg.ref}</span></p>
            <p className="sp-sign">With love, Jesus</p>
            <button className="sp-ok" onClick={() => setSponsorOpen(false)}>Amen</button>
          </div>
        </div>
      )}

      {/* Auth needed */}
      {authOpen && (
        <div className="modal-overlay" onClick={() => setAuthOpen(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Close" onClick={() => setAuthOpen(false)}><svg viewBox="0 0 24 24" width="20" height="20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            <span className="am-eyebrow">One more step</span>
            <p className="am-text">You are not logged in yet, or you have not entered this week. Create an account or log in, then confirm your entry to join the draw.</p>
            <div className="am-actions">
              <button className="am-primary" onClick={login}>Create account</button>
              <button className="am-ghost" onClick={login}>Log in</button>
            </div>
          </div>
        </div>
      )}

      {/* Proof of transfer */}
      {proof && (
        <div className="modal-overlay" onClick={() => setProof(null)}>
          <div className="proof-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Close" onClick={() => setProof(null)}><svg viewBox="0 0 24 24" width="20" height="20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            <span className="pf-eyebrow">Proof of transfer</span>
            <div className="pf-alert">
              <div className="pf-top"><span className="pf-bank">Credit alert</span><span className="pf-dot" /></div>
              <p className="pf-amount">{prizeText}.00</p>
              <div className="pf-row"><span>From</span><b>MYDELSU MANNA</b></div>
              <div className="pf-row"><span>To</span><b>{proof.name}</b></div>
              <div className="pf-row"><span>Account</span><b>******{proof.ref.slice(-4)}</b></div>
              <div className="pf-row"><span>Reference</span><b>{proof.ref}</b></div>
              <div className="pf-row"><span>Date</span><b>{proof.date}, 6:04pm</b></div>
            </div>
            <p className="pf-note">A sample of the transfer sent to this winner. Account details are masked for privacy.</p>
          </div>
        </div>
      )}

      {confetti.length > 0 && (<div className="confetti-layer" aria-hidden="true">{confetti.map((p) => (<span key={p.id} className="confetti-piece" style={{ left: p.left + "vw", width: p.size, height: p.size * 1.4, background: p.colour, borderRadius: p.round ? "50%" : "1px", animationDelay: p.delay + "s", animationDuration: p.dur + "s", transform: `rotate(${p.rot}deg)` }} />))}</div>)}

      {/* Nav */}
      <nav className="nav">
        <div className="logo"><span className="logo-my">my</span><span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span></div>
        <div className="nav-icons">
          <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen((s) => !s)}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg></button>
          <button className={"header-cta" + (cDone ? " done" : "")} onClick={entry}>{cDone && <Check />}{cLabel}</button>
          <button className="icon-btn burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span className="l1" /><span className="l2" /><span className="l3" /></button>
        </div>
      </nav>
      {searchOpen && (<div className="search-row"><input className="search-input" placeholder="Search myDelsu" autoFocus /></div>)}

      {/* Drawer */}
      <div className={"drawer-overlay" + (menuOpen ? " open" : "")} onClick={() => setMenuOpen(false)} />
      <aside className={"drawer" + (menuOpen ? " open" : "")} aria-hidden={!menuOpen}>
        <div className="drawer-head"><span className="drawer-title">Menu</span><button className="close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><svg viewBox="0 0 24 24" width="22" height="22" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button></div>
        <ul className="drawer-links">{links.map(([l, h]) => (<li key={l}><a href={h} onClick={() => setMenuOpen(false)}>{l}</a></li>))}</ul>
        <button className="drawer-cta" onClick={() => { setMenuOpen(false); entry(); }}>{cLabel}</button>
      </aside>

      {/* Hero */}
      <header className="hero"><h1 className="hero-title">Manna</h1></header>

      <main className="stage">
        {/* Draw board */}
        <section className="draw-card">
          <div className="draw-head"><span className="eyebrow">This week&#39;s draw</span><span className="next-pill">Next week: {WEEK.nextFaculty}</span></div>
          <div className="tray">
            <p className="cohort">{WEEK.faculty} {WEEK.session}</p>
            <div className="flip-row" role="img" aria-label="Winning registration number">{vals.map((d, i) => (<FlapTile key={i} value={d} />))}</div>
            <p className="cohort-sub">{WEEK.facultyName} · {WEEK.sessionLong}</p>
          </div>

          <div className="countdown"><span className="cd-label">Draw closes Friday at 6pm</span>
            <div className="cd-chips"><span className="cd-chip">{dd}<i>d</i></span><span className="cd-chip">{pad(hh)}<i>h</i></span><span className="cd-chip">{pad(mm)}<i>m</i></span><span className="cd-chip">{pad(ss)}<i>s</i></span></div>
          </div>

          <button className="draw-btn" onClick={entry}>{cDone && <Check />}{cLabel}</button>

          <div className="draw-links">
            <button className="mini-link" onClick={() => setFairOpen((f) => !f)}>How the draw is fair</button>
            <span className="mini-sep">·</span>
            <button className="mini-link" onClick={startDraw} disabled={drawing}>Preview the draw</button>
          </div>
          {fairOpen && <p className="fair-text">Every valid entry has an equal chance. Names are drawn at random, the draw is recorded, and the winner is published here every week. Manna is free, so no entry is ever bought.</p>}

          <div className="winner-slot" aria-live="polite">
            {winner && (<div className="winner-card"><span className="winner-label">This week&#39;s blessing</span><span className="winner-num">{WEEK.faculty}/{WEEK.session}/{winner.reg}</span><span className="winner-sub">receives {prizeText}</span></div>)}
          </div>
        </section>

        {/* Proudly sponsored by */}
        <section className="sponsor">
          <span className="sp-band-eyebrow">Proudly sponsored by</span>
          <div className="marquee"><div className="marquee-track">{GOD_NAMES.concat(GOD_NAMES).map((n, i) => (<span className="mq-name" key={i}>{n}<span className="mq-dot" /></span>))}</div></div>
        </section>

        {/* Verse and prize */}
        <section className="statement">
          <p className="st-verse">I will bless you, and you will be a blessing.</p>
          <p className="st-ref">Genesis 12:2</p>
          <p className="st-prize">One student. <span className="accent">{prizeText}</span>. Every Friday.</p>
        </section>

        {/* Impact figures */}
        <section className="stats">
          <div className="stat"><span className="stat-num">{givenAway}</span><span className="stat-lab">Given away so far</span></div>
          <div className="stat"><span className="stat-num">{fridays}</span><span className="stat-lab">Fridays held</span></div>
          <div className="stat"><span className="stat-num">{faculties}</span><span className="stat-lab">Faculties reached</span></div>
        </section>

        {/* Covenant */}
        <section className="covenant">
          <span className="cov-eyebrow">The covenant</span>
          <div className="cov-card">
            <p className="cov-text">We know what it is to sit through a semester worrying about money, to copy notes by hand because the textbook was out of reach, and to wonder whether anyone was looking out for you. We were those students once. Manna is our way of looking out for you now.</p>
            <p className="cov-text">If your name is ever drawn, promise us one thing. When your own season of blessing comes, reach back and lift another student, the way you were lifted.</p>
            <div className="cov-signs">
              <div className="cov-sign left"><span className="sig">Victor Ijomah</span><span className="sig-line" /><span className="sig-role">Founder</span></div>
              <div className="cov-sign right"><span className="sig">Charles Sedenu</span><span className="sig-line" /><span className="sig-role">Co-founder</span></div>
            </div>
          </div>
        </section>

        {/* Wall of Thanks */}
        <section className="thanks">
          <div className="thanks-head"><h2>Our Wall of Thanks</h2><p>Words from students who won, and chose to bless someone in turn.</p></div>
          <div className="thanks-row">
            {THANKS.map((t) => (
              <div className="thanks-card" key={t.name}>
                <div className="tc-head"><span className="avatar">{initials(t.name)}</span><div><p className="tc-name">{t.name}</p><p className="tc-fac">{t.faculty}</p></div></div>
                <p className="tc-text">{t.text}</p>
                <button className="proof-btn" onClick={() => setProof(t)}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>Proof</button>
              </div>
            ))}
          </div>
          <div className="thanks-more"><a className="see-all" href="/wall-of-thanks">See all gratitudes</a></div>
        </section>

        {/* Past winners */}
        <section className="winners">
          <div className="winners-head"><h2>Past winners</h2><p>Every name here made the covenant and became a blessing to someone else.</p></div>
          <ul className="winner-grid">
            {shownWinners.map((w) => (<li className="winner-item" key={w.matric + w.date}><div className="badge"><Laurel /></div><div className="winner-body"><p className="wi-name">{w.name}</p><p className="wi-matric">{w.matric}</p><p className="wi-faculty">{w.faculty} · {w.date}</p></div><span className="wi-amount">{prizeText}</span></li>))}
          </ul>
          <div className="pager"><button className="pg-btn" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button><span className="pg-count">Page {page + 1} of {pageCount}</span><button className="pg-btn" disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</button></div>
        </section>

        {/* Partner with Manna */}
        <section className="sponsor-cta">
          <div className="sc-card">
            <span className="sc-eyebrow">Partner with Manna</span>
            <h2 className="sc-title">Become a tool in the hands of God</h2>
            <p className="sc-text">Sponsor a Friday and put {prizeText} in a student&#39;s hands. What is small to you can be the answer to someone&#39;s quiet prayer.</p>
            <button className="sc-btn" onClick={() => showToast("Sponsor page coming soon.")}>Become a sponsor</button>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq">
          <h2>Frequently asked questions</h2>
          <div className="faq-list">{FAQS.map((f, i) => (<div className={"faq-item" + (faqOpen === i ? " open" : "")} key={i}><button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}><span>{f.q}</span><svg className="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg></button>{faqOpen === i && <p className="faq-a">{f.a}</p>}</div>))}</div>
        </section>

        {/* Share */}
        <section className="share">
          <h2>Spread the blessing</h2>
          <p className="share-sub">Someone in your faculty may need this. Send it their way.</p>
          <div className="share-row">
            <a className="soc wa" href={waHref} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp"><WA /></a>
            <a className="soc fb" href={fbHref} target="_blank" rel="noreferrer" aria-label="Share on Facebook"><FB /></a>
            <a className="soc x" href={xHref} target="_blank" rel="noreferrer" aria-label="Share on X"><XI /></a>
            <a className="soc tg" href={tgHref} target="_blank" rel="noreferrer" aria-label="Share on Telegram"><TG /></a>
            <button className="soc lk" onClick={copyLink} aria-label="Copy link"><LK /></button>
          </div>
        </section>

        {/* Student tools */}
        <section className="tools">
          <div className="tools-head"><h2>Tools we have built for students</h2><p>Free helpers from myDelsu and DelsuTools to make campus life easier.</p></div>
          <div className="tools-row">
            {TOOLS.map((t) => (
              <a className="tool-card" href={t.href} target="_blank" rel="noreferrer" key={t.name}>
                <span className="tool-ic"><ToolIcon name={t.icon} /></span>
                <p className="tool-name">{t.name}</p>
                <p className="tool-desc">{t.desc}</p>
                <span className="tool-open">Open<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg></span>
              </a>
            ))}
          </div>
          <div className="tools-more"><a className="see-all" href="https://delsutools.ng/tools" target="_blank" rel="noreferrer">See all student tools</a></div>
        </section>

      </main>

      <footer className="foot"><Wheat size={20} /><p className="foot-sub">Manna, a weekly blessing from myDelsu. Free to enter, always.</p></footer>

      <div className="mobile-bar"><button className={"cta-full" + (cDone ? " done" : "")} onClick={entry}>{cDone && <Check />}{cLabel}</button></div>
    </div>
  );
}

function ToolIcon({ name }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: BLUE_DARK, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "calc") return (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></svg>);
  if (name === "target") return (<svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg>);
  if (name === "cap") return (<svg {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1 3 3 6 3s6-2 6-3v-5" /></svg>);
  if (name === "cash") return (<svg {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></svg>);
  if (name === "doc") return (<svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></svg>);
  if (name === "wallet") return (<svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1.2" /></svg>);
  return (<svg {...p}><circle cx="12" cy="12" r="9" /></svg>);
}
function Heart() { return (<svg viewBox="0 0 24 24" width="30" height="30" fill={AMBER} stroke="none"><path d="M12 21s-7.5-4.9-10-9.2C.4 8.7 2 5 5.5 5c2 0 3.4 1.2 4.5 2.6C11.1 6.2 12.5 5 14.5 5 18 5 19.6 8.7 22 11.8 19.5 16.1 12 21 12 21z" /></svg>); }
function Wheat({ size = 22 }) { return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V9" /><path d="M12 9c-2-1.5-2-4 0-6 2 2 2 4.5 0 6Z" /><path d="M12 13c-2.5-1-3.5-3-3-5.5 2.4.6 3.7 2.4 3 5.5Z" /><path d="M12 13c2.5-1 3.5-3 3-5.5-2.4.6-3.7 2.4-3 5.5Z" /><path d="M12 18c-2.5-1-3.5-3-3-5.5 2.4.6 3.7 2.4 3 5.5Z" /><path d="M12 18c2.5-1 3.5-3 3-5.5-2.4.6-3.7 2.4-3 5.5Z" /></svg>); }
function Laurel() { return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3c-3 3-3 9 2 12" /><path d="M18 3c3 3 3 9-2 12" /><path d="M8 20h8" /><path d="M12 15v5" /><circle cx="12" cy="10" r="2.4" /></svg>); }
function WA() { return (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm4.52 11.99c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.25 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" /></svg>); }
function FB() { return (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22C18.34 21.21 22 17.06 22 12.06z" /></svg>); }
function XI() { return (<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" /></svg>); }
function TG() { return (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.94 4.9L18.9 19.2c-.23 1.01-.83 1.26-1.68.78l-4.64-3.42-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73L18.4 6.9c.37-.33-.08-.51-.58-.18L7.2 13.35l-4.62-1.44c-1-.31-1.02-1 .21-1.48l18.07-6.96c.83-.31 1.56.2 1.08 2.43z" /></svg>); }
function LK() { return (<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.07 0l2-2a5 5 0 00-7.07-7.07l-1 1" /><path d="M14 11a5 5 0 00-7.07 0l-2 2a5 5 0 007.07 7.07l1-1" /></svg>); }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Dancing+Script:wght@600;700&display=swap');
.manna{ --blue:${BLUE}; --blueDark:${BLUE_DARK}; --amber:${AMBER}; --ink:#0f172a; --body:#475569; --muted:#7c8b9c; --line:#e6e9ee; --soft:#f5f7fa; font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:#fff; min-height:100%; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
.manna *{ box-sizing:border-box; }

.toast{ position:fixed; top:74px; left:50%; transform:translateX(-50%); z-index:60; background:var(--ink); color:#fff; font-size:13.5px; font-weight:600; padding:11px 18px; border-radius:11px; box-shadow:0 10px 30px rgba(15,23,42,.28); max-width:90vw; text-align:center; animation:toastIn .22s ease both; }
@keyframes toastIn{ from{ opacity:0; transform:translate(-50%,-8px);} to{ opacity:1; transform:translate(-50%,0);} }

.modal-overlay{ position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:70; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease both; }
@keyframes fadeIn{ from{ opacity:0;} to{ opacity:1;} }
.modal-close{ position:absolute; top:12px; right:12px; background:transparent; border:none; cursor:pointer; padding:4px; }
.sponsor-modal{ position:relative; background:linear-gradient(180deg,#fffdf8,#fbf6ea); border:1px solid #efe4cc; border-radius:20px; padding:34px 30px 28px; max-width:440px; width:100%; text-align:center; box-shadow:0 30px 70px rgba(15,23,42,.3); animation:pop .34s cubic-bezier(.2,1.2,.4,1) both; }
.sp-icon{ width:56px; height:56px; margin:0 auto 14px; border-radius:50%; background:#fbeed3; display:flex; align-items:center; justify-content:center; }
.sp-eyebrow{ display:block; font-size:11.5px; letter-spacing:2px; text-transform:uppercase; color:var(--amber); font-weight:800; margin-bottom:14px; }
.sp-message{ font-family:Georgia,"Times New Roman",serif; font-size:19px; line-height:1.6; color:var(--ink); margin:0 0 16px; }
.sp-verse{ font-family:Georgia,serif; font-style:italic; font-size:15px; color:var(--body); margin:0 0 18px; line-height:1.5; }
.sp-vref{ display:block; font-style:normal; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--amber); font-weight:700; margin-top:6px; }
.sp-sign{ font-family:"Dancing Script","Segoe Script",cursive; font-size:26px; color:var(--blueDark); margin:0 0 20px; }
.sp-ok{ background:var(--blue); color:#fff; border:none; border-radius:11px; padding:11px 34px; font-size:15px; font-weight:700; cursor:pointer; }
.sp-ok:hover{ background:var(--blueDark); }

.auth-modal{ position:relative; background:#fff; border:1px solid var(--line); border-radius:20px; padding:30px 28px; max-width:400px; width:100%; text-align:center; box-shadow:0 30px 70px rgba(15,23,42,.3); animation:pop .3s cubic-bezier(.2,1.2,.4,1) both; }
.am-eyebrow{ display:block; font-size:11.5px; letter-spacing:2px; text-transform:uppercase; color:var(--blue); font-weight:800; margin-bottom:12px; }
.am-text{ font-size:15px; line-height:1.6; color:var(--body); margin:0 0 22px; }
.am-actions{ display:flex; flex-direction:column; gap:10px; }
.am-primary{ background:var(--blue); color:#fff; border:none; border-radius:11px; padding:12px; font-size:15px; font-weight:700; cursor:pointer; }
.am-primary:hover{ background:var(--blueDark); }
.am-ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); border-radius:11px; padding:12px; font-size:15px; font-weight:700; cursor:pointer; }
.am-ghost:hover{ border-color:var(--blue); color:var(--blue); }

.proof-modal{ position:relative; background:#fff; border:1px solid var(--line); border-radius:20px; padding:26px 24px; max-width:400px; width:100%; box-shadow:0 30px 70px rgba(15,23,42,.3); animation:pop .3s cubic-bezier(.2,1.2,.4,1) both; }
.pf-eyebrow{ display:block; text-align:center; font-size:11.5px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; margin-bottom:16px; }
.pf-alert{ border:1px solid #dbe7dd; border-radius:14px; padding:18px 18px 12px; background:linear-gradient(180deg,#f4fbf5,#fff); }
.pf-top{ display:flex; align-items:center; justify-content:space-between; }
.pf-bank{ font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#2f7d4f; }
.pf-dot{ width:9px; height:9px; border-radius:50%; background:#37a866; }
.pf-amount{ font-size:34px; font-weight:800; color:#1e2b36; margin:8px 0 14px; letter-spacing:-.02em; }
.pf-row{ display:flex; align-items:center; justify-content:space-between; font-size:13px; padding:7px 0; border-top:1px dashed #e2ece3; color:var(--muted); }
.pf-row b{ color:var(--ink); font-weight:700; }
.pf-note{ font-size:12px; color:var(--muted); text-align:center; margin:14px 0 0; line-height:1.5; }

.nav{ position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:${BLUE}; border-bottom:1px solid rgba(255,255,255,.35); }
.logo{ display:flex; align-items:center; gap:7px; }
.logo-my{ color:#fff; font-weight:800; font-style:italic; font-size:26px; letter-spacing:-.5px; }
.logo-badge{ background:#fff; border-radius:5px; padding:2px 9px; transform:skewX(-9deg); box-shadow:0 2px 4px rgba(0,0,0,.18); }
.logo-badge-inner{ display:inline-block; transform:skewX(9deg); color:#3f6f9e; font-weight:800; font-style:italic; font-size:19px; letter-spacing:1px; }
.nav-icons{ display:flex; align-items:center; gap:14px; }
.icon-btn{ background:transparent; border:none; cursor:pointer; padding:2px; display:flex; align-items:center; }
.burger{ width:28px; height:22px; flex-direction:column; justify-content:space-between; }
.burger span{ display:block; height:3px; background:#fff; border-radius:2px; }
.burger .l1{ width:100%; } .burger .l2{ width:100%; } .burger .l3{ width:70%; align-self:flex-end; }
.header-cta{ display:inline-flex; align-items:center; gap:6px; background:#fff; color:${BLUE_DARK}; border:none; border-radius:10px; padding:9px 15px; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.12); transition:transform .12s ease, background .15s ease; }
.header-cta:hover{ transform:translateY(-1px); background:#f4f8fc; }
.header-cta.done{ background:rgba(255,255,255,.16); color:#fff; box-shadow:inset 0 0 0 1px rgba(255,255,255,.55); }
.search-row{ position:sticky; top:57px; z-index:29; background:${BLUE_DARK}; padding:10px 20px; }
.search-input{ width:100%; border:none; border-radius:10px; padding:11px 14px; font-size:15px; outline:none; }

.drawer-overlay{ position:fixed; inset:0; background:rgba(15,23,42,0); z-index:40; pointer-events:none; transition:background .3s ease; }
.drawer-overlay.open{ background:rgba(15,23,42,.4); pointer-events:auto; }
.drawer{ position:fixed; top:0; right:0; height:100%; width:290px; max-width:82vw; z-index:41; background:#fff; transform:translateX(100%); transition:transform .32s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; padding:18px 20px 24px; box-shadow:-14px 0 40px rgba(15,23,42,.14); border-left:1px solid var(--line); }
.drawer.open{ transform:translateX(0); }
.drawer-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.drawer-title{ color:var(--muted); font-size:12px; letter-spacing:3px; text-transform:uppercase; font-weight:700; }
.close{ background:transparent; border:none; cursor:pointer; padding:4px; }
.drawer-links{ list-style:none; margin:8px 0 0; padding:0; }
.drawer-links li{ border-bottom:1px solid var(--line); }
.drawer-links a{ display:block; padding:13px 4px; color:var(--ink); text-decoration:none; font-size:15.5px; font-weight:600; }
.drawer-links a:hover{ color:var(--blue); }
.drawer-cta{ margin-top:18px; text-align:center; background:var(--blue); color:#fff; border:none; font-weight:700; padding:13px; border-radius:12px; font-size:15px; cursor:pointer; }
.drawer-cta:hover{ background:var(--blueDark); }

.hero{ text-align:center; padding:52px 20px 12px; }
.hero-title{ font-size:60px; font-weight:800; letter-spacing:-.03em; margin:0; color:var(--ink); line-height:1; }
.stage{ max-width:760px; margin:0 auto; padding:20px 18px 20px; }

.draw-card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:26px 22px; box-shadow:0 1px 2px rgba(15,23,42,.05); text-align:center; }
.draw-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px; }
.eyebrow{ font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; }
.next-pill{ font-size:12px; font-weight:600; color:var(--blue); background:#eef4fb; border:1px solid #d9e6f3; padding:5px 10px; border-radius:999px; white-space:nowrap; }
.tray{ margin:18px auto 4px; padding:22px 16px 16px; background:var(--soft); border:1px solid var(--line); border-radius:16px; }
.cohort{ font-family:ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size:22px; font-weight:800; letter-spacing:3px; color:var(--ink); margin:0 0 14px; }
.cohort-sub{ font-size:13px; color:var(--muted); margin:16px 0 0; font-weight:500; }
.flip-row{ display:flex; align-items:center; justify-content:center; gap:8px; }
.flip{ --w:56px; --h:78px; --fs:44px; position:relative; width:var(--w); height:var(--h); flex:none; perspective:220px; font-family:ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
.flip .half{ position:absolute; left:0; right:0; height:50%; overflow:hidden; }
.flip .upper{ top:0; border-radius:8px 8px 0 0; background:linear-gradient(180deg,#6d99c6,#5f8dbd); }
.flip .lower{ bottom:0; border-radius:0 0 8px 8px; background:linear-gradient(180deg,#517fb0,#45709c); }
.flip .char{ position:absolute; left:0; width:100%; height:var(--h); display:flex; align-items:center; justify-content:center; color:#fff; font-size:var(--fs); font-weight:800; }
.flip .upper .char{ top:0; } .flip .lower .char{ bottom:0; }
.flip .mid{ position:absolute; left:0; right:0; top:50%; height:2px; transform:translateY(-1px); background:rgba(0,0,0,.32); z-index:6; }
.flap{ position:absolute; left:0; right:0; height:50%; overflow:hidden; backface-visibility:hidden; z-index:5; }
.flap .char{ position:absolute; left:0; width:100%; height:var(--h); display:flex; align-items:center; justify-content:center; color:#fff; font-size:var(--fs); font-weight:800; }
.upper-flap{ top:0; transform-origin:bottom; border-radius:8px 8px 0 0; background:linear-gradient(180deg,#6d99c6,#5f8dbd); animation:flipTop var(--half) ease-in forwards; }
.upper-flap .char{ top:0; }
.lower-flap{ bottom:0; transform-origin:top; border-radius:0 0 8px 8px; background:linear-gradient(180deg,#517fb0,#45709c); transform:rotateX(90deg); animation:flipBottom var(--half) ease-out var(--half) forwards; }
.lower-flap .char{ bottom:0; }
@keyframes flipTop{ from{ transform:rotateX(0);} to{ transform:rotateX(-90deg);} }
@keyframes flipBottom{ from{ transform:rotateX(90deg);} to{ transform:rotateX(0);} }

.countdown{ margin-top:16px; }
.cd-label{ display:block; font-size:12px; color:var(--muted); font-weight:600; margin-bottom:8px; }
.cd-chips{ display:flex; align-items:center; justify-content:center; gap:8px; }
.cd-chip{ font-family:ui-monospace, Menlo, Consolas, monospace; font-size:17px; font-weight:800; color:var(--ink); background:var(--soft); border:1px solid var(--line); border-radius:9px; padding:6px 9px; min-width:44px; }
.cd-chip i{ font-style:normal; font-size:11px; font-weight:600; color:var(--muted); margin-left:2px; }

.draw-btn{ margin-top:18px; border:none; cursor:pointer; background:var(--blue); color:#fff; font-weight:700; font-size:15.5px; padding:13px 40px; border-radius:12px; box-shadow:0 1px 2px rgba(15,23,42,.12); transition:background .15s ease, transform .12s ease; display:inline-flex; align-items:center; gap:7px; }
.draw-btn:hover{ background:var(--blueDark); transform:translateY(-1px); }
.draw-links{ margin-top:14px; display:flex; align-items:center; justify-content:center; gap:8px; }
.mini-link{ background:transparent; border:none; cursor:pointer; font-size:12.5px; color:var(--muted); font-weight:600; text-decoration:underline; text-underline-offset:2px; padding:2px; }
.mini-link:hover{ color:var(--blue); }
.mini-link:disabled{ opacity:.5; cursor:default; text-decoration:none; }
.mini-sep{ color:var(--line); }
.fair-text{ max-width:420px; margin:12px auto 0; font-size:12.5px; color:var(--muted); line-height:1.6; }

.winner-slot{ min-height:110px; margin-top:16px; display:flex; align-items:center; justify-content:center; }
.winner-card{ display:inline-flex; flex-direction:column; align-items:center; gap:3px; background:#eef4fb; border:1px solid #d3e2f2; border-radius:16px; padding:16px 30px; animation:pop .4s cubic-bezier(.2,1.2,.4,1) both; }
.winner-label{ font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--blue); font-weight:800; }
.winner-num{ font-family:ui-monospace, Menlo, Consolas, monospace; font-size:24px; font-weight:800; color:var(--ink); letter-spacing:1px; }
.winner-sub{ font-size:13.5px; color:var(--body); }

.sponsor{ margin-top:26px; text-align:center; }
.sp-band-eyebrow{ display:block; font-size:11.5px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; margin-bottom:12px; }
.marquee{ overflow:hidden; border-top:1px solid var(--line); border-bottom:1px solid var(--line); background:#fbfcfe; padding:14px 0; }
.marquee-track{ display:inline-flex; white-space:nowrap; animation:scrollx 55s linear infinite; }
.mq-name{ display:inline-flex; align-items:center; font-family:Georgia,serif; font-style:italic; font-size:17px; color:var(--blueDark); }
.mq-dot{ display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--amber); margin:0 20px; }
@keyframes scrollx{ from{ transform:translateX(0);} to{ transform:translateX(-50%);} }

.statement{ text-align:center; padding:40px 20px 8px; }
.st-verse{ font-family:Georgia,"Times New Roman",serif; font-style:italic; font-size:23px; color:var(--ink); margin:0; line-height:1.4; }
.st-ref{ font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--blue); margin:12px 0 0; }
.st-prize{ font-size:19px; font-weight:700; color:var(--body); margin:20px 0 0; }
.st-prize .accent{ color:var(--blue); }

.stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; padding:28px 0 8px; margin-top:20px; }
.stat{ text-align:center; border:1px solid var(--line); border-radius:16px; padding:22px 10px; background:#fbfcfe; }
.stat-num{ display:block; font-size:30px; font-weight:800; letter-spacing:-.02em; color:var(--ink); }
.stat-lab{ display:block; font-size:12.5px; color:var(--muted); margin-top:6px; font-weight:600; }

.covenant{ padding:40px 0 8px; border-top:1px solid var(--line); margin-top:36px; }
.cov-eyebrow{ display:block; text-align:center; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-weight:800; margin-bottom:16px; }
.cov-card{ background:#fbfaf5; border:1px solid #ece7da; border-radius:18px; padding:34px 32px; box-shadow:0 1px 2px rgba(15,23,42,.04); }
.cov-text{ font-family:"Caveat","Segoe Script","Bradley Hand",cursive; font-size:26px; line-height:1.5; color:#2b3542; margin:0 0 16px; }
.cov-signs{ display:flex; justify-content:space-between; gap:16px; margin-top:30px; }
.cov-sign{ display:flex; flex-direction:column; min-width:0; }
.cov-sign.left{ align-items:flex-start; text-align:left; }
.cov-sign.right{ align-items:flex-end; text-align:right; }
.sig{ font-family:"Dancing Script","Segoe Script",cursive; font-size:34px; font-weight:700; color:#20364e; line-height:1; white-space:nowrap; }
.sig-line{ width:150px; max-width:40vw; height:1px; background:#c9c2b0; margin:10px 0 7px; }
.sig-role{ font-size:12px; color:var(--muted); }

.thanks{ padding:40px 0 8px; border-top:1px solid var(--line); margin-top:36px; }
.thanks-head{ text-align:center; margin-bottom:20px; }
.thanks-head h2{ font-size:28px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.thanks-head p{ font-size:14.5px; color:var(--muted); margin:0; }
.thanks-row{ display:flex; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; padding:4px 2px 14px; -webkit-overflow-scrolling:touch; }
.thanks-row::-webkit-scrollbar{ height:6px; }
.thanks-row::-webkit-scrollbar-thumb{ background:#dfe5ec; border-radius:6px; }
.thanks-card{ scroll-snap-align:start; flex:0 0 300px; max-width:300px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px; display:flex; flex-direction:column; }
.tc-head{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.avatar{ width:44px; height:44px; flex:none; border-radius:50%; background:linear-gradient(180deg,#6d99c6,#5f8dbd); color:#fff; font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; letter-spacing:.5px; }
.tc-name{ font-weight:700; font-size:15px; margin:0; }
.tc-fac{ font-size:12px; color:var(--muted); margin:2px 0 0; }
.tc-text{ font-size:14px; line-height:1.6; color:var(--body); margin:0 0 16px; flex:1; }
.proof-btn{ align-self:flex-start; display:inline-flex; align-items:center; gap:6px; background:#eef4fb; color:var(--blueDark); border:1px solid #d9e6f3; border-radius:9px; padding:8px 14px; font-size:13px; font-weight:700; cursor:pointer; }
.proof-btn:hover{ background:#e3eef9; }
.thanks-more{ text-align:center; margin-top:18px; }
.see-all{ display:inline-block; text-decoration:none; color:var(--blueDark); border:1px solid var(--line); border-radius:11px; padding:11px 22px; font-size:14.5px; font-weight:700; }
.see-all:hover{ border-color:var(--blue); color:var(--blue); }

.winners{ padding:40px 0 8px; border-top:1px solid var(--line); margin-top:36px; }
.winners-head{ text-align:center; margin-bottom:22px; }
.winners-head h2{ font-size:28px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.winners-head p{ font-size:14.5px; color:var(--muted); margin:0; }
.winner-grid{ list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.winner-item{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 16px; transition:box-shadow .15s ease, transform .15s ease; }
.winner-item:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(15,23,42,.07); }
.badge{ width:44px; height:44px; flex:none; border-radius:50%; background:#eef4fb; display:flex; align-items:center; justify-content:center; border:1px solid #dbe7f3; }
.winner-body{ flex:1; min-width:0; }
.wi-name{ font-weight:700; font-size:15px; margin:0; }
.wi-matric{ font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12.5px; color:var(--blue); margin:2px 0 0; }
.wi-faculty{ font-size:12px; color:var(--muted); margin:2px 0 0; }
.wi-amount{ font-weight:800; color:#2f7d4f; font-size:15px; white-space:nowrap; }
.pager{ display:flex; align-items:center; justify-content:center; gap:16px; margin-top:22px; }
.pg-btn{ background:#fff; border:1px solid var(--line); border-radius:10px; padding:9px 16px; font-size:14px; font-weight:600; color:var(--ink); cursor:pointer; transition:border-color .15s, color .15s; }
.pg-btn:hover:not(:disabled){ border-color:var(--blue); color:var(--blue); }
.pg-btn:disabled{ opacity:.45; cursor:default; }
.pg-count{ font-size:13.5px; color:var(--muted); font-weight:500; }

.faq{ padding:40px 0 8px; border-top:1px solid var(--line); margin-top:36px; }
.faq h2{ font-size:26px; font-weight:800; letter-spacing:-.02em; margin:0 0 18px; }
.faq-list{ border-top:1px solid var(--line); }
.faq-item{ border-bottom:1px solid var(--line); }
.faq-q{ width:100%; background:transparent; border:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:14px; padding:18px 2px; font-size:16px; font-weight:600; color:var(--ink); text-align:left; }
.faq-q .chev{ color:var(--muted); transition:transform .2s ease; flex:none; }
.faq-item.open .faq-q .chev{ transform:rotate(180deg); color:var(--blue); }
.faq-a{ margin:0; padding:0 2px 20px; font-size:15px; line-height:1.65; color:var(--body); max-width:640px; }

.share{ text-align:center; padding:40px 0 8px; border-top:1px solid var(--line); margin-top:36px; }
.share h2{ font-size:24px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.share-sub{ font-size:14px; color:var(--muted); margin:0 0 18px; }
.share-row{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.soc{ width:46px; height:46px; border-radius:50%; border:1px solid var(--line); background:#fff; color:var(--ink); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:transform .12s ease, border-color .15s, color .15s; }
.soc:hover{ transform:translateY(-2px); }
.soc.wa:hover{ color:#25d366; border-color:#25d366; }
.soc.fb:hover{ color:#1877f2; border-color:#1877f2; }
.soc.x:hover{ color:#000; border-color:#000; }
.soc.tg:hover{ color:#29a9eb; border-color:#29a9eb; }
.soc.lk:hover{ color:var(--blue); border-color:var(--blue); }

.tools{ padding:40px 0 8px; border-top:1px solid var(--line); margin-top:36px; }
.tools-head{ text-align:center; margin-bottom:20px; }
.tools-head h2{ font-size:26px; font-weight:800; letter-spacing:-.02em; margin:0 0 6px; }
.tools-head p{ font-size:14.5px; color:var(--muted); margin:0; }
.tools-row{ display:flex; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; padding:4px 2px 14px; -webkit-overflow-scrolling:touch; }
.tools-row::-webkit-scrollbar{ height:6px; }
.tools-row::-webkit-scrollbar-thumb{ background:#dfe5ec; border-radius:6px; }
.tool-card{ scroll-snap-align:start; flex:0 0 220px; max-width:220px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px; text-decoration:none; display:flex; flex-direction:column; transition:box-shadow .15s ease, transform .15s ease, border-color .15s; }
.tool-card:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(15,23,42,.08); border-color:#d9e6f3; }
.tool-ic{ width:44px; height:44px; border-radius:12px; background:#eef4fb; border:1px solid #dbe7f3; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
.tool-name{ font-weight:800; font-size:15.5px; color:var(--ink); margin:0 0 4px; }
.tool-desc{ font-size:13px; color:var(--muted); line-height:1.5; margin:0 0 14px; flex:1; }
.tool-open{ display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:var(--blueDark); }
.tools-more{ text-align:center; margin-top:18px; }

.sponsor-cta{ padding:44px 0 8px; margin-top:36px; }
.sc-card{ background:linear-gradient(160deg,#eef4fb,#fbfcfe); border:1px solid #d9e6f3; border-radius:20px; padding:38px 30px; text-align:center; }
.sc-eyebrow{ display:block; font-size:11.5px; letter-spacing:2px; text-transform:uppercase; color:var(--blue); font-weight:800; margin-bottom:12px; }
.sc-title{ font-size:27px; font-weight:800; letter-spacing:-.02em; margin:0 0 12px; color:var(--ink); }
.sc-text{ font-size:15px; line-height:1.65; color:var(--body); margin:0 auto 22px; max-width:460px; }
.sc-btn{ background:var(--blue); color:#fff; border:none; border-radius:12px; padding:13px 34px; font-size:15.5px; font-weight:700; cursor:pointer; }
.sc-btn:hover{ background:var(--blueDark); }

.foot{ text-align:center; padding:38px 20px 46px; margin-top:44px; border-top:1px solid var(--line); background:var(--soft); }
.foot-sub{ font-size:12.5px; color:var(--muted); margin:10px 0 0; }

.mobile-bar{ display:none; }
.cta-full{ width:100%; display:inline-flex; align-items:center; justify-content:center; gap:7px; background:var(--blue); color:#fff; border:none; border-radius:12px; padding:14px; font-size:15.5px; font-weight:700; cursor:pointer; }
.cta-full.done{ background:#eef4fb; color:var(--blue); border:1px solid #cfe0f0; }

.confetti-layer{ position:fixed; inset:0; pointer-events:none; z-index:50; overflow:hidden; }
.confetti-piece{ position:absolute; top:-6vh; animation-name:fall; animation-timing-function:linear; animation-fill-mode:forwards; }
@keyframes fall{ 0%{ transform:translateY(0) rotate(0); opacity:1;} 100%{ transform:translateY(112vh) rotate(680deg); opacity:0;} }
@keyframes pop{ 0%{ transform:scale(.8); opacity:0;} 100%{ transform:scale(1); opacity:1;} }

@media (max-width:600px){
  .hero-title{ font-size:44px; }
  .flip{ --w:42px; --h:58px; --fs:32px; }
  .flip-row{ gap:6px; }
  .cohort{ font-size:19px; }
  .winner-grid{ grid-template-columns:1fr; }
  .draw-head{ flex-direction:column; gap:8px; }
  .st-verse{ font-size:20px; }
  .cov-card{ padding:24px 18px; }
  .cov-text{ font-size:22px; }
  .cov-signs{ gap:10px; }
  .sig{ font-size:23px; }
  .sig-line{ width:110px; }
  .stat-num{ font-size:23px; }
  .stat{ padding:18px 6px; }
  .header-cta{ display:none; }
  .mobile-bar{ display:flex; position:fixed; bottom:0; left:0; right:0; z-index:35; background:#fff; border-top:1px solid var(--line); padding:10px 14px; box-shadow:0 -6px 20px rgba(15,23,42,.08); }
  .manna{ padding-bottom:72px; }
  .toast{ top:auto; bottom:84px; }
}
@media (prefers-reduced-motion: reduce){
  .upper-flap, .lower-flap{ animation-duration:.01ms !important; }
  .marquee-track{ animation:none; }
  .confetti-piece{ display:none; }
}
`;
