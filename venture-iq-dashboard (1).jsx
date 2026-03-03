import { useState, useRef, useEffect, useCallback } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const A    = "#00C8B4";   // teal accent
const GOLD = "#F5C842";
const RED  = "#F06060";
const AMB  = "#F09240";
const PUR  = "#9B7FFF";

const GRADS = [
  ["#FF5B5B","#FF8C00"], ["#1A6FC4","#00B4D8"], ["#6C3CE4","#9F60E8"],
  ["#007BFF","#00C9FF"], ["#E84393","#FF6B6B"], ["#00B09B","#96C93D"],
  ["#8E44AD","#C0392B"], ["#2C3E50","#4CA1AF"],
];

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  ideaLabel: "AI Note-Taking for Remote Teams",
  market: {
    saturation: 74, opportunityScore: 8.2, trendVelocity: 2.4,
    trendDirection: "Rising",
    summary: "The AI productivity tools market is heavily contested but growing at 2.4× MoM. Incumbents like Notion and Otter.ai dominate, yet deep AI integration and mobile-first gaps create a genuine entry window for focused challengers.",
  },
  competitors: [
    { name:"Notion AI", domain:"notion.so", initial:"N", gradA:"#FF5B5B", gradB:"#FF8C00",
      threatScore:9.4, traffic:"48.2M/mo", funding:"$343M", pricing:"$8–16/mo",
      strengthLabel:"Very High", stack:"React, Node.js, AWS", productHunt:"#1 of day",
      hiring:"12 open", fundingStage:"Series C", weakness:"Steep learning curve for new users", founded:"2016", social:"2.1M" },
    { name:"Otter.ai", domain:"otter.ai", initial:"O", gradA:"#1A6FC4", gradB:"#00B4D8",
      threatScore:7.6, traffic:"8.7M/mo", funding:"$63M", pricing:"$10–20/mo",
      strengthLabel:"High", stack:"Python, TensorFlow, GCP", productHunt:"Top 5 Voice AI",
      hiring:"5 open", fundingStage:"Series B", weakness:"Limited note editing beyond transcription", founded:"2018", social:"320K" },
    { name:"Fireflies.ai", domain:"fireflies.ai", initial:"F", gradA:"#6C3CE4", gradB:"#9F60E8",
      threatScore:6.8, traffic:"3.1M/mo", funding:"$19M", pricing:"Free–$19/mo",
      strengthLabel:"Moderate", stack:"Node.js, MongoDB, GCP", productHunt:"Top 10 AI Tools",
      hiring:"2 open", fundingStage:"Series A", weakness:"Weak consumer brand identity", founded:"2016", social:"180K" },
    { name:"Mem.ai", domain:"mem.ai", initial:"M", gradA:"#007BFF", gradB:"#00C9FF",
      threatScore:5.9, traffic:"1.2M/mo", funding:"$23.5M", pricing:"$14.99/mo",
      strengthLabel:"Low", stack:"Next.js, TypeScript, AWS", productHunt:"#3 Product of Week",
      hiring:"1 open", fundingStage:"Seed", weakness:"Slow feature velocity for a small team", founded:"2020", social:"95K" },
  ],
  domain: {
    suggestedBrand:"noteflow",
    brandability:88, cleanBrand:71,
    extensions:[
      {ext:".ai",available:true,price:"$89/yr"},{ext:".io",available:true,price:"$49/yr"},
      {ext:".com",available:false,price:"Taken"},{ext:".app",available:true,price:"$19/yr"},
      {ext:".co",available:false,price:"Taken"},
    ],
    suggestions:["getnoteflow.io","noteflow.app","trynoteflow.ai","noteflowapp.io","myflownotes.com"],
    trademarkNote:"\"Noteflow\" may conflict with a software trademark registered in the US (Class 42, 2021). Consult an attorney before brand investment.",
  },
  trends: {
    momentum:72, direction:"Rising",
    channels:[
      {name:"Reddit",     pct:84, desc:"r/productivity surging — AI notes trending this week."},
      {name:"Hacker News",pct:31, desc:"3 Ask HN threads in 30 days, moderate engagement."},
      {name:"X / Twitter",pct:127,desc:"#AINotes trending, influencer coverage accelerating."},
      {name:"Google Trends",pct:56,desc:"\"AI meeting notes\" search volume 2.4× YoY."},
      {name:"Product Hunt",pct:72, desc:"Productivity AI category grew 72% QoQ."},
    ],
    months:["Oct","Nov","Dec","Jan","Feb","Mar"],
    series:{
      reddit: [30,38,45,55,72,88],
      hn:     [20,22,28,30,38,42],
      twitter:[40,48,52,65,88,100],
      ph:     [15,20,25,28,38,50],
    },
  },
  competitive:{
    topCompetitor:"Notion AI",
    radarLabels:["UX","SEO","Community","Pricing","AI Depth","Mobile"],
    radarComp:  [0.92,0.87,0.81,0.74,0.68,0.59],
    radarMarket:[0.60,0.55,0.50,0.60,0.58,0.52],
    advantages:[
      {area:"UX & Design",     score:9.2, isOpportunity:false, desc:"Industry-leading design system — very hard to match."},
      {area:"SEO & Content",   score:8.7, isOpportunity:false, desc:"Thousands of template pages capturing long-tail search."},
      {area:"Community & PLG", score:8.1, isOpportunity:false, desc:"Massive creator ecosystem with strong network effects."},
      {area:"Pricing Strategy",score:7.4, isOpportunity:false, desc:"Freemium drives ~40% paid conversion. Your gap: 2.6 pts."},
      {area:"AI Depth",        score:6.8, isOpportunity:true,  desc:"Integrations are surface-level. Strike here with deeper AI."},
      {area:"Mobile Experience",score:5.9,isOpportunity:true,  desc:"Clear weakness — a mobile-first approach could differentiate."},
    ],
  },
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM = `You are a startup intelligence API. Do exactly ONE focused web search to gather current market data for the idea, then immediately return ONLY valid JSON — no markdown fences, no commentary whatsoever.

Required JSON schema (fill every field with realistic, research-backed values):
{
  "ideaLabel":"<3-6 word title>",
  "market":{"saturation":<0-100>,"opportunityScore":<0.0-10.0>,"trendVelocity":<float>,"trendDirection":"Rising"|"Stable"|"Declining","summary":"<2 concise sentences>"},
  "competitors":[
    {"name":"","domain":"","initial":"","gradA":"<hex>","gradB":"<hex>","threatScore":<0-10>,"traffic":"","funding":"","pricing":"","strengthLabel":"Very High"|"High"|"Moderate"|"Low","stack":"","productHunt":"","hiring":"","fundingStage":"","weakness":"","founded":"","social":""}
  ],
  "domain":{"suggestedBrand":"<short single word>","brandability":<0-100>,"cleanBrand":<0-100>,"extensions":[{"ext":".com","available":<bool>,"price":""},{"ext":".io","available":<bool>,"price":""},{"ext":".ai","available":<bool>,"price":""},{"ext":".app","available":<bool>,"price":""},{"ext":".co","available":<bool>,"price":""}],"suggestions":["","","","",""],"trademarkNote":"<string or null>"},
  "trends":{"momentum":<0-100>,"direction":"Rising"|"Stable"|"Declining","channels":[{"name":"Reddit","pct":<int>,"desc":""},{"name":"Hacker News","pct":<int>,"desc":""},{"name":"X / Twitter","pct":<int>,"desc":""},{"name":"Google Trends","pct":<int>,"desc":""},{"name":"Product Hunt","pct":<int>,"desc":""}],"months":["Oct","Nov","Dec","Jan","Feb","Mar"],"series":{"reddit":[<6 ints>],"hn":[<6 ints>],"twitter":[<6 ints>],"ph":[<6 ints>]}},
  "competitive":{"topCompetitor":"","radarLabels":["UX","SEO","Community","Pricing","AI Depth","Mobile"],"radarComp":[<6 floats 0-1>],"radarMarket":[<6 floats 0-1>],"advantages":[{"area":"","score":<0-10>,"isOpportunity":<bool>,"desc":""}]}
}

Return exactly 4 competitors and exactly 6 advantage areas. Search once, then return JSON immediately.`;

