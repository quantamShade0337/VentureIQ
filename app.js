// VentureIQ Dashboard — app.js
// Loaded via Babel standalone in app.html

const { useState, useRef, useEffect, useCallback } = React;

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const A    = "#00C8B4";
const GOLD = "#F5C842";
const RED  = "#F06060";
const AMB  = "#F09240";
const PUR  = "#9B7FFF";

const GRADS = [
  ["#FF5B5B","#FF8C00"],["#1A6FC4","#00B4D8"],["#6C3CE4","#9F60E8"],
  ["#007BFF","#00C9FF"],["#E84393","#FF6B6B"],["#00B09B","#96C93D"],
  ["#8E44AD","#C0392B"],["#2C3E50","#4CA1AF"],
];

const EXAMPLES = [
  "AI legal contract reviewer for SMBs",
  "Personalised fitness coaching app",
  "B2B expense management with AI",
  "No-code data pipeline builder",
  "Sleep tracking wearable for teens",
];

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  ideaLabel:"AI Note-Taking for Remote Teams",
  market:{
    saturation:74,opportunityScore:8.2,trendVelocity:2.4,trendDirection:"Rising",
    summary:"The AI productivity tools market is heavily contested but growing at 2.4× MoM. Incumbents like Notion and Otter.ai dominate, yet deep AI integration and mobile-first gaps create a genuine entry window for focused challengers.",
  },
  competitors:[
    {name:"Notion AI",domain:"notion.so",initial:"N",gradA:"#FF5B5B",gradB:"#FF8C00",threatScore:9.4,traffic:"48.2M/mo",funding:"$343M",pricing:"$8–16/mo",strengthLabel:"Very High",stack:"React, Node.js, AWS",productHunt:"#1 of day",hiring:"12 open",fundingStage:"Series C",weakness:"Steep learning curve for new users",founded:"2016",social:"2.1M"},
    {name:"Otter.ai",domain:"otter.ai",initial:"O",gradA:"#1A6FC4",gradB:"#00B4D8",threatScore:7.6,traffic:"8.7M/mo",funding:"$63M",pricing:"$10–20/mo",strengthLabel:"High",stack:"Python, TensorFlow, GCP",productHunt:"Top 5 Voice AI",hiring:"5 open",fundingStage:"Series B",weakness:"Limited note editing beyond transcription",founded:"2018",social:"320K"},
    {name:"Fireflies.ai",domain:"fireflies.ai",initial:"F",gradA:"#6C3CE4",gradB:"#9F60E8",threatScore:6.8,traffic:"3.1M/mo",funding:"$19M",pricing:"Free–$19/mo",strengthLabel:"Moderate",stack:"Node.js, MongoDB, GCP",productHunt:"Top 10 AI Tools",hiring:"2 open",fundingStage:"Series A",weakness:"Weak consumer brand identity",founded:"2016",social:"180K"},
    {name:"Mem.ai",domain:"mem.ai",initial:"M",gradA:"#007BFF",gradB:"#00C9FF",threatScore:5.9,traffic:"1.2M/mo",funding:"$23.5M",pricing:"$14.99/mo",strengthLabel:"Low",stack:"Next.js, TypeScript, AWS",productHunt:"#3 Product of Week",hiring:"1 open",fundingStage:"Seed",weakness:"Slow feature velocity for a small team",founded:"2020",social:"95K"},
  ],
  domain:{
    suggestedBrand:"noteflow",brandability:88,cleanBrand:71,
    extensions:[
      {ext:".ai",available:true,price:"$89/yr"},{ext:".io",available:true,price:"$49/yr"},
      {ext:".com",available:false,price:"Taken"},{ext:".app",available:true,price:"$19/yr"},
      {ext:".co",available:false,price:"Taken"},
    ],
    suggestions:["getnoteflow.io","noteflow.app","trynoteflow.ai","noteflowapp.io","myflownotes.com"],
    trademarkNote:'"Noteflow" may conflict with a software trademark registered in the US (Class 42, 2021). Consult an attorney before brand investment.',
  },
  trends:{
    momentum:72,direction:"Rising",
    channels:[
      {name:"Reddit",pct:84,desc:"r/productivity surging — AI notes trending this week."},
      {name:"Hacker News",pct:31,desc:"3 Ask HN threads in 30 days, moderate engagement."},
      {name:"X / Twitter",pct:127,desc:"#AINotes trending, influencer coverage accelerating."},
      {name:"Google Trends",pct:56,desc:'"AI meeting notes" search volume 2.4× YoY.'},
      {name:"Product Hunt",pct:72,desc:"Productivity AI category grew 72% QoQ."},
    ],
    months:["Oct","Nov","Dec","Jan","Feb","Mar"],
    series:{reddit:[30,38,45,55,72,88],hn:[20,22,28,30,38,42],twitter:[40,48,52,65,88,100],ph:[15,20,25,28,38,50]},
  },
  competitive:{
    topCompetitor:"Notion AI",
    radarLabels:["UX","SEO","Community","Pricing","AI Depth","Mobile"],
    radarComp:[0.92,0.87,0.81,0.74,0.68,0.59],
    radarMarket:[0.60,0.55,0.50,0.60,0.58,0.52],
    advantages:[
      {area:"UX & Design",score:9.2,isOpportunity:false,desc:"Industry-leading design system — very hard to match."},
      {area:"SEO & Content",score:8.7,isOpportunity:false,desc:"Thousands of template pages capturing long-tail search."},
      {area:"Community & PLG",score:8.1,isOpportunity:false,desc:"Massive creator ecosystem with strong network effects."},
      {area:"Pricing Strategy",score:7.4,isOpportunity:false,desc:"Freemium drives ~40% paid conversion. Your gap: 2.6 pts."},
      {area:"AI Depth",score:6.8,isOpportunity:true,desc:"Integrations are surface-level. Strike here with deeper AI."},
      {area:"Mobile Experience",score:5.9,isOpportunity:true,desc:"Clear weakness — a mobile-first approach could differentiate."},
    ],
  },
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM = `You are a startup intelligence API. Do exactly ONE focused web search to gather current market data for the idea, then immediately return ONLY valid JSON — no markdown fences, no commentary whatsoever.

Required JSON schema:
{
  "ideaLabel":"<3-6 word title>",
  "market":{"saturation":<0-100>,"opportunityScore":<0.0-10.0>,"trendVelocity":<float>,"trendDirection":"Rising"|"Stable"|"Declining","summary":"<2 concise sentences>"},
  "competitors":[{"name":"","domain":"","initial":"","gradA":"<hex>","gradB":"<hex>","threatScore":<0-10>,"traffic":"","funding":"","pricing":"","strengthLabel":"Very High"|"High"|"Moderate"|"Low","stack":"","productHunt":"","hiring":"","fundingStage":"","weakness":"","founded":"","social":""}],
  "domain":{"suggestedBrand":"<short single word>","brandability":<0-100>,"cleanBrand":<0-100>,"extensions":[{"ext":".com","available":<bool>,"price":""},{"ext":".io","available":<bool>,"price":""},{"ext":".ai","available":<bool>,"price":""},{"ext":".app","available":<bool>,"price":""},{"ext":".co","available":<bool>,"price":""}],"suggestions":["","","","",""],"trademarkNote":"<string or null>"},
  "trends":{"momentum":<0-100>,"direction":"Rising"|"Stable"|"Declining","channels":[{"name":"Reddit","pct":<int>,"desc":""},{"name":"Hacker News","pct":<int>,"desc":""},{"name":"X / Twitter","pct":<int>,"desc":""},{"name":"Google Trends","pct":<int>,"desc":""},{"name":"Product Hunt","pct":<int>,"desc":""}],"months":["Oct","Nov","Dec","Jan","Feb","Mar"],"series":{"reddit":[<6 ints>],"hn":[<6 ints>],"twitter":[<6 ints>],"ph":[<6 ints>]}},
  "competitive":{"topCompetitor":"","radarLabels":["UX","SEO","Community","Pricing","AI Depth","Mobile"],"radarComp":[<6 floats 0-1>],"radarMarket":[<6 floats 0-1>],"advantages":[{"area":"","score":<0-10>,"isOpportunity":<bool>,"desc":""}]}
}
Return exactly 4 competitors and exactly 6 advantage areas. Search once, return JSON immediately.`;

