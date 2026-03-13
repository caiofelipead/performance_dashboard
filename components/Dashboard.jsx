import { useState, useMemo } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Cell, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Heart, Zap, Shield, Users, Eye } from "lucide-react";

const P=[{n:"ADRIANO",pos:"ZAG",h:5,e:4,rg:7,rp:6,d:2,sq:7,rpa:7,da:1.6,sa:7.3,nw:39,pse:3,sra:331,w:82.7,nc:60,ai:1.24,cmj:49.6,ct:[54.2,50.3,48.5,51.4,52,52.2,52.6,49.6],wt:{dt:["02","03","07","09","10","11","12"],s:[10,8,7,7,8,7,7],r:[8,6,6,8,8,7,6],dr:[1,1,1,1,2,1,2]}},{n:"BRENNO",pos:"GOL",h:4,e:4,rg:8,rp:8,d:3,sq:7,rpa:7.3,da:1.3,sa:7.3,nw:50,pse:4,sra:310,w:90.8,nc:75,ai:1.17,cmj:44.6,ct:[45,47.8,49.3,48,47.6,49.3,46.2,44.6],wt:{dt:["04","05","06","07","09","10","11"],s:[7,7,7,6,10,8,7],r:[7,7,8,5,8,7,8],dr:[0,0,0,0,0,2,3]}},{n:"CARLOS EDUARDO",pos:"ZAG",h:5,e:3,rg:8,rp:8,d:2,sq:8,rpa:7.9,da:1,sa:9.2,nw:57,pse:3,sra:391,w:85.9,ck:973,nc:75,ai:1.07,cmj:46.7,ckm:973,ct:[49.1,44,47.1,44.5,48.8,46.5,52.6,46.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,9,8,8,9,10,8],r:[9,5,6,9,8,6,8],dr:[1,1,0,0,0,2,2]}},{n:"DARLAN",pos:"MC",h:4,e:3,rg:9,rp:8,d:0,sq:8,rpa:7.8,da:.7,sa:7.8,nw:17,pse:5,sra:317,w:80.2,nc:20,ai:.95,cmj:31.1,ct:[31.1]},{n:"ERICSON",pos:"ZAG",h:5,e:3,rg:10,rp:9,d:3,sq:9,rpa:6.7,da:1.1,sa:8.8,nw:51,pse:0,sra:431,w:91.6,ck:562,nc:75,ai:.64,cmj:43.1,ckm:916,ct:[44.3,47.4,42.4,47.1,50.9,50.9,55.5,43.1],wt:{dt:["26","27","28","02","03","04","06"],s:[9,9,9,7,9,8,9],r:[6,6,5,8,7,9,9],dr:[1,1,1,1,4,3,3]}},{n:"ERIK",pos:"ATA",h:5,e:4,rg:7,rp:7,d:0,sq:9,rpa:7.2,da:.2,sa:9.3,nw:22,pse:6,sra:308,w:75.5,nc:59,ai:1.97,ct:[54.1,52.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,8,8,10,10,9],r:[7,8,7,10,7,7,7],dr:[0,0,0,0,0,0,0]}},{n:"FELIPINHO",pos:"LAT",h:5,e:3,rg:7,rp:7,d:0,sq:7,rpa:6.8,da:0,sa:7.5,nw:16,pse:7,sra:347,w:78,nc:27,ai:.85,cmj:38.9,ct:[44.5,38.9]},{n:"GABRIEL INOCENCIO",pos:"MC",h:4,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.8,da:.4,sa:7.2,nw:58,pse:3,sra:407,w:78.5,ck:533,nc:75,ai:.97,cmj:48.2,ckm:916,ct:[48.2,52.3,45.3,48.9,53.6,49.3,50.8,48.2],wt:{dt:["04","05","06","09","10","11","12"],s:[8,9,8,8,7,7,8],r:[7,7,7,8,8,8,8],dr:[1,2,7,2,2,2,1]}},{n:"GUI MARIANO",pos:"ZAG",h:5,e:4,rg:8,rp:8,d:4,sq:8,rpa:7.6,da:.3,sa:8.2,nw:59,pse:7,sra:476,w:89.7,nc:75,ai:1.1,cmj:53.1,ct:[52.4,52.2,52,55.1,47.5,53.7,53.5,53.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,9,9,8,8],r:[7,7,5,10,8,6,8],dr:[0,0,0,0,0,0,4]}},{n:"GUILHERME QUEIROZ",pos:"ZAG",h:5,e:3,rg:7,rp:7,d:2,sq:8,rpa:7.3,da:1.5,sa:6.9,nw:56,pse:6,sra:369,w:87.9,ck:493,nc:75,ai:1.14,cmj:46,ckm:493,ct:[43.3,43.3,46.2,47.4,44.7,48.3,48,46],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,7,7,5,8],r:[10,7,6,8,6,7,7],dr:[0,0,1,0,1,1,2]}},{n:"GUSTAVO VILAR",pos:"LAT",h:5,e:3,rg:6,rp:6,d:0,sq:7,rpa:6.5,da:.2,sa:7.7,nw:55,pse:5,sra:410,w:86.4,ck:658,nc:75,ai:1.07,cmj:43.5,ckm:1113,ct:[43.3,42.9,47.9,42.8,43.1,44,44.8,43.5]},{n:"HEBERT",pos:"ZAG",h:5,e:3,rg:8,rp:7,d:0,sq:7,rpa:6.7,da:.1,sa:7.7,nw:46,pse:5,sra:366,w:88.1,nc:59,ai:1.04,cmj:46.9,ct:[50.1,49.8,50,52.5,48.6,51.2,53.3,46.9]},{n:"HENRIQUE TELES",pos:"LAT",h:5,e:4,rg:8,rp:8,d:2,sq:8,rpa:7,da:1.4,sa:7.7,nw:54,pse:6,sra:415,w:80.1,ck:415,nc:69,ai:1.14,cmj:45.5,ckm:415,ct:[53.1,55.5,49.8,54.9,51.6,50.8,55.1,45.5],wt:{dt:["04","05","07","09","10","11","12"],s:[8,9,6,9,8,9,8],r:[6,8,6,10,8,9,8],dr:[2,1,7,5,3,3,2]}},{n:"HYGOR",pos:"MC",h:5,e:4,rg:10,rp:8,d:2,sq:7,rpa:8.8,da:1.6,sa:9.2,nw:57,pse:4,sra:387,w:83.3,ck:749,nc:75,ai:1.12,cmj:42.1,ckm:1034,ct:[40.8,44.5,39.9,44.2,43.5,42.4,41.9,42.1],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,10,10,10,10,7],r:[10,6,8,10,8,8,8],dr:[0,2,0,0,0,3,2]}},{n:"JEFFERSON NEM",pos:"ATA",h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:7.1,da:.8,sa:7.9,nw:57,pse:7,sra:423,w:72.5,ck:985,nc:75,ai:.97,cmj:47.5,ckm:3539,ct:[44,48.2,44.5,50.4,50,44.1,47.2,47.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,7],r:[7,6,7,8,8,7,7],dr:[0,0,0,0,0,0,2]}},{n:"JONATHAN",pos:"LAT",h:5,e:4,rg:5,rp:5,d:4,sq:7,rpa:5.8,da:2.9,sa:5.9,nw:51,pse:4,sra:333,w:73.7,ck:981,nc:75,ai:1.14,cmj:42.8,ckm:1372,ct:[46.4,46.8,46.9,37.3,45,44.7,45,42.8],wt:{dt:["04","05","07","09","10","11","12"],s:[5,7,6,6,6,6,7],r:[6,7,4,7,5,6,5],dr:[3,3,3,2,3,3,4]}},{n:"JORDAN",pos:"MC",h:5,e:3,rg:7,rp:7,d:0,sq:9,rpa:8,da:.7,sa:8,nw:60,pse:4,sra:418,w:92.2,nc:75,ai:1.1,cmj:54.1,ct:[52.2,53.4,53.4,53.2,54.5,56,55.7,54.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,9],r:[8,8,6,8,8,7,7],dr:[1,0,0,0,0,0,0]}},{n:"KELVIN",pos:"ATA",h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:6.9,da:3,sa:7.4,nw:49,pse:3,sra:288,w:74.6,ck:207,nc:67,ai:.86,cmj:38.4,ckm:375,ct:[40.4,38.3,40.8,40.2,40.6,39.5,42.3,38.4],wt:{dt:["04","05","06","09","10","11","12"],s:[7,9,8,9,9,8,7],r:[7,7,7,10,10,9,7],dr:[3,3,3,0,0,2,2]}},{n:"LEANDRO MACIEL",pos:"LAT",h:4,e:3,rg:8,rp:8,d:0,sq:9,rpa:7.7,da:.5,sa:8.6,nw:57,pse:4,sra:399,w:91.3,ck:349,nc:75,ai:1.08,cmj:43.8,ckm:510,ct:[41.7,47.4,40.5,46.2,47.8,44.3,50.4,43.8],wt:{dt:["05","06","07","09","10","11","12"],s:[8,7,9,8,8,8,9],r:[8,7,8,8,7,7,8],dr:[0,1,0,0,0,1,0]}},{n:"MARANHAO",pos:"MC",h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:6.9,da:1,sa:6.8,nw:58,pse:4,sra:339,w:75.1,ck:274,nc:75,ai:.95,cmj:42.2,ckm:419,ct:[45.2,45.2,44.4,48.8,44.9,43.8,54.1,42.2],wt:{dt:["05","06","07","09","10","11","12"],s:[7,5,6,7,7,7,7],r:[7,6,5,7,7,7,7],dr:[1,1,1,1,1,1,1]}},{n:"MARQUINHO JR.",pos:"ATA",h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.4,da:0,sa:8.1,nw:58,pse:5,sra:360,w:64.9,ck:511,nc:75,ai:1.17,cmj:41.3,ckm:511,ct:[44.4,45.7,42.6,46.7,43.1,42.5,47.6,41.3]},{n:"MATHEUS SALES",pos:"MC",h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:7.2,da:.6,sa:6.8,nw:58,pse:7,sra:454,w:80.1,ck:558,nc:75,ai:1.06,cmj:44.3,ckm:558,ct:[47.4,47.9,46.1,47.3,44.3,49.1,49.8,44.3],wt:{dt:["05","06","07","09","10","11","12"],s:[6,4,8,7,7,5,7],r:[7,4,5,8,8,7,7],dr:[1,2,1,0,1,2,1]}},{n:"MORELLI",pos:"MC",h:5,e:3,rg:6,rp:7,d:0,sq:8,rpa:7,da:.5,sa:7.4,nw:56,pse:3,sra:356,w:82.4,ck:298,nc:75,ai:1.07,cmj:43.8,ckm:621,ct:[46,50.6,44.9,44.8,43.8,38.1,46.6,43.8]},{n:"PATRICK BREY",pos:"ATA",h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.9,da:2,sa:7.3,nw:33,pse:3,sra:385,w:73.5,ck:347,nc:63,ai:1.3,ct:[43.2,42.6,42.3,41.9,41,45.8,42.8,45.1],wt:{dt:["05","06","07","09","10","11","12"],s:[4,7,2,9,8,7,8],r:[4,5,3,9,8,7,8],dr:[3,2,4,0,0,3,1]}},{n:"PEDRINHO",pos:"MC",h:5,e:3,rg:8,rp:8,d:0,sq:10,rpa:7.3,da:.4,sa:9.9,nw:44,pse:6,sra:343,w:67.5,nc:52,ai:1.02,cmj:45.5,ct:[41.6,42.6,38.6,42.9,44.9,40.1,44,45.5]},{n:"PEDRO TORTELLO",pos:"LAT",h:5,e:3,rg:7,rp:7,d:0,sq:10,rpa:8.4,da:.3,sa:9.2,nw:56,pse:4,sra:381,w:75.1,nc:75,ai:1.14,cmj:41,ct:[40.6,47.6,41.3,43.7,39.2,41.6,44,41]},{n:"RAFAEL GAVA",pos:"MC",h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:6.2,da:1,sa:5.8,nw:55,pse:7,sra:364,w:78.3,ck:303,nc:75,ai:1.1,ckm:2969,ct:[36.2,38.9,33.8,33.6,39.2,35.3,36.7,38.7],wt:{dt:["05","06","07","09","10","11","12"],s:[4,4,6,4,5,6,8],r:[5,5,6,4,7,7,7],dr:[1,1,1,0,0,0,0]}},{n:"THALLES",pos:"ZAG",h:5,e:4,rg:10,rp:10,d:2,sq:7,rpa:5.7,da:.5,sa:7.4,dpo:1,nw:60,pse:3,sra:409,w:83.9,ck:1865,nc:75,ai:1.19,cmj:43.3,ckm:1865,ct:[46.4,44.1,44,45.1,43,47.4,44.9,43.3],wt:{dt:["04","05","06","07","09","11","12"],s:[7,7,10,6,7,8,7],r:[5,5,7,4,7,10,10],dr:[3,0,0,3,3,3,2]}},{n:"VICTOR SOUZA",pos:"GOL",h:4,e:3,rg:7,rp:7,d:0,sq:6,rpa:7.2,da:.5,sa:6.1,nw:57,pse:3,sra:473,w:92.8,nc:75,ai:1.04,cmj:46.9,ct:[55.4,56.5,60.9,57.9,58.7,53.2,59.5,46.9]},{n:"WALLACE",pos:"LAT",h:4,e:3,rg:7,rp:7,d:0,sq:8,rpa:6.7,da:.8,sa:7.8,nw:47,pse:5,sra:305,w:91.6,nc:75,ai:.98,cmj:40.8,ct:[43.6,38.3,40.3,39.4,40.8],wt:{dt:["04","05","06","09","10","11","12"],s:[8,8,8,8,8,8,8],r:[7,8,5,8,7,7,7],dr:[2,2,2,0,2,2,0]}},{n:"WHALACY",pos:"MC",h:5,e:3,rg:6,rp:6,d:0,sq:9,rpa:6,da:.1,sa:8.8,nw:21,pse:5,sra:277,w:72.3,nc:34,ai:1.05,cmj:42.8,ct:[42.3,39.7,41.3,40.5,42.4,42.9,42.8]},{n:"YURI",pos:"LAT",h:4,e:4,rg:8,rp:8,d:0,sq:8,rpa:7.9,da:0,sa:8.1,nw:49,pse:6,sra:320,w:66.4,nc:69,ai:1.16,cmj:41.5,ct:[40.8,44.9,43.8,43.2,42.8,42.9,43.5,41.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,8,8,8],r:[9,8,7,8,7,8,8],dr:[0,0,0,0,0,0,0]}}];