// ─── SCAN ─────────────────────────────────────────────────────────────────────
async function runScan(idea) {
  let messages = [{ role:"user", content:`Research this startup idea and return the JSON report: "${idea}"` }];
  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:3000,
        system:SYSTEM,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages,
      }),
    });
    if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
    const data = await res.json();
    if (data.stop_reason === "end_turn") {
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      return parseJSON(text);
    }
    if (data.stop_reason === "tool_use") {
      messages.push({role:"assistant",content:data.content});
      const results = (data.content||[]).filter(b=>b.type==="tool_use")
        .map(b=>({type:"tool_result",tool_use_id:b.id,content:""}));
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
  const start = clean.indexOf("{"), end = clean.lastIndexOf("}");
  if (start===-1||end===-1) throw new Error("No JSON in response");
  return JSON.parse(clean.slice(start,end+1));
}

// ─── THEME ────────────────────────────────────────────────────────────────────
function useTheme(dark) {
  if (dark) return {
    bg:       "#13131F",
    surface:  "#1C1C2E",
    card:     "#20203A",
    cardHi:   "#2A2A48",
    panelBg:  "#181828",
    border:   "rgba(255,255,255,0.055)",
    borderHi: "rgba(255,255,255,0.13)",
    text:     "#EEEEF8",
    t2:       "rgba(238,238,248,0.52)",
    t3:       "rgba(238,238,248,0.26)",
    glow:     "rgba(0,200,180,0.07)",
    dark:     true,
  };
  return {
    bg:       "#F0F0F7",
    surface:  "#E8E8F2",
    card:     "#FFFFFF",
    cardHi:   "#F7F7FF",
    panelBg:  "#EBEBF5",
    border:   "rgba(0,0,0,0.065)",
    borderHi: "rgba(0,0,0,0.13)",
    text:     "#12121E",
    t2:       "rgba(18,18,30,0.5)",
    t3:       "rgba(18,18,30,0.28)",
    glow:     "rgba(0,200,180,0.05)",
    dark:     false,
  };
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const ICONS = {
  idea:   `<circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3"/>`,
  domain: `<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2a9 9 0 010 12M8 2a9 9 0 000 12"/>`,
  intel:  `<rect x="1" y="9" width="3" height="6" rx="1"/><rect x="6.5" y="5.5" width="3" height="9.5" rx="1"/><rect x="12" y="2" width="3" height="13" rx="1"/>`,
  trends: `<polyline points="1,12 6,7 10,10 15,4"/><polyline points="11,4 15,4 15,8"/>`,
  win:    `<polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5"/><polygon points="8,5 12,7 12,11 8,13 4,11 4,7"/>`,
  report: `<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h4"/>`,
  bell:   `<path d="M8 1a4 4 0 00-4 4c0 4-1.5 5-1.5 5h11S13 9 13 5a4 4 0 00-4-4z"/><path d="M9.3 13a1.7 1.7 0 01-2.6 0"/>`,
  sun:    `<circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 12.5V14M1 8h1.5M12.5 8H14M3.05 3.05l1.06 1.06M10.9 10.9l1.05 1.05M10.95 3.05 9.9 4.1M4.1 10.9 3.05 10.95"/>`,
  signal: `<polyline points="1,12 5,7 9,9.5 15,3"/><circle cx="15" cy="3" r="1.2" fill="currentColor" stroke="none"/>`,
  search: `<circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3"/>`,
  chevron:`<path d="M5 8l3-3 3 3"/>`,
  plus:   `<path d="M8 2v12M2 8h12"/>`,
  ext:    `<path d="M8 2v10M4 8l4 4 4-4"/><path d="M2 13h12"/>`,
  lock:   `<rect x="3" y="8" width="10" height="7" rx="1.5"/><path d="M5.5 8V5.5a2.5 2.5 0 015 0V8"/>`,
};

function Icon({path,size=16,col,opacity=1,stroke}){
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke={stroke||col||"currentColor"} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,opacity}}
      dangerouslySetInnerHTML={{__html:path}}/>
  );
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const SCORE_COLOR = v => v >= 8 ? RED : v >= 6.5 ? AMB : A;

function Tag({children, v="n", T}){
  const s = {
    g:  {bg:"rgba(0,200,180,.1)",    col:A,    border:`1px solid rgba(0,200,180,.2)`},
    r:  {bg:"rgba(240,96,96,.1)",    col:RED,  border:`1px solid rgba(240,96,96,.2)`},
    go: {bg:"rgba(245,200,66,.1)",   col:GOLD, border:`1px solid rgba(245,200,66,.2)`},
    p:  {bg:"rgba(155,127,255,.1)",  col:PUR,  border:`1px solid rgba(155,127,255,.2)`},
    n:  {bg:T?.surface||"rgba(255,255,255,.04)", col:T?.t2||"rgba(200,200,220,.5)", border:`1px solid ${T?.border||"rgba(255,255,255,.06)"}`},
  }[v] || {};
  return (
    <span style={{display:"inline-flex",padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,
      whiteSpace:"nowrap",background:s.bg,color:s.col,border:s.border,letterSpacing:".02em"}}>
      {children}
    </span>
  );
}