// ─── SCAN ─────────────────────────────────────────────────────────────────────
async function runScan(idea) {
  let messages = [{role:"user",content:`Research this startup idea and return the JSON report: "${idea}"`}];
  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:3000, system:SYSTEM,
        tools:[{type:"web_search_20250305",name:"web_search"}], messages,
      }),
    });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
    const data = await res.json();
    if (data.stop_reason === "end_turn") {
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      return parseJSON(text);
    }
    if (data.stop_reason === "tool_use") {
      messages.push({role:"assistant",content:data.content});
      const results = (data.content||[]).filter(b=>b.type==="tool_use").map(b=>({type:"tool_result",tool_use_id:b.id,content:""}));
      if (results.length) messages.push({role:"user",content:results});
      continue;
    }
    const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    if (text) return parseJSON(text);
    throw new Error(`Unexpected stop: ${data.stop_reason}`);
  }
  throw new Error("Could not complete scan");
}

function parseJSON(raw) {
  const clean = raw.replace(/```(?:json)?/gi,"").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s===-1||e===-1) throw new Error("No JSON in response");
  return JSON.parse(clean.slice(s,e+1));
}

// ─── THEME ────────────────────────────────────────────────────────────────────
function useTheme(dark) {
  return dark ? {
    bg:"#0F0F1A", surface:"#17172A", card:"#1D1D32", cardHi:"#252540",
    border:"rgba(255,255,255,0.06)", borderHi:"rgba(255,255,255,0.14)",
    text:"#EEEEF8", t2:"rgba(238,238,248,0.55)", t3:"rgba(238,238,248,0.28)",
    inputBg:"#141426", dark:true,
  } : {
    bg:"#F3F3FA", surface:"#EAEAF5", card:"#FFFFFF", cardHi:"#F8F8FF",
    border:"rgba(0,0,0,0.07)", borderHi:"rgba(0,0,0,0.14)",
    text:"#111120", t2:"rgba(17,17,32,0.52)", t3:"rgba(17,17,32,0.3)",
    inputBg:"#EEEEFA", dark:false,
  };
}

const SC = v => v>=8 ? RED : v>=6.5 ? AMB : A;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById("viq-css")) return;
  const el = document.createElement("style");
  el.id = "viq-css";
  el.textContent = `
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { scroll-behavior:smooth; }
    ::-webkit-scrollbar { width:4px; height:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(0,200,180,.22); border-radius:4px; }
    @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes pulseDot{ 0%,100%{box-shadow:0 0 0 0 rgba(0,200,180,.45)} 50%{box-shadow:0 0 0 6px rgba(0,200,180,0)} }
    @keyframes slideToast { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
    .viq-card:hover   { transform:translateY(-2px)!important; box-shadow:0 14px 36px rgba(0,0,0,.2)!important; }
    .viq-nav:hover    { background:rgba(0,200,180,.07)!important; }
    .viq-pill:hover   { border-color:#00C8B4!important; color:#00C8B4!important; }
    .viq-btn-p:hover:not(:disabled) { transform:translateY(-1px)!important; box-shadow:0 7px 22px rgba(0,200,180,.42)!important; }
    .viq-domain:hover { transform:scale(1.03); }
    .viq-sec { animation: fadeUp .45s ease both; }
  `;
  document.head.appendChild(el);
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IC = {
  idea:   `<circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3"/>`,
  domain: `<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2a9 9 0 010 12M8 2a9 9 0 000 12"/>`,
  intel:  `<rect x="1" y="9" width="3" height="6" rx="1"/><rect x="6.5" y="5.5" width="3" height="9.5" rx="1"/><rect x="12" y="2" width="3" height="13" rx="1"/>`,
  trends: `<polyline points="1,12 6,7 10,10 15,4"/><polyline points="11,4 15,4 15,8"/>`,
  win:    `<polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5"/><polygon points="8,5 12,7 12,11 8,13 4,11 4,7"/>`,
  report: `<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h4"/>`,
  bell:   `<path d="M8 1a4 4 0 00-4 4c0 4-1.5 5-1.5 5h11S13 9 13 5a4 4 0 00-4-4z"/><path d="M9.3 13a1.7 1.7 0 01-2.6 0"/>`,
  sun:    `<circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 12.5V14M1 8h1.5M12.5 8H14M3.05 3.05l1.06 1.06M10.9 10.9l1.05 1.05M10.95 3.05 9.9 4.1M4.1 10.9 3.05 10.95"/>`,
  signal: `<polyline points="1,12 5,7 9,9.5 15,3"/><circle cx="15" cy="3" r="1.5" fill="currentColor" stroke="none"/>`,
  spark:  `<path d="M8 1l1.8 4.5L14 7l-4.2 2.5L8 15l-1.8-5.5L2 7l4.2-2.5z"/>`,
  info:   `<circle cx="8" cy="8" r="6.5"/><path d="M8 6v.5M8 9v3"/>`,
  lock:   `<rect x="3" y="8" width="10" height="7" rx="1.5"/><path d="M5.5 8V5.5a2.5 2.5 0 015 0V8"/>`,
  chevL:  `<path d="M10 3L5 8l5 5"/>`,
  chevR:  `<path d="M6 3l5 5-5 5"/>`,
  home:   `<path d="M2 8L8 2l6 6"/><path d="M4 7v7h3v-4h2v4h3V7"/>`,
  ext:    `<path d="M8 2v10M4 8l4 4 4-4"/><path d="M2 13h12"/>`,
};

const Ico = ({path,size=16,col,opacity=1,stroke}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
    stroke={stroke||col||"currentColor"} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round"
    style={{flexShrink:0,opacity}}
    dangerouslySetInnerHTML={{__html:path}}/>
);

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const Badge = ({dir,lg}) => {
  const m = {
    Rising:  {bg:"rgba(0,200,180,.1)", col:A,   sym:"▲"},
    Declining:{bg:"rgba(240,96,96,.1)",col:RED,  sym:"▼"},
    Stable:  {bg:"rgba(240,146,64,.1)",col:AMB,  sym:"●"},
  }[dir]||{bg:"rgba(0,200,180,.1)",col:A,sym:"▲"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:lg?"5px 12px":"3px 9px",borderRadius:6,fontSize:lg?11:9.5,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",background:m.bg,color:m.col}}>
      <span style={{fontSize:lg?9:7}}>{m.sym}</span>{dir}
    </span>
  );
};

const Tag = ({children,v="n",T}) => {
  const s = {
    g:  {bg:"rgba(0,200,180,.1)", col:A,    b:`1px solid rgba(0,200,180,.22)`},
    r:  {bg:"rgba(240,96,96,.1)", col:RED,  b:`1px solid rgba(240,96,96,.22)`},
    go: {bg:"rgba(245,200,66,.1)",col:GOLD, b:`1px solid rgba(245,200,66,.22)`},
    p:  {bg:"rgba(155,127,255,.1)",col:PUR, b:`1px solid rgba(155,127,255,.22)`},
    n:  {bg:T?.surface,col:T?.t2,           b:`1px solid ${T?.border}`},
  }[v]||{};
  return <span style={{display:"inline-flex",padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:600,whiteSpace:"nowrap",background:s.bg,color:s.col,border:s.b}}>{children}</span>;
};

const SL = ({children,T,mb=7}) => (
  <div style={{fontSize:9.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:T.t3,marginBottom:mb}}>{children}</div>
);

const Panel = ({children,T,style={}}) => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"22px 24px",boxShadow:`0 2px 10px rgba(0,0,0,.07)`,...style}}>
    {children}
  </div>
);