const score=(p)=>{
  let s=0,reasons=[];
  if(p.ai>1.45){s+=30;reasons.push("ACWR "+p.ai.toFixed(2));}else if(p.ai>1.3){s+=15;reasons.push("ACWR "+p.ai.toFixed(2));}else if(p.ai&&p.ai<.8){s+=20;reasons.push("Subcarga "+p.ai.toFixed(2));}
  if(p.d>=4){s+=20;reasons.push("Dor "+p.d+"/10");}else if(p.d>=2){s+=8;reasons.push("Dor "+p.d+"/10");}
  if(p.rp<=5){s+=18;reasons.push("RecP "+p.rp+"/10");}else if(p.rp<=6){s+=8;}
  if(p.ck&&p.ck>1000){s+=25;reasons.push("CK "+Math.round(p.ck));}else if(p.ck&&p.ck>600){s+=12;reasons.push("CK "+Math.round(p.ck));}
  if(p.da>=2.5){s+=10;reasons.push("Dor avg "+p.da);}
  if(p.sa&&p.sa<6){s+=8;reasons.push("Sono avg "+p.sa);}
  if(p.rpa&&p.rpa<6){s+=6;}
  return {score:Math.min(s,100),reasons,level:s>=40?"CRITICAL":s>=20?"HIGH":s>=8?"MODERATE":"LOW"};
};