function Badge({dir}){
  const cfg = {
    Rising:   {bg:"rgba(0,200,180,.1)",  col:A,    sym:"▲"},
    Declining:{bg:"rgba(240,96,96,.1)",  col:RED,  sym:"▼"},
    Stable:   {bg:"rgba(240,146,64,.1)", col:AMB,  sym:"●"},
  }[dir] || {bg:"rgba(0,200,180,.1)",col:A,sym:"▲"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,
      fontSize:10,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",
      background:cfg.bg,color:cfg.col}}>
      <span style={{fontSize:7}}>{cfg.sym}</span>{dir}
    </span>
  );
}

function Divider({T}){
  return <div style={{height:1,background:T.border,margin:"20px 0"}}/>;
}

function StatLabel({children, T}){
  return (
    <div style={{fontSize:"10px",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
      color:T.t3,marginBottom:8}}>
      {children}
    </div>
  );
}

function SecHd({icon,title,sub,link,T}){
  return (
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:18}}>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:T.surface,border:`1px solid ${T.border}`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon path={icon} size={14} col={A} opacity={.9}/>
          </div>
          <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:18,fontWeight:400,
            letterSpacing:"-.01em",color:T.text}}>
            {title}
          </span>
        </div>
        {sub && <div style={{fontSize:11.5,color:T.t3,paddingLeft:36}}>{sub}</div>}
      </div>
      {link && (
        <span style={{fontSize:11.5,color:A,fontWeight:600,cursor:"pointer",
          letterSpacing:".03em",display:"flex",alignItems:"center",gap:4,opacity:.8}}>
          {link}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={A} strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 5h6M5 2l3 3-3 3"/>
          </svg>
        </span>
      )}
    </div>
  );
}

// ─── SHIMMER / SKELETON ───────────────────────────────────────────────────────
function Shimmer({T,w="100%",h=14,r=6}){
  return (
    <div style={{width:w,height:h,borderRadius:r,background:T.surface,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,
        background:`linear-gradient(90deg,transparent,${T.cardHi},transparent)`,
        animation:"shimmer 1.5s infinite"}}/>
    </div>
  );
}