const SecHd = ({icon,title,sub,T}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
    <div style={{width:30,height:30,borderRadius:9,background:`rgba(0,200,180,.1)`,border:`1px solid rgba(0,200,180,.2)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Ico path={icon} size={14} col={A}/>
    </div>
    <div>
      <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,color:T.text,letterSpacing:"-.01em"}}>{title}</div>
      {sub && <div style={{fontSize:11,color:T.t3,marginTop:1}}>{sub}</div>}
    </div>
  </div>
);

const Tip = ({msg,T}) => (
  <div style={{marginTop:10,padding:"9px 13px",background:T.surface,borderRadius:10,display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:T.t3,lineHeight:1.5}}>
    <Ico path={IC.info} size={12} col={T.t3} opacity={.7}/>
    {msg}
  </div>
);

// ─── KPI TILE ─────────────────────────────────────────────────────────────────
const KpiTile = ({label,val,suf,desc,col,pct,T,tip}) => {
  const [show,setShow] = useState(false);
  return (
    <div style={{padding:"20px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,position:"relative",overflow:"visible",cursor:tip?"help":"default"}}
      onMouseEnter={()=>tip&&setShow(true)} onMouseLeave={()=>setShow(false)}>
      <div style={{position:"absolute",inset:0,borderRadius:14,background:`radial-gradient(circle at 100% 0%,${col}13 0%,transparent 60%)`,pointerEvents:"none"}}/>
      {show&&tip&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:60,background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:10,padding:"10px 13px",fontSize:11.5,color:T.t2,lineHeight:1.55,boxShadow:"0 8px 24px rgba(0,0,0,.2)",pointerEvents:"none"}}>
          {tip}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
        <SL T={T} mb={0}>{label}</SL>
        {tip && <Ico path={IC.info} size={11} col={T.t3}/>}
      </div>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:34,fontWeight:500,lineHeight:1,letterSpacing:"-.03em",color:col,margin:"9px 0 5px"}}>
        {val}<span style={{fontSize:13,opacity:.4,fontWeight:400,marginLeft:1}}>{suf}</span>
      </div>
      <div style={{fontSize:11.5,color:T.t2,marginBottom:14}}>{desc}</div>
      <div style={{height:2,background:T.card,borderRadius:1,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:1,background:col,width:`${pct}%`,transition:"width 1.3s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
    </div>
  );
};

// ─── SHIMMER / SKELETON ───────────────────────────────────────────────────────
const Shimmer = ({T,w="100%",h=14,r=6}) => (
  <div style={{width:w,height:h,borderRadius:r,background:T.surface,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${T.cardHi},transparent)`,animation:"shimmer 1.5s infinite"}}/>
  </div>
);

const SkeletonPanel = ({T}) => (
  <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px"}}>
          <Shimmer T={T} w="50%" h={9} r={4}/>
          <div style={{margin:"12px 0 8px"}}><Shimmer T={T} w="55%" h={32} r={6}/></div>
          <Shimmer T={T} w="75%" h={9} r={4}/>
          <div style={{marginTop:14}}><Shimmer T={T} h={2} r={1}/></div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"15px"}}>
          <div style={{display:"flex",gap:9,marginBottom:11,alignItems:"center"}}>
            <Shimmer T={T} w={34} h={34} r={9}/>
            <div style={{flex:1}}><Shimmer T={T} w="60%" h={11} r={3}/><div style={{marginTop:5}}><Shimmer T={T} w="40%" h={9} r={3}/></div></div>
          </div>
          {[0,1].map(j=><div key={j} style={{marginBottom:7}}><Shimmer T={T} w="38%" h={8} r={3}/><div style={{marginTop:3}}><Shimmer T={T} w="65%" h={11} r={3}/></div></div>)}
        </div>
      ))}
    </div>
  </div>
);