const LV={CRITICAL:{c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA",l:"Crítico"},HIGH:{c:"#EA580C",bg:"#FFF7ED",bc:"#FED7AA",l:"Alto"},MODERATE:{c:"#CA8A04",bg:"#FEFCE8",bc:"#FEF08A",l:"Moderado"},LOW:{c:"#16A34A",bg:"#F0FDF4",bc:"#BBF7D0",l:"Ótimo"}};
const pri="#1C3F3A",acc="#CCFF00",sec="#EBE8D8";
const humorL={1:"Raiva",2:"Confuso",3:"Preocupado",4:"Confiante",5:"Tranquilo"};

const Tip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,.06)"}}>
    <div style={{color:"#94a3b8",marginBottom:3,fontWeight:600}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color||pri,fontWeight:600}}>{p.name}: {typeof p.value==="number"?p.value.toFixed(1):p.value}</div>)}
  </div>;
};

const ScoreRing=({v,sz=48,th=4})=>{
  const c=v>=40?"#DC2626":v>=20?"#EA580C":v>=8?"#CA8A04":"#16A34A";
  const pct=Math.min(v/100,1),r=(sz-th)/2,ci=2*Math.PI*r;
  return <div style={{position:"relative",width:sz,height:sz,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={th}/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c} strokeWidth={th} strokeDasharray={ci} strokeDashoffset={ci*(1-pct)} strokeLinecap="round"/>
    </svg>
    <div style={{position:"absolute",fontFamily:"'JetBrains Mono'",fontSize:sz/3.5,fontWeight:700,color:c}}>{v}</div>
  </div>;
};

const Badge=({level})=>{const l=LV[level];return <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:l.bg,color:l.c,border:`1px solid ${l.bc}`}}>{l.l}</span>;};