function SkeletonSection({T}){
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"22px"}}>
            <Shimmer T={T} w="55%" h={9} r={4}/>
            <div style={{marginTop:14}}><Shimmer T={T} w="65%" h={32} r={6}/></div>
            <div style={{marginTop:10}}><Shimmer T={T} w="85%" h={9} r={4}/></div>
            <div style={{marginTop:14}}><Shimmer T={T} h={3} r={2}/></div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px"}}>
            <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
              <Shimmer T={T} w={36} h={36} r={10}/>
              <div style={{flex:1}}>
                <Shimmer T={T} w="65%" h={12} r={4}/>
                <div style={{marginTop:6}}><Shimmer T={T} w="45%" h={9} r={3}/></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[0,1,2,3].map(j=>(
                <div key={j}>
                  <Shimmer T={T} w="45%" h={8} r={3}/>
                  <div style={{marginTop:4}}><Shimmer T={T} w="75%" h={11} r={3}/></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TREND CHART ──────────────────────────────────────────────────────────────
function TrendChart({series,months,dark,T}){
  const W=540,H=175,pad={l:34,r:10,t:8,b:26};
  const cw=W-pad.l-pad.r, ch=H-pad.t-pad.b;
  const gc=dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)";
  const lc=dark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.2)";
  const sets=[{k:"reddit",c:A},{k:"hn",c:GOLD},{k:"twitter",c:PUR},{k:"ph",c:AMB}];
  const tx=(i,n)=>pad.l+(cw/(n-1))*i;
  const ty=v=>pad.t+ch-(v/100)*ch;
  const curve=pts=>{
    let d=`M ${pts[0].x},${pts[0].y}`;
    for(let i=1;i<pts.length;i++){
      const p=pts[i],pp=pts[i-1],cx=(pp.x+p.x)/2;
      d+=` C ${cx},${pp.y} ${cx},${p.y} ${p.x},${p.y}`;
    }
    return d;
  };
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>
        {sets.map((s,i)=>(
          <linearGradient key={i} id={`tg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.c} stopOpacity=".15"/>
            <stop offset="100%" stopColor={s.c} stopOpacity="0"/>
          </linearGradient>
        ))}
      </defs>
      {[0,1,2,3,4].map(i=>(
        <line key={i} x1={pad.l} y1={pad.t+(ch/4)*i} x2={W-pad.r} y2={pad.t+(ch/4)*i}
          stroke={gc} strokeWidth="1"/>
      ))}
      {[100,75,50,25,0].map((v,i)=>(
        <text key={i} x={pad.l-5} y={pad.t+(ch/4)*i+4} textAnchor="end"
          fontSize="9.5" fontFamily="'DM Mono',monospace" fill={lc}>{v}</text>
      ))}
      {(months||[]).map((m,i)=>(
        <text key={i} x={tx(i,months.length)} y={H-4} textAnchor="middle"
          fontSize="9.5" fontFamily="'DM Mono',monospace" fill={lc}>{m}</text>
      ))}
      {sets.map((s,si)=>{
        const d=(series||{})[s.k]||[0,0,0,0,0,0];
        const pts=d.map((v,i)=>({x:tx(i,d.length),y:ty(v)}));
        const lp=curve(pts);
        const ap=lp+` L ${pts[pts.length-1].x},${pad.t+ch} L ${pts[0].x},${pad.t+ch} Z`;
        return (
          <g key={si}>
            <path d={ap} fill={`url(#tg${si})`}/>
            <path d={lp} fill="none" stroke={s.c} strokeWidth="1.8" strokeLinecap="round"/>
            {pts.map((p,pi)=>(
              <circle key={pi} cx={p.x} cy={p.y} r="2.5" fill={s.c}
                stroke={dark?"#20203A":"#fff"} strokeWidth="1.5"/>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
function RadarChart({labels,comp,market,dark}){
  const W=290,H=248,cx=W/2,cy=H/2+6,R=82,N=(labels||[]).length||6;
  const gc=dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)";
  const lc=dark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)";
  const pt=(i,v)=>{const a=(Math.PI*2/N)*i-Math.PI/2;return{x:cx+Math.cos(a)*R*v,y:cy+Math.sin(a)*R*v};};
  const poly=scores=>(scores||[]).map((v,i)=>{const p=pt(i,v);return`${p.x},${p.y}`;}).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      {[.25,.5,.75,1].map(r=>(
        <polygon key={r} points={poly((labels||[]).map(()=>r))} fill="none" stroke={gc} strokeWidth="1"/>
      ))}
      {(labels||[]).map((_,i)=>{
        const p=pt(i,1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={gc} strokeWidth="1"/>;
      })}
      <polygon points={poly(market)} fill="rgba(245,200,66,0.08)" stroke="rgba(245,200,66,0.35)" strokeWidth="1.5"/>
      <polygon points={poly(comp)}   fill="rgba(0,200,180,0.11)"  stroke={A} strokeWidth="2"/>
      {(comp||[]).map((v,i)=>{
        const p=pt(i,v);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill={A} stroke={dark?"#20203A":"#fff"} strokeWidth="1.5"/>;
      })}
      {(labels||[]).map((l,i)=>{
        const p=pt(i,1.28);
        return (
          <text key={i} x={p.x} y={p.y+4} textAnchor="middle"
            fontSize="10.5" fontWeight="600" fontFamily="'DM Sans',sans-serif" fill={lc}>
            {l}
          </text>
        );
      })}
    </svg>
  );
}

// ─── COMPETITOR CARD (compact, Idea Scanner) ──────────────────────────────────
function CompCard({c,T}){
  const [hov,setHov]=useState(false);
  const sc=SCORE_COLOR(c.threatScore);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?T.cardHi:T.surface,
        border:`1px solid ${hov?T.borderHi:T.border}`,
        borderRadius:12,padding:"16px 18px",cursor:"pointer",
        transform:hov?"translateY(-2px)":"none",
        boxShadow:hov?`0 10px 28px rgba(0,0,0,.18),0 0 0 0.5px ${T.borderHi}`:"none",
        transition:"all .2s ease",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
        <div style={{width:34,height:34,borderRadius:9,flexShrink:0,
          background:`linear-gradient(135deg,${c.gradA},${c.gradB})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Instrument Serif',serif",fontSize:15,fontWeight:400,color:"#fff",
          boxShadow:`0 3px 10px rgba(0,0,0,.2)`}}>
          {c.initial}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13.5,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",
            textOverflow:"ellipsis",fontFamily:"'DM Sans',sans-serif"}}>
            {c.name}
          </div>
          <div style={{fontSize:11,color:T.t3,marginTop:1}}>{c.domain}</div>
        </div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:500,color:sc,flexShrink:0}}>
          {c.threatScore}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {[["Traffic",c.traffic],["Funding",c.funding],["Pricing",c.pricing],["Strength",c.strengthLabel]].map(([l,v])=>(
          <div key={l}>
            <div style={{fontSize:9.5,color:T.t3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:2,fontWeight:600}}>{l}</div>
            <div style={{fontSize:12.5,fontWeight:700,fontFamily:"'DM Mono',monospace",
              color:l==="Strength"?sc:T.text}}>
              {v}
            </div>
          </div>
        ))}
      </div>
      {hov && (
        <div style={{borderTop:`1px solid ${T.border}`,marginTop:12,paddingTop:11}}>
          {[["Stack",c.stack],["Product Hunt",c.productHunt],["Hiring",c.hiring]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              fontSize:11.5,padding:"3px 0",color:T.t2}}>
              <span style={{color:T.t3}}>{l}</span>
              <span style={{fontWeight:600}}>{v||"—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── INTEL CARD (full competitor card) ───────────────────────────────────────
function IntelCard({c,T}){
  const [hov,setHov]=useState(false);
  const sc=SCORE_COLOR(c.threatScore);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?T.cardHi:T.card,
        border:`1px solid ${hov?T.borderHi:T.border}`,
        borderRadius:14,padding:"20px 22px",cursor:"pointer",overflow:"hidden",
        transform:hov?"translateY(-2px)":"none",
        boxShadow:hov?`0 12px 32px rgba(0,0,0,.2),0 0 0 0.5px ${T.borderHi}`:`0 2px 8px rgba(0,0,0,.06)`,
        transition:"all .22s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{width:40,height:40,borderRadius:11,flexShrink:0,
          background:`linear-gradient(135deg,${c.gradA},${c.gradB})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Instrument Serif',serif",fontSize:17,fontWeight:400,color:"#fff",
          boxShadow:`0 4px 14px rgba(0,0,0,.22)`}}>
          {c.initial}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14.5,fontWeight:700}}>{c.name}</div>
          <div style={{fontSize:11,color:T.t3,marginTop:2}}>Est. {c.founded||"—"} · {c.fundingStage||"—"}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:500,color:sc,lineHeight:1}}>
            {c.threatScore}
          </div>
          <div style={{fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:".08em",marginTop:2}}>
            Threat
          </div>
        </div>
      </div>
      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Traffic",c.traffic],["Funding",c.funding],["Social",c.social],["PH",c.productHunt]].map(([l,v])=>(
          <div key={l}>
            <div style={{fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:2,fontWeight:600}}>{l}</div>
            <div style={{fontSize:12.5,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{v||"—"}</div>
          </div>
        ))}
      </div>
      {/* Tags */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        <Tag v="n" T={T}>{c.pricing}</Tag>
        <Tag v="g" T={T}>{c.fundingStage}</Tag>
        {c.stack && <Tag v="p" T={T}>{c.stack.split(",")[0].trim()}</Tag>}
        {c.hiring && <Tag v="go" T={T}>{c.hiring}</Tag>}
      </div>
      {/* Hover expand */}
      {hov && (
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,marginTop:12,
          display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Full Stack",c.stack],["Top Channel","Market research"],
            ["Key Weakness",c.weakness],["Domain",c.domain]].map(([l,v])=>(
            <div key={l}>
              <div style={{fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:3,fontWeight:600}}>{l}</div>
              <div style={{fontSize:12,fontWeight:600,color:l==="Key Weakness"?RED:T.text,lineHeight:1.4}}>{v||"—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BACKGROUND ORBS ─────────────────────────────────────────────────────────
function BgOrbs({dark}){
  const orbs = [
    {x:"72%",y:"12%",size:480,col:"rgba(0,200,180,",op:dark?.035:.025},
    {x:"10%",y:"60%",size:380,col:"rgba(155,127,255,",op:dark?.028:.018},
    {x:"85%",y:"75%",size:320,col:"rgba(245,200,66,", op:dark?.022:.014},
  ];
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      {orbs.map((o,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:o.x, top:o.y,
          width:o.size, height:o.size,
          borderRadius:"50%",
          background:`radial-gradient(circle,${o.col}${o.op}) 0%,${o.col}0) 70%)`,
          transform:"translate(-50%,-50%)",
          filter:"blur(60px)",
        }}/>
      ))}
    </div>
  );
}

// ─── PANEL WRAPPER ───────────────────────────────────────────────────────────
function Panel({children, T, style={}}){
  return (
    <div style={{
      background:T.card,
      border:`1px solid ${T.border}`,
      borderRadius:16,
      padding:"22px 24px",
      boxShadow:`0 2px 12px rgba(0,0,0,.06)`,
      ...style
    }}>
      {children}
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KpiCard({label,val,suf,desc,col,pct,T}){
  return (
    <div style={{padding:"22px 22px",background:T.surface,border:`1px solid ${T.border}`,
      borderRadius:14,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-50,right:-50,width:140,height:140,
        borderRadius:"50%",background:col,opacity:.06,filter:"blur(50px)"}}/>
      <div style={{position:"absolute",top:0,right:0,width:3,height:"100%",
        background:`linear-gradient(180deg,${col}40,transparent)`,borderRadius:"0 14px 14px 0"}}/>
      <StatLabel T={T}>{label}</StatLabel>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:36,fontWeight:500,lineHeight:1,
        letterSpacing:"-.03em",color:col,marginBottom:6}}>
        {val}<span style={{fontSize:14,opacity:.4,fontWeight:400,marginLeft:2}}>{suf}</span>
      </div>
      <div style={{fontSize:11.5,color:T.t2,marginBottom:14}}>{desc}</div>
      <div style={{height:2,background:T.card,borderRadius:1,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:1,background:col,width:`${pct}%`,transition:"width 1.2s ease"}}/>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function VentureIQ(){
  const [dark,setDark]=useState(true);
  const [idea,setIdea]=useState("AI-powered note-taking for remote teams");
  const [data,setData]=useState(DEFAULT_DATA);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [activeNav,setActiveNav]=useState("idea");
  const [sideCollapsed,setSideCollapsed]=useState(false);
  const T=useTheme(dark);
  const refs={idea:useRef(),domain:useRef(),intel:useRef(),trends:useRef(),win:useRef()};

  useEffect(()=>{
    const el=document.createElement("style");
    el.id="viq-style";
    el.textContent=`
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:rgba(0,200,180,.2);border-radius:2px;}
      @keyframes shimmer{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}
      @keyframes fadein{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
      @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(0,200,180,.5);}50%{box-shadow:0 0 0 5px rgba(0,200,180,0);}}
      @keyframes spin{to{transform:rotate(360deg);}}
      @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
    `;
    document.head.appendChild(el);
    return()=>el.remove();
  },[]);

  const scan=useCallback(async()=>{
    if(!idea.trim()||loading)return;
    setLoading(true);setError(null);
    try{
      const result=await runScan(idea.trim());
      if(result.competitors){
        result.competitors=result.competitors.map((c,i)=>{
          const g=GRADS[i%GRADS.length];
          return{...c,gradA:c.gradA||g[0],gradB:c.gradB||g[1],initial:c.initial||(c.name||"?")[0].toUpperCase()};
        });
      }
      setData(result);
    }catch(e){
      setError(e.message||"Scan failed");
    }finally{
      setLoading(false);
    }
  },[idea,loading]);

  const navTo=(key)=>{
    setActiveNav(key);
    refs[key]?.current?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  const NAV=[
    {k:"idea",  label:"Idea Scanner",     ico:ICONS.idea,  badge:"Live"},
    {k:"domain",label:"Domain & Brand",   ico:ICONS.domain,badge:null},
    {k:"intel", label:"Competitor Intel", ico:ICONS.intel, badge:null},
    {k:"trends",label:"Market Trends",    ico:ICONS.trends,badge:null},
    {k:"win",   label:"Why They Win",     ico:ICONS.win,   badge:null},
  ];

  const SW = sideCollapsed ? 64 : 220;

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",
      background:T.bg,color:T.text,transition:"background .3s,color .3s",position:"relative"}}>

      <BgOrbs dark={dark}/>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside style={{
        width:SW,background:T.card,
        borderRight:`1px solid ${T.border}`,
        display:"flex",flexDirection:"column",
        position:"fixed",top:0,left:0,height:"100vh",zIndex:200,
        transition:"width .22s ease",overflow:"hidden",
        boxShadow:`2px 0 20px rgba(0,0,0,.07)`
      }}>
        {/* Logo */}
        <div style={{padding:sideCollapsed?"18px 16px":"20px 16px 16px",
          borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",gap:10,minHeight:64,
          justifyContent:sideCollapsed?"center":"flex-start"}}>
          <div style={{width:32,height:32,flexShrink:0,
            background:"linear-gradient(135deg,#00C8B4,#008F82)",
            borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 16px rgba(0,200,180,.25)"}}>
            <Icon path={ICONS.signal} size={15} stroke="#fff" opacity={1}/>
          </div>
          {!sideCollapsed && (
            <span style={{fontFamily:"'Instrument Serif',serif",fontSize:18,fontWeight:400,
              letterSpacing:"-.01em",whiteSpace:"nowrap"}}>
              Venture<span style={{color:A}}>IQ</span>
            </span>
          )}
          {!sideCollapsed && (
            <div onClick={()=>setSideCollapsed(true)}
              style={{marginLeft:"auto",cursor:"pointer",color:T.t3,flexShrink:0,
                width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",
                borderRadius:6,background:T.surface}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 2L4 6l4 4"/>
              </svg>
            </div>
          )}
          {sideCollapsed && (
            <div onClick={()=>setSideCollapsed(false)}
              style={{cursor:"pointer",color:T.t3,width:22,height:22,
                display:"flex",alignItems:"center",justifyContent:"center",
                borderRadius:6,background:T.surface,marginLeft:-4}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 2l4 4-4 4"/>
              </svg>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto",overflowX:"hidden"}}>
          {!sideCollapsed && (
            <div style={{fontSize:"9.5px",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
              color:T.t3,padding:"12px 8px 6px"}}>
              Intelligence
            </div>
          )}
          {sideCollapsed && <div style={{height:16}}/>}
          {NAV.map(n=>(
            <div key={n.k} onClick={()=>navTo(n.k)}
              title={sideCollapsed?n.label:undefined}
              style={{display:"flex",alignItems:"center",gap:9,
                padding:sideCollapsed?"10px":"9px 10px",
                borderRadius:10,cursor:"pointer",marginBottom:2,
                fontSize:13,fontWeight:500,
                color:activeNav===n.k?A:T.t2,
                background:activeNav===n.k?`rgba(0,200,180,0.09)`:"transparent",
                position:"relative",transition:"all .15s",
                justifyContent:sideCollapsed?"center":"flex-start"}}>
              {activeNav===n.k && (
                <div style={{position:"absolute",left:0,top:"20%",height:"60%",
                  width:2.5,background:A,borderRadius:"0 2px 2px 0"}}/>
              )}
              <Icon path={n.ico} size={15} opacity={activeNav===n.k?.9:.55}
                col={activeNav===n.k?A:"currentColor"}/>
              {!sideCollapsed && n.label}
              {!sideCollapsed && n.badge && (
                <span style={{marginLeft:"auto",background:A,color:"#000",fontSize:8.5,
                  fontWeight:800,padding:"2px 7px",borderRadius:20,letterSpacing:".04em"}}>
                  {n.badge}
                </span>
              )}
            </div>
          ))}

          {!sideCollapsed && (
            <div style={{fontSize:"9.5px",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
              color:T.t3,padding:"16px 8px 6px",marginTop:8}}>
              Workspace
            </div>
          )}
          {sideCollapsed && <div style={{height:12}}/>}
          {[{label:"Reports",ico:ICONS.report},{label:"Alerts",ico:ICONS.bell}].map(n=>(
            <div key={n.label} title={sideCollapsed?n.label:undefined}
              style={{display:"flex",alignItems:"center",gap:9,
                padding:sideCollapsed?"10px":"9px 10px",
                borderRadius:10,cursor:"pointer",color:T.t2,fontSize:13,fontWeight:500,
                marginBottom:2,transition:"all .15s",
                justifyContent:sideCollapsed?"center":"flex-start"}}>
              <Icon path={n.ico} size={15} opacity={.5}/>
              {!sideCollapsed && n.label}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{padding:sideCollapsed?"10px 8px":"12px 8px",borderTop:`1px solid ${T.border}`}}>
          <div onClick={()=>setDark(d=>!d)}
            title={sideCollapsed?"Toggle theme":undefined}
            style={{display:"flex",alignItems:"center",gap:8,
              padding:sideCollapsed?"10px":"9px 10px",
              borderRadius:10,cursor:"pointer",background:T.surface,
              color:T.t2,fontSize:12,fontWeight:500,userSelect:"none",
              marginBottom:6,transition:"all .18s",
              justifyContent:sideCollapsed?"center":"flex-start"}}>
            <Icon path={ICONS.sun} size={13} opacity={.65}/>
            {!sideCollapsed && (
              <>
                Theme
                <div style={{width:32,height:17,background:T.bg,borderRadius:9,
                  border:`1px solid ${T.borderHi}`,position:"relative",marginLeft:"auto"}}>
                  <div style={{width:11,height:11,background:A,borderRadius:"50%",
                    position:"absolute",top:2,left:dark?2:17,transition:"left .2s",
                    boxShadow:`0 0 6px ${A}`}}/>
                </div>
              </>
            )}
          </div>
          {!sideCollapsed && (
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",
              borderRadius:10,cursor:"pointer"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                background:"linear-gradient(135deg,#7B61FF,#00C8B4)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>
                AK
              </div>
              <div>
                <div style={{fontSize:12.5,fontWeight:600}}>Alex Kim</div>
                <div style={{fontSize:11,color:A,fontWeight:600,letterSpacing:".02em"}}>Pro Plan</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <main style={{marginLeft:SW,flex:1,minWidth:0,position:"relative",zIndex:1,
        transition:"margin-left .22s ease"}}>

        {/* TOPBAR */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"14px 32px",borderBottom:`1px solid ${T.border}`,
          background:dark?"rgba(19,19,31,.88)":"rgba(240,240,247,.88)",
          position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)"
        }}>
          <div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:21,fontWeight:400,
              letterSpacing:"-.01em"}}>
              Startup Intelligence
            </div>
            <div style={{fontSize:11.5,color:T.t2,marginTop:2,display:"flex",alignItems:"center",gap:6}}>
              {!loading && (
                <div style={{width:5,height:5,borderRadius:"50%",background:A,
                  animation:"pulse-dot 2s infinite",flexShrink:0}}/>
              )}
              {loading && (
                <div style={{width:13,height:13,borderRadius:"50%",
                  border:`1.5px solid ${A}`,borderTopColor:"transparent",
                  animation:"spin .8s linear infinite",flexShrink:0}}/>
              )}
              {loading
                ? <span>Scanning for <strong style={{color:T.text}}>{idea}</strong>…</span>
                : <span>Showing: <strong style={{color:T.text}}>{data.ideaLabel||idea}</strong></span>
              }
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={scan} disabled={loading}
              style={{padding:"9px 22px",borderRadius:10,border:"none",
                fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,
                cursor:loading?"not-allowed":"pointer",
                background:loading?T.surface:A,
                color:loading?T.t2:"#000",
                boxShadow:loading?"none":`0 3px 14px rgba(0,200,180,.3)`,
                opacity:loading?.7:1,transition:"all .2s",
                display:"flex",alignItems:"center",gap:7}}>
              {loading
                ? <><div style={{width:11,height:11,borderRadius:"50%",
                    border:"1.5px solid rgba(0,0,0,.3)",borderTopColor:T.t2,
                    animation:"spin .8s linear infinite"}}/>Scanning…</>
                : "Re-Scan"
              }
            </button>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────── */}
        <div style={{padding:"28px 32px",maxWidth:1300}}>

          {/* Search Bar */}
          <Panel T={T} style={{marginBottom:28}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,position:"relative"}}>
                <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",
                  pointerEvents:"none"}}>
                  <Icon path={ICONS.search} size={14} col={T.t3} opacity={1}/>
                </div>
                <input
                  value={idea}
                  onChange={e=>setIdea(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&scan()}
                  placeholder="Describe your startup idea…"
                  style={{width:"100%",padding:"13px 14px 13px 40px",
                    background:T.surface,
                    border:`1px solid ${T.border}`,
                    borderRadius:10,color:T.text,
                    fontFamily:"'DM Sans',sans-serif",
                    fontSize:14,outline:"none",
                    transition:"border-color .15s"}}
                  onFocus={e=>e.target.style.borderColor=A}
                  onBlur={e=>e.target.style.borderColor=T.border}
                />
              </div>
              <button onClick={scan} disabled={loading}
                style={{padding:"13px 26px",background:A,color:"#000",border:"none",
                  borderRadius:10,fontFamily:"'DM Sans',sans-serif",
                  fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",
                  whiteSpace:"nowrap",boxShadow:`0 4px 16px rgba(0,200,180,.3)`,
                  opacity:loading?.65:1,display:"flex",alignItems:"center",gap:8,
                  transition:"all .2s",letterSpacing:".01em"}}>
                {loading
                  ? <><div style={{width:12,height:12,borderRadius:"50%",
                      border:"1.5px solid rgba(0,0,0,.3)",borderTopColor:"#000",
                      animation:"spin .8s linear infinite"}}/>Scanning…</>
                  : <>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round">
                        <circle cx="8" cy="8" r="6.5"/><path d="M8 5v6M5 8h6"/>
                      </svg>
                      Scan Idea
                    </>
                }
              </button>
            </div>
            {error && (
              <div style={{marginTop:10,padding:"10px 14px",
                background:"rgba(240,96,96,.08)",
                border:"1px solid rgba(240,96,96,.2)",
                borderRadius:8,fontSize:13,color:RED}}>
                {error} — Please try again.
              </div>
            )}
          </Panel>

          {/* Loading skeleton */}
          {loading && (
            <div style={{marginBottom:28,animation:"fadein .3s ease"}}>
              <Panel T={T}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:A,animation:"pulse-dot 1.5s infinite"}}/>
                  <span style={{fontSize:13,color:T.t2,letterSpacing:".01em"}}>
                    Searching the web and compiling real-time intelligence…
                  </span>
                </div>
                <SkeletonSection T={T}/>
              </Panel>
            </div>
          )}

          {/* DATA */}
          {data && (
            <div style={{opacity:loading?.3:1,transition:"opacity .3s",pointerEvents:loading?"none":"auto"}}>

              {/* 1 — IDEA SCANNER */}
              <div ref={refs.idea} style={{marginBottom:32,animation:"fadein .5s ease"}}>
                <SecHd icon={ICONS.idea} title="Idea Scanner" sub="Market viability · real-time analysis" link="Full report →" T={T}/>
                <Panel T={T}>
                  {data.market?.summary && (
                    <div style={{fontSize:13.5,color:T.t2,marginBottom:22,
                      padding:"13px 16px",background:T.surface,borderRadius:10,
                      lineHeight:1.65,borderLeft:`2px solid ${A}`}}>
                      {data.market.summary}
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
                    <KpiCard T={T}
                      label="Market Saturation"
                      val={data.market?.saturation} suf="%"
                      desc={`${(data.competitors||[]).length*10||40} tools tracked`}
                      col={RED} pct={data.market?.saturation||74}/>
                    <KpiCard T={T}
                      label="Opportunity Score"
                      val={data.market?.opportunityScore} suf="/10"
                      desc="Differentiation window"
                      col={A} pct={(data.market?.opportunityScore||0)*10}/>
                    <KpiCard T={T}
                      label="Trend Velocity"
                      val={data.market?.trendVelocity} suf="×"
                      desc={`MoM · ${data.market?.trendDirection||"Rising"}`}
                      col={GOLD} pct={Math.min(100,(data.market?.trendVelocity||1)*25)}/>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    marginBottom:12}}>
                    <StatLabel T={T}>Top Competitors</StatLabel>
                    <Badge dir={data.market?.trendDirection||"Rising"}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                    {(data.competitors||[]).slice(0,3).map((c,i)=><CompCard key={i} c={c} T={T}/>)}
                  </div>
                </Panel>
              </div>

              {/* 2 — DOMAIN & BRAND */}
              <div ref={refs.domain} style={{marginBottom:32}}>
                <SecHd icon={ICONS.domain} title="Domain & Brand" sub="Availability, brandability, trademark signals" link="Register →" T={T}/>
                <Panel T={T}>
                  <StatLabel T={T}>Domain availability — "{(data.domain?.suggestedBrand||"yourbrand").toLowerCase()}"</StatLabel>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
                    {(data.domain?.extensions||[]).map((d,i)=>(
                      <div key={i} style={{
                        background:d.available?`rgba(0,200,180,.07)`:T.surface,
                        border:`1.5px solid ${d.available?A:T.border}`,
                        borderRadius:12,padding:"16px 12px",textAlign:"center",
                        cursor:"pointer",transition:"all .2s",position:"relative",overflow:"hidden"}}>
                        {d.available && (
                          <div style={{position:"absolute",top:0,left:0,right:0,height:2,
                            background:`linear-gradient(90deg,${A}60,${A})`}}/>
                        )}
                        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,fontWeight:400,
                          marginBottom:5,color:d.available?A:T.text}}>
                          {d.ext}
                        </div>
                        <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",
                          letterSpacing:".08em",color:d.available?A:RED}}>
                          {d.available?"Available":"Taken"}
                        </div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:T.t3,marginTop:4}}>
                          {d.available?d.price:"—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
                    {[
                      {label:"Brandability Score",val:data.domain?.brandability,suf:"/100",col:A,sub:"Memorability · length · spelling"},
                      {label:"Clean Brand Probability",val:data.domain?.cleanBrand,suf:"%",col:GOLD,
                        sub:data.domain?.trademarkNote?"1 potential conflict detected":"No conflicts detected"},
                    ].map((b,i)=>(
                      <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,
                        borderRadius:12,padding:"20px 22px"}}>
                        <StatLabel T={T}>{b.label}</StatLabel>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:40,fontWeight:500,
                          lineHeight:1,color:b.col,letterSpacing:"-.03em"}}>
                          {b.val}<span style={{fontSize:15,color:T.t3,fontWeight:400}}>{b.suf}</span>
                        </div>
                        <div style={{fontSize:11.5,color:T.t2,marginTop:6}}>{b.sub}</div>
                        <div style={{height:2,background:T.card,borderRadius:1,marginTop:12,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:1,background:b.col,width:`${b.val||0}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  <StatLabel T={T}>Alternative suggestions</StatLabel>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16}}>
                    {(data.domain?.suggestions||[]).map((s,i)=>(
                      <span key={i} style={{padding:"5px 13px",borderRadius:8,fontSize:12.5,
                        fontWeight:500,background:T.surface,color:T.t2,
                        border:`1px solid ${T.border}`,cursor:"pointer",
                        transition:"all .15s",fontFamily:"'DM Mono',monospace"}}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {data.domain?.trademarkNote && (
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",
                      background:"rgba(245,200,66,.05)",
                      border:"1px solid rgba(245,200,66,.16)",
                      borderRadius:10,padding:"13px 16px"}}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"
                        style={{flexShrink:0,marginTop:1}}>
                        <path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3M7 10v.5"/>
                      </svg>
                      <div style={{fontSize:12.5,color:T.t2,lineHeight:1.6}}>
                        <strong style={{color:GOLD}}>Trademark note — </strong>
                        {data.domain.trademarkNote}
                      </div>
                    </div>
                  )}
                </Panel>
              </div>

              {/* 3 — COMPETITOR INTELLIGENCE */}
              <div ref={refs.intel} style={{marginBottom:32}}>
                <SecHd icon={ICONS.intel} title="Competitor Intelligence" sub="Hover any card for full detail" link="Add competitor →" T={T}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {(data.competitors||[]).slice(0,4).map((c,i)=><IntelCard key={i} c={c} T={T}/>)}
                </div>
              </div>

              {/* 4 — MARKET TRENDS */}
              <div ref={refs.trends} style={{marginBottom:32}}>
                <SecHd icon={ICONS.trends} title="Market Trends" sub="Signal tracking · last 90 days" link="Expand →" T={T}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16}}>
                  <Panel T={T}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
                      <div>
                        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,fontWeight:400,marginBottom:3}}>
                          Mention Volume
                        </div>
                        <div style={{fontSize:11,color:T.t3}}>Reddit · Hacker News · X/Twitter · Product Hunt</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <Badge dir={data.trends?.direction||"Rising"}/>
                        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:7,justifyContent:"flex-end"}}>
                          {[["Reddit",A],["HN",GOLD],["X",PUR],["PH",AMB]].map(([l,c])=>(
                            <span key={l} style={{display:"flex",alignItems:"center",gap:5,
                              fontSize:11,color:T.t2}}>
                              <span style={{width:6,height:6,borderRadius:2,background:c,flexShrink:0}}/>
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <TrendChart series={data.trends?.series} months={data.trends?.months} dark={dark} T={T}/>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16,
                      paddingTop:16,borderTop:`1px solid ${T.border}`}}>
                      <span style={{fontSize:11.5,color:T.t2,fontWeight:600,whiteSpace:"nowrap"}}>
                        Momentum
                      </span>
                      <div style={{flex:1,height:4,background:T.surface,borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",
                          background:`linear-gradient(90deg,${A},${GOLD})`,
                          borderRadius:2,width:`${data.trends?.momentum||72}%`}}/>
                      </div>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:A,
                        whiteSpace:"nowrap",fontWeight:500}}>
                        {data.trends?.momentum||72} / 100
                      </span>
                    </div>
                  </Panel>

                  {/* Channel Cards */}
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(data.trends?.channels||[]).map((ch,i)=>{
                      const col=ch.pct>=80?A:ch.pct>=40?GOLD:AMB;
                      return (
                        <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,
                          borderRadius:12,padding:"11px 14px",flex:1,cursor:"pointer",
                          transition:"all .18s",boxShadow:`0 1px 6px rgba(0,0,0,.05)`}}>
                          <div style={{display:"flex",justifyContent:"space-between",
                            alignItems:"center",marginBottom:3}}>
                            <span style={{fontSize:12,fontWeight:700,letterSpacing:".01em"}}>{ch.name}</span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,
                              fontWeight:500,color:col}}>
                              +{ch.pct}%
                            </span>
                          </div>
                          <div style={{fontSize:10.5,color:T.t3,marginBottom:7,lineHeight:1.4}}>
                            {ch.desc}
                          </div>
                          <div style={{height:2,background:T.surface,borderRadius:1,overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:1,background:col,
                              width:`${Math.min(100,ch.pct)}%`}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5 — WHY THEY WIN */}
              <div ref={refs.win} style={{marginBottom:32}}>
                <SecHd icon={ICONS.win} title="Why They Win"
                  sub={`Competitive advantage — ${data.competitive?.topCompetitor||"Top Competitor"} vs. market`}
                  T={T}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <Panel T={T}>
                    <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,fontWeight:400,marginBottom:3}}>
                      Competitive Radar
                    </div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:18}}>
                      {data.competitive?.topCompetitor} vs. Market Average
                    </div>
                    <RadarChart
                      labels={data.competitive?.radarLabels}
                      comp={data.competitive?.radarComp}
                      market={data.competitive?.radarMarket}
                      dark={dark}/>
                    <div style={{display:"flex",gap:20,marginTop:14,justifyContent:"center"}}>
                      {[[A,data.competitive?.topCompetitor||"Leader"],["rgba(245,200,66,.55)","Market Avg"]].map(([c,l])=>(
                        <span key={l} style={{display:"flex",alignItems:"center",gap:5,
                          fontSize:11,color:T.t2}}>
                          <span style={{width:7,height:7,borderRadius:2,background:c}}/>{l}
                        </span>
                      ))}
                    </div>
                  </Panel>

                  <Panel T={T}>
                    <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,fontWeight:400,marginBottom:3}}>
                      Advantage Areas
                    </div>
                    <div style={{fontSize:11,color:T.t3,marginBottom:20}}>
                      Scores out of 10 — your opportunities highlighted
                    </div>
                    {(data.competitive?.advantages||[]).slice(0,6).map((a,i)=>{
                      const col=SCORE_COLOR(a.score);
                      return (
                        <div key={i} style={{marginBottom:18}}>
                          <div style={{display:"flex",justifyContent:"space-between",
                            alignItems:"baseline",marginBottom:7}}>
                            <span style={{fontSize:13,fontWeight:700,display:"flex",
                              alignItems:"center",gap:6}}>
                              {a.isOpportunity && (
                                <span style={{width:5,height:5,borderRadius:"50%",
                                  background:A,flexShrink:0,display:"inline-block"}}/>
                              )}
                              {a.area}
                            </span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,
                              fontWeight:500,color:col}}>
                              {a.score}
                            </span>
                          </div>
                          <div style={{height:4,background:T.surface,borderRadius:2,overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:2,background:col,
                              width:`${a.score*10}%`,transition:"width 1.4s ease"}}/>
                          </div>
                          <div style={{fontSize:11.5,color:a.isOpportunity?A:T.t3,
                            marginTop:5,fontWeight:a.isOpportunity?600:400,lineHeight:1.4}}>
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
    </div>
  );
}