// ─── SCAN PROGRESS ────────────────────────────────────────────────────────────
const ScanProgress = ({loading,T}) => {
  const [pct,setPct] = useState(0);
  const [step,setStep] = useState(0);
  const steps = ["Searching the web for live market data…","Identifying top competitors…","Analysing trend signals…","Compiling your intelligence report…"];
  useEffect(()=>{
    if (!loading) { setPct(0); setStep(0); return; }
    const id  = setInterval(()=>setPct(p=>p>=91?91:p+(91-p)*.05+.3),250);
    const sid = setInterval(()=>setStep(s=>Math.min(s+1,steps.length-1)),4200);
    return ()=>{ clearInterval(id); clearInterval(sid); };
  },[loading]);
  if (!loading) return null;
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 22px",marginBottom:20,animation:"fadeIn .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:A,animation:"pulseDot 1.8s infinite",flexShrink:0}}/>
        <span style={{fontSize:13,color:T.t2,fontWeight:500,flex:1}}>{steps[step]}</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:A,fontWeight:500}}>{Math.round(pct)}%</span>
      </div>
      <div style={{height:3,background:T.surface,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${A},${GOLD})`,borderRadius:2,width:`${pct}%`,transition:"width .6s ease"}}/>
      </div>
    </div>
  );
};

// ─── TREND CHART ──────────────────────────────────────────────────────────────
const TrendChart = ({series,months,dark,T}) => {
  const W=540,H=168,pad={l:36,r:10,t:8,b:26};
  const cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  const gc=dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)";
  const lc=dark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)";
  const sets=[{k:"reddit",c:A},{k:"hn",c:GOLD},{k:"twitter",c:PUR},{k:"ph",c:AMB}];
  const tx=(i,n)=>pad.l+(cw/(n-1))*i;
  const ty=v=>pad.t+ch-(v/100)*ch;
  const curve=pts=>{
    let d=`M ${pts[0].x},${pts[0].y}`;
    for(let i=1;i<pts.length;i++){const p=pts[i],pp=pts[i-1],cx=(pp.x+p.x)/2;d+=` C ${cx},${pp.y} ${cx},${p.y} ${p.x},${p.y}`;}
    return d;
  };
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>{sets.map((s,i)=><linearGradient key={i} id={`tg${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.c} stopOpacity=".13"/><stop offset="100%" stopColor={s.c} stopOpacity="0"/></linearGradient>)}</defs>
      {[0,1,2,3,4].map(i=><line key={i} x1={pad.l} y1={pad.t+(ch/4)*i} x2={W-pad.r} y2={pad.t+(ch/4)*i} stroke={gc} strokeWidth="1"/>)}
      {[100,75,50,25,0].map((v,i)=><text key={i} x={pad.l-5} y={pad.t+(ch/4)*i+4} textAnchor="end" fontSize="9.5" fontFamily="'DM Mono',monospace" fill={lc}>{v}</text>)}
      {(months||[]).map((m,i)=><text key={i} x={tx(i,months.length)} y={H-4} textAnchor="middle" fontSize="9.5" fontFamily="'DM Mono',monospace" fill={lc}>{m}</text>)}
      {sets.map((s,si)=>{
        const d=(series||{})[s.k]||[0,0,0,0,0,0];
        const pts=d.map((v,i)=>({x:tx(i,d.length),y:ty(v)}));
        const lp=curve(pts);
        const ap=lp+` L ${pts[pts.length-1].x},${pad.t+ch} L ${pts[0].x},${pad.t+ch} Z`;
        return(<g key={si}><path d={ap} fill={`url(#tg${si})`}/><path d={lp} fill="none" stroke={s.c} strokeWidth="1.8" strokeLinecap="round"/>{pts.map((p,pi)=><circle key={pi} cx={p.x} cy={p.y} r="2.5" fill={s.c} stroke={dark?"#1D1D32":"#fff"} strokeWidth="1.5"/>)}</g>);
      })}
    </svg>
  );
};

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
const RadarChart = ({labels,comp,market,dark}) => {
  const W=280,H=238,cx=W/2,cy=H/2+4,R=78,N=(labels||[]).length||6;
  const gc=dark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)";
  const lc=dark?"rgba(255,255,255,.4)":"rgba(0,0,0,.4)";
  const pt=(i,v)=>{const a=(Math.PI*2/N)*i-Math.PI/2;return{x:cx+Math.cos(a)*R*v,y:cy+Math.sin(a)*R*v};};
  const poly=s=>(s||[]).map((v,i)=>{const p=pt(i,v);return`${p.x},${p.y}`;}).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      {[.25,.5,.75,1].map(r=><polygon key={r} points={poly((labels||[]).map(()=>r))} fill="none" stroke={gc} strokeWidth="1"/>)}
      {(labels||[]).map((_,i)=>{const p=pt(i,1);return<line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={gc} strokeWidth="1"/>;}) }
      <polygon points={poly(market)} fill="rgba(245,200,66,.08)" stroke="rgba(245,200,66,.35)" strokeWidth="1.5"/>
      <polygon points={poly(comp)}   fill="rgba(0,200,180,.1)"  stroke={A} strokeWidth="2"/>
      {(comp||[]).map((v,i)=>{const p=pt(i,v);return<circle key={i} cx={p.x} cy={p.y} r="3" fill={A} stroke={dark?"#1D1D32":"#fff"} strokeWidth="1.5"/>;}) }
      {(labels||[]).map((l,i)=>{const p=pt(i,1.28);return<text key={i} x={p.x} y={p.y+4} textAnchor="middle" fontSize="10.5" fontWeight="600" fontFamily="'DM Sans',sans-serif" fill={lc}>{l}</text>;}) }
    </svg>
  );
};