const WBar=({label,v,max=10,inv})=>{
  const c=inv?(v>5?"#DC2626":v>3?"#CA8A04":"#16A34A"):(v>7?"#16A34A":v>5?"#CA8A04":"#DC2626");
  return <div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
      <span style={{fontSize:11,color:"#64748b",fontWeight:500}}>{label}</span>
      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:c}}>{v?.toFixed?.(1)??v}</span>
    </div>
    <div style={{height:4,background:"#f1f5f9",borderRadius:4}}>
      <div style={{height:"100%",width:`${Math.min((v/max)*100,100)}%`,background:c,borderRadius:4,transition:"width .6s"}}/>
    </div>
  </div>;
};

export default function Dashboard(){
  const [sel,setSel]=useState(null);
  const [tab,setTab]=useState("squad");

  const players=useMemo(()=>P.map(p=>{const s=score(p);return {...p,riskScore:s.score,risk:s.level,reasons:s.reasons};}).sort((a,b)=>b.riskScore-a.riskScore),[]);
  const sp=sel?players.find(p=>p.n===sel):null;
  const tabs=[{id:"squad",l:"Squad Overview",ic:Users},{id:"alerts",l:"Alertas",ic:AlertTriangle},{id:"player",l:"Individual",ic:Eye}];

  const radarData=sp?[{s:"Sono",v:sp.sq||0},{s:"Rec Geral",v:sp.rg||0},{s:"Rec Pernas",v:sp.rp||0},{s:"Dor (inv)",v:10-(sp.d||0)},{s:"Humor",v:(sp.h||3)*2},{s:"Energia",v:(sp.e||3)*2.5}]:[];
  const wtData=sp?.wt?sp.wt.dt.map((d,i)=>({d:"Mar/"+d,sono:sp.wt.s[i],rec:sp.wt.r[i],dor:sp.wt.dr[i]})):[];
  const cmjData=sp?.ct?sp.ct.map((v,i)=>({i:i+1,v})):[];

  return <div style={{minHeight:"100vh",background:"#f8fafb",fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:"#1e293b"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:#e2e8f0 transparent}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`}</style>

    {/* HEADER */}
    <header style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"0 28px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:30,height:30,borderRadius:8,background:pri,display:"flex",alignItems:"center",justifyContent:"center",color:acc,fontSize:14,fontWeight:900}}>B</div>
          <div>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri,letterSpacing:-.3}}>Performance Intelligence</div>
            <div style={{fontSize:10,color:"#94a3b8",fontWeight:500}}>Botafogo-SP FSA · 2026</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2}}>
          {tabs.map(t=>{const Ic=t.ic;return <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,background:tab===t.id?"#f0fdf4":"transparent",border:`1px solid ${tab===t.id?"#bbf7d0":"transparent"}`,color:tab===t.id?pri:"#94a3b8",padding:"6px 14px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}><Ic size={14}/>{t.l}</button>})}
        </div>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#94a3b8",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#16A34A",display:"inline-block"}}/>12/Mar/2026 · 39 atletas
        </div>
      </div>
    </header>

    <div style={{display:"flex",padding:16,gap:16,maxWidth:1440,margin:"0 auto"}}>
      {/* SIDEBAR */}
      <aside style={{width:240,flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,paddingLeft:4}}>Elenco — Risco</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:"calc(100vh - 100px)",overflowY:"auto",paddingRight:4}}>
          {players.map(p=><div key={p.n} onClick={()=>{setSel(p.n);setTab("player")}} style={{background:sel===p.n?"#fff":"transparent",border:`1px solid ${sel===p.n?"#e2e8f0":"transparent"}`,borderRadius:10,padding:"8px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .15s",boxShadow:sel===p.n?"0 2px 8px rgba(0,0,0,.04)":"none"}}>
            <ScoreRing v={p.riskScore} sz={38} th={3}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#1e293b"}}>{p.n}</div>
              <div style={{display:"flex",gap:4,marginTop:2,alignItems:"center"}}>
                <Badge level={p.risk}/>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#94a3b8"}}>{p.pos}</span>
              </div>
            </div>
          </div>)}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,minWidth:0}}>
        {tab==="squad"&&<div>
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:16}}>
            {[{l:"Críticos",v:players.filter(p=>p.risk==="CRITICAL").length,c:"#DC2626",ic:AlertTriangle},
              {l:"Alto Risco",v:players.filter(p=>p.risk==="HIGH").length,c:"#EA580C",ic:Zap},
              {l:"ACWR > 1.45",v:players.filter(p=>p.ai>1.45).length,c:"#CA8A04",ic:TrendingUp},
              {l:"CK > 800",v:players.filter(p=>p.ck&&p.ck>800).length,c:"#DC2626",ic:Activity},
              {l:"Ótimos",v:players.filter(p=>p.risk==="LOW").length,c:"#16A34A",ic:CheckCircle2}
            ].map((k,i)=>{const Ic=k.ic;return <div key={i} style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,letterSpacing:.5}}>{k.l}</div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:28,fontWeight:800,color:k.c,marginTop:2}}>{k.v}</div></div>
                <Ic size={20} color={k.c} opacity={.4}/>
              </div>
            </div>})}
          </div>

          {/* Charts Row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>ACWR Interno (sRPE) — Elenco</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={players.filter(p=>p.ai).slice(0,25)} margin={{bottom:45}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:"#94a3b8"}} angle={-50} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:"#94a3b8"}} domain={[0,2.2]}/>
                  <Tooltip content={<Tip/>}/>
                  <ReferenceLine y={1.45} stroke="#DC2626" strokeDasharray="4 4" label={{value:"1.45",fill:"#DC2626",fontSize:9}}/>
                  <ReferenceLine y={.8} stroke="#EA580C" strokeDasharray="4 4" label={{value:"0.80",fill:"#EA580C",fontSize:9}}/>
                  <Bar dataKey="ai" name="ACWR" radius={[3,3,0,0]}>
                    {players.filter(p=>p.ai).slice(0,25).map((p,i)=><Cell key={i} fill={LV[p.risk].c}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>CK Seriado</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={players.filter(p=>p.ck).sort((a,b)=>b.ck-a.ck)} margin={{bottom:45}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:"#94a3b8"}} angle={-50} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:"#94a3b8"}}/>
                  <Tooltip content={<Tip/>}/>
                  <ReferenceLine y={800} stroke="#DC2626" strokeDasharray="4 4"/>
                  <Bar dataKey="ck" name="CK (U/L)" radius={[3,3,0,0]}>
                    {players.filter(p=>p.ck).sort((a,b)=>b.ck-a.ck).map((p,i)=><Cell key={i} fill={p.ck>800?"#DC2626":p.ck>500?"#EA580C":"#16A34A"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wellness + CMJ */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Wellness Squad — Média</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><WBar label="Sono (qualidade)" v={+(players.reduce((s,p)=>s+(p.sq||0),0)/players.length).toFixed(1)} max={10}/><WBar label="Rec. Geral" v={+(players.reduce((s,p)=>s+(p.rg||0),0)/players.length).toFixed(1)} max={10}/><WBar label="Rec. Pernas" v={+(players.reduce((s,p)=>s+(p.rp||0),0)/players.length).toFixed(1)} max={10}/></div>
                <div><WBar label="Dor" v={+(players.reduce((s,p)=>s+(p.d||0),0)/players.length).toFixed(1)} max={10} inv/><WBar label="Humor (1-5)" v={+(players.reduce((s,p)=>s+(p.h||0),0)/players.length).toFixed(1)} max={5}/><WBar label="Energia (1-4)" v={+(players.reduce((s,p)=>s+(p.e||0),0)/players.length).toFixed(1)} max={4}/></div>
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>CMJ — Último Teste</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={players.filter(p=>p.cmj).sort((a,b)=>b.cmj-a.cmj).slice(0,15)} margin={{bottom:35}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:"#94a3b8"}} angle={-45} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:"#94a3b8"}} domain={[30,58]}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="cmj" name="CMJ (cm)" fill={pri} opacity={.75} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>}

        {tab==="alerts"&&<div>
          <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri,marginBottom:4}}>Alertas Ativos</div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>12/Mar/2026 · Score de criticidade composto (ACWR + Wellness + CK + Dor)</div>
          {players.filter(p=>p.riskScore>=8).map((p,i)=>{
            const lv=LV[p.risk];
            const rx=p.risk==="CRITICAL"?
              (p.ai>1.45?"Reduzir volume 30% por 3 dias. sRPE alvo < 300.":p.ck>1000?"Remonitorar CK em 48h. Se >800, carga reduzida.":p.d>=4?"Fisioterapia preventiva imediata. Avaliar cadeia posterior.":"Monitoramento diário reforçado."):
              p.risk==="HIGH"?
              (p.ai>1.3?"Atenção à progressão de carga. Evitar picos de sprint.":p.ck>600?"CK elevado — evitar treino excêntrico pesado.":"Manter monitoramento. Cruzar GPS pós-treino."):
              "Manter rotina de monitoramento.";
            return <div key={i} style={{background:"#fff",borderRadius:12,border:`1px solid ${lv.bc}`,padding:16,marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <ScoreRing v={p.riskScore} sz={48} th={4}/>
                  <div>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:"#1e293b"}}>{p.n} <Badge level={p.risk}/> <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#94a3b8",fontWeight:400,marginLeft:4}}>{p.pos} · {p.w}kg</span></div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {p.reasons.map((r,j)=><span key={j} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:lv.bg,color:lv.c,border:`1px solid ${lv.bc}`}}>{r}</span>)}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#94a3b8"}}>ACWR int</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:700,color:p.ai>1.45?"#DC2626":p.ai<.8?"#EA580C":"#1e293b"}}>{p.ai?.toFixed(2)||"-"}</div>
                </div>
              </div>
              <div style={{marginTop:10,padding:"8px 12px",background:lv.bg,borderRadius:8,border:`1px solid ${lv.bc}`,fontSize:12,color:lv.c}}>
                <strong style={{fontFamily:"'Inter Tight'"}}>Recomendação:</strong> {rx}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginTop:10}}>
                {[{l:"PSE",v:p.pse},{l:"sRPE avg",v:p.sra},{l:"Sono",v:p.sq},{l:"RecP",v:p.rp},{l:"Dor",v:p.d},{l:"CMJ",v:p.cmj||"-"}].map((m,j)=>
                  <div key={j} style={{textAlign:"center",padding:"6px 0",background:"#f8fafc",borderRadius:6}}>
                    <div style={{fontSize:9,color:"#94a3b8"}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:"#1e293b"}}>{m.v}</div>
                  </div>)}
              </div>
            </div>;})}
        </div>}

        {tab==="player"&&sp&&<div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <ScoreRing v={sp.riskScore} sz={72} th={5}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Inter Tight'",fontSize:20,fontWeight:900,color:pri}}>{sp.n} <Badge level={sp.risk}/> <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#94a3b8",fontWeight:400,marginLeft:6}}>{sp.pos} · {sp.w}kg · {sp.nc} sessões</span></div>
                {sp.reasons.length>0&&<div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                  {sp.reasons.map((r,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:LV[sp.risk].bg,color:LV[sp.risk].c,border:`1px solid ${LV[sp.risk].bc}`}}>{r}</span>)}
                </div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12,marginTop:12}}>
                  {[{l:"ACWR Int",v:sp.ai?.toFixed(2)||"-"},{l:"PSE",v:sp.pse},{l:"sRPE avg",v:sp.sra},{l:"CK",v:sp.ck?Math.round(sp.ck):"-"},{l:"CMJ",v:sp.cmj||"-"},{l:"Humor",v:humorL[sp.h]},{l:"Energia",v:sp.e<=2?"Baixa":"OK"}].map((m,i)=>
                    <div key={i} style={{textAlign:"center"}}><div style={{fontSize:9,color:"#94a3b8",fontWeight:500}}>{m.l}</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:15,fontWeight:700,color:pri,marginTop:1}}>{m.v}</div></div>)}
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Wellness Radar</div>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={radarData}><PolarGrid stroke="#e2e8f0"/><PolarAngleAxis dataKey="s" tick={{fontSize:9,fill:"#64748b"}}/><PolarRadiusAxis tick={false} domain={[0,10]}/><Radar dataKey="v" stroke={pri} fill={pri} fillOpacity={.08} strokeWidth={2}/></RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Último Questionário</div>
              <WBar label={`Sono — avg temporada ${sp.sa||"-"}`} v={sp.sq||0} max={10}/>
              <WBar label="Recuperação Geral" v={sp.rg||0} max={10}/>
              <WBar label={`Rec. Pernas — avg ${sp.rpa||"-"}`} v={sp.rp||0} max={10}/>
              <WBar label={`Dor — avg ${sp.da||"-"}`} v={sp.d||0} max={10} inv/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                <div style={{padding:8,background:"#f8fafc",borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:"#94a3b8"}}>Humor</div><div style={{fontSize:13,fontWeight:700,color:sp.h<=2?"#DC2626":"#16A34A"}}>{humorL[sp.h]}</div></div>
                <div style={{padding:8,background:"#f8fafc",borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:"#94a3b8"}}>sRPE avg</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:pri}}>{sp.sra}</div></div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {wtData.length>0&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Tendência 7 Dias</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={wtData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="d" tick={{fontSize:9,fill:"#94a3b8"}}/><YAxis tick={{fontSize:9,fill:"#94a3b8"}} domain={[0,10]}/><Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="sono" name="Sono" stroke="#7c3aed" fill="#7c3aed" fillOpacity={.05} strokeWidth={2}/>
                  <Area type="monotone" dataKey="rec" name="Rec Pernas" stroke="#16A34A" fill="#16A34A" fillOpacity={.05} strokeWidth={1.5}/>
                  <Area type="monotone" dataKey="dor" name="Dor" stroke="#DC2626" fill="#DC2626" fillOpacity={.05} strokeWidth={1.5} strokeDasharray="4 4"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>}
            {cmjData.length>1&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>CMJ Trend ({cmjData.length} testes)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={cmjData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="i" tick={{fontSize:9,fill:"#94a3b8"}}/><YAxis tick={{fontSize:9,fill:"#94a3b8"}} domain={["dataMin-3","dataMax+3"]}/><Tooltip content={<Tip/>}/>
                  <Line type="monotone" dataKey="v" name="CMJ (cm)" stroke={pri} strokeWidth={2.5} dot={{r:3,fill:pri,stroke:"#fff",strokeWidth:2}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>}
          </div>
        </div>}

        {tab==="player"&&!sp&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:40,textAlign:"center",color:"#94a3b8"}}>
          <Users size={32} style={{marginBottom:12,opacity:.4}}/><div style={{fontSize:14,fontWeight:600}}>Selecione um atleta na barra lateral</div>
        </div>}
      </main>
    </div>
  </div>;
}