// ─── COMPETITOR CARD (compact) ────────────────────────────────────────────────
const CompCard = ({c,T}) => {
  const [hov,setHov] = useState(false);
  const sc = SC(c.threatScore);
  return (
    <div className="viq-card" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.surface,border:`1px solid ${hov?T.borderHi:T.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all .2s ease",overflow:"hidden",position:"relative"}}>
      {hov&&<div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 0%,${A}07,transparent 60%)`,pointerEvents:"none"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:`linear-gradient(135deg,${c.gradA},${c.gradB})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:800,color:"#fff",boxShadow:`0 3px 8px rgba(0,0,0,.22)`}}>{c.initial}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13.5,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
          <div style={{fontSize:10.5,color:T.t3,marginTop:1}}>{c.domain}</div>
        </div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:17,fontWeight:500,color:sc,flexShrink:0}}>{c.threatScore}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Traffic",c.traffic],["Funding",c.funding],["Pricing",c.pricing],["Strength",c.strengthLabel]].map(([l,v])=>(
          <div key={l}><div style={{fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:2,fontWeight:700}}>{l}</div>
          <div style={{fontSize:12.5,fontWeight:700,fontFamily:"'DM Mono',monospace",color:l==="Strength"?sc:T.text}}>{v}</div></div>
        ))}
      </div>
      {hov&&(
        <div style={{borderTop:`1px solid ${T.border}`,marginTop:11,paddingTop:10}}>
          {[["Tech Stack",c.stack],["Product Hunt",c.productHunt],["Hiring",c.hiring]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11.5,padding:"2px 0",color:T.t2}}>
              <span style={{color:T.t3,fontWeight:500}}>{l}</span><span style={{fontWeight:600}}>{v||"—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── INTEL CARD (full) ────────────────────────────────────────────────────────
const IntelCard = ({c,T}) => {
  const [hov,setHov] = useState(false);
  const sc = SC(c.threatScore);
  return (
    <div className="viq-card" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.card,border:`1px solid ${hov?T.borderHi:T.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",overflow:"hidden",transition:"all .2s ease",position:"relative"}}>
      {hov&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${c.gradA},${c.gradB})`,borderRadius:"14px 14px 0 0"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:13}}>
        <div style={{width:40,height:40,borderRadius:11,flexShrink:0,background:`linear-gradient(135deg,${c.gradA},${c.gradB})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:800,color:"#fff",boxShadow:`0 4px 12px rgba(0,0,0,.22)`}}>{c.initial}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14.5,fontWeight:700}}>{c.name}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>Est. {c.founded||"—"} · {c.fundingStage||"—"}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:500,color:sc,lineHeight:1}}>{c.threatScore}</div>
          <div style={{fontSize:8.5,color:T.t3,textTransform:"uppercase",letterSpacing:".1em",marginTop:2}}>Threat</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:13}}>
        {[["Traffic",c.traffic],["Funding",c.funding],["Social",c.social],["PH",c.productHunt]].map(([l,v])=>(
          <div key={l}><div style={{fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:2,fontWeight:700}}>{l}</div>
          <div style={{fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{v||"—"}</div></div>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        <Tag v="n" T={T}>{c.pricing}</Tag>
        <Tag v="g" T={T}>{c.fundingStage}</Tag>
        {c.stack&&<Tag v="p" T={T}>{c.stack.split(",")[0].trim()}</Tag>}
        {c.hiring&&<Tag v="go" T={T}>{c.hiring}</Tag>}
      </div>
      {hov&&(
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12,marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Full Stack",c.stack],["Key Weakness",c.weakness],["Domain",c.domain],["Open Roles",c.hiring]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:8.5,color:T.t3,textTransform:"uppercase",letterSpacing:".09em",marginBottom:3,fontWeight:700}}>{l}</div>
            <div style={{fontSize:12,fontWeight:600,color:l==="Key Weakness"?RED:T.text,lineHeight:1.4}}>{v||"—"}</div></div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
const Bg = ({dark}) => (
  <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
    {[
      {x:"78%",y:"8%", s:520,c:"rgba(0,200,180,",  o:dark?.038:.022},
      {x:"6%", y:"68%",s:400,c:"rgba(155,127,255,",o:dark?.028:.016},
      {x:"90%",y:"82%",s:350,c:"rgba(245,200,66,", o:dark?.022:.013},
    ].map((b,i)=>(
      <div key={i} style={{position:"absolute",left:b.x,top:b.y,width:b.s,height:b.s,borderRadius:"50%",background:`radial-gradient(circle,${b.c}${b.o}) 0%,${b.c}0) 70%)`,transform:"translate(-50%,-50%)",filter:"blur(70px)"}}/>
    ))}
    <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${dark?"rgba(255,255,255,.018)":"rgba(0,0,0,.024)"} 1px,transparent 1px),linear-gradient(90deg,${dark?"rgba(255,255,255,.018)":"rgba(0,0,0,.024)"} 1px,transparent 1px)`,backgroundSize:"52px 52px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)"}}/>
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({msg,type,T}) => {
  const col = type==="error"?RED:A;
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:999,background:T.card,border:`1px solid ${col}35`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,fontSize:13,color:T.text,boxShadow:"0 8px 24px rgba(0,0,0,.2)",animation:"slideToast .3s ease",maxWidth:340}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:col,flexShrink:0}}/>
      {msg}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function VentureIQ() {
  const [dark,setDark]       = useState(true);
  const [idea,setIdea]       = useState("AI-powered note-taking for remote teams");
  const [data,setData]       = useState(DEFAULT_DATA);
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState(null);
  const [activeNav,setActiveNav] = useState("idea");
  const [collapsed,setCollapsed] = useState(false);
  const [toast,setToast]     = useState(null);
  const T = useTheme(dark);
  const refs = {idea:useRef(),domain:useRef(),intel:useRef(),trends:useRef(),win:useRef()};

  useEffect(()=>{
    injectCSS();
    document.body.style.background = T.bg;
    document.body.style.color      = T.text;
    // Signal ready
    window.dispatchEvent(new Event("viq-ready"));
  },[]);

  useEffect(()=>{
    document.body.style.background = T.bg;
    document.body.style.color      = T.text;
  },[dark]);

  const showToast = (msg,type="info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3200);
  };

  const scan = useCallback(async()=>{
    if (!idea.trim()||loading) return;
    setLoading(true); setError(null);
    try {
      const result = await runScan(idea.trim());
      if (result.competitors) {
        result.competitors = result.competitors.map((c,i)=>{
          const g = GRADS[i%GRADS.length];
          return {...c, gradA:c.gradA||g[0], gradB:c.gradB||g[1], initial:c.initial||(c.name||"?")[0].toUpperCase()};
        });
      }
      setData(result);
      showToast("Intelligence report ready.");
    } catch(e) {
      setError(e.message||"Scan failed");
      showToast(e.message||"Scan failed","error");
    } finally { setLoading(false); }
  },[idea,loading]);

  const navTo = (key) => {
    setActiveNav(key);
    refs[key]?.current?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  const NAV = [
    {k:"idea",  label:"Idea Scanner",    ico:IC.idea,  badge:"Live"},
    {k:"domain",label:"Domain & Brand",  ico:IC.domain,badge:null},
    {k:"intel", label:"Competitor Intel",ico:IC.intel, badge:null},
    {k:"trends",label:"Market Trends",   ico:IC.trends,badge:null},
    {k:"win",   label:"Why They Win",    ico:IC.win,   badge:null},
  ];
  const SW = collapsed ? 64 : 220;

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",background:T.bg,color:T.text,transition:"background .3s,color .3s",position:"relative"}}>
      <Bg dark={dark}/>

      {/* ── SIDEBAR ── */}
      <aside style={{width:SW,background:dark?"rgba(9,9,20,.96)":"rgba(255,255,255,.96)",borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:200,transition:"width .22s ease",overflow:"hidden",backdropFilter:"blur(18px)",boxShadow:`2px 0 20px rgba(0,0,0,.1)`}}>

        {/* Logo */}
        <div style={{padding:collapsed?"15px 14px":"16px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9,justifyContent:collapsed?"center":"flex-start",minHeight:56}}>
          <a href="index.html" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:9,flex:collapsed?0:1,minWidth:0}}>
            <div style={{width:30,height:30,flexShrink:0,background:"linear-gradient(135deg,#00C8B4,#007A6E)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 12px rgba(0,200,180,.3)"}}>
              <Ico path={IC.signal} size={14} stroke="#fff"/>
            </div>
            {!collapsed&&<span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:800,letterSpacing:"-.02em",whiteSpace:"nowrap",color:T.text}}>Venture<span style={{color:A}}>IQ</span></span>}
          </a>
          {!collapsed&&(
            <button onClick={()=>setCollapsed(true)} style={{background:"transparent",border:"none",cursor:"pointer",color:T.t3,display:"flex",padding:3,borderRadius:5,marginLeft:"auto"}}>
              <Ico path={IC.chevL} size={12} col="currentColor"/>
            </button>
          )}
          {collapsed&&(
            <button onClick={()=>setCollapsed(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:T.t3,display:"flex",padding:3,marginLeft:-4}}>
              <Ico path={IC.chevR} size={12} col="currentColor"/>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"8px 8px",overflowY:"auto",overflowX:"hidden"}}>
          {!collapsed&&<div style={{fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:T.t3,padding:"12px 8px 6px"}}>Intelligence</div>}
          {collapsed&&<div style={{height:12}}/>}
          {NAV.map(n=>(
            <div key={n.k} className="viq-nav" onClick={()=>navTo(n.k)} title={collapsed?n.label:undefined}
              style={{display:"flex",alignItems:"center",gap:9,padding:collapsed?"10px 15px":"9px 10px",borderRadius:10,cursor:"pointer",marginBottom:1,fontSize:13,fontWeight:500,color:activeNav===n.k?A:T.t2,background:activeNav===n.k?`rgba(0,200,180,.08)`:"transparent",position:"relative",transition:"all .15s",justifyContent:collapsed?"center":"flex-start"}}>
              {activeNav===n.k&&<div style={{position:"absolute",left:0,top:"22%",height:"56%",width:2,background:A,borderRadius:"0 2px 2px 0"}}/>}
              <Ico path={n.ico} size={14} col={activeNav===n.k?A:"currentColor"} opacity={activeNav===n.k?.95:.52}/>
              {!collapsed&&n.label}
              {!collapsed&&n.badge&&<span style={{marginLeft:"auto",background:A,color:"#000",fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:20,letterSpacing:".05em"}}>{n.badge}</span>}
            </div>
          ))}
          {!collapsed&&<div style={{fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:T.t3,padding:"14px 8px 6px",marginTop:4}}>Workspace</div>}
          {collapsed&&<div style={{height:10}}/>}
          {[{label:"Reports",ico:IC.report},{label:"Alerts",ico:IC.bell}].map(n=>(
            <div key={n.label} className="viq-nav" title={collapsed?n.label:undefined}
              style={{display:"flex",alignItems:"center",gap:9,padding:collapsed?"10px 15px":"9px 10px",borderRadius:10,cursor:"pointer",color:T.t2,fontSize:13,fontWeight:500,marginBottom:1,transition:"all .15s",justifyContent:collapsed?"center":"flex-start"}}>
              <Ico path={n.ico} size={14} opacity={.5}/>{!collapsed&&n.label}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`}}>
          <div onClick={()=>setDark(d=>!d)} title={collapsed?"Toggle theme":undefined}
            style={{display:"flex",alignItems:"center",gap:8,padding:collapsed?"10px 15px":"8px 10px",borderRadius:10,cursor:"pointer",color:T.t2,fontSize:12,fontWeight:500,userSelect:"none",marginBottom:5,transition:"all .15s",justifyContent:collapsed?"center":"flex-start"}}>
            <Ico path={IC.sun} size={13} opacity={.6}/>
            {!collapsed&&<>
              <span>{dark?"Dark":"Light"} mode</span>
              <div style={{marginLeft:"auto",width:30,height:16,background:T.bg,borderRadius:8,border:`1px solid ${T.borderHi}`,position:"relative",flexShrink:0}}>
                <div style={{width:10,height:10,background:A,borderRadius:"50%",position:"absolute",top:2,left:dark?2:16,transition:"left .2s",boxShadow:`0 0 5px ${A}`}}/>
              </div>
            </>}
          </div>
          {!collapsed&&(
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:10,cursor:"pointer"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#7B61FF,#00C8B4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:800,color:"#fff"}}>AK</div>
              <div><div style={{fontSize:12.5,fontWeight:700}}>Alex Kim</div><div style={{fontSize:10.5,color:A,fontWeight:600}}>Pro Plan</div></div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{marginLeft:SW,flex:1,minWidth:0,position:"relative",zIndex:1,transition:"margin-left .22s ease"}}>

        {/* TOPBAR */}
        <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:56,borderBottom:`1px solid ${T.border}`,background:dark?"rgba(9,9,20,.9)":"rgba(243,243,250,.9)",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)"}}>
          <div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:800,letterSpacing:"-.02em"}}>Startup Intelligence</div>
            <div style={{fontSize:11,color:T.t2,marginTop:1,display:"flex",alignItems:"center",gap:5}}>
              {!loading&&<div style={{width:5,height:5,borderRadius:"50%",background:A,animation:"pulseDot 2s infinite",flexShrink:0}}/>}
              {loading&&<div style={{width:11,height:11,borderRadius:"50%",border:`1.5px solid ${A}`,borderTopColor:"transparent",animation:"spin .8s linear infinite",flexShrink:0}}/>}
              {loading
                ?<span>Scanning <strong style={{color:T.text}}>{idea}</strong>…</span>
                :<span><strong style={{color:T.text}}>{data.ideaLabel||idea}</strong></span>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setDark(d=>!d)}
              style={{width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.t2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s"}}>
              <Ico path={IC.sun} size={13} col="currentColor" opacity={.7}/>
            </button>
            <a href="index.html" style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.t2,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s",textDecoration:"none"}}>
              <Ico path={IC.home} size={12} col="currentColor" opacity={.7}/>
              Home
            </a>
            <button className="viq-btn-p" onClick={scan} disabled={loading}
              style={{padding:"8px 18px",borderRadius:9,border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",background:loading?T.surface:A,color:loading?T.t2:"#000",boxShadow:loading?"none":`0 3px 14px rgba(0,200,180,.28)`,opacity:loading?.75:1,transition:"all .2s",display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}>
              {loading?<><div style={{width:11,height:11,borderRadius:"50%",border:"1.5px solid rgba(0,0,0,.25)",borderTopColor:T.t2,animation:"spin .8s linear infinite"}}/>Scanning…</>:"↻ Re-Scan"}
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div style={{padding:"22px 28px 52px",maxWidth:1300}}>

          {/* ── SEARCH BAR ── */}
          <Panel T={T} style={{marginBottom:22,borderColor:loading?`${A}35`:T.border,transition:"border-color .3s"}}>
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,marginBottom:3}}>Scan a startup idea</div>
              <div style={{fontSize:12,color:T.t3,lineHeight:1.5}}>Describe your idea in plain language — VentureIQ searches the web in real time and returns a full market intelligence report in under 30 seconds.</div>
            </div>
            <div style={{display:"flex",gap:9}}>
              <div style={{flex:1,position:"relative"}}>
                <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                  <Ico path={IC.idea} size={14} col={T.t3}/>
                </div>
                <input value={idea} onChange={e=>setIdea(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}
                  placeholder="e.g. AI legal contract reviewer for small law firms"
                  style={{width:"100%",padding:"12px 13px 12px 38px",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13.5,outline:"none",transition:"border-color .15s"}}
                  onFocus={e=>e.target.style.borderColor=A}
                  onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
              <button className="viq-btn-p" onClick={scan} disabled={loading}
                style={{padding:"12px 22px",background:A,color:"#000",border:"none",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap",boxShadow:`0 4px 16px rgba(0,200,180,.28)`,opacity:loading?.65:1,display:"flex",alignItems:"center",gap:8,transition:"all .2s",flexShrink:0}}>
                {loading?<><div style={{width:12,height:12,borderRadius:"50%",border:"1.5px solid rgba(0,0,0,.25)",borderTopColor:"#000",animation:"spin .8s linear infinite"}}/>Scanning…</>:<><Ico path={IC.spark} size={13} col="#000"/>Scan Idea</>}
              </button>
            </div>
            <div style={{marginTop:11,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:T.t3,flexShrink:0}}>Try:</span>
              {EXAMPLES.map((ex,i)=>(
                <button key={i} className="viq-pill" onClick={()=>setIdea(ex)}
                  style={{padding:"4px 11px",borderRadius:20,fontSize:11.5,fontWeight:500,background:T.surface,color:T.t2,border:`1px solid ${T.border}`,cursor:"pointer",transition:"all .15s",fontFamily:"'DM Sans',sans-serif"}}>
                  {ex}
                </button>
              ))}
            </div>
            {error&&(
              <div style={{marginTop:11,padding:"10px 13px",background:"rgba(240,96,96,.07)",border:"1px solid rgba(240,96,96,.18)",borderRadius:9,fontSize:13,color:RED,display:"flex",alignItems:"center",gap:8}}>
                <Ico path={IC.info} size={13} col={RED}/>{error} — Please try again.
              </div>
            )}
          </Panel>

          {/* ── PROGRESS ── */}
          <ScanProgress loading={loading} T={T}/>

          {/* ── DATA ── */}
          {data&&(
            <div style={{opacity:loading?.3:1,transition:"opacity .35s",pointerEvents:loading?"none":"auto"}}>

              {/* 1 — IDEA SCANNER */}
              <div ref={refs.idea} className="viq-sec" style={{marginBottom:26}}>
                <SecHd icon={IC.idea} title="Idea Scanner" sub="Market viability · real-time AI analysis" T={T}/>
                <Panel T={T}>
                  {data.market?.summary&&(
                    <div style={{fontSize:13.5,color:T.t2,marginBottom:20,padding:"13px 16px",background:T.surface,borderRadius:10,lineHeight:1.65,borderLeft:`2.5px solid ${A}`}}>
                      {data.market.summary}
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
                    <KpiTile T={T} label="Market Saturation" val={data.market?.saturation} suf="%" desc={`${(data.competitors||[]).length*10||40} tools tracked`} col={RED} pct={data.market?.saturation||74} tip="Measures how crowded the market is. Higher = harder to enter, but validates demand exists."/>
                    <KpiTile T={T} label="Opportunity Score" val={data.market?.opportunityScore} suf="/10" desc="Differentiation window" col={A} pct={(data.market?.opportunityScore||0)*10} tip="Composite score of market gaps, unmet needs, and your entry advantage potential (0–10)."/>
                    <KpiTile T={T} label="Trend Velocity" val={data.market?.trendVelocity} suf="×" desc={`MoM growth · ${data.market?.trendDirection||"Rising"}`} col={GOLD} pct={Math.min(100,(data.market?.trendVelocity||1)*25)} tip="How fast the market is growing month-over-month. Higher = urgency to move fast."/>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <SL T={T} mb={0}>Top Competitors</SL>
                    <Badge dir={data.market?.trendDirection||"Rising"} lg/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                    {(data.competitors||[]).slice(0,3).map((c,i)=><CompCard key={i} c={c} T={T}/>)}
                  </div>
                  <Tip msg="Hover any competitor card to reveal tech stack, Product Hunt ranking, and hiring signals." T={T}/>
                </Panel>
              </div>

              {/* 2 — DOMAIN */}
              <div ref={refs.domain} className="viq-sec" style={{marginBottom:26,animationDelay:".06s"}}>
                <SecHd icon={IC.domain} title="Domain & Brand" sub="Availability · brandability · trademark signals" T={T}/>
                <Panel T={T}>
                  <SL T={T}>Domain availability — "{(data.domain?.suggestedBrand||"yourbrand").toLowerCase()}"</SL>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,marginBottom:20}}>
                    {(data.domain?.extensions||[]).map((d,i)=>(
                      <div key={i} className="viq-domain"
                        style={{background:d.available?`rgba(0,200,180,.07)`:T.surface,border:`1.5px solid ${d.available?A:T.border}`,borderRadius:12,padding:"15px 10px",textAlign:"center",cursor:d.available?"pointer":"default",transition:"all .2s",position:"relative",overflow:"hidden"}}>
                        {d.available&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${A}50,${A})`}}/>}
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:500,marginBottom:5,color:d.available?A:T.t2}}>{d.ext}</div>
                        <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:d.available?A:RED,marginBottom:4}}>{d.available?"Available":"Taken"}</div>
                        {d.available
                          ?<div style={{fontSize:10.5,color:T.t3,fontFamily:"'DM Mono',monospace"}}>{d.price}</div>
                          :<div style={{display:"flex",justifyContent:"center"}}><Ico path={IC.lock} size={12} col={T.t3} opacity={.45}/></div>}
                      </div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                    {[
                      {label:"Brandability Score",val:data.domain?.brandability,suf:"/100",col:A,sub:"Memorability · length · spelling ease"},
                      {label:"Clean Brand Probability",val:data.domain?.cleanBrand,suf:"%",col:GOLD,sub:data.domain?.trademarkNote?"1 potential conflict detected":"No conflicts detected"},
                    ].map((b,i)=>(
                      <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px 20px"}}>
                        <SL T={T}>{b.label}</SL>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:36,fontWeight:500,lineHeight:1,color:b.col,letterSpacing:"-.03em"}}>
                          {b.val}<span style={{fontSize:13,color:T.t3,fontWeight:400}}>{b.suf}</span>
                        </div>
                        <div style={{fontSize:11.5,color:T.t2,marginTop:5,marginBottom:12}}>{b.sub}</div>
                        <div style={{height:2,background:T.card,borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",borderRadius:1,background:b.col,width:`${b.val||0}%`}}/></div>
                      </div>
                    ))}
                  </div>
                  <SL T={T}>Alternative name suggestions</SL>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:data.domain?.trademarkNote?16:0}}>
                    {(data.domain?.suggestions||[]).map((s,i)=>(
                      <button key={i} className="viq-pill"
                        style={{padding:"5px 13px",borderRadius:8,fontSize:12.5,fontWeight:500,background:T.surface,color:T.t2,border:`1px solid ${T.border}`,cursor:"pointer",transition:"all .15s",fontFamily:"'DM Mono',monospace"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {data.domain?.trademarkNote&&(
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",background:"rgba(245,200,66,.05)",border:"1px solid rgba(245,200,66,.17)",borderRadius:10,padding:"12px 14px",marginTop:16}}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3M7 10v.5"/></svg>
                      <div style={{fontSize:12.5,color:T.t2,lineHeight:1.6}}><strong style={{color:GOLD,fontWeight:700}}>Trademark — </strong>{data.domain.trademarkNote}</div>
                    </div>
                  )}
                </Panel>
              </div>

              {/* 3 — COMPETITOR INTEL */}
              <div ref={refs.intel} className="viq-sec" style={{marginBottom:26,animationDelay:".12s"}}>
                <SecHd icon={IC.intel} title="Competitor Intelligence" sub="Threat scores · funding · tech stack · hiring signals" T={T}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {(data.competitors||[]).slice(0,4).map((c,i)=><IntelCard key={i} c={c} T={T}/>)}
                </div>
                <Tip msg="Threat scores above 8 indicate dominant incumbents. Hover any card to reveal full stack, weakness analysis, and open roles." T={T}/>
              </div>

              {/* 4 — TRENDS */}
              <div ref={refs.trends} className="viq-sec" style={{marginBottom:26,animationDelay:".18s"}}>
                <SecHd icon={IC.trends} title="Market Trends" sub="Signal tracking across Reddit, HN, X/Twitter & Product Hunt" T={T}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 218px",gap:13}}>
                  <Panel T={T}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:15}}>
                      <div>
                        <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,marginBottom:2}}>Mention Volume</div>
                        <div style={{fontSize:11,color:T.t3}}>6-month rolling trend · 4 channels</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <Badge dir={data.trends?.direction||"Rising"} lg/>
                        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:7,justifyContent:"flex-end"}}>
                          {[["Reddit",A],["HN",GOLD],["X",PUR],["PH",AMB]].map(([l,c])=>(
                            <span key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.t2}}>
                              <span style={{width:6,height:6,borderRadius:2,background:c,flexShrink:0}}/>{l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <TrendChart series={data.trends?.series} months={data.trends?.months} dark={dark} T={T}/>
                    <div style={{display:"flex",alignItems:"center",gap:11,marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                      <span style={{fontSize:12,color:T.t2,fontWeight:600,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
                        <Ico path={IC.signal} size={12} col={A}/>Momentum
                      </span>
                      <div style={{flex:1,height:4,background:T.surface,borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",background:`linear-gradient(90deg,${A},${GOLD})`,borderRadius:2,width:`${data.trends?.momentum||72}%`,transition:"width 1s ease"}}/>
                      </div>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:A,whiteSpace:"nowrap",fontWeight:500}}>{data.trends?.momentum||72}<span style={{color:T.t3,fontWeight:400}}>/100</span></span>
                    </div>
                  </Panel>
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {(data.trends?.channels||[]).map((ch,i)=>{
                      const col=ch.pct>=80?A:ch.pct>=40?GOLD:AMB;
                      return(
                        <div key={i} className="viq-card"
                          style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 13px",flex:1,cursor:"pointer",transition:"all .18s",boxShadow:`0 1px 4px rgba(0,0,0,.05)`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                            <span style={{fontSize:12,fontWeight:700}}>{ch.name}</span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,color:col}}>+{ch.pct}%</span>
                          </div>
                          <div style={{fontSize:10.5,color:T.t3,marginBottom:6,lineHeight:1.4}}>{ch.desc}</div>
                          <div style={{height:2,background:T.surface,borderRadius:1,overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:1,background:col,width:`${Math.min(100,ch.pct)}%`}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5 — WHY THEY WIN */}
              <div ref={refs.win} className="viq-sec" style={{marginBottom:26,animationDelay:".24s"}}>
                <SecHd icon={IC.win} title="Why They Win" sub={`${data.competitive?.topCompetitor||"Top Competitor"} competitive advantage breakdown`} T={T}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                  <Panel T={T}>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,marginBottom:2}}>Competitive Radar</div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:15}}>{data.competitive?.topCompetitor} vs. Market Average</div>
                    <RadarChart labels={data.competitive?.radarLabels} comp={data.competitive?.radarComp} market={data.competitive?.radarMarket} dark={dark}/>
                    <div style={{display:"flex",gap:16,marginTop:12,justifyContent:"center"}}>
                      {[[A,data.competitive?.topCompetitor||"Leader"],["rgba(245,200,66,.55)","Market Avg"]].map(([c,l])=>(
                        <span key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.t2}}>
                          <span style={{width:7,height:7,borderRadius:2,background:c}}/>{l}
                        </span>
                      ))}
                    </div>
                  </Panel>
                  <Panel T={T}>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,marginBottom:2}}>Advantage Areas</div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:6}}>Scores out of 10 — your opportunities shown in teal</div>
                    <div style={{display:"flex",gap:14,marginBottom:16}}>
                      {[[A,"Your opportunity"],[RED,"Dominant strength"]].map(([c,l])=>(
                        <span key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.t3}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}
                        </span>
                      ))}
                    </div>
                    {(data.competitive?.advantages||[]).slice(0,6).map((a,i)=>{
                      const col=SC(a.score);
                      return(
                        <div key={i} style={{marginBottom:16}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                              {a.isOpportunity&&<span style={{width:5,height:5,borderRadius:"50%",background:A,flexShrink:0,display:"inline-block",boxShadow:`0 0 4px ${A}`}}/>}
                              {a.area}
                            </span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:500,color:col}}>{a.score}</span>
                          </div>
                          <div style={{height:4,background:T.surface,borderRadius:2,overflow:"hidden",marginBottom:5}}>
                            <div style={{height:"100%",borderRadius:2,background:col,width:`${a.score*10}%`,transition:"width 1.4s cubic-bezier(.4,0,.2,1)"}}/>
                          </div>
                          <div style={{fontSize:11.5,color:a.isOpportunity?A:T.t3,fontWeight:a.isOpportunity?600:400,lineHeight:1.45}}>
                            {a.isOpportunity?"→ ":""}{a.desc}
                          </div>
                        </div>
                      );
                    })}
                  </Panel>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {toast&&<Toast msg={toast.msg} type={toast.type} T={T}/>}
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(VentureIQ));
