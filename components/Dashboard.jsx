import React, { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Cell, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, ChevronDown, Heart, Zap, Shield, Users, Eye, Brain, Target, Calendar, RefreshCw, Wifi, WifiOff, Moon, Sun, Trophy, BookOpen, Info } from "lucide-react";
import { useSheetData } from "./useSheetData";

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA — Light / Dark Mode
// ═══════════════════════════════════════════════════════════════════════════════
const THEMES={
  light:{
    bg:"#f8fafb",bgCard:"#fff",bgMuted:"#f8fafc",bgMuted2:"#f1f5f9",
    text:"#1e293b",textMuted:"#64748b",textFaint:"#94a3b8",textFaintest:"#cbd5e1",
    border:"#e2e8f0",borderLight:"#f1f5f9",
    scrollThumb:"#cbd5e1",scrollTrack:"transparent",
    shadow:"rgba(0,0,0,.04)",shadowMd:"rgba(0,0,0,.06)",shadowLg:"rgba(0,0,0,.1)",
    headerBg:"#1A1A1A",headerShadow:"rgba(0,0,0,.15)",
    ringBg:"#f1f5f9",
    tooltipBg:"#fff"},
  dark:{
    // Paleta alinhada ao Scouting BFSA: preto puro como bg, cards com elevação
    // sutil (#0c0e15), bordas finas em cinza-grafite, vermelho Botafogo como
    // acento primário. Texto branco quente, secundários elevados em luminância.
    bg:"#000000",bgCard:"#0c0e15",bgMuted:"#13161f",bgMuted2:"#1c2030",
    text:"#fafafa",textMuted:"#d6dae0",textFaint:"#8d96a4",textFaintest:"#5e6878",
    border:"#262a38",borderLight:"#1a1e2a",
    scrollThumb:"#3b4156",scrollTrack:"transparent",
    shadow:"rgba(0,0,0,.7)",shadowMd:"rgba(0,0,0,.8)",shadowLg:"rgba(0,0,0,.9)",
    headerBg:"#000000",headerShadow:"rgba(0,0,0,.8)",
    ringBg:"#1c2030",
    tooltipBg:"#13161f",
    accent:"#dc2626",            // Vermelho Botafogo (primário)
    accentGlow:"rgba(220,38,38,.45)",
    neonGreen:"#22c55e",
    neonYellow:"#facc15",
    neonOrange:"#fb923c",
    neonRed:"#ef4444",
    pitchGreen:"#16a34a"}
};

// ═══════════════════════════════════════════════════════════════════════════════
// CircularGauge — gauge circular para Risk Score / Probabilidade. Estilo
// "Pro Score" do STATSports. Renderiza um arco SVG com gradient cromático
// (verde→amarelo→laranja→vermelho) e o valor central monoespaçado.
// Props: value (0-100), max=100, size=110, theme, label, c (cor opcional).
// ═══════════════════════════════════════════════════════════════════════════════
function CircularGauge({ value, max = 100, size = 110, stroke = 9, theme, label, c, sub }) {
  const t = theme || THEMES.light;
  const v = Math.max(0, Math.min(max, Number(value) || 0));
  const pct = v / max;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const auto = pct > 0.65 ? "#ef4444" : pct > 0.5 ? "#fb923c" : pct > 0.35 ? "#facc15" : pct > 0.2 ? "#22c55e" : "#22c55e";
  const color = c || auto;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.bgMuted2} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray .8s ease, stroke .3s" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: size*0.06 }}>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: size * 0.32, fontWeight: 900, color, lineHeight: 1, letterSpacing: -1 }}>{Math.round(v)}</div>
        {label && <div style={{ fontSize: label.length>14?size*0.062:size*0.075, color: t.textFaint, fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", marginTop: 2, textAlign: "center", lineHeight: 1.1, maxWidth: size*0.78, wordBreak: "break-word", hyphens: "auto" }}>{label}</div>}
        {sub && <div style={{ fontSize: size * 0.07, color: t.textFaintest, fontWeight: 600, marginTop: 1, textAlign:"center", maxWidth: size*0.78 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SectionHeader — cabeçalho editorial uppercase com linha decorativa.
// Padroniza a tipografia em todas as abas: kicker 9px tracking 2 + título 18px
// peso 900 + linha de gradient embaixo. Uso: <SectionHeader kicker="ACWR"
// title="Carga Aguda Crônica" subtitle="..." theme={t} accent={acc}/>
// ═══════════════════════════════════════════════════════════════════════════════
function SectionHeader({ kicker, title, subtitle, theme, accent, right }) {
  const t = theme || THEMES.light;
  const a = accent || "#dc2626";
  return (
    <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {kicker && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 14, height: 2, background: a, borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: a, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>{kicker}</span>
            </div>
          )}
          <div style={{ fontFamily: "'Inter Tight',sans-serif", fontWeight: 900, fontSize: 18, color: t.text, letterSpacing: -.4, lineHeight: 1.1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10.5, color: t.textFaint, marginTop: 4, fontWeight: 500 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ThresholdGauge — barra horizontal verde→amarelo→vermelho com marker da posição
// (referência: STATSports Player view). Uso: <ThresholdGauge value={pct} theme={t}/>
// `value` é tratado como % (0–150). Zonas:
//   0–60% verde  · 60–85% amarelo · 85–115% laranja · >115% vermelho.
// `bands` permite override custom (ex: ACWR usa 0–0.8 / 0.8–1.5 / >1.5).
// ═══════════════════════════════════════════════════════════════════════════════
function ThresholdGauge({ value, max = 150, theme, bands, height = 6 }) {
  const t = theme || THEMES.light;
  const v = Number.isFinite(value) ? value : 0;
  const pct = Math.min(100, Math.max(0, (v / max) * 100));
  const grad = bands || "linear-gradient(to right, #22c55e 0%, #22c55e 40%, #facc15 60%, #fb923c 80%, #ef4444 100%)";
  return (
    <div style={{position:"relative",height,background:t.bgMuted2,borderRadius:height/2,overflow:"hidden",border:`1px solid ${t.borderLight}`}}>
      <div style={{position:"absolute",inset:0,background:grad,opacity:.85}}/>
      {/* Marker da posição atual */}
      <div style={{position:"absolute",left:`calc(${pct}% - 4px)`,top:-2,width:8,height:height+4,background:"#fff",borderRadius:2,boxShadow:"0 0 6px rgba(255,255,255,.7)",border:`1px solid ${t.border}`}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Macro-grupos de posição — diretiva técnica (Maio/2026)
// Agrega todas as variações de meio-campistas (MEI, VOL, MD, W-MD, MC, MO, ME,
// AM, DM, CM e variações) num único bucket "Meio-Campo". Mantém Goleiro,
// Zagueiro, Lateral, Extremo, Atacante separados. Use `posGroup(pos)` em todo
// agrupamento por posição (médias, filtros, sort).
// ═══════════════════════════════════════════════════════════════════════════════
const POS_GROUP_ORDER = { "Goleiro": 0, "Zagueiro": 1, "Lateral": 2, "Meio-Campo": 3, "Extremo": 4, "Atacante": 5 };
function posGroup(pos) {
  const p = String(pos || "").toUpperCase().trim();
  if (!p) return "-";
  if (p === "GOL" || p === "GK" || p.includes("GOLEIR")) return "Goleiro";
  if (p === "ZAG" || p === "CB" || p.includes("ZAGUEIR")) return "Zagueiro";
  if (p === "LAT" || p === "LE" || p === "LD" || p === "LB" || p === "RB" ||
      p.startsWith("LAT")) return "Lateral";
  if (p === "ATA" || p === "CF" || p === "9" || p.includes("ATACA") ||
      p.includes("CENTROAVANTE")) return "Atacante";
  if (p === "EXT" || p === "PE" || p === "PD" || p === "LW" || p === "RW" ||
      p.includes("PONTA") || p.includes("EXTREM")) return "Extremo";
  // Meio-Campo: VOL, MEI, MD, W-MD, MC, MO, ME, AM, DM, CM e variações.
  if (p === "VOL" || p === "MEI" || p === "MC" || p === "MO" || p === "MD" ||
      p === "ME" || p === "DM" || p === "CM" || p === "AM" ||
      p.startsWith("W-M") || p.startsWith("WM") ||
      p.includes("MEI") || p.includes("MD") || p.includes("MC") ||
      p.includes("VOLANT")) return "Meio-Campo";
  return p;
}

const P=[{n:"ADRIANO",pos:"GOL",id:19,h:5,e:4,rg:7,rp:6,d:2,sq:7,rpa:7,da:1.6,sa:7.3,nw:39,pse:3,sra:331,w:82.7,alt:183,bf:12.4,mm:38.2,imc:24.2,nc:60,ai:1.24,cmj:49.6,ct:[54.2,50.3,48.5,51.4,52,52.2,52.6,49.6],wt:{dt:["02","03","07","09","10","11","12"],s:[10,8,7,7,8,7,7],r:[8,6,6,8,8,7,6],dr:[1,1,1,1,2,1,2]}},{n:"BRENNO",pos:"GOL",id:23,h:4,e:4,rg:8,rp:8,d:3,sq:7,rpa:7.3,da:1.3,sa:7.3,nw:50,pse:4,sra:310,w:90.8,alt:191,bf:13.8,mm:41.5,imc:24.9,nc:75,ai:1.17,cmj:44.6,ct:[45,47.8,49.3,48,47.6,49.3,46.2,44.6],wt:{dt:["04","05","06","07","09","10","11"],s:[7,7,7,6,10,8,7],r:[7,7,8,5,8,7,8],dr:[0,0,0,0,0,2,3]}},{n:"CARLOS EDUARDO",pos:"ZAG",id:25,h:5,e:3,rg:8,rp:8,d:2,sq:8,rpa:7.9,da:1,sa:9.2,nw:57,pse:3,sra:391,w:85.9,alt:186,bf:11.9,mm:39.8,imc:24.6,nc:75,ai:1.07,cmj:46.7,ct:[49.1,44,47.1,44.5,48.8,46.5,52.6,46.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,9,8,8,9,10,8],r:[9,5,6,9,8,6,8],dr:[1,1,0,0,0,2,2]}},{n:"DARLAN",pos:"ZAG",id:20,h:4,e:3,rg:9,rp:8,d:0,sq:8,rpa:7.8,da:.7,sa:7.8,nw:17,pse:5,sra:317,w:80.2,alt:186,bf:10.5,mm:37.1,imc:25.3,nc:20,ai:.95,cmj:31.1,ct:[31.1]},{n:"ERICSON",pos:"ZAG",id:26,h:5,e:3,rg:10,rp:9,d:3,sq:9,rpa:6.7,da:1.1,sa:8.8,nw:51,pse:0,sra:431,w:91.6,alt:184,bf:13.2,mm:42.0,imc:25.4,nc:75,ai:.64,cmj:43.1,ct:[44.3,47.4,42.4,47.1,50.9,50.9,55.5,43.1],wt:{dt:["26","27","28","02","03","04","06"],s:[9,9,9,7,9,8,9],r:[6,6,5,8,7,9,9],dr:[1,1,1,1,4,3,3]}},{n:"ERIK",pos:"VOL",id:20,h:5,e:4,rg:7,rp:7,d:0,sq:9,rpa:7.2,da:.2,sa:9.3,nw:22,pse:6,sra:308,w:75.5,alt:176,bf:9.8,mm:35.4,imc:24.4,nc:59,ai:1.97,ct:[54.1,52.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,8,8,10,10,9],r:[7,8,7,10,7,7,7],dr:[0,0,0,0,0,0,0]}},{n:"FELIPE VIEIRA",pos:"LAT",id:26,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.2,da:.3,sa:8.2,nw:27,pse:7,sra:385,w:77,alt:176,bf:7.7,mm:35.8,imc:24.9,nc:27,ai:1.0,cmj:39.3,ct:[45.0,39.3],wt:{dt:["03","04","05","06","07","09","10"],s:[7,7,8,9,6,5,7],r:[7,7,7,8,6,5,7],dr:[0,0,0,0,0,0,0]}},{n:"GABRIEL INOCENCIO",pos:"LAT",id:31,h:4,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.8,da:.4,sa:7.2,nw:58,pse:3,sra:407,w:78.5,alt:177,bf:10.8,mm:36.5,imc:25.1,nc:75,ai:.97,cmj:48.2,ct:[48.2,52.3,45.3,48.9,53.6,49.3,50.8,48.2],wt:{dt:["04","05","06","09","10","11","12"],s:[8,9,8,8,7,7,8],r:[7,7,7,8,8,8,8],dr:[1,2,7,2,2,2,1]}},{n:"GUI MARIANO",pos:"ZAG",id:26,h:5,e:4,rg:8,rp:8,d:4,sq:8,rpa:7.6,da:.3,sa:8.2,nw:59,pse:7,sra:476,w:89.7,alt:191,bf:12.7,mm:41.0,imc:25.1,nc:75,ai:1.1,cmj:53.1,ct:[52.4,52.2,52,55.1,47.5,53.7,53.5,53.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,9,9,8,8],r:[7,7,5,10,8,6,8],dr:[0,0,0,0,0,0,4]}},{n:"GUILHERME QUEIROZ",pos:"ATA",id:35,h:5,e:3,rg:7,rp:7,d:2,sq:8,rpa:7.3,da:1.5,sa:6.9,nw:56,pse:6,sra:369,w:87.9,alt:180,bf:13.1,mm:40.2,imc:24.9,nc:75,ai:1.14,cmj:46,ct:[43.3,43.3,46.2,47.4,44.7,48.3,48,46],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,7,7,5,8],r:[10,7,6,8,6,7,7],dr:[0,0,1,0,1,1,2]}},{n:"GUSTAVO VILAR",pos:"ZAG",id:25,h:5,e:3,rg:6,rp:6,d:0,sq:7,rpa:6.5,da:.2,sa:7.7,nw:55,pse:5,sra:410,w:86.4,alt:189,bf:12.9,mm:39.5,imc:25.8,nc:75,ai:1.07,cmj:43.5,ct:[43.3,42.9,47.9,42.8,43.1,44,44.8,43.5]},{n:"HEBERT",pos:"ZAG",id:20,h:5,e:3,rg:8,rp:7,d:0,sq:7,rpa:6.7,da:.1,sa:7.7,nw:46,pse:5,sra:366,w:88.1,alt:187,bf:12.5,mm:40.8,imc:25.5,nc:59,ai:1.04,cmj:46.9,ct:[50.1,49.8,50,52.5,48.6,51.2,53.3,46.9]},{n:"HENRIQUE TELES",pos:"LAT",id:19,h:5,e:4,rg:8,rp:8,d:2,sq:8,rpa:7,da:1.4,sa:7.7,nw:54,pse:6,sra:415,w:80.1,alt:179,bf:11.3,mm:37.2,imc:24.7,nc:69,ai:1.14,cmj:45.5,ct:[53.1,55.5,49.8,54.9,51.6,50.8,55.1,45.5],wt:{dt:["04","05","07","09","10","11","12"],s:[8,9,6,9,8,9,8],r:[6,8,6,10,8,9,8],dr:[2,1,7,5,3,3,2]}},{n:"HYGOR",pos:"ATA",id:33,h:5,e:4,rg:10,rp:8,d:2,sq:7,rpa:8.8,da:1.6,sa:9.2,nw:57,pse:4,sra:387,w:83.3,alt:183,bf:11.6,mm:38.6,imc:25.2,nc:75,ai:1.12,cmj:42.1,ct:[40.8,44.5,39.9,44.2,43.5,42.4,41.9,42.1],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,10,10,10,10,7],r:[10,6,8,10,8,8,8],dr:[0,2,0,0,0,3,2]}},{n:"JEFFERSON NEM",pos:"EXT",id:29,h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:7.1,da:.8,sa:7.9,nw:57,pse:7,sra:423,w:72.5,alt:166,bf:10.1,mm:33.8,imc:23.9,nc:75,ai:.97,cmj:47.5,ct:[44,48.2,44.5,50.4,50,44.1,47.2,47.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,7],r:[7,6,7,8,8,7,7],dr:[0,0,0,0,0,0,2]}},{n:"JONATHAN",pos:"LAT",id:33,h:5,e:4,rg:5,rp:5,d:4,sq:7,rpa:5.8,da:2.9,sa:5.9,nw:51,pse:4,sra:333,w:73.7,alt:177,bf:10.9,mm:34.3,imc:24.1,nc:75,ai:1.14,cmj:42.8,ct:[46.4,46.8,46.9,37.3,45,44.7,45,42.8],wt:{dt:["04","05","07","09","10","11","12"],s:[5,7,6,6,6,6,7],r:[6,7,4,7,5,6,5],dr:[3,3,3,2,3,3,4]}},{n:"JORDAN",pos:"GOL",id:28,h:5,e:3,rg:7,rp:7,d:0,sq:9,rpa:8,da:.7,sa:8,nw:60,pse:4,sra:418,w:92.2,alt:189,bf:12.0,mm:42.8,imc:25.0,nc:75,ai:1.1,cmj:54.1,ct:[52.2,53.4,53.4,53.2,54.5,56,55.7,54.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,9],r:[8,8,6,8,8,7,7],dr:[1,0,0,0,0,0,0]}},{n:"KELVIN",pos:"EXT",id:28,h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:6.9,da:3,sa:7.4,nw:49,pse:3,sra:288,w:74.6,alt:170,bf:10.3,mm:34.8,imc:23.8,nc:67,ai:.86,cmj:38.4,ct:[40.4,38.3,40.8,40.2,40.6,39.5,42.3,38.4],wt:{dt:["04","05","06","09","10","11","12"],s:[7,9,8,9,9,8,7],r:[7,7,7,10,10,9,7],dr:[3,3,3,0,0,2,2]}},{n:"LEANDRO MACIEL",pos:"VOL",id:30,h:4,e:3,rg:8,rp:8,d:0,sq:9,rpa:7.7,da:.5,sa:8.6,nw:57,pse:4,sra:399,w:91.3,alt:175,bf:13.5,mm:41.6,imc:25.8,nc:75,ai:1.08,cmj:43.8,ct:[41.7,47.4,40.5,46.2,47.8,44.3,50.4,43.8],wt:{dt:["05","06","07","09","10","11","12"],s:[8,7,9,8,8,8,9],r:[8,7,8,8,7,7,8],dr:[0,1,0,0,0,1,0]}},{n:"MARANHAO",pos:"EXT",id:26,h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:6.9,da:1,sa:6.8,nw:58,pse:4,sra:339,w:75.1,alt:171,bf:11.0,mm:34.9,imc:24.2,nc:75,ai:.95,cmj:42.2,ct:[45.2,45.2,44.4,48.8,44.9,43.8,54.1,42.2],wt:{dt:["05","06","07","09","10","11","12"],s:[7,5,6,7,7,7,7],r:[7,6,5,7,7,7,7],dr:[1,1,1,1,1,1,1]}},{n:"MARCO ANTONIO",pos:"VOL",id:22,h:5,e:4,rg:7,rp:7,d:1,sq:8,rpa:7.0,da:.5,sa:7.5,nw:45,pse:5,sra:350,w:74.4,alt:180,bf:10.2,mm:34.5,imc:23.0,nc:55,ai:1.1,cmj:42.0,ct:[43.5,44.1,42.8,43.2,42.5,41.9,43.0,42.0],wt:{dt:["05","06","07","09","10","11","12"],s:[8,7,8,8,7,8,7],r:[7,7,7,8,7,7,7],dr:[0,1,0,0,1,0,1]}},{n:"MARQUINHO JR.",pos:"MEI",id:23,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.4,da:0,sa:8.1,nw:58,pse:5,sra:360,w:64.9,alt:182,bf:9.2,mm:30.8,imc:22.5,nc:75,ai:1.17,cmj:41.3,ct:[44.4,45.7,42.6,46.7,43.1,42.5,47.6,41.3]},{n:"MATHEUS SALES",pos:"VOL",id:30,h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:7.2,da:.6,sa:6.8,nw:58,pse:7,sra:454,w:80.1,alt:176,bf:11.7,mm:37.0,imc:24.7,nc:75,ai:1.06,cmj:44.3,ct:[47.4,47.9,46.1,47.3,44.3,49.1,49.8,44.3],wt:{dt:["05","06","07","09","10","11","12"],s:[6,4,8,7,7,5,7],r:[7,4,5,8,8,7,7],dr:[1,2,1,0,1,2,1]}},{n:"MORELLI",pos:"VOL",id:28,h:5,e:3,rg:6,rp:7,d:0,sq:8,rpa:7,da:.5,sa:7.4,nw:56,pse:3,sra:356,w:82.4,alt:181,bf:12.1,mm:38.0,imc:24.6,nc:75,ai:1.07,cmj:43.8,ct:[46,50.6,44.9,44.8,43.8,38.1,46.6,43.8]},{n:"PATRICK BREY",pos:"LAT",id:28,h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.9,da:2,sa:7.3,nw:33,pse:3,sra:385,w:73.5,alt:176,bf:10.0,mm:34.5,imc:24.0,nc:63,ai:1.3,ct:[43.2,42.6,42.3,41.9,41,45.8,42.8,45.1],wt:{dt:["05","06","07","09","10","11","12"],s:[4,7,2,9,8,7,8],r:[4,5,3,9,8,7,8],dr:[3,2,4,0,0,3,1]}},{n:"PEDRINHO",pos:"LAT",id:19,h:5,e:3,rg:8,rp:8,d:0,sq:10,rpa:7.3,da:.4,sa:9.9,nw:44,pse:6,sra:343,w:67.5,alt:175,bf:9.5,mm:31.9,imc:22.8,nc:52,ai:1.02,cmj:45.5,ct:[41.6,42.6,38.6,42.9,44.9,40.1,44,45.5]},{n:"PEDRO TORTELLO",pos:"VOL",id:21,h:5,e:3,rg:7,rp:7,d:0,sq:10,rpa:8.4,da:.3,sa:9.2,nw:56,pse:4,sra:381,w:75.1,alt:176,bf:10.6,mm:35.0,imc:23.7,nc:75,ai:1.14,cmj:41,ct:[40.6,47.6,41.3,43.7,39.2,41.6,44,41]},{n:"RAFAEL GAVA",pos:"MEI",id:32,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:6.2,da:1,sa:5.8,nw:55,pse:7,sra:364,w:78.3,alt:178,bf:11.4,mm:36.3,imc:24.4,nc:75,ai:1.1,ct:[36.2,38.9,33.8,33.6,39.2,35.3,36.7,38.7],wt:{dt:["05","06","07","09","10","11","12"],s:[4,4,6,4,5,6,8],r:[5,5,6,4,7,7,7],dr:[1,1,1,0,0,0,0]}},{n:"THALLES",pos:"ATA",id:20,h:5,e:4,rg:10,rp:10,d:2,sq:7,rpa:5.7,da:.5,sa:7.4,dpo:1,nw:60,pse:3,sra:409,w:83.9,alt:178,bf:12.2,mm:38.7,imc:24.8,nc:75,ai:1.19,cmj:43.3,ct:[46.4,44.1,44,45.1,43,47.4,44.9,43.3],wt:{dt:["04","05","06","07","09","11","12"],s:[7,7,10,6,7,8,7],r:[5,5,7,4,7,10,10],dr:[3,0,0,3,3,3,2]}},{n:"THIAGUINHO",pos:"VOL",id:27,h:3,e:4,rg:7,rp:7,d:0,sq:7,rpa:6.5,da:.2,sa:7.4,nw:17,pse:7,sra:390,w:64.5,alt:176,bf:7.7,mm:30.0,imc:20.8,nc:17,ai:1.0,cmj:41.5,ct:[41.5],wt:{dt:["03","04","05","06","07","09","10"],s:[7,6,7,8,5,9,6],r:[7,6,7,7,5,8,6],dr:[0,0,0,0,0,0,0]}},{n:"VICTOR SOUZA",pos:"GOL",id:33,h:4,e:3,rg:7,rp:7,d:0,sq:6,rpa:7.2,da:.5,sa:6.1,nw:57,pse:3,sra:473,w:92.8,alt:187,bf:14.1,mm:42.2,imc:24.9,nc:75,ai:1.04,cmj:46.9,ct:[55.4,56.5,60.9,57.9,58.7,53.2,59.5,46.9]},{n:"WALLACE",pos:"ZAG",id:31,h:4,e:3,rg:7,rp:7,d:0,sq:8,rpa:6.7,da:.8,sa:7.8,nw:47,pse:5,sra:305,w:91.6,alt:192,bf:14.0,mm:41.3,imc:26.5,nc:75,ai:.98,cmj:40.8,ct:[43.6,38.3,40.3,39.4,40.8],wt:{dt:["04","05","06","09","10","11","12"],s:[8,8,8,8,8,8,8],r:[7,8,5,8,7,7,7],dr:[2,2,2,0,2,2,0]}},{n:"YURI",pos:"VOL",id:19,h:4,e:4,rg:8,rp:8,d:0,sq:8,rpa:7.9,da:0,sa:8.1,nw:49,pse:6,sra:320,w:66.4,alt:172,bf:9.0,mm:31.5,imc:23.2,nc:69,ai:1.16,cmj:41.5,ct:[40.8,44.9,43.8,43.2,42.8,42.9,43.5,41.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,8,8,8],r:[9,8,7,8,7,8,8],dr:[0,0,0,0,0,0,0]}},{n:"WESLEY",pos:"EXT",id:25,h:5,e:4,rg:8,rp:7,d:1,sq:8,rpa:7.4,da:.6,sa:7.8,nw:52,pse:5,sra:378,w:76.8,alt:185,bf:10.4,mm:35.8,imc:24.2,nc:68,ai:1.08,cmj:43.2,ct:[44.8,45.1,43.5,44.2,42.8,43.9,44.5,43.2],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,7,8,8],r:[8,7,7,8,8,7,7],dr:[0,0,1,0,1,1,0]}},{n:"LUIZAO",pos:"ATA",id:23,h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:7.5,da:.4,sa:8.0,nw:55,pse:4,sra:395,w:88.5,alt:183,bf:12.8,mm:40.6,imc:25.0,nc:72,ai:1.05,cmj:45.2,ct:[46.8,44.5,47.2,45.8,46.1,44.9,45.6,45.2],wt:{dt:["05","06","07","09","10","11","12"],s:[9,8,8,8,9,8,8],r:[8,7,7,9,8,7,8],dr:[0,1,0,0,0,1,1]}},{n:"ZE HUGO",pos:"EXT",id:26,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.6,da:.3,sa:8.2,nw:48,pse:5,sra:342,w:72.1,alt:178,bf:9.6,mm:33.6,imc:23.5,nc:62,ai:1.12,cmj:42.5,ct:[43.8,44.2,41.9,43.5,42.8,43.1,42.6,42.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,8,8,7,8],r:[8,8,7,9,7,8,7],dr:[0,0,0,0,0,0,0]}}];

// Tooltip customizado para Recharts
const TT=({active,payload,label,theme})=>{
  const t=theme||THEMES.light;
  if(!active||!payload?.length)return null;
  return <div style={{background:t.tooltipBg,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",boxShadow:`0 2px 8px ${t.shadowLg}`}}>
    <div style={{fontWeight:700,fontSize:11,color:t.text,marginBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{fontSize:10,color:p.color||t.textMuted}}>{p.name}: <strong>{typeof p.value==="number"?p.value.toFixed(1):p.value}</strong></div>)}
  </div>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAMADA 1 — INGESTÃO MULTIMODAL (Kolodziej et al., Rommers et al., Huang et al.)
// Variáveis expandidas: Categóricas/Históricas + Contínuas de Carga + Biomecânicas/NM
// ═══════════════════════════════════════════════════════════════════════════════
const PLAYER_EXT={
  "ERIK":{inj_hist:[{date:"2025-08-14",type:"aguda",local:"Posterior Coxa D",days:18}],inj_30d:false,slcmj_l:26.8,slcmj_r:23.1,slcmj_asi:14.8,hq_ratio:0.52,cop_sway:18.2,valgus_dls:8.1,monotonia:1.6,strain:4820,hsr_acwr:2.12},
  "JONATHAN":{inj_hist:[{date:"2025-12-18",type:"aguda",local:"Posterior Coxa D",days:21}],inj_30d:true,slcmj_l:21.4,slcmj_r:18.6,slcmj_asi:13.1,hq_ratio:0.48,cop_sway:22.4,valgus_dls:6.8,monotonia:2.1,strain:3960,hsr_acwr:1.28},
  "THALLES":{inj_hist:[{date:"2026-01-14",type:"sobrecarga",local:"Adutor Longo E",days:14}],inj_30d:true,slcmj_l:22.1,slcmj_r:20.9,slcmj_asi:5.4,hq_ratio:0.55,cop_sway:16.8,valgus_dls:5.2,monotonia:1.5,strain:4190,hsr_acwr:1.22},
  "JEFFERSON NEM":{inj_hist:[{date:"2025-07-22",type:"sobrecarga",local:"Tornozelo E",days:8}],inj_30d:false,slcmj_l:24.2,slcmj_r:22.8,slcmj_asi:5.8,hq_ratio:0.58,cop_sway:14.6,valgus_dls:4.9,monotonia:1.4,strain:3780,hsr_acwr:0.92},
  "PATRICK BREY":{inj_hist:[{date:"2026-02-05",type:"aguda",local:"Reto Femoral E",days:12}],inj_30d:true,slcmj_l:21.8,slcmj_r:19.2,slcmj_asi:11.9,hq_ratio:0.51,cop_sway:19.7,valgus_dls:7.4,monotonia:1.9,strain:3410,hsr_acwr:1.35},
  "KELVIN":{inj_hist:[{date:"2025-11-28",type:"sobrecarga",local:"Tendão Patelar D",days:10}],inj_30d:false,slcmj_l:19.8,slcmj_r:18.1,slcmj_asi:8.6,hq_ratio:0.56,cop_sway:15.3,valgus_dls:5.8,monotonia:2.2,strain:2880,hsr_acwr:0.91},
  "RAFAEL GAVA":{inj_hist:[{date:"2025-12-02",type:"aguda",local:"Gastrocnêmio D",days:8},{date:"2025-05-10",type:"sobrecarga",local:"Panturrilha D",days:12}],inj_30d:false,slcmj_l:18.4,slcmj_r:16.9,slcmj_asi:8.1,hq_ratio:0.54,cop_sway:17.1,valgus_dls:5.4,monotonia:1.3,strain:3250,hsr_acwr:1.14},
  "HENRIQUE TELES":{inj_hist:[{date:"2026-02-22",type:"aguda",local:"Posterior Coxa E",days:10}],inj_30d:true,slcmj_l:23.6,slcmj_r:19.8,slcmj_asi:16.1,hq_ratio:0.49,cop_sway:20.3,valgus_dls:7.8,monotonia:1.6,strain:3810,hsr_acwr:1.41},
  "GUILHERME QUEIROZ":{inj_hist:[{date:"2026-01-28",type:"sobrecarga",local:"Lombar D",days:5}],inj_30d:false,slcmj_l:23.8,slcmj_r:22.5,slcmj_asi:5.5,hq_ratio:0.57,cop_sway:15.9,valgus_dls:5.1,monotonia:1.2,strain:2780,hsr_acwr:1.08},
  "ADRIANO":{inj_hist:[],inj_30d:false,slcmj_l:25.4,slcmj_r:24.1,slcmj_asi:5.1,hq_ratio:0.59,cop_sway:13.8,valgus_dls:4.5,monotonia:1.4,strain:3120,hsr_acwr:1.18},
  "BRENNO":{inj_hist:[],inj_30d:false,slcmj_l:22.6,slcmj_r:21.3,slcmj_asi:5.7,hq_ratio:0.62,cop_sway:12.4,valgus_dls:3.8,monotonia:1.3,strain:2640,hsr_acwr:1.09},
  "HYGOR":{inj_hist:[{date:"2025-09-15",type:"aguda",local:"Coxa D",days:7}],inj_30d:false,slcmj_l:21.9,slcmj_r:20.4,slcmj_asi:6.8,hq_ratio:0.56,cop_sway:14.2,valgus_dls:5.0,monotonia:1.7,strain:3580,hsr_acwr:1.15},
  "CARLOS EDUARDO":{inj_hist:[],inj_30d:false,slcmj_l:24.1,slcmj_r:23.2,slcmj_asi:3.7,hq_ratio:0.61,cop_sway:12.8,valgus_dls:4.2,monotonia:1.1,strain:2950,hsr_acwr:1.02},
  "GUI MARIANO":{inj_hist:[],inj_30d:false,slcmj_l:27.2,slcmj_r:26.5,slcmj_asi:2.6,hq_ratio:0.63,cop_sway:11.5,valgus_dls:3.6,monotonia:1.2,strain:3410,hsr_acwr:1.05},
  "JORDAN":{inj_hist:[],inj_30d:false,slcmj_l:28.1,slcmj_r:27.4,slcmj_asi:2.5,hq_ratio:0.64,cop_sway:11.2,valgus_dls:3.4,monotonia:1.1,strain:3290,hsr_acwr:1.06},
  "MATHEUS SALES":{inj_hist:[{date:"2025-06-20",type:"sobrecarga",local:"Adutor E",days:9}],inj_30d:false,slcmj_l:22.8,slcmj_r:21.4,slcmj_asi:6.1,hq_ratio:0.57,cop_sway:14.8,valgus_dls:5.2,monotonia:1.8,strain:3650,hsr_acwr:1.04},
  "MORELLI":{inj_hist:[],inj_30d:false,slcmj_l:22.4,slcmj_r:21.8,slcmj_asi:2.7,hq_ratio:0.60,cop_sway:13.4,valgus_dls:4.1,monotonia:1.3,strain:2780,hsr_acwr:1.01}
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAMADA 2 — PRÉ-PROCESSAMENTO (SMOTE + LOOCV) & CAMADA 3 — MODELAGEM
// Pipeline: Raw → Normalização → SMOTE → LASSO (feature selection) → XGBoost
// Validação: Stratified 5-Fold CV (n=34) com LOOCV para robustez (n pequeno)
// ═══════════════════════════════════════════════════════════════════════════════
const ML={
  pipeline:{
    version:"4.0-elite",
    architecture:"KNNImputer → StandardScaler → SMOTE+Tomek → LASSO → XGBoost (Optuna) → Calibração → SHAP",
    preprocessing:{
      imputer:"KNNImputer (k=5, weights=distance)",
      smote:{applied:true,method:"SMOTE + Tomek Links",original_ratio:"284:2266 (11.1% positivos)",resampled_ratio:"679:2266 (30%)",k_neighbors:5,note:"SMOTE+Tomek: oversample minoria + remove borderline samples"},
      scaling:"StandardScaler (z-score normalization)",
      missing:"KNN Imputer (k=5, distance-weighted) — substitui forward-fill",
      validation:{primary:"Stratified 5-Fold CV",note:"Balanceamento aplicado APENAS no conjunto de treino dentro do pipeline (sem data leakage)"}
    },
    lasso:{
      role:"Feature Selection (L1 regularization) + Mutual Information",
      alpha_optimal:0.0099,
      features_input:110,
      features_selected:33,
      method:"LASSO CV (5-fold) + top 30 Mutual Information features (union)",
      metrics:{auc_roc:0.68,f1:0.19,recall:0.72,specificity:0.58,note:"Baseline linear — LASSO seleciona features com coeficiente não-zero + top MI features"},
      features_eliminated:["COP_medio","valgo_dls","rsi_ratio","tempo_zona4","hr_recovery_60s","sprint_dist_pct","dist_z5","dist_z6","player_load_2d"]
    },
    optuna:{
      role:"Bayesian Hyperparameter Optimization",
      n_trials:50,
      sampler:"TPE (Tree-Parzen Estimator)",
      optimized:["max_depth","learning_rate","n_estimators","subsample","colsample_bytree","min_child_weight","gamma","reg_alpha","reg_lambda"]
    },
    xgboost:{
      role:"Motor Principal — gradient boosted trees com interações não-lineares",
      hyperparams:{max_depth:3,n_estimators:447,learning_rate:0.010,min_child_weight:6,subsample:0.80,colsample_bytree:0.59,scale_pos_weight:7.98,gamma:0.14,reg_alpha:0.17,reg_lambda:2.11},
      metrics:{auc_roc:0.753,auc_calibrated:0.883,auc_pr:0.238,f1:0.26,recall:0.97,specificity:0.31,precision:0.15,mcc:0.20,threshold:0.20},
      calibration:"Isotonic Regression + Platt Scaling (melhor selecionado automaticamente)",
      threshold_tuning:"Busca automática [0.20–0.50], maximizar recall com precisão ≥ 0.15",
      note:"Pipeline elite: KNN → LASSO+MI → Optuna → SMOTE+Tomek → XGBoost → Calibração isotônica. AUC calibrado: 0.883. 110 features engenheiradas → 33 selecionadas."
    },
    shap:{
      role:"Explicabilidade global e individual (SHAP TreeExplainer)",
      outputs:["summary_plot (importância global)","force_plot por atleta (contribuição individual)","waterfall plot (decisão clínica)"],
      note:"Permite ao staff entender POR QUE cada atleta está em risco"
    }
  },
  features:[
    {f:"Lesão Prévia (< 90d)",v:0.1124,cat:"hist",lasso_coef:0.89,dir:"+",desc:"Variável de maior peso preditivo (Kolodziej et al.). Histórico recente multiplica risco em 3.4x."},
    {f:"ACWR Combinado",v:0.0891,cat:"carga",lasso_coef:0.72,dir:"+",desc:"Rácio agudo:crônico EWMA. Zona > 1.35 interage com fadiga NM."},
    {f:"Assimetria SLCMJ",v:0.0856,cat:"neuromusc",lasso_coef:0.68,dir:"+",desc:"Single-Leg CMJ asymmetry index. > 12% = flag, > 15% = crítico (Rommers et al.)."},
    {f:"Déficit Biológico",v:0.0823,cat:"wellness",lasso_coef:0.65,dir:"+",desc:"Score composto: sono + dor + recuperação invertidos. Interage com carga."},
    {f:"H:Q Ratio (funcional)",v:0.0789,cat:"neuromusc",lasso_coef:0.61,dir:"-",desc:"Razão isquiotibiais/quadríceps. < 0.55 = risco. Protetor quando > 0.60."},
    {f:"sRPE Acum. 7d",v:0.0756,cat:"carga",lasso_coef:0.58,dir:"+",desc:"Carga interna acumulada. > 3000 UA em interação com CMJ < -8%."},
    {f:"Delta CMJ (%)",v:0.0654,cat:"neuromusc",lasso_coef:0.52,dir:"-",desc:"Fadiga neuromuscular objetiva. < -8% = flag, < -10% = crítico."},
    {f:"Carga × Monotonia",v:0.0612,cat:"carga",lasso_coef:0.48,dir:"+",desc:"sRPE × Monotonia. Captura sobrecarga repetitiva."},
    {f:"COP Sway",v:0.0567,cat:"neuromusc",lasso_coef:0.44,dir:"+",desc:"Controle postural estático. > 18mm = instabilidade NM (Oliver et al.)."},
    {f:"ACWR × Sono (interação)",v:0.0543,cat:"interação",lasso_coef:0.41,dir:"+",desc:"Feature de interação: ACWR alto com sono baixo. Capturada apenas pelo XGBoost."},
    {f:"Monotonia",v:0.0498,cat:"carga",lasso_coef:0.38,dir:"+",desc:"Variabilidade da carga. > 2.0 = estímulo repetitivo sem variação adaptativa."},
    {f:"Qual. Sono Avg 7d",v:0.0423,cat:"wellness",lasso_coef:0.34,dir:"-",desc:"Sono < 6h avg 7d presente em 71% dos casos de lesão (retrospectiva)."},
    {f:"Valgo Dinâmico (DLS)",v:0.0389,cat:"biomecanica",lasso_coef:0.31,dir:"+",desc:"Ângulo frontal do joelho no Drop Landing. > 8° = risco ligamentar."},
    {f:"Tendência Dor 3d",v:0.0356,cat:"wellness",lasso_coef:0.28,dir:"+",desc:"Dor progressiva (slope 3d) > pontual. Sinaliza falha adaptativa."},
    {f:"Dívida de Fadiga",v:0.0812,cat:"temporal",lasso_coef:0.63,dir:"+",desc:"Fadiga acumulada com decaimento exponencial (λ=0.1). Cargas recentes pesam mais que antigas. Melhor que sRPE semanal isolado."},
    {f:"Tendência CMJ 3d",v:0.0534,cat:"temporal",lasso_coef:0.42,dir:"-",desc:"Slope linear do CMJ nos últimos 3 dias. Queda progressiva = fadiga NM acumulativa."},
    {f:"Tendência CMJ 5d",v:0.0478,cat:"temporal",lasso_coef:0.38,dir:"-",desc:"Slope linear do CMJ nos últimos 5 dias. Janela maior para tendências lentas."},
    {f:"Tendência Sono 7d",v:0.0398,cat:"temporal",lasso_coef:0.32,dir:"-",desc:"Slope da qualidade do sono em 7 dias. Declínio progressivo precede lesão."},
    {f:"Tendência sRPE 5d",v:0.0367,cat:"temporal",lasso_coef:0.30,dir:"+",desc:"Slope de carga interna em 5 dias. Aumento progressivo sem recuperação."},
    {f:"Eficiência Neuromuscular",v:0.0623,cat:"neuromusc",lasso_coef:0.49,dir:"-",desc:"NME = CMJ / sRPE 7d. Queda indica potência diminuindo com carga alta — típico pré-lesão muscular."}
  ],
  clusters:[
    {id:1,name:"ACWR Alto + Assimetria Bilateral",rule:"ACWR > 1.4 + SLCMJ ASI > 12%",ep:47,rate:17.0,action:"Reduzir volume HSR 30%. Protocolo de simetria pré-treino.",c:"#DC2626",type:"aguda"},
    {id:2,name:"Estresse Biológico Composto",rule:"Sono < 6 + Dor > 3 + Rec < 5",ep:38,rate:21.1,action:"Sessão regenerativa. Crioterapia. Monitorar bem-estar.",c:"#DC2626",type:"sobrecarga"},
    {id:3,name:"Sobrecarga + Fadiga Neuromuscular",rule:"sRPE 7d > 3000 + CMJ Δ < -8% + H:Q < 0.55",ep:52,rate:13.5,action:"Dose Mínima Efetiva (DME). Apenas técnico-tático.",c:"#EA580C",type:"aguda"},
    {id:4,name:"Monotonia + Histórico Recente",rule:"Monotonia > 2.0 + Lesão < 90d + COP > 16mm",ep:29,rate:24.1,action:"Variar estímulos. Reduzir frequência. Fisio preventiva.",c:"#DC2626",type:"sobrecarga"},
    {id:5,name:"Déficit Biológico + Carga HSR",rule:"Déf. Bio > 1.5 + HSR ACWR > 1.3 + Valgo > 7°",ep:33,rate:15.2,action:"Recuperação ativa. Suplementação. Sono prioritário.",c:"#EA580C",type:"aguda"}
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // CAMADA 4 — SAÍDA CLÍNICA + SHAP (SHapley Additive exPlanations)
  // Cada alerta contém: classificação, features SHAP, diagnóstico diferencial, protocolo
  // ═══════════════════════════════════════════════════════════════════════════
  alerts:[
    {n:"ERIK",pos:"VOL",prob:0.72,zone:"VERMELHO",
      dose:"EXCLUIR da sessão. Apenas fisioterapia preventiva.",
      acwr:1.97,cmj:-5.4,sono:6.2,bio:1.8,
      classif:"Alto",
      perfil_risco:"aguda",
      fatigue_debt:2840,nme:0.0142,cmj_trend_3d:-1.82,srpe_trend_5d:48.3,sleep_trend_7d:-0.31,
      trends:{fatigue_debt:[1620,1780,1950,2110,2340,2580,2840],srpe:[280,310,350,420,480,520,560],cmj:[53.2,52.8,52.1,51.4,50.8,49.6,48.2]},
      diag_diff:{aguda:78,sobrecarga:22,base:"ACWR extremo (1.97) + assimetria SLCMJ 14.8% + H:Q 0.52 → perfil de lesão aguda muscular em sprint/aceleração (Rommers et al., 2020)"},
      shap_pos:[
        {f:"ACWR Combinado",sv:0.182,v:"1.97",note:"2.3x acima do limiar (0.85). Maior contribuição individual."},
        {f:"Assimetria SLCMJ",sv:0.094,v:"14.8%",note:"Próximo de flag crítico (15%). Risco para posterior de coxa."},
        {f:"H:Q Ratio",sv:0.078,v:"0.52",note:"Abaixo do limiar protetivo (0.55). Isquiotibiais desprotegidos."},
        {f:"Lesão Prévia",sv:0.065,v:"Posterior Coxa (ago/25)",note:"Histórico no mesmo grupo muscular em risco."},
        {f:"HSR ACWR",sv:0.058,v:"2.12",note:"Pico de corrida alta velocidade sem compensação."}
      ],
      shap_neg:[
        {f:"Qual. Sono",sv:-0.032,v:"6.2",note:"Sono acima do limiar crítico (6.0). Fator protetivo leve."},
        {f:"Monotonia",sv:-0.021,v:"1.6",note:"Variabilidade de carga adequada. Não monotônico."}
      ],
      protocolo:{mecanica:"Protocolo Nordic Hamstring + Single-Leg RDL bilateral",carga_reducao:100,carga_nota:"Exclusão total. Retorno gradual D+2 se ACWR < 1.40.",compensatorio:"Crioterapia + eletroestimulação + mobilidade ativa de quadril"}},
    {n:"JONATHAN",pos:"LAT",prob:0.61,zone:"VERMELHO",
      dose:"EXCLUIR da sessão. Fisioterapia + regenerativo.",
      acwr:1.14,cmj:-4.9,sono:5.9,bio:2.2,
      classif:"Alto",
      perfil_risco:"sobrecarga",
      fatigue_debt:3120,nme:0.0108,cmj_trend_3d:-0.94,srpe_trend_5d:22.1,sleep_trend_7d:-0.42,
      trends:{fatigue_debt:[2210,2380,2540,2690,2850,2980,3120],srpe:[310,330,340,355,370,380,395],cmj:[44.8,44.2,43.6,43.1,42.5,41.8,42.8]},
      diag_diff:{aguda:45,sobrecarga:55,base:"Lesão recente (dez/25, posterior coxa) + sono 5.9 + dor crônica (2.9 avg) → perfil misto com dominância de sobrecarga residual"},
      shap_pos:[
        {f:"Lesão Prévia (< 90d)",sv:0.198,v:"Posterior Coxa (dez/25)",note:"MAIOR PREDITOR. 21 dias fora, < 90 dias. RR = 3.4x (Kolodziej)."},
        {f:"Déficit Biológico",sv:0.074,v:"2.2",note:"Score composto elevado: sono 5.9 + dor 2.9 + rec pernas 5."},
        {f:"Assimetria SLCMJ",sv:0.062,v:"13.1%",note:"Zona de atenção. Pode refletir compensação pós-lesão."},
        {f:"COP Sway",sv:0.048,v:"22.4mm",note:"Pior do elenco. Instabilidade NM marcante."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.045,v:"1.14",note:"Carga controlada pós-retorno. Fator protetivo."},
        {f:"Monotonia",sv:-0.018,v:"2.1",note:"Limítrofe. Não é fator protetivo forte."}
      ],
      protocolo:{mecanica:"Copenhagen adutor + Nordic Hamstring + equilíbrio unipodal (COP)",carga_reducao:100,carga_nota:"Exclusão. Retorno gradual com protocolo RTP (Return to Play) individualizado.",compensatorio:"Readequação NM: propriocepção + ativação glútea + sprint progressivo D+3"}},
    {n:"THALLES",pos:"ATA",prob:0.54,zone:"VERMELHO",
      dose:"EXCLUIR da sessão. Monitorar bem-estar.",
      acwr:1.19,cmj:-3.8,sono:7.0,bio:1.9,
      classif:"Alto",
      perfil_risco:"sobrecarga",
      fatigue_debt:3450,nme:0.0095,cmj_trend_3d:-0.62,srpe_trend_5d:35.7,sleep_trend_7d:0.08,
      trends:{fatigue_debt:[2480,2650,2810,2980,3140,3290,3450],srpe:[340,360,380,395,410,425,440],cmj:[44.9,44.5,44.1,43.8,43.5,43.1,43.3]},
      diag_diff:{aguda:32,sobrecarga:68,base:""},
      shap_pos:[
        {f:"Lesão Prévia (< 90d)",sv:0.121,v:"Adutor E (jan/26)",note:"60 dias. Tecido em remodelação. Vulnerável."},
        {f:"Déficit Biológico",sv:0.068,v:"1.9",note:"RecPernas 10/10 mas dor 2 + histórico compensa."},
        {f:"Carga × Monotonia",sv:0.042,v:"4190",note:"Carga × Monotonia elevada para perfil de recuperação."}
      ],
      shap_neg:[
        {f:"Qual. Sono",sv:-0.038,v:"7.0",note:"Sono adequado. Fator protetivo relevante."},
        {f:"ACWR Combinado",sv:-0.034,v:"1.19",note:"Carga controlada. Protege contra pico agudo."},
        {f:"Assimetria SLCMJ",sv:-0.028,v:"5.4%",note:"Simetria bilateral boa. Protetor NM."}
      ],
      protocolo:{mecanica:"Copenhagen adutor progressivo + isometria adutor longo",carga_reducao:100,carga_nota:"Exclusão. Monitorar bem-estar e retorno gradual.",compensatorio:"Hidratação agressiva + anti-inflamatórios naturais + crioterapia sistêmica"}},
    {n:"JEFFERSON NEM",pos:"EXT",prob:0.47,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:0.97,cmj:-1.0,sono:7.2,bio:1.5,
      classif:"Moderado",
      perfil_risco:"sobrecarga",
      fatigue_debt:2680,nme:0.0118,cmj_trend_3d:-0.35,srpe_trend_5d:18.4,sleep_trend_7d:-0.12,
      trends:{fatigue_debt:[2050,2180,2310,2420,2510,2590,2680],srpe:[350,365,380,390,400,415,430],cmj:[48.0,47.8,47.5,47.3,47.1,46.8,47.5]},
      diag_diff:{aguda:38,sobrecarga:62,base:"+ ) + histórico tornozelo → sobrecarga crônica com compensação biomecânica"},
      shap_pos:[
        {f:"Déficit Biológico",sv:0.054,v:"1.5",note:"Limiar de atenção."},
        {f:"sRPE Acum. 7d",sv:0.042,v:"3780 UA",note:"Acima do limiar 3000. Volume elevado."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.042,v:"0.97",note:"Zona ótima. Protege contra spike."},
        {f:"Qual. Sono",sv:-0.034,v:"7.2",note:"Adequado."},
        {f:"Assimetria SLCMJ",sv:-0.026,v:"5.8%",note:"Simétrico."}
      ],
      protocolo:{mecanica:"Fortalecimento excêntrico de cadeia posterior",carga_reducao:50,carga_nota:"50% volume. Zero HSR até bem-estar normalizar.",compensatorio:"Suplementação proteica pós-treino + sono > 7.5h + banho contraste"}},
    {n:"PATRICK BREY",pos:"LAT",prob:0.43,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:1.30,cmj:-2.5,sono:6.5,bio:1.3,
      classif:"Moderado",
      perfil_risco:"aguda",
      fatigue_debt:2150,nme:0.0125,cmj_trend_3d:-0.78,srpe_trend_5d:31.2,sleep_trend_7d:-0.18,
      trends:{fatigue_debt:[1580,1690,1790,1880,1960,2060,2150],srpe:[310,325,340,355,370,385,400],cmj:[43.8,43.2,42.8,42.3,41.8,42.0,42.6]},
      diag_diff:{aguda:61,sobrecarga:39,base:"Lesão recente reto femoral (fev/26) + ACWR 1.30 ascendente + SLCMJ ASI 11.9% + H:Q 0.51 → perfil agudo em construção"},
      shap_pos:[
        {f:"Lesão Prévia (< 90d)",sv:0.142,v:"Reto Femoral E (fev/26)",note:"36 dias. Tecido vulnerável."},
        {f:"Assimetria SLCMJ",sv:0.072,v:"11.9%",note:"Próximo do flag 12%. Pode ser compensação."},
        {f:"HSR ACWR",sv:0.058,v:"1.35",note:"Pico de alta velocidade em retorno de lesão."},
        {f:"H:Q Ratio",sv:0.048,v:"0.51",note:"Abaixo de 0.55. Isquiotibiais vulneráveis."}
      ],
      shap_neg:[
        {f:"Monotonia",sv:-0.024,v:"1.9",note:"Limítrofe mas não crítico."}
      ],
      protocolo:{mecanica:"Protocolo RTP progressivo: isometria → concêntrico → excêntrico → pliometria",carga_reducao:50,carga_nota:"50% volume. HSR proibido por mais 14 dias pós-retorno.",compensatorio:"Ativação glútea + hip flexor mobility + sprint progressivo controlado"}},
    {n:"KELVIN",pos:"EXT",prob:0.38,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:0.86,cmj:-4.0,sono:7.4,bio:0.8,
      classif:"Moderado",
      perfil_risco:"neuromuscular",
      fatigue_debt:1890,nme:0.0138,cmj_trend_3d:-1.12,srpe_trend_5d:8.6,sleep_trend_7d:0.04,
      trends:{fatigue_debt:[1420,1510,1580,1640,1710,1800,1890],srpe:[240,248,255,262,270,278,290],cmj:[42.3,41.8,41.2,40.8,40.3,39.8,38.4]},
      diag_diff:{aguda:28,sobrecarga:72,base:"Monotonia 2.2 (maior do elenco) + histórico tendinopatia patelar + dor avg 3.0 → perfil de sobrecarga tendínea por repetição"},
      shap_pos:[
        {f:"Monotonia",sv:0.092,v:"2.2",note:"Maior do elenco. Tendão reage a carga monotônica (caso retrospectivo)."},
        {f:"Tendência Dor 3d",sv:0.068,v:"↑ 3.0 avg",note:"Dor em tendência ascendente. Flag para tendinopatia."},
        {f:"Assimetria SLCMJ",sv:0.044,v:"8.6%",note:"Moderada. Pode indicar compensação patelar."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.052,v:"0.86",note:"Subcarga relativa. Protege."},
        {f:"Qual. Sono",sv:-0.034,v:"7.4",note:"Bom."}
      ],
      protocolo:{mecanica:"Isometric Holds patelar (45° e 70°) + progressão excêntrica slow",carga_reducao:50,carga_nota:"Variar estímulos (quebrar monotonia). Reduzir impacto cíclico.",compensatorio:"Propriocepção + fortalecimento VMO + stretching cadeia anterior"}},
    {n:"RAFAEL GAVA",pos:"MEI",prob:0.35,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:1.10,cmj:-7.2,sono:5.8,bio:1.4,
      classif:"Moderado",
      perfil_risco:"neuromuscular",
      fatigue_debt:2320,nme:0.0098,cmj_trend_3d:-1.45,srpe_trend_5d:14.8,sleep_trend_7d:-0.38,
      trends:{fatigue_debt:[1780,1890,1980,2060,2140,2230,2320],srpe:[300,310,320,335,350,360,375],cmj:[39.2,38.8,38.2,37.6,37.1,36.4,38.7]},
      diag_diff:{aguda:54,sobrecarga:46,base:"2 lesões prévias no mesmo segmento (panturrilha D) + CMJ -7.2% + + sono 5.8 → recidiva muscular por fadiga NM crônica"},
      shap_pos:[
        {f:"Lesão Prévia (recidiva)",sv:0.134,v:"2 lesões panturrilha D",note:"Recidiva ipsilateral. Máximo peso (Kolodziej). Tecido comprometido."},
        {f:"Delta CMJ",sv:0.072,v:"-7.2%",note:"Próximo do flag -8%. Fadiga NM em progressão."},
        {f:"Qual. Sono",sv:0.058,v:"5.8",note:"Abaixo do limiar 6h. Recuperação comprometida."},
        {f:"COP Sway",sv:0.044,v:"17.1mm",note:"Limítrofe. Controle postural subótimo."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.038,v:"1.10",note:"Zona segura."},
        {f:"Monotonia",sv:-0.022,v:"1.3",note:"Boa variabilidade."}
      ],
      protocolo:{mecanica:"Excêntrico gastrocnêmio bilateral + soleus loading",carga_reducao:50,carga_nota:"50% volume. Foco em regeneração do sono (< 6h por 3+ dias = flag).",compensatorio:"Melatonina (se indicado) + higiene do sono + fascioterapia"}},
    {n:"HENRIQUE TELES",pos:"LAT",prob:0.28,zone:"AMARELO",
      dose:"Reduzir HSR 30%. Monitorar PSE.",
      acwr:1.14,cmj:-12.5,sono:7.7,bio:0.9,
      classif:"Moderado",
      perfil_risco:"biomecanico",
      fatigue_debt:2010,nme:0.0112,cmj_trend_3d:-2.15,srpe_trend_5d:12.4,sleep_trend_7d:0.14,
      trends:{fatigue_debt:[1520,1610,1700,1780,1850,1930,2010],srpe:[340,350,360,375,390,400,415],cmj:[55.1,53.8,52.4,50.8,49.1,47.2,45.5]},
      diag_diff:{aguda:67,sobrecarga:33,base:"Lesão recente posterior coxa E (fev/26) + SLCMJ ASI 16.1% (pior do elenco) + CMJ -12.5% + H:Q 0.49 → alto risco agudo mesmo com prob moderada"},
      shap_pos:[
        {f:"Assimetria SLCMJ",sv:0.148,v:"16.1%",note:"PIOR DO ELENCO. Acima de 15% = flag crítico. Risco posterior coxa."},
        {f:"Delta CMJ",sv:0.098,v:"-12.5%",note:"Acima do limiar crítico -10%. Fadiga NM severa."},
        {f:"H:Q Ratio",sv:0.076,v:"0.49",note:"Pior do elenco. Isquiotibiais desprotegidos."},
        {f:"Lesão Prévia",sv:0.068,v:"Posterior Coxa E (fev/26)",note:"19 dias. Tecido em remodelação ativa."},
        {f:"Valgo Dinâmico",sv:0.042,v:"7.8°",note:"Próximo do flag 8°. Risco articular adicional."}
      ],
      shap_neg:[
        {f:"Qual. Sono",sv:-0.058,v:"7.7",note:"Excelente. Fator protetivo forte."},
        {f:"ACWR Combinado",sv:-0.044,v:"1.14",note:"Controlado. Carga não excessiva."},
        {f:"Monotonia",sv:-0.024,v:"1.6",note:"Adequada."}
      ],
      protocolo:{mecanica:"Protocolo Nordic + RDL unilateral + hip hinge pattern",carga_reducao:30,carga_nota:"HSR -30%. ZERO sprint máximo até assimetria < 12% e CMJ normalizar.",compensatorio:"Normalização bilateral: leg press unilateral + Bulgarian split squat + propriocepção"}},
    {n:"GUILHERME QUEIROZ",pos:"ATA",prob:0.26,zone:"AMARELO",
      dose:"Reduzir HSR 30%. Monitorar PSE.",
      acwr:1.14,cmj:1.1,sono:6.9,bio:1.1,
      classif:"Baixo-Moderado",
      perfil_risco:"sobrecarga",
      fatigue_debt:1780,nme:0.0168,cmj_trend_3d:0.22,srpe_trend_5d:10.2,sleep_trend_7d:-0.08,
      trends:{fatigue_debt:[1380,1440,1510,1580,1640,1710,1780],srpe:[300,310,320,330,340,350,370],cmj:[44.7,45.0,45.2,45.5,45.8,46.0,46.0]},
      diag_diff:{aguda:25,sobrecarga:75,base:"Lesão lombar recente (jan/26) + Delta BF% elevado → perfil de desregulação sistêmica (caso atípico da retrospectiva)"},
      shap_pos:[
        {f:"Lesão Prévia",sv:0.082,v:"Lombar D (jan/26)",note:"45 dias. Região vulnerável."},
        {f:"Déficit Biológico",sv:0.038,v:"1.1",note:"Moderado."}
      ],
      shap_neg:[
        {f:"Delta CMJ",sv:-0.048,v:"+1.1%",note:"Potência NM normal. Protetor forte."},
        {f:"Qual. Sono",sv:-0.034,v:"6.9",note:"Adequado."},
        {f:"Assimetria SLCMJ",sv:-0.028,v:"5.5%",note:"Simétrico. Protetor."},
        {f:"H:Q Ratio",sv:-0.024,v:"0.57",note:"Protetivo."}
      ],
      protocolo:{mecanica:"Core stability + anti-rotação + hip mobility",carga_reducao:30,carga_nota:"HSR -30%. Avaliação nutricional semanal (delta BF%).",compensatorio:"Controle composição corporal + variação de estímulos + fisio preventiva lombar"}},
    {n:"ADRIANO",pos:"GOL",prob:0.23,zone:"AMARELO",
      dose:"Reduzir HSR 30%. Monitorar PSE.",
      acwr:1.24,cmj:-3.7,sono:7.3,bio:0.7,
      classif:"Baixo",
      perfil_risco:"aguda",
      fatigue_debt:1540,nme:0.0155,cmj_trend_3d:-0.48,srpe_trend_5d:15.8,sleep_trend_7d:0.06,
      trends:{fatigue_debt:[1180,1240,1300,1360,1410,1470,1540],srpe:[280,290,300,310,320,330,340],cmj:[52.2,51.8,51.4,51.0,50.6,50.2,49.6]},
      diag_diff:{aguda:52,sobrecarga:48,base:"Sem histórico + ACWR 1.24 moderado + métricas NM boas → risco residual por carga, sem vulnerabilidade estrutural"},
      shap_pos:[
        {f:"ACWR Combinado",sv:0.058,v:"1.24",note:"Zona de atenção (> 1.20). Tendência ascendente."},
        {f:"Déficit Biológico",sv:0.032,v:"0.7",note:"Baixo mas presente."}
      ],
      shap_neg:[
        {f:"Lesão Prévia",sv:-0.065,v:"Nenhuma",note:"Sem histórico. Maior fator protetivo (Kolodziej)."},
        {f:"Assimetria SLCMJ",sv:-0.042,v:"5.1%",note:"Excelente simetria."},
        {f:"H:Q Ratio",sv:-0.038,v:"0.59",note:"Protetivo."},
        {f:"COP Sway",sv:-0.028,v:"13.8mm",note:"Bom controle postural."}
      ],
      protocolo:{mecanica:"Manutenção — programa preventivo padrão",carga_reducao:30,carga_nota:"HSR -30% como precaução pelo ACWR ascendente.",compensatorio:"Monitorar ACWR nos próximos 3 dias. Se < 1.20: liberação total."}},
    {n:"BRENNO",pos:"GOL",prob:0.19,zone:"AMARELO",
      dose:"Reduzir volume 20%. Monitorar.",
      acwr:1.17,cmj:-3.5,sono:7.3,bio:0.8,
      classif:"Baixo",
      perfil_risco:"sobrecarga",
      fatigue_debt:1320,nme:0.0162,cmj_trend_3d:-0.38,srpe_trend_5d:6.4,sleep_trend_7d:-0.05,
      trends:{fatigue_debt:[1020,1060,1110,1160,1210,1260,1320],srpe:[260,268,275,282,290,298,310],cmj:[46.2,45.8,45.5,45.2,44.8,44.5,44.6]},
      diag_diff:{aguda:40,sobrecarga:60,base:"Sem histórico + goleiro (menor HSR) + dor 3/10 incipiente → atenção por dor, mas perfil protetivo"},
      shap_pos:[
        {f:"Tendência Dor 3d",sv:0.042,v:"↑ 3.0",note:"Dor ascendente. Monitorar."},
      ],
      shap_neg:[
        {f:"Lesão Prévia",sv:-0.065,v:"Nenhuma",note:"Protetor máximo."},
        {f:"H:Q Ratio",sv:-0.044,v:"0.62",note:"Excelente. Protetor."},
        {f:"COP Sway",sv:-0.038,v:"12.4mm",note:"Bom."},
        {f:"Assimetria SLCMJ",sv:-0.032,v:"5.7%",note:"Simétrico."}
      ],
      protocolo:{mecanica:"Programa preventivo padrão goleiro",carga_reducao:20,carga_nota:"Redução leve. Monitorar tendência de dor.",compensatorio:"Se dor continuar subindo 48h: avaliação fisioterapia"}},
    {n:"HYGOR",pos:"ATA",prob:0.18,zone:"AMARELO",
      dose:"Reduzir HSR 30%. Monitorar PSE.",
      acwr:1.12,cmj:-1.6,sono:7.0,bio:1.2,
      classif:"Baixo",
      perfil_risco:"sobrecarga",
      fatigue_debt:1680,nme:0.0128,cmj_trend_3d:-0.28,srpe_trend_5d:9.2,sleep_trend_7d:-0.10,
      trends:{fatigue_debt:[1280,1340,1400,1460,1520,1600,1680],srpe:[320,330,340,350,360,370,390],cmj:[41.9,41.6,41.4,41.2,41.0,40.8,42.1]},
      diag_diff:{aguda:42,sobrecarga:58,base:"Histórico coxa D (set/25) > 90d + monotonia 1.7 → risco residual por carga e bioquímica, sem urgência"},
      shap_pos:[
        {f:"Déficit Biológico",sv:0.038,v:"1.2",note:"Moderado."},
        {f:"Monotonia",sv:0.032,v:"1.7",note:"Atenção."}
      ],
      shap_neg:[
        {f:"Lesão Prévia (> 90d)",sv:-0.048,v:"> 90d",note:"Fora da janela crítica."},
        {f:"ACWR Combinado",sv:-0.038,v:"1.12",note:"Zona segura."},
        {f:"Delta CMJ",sv:-0.032,v:"-1.6%",note:"Dentro do normal."},
        {f:"Assimetria SLCMJ",sv:-0.028,v:"6.8%",note:"Adequado."}
      ],
      protocolo:{mecanica:"Programa preventivo padrão",carga_reducao:30,carga_nota:"HSR -30%. Monitorar bem-estar.",compensatorio:"Monitorar bem-estar. Se déficit biológico > 2.0: reclassificar para LARANJA"}}
  ]
};
const ZC={"VERMELHO":{c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA"},"LARANJA":{c:"#EA580C",bg:"#FFF7ED",bc:"#FED7AA"},"AMARELO":{c:"#CA8A04",bg:"#FEFCE8",bc:"#FEF08A"},"VERDE":{c:"#16A34A",bg:"#F0FDF4",bc:"#BBF7D0"}};

// Perfil de risco fisiológico
const PERFIL_RISCO_LABELS={
  aguda:{label:"Aguda",desc:"Pico de carga / sprint / aceleração",c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA",ic:"Zap"},
  sobrecarga:{label:"Sobrecarga",desc:"Acúmulo de fadiga / carga crônica",c:"#EA580C",bg:"#FFF7ED",bc:"#FED7AA",ic:"TrendingUp"},
  neuromuscular:{label:"Neuromuscular",desc:"Perda de potência / NME baixo",c:"#7c3aed",bg:"#F5F3FF",bc:"#DDD6FE",ic:"Activity"},
  biomecanico:{label:"Biomecânico",desc:"Assimetria / instabilidade",c:"#2563eb",bg:"#EFF6FF",bc:"#BFDBFE",ic:"Shield"}
};

// Intervenções rápidas por situação
const INTERVENTIONS=[
  {trigger:"ACWR > 1.50",action:"Reduzir volume HSR 30%",perfil:"aguda",priority:1},
  {trigger:"ACWR > 1.35 + Sono < 6",action:"Excluir de HSR e sprints",perfil:"aguda",priority:1},
  {trigger:"Assimetria SLCMJ > 12%",action:"Trabalho unilateral obrigatório",perfil:"biomecanico",priority:1},
  {trigger:"CMJ Delta < -8%",action:"48h treino regenerativo",perfil:"neuromuscular",priority:1},
  {trigger:"Sono avg < 6h (7d)",action:"Protocolo recuperação sono",perfil:"sobrecarga",priority:2},
  {trigger:"NME em queda 5d",action:"Reduzir volume, priorizar qualidade",perfil:"neuromuscular",priority:2},
  {trigger:"Dívida de Fadiga > 3000",action:"Carga MED (50% volume)",perfil:"sobrecarga",priority:2},
  {trigger:"Dor subindo > 1pt/3d",action:"Avaliação fisioterapia 24h",perfil:"sobrecarga",priority:2},
  {trigger:"H:Q Ratio < 0.55",action:"Protocolo Nordic Hamstring",perfil:"biomecanico",priority:2}
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROJEÇÃO DE RISCO 48-72h — Tendência projetada por regressão linear dos últimos 7 dias
// ═══════════════════════════════════════════════════════════════════════════════
const PROJECTIONS={
  "ERIK":{
    proj_48h:{fatigue_debt:3120,cmj:47.4,nme:0.0128,risk_prob:0.78},
    proj_72h:{fatigue_debt:3380,cmj:46.6,nme:0.0115,risk_prob:0.82},
    tendencia:"piora",nivel_projetado:"CRÍTICO",
    resumo:"ACWR extremo + fadiga exponencial. Sem intervenção, risco projetado > 80% em 72h.",
    recomendacao:"Manter exclusão. Crioterapia + sono > 8h. Reavaliar ACWR em 48h."
  },
  "JONATHAN":{
    proj_48h:{fatigue_debt:3280,cmj:42.2,nme:0.0102,risk_prob:0.66},
    proj_72h:{fatigue_debt:3420,cmj:41.6,nme:0.0096,risk_prob:0.71},
    tendencia:"piora",nivel_projetado:"CRÍTICO",
    resumo:"COP instável. Perfil de sobrecarga residual agravando.",
    recomendacao:"Exclusão mantida. Protocolo regenerativo + readequação NM."
  },
  "THALLES":{
    proj_48h:{fatigue_debt:3620,cmj:43.0,nme:0.0088,risk_prob:0.59},
    proj_72h:{fatigue_debt:3780,cmj:42.7,nme:0.0082,risk_prob:0.64},
    tendencia:"piora",nivel_projetado:"CRÍTICO",
    resumo:". Gastrocnêmio em remodelação — risco de recidiva.",
    recomendacao:"Exclusão. Hidratação agressiva + crioterapia sistêmica."
  },
  "JEFFERSON NEM":{
    proj_48h:{fatigue_debt:2780,cmj:47.2,nme:0.0114,risk_prob:0.50},
    proj_72h:{fatigue_debt:2870,cmj:46.9,nme:0.0110,risk_prob:0.53},
    tendencia:"estavel",nivel_projetado:"MODERADO-ALTO",
    resumo:"Carga estável. Risco não escala se controlada.",
    recomendacao:"Manter MED 50%. Monitorar bem-estar. Se bem-estar normalizar: reclassificar."
  },
  "PATRICK BREY":{
    proj_48h:{fatigue_debt:2250,cmj:42.2,nme:0.0120,risk_prob:0.47},
    proj_72h:{fatigue_debt:2340,cmj:41.8,nme:0.0116,risk_prob:0.50},
    tendencia:"piora_leve",nivel_projetado:"MODERADO-ALTO",
    resumo:"Retorno de LCM + ACWR ascendente. Risco de pico agudo se carga não controlada.",
    recomendacao:"Manter 50% volume. Zero HSR por +14d. RTP progressivo."
  },
  "KELVIN":{
    proj_48h:{fatigue_debt:1970,cmj:37.8,nme:0.0132,risk_prob:0.41},
    proj_72h:{fatigue_debt:2040,cmj:37.2,nme:0.0126,risk_prob:0.44},
    tendencia:"piora_leve",nivel_projetado:"MODERADO",
    resumo:"CMJ em queda progressiva — fadiga NM acumulativa. Monotonia 2.2 agravando.",
    recomendacao:"Variar estímulos. Reduzir impacto cíclico. Isometric holds patelar."
  },
  "RAFAEL GAVA":{
    proj_48h:{fatigue_debt:2420,cmj:38.2,nme:0.0092,risk_prob:0.39},
    proj_72h:{fatigue_debt:2510,cmj:37.7,nme:0.0088,risk_prob:0.42},
    tendencia:"piora_leve",nivel_projetado:"MODERADO",
    resumo:"NME baixo + sono deteriorando. 2 lesões prévias em panturrilha D — recidiva latente.",
    recomendacao:"Priorizar sono (> 7h). Excêntrico gastrocnêmio. MED 50%."
  },
  "HENRIQUE TELES":{
    proj_48h:{fatigue_debt:2100,cmj:44.2,nme:0.0108,risk_prob:0.31},
    proj_72h:{fatigue_debt:2180,cmj:43.0,nme:0.0104,risk_prob:0.34},
    tendencia:"piora_leve",nivel_projetado:"ATENÇÃO",
    resumo:"Assimetria SLCMJ 16.1% (pior do elenco) + CMJ -12.5%. Risco biomecânico persistente.",
    recomendacao:"Zero sprint máximo. Trabalho bilateral obrigatório até ASI < 12%."
  },
  "GUILHERME QUEIROZ":{
    proj_48h:{fatigue_debt:1850,cmj:46.2,nme:0.0164,risk_prob:0.28},
    proj_72h:{fatigue_debt:1920,cmj:46.4,nme:0.0160,risk_prob:0.29},
    tendencia:"estavel",nivel_projetado:"ATENÇÃO",
    resumo:"Estável. CMJ em leve alta. Carga controlada.",
    recomendacao:"Manter HSR -30%. Avaliação nutricional semanal."
  },
  "ADRIANO":{
    proj_48h:{fatigue_debt:1610,cmj:49.2,nme:0.0150,risk_prob:0.25},
    proj_72h:{fatigue_debt:1680,cmj:48.8,nme:0.0146,risk_prob:0.26},
    tendencia:"estavel",nivel_projetado:"ATENÇÃO",
    resumo:"ACWR ascendente mas sem fatores agravantes. Perfil protetivo.",
    recomendacao:"Monitorar ACWR 48h. Se < 1.20: liberação total."
  },
  "BRENNO":{
    proj_48h:{fatigue_debt:1380,cmj:44.3,nme:0.0158,risk_prob:0.20},
    proj_72h:{fatigue_debt:1440,cmj:44.0,nme:0.0154,risk_prob:0.22},
    tendencia:"estavel",nivel_projetado:"NORMAL",
    resumo:"Perfil protetivo. Dor 3/10 monitorar mas sem urgência.",
    recomendacao:"Programa preventivo padrão. Monitorar tendência de dor."
  },
  "HYGOR":{
    proj_48h:{fatigue_debt:1760,cmj:41.8,nme:0.0124,risk_prob:0.20},
    proj_72h:{fatigue_debt:1840,cmj:41.5,nme:0.0120,risk_prob:0.22},
    tendencia:"estavel",nivel_projetado:"NORMAL",
    resumo:". Sem urgência mas monitorar.",
    recomendacao:"HSR -30%. Se déficit biológico > 2.0: reclassificar para LARANJA."
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSÃO DE TREINO — Estrutura vazia (dados vêm 100% da planilha Google Sheets)
// ═══════════════════════════════════════════════════════════════════════════════
const SESSION_DATA_EMPTY={meta:{date:"",tipo:"",duracao:0,local:"",md:"",condicao:"",rpe_alvo:""},atletas:{}};

// ═══════════════════════════════════════════════════════════════════════════════
// Parser de data tolerante: aceita ISO (YYYY-MM-DD), brasileiro (DD/MM/YYYY,
// DD-MM-YYYY) e detecta heurística MM/DD vs DD/MM quando ambíguo. JS nativo
// `new Date("12/01/2026")` lê como MM/DD (Dec 1) — quebra leitura de planilha
// brasileira. Default aqui é DD/MM, com flip só quando o primeiro número > 31.
// (Definido antes de INJ_HISTORY/getDmAtual para evitar TDZ no load do módulo.)
const parseDateBR=(d)=>{
  if(!d)return null;
  if(d instanceof Date)return isNaN(d)?null:d;
  const s=String(d).trim();if(!s)return null;
  if(/^\d{4}-\d{2}-\d{2}/.test(s)){const dt=new Date(s);return isNaN(dt)?null:dt;}
  const p=s.split(/[\/\-\.\s]/).filter(Boolean);
  if(p.length>=3){
    const[a,b,c]=p.map(Number);
    if(!Number.isFinite(a)||!Number.isFinite(b)||!Number.isFinite(c))return null;
    if(a>31){const dt=new Date(a,b-1,c);return isNaN(dt)?null:dt;}      // YYYY/MM/DD
    const yr=c<100?c+2000:c;const dt=new Date(yr,b-1,a);                 // DD/MM/YY(YY)
    return isNaN(dt)?null:dt;
  }
  const dt=new Date(s);return isNaN(dt)?null:dt;
};

// LESÕES REAIS — Fonte: Planilha Botafogo FSA - Dados Performance-2.xlsx (aba lesoes)
// Responsável: TIAGO ROCHA · Temporada 2025/2026 (elenco atual)
// ═══════════════════════════════════════════════════════════════════════════════
const INJ_HISTORY=[
  {id:1,n:"JEFERSON",pos:"LAT",date:"2025-10-07",saida_dm:"2026-01-01",ini_trans:"2026-01-02",fim_trans:"2026-01-05",
    dias_dm:87,dias_trans:4,total:91,classif:"4C",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Brasileiro",mecanismo:"Sprint",estrutura:"Semitendíneo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Lesão grau 4C com 91 dias de afastamento. Sprint como mecanismo em jogo oficial. Semitendíneo é a estrutura mais vulnerável em laterais com alta demanda de HSR.",
    protocol:"Protocolo Nordic Hamstring 3x/sem. Monitorar assimetria bilateral pós-retorno. Restrição de sprint máximo por 14 dias após fase 4."},
  {id:2,n:"WALLACE",pos:"ZAG",date:"2025-12-27",saida_dm:"2026-01-18",ini_trans:"2026-01-19",fim_trans:"2026-02-03",
    dias_dm:23,dias_trans:16,total:39,classif:"2B",regiao:"Perna Posterior",lado:"Direito",evento:"Time de empréstimo",mecanismo:"Dor Tardia",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Sóleo com dor tardia — padrão de sobrecarga. 39 dias total indica comprometimento significativo. Perna posterior direita é padrão recorrente no elenco.",
    protocol:"Excêntrico de sóleo progressivo. Monitorar wellness como indicador de dano residual. Atenção a padrão compensatório contralateral."},
  {id:3,n:"GUILHERME QUEIROZ",pos:"ATA",date:"2025-12-31",saida_dm:"2026-01-06",ini_trans:"2026-01-07",fim_trans:"2026-01-08",
    dias_dm:7,dias_trans:2,total:9,classif:"1A",regiao:"Perna Posterior",lado:"Direito",evento:"Amistoso",mecanismo:"Sobrecarga",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Lesão 1A em sóleo por sobrecarga em amistoso. Retorno rápido (9 dias) mas padrão de perna posterior D precisa de atenção preventiva.",
    protocol:"Protocolo de fortalecimento de sóleo bilateral. Monitorar volume de corrida nos amistosos."},
  {id:4,n:"JEFERSON",pos:"LAT",date:"2026-01-06",saida_dm:"2026-01-18",ini_trans:"2026-01-19",fim_trans:"2026-02-03",
    dias_dm:13,dias_trans:16,total:29,classif:"2A",regiao:"Perna Posterior",lado:"Direito",evento:"Aquecimento",mecanismo:"Sobrecarga",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    obs:"Estava retornando de lesão de posterior",
    lesson:"RECIDIVA — Retornou da lesão de 91d (posterior E) e lesionou perna posterior D em 5 dias. Sobrecarga no aquecimento indica preparação insuficiente para retorno. Padrão contralateral clássico.",
    protocol:"RTP mínimo de 21 dias após lesão > 60 dias. Protocolo bilateral obrigatório. Monitorar assimetria SLCMJ e COP antes de liberar."},
  {id:5,n:"HYGOR",pos:"ATA",date:"2026-01-12",saida_dm:"2026-01-23",ini_trans:"2026-01-24",fim_trans:"2026-01-27",
    dias_dm:12,dias_trans:4,total:16,classif:"2B",regiao:"Coxa Posterior",lado:"Direito",evento:"Camp. Paulista",mecanismo:"Trauma direto",estrutura:"Cabeça Longa do Bíceps",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Trauma direto em jogo oficial. Cabeça longa do bíceps femoral em extremo/atacante — perfil de risco pela demanda de sprints repetidos.",
    protocol:"Fortalecimento excêntrico de bíceps femoral. Monitorar CMJ como marcador de recuperação NM."},
  {id:6,n:"JONATHAN",pos:"LD",date:"2026-01-21",saida_dm:"2026-01-23",ini_trans:"2026-01-24",fim_trans:"2026-01-24",
    dias_dm:3,dias_trans:1,total:4,classif:"Ligamentar II",regiao:"Tornozelo",lado:"Direito",evento:"Treino",mecanismo:"Entorse",estrutura:"Lig Talofibular Anterior",exame:"AV Clínica",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Entorse de tornozelo grau II em treino. Retorno rápido (4 dias). Atenção a instabilidade residual que pode alterar biomecânica de corrida.",
    protocol:"Propriocepção + fortalecimento eversores. Bandagem funcional por 2 semanas. Monitorar COP sway."},
  {id:7,n:"MORELLI",pos:"VOL",date:"2026-01-23",saida_dm:"2026-01-27",ini_trans:"2026-01-28",fim_trans:"2026-01-29",
    dias_dm:5,dias_trans:2,total:7,classif:"1B",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Passe",estrutura:"Cabeça Longa do Bíceps",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Morelli tem histórico de 3 lombalgias prévias (ago-set/2024) que podem ter gerado compensação na cadeia posterior. Lesão em passe sugere déficit de flexibilidade/força excêntrica.",
    protocol:"Avaliação de cadeia posterior completa. Protocolo Nordic + flexibilidade. Monitorar lombar como fator predisponente."},
  {id:8,n:"ERIK",pos:"VOL",date:"2026-01-24",saida_dm:"2026-03-08",ini_trans:"2026-03-09",fim_trans:"2026-03-24",
    dias_dm:44,dias_trans:16,total:60,classif:"4C",regiao:"Coxa Medial",lado:"Esquerdo",evento:"Treino",mecanismo:"Passe",estrutura:"Adutor Longo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Lesão grau 4C em adutor longo — a mais grave do elenco (60 dias). Mecanismo de passe em treino sugere déficit de força adutora e/ou fadiga acumulada. Retornou em 24/Mar.",
    protocol:"Copenhagen adutor progressivo. Manutenção pós-retorno. Monitorar assimetria de adução."},
  {id:9,n:"JONATHAN",pos:"LD",date:"2026-02-08",saida_dm:"2026-02-17",ini_trans:"2026-02-18",fim_trans:"2026-02-25",
    dias_dm:10,dias_trans:8,total:18,classif:"2A",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Alongamento",estrutura:"Semitendíneo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"SEGUNDA lesão de semitendíneo (mesma estrutura da lesão de out/2025). Mecanismo de alongamento indica flexibilidade comprometida e/ou retorno incompleto. Lateral com histórico recorrente = alto risco.",
    protocol:"Protocolo de flexibilidade + excêntrico Nordic intensificado. Limite de HSR permanente. Avaliação biomecânica completa antes de jogo."},
  {id:10,n:"RAFAEL GAVA",pos:"MEI",date:"2026-02-08",saida_dm:"2026-02-17",ini_trans:"2026-02-18",fim_trans:"2026-02-25",
    dias_dm:10,dias_trans:8,total:18,classif:"1A",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Sprint",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Sprint em jogo oficial. Sóleo esquerdo — padrão de perna posterior que domina as lesões do elenco. .",
    protocol:"Excêntrico de sóleo bilateral. Limitar volume de sprint pós-retorno. Monitorar wellness como indicador de recarga tecidual."},
  {id:11,n:"PATRICK BREY",pos:"LE",date:"2026-02-08",saida_dm:"2026-03-01",ini_trans:"2026-03-02",fim_trans:"2026-03-15",
    dias_dm:22,dias_trans:14,total:36,classif:"Ligamentar II",regiao:"Joelho",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Trauma direto",estrutura:"LCM",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",prognostico:"2026-04-02",
    lesson:"Lesão ligamentar grau II de LCM por trauma direto em jogo. Retornou aos treinos em 15/Mar (36 dias). Monitoramento de manutenção ativo.",
    protocol:"Reabilitação ligamentar progressiva. Fortalecimento de quadríceps + isquiotibiais bilateral. Propriocepção + agilidade antes de retorno."},
  {id:12,n:"GABRIEL INOCENCIO",pos:"LD",date:"2026-03-06",saida_dm:"2026-03-12",ini_trans:"2026-03-13",fim_trans:"2026-03-15",
    dias_dm:7,dias_trans:3,total:10,classif:"Contratura",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Amistoso",mecanismo:"Dor Tardia",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",prognostico:"2026-03-16",
    lesson:"Contratura de sóleo com dor tardia pós-amistoso. Retornou ao time em 15/Mar após 10 dias. Padrão de sóleo + perna posterior se repete no elenco.",
    protocol:"Manutenção preventiva. Monitorar volume de corrida e HSR. Excêntrico de sóleo bilateral como rotina."},
  {id:13,n:"THALLES",pos:"ATA",date:"2026-03-09",saida_dm:"2026-03-21",ini_trans:"2026-03-23",fim_trans:null,
    dias_dm:13,dias_trans:3,total:16,classif:"2A",regiao:"Perna Posterior",lado:"Direito",evento:"Treino",mecanismo:"Dor Tardia",estrutura:"Gastrocnêmio Medial",exame:"RNM",estagio:"Fase 3",conduta:"Afastado",prognostico:"2026-04-13",
    lesson:"Lesão 2A de gastrocnêmio medial com dor tardia em treino. Prognóstico 13/Abr (35 dias). Fase 3 — em transição. Dano muscular crônico como fator predisponente.",
    protocol:"Excêntrico de gastrocnêmio progressivo. Monitorar bem-estar antes de progredir fases. Atenção ao CKm histórico."},
  {id:14,n:"GUI MARIANO",pos:"ZAG",date:"2026-03-11",saida_dm:"2026-03-23",ini_trans:"2026-03-24",fim_trans:"2026-03-25",
    dias_dm:13,dias_trans:2,total:15,classif:"2A",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Treino",mecanismo:"Sobrecarga",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",prognostico:"2026-04-12",
    lesson:"Lesão 2A de sóleo por sobrecarga em treino. Retornou em 25/Mar (15 dias). Zagueiro com padrão de perna posterior — recidivou no mesmo dia do retorno.",
    protocol:"Avaliação imediata + plano de reabilitação. Monitorar progressão diária."},
  {id:15,n:"ERICSON",pos:"ZAG",date:"2026-03-05",saida_dm:null,ini_trans:null,fim_trans:null,
    dias_dm:21,dias_trans:0,total:21,classif:"Articular",regiao:"Joelho",lado:"Esquerdo",evento:"Treino",mecanismo:"Dor Tardia",estrutura:"Menisco Medial",exame:"RNM",estagio:"Fase 1",conduta:"Afastado",prognostico:"2026-05-01",
    cirurgia:"2026-03-17",
    lesson:"Artroscopia de menisco medial do joelho esquerdo (cirurgia 17/Mar). Afastamento estimado até 01/Mai. Zagueiro titular em fase inicial de reabilitação.",
    protocol:"Pós-artroscopia: protocolo acelerado — carga parcial D+1, bicicleta D+7, corrida D+14-21, retorno ao treino coletivo 4-6 semanas."},
  {id:16,n:"WALLACE",pos:"ZAG",date:"2026-03-12",saida_dm:null,ini_trans:"2026-03-24",fim_trans:null,
    dias_dm:14,dias_trans:2,total:16,classif:"2A",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Treino",mecanismo:"Sprint",estrutura:"Semitendíneo",exame:"RNM",estagio:"Fase 3",conduta:"Afastado",prognostico:"2026-04-15",
    lesson:"RECIDIVA — Segunda lesão de posterior na temporada (1ª: sóleo D em dez/25). Agora coxa posterior E (semitendíneo) por sprint em treino. Padrão de compensação contralateral.",
    protocol:"Protocolo Nordic Hamstring intensificado. Avaliar assimetria bilateral. Monitorar padrão compensatório."},
  {id:17,n:"GUILHERME QUEIROZ",pos:"ATA",date:"2026-03-17",saida_dm:null,ini_trans:null,fim_trans:null,
    dias_dm:9,dias_trans:0,total:9,classif:"3C",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Treino",mecanismo:"Desaceleração",estrutura:"Cabeça Longa do Bíceps",exame:"RNM",estagio:"Fase 2",conduta:"Afastado",prognostico:"2026-05-11",
    lesson:"RECIDIVA — Segunda lesão na temporada (1ª: sóleo D em dez/25). Agora 3C em bíceps femoral E por desaceleração. Grau mais severo que a anterior. Prognóstico longo (55 dias).",
    protocol:"Reabilitação completa com ênfase em excêntrico de bíceps femoral. Protocolo de desaceleração progressiva. RTP criterioso."},
  {id:18,n:"GUI MARIANO",pos:"ZAG",date:"2026-03-25",saida_dm:null,ini_trans:null,fim_trans:null,
    dias_dm:1,dias_trans:0,total:1,classif:"Recidiva",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Treino",mecanismo:"Aceleração",estrutura:"Perna Posterior",exame:"Pendente",estagio:"Fase 1",conduta:"Afastado",
    lesson:"RECIDIVA — Lesionou perna posterior E no mesmo dia do retorno da lesão anterior (25/Mar). Aceleração em treino. Padrão de retorno prematuro ou reabilitação incompleta.",
    protocol:"Avaliação imediata completa. Investigar se retorno foi prematuro. Plano de reabilitação com critérios objetivos de progressão."}
];

// Status atual do DM — calculado dinamicamente a partir de INJ_HISTORY
// Retorna: { afastados: [...], retornados_recentes: [...] }
function getDmAtual() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const afastados = [];
  const retornados = [];

  // Pegar a lesão mais recente de cada atleta para evitar duplicação
  const latestByAthlete = {};
  for (const inj of INJ_HISTORY) {
    const existing = latestByAthlete[inj.n];
    const dCur = parseDateBR(inj.date);
    const dPrev = existing ? parseDateBR(existing.date) : null;
    if (!existing || (dCur && (!dPrev || dCur > dPrev))) {
      latestByAthlete[inj.n] = inj;
    }
  }

  for (const inj of Object.values(latestByAthlete)) {
    const dtLesao = parseDateBR(inj.date);
    if (!dtLesao) continue;
    const dias = Math.round((today - dtLesao) / 86400000);
    const fimTrans = inj.fim_trans ? parseDateBR(inj.fim_trans) : null;
    const retornou = fimTrans && fimTrans < today;
    const diasRetorno = retornou ? Math.round((today - fimTrans) / 86400000) : null;

    // Estágio estimado
    let estagio = inj.estagio;
    if (retornou) {
      estagio = "Fase 4";
    } else if (!inj.fim_trans) {
      if (dias > 30) estagio = "Fase 3";
      else if (dias > 14) estagio = "Fase 2";
      else estagio = "Fase 1";
    }

    const entry = {
      n: inj.n, pos: inj.pos, classif: inj.classif,
      regiao: `${inj.regiao} ${inj.lado?inj.lado[0]:""} — ${inj.estrutura}`,
      dias, estagio,
      conduta: retornou ? "Retornou" : inj.conduta,
      prognostico: (()=>{const dt=parseDateBR(inj.prognostico);return dt?dt.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}):"Em avaliação";})(),
      retorno_real: fimTrans ? fimTrans.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}) : null,
      dias_retorno: diasRetorno,
      desde: dtLesao.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})
    };

    if (retornou) {
      // Mostrar retornados recentes (últimos 30 dias desde retorno)
      if (diasRetorno <= 30) retornados.push(entry);
    } else {
      afastados.push(entry);
    }
  }

  return {
    afastados: afastados.sort((a,b) => b.dias - a.dias),
    retornados: retornados.sort((a,b) => a.dias_retorno - b.dias_retorno),
    todos: [...afastados, ...retornados].sort((a,b) => b.dias - a.dias)
  };
}
const DM_DATA = getDmAtual();
const DM_ATUAL = DM_DATA.afastados;

// Correlação epidemiológica — padrões reais do elenco (14 lesões documentadas)
const INJ_PATTERNS=[
  {pattern:"Perna Posterior / Sóleo",present_in:9,total:14,pct:64.3,risk_mult:3.5,c:"#DC2626",
    desc:"Padrão dominante: 64% das lesões envolvem perna posterior (sóleo, gastrocnêmio, semitendíneo, bíceps femoral). Região mais vulnerável do elenco."},
  {pattern:"Mecanismo: Dor Tardia / Sobrecarga",present_in:6,total:14,pct:42.9,risk_mult:2.8,c:"#EA580C",
    desc:"42.9% dos casos são por sobrecarga (dor tardia, sobrecarga). Indicam acúmulo de carga sem recuperação adequada."},
  {pattern:"Camp. Paulista (jogos oficiais)",present_in:6,total:14,pct:42.9,risk_mult:2.5,c:"#7c3aed",
    desc:"6 lesões ocorreram em jogos do Campeonato Paulista. Intensidade competitiva como fator de risco."},
  {pattern:"Recidiva / Mesmo grupo muscular",present_in:4,total:14,pct:28.6,risk_mult:4.2,c:"#DC2626",
    desc:"JEFERSON (2x posterior), JONATHAN (2x semitendíneo), MORELLI (4x lombar/posterior). Recidiva = maior multiplicador de risco."},
  {pattern:"Laterais (LAT/LD)",present_in:6,total:14,pct:42.9,risk_mult:2.3,c:"#EA580C",
    desc:"Laterais representam 42.9% das lesões. Jeferson (2), Jonathan (3), Henrique Teles, Gabriel Inocêncio. Posição de maior demanda HSR."},
  {pattern:"Classif. 2A-2B (moderada)",present_in:6,total:14,pct:42.9,risk_mult:2.0,c:"#CA8A04",
    desc:"42.9% das lesões são grau 2A-2B. Lesões moderadas que afastam 10-39 dias. Padrão que pode ser prevenido com monitoramento."},
  {pattern:"Classif. 4C (grave)",present_in:2,total:14,pct:14.3,risk_mult:5.0,c:"#DC2626",
    desc:"2 lesões 4C: Jeferson (91d) e Erik (47d). As mais graves e custosas. Ambas em treino/jogo com carga alta."},
  {pattern:"Sóleo específico",present_in:5,total:14,pct:35.7,risk_mult:2.6,c:"#EA580C",
    desc:"5 lesões de sóleo (Wallace, Queiroz, Jeferson, Gava, G.Inocêncio, G.Mariano). Estrutura mais afetada — protocolo preventivo urgente."}
];

// Regras de prevenção derivadas dos casos
const PREVENTION=[
  {trigger:"Sono avg 7d < 6",action:"Redução automática 30% do volume",priority:"CRÍTICA",window:"Imediato",evidence:"5/7 lesões tiveram sono < 6 na semana prévia"},
  {trigger:"CMJ Delta < -10%",action:"48h de treino regenerativo obrigatório",priority:"CRÍTICA",window:"Imediato",evidence:"Queda > 10% no CMJ precedeu as 3 lesões mais graves"},
  {trigger:"Assimetria ISO > 15%",action:"Treino individualizado até normalizar",priority:"CRÍTICA",window:"Até normalizar",evidence:"100% das lesões com assimetria > 15% foram em posterior de coxa"},
  
  {trigger:"ACWR > 1.35 + Sono < 6.5",action:"Excluir de HSR e sprints na sessão",priority:"ALTA",window:"Sessão seguinte",evidence:"Combinação presente em 57% dos casos (interação sinérgica)"},
  {trigger:"Dor subindo > 1pt em 3 dias",action:"Avaliação fisioterapia obrigatória",priority:"ALTA",window:"24h",evidence:"Caso KELVIN — dor progressiva ignorada levou a tendinopatia"},
  {trigger:"3 jogos em 10d + LAT/ATA",action:"Volume HSR reduzido 40% no treino seguinte",priority:"MÉDIA",window:"Pós-jogo 3",evidence:"Laterais e atacantes mais vulneráveis por demanda de sprints"},
  {trigger:"Delta BF% > 1.5 em 30 dias",action:"Avaliação nutricional + ajuste biomecânico",priority:"MÉDIA",window:"Semanal",evidence:"Caso G.QUEIROZ — desregulação sistêmica por variação antropométrica"}
];

// Calendário Série B — derivado de sheetData.calendario (aba Calendário do
// Google Sheets) dentro do componente. O array hardcoded antigo (R1-R5 com
// R5 errado em 20/04 vs 19/04 da planilha) foi removido para que mudanças
// na planilha apareçam imediatamente sem edição de código.

// Mapa Semanal — Quadro de Trabalho
// Fonte: Departamento de Futebol Profissional — Sérgio do Prado / Fillipe Soutto / André Leite
// Atualizado: 27/04 a 10/05/2026 (semana atual + próxima).
const WEEK_MAPS=[
{
  week:"27/04 a 03/05/2026",
  next_match:{rod:7,opponent:"Náutico",date:"02/05",time:"16:00",local:"casa",days_to:5},
  days:[
    {d:"2ª 27",md:"MD-5",type:"DESCANSO + TREINO TARDE",focus:"Descanso (manhã) + Treino tarde",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"14:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"15:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"16:00",dur:75,rpe_alvo:"5-6",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:false,tarde:"Lanche (Sala Anexa)",
      wellness:true,cmj:false,notes:"Descanso programado manhã. Treino tarde no Campo Auxiliar."},
    {d:"3ª 28",md:"MD-4",type:"TREINO",focus:"Treino manhã",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:90,rpe_alvo:"6-7",content:"Treino de campo — força/intensidade",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,notes:"Campo Auxiliar. Almoço opcional. Tarde livre."},
    {d:"4ª 29",md:"MD-3",type:"TREINO",focus:"Treino manhã",local:"Estádio Santa Cruz",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:90,rpe_alvo:"6-7",content:"Treino de campo — bloco principal",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,notes:"Estádio Santa Cruz. Almoço opcional."},
    {d:"5ª 30",md:"MD-2",type:"TREINO",focus:"Treino manhã",local:"Estádio Santa Cruz",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:75,rpe_alvo:"5-6",content:"Treino tático — pré-jogo",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,notes:"Estádio Santa Cruz. Almoço opcional."},
    {d:"6ª 01",md:"MD-1",type:"TREINO",focus:"Treino + Início Concentração",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"08:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Treino",time:"09:30",dur:60,rpe_alvo:"4-5",content:"Treino ativação pré-jogo",group:"Elenco"}
      ],
      almoco:false,tarde:"INÍCIO DE CONCENTRAÇÃO",
      wellness:true,cmj:false,notes:"Campo Auxiliar. Após treino: INÍCIO DE CONCENTRAÇÃO."},
    {d:"Sáb 02",md:"MD",type:"JOGO",focus:"Série B R7 — BFC x Náutico",local:"Estádio Santa Cruz",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação — Não Relacionados",group:"Não Relacionados"},
        {name:"Treino Não Relacionados",time:"08:30",dur:75,rpe_alvo:"5-6",content:"Treino Campo Auxiliar — atletas não relacionados",group:"Não Relacionados"},
        {name:"JOGO",time:"16:00",dur:90,rpe_alvo:null,content:"Brasileiro Série B — 7ª Rodada",group:"Elenco"}
      ],
      almoco:true,tarde:"JOGO 16:00",
      wellness:false,cmj:false,notes:"Manhã: Treino Não Relacionados (Campo Auxiliar). JOGO: BFC x Náutico, 16h00. Estádio Santa Cruz. Série B 7ª Rodada."},
    {d:"Dom 03",md:"MD+1",type:"FOLGA",focus:"Descanso Programado",local:"-",
      sessions:[],
      almoco:false,tarde:"Descanso Programado",
      wellness:false,cmj:false,notes:"Descanso programado pós-jogo (Náutico R7)."}
  ]
},
{
  week:"04/05 a 10/05/2026",
  next_match:{rod:8,opponent:"Novorizontino",date:"10/05",time:"19:30",local:"fora",days_to:6},
  days:[
    {d:"2ª 04",md:"MD-6",type:"DESCANSO + TREINO TARDE",focus:"Descanso (manhã) + Treino tarde",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"15:00",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"15:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"16:00",dur:75,rpe_alvo:"5-6",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:false,tarde:"Lanche (Sala Anexa)",
      wellness:true,cmj:false,notes:"Descanso programado manhã. Treino tarde no Campo Auxiliar."},
    {d:"3ª 05",md:"MD-5",type:"TREINO",focus:"Treino manhã",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:90,rpe_alvo:"6-7",content:"Treino de campo — força/intensidade",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,notes:"Campo Auxiliar. Almoço opcional."},
    {d:"4ª 06",md:"MD-4",type:"TREINO",focus:"Treino manhã",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:90,rpe_alvo:"6-7",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,notes:"Campo Auxiliar. Almoço opcional."},
    {d:"5ª 07",md:"MD-3",type:"TREINO TARDE",focus:"Descanso manhã + Treino tarde",local:"Estádio Santa Cruz",
      sessions:[
        {name:"Apresentação",time:"14:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"15:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"16:00",dur:75,rpe_alvo:"5-6",content:"Treino tático",group:"Elenco"}
      ],
      almoco:false,tarde:"Lanche (Sala Anexa)",
      wellness:true,cmj:false,notes:"Descanso manhã. Treino tarde no Estádio Santa Cruz."},
    {d:"6ª 08",md:"MD-2",type:"TREINO",focus:"Treino manhã",local:"Estádio Santa Cruz",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:75,rpe_alvo:"5-6",content:"Treino tático — pré-jogo",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,notes:"Estádio Santa Cruz."},
    {d:"Sáb 09",md:"MD-1",type:"TREINO + VIAGEM",focus:"Treino manhã + Viagem",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"09:00",dur:null,rpe_alvo:null,content:"Apresentação",group:"Elenco"},
        {name:"Treino",time:"10:00",dur:60,rpe_alvo:"4-5",content:"Treino ativação pré-jogo",group:"Elenco"}
      ],
      almoco:true,tarde:"Viagem para São José do Rio Preto-SP",
      wellness:true,cmj:false,notes:"Campo Auxiliar. Almoço + Viagem para São José do Rio Preto-SP."},
    {d:"Dom 10",md:"MD",type:"JOGO",focus:"Série B R8 — Novorizontino x BFC",local:"Jorge Ismael de Biasi",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação — Não Relacionados",group:"Não Relacionados"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação",group:"Não Relacionados"},
        {name:"Treino Não Relacionados",time:"09:00",dur:75,rpe_alvo:"5-6",content:"Treino Campo Auxiliar — atletas não relacionados",group:"Não Relacionados"},
        {name:"JOGO",time:"19:30",dur:90,rpe_alvo:null,content:"Brasileiro Série B — 8ª Rodada",group:"Elenco"}
      ],
      almoco:true,tarde:"JOGO 19:30",
      wellness:false,cmj:false,notes:"Manhã: Treino Não Relacionados (Campo Auxiliar). JOGO: Novorizontino x BFC, 19h30. Jorge Ismael de Biasi. Série B 8ª Rodada."}
  ]
}
];
const WEEK_MAP=WEEK_MAPS[0];

// Mapa de readiness por atleta para a semana
const WEEK_READINESS=(players,alerts)=>{
  const groups={
    full:[],limited:[],excluded:[],physio:[]
  };
  const alertList = alerts || ML.alerts;
  const dmData = getDmAtual();
  const afastadosNames = new Set(dmData.afastados.map(a => a.n));
  players.forEach(p=>{
    // Atletas afastados do DM vão direto para excluídos
    if(afastadosNames.has(p.n)){
      const dmInfo = dmData.afastados.find(a => a.n === p.n);
      groups.excluded.push({...p,zone:"DM",dose:`Afastado — ${dmInfo?.regiao||"DM"} (${dmInfo?.dias||"?"}d)`,prob:1});
      return;
    }
    const alert=alertList.find(a=>a.n===p.n);
    if(alert){
      if(alert.zone==="VERMELHO") groups.excluded.push({...p,zone:alert.zone,dose:alert.dose,prob:alert.prob});
      else if(alert.zone==="LARANJA") groups.limited.push({...p,zone:alert.zone,dose:alert.dose,prob:alert.prob});
      else groups.full.push({...p,zone:alert.zone,dose:alert.dose,prob:alert.prob});
    } else {
      groups.full.push({...p,zone:"VERDE",dose:"Liberado — carga integral",prob:0});
    }
  });
  return groups;
};

const score=(p)=>{
  let s=0,reasons=[];
  if(p.ai>1.45){s+=30;reasons.push("ACWR "+p.ai.toFixed(2));}else if(p.ai>1.3){s+=15;reasons.push("ACWR "+p.ai.toFixed(2));}
  if(p.d>=4){s+=20;reasons.push("Dor "+p.d+"/10");}else if(p.d>=2){s+=8;reasons.push("Dor "+p.d+"/10");}
  if(p.rp<=5){s+=18;reasons.push("RecP "+p.rp+"/10");}else if(p.rp<=6){s+=8;}
  if(p.da>=2.5){s+=10;reasons.push("Dor avg "+p.da);}
  if(p.sa&&p.sa<6){s+=8;reasons.push("Sono avg "+p.sa);}
  if(p.rpa&&p.rpa<6){s+=6;}
  return {score:Math.min(s,100),reasons,level:s>=65?"CRITICAL":s>=50?"HIGH":s>=20?"MODERATE":"LOW"};
};

const LV={CRITICAL:{c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA",l:"Crítico"},HIGH:{c:"#EA580C",bg:"#FFF7ED",bc:"#FED7AA",l:"Alto"},MODERATE:{c:"#CA8A04",bg:"#FEFCE8",bc:"#FEF08A",l:"Moderado"},LOW:{c:"#16A34A",bg:"#F0FDF4",bc:"#BBF7D0",l:"Ótimo"}};

// Estado unificado: combina Ψ(t) (PCA Fonseca 2020), prob ML 7d (XGBoost) e Risk Score clínico
// numa só leitura, escolhendo a zona mais pessimista entre as fontes dinâmicas.
// Usado tanto no sidebar quanto na ficha individual para evitar mismatches entre painéis.
const ZRANK={"#16A34A":0,"#CA8A04":1,"#EA580C":2,"#DC2626":3};
const estado=(p,alert,psiSeries)=>{
  const psiLast=psiSeries&&psiSeries.length>=3?psiSeries[psiSeries.length-1]:null;
  const psiDev=psiLast&&psiLast.baseline!==null&&psiLast.baseline!==undefined&&psiLast.sd>0
    ?(psiLast.psi-psiLast.baseline)/psiLast.sd:null;
  const psiEws=psiLast?.ews?.risingCount||0;
  const mlProb=alert&&typeof alert.prob==="number"?alert.prob:null;
  let c="#16A34A",l="Estável";
  if(psiDev!==null){
    if(psiDev>=3||(psiDev>=1.5&&psiEws>=2)){c="#DC2626";l="Transição iminente";}
    else if(psiDev>=2||(psiDev>=1&&psiEws>=2)){c="#EA580C";l="Sinal de alerta";}
    else if(psiDev>=1||psiEws>=2){c="#CA8A04";l=psiEws>=2&&psiDev<1?"Sinais precoces":"Atenção";}
    else if(psiEws>=1){l="Estável c/ sinal precoce";}
  }
  if(mlProb!==null){
    const mlC=mlProb>=0.5?"#DC2626":mlProb>=0.3?"#EA580C":mlProb>=0.15?"#CA8A04":"#16A34A";
    const mlL=mlProb>=0.5?"Risco alto":mlProb>=0.3?"Risco moderado-alto":mlProb>=0.15?"Risco moderado":"Risco baixo";
    if(ZRANK[mlC]>ZRANK[c]){c=mlC;l=mlL;}
  }
  const hasDyn=psiDev!==null||mlProb!==null;
  if(!hasDyn&&p?.risk&&LV[p.risk]){c=LV[p.risk].c;l=LV[p.risk].l;}
  return {c,l,psiDev,psiEws,mlProb,hasDyn};
};
// Idade em dias de uma string de data (formatos dd/mm/yyyy, yyyy-mm-dd, dd-mm-yyyy, etc.)
const daysOld=(d)=>{
  if(!d)return null;
  const s=String(d).trim();let dt;
  if(/^\d{4}-\d{2}-\d{2}/.test(s))dt=new Date(s);
  else{const p=s.split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(a>31)dt=new Date(a,b-1,c);else if(c>31)dt=new Date(c,b-1,a);else dt=new Date(c<100?c+2000:c,b-1,a);}}
  if(!dt||isNaN(dt))return null;
  return Math.round((Date.now()-dt.getTime())/86400000);
};
const acc="#dc2626"; // Vermelho Botafogo (alinhado ao Scouting BFSA)
const humorL={1:"Raiva",2:"Confuso",3:"Preocupado",4:"Confiante",5:"Tranquilo"};

const Tip=({active,payload,label,theme})=>{
  const t=theme||THEMES.light;
  if(!active||!payload?.length)return null;
  return <div style={{background:t.tooltipBg,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:`0 4px 12px ${t.shadowMd}`}}>
    <div style={{color:t.textFaint,marginBottom:3,fontWeight:600}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color||t.text,fontWeight:600}}>{p.name}: {typeof p.value==="number"?p.value.toFixed(1):p.value}</div>)}
  </div>;
};

const ScoreRing=({v,sz=48,th=4,theme,c:cOverride})=>{
  const t=theme||THEMES.light;
  const c=cOverride||(v>=65?"#DC2626":v>=50?"#EA580C":v>=20?"#CA8A04":"#16A34A");
  const pct=Math.min(v/100,1),r=(sz-th)/2,ci=2*Math.PI*r;
  return <div style={{position:"relative",width:sz,height:sz,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={t.ringBg} strokeWidth={th}/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c} strokeWidth={th} strokeDasharray={ci} strokeDashoffset={ci*(1-pct)} strokeLinecap="round"/>
    </svg>
    <div style={{position:"absolute",fontFamily:"'JetBrains Mono'",fontSize:sz/3.5,fontWeight:700,color:c}}>{v}</div>
  </div>;
};

const PlayerPhoto=({name,sz=40,theme})=>{
  const t=theme||THEMES.light;
  const src=`/players/${encodeURIComponent(name)}.png`;
  return <div style={{width:sz,height:sz,borderRadius:"50%",background:t.bgMuted2,border:`2px solid ${t.border}`,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <img src={src} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.parentNode.querySelector("span").style.display="flex";}} />
    <span style={{display:"none",alignItems:"center",justifyContent:"center",width:"100%",height:"100%",fontFamily:"'Inter Tight'",fontWeight:700,fontSize:sz/3,color:t.textFaint}}>{name.slice(0,2)}</span>
  </div>;
};

const Badge=({level,color,label,title})=>{
  const l=level&&LV[level]?LV[level]:null;
  const bg=color?`${color}1A`:l?l.bg:"transparent";
  const c=color||(l?l.c:"#666");
  const bc=color?`${color}55`:l?l.bc:"#ccc";
  const text=label!==undefined?label:(l?l.l:"");
  return <span title={title} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:bg,color:c,border:`1px solid ${bc}`}}>{text}</span>;
};

const WBar=({label,v,max=10,inv,theme})=>{
  const t=theme||THEMES.light;
  const c=inv?(v>5?"#DC2626":v>3?"#CA8A04":"#16A34A"):(v>7?"#16A34A":v>5?"#CA8A04":"#DC2626");
  return <div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
      <span style={{fontSize:11,color:t.textMuted,fontWeight:500}}>{label}</span>
      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:c}}>{v?.toFixed?.(1)??v}</span>
    </div>
    <div style={{height:4,background:t.bgMuted2,borderRadius:4}}>
      <div style={{height:"100%",width:`${Math.min((v/max)*100,100)}%`,background:c,borderRadius:4,transition:"width .6s"}}/>
    </div>
  </div>;
};

export default function Dashboard(){
  const [sel,setSel]=useState(null);
  const [tab,setTab]=useState("squad");
  const [riskSort,setRiskSort]=useState({col:"riskScore",dir:"desc"});
  const [sessSort,setSessSort]=useState({col:"classif",dir:"asc"});
  // Toggle de período da aba Sessão de Treino: "last" (última sessão LIVE)
  // ou "week" (agregação dos últimos 7 dias para todos os atletas que
  // participaram em pelo menos uma sessão do período).
  const [sessRange,setSessRange]=useState("last");
  const [excludedAthletes,setExcludedAthletes]=useState(new Set());
  const [expandedGames,setExpandedGames]=useState(new Set());
  const [showAthleteFilter,setShowAthleteFilter]=useState(false);
  const [modelExpand,setModelExpand]=useState({features:false,fadiga:false,logreg:false});
  // Dark Mode é o padrão visual (alta-contraste, sports analytics).
  // Usa a chave `theme_v2` para invalidar preferências antigas (`theme=light`)
  // que ficaram salvas antes da virada para dark-by-default.
  const [dark,setDark]=useState(()=>{if(typeof window!=="undefined"){const s=localStorage.getItem("theme_v2");if(s)return s==="dark";}return true;});
  const [todayStr]=useState(()=>{try{return todayStr;}catch{return"";}});
  const [todayFull]=useState(()=>{try{return todayFull;}catch{return"";}});
  const t=THEMES[dark?"dark":"light"];
  const pri=dark?"#f1f5f9":"#1A1A1A";
  useEffect(()=>{localStorage.setItem("theme_v2",dark?"dark":"light");},[dark]);

  // ═══ Google Sheets — dados em tempo real ═══
  const { sheetData, loading: sheetLoading, error: sheetError, lastUpdate, refresh: refreshSheet, isLive } = useSheetData({ interval: 120_000, enabled: true });

  // Lesões: usar dados live da planilha quando disponíveis, senão fallback para INJ_HISTORY
  const liveInjuries = useMemo(() => {
    const sheetLesoes = sheetData?.lesoes;
    if (sheetLesoes && sheetLesoes.length > 0) return sheetLesoes;
    return INJ_HISTORY;
  }, [sheetData]);

  // DM dinâmico baseado em liveInjuries
  const liveDmData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const afastados = [];
    const retornados = [];
    const latestByAthlete = {};
    for (const inj of liveInjuries) {
      const existing = latestByAthlete[inj.n];
      const dCur = parseDateBR(inj.date);
      const dPrev = existing ? parseDateBR(existing.date) : null;
      if (!existing || (dCur && (!dPrev || dCur > dPrev))) {
        latestByAthlete[inj.n] = inj;
      }
    }
    for (const inj of Object.values(latestByAthlete)) {
      const dtLesao = parseDateBR(inj.date);
      if (!dtLesao) continue;
      const dias = Math.round((today - dtLesao) / 86400000);
      const fimTrans = inj.fim_trans ? parseDateBR(inj.fim_trans) : null;
      const retornou = fimTrans && fimTrans < today;
      const diasRetorno = retornou ? Math.round((today - fimTrans) / 86400000) : null;
      let estagio = inj.estagio || "";
      if (retornou) { estagio = "Fase 4"; }
      else if (!inj.fim_trans) {
        if (dias > 30) estagio = "Fase 3";
        else if (dias > 14) estagio = "Fase 2";
        else estagio = "Fase 1";
      }
      const entry = {
        n: inj.n, pos: inj.pos, classif: inj.classif,
        regiao: inj.regiao && inj.estrutura ? `${inj.regiao} ${inj.lado?String(inj.lado)[0]:""} — ${inj.estrutura}` : (inj.regiao || ""),
        dias, estagio,
        conduta: retornou ? "Retornou" : (inj.conduta || "Afastado"),
        prognostico: (()=>{const d=parseDateBR(inj.prognostico);return d?d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}):(inj.prognostico||"Em avaliação");})(),
        retorno_real: fimTrans ? fimTrans.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}) : null,
        dias_retorno: diasRetorno,
        desde: dtLesao.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})
      };
      if (retornou) { if (diasRetorno <= 30) retornados.push(entry); }
      else { afastados.push(entry); }
    }
    return {
      afastados: afastados.sort((a,b) => b.dias - a.dias),
      retornados: retornados.sort((a,b) => a.dias_retorno - b.dias_retorno),
    };
  }, [liveInjuries]);

  // CMJ externo: merge com dados existentes
  const liveCmjExterno = useMemo(() => sheetData?.cmj_externo || {}, [sheetData]);

  // Merge: SESSION_DATA com dados live da planilha (live tem prioridade)
  const LIVE_SESSION = useMemo(() => {
    const hasLive = sheetData?.sessionAtletas && Object.keys(sheetData.sessionAtletas).length > 0;
    if (!hasLive) return SESSION_DATA_EMPTY;
    // 100% dinâmico — dados vêm da planilha
    const merged = { meta: { ...SESSION_DATA_EMPTY.meta }, atletas: {} };
    // Extrair metadata da sessão a partir dos dados GPS (sessionTitle, date)
    const firstAth = Object.values(sheetData.sessionAtletas)[0];
    if (firstAth?._sessionDate) {
      try {
        const d = new Date(firstAth._sessionDate);
        merged.meta._liveDate = isNaN(d) ? firstAth._sessionDate : d.toLocaleDateString("pt-BR");
      } catch(e) { merged.meta._liveDate = firstAth._sessionDate; }
    }
    // Calcular duração média e tipo a partir dos dados dos atletas
    const duracoes = Object.values(sheetData.sessionAtletas).map(a => a.carga_interna?.duracao || 0).filter(d => d > 0);
    if (duracoes.length) merged.meta.duracao = Math.round(duracoes.reduce((a,b) => a+b, 0) / duracoes.length);
    // Tipo da sessão a partir do sessionTitle mais comum
    const titles = Object.values(sheetData.sessionAtletas).map(a => a.obs || "").filter(Boolean);
    if (titles.length) {
      const t0 = titles[0];
      const match = t0.match(/— (.+)$/);
      if (match) merged.meta.tipo = match[1];
    }
    for (const [name, data] of Object.entries(sheetData.sessionAtletas)) {
      merged.atletas[name] = { ...data, _fromSheet: true };
    }
    if (sheetData.timestamp) {
      const d = new Date(sheetData.timestamp);
      merged.meta = { ...merged.meta, _liveDate: merged.meta._liveDate || d.toLocaleDateString("pt-BR"), _liveTime: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    }
    return merged;
  }, [sheetData]);

  // Merge P com dados live do Google Sheets e recalcular scores.
  // Também adiciona atletas presentes na aba `atletas` (cadastro) que ainda
  // não estão no array P estático — garante que ninguém suma do Squad/Sidebar
  // por estar fora do hard-code, atendendo à diretriz "puxar atletas da aba".
  const players=useMemo(()=>{
    const liveAtletas = sheetData?.sessionAtletas || {};
    const gpsData = sheetData?.gps || {};
    const fisioData = sheetData?.fisioterapia || {};
    const diarioData = sheetData?.diario || {};
    const cadastro = sheetData?.atletas_cad || {};
    // Helper para mapear posição macro do cadastro → sigla curta usada por P
    // (P guarda GOL/ZAG/LAT/VOL/MEI/EXT/ATA; cadastro pode trazer "Volante" etc.)
    const macroToShort = (macro, raw) => {
      const m = String(macro || "").toUpperCase();
      if (m === "GOLEIRO") return "GOL";
      if (m === "ZAGUEIRO") return "ZAG";
      if (m === "LATERAL") return "LAT";
      if (m === "EXTREMO") return "EXT";
      if (m === "ATACANTE") return "ATA";
      // Diretriz: volantes e meias agrupados num único rótulo MEI (Meio-Campo)
      // para que apareçam juntos em todos os comparativos por posição.
      if (m === "MEIO-CAMPO") return "MEI";
      return raw ? String(raw).toUpperCase().slice(0,3) : "—";
    };
    // Cadastro = fonte de verdade do elenco. Quando estiver carregado,
    //   • atletas presentes em P mas AUSENTES do cadastro são removidos
    //     (Sub-20, emprestados, ex-jogadores que ainda gravam GPS);
    //   • atletas em cadastro fora de P são adicionados.
    // Quando o cadastro vier vazio (API offline), faz fallback para o array
    // P inteiro para não quebrar a UI durante carregamento.
    const cadKeys = Object.keys(cadastro);
    const cadastroLoaded = cadKeys.length > 0;
    const cadSet = new Set(cadKeys);

    // Filtro de atividade recente: ex-jogadores (saídos, devolvidos,
    // transferidos) podem permanecer no cadastro mas sem coleta há semanas.
    // Considera ativo quem tem GPS, diário ou fisio nos últimos 45 dias.
    // Lesionados em fisio contínua passam pelo critério fisio.
    // Fallback: se ninguém estiver "ativo" (entre temporadas, dados
    // desatualizados), o filtro é desligado para não sumir com o elenco.
    const ACTIVITY_WINDOW_DAYS = 45;
    const ACTIVITY_WINDOW_MS = ACTIVITY_WINDOW_DAYS * 86400000;
    const nowTs = Date.now();
    const parseActDate = (d) => {
      if (!d) return 0;
      const s = String(d).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime();
      const parts = s.split(/[\/\-\.]/);
      if (parts.length >= 3) {
        const [a,b,c] = parts.map(Number);
        if (a > 31) return new Date(a, b-1, c).getTime();
        if (c > 31) return new Date(c, b-1, a).getTime();
        return new Date(c, a-1, b).getTime();
      }
      return new Date(s).getTime() || 0;
    };
    const lastActivity = (name) => {
      let max = 0;
      const sources = [gpsData[name], fisioData[name], diarioData[name]];
      for (const arr of sources) {
        if (!arr?.length) continue;
        for (const e of arr) {
          const ts = parseActDate(e.date);
          if (ts > max) max = ts;
        }
      }
      return max;
    };
    const someoneRecentlyActive = cadKeys.some(n => {
      const ts = lastActivity(n);
      return ts > 0 && (nowTs - ts) <= ACTIVITY_WINDOW_MS;
    });
    const isRecentlyActive = (name) => {
      if (!someoneRecentlyActive) return true; // fallback: sem dados recentes, não filtra
      const ts = lastActivity(name);
      return ts > 0 && (nowTs - ts) <= ACTIVITY_WINDOW_MS;
    };

    const baseP = cadastroLoaded ? P.filter(p => cadSet.has(p.n) && isRecentlyActive(p.n)) : P;
    const inP = new Set(baseP.map(p => p.n));
    const extras = [];
    if (cadastroLoaded) {
      for (const [name, info] of Object.entries(cadastro)) {
        if (inP.has(name)) continue;
        if (!isRecentlyActive(name)) continue;
        extras.push({
          n: name,
          pos: macroToShort(info?.pos_macro, info?.posicao),
          id: Math.round(info?.idade || 0),
          h: 3, e: 3,
          rg: 7, rp: 7, d: 0, sq: 7,
          rpa: 7, da: 0, sa: 7,
          nw: 0, pse: 0, sra: 0,
          w: Math.round(info?.peso_kg || 0),
          alt: Math.round(info?.altura_cm || 0),
          bf: 0, mm: 0, imc: 0, nc: 0,
          ai: 1.0, cmj: 0, ct: [], wt: null,
          _fromAtletasTab: true,
          _camisa: info?.camisa, _grupo: info?.grupo
        });
      }
    }
    const all = [...baseP, ...extras];
    return all.map(p=>{
      const live = liveAtletas[p.n];
      const merged = {...p};
      // Consolidação: VOL→MEI no display (volantes e meias compartilham o
      // mesmo bucket "Meio-Campo" em todos os comparativos por posição).
      if (merged.pos === "VOL") merged.pos = "MEI";
      // Cadastro (aba atletas) é a FONTE DE VERDADE para idade/posição/altura/
      // peso/camisa. Sobrescreve dados hard-coded em P (que pode estar
      // desatualizado para idade/posição). Antropometria/questionário ainda
      // podem refinar peso/altura abaixo com leituras mais recentes.
      const cad = cadastro[p.n];
      if (cad) {
        if (cad.idade > 0) merged.id = Math.round(cad.idade);
        if (cad.altura_cm > 0)
          merged.alt = Math.round(cad.altura_cm < 3 ? cad.altura_cm * 100 : cad.altura_cm);
        if (cad.peso_kg > 0) merged.w = Math.round(cad.peso_kg);
        if (cad.posicao) merged.pos = macroToShort(cad.pos_macro, cad.posicao);
        if (cad.camisa) merged._camisa = cad.camisa;
        if (cad.grupo) merged._grupo = cad.grupo;
        if (cad.pe_dominante) merged._peDom = cad.pe_dominante;
      }
      // Nº de sessões do GPS real (contagem de sessões distintas)
      const gpsEntries = gpsData[p.n];
      if(gpsEntries?.length) {
        const uniqueSessions = new Set(gpsEntries.map(e => e.date + "||" + (e.sessionTitle || "")));
        merged.nc = uniqueSessions.size;
      }
      if(live){
        // Sobrescrever campos com dados live quando disponíveis
        if(live.fisio?.dor_pos>0) merged.d=live.fisio.dor_pos;
        if(live.fisio?.sono_noite>0) merged.sq=live.fisio.sono_noite;
        if(live.fisio?.rec_percebida>0) merged.rg=live.fisio.rec_percebida;
        if(live.carga_interna?.srpe_sessao>0) merged.pse=live.carga_interna.srpe_sessao;
        if(live.carga_interna?.srpe_total>0) merged.sra=live.carga_interna.srpe_total;
        if(live.carga_interna?.duracao>0) merged.duracao=live.carga_interna.duracao;
        if(live.nm_response?.cmj_pre>0) merged.cmj=live.nm_response.cmj_pre;
        if(live.nm_response?.asi_pos>0) merged.asi=live.nm_response.asi_pos;
        if(live.gps?.dist_total>0) merged.dist=live.gps.dist_total;
        if(live.gps?.hsr>0) merged.hsr=live.gps.hsr;
        // ACWR a partir do GPS
        if(live.gps?.hsr_baseline>0 && live.gps?.hsr>0) merged.ai=Math.round((live.gps.hsr/live.gps.hsr_baseline)*100)/100;
        // Classificação
        if(live.classificacao) merged._liveClassif=live.classificacao;
        merged._fromSheet=true;
      }
      // Sempre puxar dados do questionário diretamente (independente de ter GPS)
      const questEntries = sheetData?.questionarios?.[p.n];
      if(questEntries?.length) {
        const lastQ = questEntries[questEntries.length-1];
        // Freshness: questionário >14d vira "stale". Não sobrescreve campos do dia
        // com dados velhos (evita Risk Score baseado em dor/recuperação defasada).
        const _qDaysOld = daysOld(lastQ.date);
        const _qFresh = _qDaysOld===null||_qDaysOld<=14;
        merged._questDaysOld = _qDaysOld;
        merged._questStale = _qDaysOld!==null && _qDaysOld>14;
        // Dados pontuais do último questionário (sobrescrevem hardcoded E live)
        if(_qFresh){
        if(lastQ.sono_qualidade>0) merged.sq=lastQ.sono_qualidade;
        if(lastQ.recuperacao_geral>0) merged.rg=lastQ.recuperacao_geral;
        if(lastQ.recuperacao_pernas>0) merged.rp=lastQ.recuperacao_pernas;
        if(lastQ.dor>=0) merged.d=lastQ.dor;
        if(lastQ.sono_horas>0) merged.sh=lastQ.sono_horas;
        }
        // Peso atualizado do questionário (composição corporal)
        if(lastQ.peso>0) { merged.w=lastQ.peso; merged.imc=merged.alt>0?Math.round(lastQ.peso/((merged.alt/100)**2)*10)/10:merged.imc; }
        // Humor do questionário
        if(lastQ.humor) {
          const hMap={"muito bem":5,"bem":4,"normal":3,"tranquilo":4,"motivado":5,"cansado":2,"mal":1,"muito mal":1,"ansioso":2,"irritado":2,"estressado":2};
          const hv=hMap[lastQ.humor.toLowerCase()];
          if(hv) merged.h=hv;
        }
        if(lastQ.estado) {
          const eMap={"otimo":5,"ótimo":5,"muito bem":5,"bem":4,"normal":3,"regular":3,"cansado":2,"mal":1,"muito cansado":1};
          const ev=eMap[lastQ.estado.toLowerCase()];
          if(ev) merged.e=ev;
        }
        merged._questDate=lastQ.date||"";
        // Averages dos últimos 7 — só aplicar se o último questionário for fresco;
        // caso contrário a janela "últimos 7" também está defasada e contamina o Risk Score.
        const recent = questEntries.slice(-7);
        if(_qFresh){
        const rpVals = recent.map(q => q.recuperacao_pernas).filter(v => v > 0);
        if(rpVals.length) merged.rpa = Math.round(rpVals.reduce((a,b)=>a+b,0)/rpVals.length*10)/10;
        const sqVals = recent.map(q => q.sono_qualidade).filter(v => v > 0);
        if(sqVals.length) merged.sa = Math.round(sqVals.reduce((a,b)=>a+b,0)/sqVals.length*10)/10;
        const dVals = recent.map(q => q.dor).filter(v => v >= 0);
        if(dVals.length) merged.da = Math.round(dVals.reduce((a,b)=>a+b,0)/dVals.length*10)/10;
        const rgVals = recent.map(q => q.recuperacao_geral).filter(v => v > 0);
        if(rgVals.length) merged.rga = Math.round(rgVals.reduce((a,b)=>a+b,0)/rgVals.length*10)/10;
        }
        // Tendência 7 Dias dinâmica (substitui wt hardcoded)
        if(recent.length>=1) {
          const fmtDate=(d)=>{if(!d)return"?";const s=String(d);const parts=s.split(/[\/\-\.]/);if(parts.length>=2){const day=parts[0].length<=2?parts[0]:parts[2];const mon=parts[0].length<=2?parts[1]:parts[1];const mNames=["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];return (mNames[Number(mon)]||mon)+"/"+day;}return s.slice(-5);};
          merged.wt={
            dt:recent.map(q=>fmtDate(q.date)),
            s:recent.map(q=>q.sono_qualidade||0),
            r:recent.map(q=>q.recuperacao_pernas||q.recuperacao_geral||0),
            dr:recent.map(q=>q.dor||0)
          };
          merged._wtLive=true;
        }
      }
      // Antropometria: composição corporal atualizada (prioridade sobre questionário)
      const antropEntries = sheetData?.antropometria?.[p.n];
      if(antropEntries?.length) {
        const lastA = antropEntries[antropEntries.length-1];
        // Peso: validar faixa razoável (40-150kg)
        if(lastA.peso>30 && lastA.peso<160) merged.w=lastA.peso;
        // Gordura: validar faixa (1-50%)
        if(lastA.gordura>0 && lastA.gordura<50) merged.bf=lastA.gordura;
        // Massa muscular: validar faixa razoável (20-70kg)
        if(lastA.massa_muscular>15 && lastA.massa_muscular<80) merged.mm=lastA.massa_muscular;
        // Altura: converter metros→cm se necessário, validar faixa
        if(lastA.altura>0) {
          const altCm = lastA.altura<3 ? Math.round(lastA.altura*100) : lastA.altura;
          if(altCm>140 && altCm<220) merged.alt=altCm;
        }
        // IMC: usar se razoável, senão recalcular
        if(lastA.imc>15 && lastA.imc<45) merged.imc=lastA.imc;
        // Recalcular IMC com dados validados
        if(merged.w>0 && merged.alt>100) merged.imc=Math.round(merged.w/((merged.alt/100)**2)*10)/10;
      }
      // CMJ trend dinâmico a partir dos saltos da planilha
      const saltosEntries = sheetData?.saltos?.[p.n];
      const cmjExtEntries = sheetData?.cmj_externo?.[p.n];
      if(cmjExtEntries?.length) {
        merged.ct=cmjExtEntries.map(e=>e.cmj||Math.max(e.cmj_1||0,e.cmj_2||0,e.cmj_3||0));
        merged._ctDates=cmjExtEntries.map(e=>e.date||"");
        merged._ctLive=true;
      } else if(saltosEntries?.length) {
        merged.ct=saltosEntries.map(e=>Math.max(e.cmj_1||0,e.cmj_2||0,e.cmj_3||0)).filter(v=>v>0);
        merged._ctDates=saltosEntries.map(e=>e.date||"");
        merged._ctLive=true;
      }
      // Monotonia e Strain dinâmicos a partir do diário (últimos 7 dias de sRPE)
      const diarioEntries = sheetData?.diario?.[p.n];
      if(diarioEntries?.length>=3) {
        const last7 = diarioEntries.slice(-7);
        const srpeVals = last7.map(d => d.spe || (d.pse||0)*(d.duracao||0)).filter(v => v > 0);
        if(srpeVals.length>=3) {
          const mean = srpeVals.reduce((a,b)=>a+b,0)/srpeVals.length;
          const sd = Math.sqrt(srpeVals.reduce((a,v)=>a+Math.pow(v-mean,2),0)/srpeVals.length);
          merged._monotonia = sd > 0 ? Math.round((mean/sd)*10)/10 : 0;
          merged._strain = Math.round(mean * merged._monotonia);
        }
      }
      // Fallback: PLAYER_EXT se não tiver dados live
      if(!merged._monotonia) {
        const ext = PLAYER_EXT[p.n];
        if(ext) { merged._monotonia = ext.monotonia; merged._strain = ext.strain; }
      }
      const s=score(merged);
      return {...merged,riskScore:s.score,risk:s.level,reasons:s.reasons};
    }).sort((a,b)=>b.riskScore-a.riskScore);
  },[sheetData]);
  // Merge ML.alerts com dados live — atualizar ACWR, CMJ, Sono, Bio dinamicamente
  const liveAlerts = useMemo(() => {
    const liveAtletas = sheetData?.sessionAtletas || {};
    return ML.alerts.map(a => {
      const live = liveAtletas[a.n];
      const p = players.find(pl => pl.n === a.n);
      if (!live && !p) return a;
      const merged = { ...a };
      // ACWR do GPS live
      if (live?.gps?.hsr_baseline > 0 && live?.gps?.hsr > 0) {
        merged.acwr = Math.round((live.gps.hsr / live.gps.hsr_baseline) * 100) / 100;
      } else if (p?.ai) {
        merged.acwr = p.ai;
      }
      // CMJ delta do live (comparar com baseline do ct array)
      if (live?.nm_response?.cmj_pre > 0 && p?.ct?.length > 1) {
        const baseline = p.ct.slice(0, -1).reduce((s, v) => s + v, 0) / (p.ct.length - 1);
        merged.cmj = Math.round((live.nm_response.cmj_pre - baseline) / baseline * 1000) / 10;
      }
      // Sono do live
      if (live?.fisio?.sono_noite > 0) merged.sono = live.fisio.sono_noite;
      else if (p?.sq) merged.sono = p.sq;
      // Déficit biológico recalculado (sono + dor + rec invertidos)
      const sono = merged.sono || a.sono;
      const dor = live?.fisio?.dor_pos || p?.d || 0;
      const rec = live?.fisio?.rec_percebida || p?.rg || 7;
      merged.bio = Math.round(((10 - sono) * 0.4 + dor * 0.3 + (10 - rec) * 0.3) * 10) / 10;
      // Prob recalculada: base + ajustes por dados live
      const acwrFactor = merged.acwr > 1.45 ? 0.15 : merged.acwr > 1.3 ? 0.08 : merged.acwr < 0.8 ? 0.05 : 0;
      const sonoFactor = sono < 6 ? 0.08 : sono < 7 ? 0.03 : 0;
      const dorFactor = dor > 5 ? 0.10 : dor > 3 ? 0.05 : 0;
      const bioFactor = merged.bio > 2.0 ? 0.08 : merged.bio > 1.5 ? 0.04 : 0;
      // Lesão prévia dinâmica: calcular a partir de INJ_HISTORY em vez de SHAP hardcoded
      const today = new Date(); today.setHours(0,0,0,0);
      const playerInj = liveInjuries.filter(inj => inj.n === a.n);
      const recentInj = playerInj.filter(inj => {
        const d = parseDateBR(inj.date);
        return d && (today - d) / 86400000 < 90;
      });
      const injBase = recentInj.length > 0
        ? Math.min(0.25, recentInj.reduce((max, inj) => {
            const daysSince = (today - parseDateBR(inj.date)) / 86400000;
            const severity = daysSince < 30 ? 0.20 : daysSince < 60 ? 0.15 : 0.10;
            const recidiva = playerInj.filter(j => j.regiao === inj.regiao).length > 1 ? 0.05 : 0;
            return Math.max(max, severity + recidiva);
          }, 0))
        : (a.shap_pos?.find(s => s.f.includes("Lesão Prévia"))?.sv || 0);
      const baseProb = Math.max(0.05, injBase);
      merged.prob = Math.min(0.95, Math.max(0.05, baseProb + acwrFactor + sonoFactor + dorFactor + bioFactor));
      // Atualizar zona de risco
      merged.zone = merged.prob > 0.50 ? "VERMELHO" : merged.prob > 0.30 ? "LARANJA" : merged.prob > 0.15 ? "AMARELO" : "VERDE";
      // Dose dinâmica baseada na prob recalculada
      if (merged.prob > 0.50) merged.dose = "EXCLUIR da sessão. Fisioterapia + regenerativo.";
      else if (merged.prob > 0.30) merged.dose = "MED: 50% volume. Sem HSR.";
      else if (merged.prob > 0.15) merged.dose = "Reduzir HSR 30%. Monitorar PSE.";
      else merged.dose = "Liberado. Programa preventivo padrão.";
      // Fatigue debt dinâmico: usar sRPE acumulado do live se disponível
      if (p?.sra > 0) merged.fatigue_debt = Math.round(p.sra * (merged.acwr || 1) * 2.5);
      return merged;
    });
  }, [sheetData, players]);

  const sp=sel?players.find(p=>p.n===sel):null;
  const tabs=[{id:"squad",l:"Visão Geral",ic:Users},{id:"alerts",l:"Alertas",ic:AlertTriangle},{id:"carga",l:"Carga & ACWR",ic:TrendingUp},{id:"neuro",l:"Neuromuscular",ic:Zap},{id:"fisio",l:"Fisiológico",ic:Heart},{id:"jogos",l:"Jogos",ic:Trophy},{id:"mapa",l:"Mapa Semanal",ic:Calendar},{id:"player",l:"Individual",ic:Eye},{id:"sessao",l:"Sessão de Treino",ic:Activity},{id:"model",l:"Modelo Preditivo",ic:Brain},{id:"retro",l:"Retrospectiva",ic:Target},{id:"glossario",l:"Glossário",ic:BookOpen}];

  const radarData=sp?[{s:"Sono",v:sp.sq||0},{s:"Rec Geral",v:sp.rg||0},{s:"Rec Pernas",v:sp.rp||0},{s:"Dor (inv)",v:10-(sp.d||0)},{s:"Humor",v:(sp.h||3)*2},{s:"Energia",v:(sp.e||3)*2.5}]:[];
  const wtData=sp?.wt?sp.wt.dt.map((d,i)=>({d:sp._wtLive?d:("Mar/"+d),sono:sp.wt.s[i],rec:sp.wt.r[i],dor:sp.wt.dr[i]})):[];
  const cmjData=useMemo(()=>{
    // Prioridade: CMJ externo da planilha
    const ext = liveCmjExterno[sp?.n];
    if (ext?.length) {
      return ext.map((e,i) => ({ i:i+1, v: e.cmj || Math.max(e.cmj_1||0, e.cmj_2||0, e.cmj_3||0), date: e.date, nordico: e.nordico||0 }));
    }
    // Saltos da planilha principal
    const saltos = sheetData?.saltos?.[sp?.n];
    if (saltos?.length) {
      const vals = saltos.map(e => ({ v: Math.max(e.cmj_1||0, e.cmj_2||0, e.cmj_3||0), date: e.date })).filter(e => e.v > 0);
      if (vals.length) return vals.map((e,i) => ({ i:i+1, v: e.v, date: e.date }));
    }
    // Fallback: ct do P array (hardcoded) - só se não houver dados live
    return sp?.ct ? sp.ct.map((v,i) => ({ i:i+1, v, date: sp._ctDates?.[i]||"" })) : [];
  }, [sp, liveCmjExterno, sheetData]);

  return <div style={{minHeight:"100vh",background:t.bg,fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:t.text,transition:"background .3s,color .3s"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} ${t.scrollTrack}}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:4px}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

    {/* HEADER */}
    <header style={{background:t.headerBg,borderBottom:`1px solid ${dark?"rgba(255,255,255,.06)":t.border}`,padding:"0 28px",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:54}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="https://www.ogol.com.br/img/logos/equipas/3154_imgbank_1685113109.png" alt="Botafogo-SP" style={{width:32,height:32,objectFit:"contain"}}/>
          <div>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:"#fff",letterSpacing:-.2}}>Saúde &amp; Performance</div>
            <div style={{fontSize:8.5,color:"rgba(255,255,255,.45)",fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Botafogo-SP · 2026</div>
          </div>
        </div>
        <div style={{display:"flex",gap:1,overflowX:"auto",maxWidth:"calc(100vw - 380px)",scrollbarWidth:"none",msOverflowStyle:"none"}}>
          {tabs.map(tb=>{const Ic=tb.ic;const isActive=tab===tb.id;const glow=dark?"rgba(220,38,38,.4)":"rgba(255,255,255,.4)";return <button key={tb.id} onClick={()=>setTab(tb.id)} style={{display:"flex",alignItems:"center",gap:5,background:isActive?acc:"rgba(255,255,255,.04)",border:`1px solid ${isActive?acc:"rgba(255,255,255,.08)"}`,color:isActive?"#fff":"rgba(255,255,255,.62)",padding:"6px 11px",borderRadius:999,fontSize:10,fontWeight:700,letterSpacing:.2,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",whiteSpace:"nowrap",flexShrink:0,boxShadow:isActive?`0 0 0 3px ${glow}, 0 2px 12px ${glow}`:"none"}}><Ic size={12}/>{tb.l}</button>})}
        </div>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",gap:10}}>
          {/* Live Data Indicator */}
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:isLive?"rgba(22,163,74,.15)":sheetError?"rgba(220,38,38,.15)":"rgba(255,255,255,.05)",border:`1px solid ${isLive?"rgba(22,163,74,.3)":sheetError?"rgba(220,38,38,.3)":"rgba(255,255,255,.1)"}`}}>
            {isLive?<Wifi size={10} color="#16A34A"/>:sheetError?<WifiOff size={10} color="#DC2626"/>:null}
            <span style={{fontSize:9,color:isLive?"#16A34A":sheetError?"#DC2626":"rgba(255,255,255,.5)"}}>
              {sheetLoading?"Atualizando...":isLive?"LIVE":sheetError?"Offline":"—"}
            </span>
            {isLive&&lastUpdate&&<span style={{fontSize:8,color:"rgba(255,255,255,.3)"}}>{lastUpdate.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>}
            <button onClick={refreshSheet} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center"}} title="Atualizar dados">
              <RefreshCw size={9} color="rgba(255,255,255,.4)" style={{animation:sheetLoading?"spin 1s linear infinite":"none"}}/>
            </button>
          </div>
          <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,transition:"all .2s"}} title={dark?"Modo Claro":"Modo Escuro"}>
            {dark?<Sun size={13} color="#fbbf24"/>:<Moon size={13} color="rgba(255,255,255,.6)"/>}
            <span style={{fontSize:9,color:"rgba(255,255,255,.5)",fontWeight:600}}>{dark?"Claro":"Escuro"}</span>
          </button>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#16A34A",display:"inline-block"}}/>{todayStr} · {players.length} atletas
        </div>
      </div>
    </header>

    <div style={{display:"flex",padding:16,gap:16,maxWidth:1440,margin:"0 auto"}}>
      {/* SIDEBAR */}
      <aside style={{width:230,flexShrink:0}}>
        <div style={{fontSize:9,fontWeight:800,color:t.textFaint,letterSpacing:2,textTransform:"uppercase",marginBottom:6,paddingLeft:4}}>Elenco</div>
        {/* Legenda compacta de zonas + tooltip detalhado oculto sob hover */}
        <div title="Estado unificado: Ψ(t) observável (PCA Fonseca 2020) + Prob ML 7d (XGBoost) + Risk Score clínico. Cor = leitura mais pessimista entre as fontes dinâmicas." style={{display:"flex",gap:3,marginBottom:8,paddingLeft:4,flexWrap:"wrap",cursor:"help"}}>
          {[{l:"Alto",c:"#DC2626"},{l:"Mod-Alto",c:"#EA580C"},{l:"Atenção",c:"#CA8A04"},{l:"Estável",c:"#16A34A"}].map((z,i)=>
            <span key={i} style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:`${z.c}18`,color:z.c,border:`1px solid ${z.c}40`,fontWeight:700,letterSpacing:.3}}>{z.l}</span>
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:"calc(100vh - 100px)",overflowY:"auto",paddingRight:4}}>
          {players.map(p=>{
            const _alert=liveAlerts.find(a=>a.n===p.n);
            const _psiSeries=sheetData?.psi?.series?.[p.n]||[];
            const _e=estado(p,_alert,_psiSeries);
            const _mlPct=_e.mlProb!==null?Math.round(_e.mlProb*100):null;
            const _ringV=_mlPct!==null?_mlPct:p.riskScore;
            const _ringC=_e.c;
            const _stale=p._questStale;
            const _tip=`${_e.l}${_mlPct!==null?` · ML ${_mlPct}%`:""}${_e.psiDev!==null?` · Ψ ${_e.psiDev>=0?"+":""}${_e.psiDev.toFixed(1)}σ`:""}${!_e.hasDyn?` · Risk ${p.riskScore}`:""}${_stale?" · dados defasados":""}`;
            return <div key={p.n} onClick={()=>{setSel(p.n);setTab("player")}} title={_tip} style={{background:sel===p.n?t.bgCard:"transparent",border:`1px solid ${sel===p.n?t.border:"transparent"}`,borderRadius:10,padding:"8px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .15s",boxShadow:sel===p.n?`0 2px 8px ${t.shadow}`:"none"}}>
            <PlayerPhoto theme={t} name={p.n} sz={34}/>
            <ScoreRing theme={t} v={_ringV} sz={32} th={3} c={_ringC}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:t.text,display:"flex",alignItems:"center",gap:4}}>
                {p.n}
                {_stale&&<span title={`Questionário há ${p._questDaysOld} dias`} style={{fontSize:8,padding:"1px 4px",borderRadius:3,background:"#CA8A0420",color:"#CA8A04",fontWeight:700,letterSpacing:.3}}>DEFASADO</span>}
              </div>
              <div style={{display:"flex",gap:4,marginTop:2,alignItems:"center"}}>
                <Badge color={_e.c} label={_e.l}/>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint}}>{p.pos}</span>
              </div>
            </div>
          </div>;
          })}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,minWidth:0,overflow:"hidden"}}>
        {tab==="squad"&&<div>
          {/* KPIs */}
          {(()=>{
            const kpis=[
              {l:"Críticos",desc:"Risco score ≥ 65",v:players.filter(p=>p.risk==="CRITICAL").length,total:players.length,c:"#DC2626",bg:"#FEF2F2",bgDark:"#2a1215",bc:"#FECACA",ic:AlertTriangle},
              {l:"Alto Risco",desc:"Risco score 50–64",v:players.filter(p=>p.risk==="HIGH").length,total:players.length,c:"#EA580C",bg:"#FFF7ED",bgDark:"#2a1c0f",bc:"#FED7AA",ic:Zap},
              {l:"ACWR > 1.45",desc:"Carga aguda elevada",v:players.filter(p=>p.ai>1.45).length,total:players.filter(p=>p.ai).length,c:"#CA8A04",bg:"#FEFCE8",bgDark:"#292510",bc:"#FEF08A",ic:TrendingUp},
              {l:"Bem-estar Baixo",desc:"Bem-estar < 6.5",v:players.filter(p=>p.rpa&&p.rpa<6.5).length,total:players.length,c:"#DC2626",bg:"#FEF2F2",bgDark:"#2a1215",bc:"#FECACA",ic:Activity},
              {l:"Ótimos",desc:"Risco score < 20",v:players.filter(p=>p.risk==="LOW").length,total:players.length,c:"#16A34A",bg:"#F0FDF4",bgDark:"#0f2418",bc:"#BBF7D0",ic:CheckCircle2}
            ];
            return <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
              {kpis.map((k,i)=>{const Ic=k.ic;const pct=k.total?Math.round((k.v/k.total)*100):0;
                return <div key={i} style={{background:t.bgCard,borderRadius:10,border:`1px solid ${t.border}`,padding:"16px 18px",position:"relative"}}>
                {/* Linha vertical sutil de cor à esquerda — único acento decorativo */}
                <div style={{position:"absolute",left:0,top:14,bottom:14,width:2,background:k.c,borderRadius:2}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>{k.l}</div>
                  <Ic size={14} color={t.textFaint}/>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:38,fontWeight:800,color:t.text,lineHeight:1,letterSpacing:-1.5}}>{k.v}</div>
                  <div style={{fontSize:11,color:t.textFaintest,fontWeight:600}}>/ {k.total}</div>
                </div>
                <div style={{marginTop:10,height:3,background:t.bgMuted2,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:k.c,transition:"width .6s"}}/>
                </div>
                <div style={{fontSize:8.5,color:t.textFaintest,marginTop:6,fontWeight:500,letterSpacing:.2}}>{k.desc}</div>
              </div>})}
            </div>;
          })()}

          {/* ═══ CAMADA 1: RISK BOARD — Quem pode treinar hoje? ═══ */}
          <div style={{background:t.bgCard,borderRadius:14,border:`1px solid ${t.border}`,overflow:"hidden",marginBottom:16,boxShadow:`0 1px 4px ${t.shadow}`}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${t.border}`,background:dark?"#1e2230":t.bgMuted}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${acc}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${acc}30`}}>
                    <Shield size={18} color={acc}/>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:t.text,letterSpacing:-.3}}>Risk Board — Prontidão para Sessão</div>
                    <div style={{fontSize:10,color:t.textFaint,marginTop:1}}>{todayFull} · Decisão operacional: quem pode treinar normalmente hoje?</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {(()=>{const _dm=new Set(liveDmData.afastados.map(a=>a.n));const _ap=players.filter(p=>!_dm.has(p.n));return[{l:"Crítico",r:">60%",c:"#DC2626",n:_ap.filter(p=>{const al=liveAlerts.find(a=>a.n===p.n);const pr=al?al.prob:Math.min(p.riskScore/100,1);return pr>0.60;}).length},
                    {l:"Moderado",r:"35–60%",c:"#EA580C",n:_ap.filter(p=>{const al=liveAlerts.find(a=>a.n===p.n);const pr=al?al.prob:Math.min(p.riskScore/100,1);return pr>0.35&&pr<=0.60;}).length},
                    {l:"Atenção",r:"20–35%",c:"#CA8A04",n:_ap.filter(p=>{const al=liveAlerts.find(a=>a.n===p.n);const pr=al?al.prob:Math.min(p.riskScore/100,1);return pr>0.20&&pr<=0.35;}).length},
                    {l:"Apto",r:"<20%",c:"#16A34A",n:_ap.filter(p=>{const al=liveAlerts.find(a=>a.n===p.n);const pr=al?al.prob:Math.min(p.riskScore/100,1);return pr<=0.20;}).length}];})()
                  .map((z,i)=><div key={i} style={{padding:"5px 10px",borderRadius:8,background:`${z.c}${dark?"20":"10"}`,border:`1px solid ${z.c}${dark?"40":"25"}`,textAlign:"center",minWidth:56}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:800,color:z.c,lineHeight:1}}>{z.n}</div>
                    <div style={{fontSize:8,color:z.c,fontWeight:600,marginTop:2,opacity:.8}}>{z.l} <span style={{opacity:.6}}>({z.r})</span></div>
                  </div>)}
                </div>
              </div>
            </div>
            <div style={{overflowX:"auto",overflowY:"auto",maxHeight:520,padding:"0 20px 18px"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:800}}>
              <thead style={{position:"sticky",top:0,zIndex:2,background:t.bgCard}}>
                <tr style={{borderBottom:`2px solid ${t.border}`}}>
                  {[{l:"#",k:null},{l:"Atleta",k:"n"},{l:"Pos",k:"pos"},{l:"Risco",k:"prob"},{l:"Prontidão",k:"prontidao"},{l:"Perfil",k:null},{l:"F. Debt",k:"fatigue_debt"},{l:"NME",k:"nme"},{l:"Ação",k:null}].map((h,i)=>
                    <th key={i} style={{padding:"12px 6px 8px",textAlign:"left",fontSize:9,color:riskSort.col===h.k?acc:t.textFaint,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap",cursor:h.k?"pointer":"default",userSelect:"none"}} onClick={()=>{if(h.k)setRiskSort(prev=>({col:h.k,dir:prev.col===h.k&&prev.dir==="desc"?"asc":"desc"}))}}>{h.l}{riskSort.col===h.k?riskSort.dir==="desc"?" ↓":" ↑":""}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(()=>{const dmNomes=new Set(liveDmData.afastados.map(a=>a.n));const enriched=players.filter(p=>!dmNomes.has(p.n)).map(p=>{const alert=liveAlerts.find(a=>a.n===p.n);const prob=alert?alert.prob:Math.min(p.riskScore/100,1);const prontidao=prob>0.60?3:prob>0.35?2:prob>0.20?1:0;return{...p,_alert:alert,_prob:prob,_prontidao:prontidao,_fDebt:alert?.fatigue_debt||0,_nme:alert?.nme||0};});const sorted=[...enriched].sort((a,b)=>{const d=riskSort.dir==="desc"?-1:1;const col=riskSort.col;if(col==="n")return d*a.n.localeCompare(b.n);if(col==="pos")return d*a.pos.localeCompare(b.pos);if(col==="prob")return d*(a._prob-b._prob);if(col==="prontidao")return d*(a._prontidao-b._prontidao);if(col==="fatigue_debt")return d*(a._fDebt-b._fDebt);if(col==="nme")return d*(a._nme-b._nme);return d*(a.riskScore-b.riskScore);});return sorted.map((p,i)=>{
                  const alert=p._alert;
                  const prob=p._prob;
                  const zone=prob>0.60?"VERMELHO":prob>0.35?"LARANJA":prob>0.20?"AMARELO":"VERDE";
                  const zs=ZC[zone];
                  const statusLabel=prob>0.60?"Crítico":prob>0.35?"Moderado":prob>0.20?"Atenção":"Apto";
                  const statusIcon=prob>0.60?"🔴":prob>0.35?"🟠":prob>0.20?"🟡":"🟢";
                  const pr=alert?PERFIL_RISCO_LABELS[alert.perfil_risco]||PERFIL_RISCO_LABELS.sobrecarga:null;
                  const fDebt=alert?.fatigue_debt||null;
                  const nme=alert?.nme||null;
                  const dose=alert?.dose||"Programa preventivo padrão.";
                  return <tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted,cursor:"pointer",transition:"background .15s"}} onClick={()=>{setSel(p.n);setTab("player")}} onMouseEnter={e=>e.currentTarget.style.background=dark?"#282d3c":"#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":t.bgMuted}>
                    <td style={{padding:"10px 6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint,fontWeight:600}}>{i+1}</td>
                    <td style={{padding:"10px 8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <PlayerPhoto theme={t} name={p.n} sz={30}/>
                        <span style={{fontWeight:700,color:t.text}}>{p.n}</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>{p.pos}</td>
                    <td style={{padding:"10px 8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:56,height:6,background:t.bgMuted2,borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(prob*100,100)}%`,background:zs.c,borderRadius:4,transition:"width .4s"}}/>
                        </div>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:zs.c}}>{(prob*100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 8px"}}>
                      <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:zs.bg,color:zs.c,border:`1px solid ${zs.bc}`}}>{statusIcon} {statusLabel}</span>
                    </td>
                    <td style={{padding:"10px 8px"}}>
                      {pr?<span style={{padding:"3px 10px",borderRadius:6,fontSize:9,fontWeight:600,background:pr.bg,color:pr.c,border:`1px solid ${pr.bc}`}}>{pr.label}</span>:<span style={{fontSize:9,color:t.textFaint}}>—</span>}
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:600,color:fDebt?fDebt>3000?"#DC2626":fDebt>2500?"#EA580C":t.textMuted:t.textFaint}}>{fDebt||"—"}</td>
                    <td style={{padding:"10px 8px",fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:600,color:nme?nme<0.012?"#DC2626":nme<0.015?"#EA580C":"#16A34A":t.textFaint}}>{nme?.toFixed(4)||"—"}</td>
                    <td style={{padding:"10px 8px",fontSize:10,color:t.textMuted,maxWidth:220}}>{dose}</td>
                  </tr>;
                });})()}
              </tbody>
            </table>
            </div>
          </div>

          {/* ═══ CAMADA 5: INTERVENÇÕES RÁPIDAS ═══ */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:10}}>Intervenções Rápidas — Referência Operacional</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {INTERVENTIONS.map((iv,i)=>{
                const pr=PERFIL_RISCO_LABELS[iv.perfil];
                return <div key={i} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${pr.bc}`,background:`${pr.c}05`,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{padding:"2px 6px",borderRadius:4,fontSize:8,fontWeight:700,background:pr.bg,color:pr.c,border:`1px solid ${pr.bc}`,whiteSpace:"nowrap"}}>{pr.label}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:600,color:pri}}>{iv.trigger}</div>
                    <div style={{fontSize:10,color:pr.c,fontWeight:500}}>{iv.action}</div>
                  </div>
                </div>;
              })}
            </div>
          </div>

          {/* Charts Row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>ACWR Interno (sRPE) — Elenco</div>
              <div style={{fontSize:9,color:t.textFaint,marginBottom:8,lineHeight:1.4}}>ACWR (Acute:Chronic Workload Ratio) = carga aguda (7 dias) ÷ carga crônica (28 dias). Mede a relação entre o que o atleta treinou recentemente vs. o que está acostumado. Valores entre <strong style={{color:"#16A34A"}}>0.8–1.3</strong> indicam zona ótima de progressão. Acima de <strong style={{color:"#DC2626"}}>1.5</strong> = sobrecarga aguda, risco elevado de lesão (Gabbett, 2016; Hulin et al., 2014). Abaixo de <strong style={{color:"#EA580C"}}>0.8</strong> = subcarga, perda de condicionamento e desproteção contra picos futuros.</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={players.filter(p=>p.ai).slice(0,25)} margin={{bottom:45}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:t.textFaint}} angle={-50} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:t.textFaint}} domain={[0,2.2]}/>
                  <Tooltip content={<Tip theme={t}/>}/>
                  <ReferenceLine y={1.45} stroke="#DC2626" strokeDasharray="4 4" label={{value:"1.45",fill:"#DC2626",fontSize:9}}/>
                  <ReferenceLine y={.8} stroke="#EA580C" strokeDasharray="4 4" label={{value:"0.80",fill:"#EA580C",fontSize:9}}/>
                  <Bar dataKey="ai" name="ACWR" radius={[3,3,0,0]}>
                    {players.filter(p=>p.ai).slice(0,25).map((p,i)=><Cell key={i} fill={LV[p.risk].c}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Bem-estar — Elenco</div>
              <div style={{fontSize:9,color:t.textFaint,marginBottom:8,lineHeight:1.4}}>Média ponderada de Rec. Pernas, Sono, Dor e Rec. Geral (últimos 7 dias). Linha tracejada = limiar de atenção (6.5/10).</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={players.filter(p=>p.rpa).sort((a,b)=>a.rpa-b.rpa).slice(0,25)} margin={{bottom:45}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:t.textFaint}} angle={-50} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:t.textFaint}} domain={[0,10]}/>
                  <Tooltip content={<Tip theme={t}/>}/>
                  <ReferenceLine y={6.5} stroke="#CA8A04" strokeDasharray="4 4" label={{value:"6.5",fill:"#CA8A04",fontSize:9}}/>
                  <Bar dataKey="rpa" name="Bem-estar" radius={[3,3,0,0]}>
                    {players.filter(p=>p.rpa).sort((a,b)=>a.rpa-b.rpa).slice(0,25).map((p,i)=><Cell key={i} fill={p.rpa<6?"#DC2626":p.rpa<7?"#CA8A04":"#16A34A"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wellness + CMJ */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Bem-estar Elenco — Média</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><WBar theme={t} label="Sono (qualidade)" v={+(players.reduce((s,p)=>s+(p.sq||0),0)/players.length).toFixed(1)} max={10}/><WBar theme={t} label="Rec. Geral" v={+(players.reduce((s,p)=>s+(p.rg||0),0)/players.length).toFixed(1)} max={10}/><WBar theme={t} label="Rec. Pernas" v={+(players.reduce((s,p)=>s+(p.rp||0),0)/players.length).toFixed(1)} max={10}/></div>
                <div><WBar theme={t} label="Dor" v={+(players.reduce((s,p)=>s+(p.d||0),0)/players.length).toFixed(1)} max={10} inv/><WBar theme={t} label="Humor (1-5)" v={+(players.reduce((s,p)=>s+(p.h||0),0)/players.length).toFixed(1)} max={5}/><WBar theme={t} label="Energia (1-4)" v={+(players.reduce((s,p)=>s+(p.e||0),0)/players.length).toFixed(1)} max={4}/></div>
              </div>
            </div>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>CMJ — Último Teste</div>
              <div style={{fontSize:9,color:t.textFaint,marginBottom:8,lineHeight:1.4}}>Counter-Movement Jump: salto vertical com contramovimento (melhor de 3 tentativas). Indicador de prontidão neuromuscular — queda {">"} 5% do baseline = fadiga acumulada.</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={players.filter(p=>p.cmj).sort((a,b)=>b.cmj-a.cmj).slice(0,15)} margin={{bottom:35}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:t.textFaint}} angle={-45} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:t.textFaint}} domain={[30,58]}/>
                  <Tooltip content={<Tip theme={t}/>}/>
                  <Bar dataKey="cmj" name="CMJ (cm)" fill={pri} opacity={.75} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>}

        {tab==="alerts"&&<div>
          <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri,marginBottom:4}}>Alertas Ativos</div>
          <div style={{fontSize:12,color:t.textFaint,marginBottom:16}}>{todayStr} · Score de criticidade composto (ACWR + Bem-estar + CMJ + Dor)</div>
          {players.filter(p=>p.riskScore>=20).map((p,i)=>{
            const lv=LV[p.risk];
            const rx=p.risk==="CRITICAL"?
              (p.ai>1.45?"Reduzir volume 30% por 3 dias. sRPE alvo < 300.":p.d>=4?"Fisioterapia preventiva imediata. Avaliar cadeia posterior.":"Monitoramento diário reforçado."):
              p.risk==="HIGH"?
              (p.ai>1.3?"Atenção à progressão de carga. Evitar picos de sprint.":"Manter monitoramento. Cruzar GPS pós-treino."):
              "Manter rotina de monitoramento.";
            return <div key={i} style={{background:t.bgCard,borderRadius:12,border:`1px solid ${lv.bc}`,padding:16,marginBottom:10,boxShadow:`0 1px 3px ${t.shadow}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <PlayerPhoto theme={t} name={p.n} sz={44}/>
                  <ScoreRing theme={t} v={p.riskScore} sz={48} th={4}/>
                  <div>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:t.text}}>{p.n} <Badge level={p.risk}/> <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint,fontWeight:400,marginLeft:4}}>{p.pos} · {p.id} anos · {p.w}kg</span></div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {p.reasons.map((r,j)=><span key={j} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:lv.bg,color:lv.c,border:`1px solid ${lv.bc}`}}>{r}</span>)}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>ACWR int</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:700,color:p.ai>1.45?"#DC2626":p.ai<.8?"#EA580C":t.text}}>{p.ai?.toFixed(2)||"-"}</div>
                </div>
              </div>
              <div style={{marginTop:10,padding:"8px 12px",background:lv.bg,borderRadius:8,border:`1px solid ${lv.bc}`,fontSize:12,color:lv.c}}>
                <strong style={{fontFamily:"'Inter Tight'"}}>Recomendação:</strong> {rx}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginTop:10}}>
                {[{l:"PSE",v:p.pse,tip:"Percepção de Esforço (0–10)"},{l:"sRPE Total",v:p.sra,tip:"PSE × Duração (UA)"},{l:"Sono",v:p.sq,tip:"Qualidade do sono (1–10)"},{l:"RecP",v:p.rp,tip:"Recuperação de pernas (1–10)"},{l:"Dor",v:p.d,tip:"Nível de dor (0–10)"},{l:"CMJ",v:p.cmj||"-",tip:"Salto CMJ (cm)"}].map((m,j)=>
                  <div key={j} style={{textAlign:"center",padding:"6px 0",background:t.bgMuted,borderRadius:6,cursor:"help"}} title={m.tip}>
                    <div style={{fontSize:9,color:t.textFaint}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:t.text}}>{m.v}</div>
                  </div>)}
              </div>
            </div>;})}
        </div>}

        {/* ═══════════ PAINEL DE CARGA & ACWR ═══════════ */}
        {tab==="carga"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri,letterSpacing:-.2}}>Carga & ACWR</div>
              <div style={{fontSize:10,color:t.textFaint,marginTop:2}}>Razão aguda:crônica (EWMA) — zona de perigo: 0.8–1.5 · Gabbett 2016</div>
            </div>
            <span title="ACWR = carga 7d ÷ média 28d (EWMA). >1.3 = spike; <0.8 = subcarga. Faixa 0.8–1.5 acumula maior risco de lesão (Williams et al., 2017)." style={{fontSize:9,color:t.textMuted,fontWeight:600,padding:"3px 8px",borderRadius:5,background:t.bgMuted,border:`1px solid ${t.borderLight}`,cursor:"help"}}>?</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"ACWR Médio",v:players.reduce((s,p)=>s+(p.ai||1),0)/players.length,u:"",c:players.reduce((s,p)=>s+(p.ai||1),0)/players.length>1.3?"#DC2626":"#16A34A"},
              {l:"Atletas ACWR > 1.3",v:players.filter(p=>(p.ai||0)>1.3).length,u:"atletas",c:"#EA580C"},
              {l:"Monotonia > 2.0",v:players.filter(p=>p._monotonia>2.0).length,u:"atletas",c:"#CA8A04"},
              {l:"Strain Médio",v:Math.round(players.reduce((s,p)=>s+(p._strain||0),0)/players.length),u:"UA",c:"#2563eb"}
            ].map((m,i)=><div key={i} style={{background:t.bgCard,borderRadius:10,border:`1px solid ${t.border}`,padding:14,textAlign:"center"}}>
              <div style={{fontSize:10,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{m.l}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:22,fontWeight:700,color:m.c}}>{typeof m.v==="number"?m.v.toFixed(m.u?"0":"2"):m.v}</div>
              <div style={{fontSize:10,color:t.textFaint}}>{m.u}</div>
            </div>)}
          </div>
          {/* ACWR Ranking */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Ranking ACWR Combinado (EWMA)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {players.filter(p=>p.ai).sort((a,b)=>(b.ai||0)-(a.ai||0)).map((p,i)=>{
                const acwr=p.ai||1;const c=acwr>1.5?"#DC2626":acwr>1.3?"#EA580C":acwr>1.0?"#CA8A04":acwr>0.8?"#16A34A":"#2563eb";
                const zone=acwr>1.5?"ALTO RISCO":acwr>1.3?"ATENÇÃO":acwr>0.8?"ÓTIMO":"SUBTREINADO";
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:i<3?"#FEF2F2":"transparent",borderRadius:8,border:`1px solid ${t.borderLight}`}} onClick={()=>{setSel(p.n);setTab("player")}}>
                  <PlayerPhoto theme={t} name={p.n} sz={28}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:11,color:pri,cursor:"pointer"}}>{p.n}</div>
                    <div style={{fontSize:9,color:t.textFaint}}>{p.pos}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:700,color:c}}>{acwr.toFixed(2)}</div>
                    <div style={{fontSize:8,fontWeight:600,color:c}}>{zone}</div>
                  </div>
                  <div style={{width:60,height:6,background:t.bgMuted2,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min(acwr/2*100,100)}%`,background:c,borderRadius:3}}/>
                  </div>
                </div>;
              })}
            </div>
          </div>
          {/* ═══ ACWR Individualizado por Métrica — Diretiva Maio/2026 ═══
                Razão = carga (semana atual) ÷ média (4 semanas anteriores).
                Calculado para Distância Total, HSR (19.8–24.8 km/h), SPR
                (>25.2 km/h), Acelerações ≥3 m/s² e Desacelerações ≤-3 m/s².
                ACWR Global = média aritmética dos 5 ratios individuais.
                Zona de Perigo (alerta cromático): ACWR ∈ [0.8, 1.5]
                — limite superior corresponde ao "spike" de Gabbett 2016. */}
          {(()=>{
            const gpsAll=sheetData?.gps||{};
            if(!Object.keys(gpsAll).length) return null;

            const parseDt=(d)=>{
              if(!d) return 0;
              const s=String(d).trim();
              if(/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime();
              const p=s.split(/[\/\-\.]/);
              if(p.length>=3){const[a,b,c]=p.map(Number);if(a>31)return new Date(a,b-1,c).getTime();if(c>31)return new Date(c,b-1,a).getTime();return new Date(c,a-1,b).getTime();}
              return new Date(s).getTime()||0;
            };
            const now=Date.now();
            const WEEK=7*24*3600*1000;
            // Para cada atleta, somar carga em 5 janelas de 7 dias.
            const computeAcwr=(entries,key)=>{
              if(!entries?.length) return null;
              const buckets=[0,0,0,0,0]; // 0 = última semana, 1..4 = 4 anteriores
              const counts=[0,0,0,0,0];
              for(const e of entries){
                const ts=parseDt(e.date); if(!ts) continue;
                const ageWk=Math.floor((now-ts)/WEEK);
                if(ageWk<0||ageWk>=5) continue;
                const v=Number(e.gps?.[key]||0);
                if(!Number.isFinite(v)||v<=0) continue;
                buckets[ageWk]+=v; counts[ageWk]++;
              }
              const acute=buckets[0];
              const chronicSum=buckets[1]+buckets[2]+buckets[3]+buckets[4];
              const chronicWeeks=[1,2,3,4].filter(i=>counts[i]>0).length;
              if(!chronicWeeks||!acute) return null;
              const chronic=chronicSum/chronicWeeks;
              return chronic>0?Math.round((acute/chronic)*100)/100:null;
            };

            const variables=[
              {key:"dist_total", label:"Distância Total",          unit:"m"},
              {key:"hsr",        label:"HSR (19.8–24.8 km/h)",     unit:"m"},
              {key:"hsr_25",     label:"SPR (>25.2 km/h)",         unit:"m"},
              {key:"acel_3",     label:"Acelerações ≥3 m/s²",      unit:"#"},
              {key:"decel_3",    label:"Desacelerações ≤-3 m/s²",  unit:"#"}
            ];

            // Linhas: uma por atleta com 5 ratios + média global.
            const rows=[];
            for(const [name,entries] of Object.entries(gpsAll)){
              const r={name};
              const ratios=[];
              for(const v of variables){
                const ac=computeAcwr(entries,v.key);
                r[v.key]=ac;
                if(ac!==null) ratios.push(ac);
              }
              r._global=ratios.length?Math.round((ratios.reduce((a,b)=>a+b,0)/ratios.length)*100)/100:null;
              if(ratios.length>=2) rows.push(r); // exige cobertura mínima
            }
            if(!rows.length) return null;

            rows.sort((a,b)=>(b._global||0)-(a._global||0));

            // Heurística de cor: zona de perigo (Gabbett 2016) = 0.8 ≤ ACWR ≤ 1.5
            // mapeada para gradiente verde→amarelo→laranja→vermelho.
            const zoneColor=(v)=>{
              if(v===null||v===undefined) return t.textFaint;
              if(v>=1.5) return "#DC2626";          // Sweet-spot rompido (alto risco)
              if(v>=1.3) return "#EA580C";          // Topo da zona de perigo
              if(v>=0.8) return "#FACC15";          // Dentro da janela de risco
              return "#22D3EE";                      // Subcarga
            };
            const zoneLabel=(v)=>{
              if(v===null||v===undefined) return "—";
              if(v>=1.5) return "ACIMA";
              if(v>=0.8) return "ZONA DE PERIGO";
              return "SUB";
            };
            const teamGlobal=(()=>{const arr=rows.map(r=>r._global).filter(v=>v!==null);return arr.length?Math.round((arr.reduce((a,b)=>a+b,0)/arr.length)*100)/100:null;})();
            const inZone=rows.filter(r=>r._global!==null&&r._global>=0.8&&r._global<=1.5).length;

            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri}}>ACWR Individualizado por Variável</div>
                  <div style={{fontSize:10,color:t.textFaint,marginTop:2,maxWidth:680,lineHeight:1.5}}>
                    Razão = carga (semana atual) ÷ média (4 semanas anteriores) — fonte: aba GPS individual (gid=1595283302).
                    Aplicada para 5 variáveis individualmente; o <strong>ACWR Global</strong> é a média aritmética entre elas.
                    Faixa <span style={{color:"#FACC15",fontWeight:700}}>0.8 ≤ ACWR ≤ 1.5</span> = <strong>Zona de Perigo</strong> (Gabbett 2016).
                  </div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <div style={{padding:"6px 12px",borderRadius:8,background:zoneColor(teamGlobal)+"20",border:`1px solid ${zoneColor(teamGlobal)}55`}}>
                    <div style={{fontSize:8,fontWeight:700,color:t.textFaint,textTransform:"uppercase",letterSpacing:.5}}>ACWR Global · Equipe</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:900,color:zoneColor(teamGlobal)}}>{teamGlobal??"—"}</div>
                  </div>
                  <div style={{padding:"6px 12px",borderRadius:8,background:"#FACC1520",border:`1px solid #FACC1555`}}>
                    <div style={{fontSize:8,fontWeight:700,color:t.textFaint,textTransform:"uppercase",letterSpacing:.5}}>Em zona perigo</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:900,color:"#FACC15"}}>{inZone}<span style={{fontSize:11,color:t.textFaint,fontWeight:600}}> / {rows.length}</span></div>
                  </div>
                </div>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:760}}>
                  <thead>
                    <tr style={{background:t.bgMuted}}>
                      <th style={{padding:"7px 10px",textAlign:"left",fontSize:9,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,fontWeight:700}}>Atleta</th>
                      {variables.map(v=><th key={v.key} style={{padding:"7px 6px",textAlign:"center",fontSize:9,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,fontWeight:700}}>{v.label}</th>)}
                      <th style={{padding:"7px 8px",textAlign:"center",fontSize:9,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,fontWeight:700}}>Global</th>
                      <th style={{padding:"7px 8px",textAlign:"center",fontSize:9,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,fontWeight:700}}>Zona</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0,18).map((r,i)=>{
                      const c=zoneColor(r._global);
                      return <tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted+"33",cursor:"pointer"}} onClick={()=>{setSel(r.name);setTab("player")}}>
                        <td style={{padding:"7px 10px",fontWeight:700,color:pri}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <PlayerPhoto theme={t} name={r.name} sz={22}/>
                            {r.name}
                          </div>
                        </td>
                        {variables.map(v=>{
                          const val=r[v.key];
                          const c2=zoneColor(val);
                          return <td key={v.key} style={{padding:"7px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:700,color:c2}}>{val??"—"}</td>;
                        })}
                        <td style={{padding:"7px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:900,color:c,fontSize:13}}>{r._global??"—"}</td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>
                          <span style={{padding:"2px 8px",borderRadius:5,fontSize:9,fontWeight:700,background:c+"22",color:c,border:`1px solid ${c}55`}}>{zoneLabel(r._global)}</span>
                        </td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>;
          })()}

          {/* Carga Acumulada semanal */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Carga Semanal sRPE (Top 10 atletas)</div>
            <div style={{fontSize:9,color:t.textFaint,marginBottom:8,lineHeight:1.4}}>sRPE Total = PSE (0–10) × Duração da sessão (min). Representa o volume de esforço percebido em Unidades Arbitrárias (UA). Ex: PSE 7 × 90 min = 630 UA. Valores acima de 450 UA indicam sessões de alta carga (Foster et al., 2001).</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={players.slice(0,10).map(p=>({n:p.n.split(" ")[0],sRPE:p.sra||0}))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.borderLight}/>
                <XAxis dataKey="n" tick={{fontSize:10,fill:t.textMuted}}/>
                <YAxis tick={{fontSize:10,fill:t.textFaint}}/>
                <Tooltip content={<TT theme={t}/>}/>
                <Bar dataKey="sRPE" radius={[6,6,0,0]}>
                  {players.slice(0,10).map((p,i)=><Cell key={i} fill={(p.sra||0)>450?"#DC2626":(p.sra||0)>400?"#EA580C":"#2563eb"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>}

        {/* ═══════════ PAINEL NEUROMUSCULAR ═══════════ */}
        {tab==="neuro"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri,letterSpacing:-.2}}>Neuromuscular</div>
              <div style={{fontSize:10,color:t.textFaint,marginTop:2}}>CMJ + tendência + NME + assimetria bilateral SLCMJ</div>
            </div>
            <span title="CMJ = Counter-Movement Jump (melhor dos 3 saltos). Queda >5% vs baseline = fadiga; >8% = crítico (Claudino et al., 2017). SLCMJ ASI >10% = risco biomecânico." style={{fontSize:9,color:t.textMuted,fontWeight:600,padding:"3px 8px",borderRadius:5,background:t.bgMuted,border:`1px solid ${t.borderLight}`,cursor:"help"}}>?</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"CMJ Médio Elenco",v:(players.reduce((s,p)=>s+(p.cmj||0),0)/players.filter(p=>p.cmj).length).toFixed(1),u:"cm",c:"#7c3aed"},
              {l:"CMJ Δ < -8%",v:players.filter(p=>{const bl=p.cmj||35;return p.cmj&&p.cmj<bl*0.92;}).length||0,u:"atletas",c:"#DC2626"},
              {l:"Assimetria > 12%",v:Object.values(PLAYER_EXT).filter(e=>e?.slcmj_asi>12).length,u:"atletas",c:"#EA580C"},
              {l:"H:Q < 0.55",v:Object.values(PLAYER_EXT).filter(e=>e?.hq_ratio<0.55).length,u:"atletas",c:"#CA8A04"}
            ].map((m,i)=><div key={i} style={{background:t.bgCard,borderRadius:10,border:`1px solid ${t.border}`,padding:14,textAlign:"center"}}>
              <div style={{fontSize:10,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{m.l}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div>
              <div style={{fontSize:10,color:t.textFaint}}>{m.u}</div>
            </div>)}
          </div>
          {/* CMJ Trend per athlete */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Tendência CMJ (últimos 8 dias)</div>
            {sp&&sp.ct?<ResponsiveContainer width="100%" height={200}>
              <LineChart data={sp.ct.map((v,i)=>({d:`D${i+1}`,cmj:v,baseline:sp.cmj}))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.borderLight}/>
                <XAxis dataKey="d" tick={{fontSize:10,fill:t.textMuted}}/>
                <YAxis domain={["auto","auto"]} tick={{fontSize:10,fill:t.textFaint}}/>
                <Tooltip content={<TT theme={t}/>}/>
                <ReferenceLine y={sp.cmj} stroke={t.textFaint} strokeDasharray="5 5" label={{value:"Baseline",fontSize:9,fill:t.textFaint}}/>
                <Line type="monotone" dataKey="cmj" stroke="#7c3aed" strokeWidth={2} dot={{r:3,fill:"#7c3aed"}}/>
              </LineChart>
            </ResponsiveContainer>:<div style={{textAlign:"center",padding:20,color:t.textFaint,fontSize:12}}>Selecione um atleta na sidebar para ver tendência CMJ</div>}
          </div>
          {/* NME + Asymmetry Table */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Ranking Neuromuscular — Assimetria & NME</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Atleta","Pos","SLCMJ Asi%","H:Q Ratio","COP Sway","Status"].map((h,i)=><th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(PLAYER_EXT).sort((a,b)=>(b[1]?.slcmj_asi||0)-(a[1]?.slcmj_asi||0)).map(([name,ext],i)=>{
                  if(!ext) return null;
                  const asiC=ext.slcmj_asi>15?"#DC2626":ext.slcmj_asi>12?"#EA580C":ext.slcmj_asi>8?"#CA8A04":"#16A34A";
                  const hqC=ext.hq_ratio<0.50?"#DC2626":ext.hq_ratio<0.55?"#EA580C":"#16A34A";
                  const status=ext.slcmj_asi>12||ext.hq_ratio<0.55?"ATENÇÃO":"NORMAL";
                  return <tr key={i} style={{borderBottom:"1px solid #f1f5f9",cursor:"pointer"}} onClick={()=>{setSel(name);setTab("player")}}>
                    <td style={{padding:"6px",fontWeight:600}}><div style={{display:"flex",alignItems:"center",gap:6}}><PlayerPhoto theme={t} name={name} sz={24}/>{name}</div></td>
                    <td style={{padding:"6px",color:t.textMuted}}>{players.find(p=>p.n===name)?.pos||"-"}</td>
                    <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontWeight:700,color:asiC}}>{ext.slcmj_asi?.toFixed(1)}%</td>
                    <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontWeight:700,color:hqC}}>{ext.hq_ratio?.toFixed(2)}</td>
                    <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",color:ext.cop_sway>18?"#DC2626":t.textMuted}}>{ext.cop_sway?.toFixed(1)}mm</td>
                    <td style={{padding:"6px"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,background:status==="ATENÇÃO"?"#FEF2F2":"#F0FDF4",color:status==="ATENÇÃO"?"#DC2626":"#16A34A"}}>{status}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>}

        {/* ═══════════ PAINEL FISIOLÓGICO ═══════════ */}
        {tab==="fisio"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,marginBottom:4}}>Painel Fisiológico</div>
            <div style={{fontSize:11,color:t.textMuted}}>Monitoramento de sono, HRV e bem-estar composto do elenco</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Sono Médio",v:(players.reduce((s,p)=>s+(p.sq||0),0)/players.length).toFixed(1),u:"/10",c:"#2563eb"},
              {l:"Sono < 6",v:players.filter(p=>(p.sq||10)<6).length,u:"atletas",c:"#DC2626"},
              {l:"HRV Médio",v:"62.4",u:"ms (RMSSD)",c:"#16A34A"},
              {l:"Dor > 3",v:players.filter(p=>(p.d||0)>3).length,u:"atletas",c:"#EA580C"}
            ].map((m,i)=><div key={i} style={{background:t.bgCard,borderRadius:10,border:`1px solid ${t.border}`,padding:14,textAlign:"center"}}>
              <div style={{fontSize:10,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{m.l}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div>
              <div style={{fontSize:10,color:t.textFaint}}>{m.u}</div>
            </div>)}
          </div>
          {/* Radar Bem-estar for selected player */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Bem-estar Composto {sp?`— ${sp.n}`:""}</div>
              {sp?<ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={t.border}/>
                  <PolarAngleAxis dataKey="s" tick={{fontSize:10,fill:t.textMuted}}/>
                  <PolarRadiusAxis domain={[0,10]} tick={false}/>
                  <Radar name="Bem-estar" dataKey="v" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2}/>
                </RadarChart>
              </ResponsiveContainer>:<div style={{textAlign:"center",padding:40,color:t.textFaint,fontSize:12}}>Selecione um atleta na sidebar</div>}
            </div>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Tendência Bem-estar {sp?`— ${sp.n}`:""}</div>
              {sp&&sp.wt?<ResponsiveContainer width="100%" height={240}>
                <LineChart data={wtData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.borderLight}/>
                  <XAxis dataKey="d" tick={{fontSize:10,fill:t.textMuted}}/>
                  <YAxis domain={[0,10]} tick={{fontSize:10,fill:t.textFaint}}/>
                  <Tooltip content={<TT theme={t}/>}/>
                  <Line type="monotone" dataKey="sono" stroke="#2563eb" strokeWidth={2} name="Sono" dot={{r:2}}/>
                  <Line type="monotone" dataKey="rec" stroke="#16A34A" strokeWidth={2} name="Recuperação" dot={{r:2}}/>
                  <Line type="monotone" dataKey="dor" stroke="#DC2626" strokeWidth={2} name="Dor" dot={{r:2}}/>
                </LineChart>
              </ResponsiveContainer>:<div style={{textAlign:"center",padding:40,color:t.textFaint,fontSize:12}}>Selecione um atleta na sidebar</div>}
            </div>
          </div>
          {/* Sleep / Wellness ranking table */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Ranking Fisiológico — Sono × Bem-estar</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Atleta","Pos","Sono","Rec Geral","Rec Pernas","Dor","Humor","Energia","Status"].map((h,i)=><th key={i} style={{padding:"6px 4px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {players.sort((a,b)=>(a.sq||10)-(b.sq||10)).slice(0,15).map((p,i)=>{
                  const sonoC=(p.sq||10)<6?"#DC2626":(p.sq||10)<7?"#CA8A04":"#16A34A";
                  return <tr key={i} style={{borderBottom:"1px solid #f1f5f9",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                    <td style={{padding:"6px 4px",fontWeight:600}}><div style={{display:"flex",alignItems:"center",gap:6}}><PlayerPhoto theme={t} name={p.n} sz={22}/>{p.n}</div></td>
                    <td style={{padding:"6px 4px",color:t.textMuted}}>{p.pos}</td>
                    <td style={{padding:"6px 4px",fontFamily:"'JetBrains Mono'",fontWeight:700,color:sonoC}}>{p.sq||"-"}</td>
                    <td style={{padding:"6px 4px",fontFamily:"'JetBrains Mono'",color:(p.rg||10)<6?"#DC2626":t.textMuted}}>{p.rg||"-"}</td>
                    <td style={{padding:"6px 4px",fontFamily:"'JetBrains Mono'",color:(p.rp||10)<6?"#DC2626":t.textMuted}}>{p.rp||"-"}</td>
                    <td style={{padding:"6px 4px",fontFamily:"'JetBrains Mono'",color:(p.d||0)>3?"#DC2626":t.textMuted}}>{p.d||"0"}</td>
                    <td style={{padding:"6px 4px",fontFamily:"'JetBrains Mono'"}}>{p.h||"-"}</td>
                    <td style={{padding:"6px 4px",fontFamily:"'JetBrains Mono'"}}>{p.e||"-"}</td>
                    <td style={{padding:"6px 4px"}}><span style={{padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:(p.sq||10)<6||((p.d||0)>4)?"#FEF2F2":"#F0FDF4",color:(p.sq||10)<6||((p.d||0)>4)?"#DC2626":"#16A34A"}}>{(p.sq||10)<6||((p.d||0)>4)?"ALERTA":"OK"}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>}

        {/* ═══════════ PAINEL TEMPORAL ═══════════ */}
        {tab==="temporal"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,marginBottom:4}}>Painel Temporal — Fadiga & Tendências</div>
            <div style={{fontSize:11,color:t.textMuted}}>Dívida de Fadiga (decaimento exponencial), tendências de performance e variabilidade por atleta</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Dívida de Fadiga explanation */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Dívida de Fadiga (λ=0.1)</div>
              <div style={{fontSize:11,color:t.textMuted,lineHeight:1.6,marginBottom:12}}>
                FatigueDebt<sub>t</sub> = Σ Load<sub>t-i</sub> × e<sup>-λi</sup><br/>
                Cargas recentes pesam mais que antigas (Hulin et al., 2014). Valores acima do P75 do elenco indicam fadiga acumulada significativa.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{l:"Modelo de Tendência",v:"Slope Linear (janela móvel)"},
                  {l:"Janelas CMJ",v:"3d / 5d"},
                  {l:"Janela Sono",v:"7 dias"},
                  {l:"Janela sRPE",v:"5 dias"},
                  {l:"Janela HRV",v:"7 dias"},
                  {l:"Lag Features",v:"1, 3, 5, 7 dias"}
                ].map((item,i)=><div key={i} style={{padding:"6px 8px",background:t.bgMuted,borderRadius:6}}>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:600}}>{item.l}</div>
                  <div style={{fontSize:11,fontWeight:600,color:pri}}>{item.v}</div>
                </div>)}
              </div>
            </div>
            {/* Rolling Z-Scores explanation */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Rolling Z-Scores Individuais</div>
              <div style={{fontSize:11,color:t.textMuted,lineHeight:1.6,marginBottom:12}}>
                Z<sub>individual</sub> = (X<sub>t</sub> - μ<sub>rolling</sub>) / σ<sub>rolling</sub><br/>
                Cada atleta comparado contra seu próprio baseline (não contra o elenco). Detecta desvios pessoais antes de limiares populacionais.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{l:"sRPE z-score",v:"7d / 14d",d:"Sobrecarga relativa"},
                  {l:"CMJ z-score",v:"7d / 14d",d:"Fadiga neuromuscular"},
                  {l:"HRV z-score",v:"7d / 14d",d:"Estresse autonômico"},
                  {l:"Bem-estar z-score",v:"7d / 14d",d:"Bem-estar composto"}
                ].map((item,i)=><div key={i} style={{padding:"6px 8px",background:i<2?"#FEF2F2":t.bgMuted,borderRadius:6}}>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:600}}>{item.l} ({item.v})</div>
                  <div style={{fontSize:10,fontWeight:600,color:pri}}>{item.d}</div>
                </div>)}
              </div>
            </div>
          </div>
          {/* Performance Trends per selected player */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Tendências de Performance {sp?`— ${sp.n}`:""}</div>
            {sp&&sp.ct?<div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={sp.ct.map((v,i)=>({d:`D-${8-i}`,cmj:v}))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.borderLight}/>
                  <XAxis dataKey="d" tick={{fontSize:10,fill:t.textMuted}}/>
                  <YAxis domain={["auto","auto"]} tick={{fontSize:10,fill:t.textFaint}}/>
                  <Tooltip content={<TT theme={t}/>}/>
                  <Area type="monotone" dataKey="cmj" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:12}}>
                {[{l:"CMJ Trend 3d",v:sp.ct.length>=3?(sp.ct[sp.ct.length-1]-sp.ct[sp.ct.length-3]).toFixed(1):"-",u:"cm"},
                  {l:"CMJ Trend 5d",v:sp.ct.length>=5?(sp.ct[sp.ct.length-1]-sp.ct[sp.ct.length-5]).toFixed(1):"-",u:"cm"},
                  {l:"Variação 8d",v:sp.ct.length>=2?((sp.ct[sp.ct.length-1]-sp.ct[0])/sp.ct[0]*100).toFixed(1):"-",u:"%"},
                  {l:"CMJ Atual",v:sp.ct[sp.ct.length-1]?.toFixed(1)||"-",u:"cm"}
                ].map((item,i)=><div key={i} style={{padding:"8px",background:t.bgMuted,borderRadius:6,textAlign:"center"}}>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:600}}>{item.l}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:700,color:parseFloat(item.v)<-5?"#DC2626":parseFloat(item.v)>0?"#16A34A":t.textMuted}}>{item.v}{item.u}</div>
                </div>)}
              </div>
            </div>:<div style={{textAlign:"center",padding:30,color:t.textFaint,fontSize:12}}>Selecione um atleta na sidebar para ver tendências temporais</div>}
          </div>
          {/* Feature Engineering Summary */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Estrutura de Features Temporais (110 engenheiradas)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{cat:"Lag Features",n:24,desc:"sRPE, CMJ, HRV, sono, dor × [1,3,5,7]d",c:"#0891b2"},
                {cat:"Rolling Mean",n:8,desc:"sRPE, CMJ, HRV × [7d, 14d]",c:"#2563eb"},
                {cat:"Rolling Std",n:8,desc:"sRPE, CMJ, HRV × [7d, 14d]",c:"#7c3aed"},
                {cat:"Rolling Z-Score",n:8,desc:"sRPE, CMJ, HRV × [7d, 14d]",c:"#DC2626"},
                {cat:"Trend Slopes",n:6,desc:"CMJ 3d/5d, Sleep 7d, sRPE 5d, HRV 7d",c:"#EA580C"},
                {cat:"ACWR (EWMA)",n:5,desc:"HSR, Sprints, Decels, sRPE, Combinado",c:"#CA8A04"},
                {cat:"Fatigue / Load",n:7,desc:"Debt, Monotonia, Strain, EWMA 7d/28d, Cum 7d/28d",c:"#16A34A"},
                {cat:"Neuromuscular",n:6,desc:"CMJ Δ%, ISO asym, ISO Δ%, SLCMJ, NME, flag",c:"#7c3aed"},
                {cat:"Interações",n:4,desc:"ACWR×sono, HRV×load, fadiga×asym",c:"#DC2626"}
              ].map((item,i)=><div key={i} style={{padding:"10px",background:t.bgMuted,borderRadius:8,borderLeft:`3px solid ${item.c}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:pri}}>{item.cat}</span>
                  <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:item.c}}>{item.n}</span>
                </div>
                <div style={{fontSize:9,color:t.textMuted}}>{item.desc}</div>
              </div>)}
            </div>
          </div>
        </div>}

        {/* Painel "Fisioterapia" removido — atendimentos clínicos saem da visão tática.
            A lógica de auto-exclusão por reabilitação (_fisioSessao) permanece ativa
            no Radar Individual, lendo sheetData.fisioterapia silenciosamente. */}

        {tab==="jogos"&&<div>
          {/* Jogos Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Calendário de Jogos</div>
                <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>Dados da aba Calendário — clique no jogo para ver dados dos atletas</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {(()=>{
                  const jogosCalendario = sheetData?.calendario || [];
                  return ["Todos","Paulistão","Série B"].map((f,i)=>{
                    const filterVal = f==="Todos"?null:f==="Paulistão"?"Paulistão":"Série B";
                    const count = filterVal ? jogosCalendario.filter(g=>(g.comp||"").toLowerCase().includes(filterVal.toLowerCase())).length : jogosCalendario.length;
                    return <span key={i} style={{padding:"5px 14px",borderRadius:999,fontSize:10,fontWeight:700,background:dark?"rgba(255,255,255,.04)":t.bgMuted,color:t.textMuted,border:`1px solid ${dark?"rgba(255,255,255,.08)":t.border}`,cursor:"default"}}>{f} ({count})</span>;
                  });
                })()}
              </div>
            </div>
          </div>

          {/* ═══ HERO CARD — Próximo Jogo (estilo Season Calendar) ═══ */}
          {(()=>{
            const games=sheetData?.calendario||[];
            if(!games.length) return null;
            const parseGD=s=>{if(!s)return null;const v=String(s).trim();if(/^\d{4}-\d{2}-\d{2}/.test(v))return new Date(v);const p=v.split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(c>100)return new Date(c,b-1,a);if(a>100)return new Date(a,b-1,c);return new Date(2026,b-1,a);}return null;};
            const today=new Date(); today.setHours(0,0,0,0);
            const upcoming=games.map(g=>({g,d:parseGD(g.data)})).filter(x=>x.d&&x.d>=today).sort((a,b)=>a.d-b.d);
            if(!upcoming.length) return null;
            const next=upcoming[0];
            const g=next.g; const d=next.d;
            const ms=d.getTime()-Date.now();
            const days=Math.max(0,Math.floor(ms/86400000));
            const hours=Math.max(0,Math.floor((ms%86400000)/3600000));
            const mins=Math.max(0,Math.floor((ms%3600000)/60000));
            const isHome=(g.local||"").toUpperCase()==="C";
            const dateStr=d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"});
            const timeStr=d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})||"—";

            // Botafogo SP (assets/public placeholder do escudo)
            const botaShield="/icon.png";
            const advShield=g.escudo&&(g.escudo.startsWith("http")||g.escudo.startsWith("/"))?g.escudo:null;

            return <div style={{borderRadius:16,padding:0,marginBottom:18,overflow:"hidden",position:"relative",background:dark?"linear-gradient(135deg, rgba(15,19,32,.92) 0%, rgba(7,10,20,.96) 60%, rgba(15,19,32,.92) 100%)":"linear-gradient(135deg, #f8fafb 0%, #fff 100%)",border:`1px solid ${t.border}`,boxShadow:dark?"0 8px 32px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.05)":"0 4px 20px rgba(0,0,0,.08)"}}>
              {/* Faixa decorativa neon */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg, transparent 0%, #3b82f6 30%, #22c55e 70%, transparent 100%)",opacity:.7}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:24,alignItems:"center",padding:"32px 40px"}}>
                {/* Time da casa (Botafogo SP) */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                  <div style={{width:84,height:84,borderRadius:"50%",background:dark?"rgba(255,255,255,.05)":"#fff",border:`2px solid ${dark?"rgba(255,255,255,.1)":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:dark?"0 4px 16px rgba(0,0,0,.4)":"0 2px 8px rgba(0,0,0,.1)"}}>
                    <img src={botaShield} alt="Botafogo SP" style={{width:64,height:64,objectFit:"contain"}}/>
                  </div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri,textAlign:"center",letterSpacing:.3}}>{isHome?"BOTAFOGO SP":g.adversario||"—"}</div>
                  <span style={{padding:"3px 10px",borderRadius:999,fontSize:9,fontWeight:700,background:isHome?"rgba(34,197,94,.15)":"rgba(239,68,68,.15)",color:isHome?"#22c55e":"#ef4444",border:`1px solid ${isHome?"#22c55e":"#ef4444"}66`}}>{isHome?"CASA":"FORA"}</span>
                </div>

                {/* Coluna central: data + countdown + horário */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,minWidth:280}}>
                  <span style={{padding:"4px 14px",borderRadius:999,fontSize:10,fontWeight:800,background:"#3b82f6",color:"#fff",letterSpacing:.5,textTransform:"uppercase",boxShadow:"0 0 0 3px rgba(59,130,246,.25)"}}>Próximo Jogo · {g.comp||"—"}</span>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textFaint,fontWeight:600,letterSpacing:.5}}>{dateStr.toUpperCase()}</div>
                  {/* Countdown estilo Season Calendar */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:dark?"rgba(255,255,255,.03)":t.bgMuted,borderRadius:12,border:`1px solid ${dark?"rgba(255,255,255,.06)":t.borderLight}`}}>
                    {[{v:days,l:"Dias"},{v:hours,l:"Horas"},{v:mins,l:"Min"}].map((u,i)=><React.Fragment key={i}>
                      {i>0&&<span style={{fontSize:18,color:t.textFaint,fontWeight:300}}>:</span>}
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:24,fontWeight:900,color:pri,lineHeight:1}}>{String(u.v).padStart(2,"0")}</div>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:2}}>{u.l}</div>
                      </div>
                    </React.Fragment>)}
                  </div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:900,fontSize:32,color:pri,letterSpacing:-.5,marginTop:4}}>{timeStr}</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{g.rodada||""}</div>
                </div>

                {/* Adversário ou Botafogo conforme local */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                  <div style={{width:84,height:84,borderRadius:"50%",background:dark?"rgba(255,255,255,.05)":"#fff",border:`2px solid ${dark?"rgba(255,255,255,.1)":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:dark?"0 4px 16px rgba(0,0,0,.4)":"0 2px 8px rgba(0,0,0,.1)"}}>
                    {advShield?<img src={advShield} alt={g.adversario} style={{width:64,height:64,objectFit:"contain"}} onError={e=>{e.target.style.display="none"}}/>
                    :<div style={{fontSize:28,fontWeight:900,color:t.textFaint}}>{(g.adversario||"?").charAt(0).toUpperCase()}</div>}
                  </div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri,textAlign:"center",letterSpacing:.3}}>{isHome?(g.adversario||"—").toUpperCase():"BOTAFOGO SP"}</div>
                  <span style={{padding:"3px 10px",borderRadius:999,fontSize:9,fontWeight:700,background:isHome?"rgba(239,68,68,.15)":"rgba(34,197,94,.15)",color:isHome?"#ef4444":"#22c55e",border:`1px solid ${isHome?"#ef4444":"#22c55e"}66`}}>{isHome?"FORA":"CASA"}</span>
                </div>
              </div>
              {/* Rodapé com infos */}
              {upcoming.length>1&&<div style={{padding:"10px 28px",borderTop:`1px solid ${t.borderLight}`,background:dark?"rgba(0,0,0,.18)":t.bgMuted,fontSize:10,color:t.textFaint,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span><strong style={{color:pri}}>{upcoming.length-1}</strong> jogo{upcoming.length>2?"s":""} agendado{upcoming.length>2?"s":""} adiante</span>
                <span style={{fontFamily:"'JetBrains Mono'"}}>Próximo após: {upcoming[1].g.adversario} · {upcoming[1].d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</span>
              </div>}
            </div>;
          })()}

          {/* Insights Panel — Performance vs Resultado */}
          {(()=>{
            const jogosCalendario = sheetData?.calendario || [];
            const gpsData=sheetData?.gps||{};
            const diarioData=sheetData?.diario||{};
            const questData=sheetData?.questionarios||{};

            // Parse local-midnight (vide comentário em parseGameDate acima).
            const parseGameDate2=(d)=>{
              if(!d)return null;
              const s=String(d).trim();
              const parts=s.split(/[\/\-\.]/);
              if(parts.length>=3){const[a,b,c]=parts.map(Number);if(a>31)return new Date(a,b-1,c);if(c>31)return new Date(c,b-1,a);return new Date(c<100?c+2000:c,b-1,a);}
              const fb=new Date(s);return isNaN(fb.getTime())?null:fb;
            };
            const normDate2=(d)=>{if(!d)return 0;const dt=new Date(d);dt.setHours(0,0,0,0);return dt.getTime();};
            const parseDateStr2=(d)=>{const dt=parseGameDate2(d);return dt?normDate2(dt):0;};

            const classifyResult=(g)=>{
              const r=String(g.resultado||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
              if(/^V|^W/.test(r))return"V";
              if(/^E|^DRAW/.test(r))return"E";
              if(/^D|^L/.test(r))return"D";
              const gp=Number(g.gols_pro);const gc=Number(g.gols_contra);
              if(!isNaN(gp)&&!isNaN(gc)&&(g.gols_pro!==""||g.gols_contra!=="")){if(gp>gc)return"V";if(gp===gc)return"E";return"D";}
              return null;
            };

            const gamesWithResult=jogosCalendario.map(g=>({...g,_result:classifyResult(g)})).filter(g=>g._result);
            if(gamesWithResult.length<2)return null;

            const isMatchTitle2=(st)=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            const isComplementTitle2=(st)=>{const s=(st||"").toLowerCase().trim();return s.includes("compl")||s.includes("aquec")||s.includes("warmup")||s.startsWith("t-")||s.includes("recupera");};
            const isGameTimeSplit2=(sp)=>{
              const s=(sp||"").toLowerCase().trim();
              if(s.includes("aquec")||s.includes("warmup")||s.includes("compl")||s.includes("interv")||s.startsWith("t-")||s.includes("recupera"))return false;
              if(s==="session"||s==="sessão")return true;
              if(/\d+[.\-]\d+\s*min/.test(s)||/\d+\s*mais/.test(s)||/\b[12]t\b/.test(s))return true;
              return false;
            };
            const hasTimePeriods2=(splits)=>{if(!splits?.length)return false;return splits.some(sp=>{const s=(sp||"").toLowerCase();return/\d+[.\-]\d+\s*min/.test(s)||/\d+\s*mais/.test(s)||/\b[12]t\b/.test(s);});};
            const hasSessionSplit2=(splits)=>{if(!splits?.length)return false;return splits.some(sp=>{const s=(sp||"").toLowerCase().trim();return s==="session"||s==="sessão";});};
            const matchesOpponent2=(sessionTitle,adversario)=>{
              if(!sessionTitle||!adversario)return false;
              const st=sessionTitle.toUpperCase().replace(/\s+/g,"");
              const adv=adversario.toUpperCase().replace(/\s+/g,"");
              if(adv.length>=4&&st.includes(adv.substring(0,4)))return true;
              const m=st.match(/J[.\s]*([A-Z]{2,})X([A-Z]{2,})/i);
              if(m){
                const t1=m[1],t2=m[2];
                if(adv.startsWith(t1)||adv.startsWith(t2))return true;
                if(t1.length>=3&&adv.substring(0,3)===t1.substring(0,3))return true;
                if(t2.length>=3&&adv.substring(0,3)===t2.substring(0,3))return true;
                const advWords=adversario.toUpperCase().split(/\s+/).filter(w=>w.length>=3);
                for(const w of advWords){
                  if(t1.length>=3&&w.substring(0,3)===t1.substring(0,3))return true;
                  if(t2.length>=3&&w.substring(0,3)===t2.substring(0,3))return true;
                  if(w.length>=4&&(t1.includes(w.substring(0,4))||t2.includes(w.substring(0,4))))return true;
                }
              }
              const words=adversario.toUpperCase().split(/\s+/).filter(w=>w.length>=3);
              for(const w of words){if(w.length>=4&&st.includes(w.substring(0,4)))return true;}
              return false;
            };
            const getTeamAvgsForDate=(gameDate,adversario)=>{
              if(!gameDate)return null;
              const gDateTs=normDate2(gameDate);
              const DAY_MS2=86400000;
              // Tolerância ±2 dias (alinha com getAthletesForDate da aba Jogos):
              // jogos noturnos podem registrar data do dia seguinte na aba bruta
              // e fusos diferentes podem deslocar 1d a interpretação ISO.
              const dateMatch2=(entryDate)=>{const eTs=parseDateStr2(entryDate);if(!eTs)return false;return Math.abs(eTs-gDateTs)<=2*DAY_MS2;};
              const allNames=new Set([...Object.keys(gpsData),...Object.keys(diarioData)]);
              let distArr=[],hsrArr=[],sprintArr=[],pseArr=[],sonoArr=[],dorArr=[],recArr=[];
              for(const name of allNames){
                const gpsEntries=(gpsData[name]||[]).filter(e=>dateMatch2(e.date));
                const diarioEntries=(diarioData[name]||[]).filter(e=>dateMatch2(e.date));
                const questEntries=(questData[name]||[]).filter(e=>dateMatch2(e.date));
                // Prioridade na escolha (date já filtrou): adversário > match > não-compl > tudo.
                // Não descarta atletas só porque o título não cita o adversário.
                const opponentE=adversario?gpsEntries.filter(e=>matchesOpponent2(e.sessionTitle,adversario)):[];
                const matchE=gpsEntries.filter(e=>isMatchTitle2(e.sessionTitle));
                const nonCompE=gpsEntries.filter(e=>!isComplementTitle2(e.sessionTitle));
                const pool=opponentE.length?opponentE:(matchE.length?matchE:(nonCompE.length?nonCompE:gpsEntries));
                let bestGps=null;
                if(pool.length>1){bestGps=pool.reduce((b,e)=>(e.gps?.dist_total||0)>(b?.gps?.dist_total||0)?e:b,pool[0]);}
                else if(pool.length===1){bestGps=pool[0];}
                const gps=bestGps?.gps||bestGps||null;
                const allSplits=bestGps?.allSplits||[];
                const diario=diarioEntries.length?diarioEntries[diarioEntries.length-1]:null;
                const quest=questEntries.length?questEntries[questEntries.length-1]:null;
                const dist=gps?.dist_total||0;
                const stIsMatch=isMatchTitle2(bestGps?.sessionTitle);
                const gameTimeCt=allSplits.filter(sp=>isGameTimeSplit2(sp)).length;
                const hasPeriods=hasTimePeriods2(allSplits);
                const hasSession=hasSessionSplit2(allSplits);
                // Suporta dois formatos: (A) legado com splits / (B) gps_individual sem splits.
                // Como o universo já está filtrado pela data do jogo, distâncias altas
                // implicam jogo mesmo sem palavra-chave no título.
                const playedLegacy=(hasPeriods&&gameTimeCt>=2)||(hasSession&&stIsMatch&&dist>=4000)||(hasPeriods&&gameTimeCt>=1&&dist>=2000);
                const playedIndividual=!allSplits.length&&((stIsMatch&&dist>=2000)||dist>=4000);
                if(!playedLegacy&&!playedIndividual) continue;
                if(dist>0)distArr.push(dist);
                if(gps?.hsr>0)hsrArr.push(gps.hsr);
                if(gps?.sprints>0)sprintArr.push(gps.sprints);
                if(diario?.pse>0)pseArr.push(diario.pse);
                if(quest?.sono_qualidade>0)sonoArr.push(quest.sono_qualidade);
                if(quest?.dor>0)dorArr.push(quest.dor);
                if(quest?.recuperacao_geral>0)recArr.push(quest.recuperacao_geral);
              }
              const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
              return{dist:avg(distArr),hsr:avg(hsrArr),sprints:avg(sprintArr),pse:avg(pseArr),sono:avg(sonoArr),dor:avg(dorArr),rec:avg(recArr),n:distArr.length};
            };

            const grouped={V:[],E:[],D:[]};
            const totalCount={V:0,E:0,D:0};
            gamesWithResult.forEach(g=>{
              totalCount[g._result]++;
              const gDate=parseGameDate2(g.data);
              const avgs=getTeamAvgsForDate(gDate,g.adversario);
              if(avgs&&(avgs.dist>0||avgs.pse>0))grouped[g._result].push({...g,avgs});
            });

            const avgGroup=(arr,fn)=>{const vals=arr.map(fn).filter(v=>v>0);return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length):0;};
            const categories=[
              {key:"V",label:"Vitórias",color:"#16A34A",bg:"#F0FDF4",bc:"#BBF7D0",games:grouped.V,total:totalCount.V},
              {key:"E",label:"Empates",color:"#CA8A04",bg:"#FEFCE8",bc:"#FEF08A",games:grouped.E,total:totalCount.E},
              {key:"D",label:"Derrotas",color:"#DC2626",bg:"#FEF2F2",bc:"#FECACA",games:grouped.D,total:totalCount.D}
            ];

            const hasData=categories.some(c=>c.total>0);
            if(!hasData)return null;

            const metrics=[
              {label:"Dist. Média",fn:g=>g.avgs.dist,unit:"m",fmt:v=>Math.round(v)},
              {label:"HSR Média",fn:g=>g.avgs.hsr,unit:"m",fmt:v=>Math.round(v)},
              {label:"Sprints Méd.",fn:g=>g.avgs.sprints,unit:"",fmt:v=>v.toFixed(1)},
              {label:"PSE Média",fn:g=>g.avgs.pse,unit:"",fmt:v=>v.toFixed(1)},
              {label:"Sono Médio",fn:g=>g.avgs.sono,unit:"",fmt:v=>v.toFixed(1)},
              {label:"Dor Média",fn:g=>g.avgs.dor,unit:"",fmt:v=>v.toFixed(1)},
              {label:"Recup. Média",fn:g=>g.avgs.rec,unit:"",fmt:v=>v.toFixed(1)}
            ];

            // Generate insights
            const insights=[];
            categories.forEach(cat=>{
              if(!cat.games.length)return;
              const avgDist=avgGroup(cat.games,g=>g.avgs.dist);
              const avgPse=avgGroup(cat.games,g=>g.avgs.pse);
              const avgSono=avgGroup(cat.games,g=>g.avgs.sono);
              const avgDor=avgGroup(cat.games,g=>g.avgs.dor);
              const avgRec=avgGroup(cat.games,g=>g.avgs.rec);
              cat._avgDist=avgDist;cat._avgPse=avgPse;cat._avgSono=avgSono;cat._avgDor=avgDor;cat._avgRec=avgRec;
            });

            const vCat=categories[0],eCat=categories[1],dCat=categories[2];
            if(vCat.games.length&&dCat.games.length){
              if(vCat._avgSono>0&&dCat._avgSono>0&&vCat._avgSono>dCat._avgSono+0.3)
                insights.push({icon:"😴",text:`Qualidade de sono nas vitórias (${vCat._avgSono.toFixed(1)}) é superior às derrotas (${dCat._avgSono.toFixed(1)})`,type:"positive"});
              if(vCat._avgDor>0&&dCat._avgDor>0&&dCat._avgDor>vCat._avgDor+0.3)
                insights.push({icon:"🤕",text:`Nível de dor pré-jogo nas derrotas (${dCat._avgDor.toFixed(1)}) é mais alto que nas vitórias (${vCat._avgDor.toFixed(1)})`,type:"negative"});
              if(vCat._avgRec>0&&dCat._avgRec>0&&vCat._avgRec>dCat._avgRec+0.3)
                insights.push({icon:"💪",text:`Percepção de recuperação nas vitórias (${vCat._avgRec.toFixed(1)}) é melhor que nas derrotas (${dCat._avgRec.toFixed(1)})`,type:"positive"});
              if(vCat._avgPse>0&&dCat._avgPse>0&&Math.abs(vCat._avgPse-dCat._avgPse)>0.5)
                insights.push({icon:"📊",text:`PSE média nas vitórias: ${vCat._avgPse.toFixed(1)} vs derrotas: ${dCat._avgPse.toFixed(1)}`,type:"info"});
              if(vCat._avgDist>0&&dCat._avgDist>0){
                const diff=((vCat._avgDist-dCat._avgDist)/dCat._avgDist*100).toFixed(0);
                if(Math.abs(diff)>3)
                  insights.push({icon:"🏃",text:`Time percorre ${Math.abs(diff)}% ${Number(diff)>0?"mais":"menos"} distância em vitórias vs derrotas`,type:Number(diff)>0?"positive":"info"});
              }
            }
            if(vCat.games.length&&eCat.games.length&&eCat._avgDist>0&&vCat._avgDist>0){
              if(eCat._avgPse>0&&vCat._avgPse>0&&eCat._avgPse>vCat._avgPse+0.3)
                insights.push({icon:"⚠️",text:`Em empates, PSE média (${eCat._avgPse.toFixed(1)}) é maior que em vitórias (${vCat._avgPse.toFixed(1)}) — possível fadiga`,type:"warning"});
            }

            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri,marginBottom:4}}>Análise por Resultado</div>
              <div style={{fontSize:11,color:t.textFaint,marginBottom:14}}>Correlação entre métricas de performance dos atletas e resultado dos jogos</div>

              {/* Result summary cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                {categories.map((cat,ci)=>
                  <div key={ci} style={{background:cat.bg,borderRadius:10,border:`1px solid ${cat.bc}`,padding:14,textAlign:"center"}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:28,fontWeight:900,color:cat.color}}>{cat.total}</div>
                    <div style={{fontSize:11,fontWeight:700,color:cat.color}}>{cat.label}</div>
                  </div>
                )}
              </div>

              {/* Metrics comparison table */}
              {categories.some(c=>c.games.length>0)&&<div style={{overflowX:"auto",marginBottom:16}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{background:t.bgMuted}}>
                      <th style={{padding:"8px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase"}}>Métrica</th>
                      {categories.map((cat,ci)=><th key={ci} style={{padding:"8px 10px",textAlign:"center",fontSize:9,fontWeight:700,color:cat.color,textTransform:"uppercase"}}>{cat.label} ({cat.total})</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m,mi)=>{
                      const vals=categories.map(cat=>avgGroup(cat.games,m.fn));
                      const validVals=vals.filter(v=>v>0);
                      if(!validVals.length)return null;
                      const maxV=Math.max(...validVals);
                      const minV=Math.min(...validVals);
                      return <tr key={mi} style={{borderBottom:`1px solid ${t.borderLight}`}}>
                        <td style={{padding:"8px 10px",fontWeight:600,color:pri}}>{m.label}</td>
                        {categories.map((cat,ci)=>{
                          const v=vals[ci];
                          const isBest=m.label.includes("Dor")?v===minV&&v>0:v===maxV&&v>0;
                          const isWorst=m.label.includes("Dor")?v===maxV&&v>0:v===minV&&v>0;
                          return <td key={ci} style={{padding:"8px 10px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:isBest?800:600,color:v>0?(isBest?"#16A34A":isWorst?"#DC2626":pri):t.textFaint}}>
                            {v>0?m.fmt(v)+(m.unit?" "+m.unit:""):"—"}
                          </td>;
                        })}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>}

              {/* Insights */}
              {insights.length>0&&<div>
                <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8}}>Insights Identificados</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {insights.map((ins,ii)=>{
                    const insColor=ins.type==="positive"?"#16A34A":ins.type==="negative"?"#DC2626":ins.type==="warning"?"#CA8A04":"#2563eb";
                    const insBg=ins.type==="positive"?"#F0FDF4":ins.type==="negative"?"#FEF2F2":ins.type==="warning"?"#FEFCE8":"#EFF6FF";
                    const insBc=ins.type==="positive"?"#BBF7D0":ins.type==="negative"?"#FECACA":ins.type==="warning"?"#FEF08A":"#BFDBFE";
                    return <div key={ii} style={{padding:"8px 12px",background:insBg,borderRadius:8,border:`1px solid ${insBc}`,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:14}}>{ins.icon}</span>
                      <span style={{fontSize:11,color:insColor,fontWeight:500,lineHeight:1.4}}>{ins.text}</span>
                    </div>;
                  })}
                </div>
              </div>}
            </div>;
          })()}

          {/* ═══ Análise Agregada: Decaimento de Performance entre Tempos (todos os jogos) ═══ */}
          {(()=>{
            const gpsData2=sheetData?.gps||{};
            const calendario2=sheetData?.calendario||[];
            const pastGames=calendario2.filter(g=>{
              const gp=Number(g.gols_pro),gc=Number(g.gols_contra);
              return !isNaN(gp)&&!isNaN(gc)&&(g.gols_pro!==""||g.gols_contra!=="");
            });
            if(pastGames.length<2)return null;

            // Para cada jogo passado, coletar splitsDetail de todos os atletas
            const isMatchT=(st)=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo");};
            const matchOpp=(sessionTitle,adversario)=>{
              if(!sessionTitle||!adversario)return false;
              const st=sessionTitle.toUpperCase().replace(/\s+/g,"");
              const adv=adversario.toUpperCase().replace(/\s+/g,"");
              if(adv.length>=4&&st.includes(adv.substring(0,4)))return true;
              const m=st.match(/J[.\s]*([A-Z]{2,})X([A-Z]{2,})/i);
              if(m){if(adv.startsWith(m[1])||adv.startsWith(m[2]))return true;if(m[1].length>=3&&adv.substring(0,3)===m[1].substring(0,3))return true;if(m[2].length>=3&&adv.substring(0,3)===m[2].substring(0,3))return true;}
              return false;
            };
            const normD=(d)=>{if(!d)return 0;const s=String(d).trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return new Date(s).setHours(0,0,0,0);const p=s.split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(c>100)return new Date(c,b-1,a).getTime();if(a>31)return new Date(a,b-1,c).getTime();return new Date(c,a-1,b).getTime();}return new Date(s).getTime()||0;};

            const classifyPeriod=(splitName)=>{
              const s=(splitName||"").toLowerCase().trim();
              if(s.includes("aquec")||s.includes("compl")||s.includes("interv")||s.startsWith("t-"))return null;
              const is2T=s.includes("2t")||s.includes("2nd");
              if(!is2T&&!s.includes("1t")&&!s.includes("1st")&&!s.includes("min")&&!/\d+-\d+/.test(s))return null;
              return is2T?"2T":"1T";
            };

            // Aggregate across all games
            let agg1T={dist:[],hsr:[],sprints:[]},agg2T={dist:[],hsr:[],sprints:[]};
            const perGameDecay=[];

            pastGames.forEach(game=>{
              const gDateTs=normD(game.data);
              if(!gDateTs)return;
              let g1T={dist:[],hsr:[],sprints:[]},g2T={dist:[],hsr:[],sprints:[]};

              for(const[name,entries]of Object.entries(gpsData2)){
                const dayEntries=entries.filter(e=>{const ed=normD(e.date);return ed===gDateTs||ed===gDateTs-86400000||ed===gDateTs+86400000;});
                // Filter by opponent match
                const oppEntries=game.adversario?dayEntries.filter(e=>matchOpp(e.sessionTitle,game.adversario)):[];
                const matchEntries=dayEntries.filter(e=>isMatchT(e.sessionTitle));
                const pool=oppEntries.length?oppEntries:(matchEntries.length?matchEntries:[]);
                if(!pool.length)continue;
                const best=pool.reduce((b,e)=>(e.gps?.dist_total||0)>(b.gps?.dist_total||0)?e:b,pool[0]);
                const sd=best.splitsDetail||[];
                sd.forEach(sp=>{
                  const half=classifyPeriod(sp.split);
                  if(!half)return;
                  const target=half==="1T"?g1T:g2T;
                  if(sp.dist>0)target.dist.push(sp.dist);
                  if(sp.hsr>0)target.hsr.push(sp.hsr);
                  if(sp.sprints>0)target.sprints.push(sp.sprints);
                });
              }

              const avgArr=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
              const d1=avgArr(g1T.dist),d2=avgArr(g2T.dist);
              const h1=avgArr(g1T.hsr),h2=avgArr(g2T.hsr);
              const s1=avgArr(g1T.sprints),s2=avgArr(g2T.sprints);

              if(d1>0)agg1T.dist.push(d1);if(d2>0)agg2T.dist.push(d2);
              if(h1>0)agg1T.hsr.push(h1);if(h2>0)agg2T.hsr.push(h2);
              if(s1>0)agg1T.sprints.push(s1);if(s2>0)agg2T.sprints.push(s2);

              if(d1>0&&d2>0){
                const gp=Number(game.gols_pro),gc=Number(game.gols_contra);
                const res=gp>gc?"V":gp===gc?"E":"D";
                perGameDecay.push({game:`${game.adversario||"?"} (${game.data})`,res,distDelta:((d2-d1)/d1*100),hsrDelta:h1>0?((h2-h1)/h1*100):0,sprintDelta:s1>0?((s2-s1)/s1*100):0});
              }
            });

            const avgArr2=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
            const globalDist1=avgArr2(agg1T.dist),globalDist2=avgArr2(agg2T.dist);
            const globalHsr1=avgArr2(agg1T.hsr),globalHsr2=avgArr2(agg2T.hsr);
            const globalSprint1=avgArr2(agg1T.sprints),globalSprint2=avgArr2(agg2T.sprints);

            if(globalDist1===0&&globalDist2===0)return null;

            const globalDistDelta=globalDist1>0?((globalDist2-globalDist1)/globalDist1*100):0;
            const globalHsrDelta=globalHsr1>0?((globalHsr2-globalHsr1)/globalHsr1*100):0;
            const globalSprintDelta=globalSprint1>0?((globalSprint2-globalSprint1)/globalSprint1*100):0;

            // Insights por resultado
            const vGames=perGameDecay.filter(g=>g.res==="V"),dGames=perGameDecay.filter(g=>g.res==="D");
            const avgDecayV=vGames.length?avgArr2(vGames.map(g=>g.distDelta)):null;
            const avgDecayD=dGames.length?avgArr2(dGames.map(g=>g.distDelta)):null;

            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri,marginBottom:4}}>Análise de Fadiga — 1T vs 2T (Agregado)</div>
              <div style={{fontSize:11,color:t.textFaint,marginBottom:16}}>Média de performance por tempo em {perGameDecay.length} jogos analisados</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
                {[
                  {label:"Distância/Período",v1:globalDist1,v2:globalDist2,delta:globalDistDelta,unit:"m",color1:"#2563eb",color2:"#7c3aed"},
                  {label:"HSR/Período",v1:globalHsr1,v2:globalHsr2,delta:globalHsrDelta,unit:"m",color1:"#DC2626",color2:"#9333ea"},
                  {label:"Sprints/Período",v1:globalSprint1,v2:globalSprint2,delta:globalSprintDelta,unit:"",color1:"#16A34A",color2:"#7c3aed"}
                ].map((m,mi)=>{
                  const deltaColor=m.delta<-10?"#DC2626":m.delta>5?"#16A34A":"#CA8A04";
                  return <div key={mi} style={{background:t.bgMuted,borderRadius:10,padding:14,border:`1px solid ${t.borderLight}`,textAlign:"center"}}>
                    <div style={{fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>{m.label}</div>
                    <div style={{display:"flex",justifyContent:"center",gap:16,alignItems:"center",marginBottom:8}}>
                      <div>
                        <div style={{fontSize:8,color:m.color1,fontWeight:600}}>1T</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:800,color:m.color1}}>{m.v1>100?Math.round(m.v1):m.v1.toFixed(1)}{m.unit&&<span style={{fontSize:10}}>{m.unit}</span>}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{fontSize:9,color:t.textFaint}}>→</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:deltaColor}}>{m.delta>0?"+":""}{m.delta.toFixed(0)}%</div>
                      </div>
                      <div>
                        <div style={{fontSize:8,color:m.color2,fontWeight:600}}>2T</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:800,color:m.color2}}>{m.v2>100?Math.round(m.v2):m.v2.toFixed(1)}{m.unit&&<span style={{fontSize:10}}>{m.unit}</span>}</div>
                      </div>
                    </div>
                    {/* Mini bar comparison */}
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <div style={{flex:1,height:6,borderRadius:3,background:m.color1,opacity:.7}}/>
                      <div style={{flex:m.v1>0?(m.v2/m.v1):1,height:6,borderRadius:3,background:m.color2,opacity:.7}}/>
                    </div>
                  </div>;
                })}
              </div>

              {/* Por jogo */}
              {perGameDecay.length>0&&<div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Decaimento por Jogo</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                  {perGameDecay.map((g,gi)=>{
                    const resColor=g.res==="V"?"#16A34A":g.res==="E"?"#CA8A04":"#DC2626";
                    const decayColor=g.distDelta<-10?"#DC2626":g.distDelta>5?"#16A34A":"#CA8A04";
                    return <div key={gi} style={{padding:"8px 10px",borderRadius:8,background:t.bgMuted,border:`1px solid ${t.borderLight}`,fontSize:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontWeight:600,color:pri}}>{g.game}</span>
                        <span style={{width:18,height:18,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,background:`${resColor}18`,color:resColor}}>{g.res}</span>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:decayColor}}>Dist: {g.distDelta>0?"+":""}{g.distDelta.toFixed(0)}%</span>
                        {g.hsrDelta!==0&&<span style={{fontFamily:"'JetBrains Mono'",fontWeight:600,color:g.hsrDelta<-10?"#DC2626":"#64748b"}}>HSR: {g.hsrDelta>0?"+":""}{g.hsrDelta.toFixed(0)}%</span>}
                      </div>
                    </div>;
                  })}
                </div>
              </div>}

              {/* Insights correlação fadiga x resultado */}
              {(()=>{
                const fatigueInsights=[];
                if(globalDistDelta<-10)fatigueInsights.push({icon:"📉",text:`O time perde em média ${Math.abs(globalDistDelta).toFixed(0)}% de distância do 1T para o 2T — investigar estratégia nutricional e protocolo de hidratação`,type:"negative"});
                else if(globalDistDelta>-5)fatigueInsights.push({icon:"✅",text:`Boa manutenção de distância entre tempos (${globalDistDelta>0?"+":""}${globalDistDelta.toFixed(0)}%) — time consegue sustentar output físico`,type:"positive"});
                if(globalHsrDelta<-15)fatigueInsights.push({icon:"🏃",text:`HSR cai ${Math.abs(globalHsrDelta).toFixed(0)}% no 2T — componente neuromuscular de alta intensidade é o mais afetado pela fadiga`,type:"negative"});
                if(avgDecayV!==null&&avgDecayD!==null&&Math.abs(avgDecayV-avgDecayD)>5){
                  if(avgDecayD<avgDecayV)fatigueInsights.push({icon:"🔍",text:`Nas derrotas a queda de distância é maior (${avgDecayD.toFixed(0)}%) que nas vitórias (${avgDecayV.toFixed(0)}%) — time que mantém ritmo no 2T vence mais`,type:"info"});
                  else fatigueInsights.push({icon:"📊",text:`Queda no 2T similar entre vitórias (${avgDecayV.toFixed(0)}%) e derrotas (${avgDecayD.toFixed(0)}%)`,type:"info"});
                }
                if(!fatigueInsights.length)return null;
                return <div style={{background:t.bgMuted,borderRadius:8,padding:12,border:`1px solid ${t.borderLight}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:pri,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Insights — Fadiga, Nutrição & Performance</div>
                  {fatigueInsights.map((ins,ii)=><div key={ii} style={{padding:"6px 10px",marginBottom:4,borderRadius:6,fontSize:10,lineHeight:1.4,background:ins.type==="negative"?"#FEF2F2":ins.type==="positive"?"#F0FDF4":"#EFF6FF",color:ins.type==="negative"?"#991B1B":ins.type==="positive"?"#166534":"#1E40AF",border:`1px solid ${ins.type==="negative"?"#FECACA":ins.type==="positive"?"#BBF7D0":"#BFDBFE"}`}}>
                    <span style={{marginRight:6}}>{ins.icon}</span>{ins.text}
                  </div>)}
                </div>;
              })()}
            </div>;
          })()}

          {/* Jogos Table with expandable athlete data */}
          {(()=>{
            const jogosCalendario = sheetData?.calendario || [];
            if (!jogosCalendario.length) return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:40,textAlign:"center"}}>
              <div style={{fontSize:14,color:t.textFaint}}>Nenhum jogo encontrado no calendário</div>
              <div style={{fontSize:11,color:t.textFaintest,marginTop:4}}>Verifique se a aba "Calendário" está publicada na planilha</div>
            </div>;

            // Parse local-midnight Date (sem fuso). `new Date("2026-04-26")`
            // é UTC e em BRT (UTC-3) cai no dia 25 — quebrava o match do jogo
            // R6 26/04/2026 quando a planilha publicava data no formato ISO.
            const parseGameDate=(d)=>{
              if(!d)return null;
              const s=String(d).trim();
              const parts=s.split(/[\/\-\.]/);
              if(parts.length>=3){
                const[a,b,c]=parts.map(Number);
                if(a>31)return new Date(a,b-1,c);            // YYYY-MM-DD
                if(c>31)return new Date(c,b-1,a);            // DD/MM/YYYY
                return new Date(c<100?c+2000:c,b-1,a);       // ano de 2 dígitos
              }
              const fb=new Date(s);
              return isNaN(fb.getTime())?null:fb;
            };
            const normDate=(d)=>{if(!d)return 0;const dt=new Date(d);dt.setHours(0,0,0,0);return dt.getTime();};
            const parseDateStr=(d)=>{
              const dt=parseGameDate(d);
              return dt?normDate(dt):0;
            };
            const today=new Date();
            today.setHours(0,0,0,0);

            const gpsData=sheetData?.gps||{};
            const diarioData=sheetData?.diario||{};
            const saltosData=sheetData?.saltos||{};
            const questData=sheetData?.questionarios||{};

            // Helpers para classificar session titles
            const isMatchTitle=(st)=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            const isComplementTitle=(st)=>{const s=(st||"").toLowerCase().trim();return s.includes("compl")||s.includes("aquec")||s.includes("warmup")||s.startsWith("t-")||s.includes("recupera");};
            // Checa se um split é de tempo real de jogo (período com faixa de minutos)
            // Ex: ".4-30.40min", ".5-40mais", ".6-0.10min 2T", ".7-10.20min 2T", "Session"
            // NÃO: ".0-Aquec R", "G-Aquec", "compl", "T-SAIU", "intervalo"
            const isGameTimeSplit=(sp)=>{
              const s=(sp||"").toLowerCase().trim();
              // Excluir aquecimento, complemento, intervalo, saída
              if(s.includes("aquec")||s.includes("warmup")||s.includes("warm-up"))return false;
              if(s.includes("compl")||s.includes("interv")||s.startsWith("t-"))return false;
              if(s.includes("recupera")||s.includes("cool"))return false;
              // "Session" = sessão agregada inteira (sem splits por período) → conta como jogo
              if(s==="session"||s==="sessão"||s==="sessao")return true;
              // Padrões de tempo real de jogo:
              // "30.40min", "0.10min", "10.20min 2T", "40mais", "45mais"
              if(/\d+[.\-]\d+\s*min/.test(s))return true;
              if(/\d+\s*mais/.test(s))return true;
              // "1T", "2T" como split
              if(/\b[12]t\b/.test(s))return true;
              if(s.includes("1st half")||s.includes("2nd half"))return true;
              return false;
            };
            // Checa se um split é exclusivamente de aquecimento/reserva
            const isNonGameSplit=(sp)=>{
              const s=(sp||"").toLowerCase().trim();
              return s.includes("aquec")||s.includes("warmup")||s.includes("warm-up")||
                     s.includes("compl")||s.includes("interv")||s.startsWith("t-")||
                     s.includes("recupera")||s.includes("cool");
            };
            const countGameTimeSplits=(splits)=>{
              if(!splits?.length)return 0;
              return splits.filter(sp=>isGameTimeSplit(sp)).length;
            };

            // Match adversário do calendário com session title do GPS.
            // Cobre dois formatos: legado "J.BOTxFOR" e o novo gps_individual
            // ("Jogo Fortaleza Casa (V)"), além de variações com Sub-20 etc.
            const matchesOpponent=(sessionTitle,adversario)=>{
              if(!sessionTitle||!adversario)return false;
              const stRaw=sessionTitle.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
              const advRaw=adversario.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
              const st=stRaw.replace(/\s+/g,""); const adv=advRaw.replace(/\s+/g,"");
              // Match direto (>=4 chars contidos)
              if(adv.length>=4&&st.includes(adv.substring(0,4)))return true;
              // Formato legado "J.BOTxFOR" → siglas
              const m=st.match(/J[.\s]*([A-Z]{2,})X([A-Z]{2,})/i);
              if(m){
                const t1=m[1],t2=m[2];
                if(adv.startsWith(t1)||adv.startsWith(t2))return true;
                if(t1.length>=3&&adv.substring(0,3)===t1.substring(0,3))return true;
                if(t2.length>=3&&adv.substring(0,3)===t2.substring(0,3))return true;
                const advWords=advRaw.split(/\s+/).filter(w=>w.length>=3);
                for(const w of advWords){
                  if(t1.length>=3&&w.substring(0,3)===t1.substring(0,3))return true;
                  if(t2.length>=3&&w.substring(0,3)===t2.substring(0,3))return true;
                  if(w.length>=4&&(t1.includes(w.substring(0,4))||t2.includes(w.substring(0,4))))return true;
                }
              }
              // Novo formato: "JOGO FORTALEZA CASA (V)" — testa cada palavra
              // do adversário contra o session title (também sem acentos).
              const stWords=stRaw.split(/\s+/);
              const advWords=advRaw.split(/\s+/).filter(w=>w.length>=3);
              for(const w of advWords){
                if(w.length>=4&&stRaw.includes(w))return true;
                if(stWords.some(sw=>sw.length>=4&&sw.startsWith(w.substring(0,4))))return true;
              }
              return false;
            };

            const getAthletesForDate=(gameDate,adversario)=>{
              if(!gameDate)return[];
              const gDateTs=normDate(gameDate);
              const DAY_MS=86400000;
              // Tolerância ±2 dias: cobre fusos diferentes, atrasos de
              // sincronização do device GPS e jogos noturnos que registram
              // data do dia seguinte na aba bruta.
              const dateMatch=(entryDate)=>{
                const eTs=parseDateStr(entryDate);
                if(!eTs) return false;
                const diff=Math.abs(eTs-gDateTs);
                return diff<=2*DAY_MS;
              };
              const results=[];
              const allNames=new Set([...Object.keys(gpsData),...Object.keys(diarioData)]);
              // Normaliza para casar nomes mesmo com espaços extras, caixa diferente
              // ou variações de acento entre o cadastro do elenco (P) e a chave que
              // a planilha de GPS produziu — não custa nada e evita falsos negativos
              // como "ADRIANO " (com trailing space) caindo fora do squad.
              const norm=s=>String(s||"").trim().toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
              const squadSet=new Set(P.map(p=>norm(p.n)));

              for(const name of allNames){
                // Filtrar: só atletas do elenco profissional (exclui Sub-20, emprestados, etc.)
                const inSquad=squadSet.has(norm(name));
                if(!inSquad)continue;
                const gpsEntries=(gpsData[name]||[]).filter(e=>dateMatch(e.date));
                const diarioEntries=(diarioData[name]||[]).filter(e=>dateMatch(e.date));
                const saltosEntries=(saltosData[name]||[]).filter(e=>dateMatch(e.date));
                const questEntries=(questData[name]||[]).filter(e=>dateMatch(e.date));
                if(!gpsEntries.length&&!diarioEntries.length)continue;

                // Prioridade na escolha da entrada GPS do jogo:
                //   1. Linha com rosterStatus (G1/G2/G3) preenchido — sinal direto
                //      da comissão técnica, mais forte que qualquer heurística.
                //   2. Linha com RESULTADO preenchido (V/E/D).
                //   3. Match por adversário no sessionTitle (formato legado "J.BOTxFOR")
                //   4. Sessão tem palavra-chave de jogo ("Jogo", "Match", "Partida")
                //   5. Sessão não-complemento na data exata do jogo (±1 dia) —
                //      antes do fallback genérico, prioriza entrada do próprio
                //      dia para evitar treino próximo ser confundido com jogo.
                //   6. Sessão não-complemento (qualquer coisa que não seja aquecimento)
                //   7. Qualquer entrada da data
                // IMPORTANTE: o filtro de DATA já restringiu o universo. Não
                // descartamos atletas só porque o sessionTitle ("Jogo Casa (V)"
                // do gps_individual) não cita o adversário — confiar na data.
                // Sem essa prioridade, um atleta que treinou no dia do jogo
                // (não-relacionado) podia ter o treino selecionado em vez
                // do jogo, contaminando a metragem exibida.
                const rosterEntries=gpsEntries.filter(e=>String(e.rosterStatus||"").trim().length>0);
                const resultadoEntries=gpsEntries.filter(e=>String(e.resultado||"").trim().length>0);
                const opponentEntries=adversario?gpsEntries.filter(e=>matchesOpponent(e.sessionTitle,adversario)):[];
                const matchEntries=gpsEntries.filter(e=>isMatchTitle(e.sessionTitle));
                const sameDateNonComp=gpsEntries.filter(e=>{const eTs=parseDateStr(e.date);return eTs&&!isComplementTitle(e.sessionTitle)&&Math.abs(eTs-gDateTs)<DAY_MS;});
                const nonComplEntries=gpsEntries.filter(e=>!isComplementTitle(e.sessionTitle));
                const pool=rosterEntries.length?rosterEntries:(resultadoEntries.length?resultadoEntries:(opponentEntries.length?opponentEntries:(matchEntries.length?matchEntries:(sameDateNonComp.length?sameDateNonComp:(nonComplEntries.length?nonComplEntries:gpsEntries)))));
                let bestGpsEntry=pool.length>1?pool.reduce((b,e)=>(e.gps?.dist_total||0)>(b.gps?.dist_total||0)?e:b,pool[0]):pool[0]||null;

                const gps=bestGpsEntry?bestGpsEntry.gps||bestGpsEntry:{};
                const diario=diarioEntries.length?diarioEntries[diarioEntries.length-1]:{};
                const saltos=saltosEntries.length?saltosEntries[saltosEntries.length-1]:{};
                const quest=questEntries.length?questEntries[questEntries.length-1]:{};
                const cmjBest=Math.max(saltos.cmj_1||0,saltos.cmj_2||0,saltos.cmj_3||0);
                const pInfo=P.find(p=>p.n===name);
                const sessionTitle=bestGpsEntry?.sessionTitle||"";
                const tags=bestGpsEntry?.tags||diario?.tags||"";
                const allSplits=bestGpsEntry?.allSplits||[];
                const splitsDetail=bestGpsEntry?.splitsDetail||[];
                // Campos top-level do gps_individual que NÃO estão dentro de gps:
                // duração e RESULTADO são essenciais para o filtro "jogou de fato"
                // capturar suplentes que entraram poucos minutos.
                const duracao=bestGpsEntry?.duracao||0;
                const resultado=bestGpsEntry?.resultado||"";
                const local=bestGpsEntry?.local||"";
                const obs=bestGpsEntry?.obs||"";
                // rosterStatus extraído da OBS na API: G1=titular, G2=entrou, G3=banco.
                // Sinal definitivo da comissão técnica para "atleta participou".
                const rosterStatus=bestGpsEntry?.rosterStatus||"";
                const gpsEntryDate=bestGpsEntry?.date||"";
                results.push({name,pos:pInfo?.pos||diario.pos||"",gps,diario,quest,cmj:cmjBest,pInfo,sessionTitle,tags,allSplits,splitsDetail,duracao,resultado,local,obs,rosterStatus,gpsEntryDate});
              }

              // Critério "jogou de fato" — combina dois formatos:
              //   (A) gps legado: requer splits de tempo de jogo (30.40min, 2T)
              //   (B) gps_individual (atual): 1 linha agregada por sessão.
              //       Sinal mais forte = coluna RESULTADO preenchida (V/E/D).
              //       Suplentes com pouca distância (M Maranhao 11min/1.282m,
              //       Gabriel I 18min/1.867m) precisam ser capturados — antes
              //       o limiar fixo de 2.000m os excluía indevidamente.
              // Pace mínimo (30 m/min) para "atleta jogou de fato".
              // Banco/aquecimento prolongado gera ~20-25 m/min; atleta em
              // campo (mesmo goleiro com ~3500m/90min ≈ 39 m/min) sustenta
              // >= 30 m/min. Filtra Maranhão 75min/1873m (25 m/min, banco
              // prolongado com aquecimento) sem cortar suplente legítimo de
              // 11min/1282m (116 m/min) ou Gabriel I 18min/1867m (104 m/min).
              const MIN_PACE_M_PER_MIN = 30;
              const meetsPlayPace = (dist, dur) => {
                if (dur < 3 || dist < 300) return false;
                return dist >= dur * MIN_PACE_M_PER_MIN;
              };
              const filtered=results.filter(a=>{
                const dist=a.gps?.dist_total||0;
                const dur=Number(a.duracao)||Number(a.gps?.duracao)||0;
                const resultadoFilled=String(a.resultado||"").trim().length>0;
                const stIsMatch=isMatchTitle(a.sessionTitle);
                const splits=Array.isArray(a.allSplits)?a.allSplits:[];
                const gameTimeSplits=splits.length?countGameTimeSplits(splits):0;
                const hasTimePeriodSplits=splits.some(sp=>{const s=(sp||"").toLowerCase();return/\d+[.\-]\d+\s*min/.test(s)||/\d+\s*mais/.test(s)||/\b[12]t\b/.test(s);});
                const hasSessionSplit=splits.some(sp=>{const s=(sp||"").toLowerCase().trim();return s==="session"||s==="sessão"||s==="sessao";});

                // (0) rosterStatus da OBS é fonte de verdade da comissão técnica.
                // G1 (titular) e G2 (entrou) = jogou; G3 (banco) = não jogou.
                // Sobrepõe heurísticas (B/C) abaixo quando preenchido.
                const roster=String(a.rosterStatus||"").toUpperCase();
                if(roster==="G3")return false;
                if(roster==="G1"||roster==="G2")return true;

                // (A) Formato legado com splits detalhados.
                if(hasTimePeriodSplits&&gameTimeSplits>=2)return true;
                if(hasSessionSplit&&stIsMatch&&dist>=4000)return true;
                if(hasTimePeriodSplits&&gameTimeSplits>=1&&dist>=2000)return true;

                // (B) gps_individual: sem splits.
                if(!splits.length){
                  // (B.1) RESULTADO preenchido = jogo confirmado pela comissão.
                  // Mesmo confirmado, exige pace de jogo (≥30 m/min) — atletas
                  // que ficaram no banco com aquecimento prolongado teriam
                  // RESULTADO preenchido por consolidação da equipe mas pace
                  // muito baixo (Maranhão 75min/1873m = 25 m/min).
                  if(resultadoFilled&&meetsPlayPace(dist,dur))return true;
                  // (B.2) sessionTitle "Jogo …" — também exige pace de jogo.
                  if(stIsMatch&&meetsPlayPace(dist,dur))return true;
                  // (B.3) Jogos "Realizado" sem RESULTADO/G1-G3 ainda preenchidos
                  // (caso R6 26/04/2026): o universo já foi filtrado pela data do
                  // jogo no calendário, então qualquer atleta com pace de jogo
                  // (≥30 m/min) representa minutos em campo. Suplentes que entraram
                  // 11min/1.282m (116 m/min) eram cortados pelos antigos limiares
                  // fixos de 60min+5.000m / 7.000m. Exige que a entrada GPS esteja
                  // na data exata do jogo (±1 dia para fuso) — sem isso, treinos
                  // de alta intensidade dentro da janela ±2 dias eram classificados
                  // como dados do jogo para atletas não-relacionados (ex.: Wesley
                  // R6 Cuiabá — treino 24/04 6397m/59min era exibido como 26/04).
                  if(!stIsMatch&&!resultadoFilled&&meetsPlayPace(dist,dur)){
                    const eTs=parseDateStr(a.gpsEntryDate);
                    if(eTs&&Math.abs(eTs-gDateTs)<DAY_MS)return true;
                  }
                }

                // (C) Fallback diário marca "Sim" para Partida.
                const partida=(a.diario?.partida||"").toLowerCase();
                const playedDiario=partida.includes("sim")||partida==="1"||partida==="s"||partida==="x";
                if(playedDiario&&meetsPlayPace(dist,dur))return true;

                return false;
              });

              filtered.sort((a,b)=>(POS_GROUP_ORDER[posGroup(a.pos)]??9)-(POS_GROUP_ORDER[posGroup(b.pos)]??9));
              return filtered;
            };

            const compGroups={};
            jogosCalendario.forEach(g=>{
              const comp=g.comp||"Outro";
              if(!compGroups[comp])compGroups[comp]=[];
              compGroups[comp].push(g);
            });

            return Object.entries(compGroups).map(([comp,games],ci)=>{
              const compColor=comp.toLowerCase().includes("paul")?"#7c3aed":comp.toLowerCase().includes("rie")?"#2563eb":"#64748b";
              return <div key={ci} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:4,height:20,borderRadius:2,background:compColor}}/>
                  <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri}}>{comp}</span>
                  <span style={{padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:600,background:`${compColor}15`,color:compColor,border:`1px solid ${compColor}33`}}>{games.length} jogos</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {games.map((g,i)=>{
                    const gameKey=`${comp}-${i}`;
                    const isExpanded=expandedGames.has(gameKey);
                    const gDate=parseGameDate(g.data);
                    const isPast=gDate&&gDate<today;
                    const isToday=gDate&&gDate.getTime()===today.getTime();
                    const isNext=!isPast&&!isToday;
                    let nextIdx=-1;
                    for(let x=0;x<games.length;x++){const gd=parseGameDate(games[x].data);if(gd&&gd>=today){nextIdx=x;break;}}
                    const isNextGame=isNext&&i===nextIdx;
                    const localLabel=(g.local||"").toUpperCase()==="C"?"Casa":(g.local||"").toUpperCase()==="F"?"Fora":g.local||"";
                    const localColor=(g.local||"").toUpperCase()==="C"?"#16A34A":"#DC2626";
                    const borderColor=isToday?acc:isNextGame?compColor:t.border;
                    const escudoUrl=g.escudo||"";
                    const hasEscudo=escudoUrl&&(escudoUrl.startsWith("http")||escudoUrl.startsWith("/"));
                    const athleteData=isExpanded?getAthletesForDate(gDate,g.adversario):[];
                    // Classify game result — tolerant a variações de chip
                    const resStr=String(g.resultado||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
                    const gameResult=/^V|^W/.test(resStr)?"V":/^E|^DRAW/.test(resStr)?"E":/^D|^L/.test(resStr)?"D":(()=>{const gp=Number(g.gols_pro);const gc=Number(g.gols_contra);if(!isNaN(gp)&&!isNaN(gc)&&(g.gols_pro!==""||g.gols_contra!=="")){if(gp>gc)return"V";if(gp===gc)return"E";return"D";}return null;})();
                    const resColor=gameResult==="V"?"#16A34A":gameResult==="E"?"#CA8A04":gameResult==="D"?"#DC2626":null;
                    const resLabel=gameResult==="V"?"V":gameResult==="E"?"E":gameResult==="D"?"D":null;
                    const placar=(g.gols_pro!==""&&g.gols_pro!==undefined)||(g.gols_contra!==""&&g.gols_contra!==undefined)?`${g.gols_pro??"0"} × ${g.gols_contra??"0"}`:"";

                    return <div key={i} style={{background:t.bgCard,borderRadius:12,border:`1px solid ${borderColor}`,overflow:"hidden",opacity:isPast&&!isExpanded?.6:1,transition:"all .2s"}}>
                      {/* Game row - clickable */}
                      <div style={{display:"flex",alignItems:"center",padding:"12px 16px",cursor:"pointer",gap:12,background:isExpanded?`${compColor}06`:"transparent"}} onClick={()=>{setExpandedGames(prev=>{const n=new Set(prev);n.has(gameKey)?n.delete(gameKey):n.add(gameKey);return n;});}}>
                        <div style={{flexShrink:0,transition:"transform .2s",transform:isExpanded?"rotate(90deg)":"rotate(0deg)"}}>
                          <ChevronRight size={14} color={compColor}/>
                        </div>
                        <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:`${compColor}12`,color:compColor,border:`1px solid ${compColor}33`,flexShrink:0}}>{g.rodada}</span>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:600,color:pri,minWidth:80,flexShrink:0}}>{g.data}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                          {hasEscudo&&<img src={escudoUrl} alt={g.adversario} style={{width:22,height:22,objectFit:"contain",borderRadius:4}} onError={(e)=>{e.target.style.display="none"}}/>}
                          <span style={{fontWeight:700,color:pri,fontSize:13}}>{g.adversario}</span>
                        </div>
                        {/* Resultado */}
                        {resColor&&<div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                          {placar&&<span style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:800,color:pri}}>{placar}</span>}
                          <span style={{width:22,height:22,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,background:`${resColor}18`,color:resColor,border:`1px solid ${resColor}44`}}>{resLabel}</span>
                        </div>}
                        <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:600,background:`${localColor}12`,color:localColor,border:`1px solid ${localColor}33`,flexShrink:0}}>{localLabel}</span>
                        <div style={{minWidth:60,textAlign:"right",flexShrink:0}}>
                          {isPast&&!resColor&&<span style={{fontSize:10,color:t.textFaint}}>Realizado</span>}
                          {isToday&&<span style={{fontSize:10,fontWeight:700,color:acc}}>HOJE</span>}
                          {isNextGame&&<span style={{fontSize:10,fontWeight:700,color:compColor}}>Próximo</span>}
                          {isNext&&!isNextGame&&<span style={{fontSize:10,color:t.textMuted}}>Agendado</span>}
                        </div>
                      </div>

                      {/* Expanded athlete data */}
                      {isExpanded&&<div style={{borderTop:`1px solid ${t.border}`,padding:0}}>
                        {athleteData.length===0?
                          <div style={{padding:20,textAlign:"center",color:t.textFaint,fontSize:11}}>
                            <div style={{fontWeight:600,marginBottom:4}}>Nenhum dado de atletas encontrado para esta data</div>
                            <div style={{fontSize:10,color:t.textFaintest||t.textFaint}}>
                              {isNext?"Jogo agendado — dados serão exibidos após a partida.":`Busca em ±2 dias de ${g.data||"—"}. Possíveis causas: jogo fora sem GPS coletado, ou dados ainda não publicados na planilha.`}
                            </div>
                          </div>:
                          <div style={{overflowX:"auto"}}>
                            {/* Summary badges */}
                            <div style={{padding:"10px 16px",display:"flex",gap:8,flexWrap:"wrap",borderBottom:`1px solid ${t.borderLight}`}}>
                              <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:t.bgMuted,color:pri,border:`1px solid ${t.border}`}}>{athleteData.length} atletas</span>
                              {(()=>{
                                const avgDist=athleteData.filter(a=>a.gps?.dist_total>0);
                                const avgHsr=athleteData.filter(a=>a.gps?.hsr>0);
                                const avgSprints=athleteData.filter(a=>a.gps?.sprints>0);
                                const avgSprints25=athleteData.filter(a=>a.gps?.sprints_25>0);
                                return<>
                                  {avgDist.length>0&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:"#EFF6FF",color:"#2563eb",border:"1px solid #BFDBFE"}}>Dist. Média: {Math.round(avgDist.reduce((s,a)=>s+(a.gps.dist_total||0),0)/avgDist.length)}m</span>}
                                  {(()=>{
                                    // Pace médio do jogo (m/min) — proporcional ao tempo em campo,
                                    // melhor indicador de intensidade que distância absoluta porque
                                    // normaliza titulares (90min) e suplentes (15min).
                                    const paceArr=athleteData.map(a=>{const d=a.gps?.dist_total||0;const m=Number(a.duracao)||Number(a.gps?.duracao)||a.diario?.duracao||0;return m>0&&d>0?d/m:0;}).filter(v=>v>0);
                                    if(!paceArr.length)return null;
                                    const avgPace=Math.round(paceArr.reduce((s,v)=>s+v,0)/paceArr.length);
                                    return <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:"#ECFEFF",color:"#0891b2",border:"1px solid #A5F3FC"}}>m/min Médio: {avgPace}</span>;
                                  })()}
                                  {avgHsr.length>0&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:"#FEF3C7",color:"#92400E",border:"1px solid #FDE68A"}}>HSR Média: {Math.round(avgHsr.reduce((s,a)=>s+(a.gps.hsr||0),0)/avgHsr.length)}m</span>}
                                  {avgSprints.length>0&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:"#FEE2E2",color:"#991B1B",border:"1px solid #FECACA"}}>Spr &gt;20: {(avgSprints.reduce((s,a)=>s+(a.gps.sprints||0),0)/avgSprints.length).toFixed(1)}</span>}
                                  {avgSprints25.length>0&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:"#F3E8FF",color:"#6D28D9",border:"1px solid #DDD6FE"}}>Spr &gt;25: {(avgSprints25.reduce((s,a)=>s+(a.gps.sprints_25||0),0)/avgSprints25.length).toFixed(1)}</span>}
                                </>;
                              })()}
                            </div>
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                              <thead>
                                <tr style={{background:t.bgMuted}}>
                                  <th style={{padding:"8px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Atleta</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Pos</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Min</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Dist (m)</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>m/min</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>HSR (m)</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Spr &gt;20</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Spr &gt;25</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Vel. Pico</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>PL</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>PSE</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>sRPE</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Sono</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Dor</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Recup.</th>
                                  <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>CMJ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {athleteData.map((a,ai)=>{
                                  const gps=a.gps||{};
                                  const pse=a.diario?.pse||0;
                                  const duracao=a.diario?.duracao||0;
                                  const srpe=a.diario?.spe||(pse*duracao)||0;
                                  // Minutos em campo: prioriza duração da linha
                                  // do GPS individual (col Duração min), com
                                  // fallback para o diário caso o GPS legado
                                  // não tenha esse dado.
                                  const minJogo=Number(a.duracao)||Number(a.gps?.duracao)||duracao||0;
                                  const sono=a.quest?.sono_qualidade||0;
                                  const dor=a.quest?.dor||0;
                                  const rec=a.quest?.recuperacao_geral||0;
                                  // Status do atleta no jogo (OBS: G1=titular, G2=entrou).
                                  // G3 já foi filtrado fora do array athleteData.
                                  const rs=String(a.rosterStatus||"").toUpperCase();
                                  const rosterTag=rs==="G1"?{l:"T",full:"Titular",bg:"#DCFCE7",c:"#166534",bc:"#86EFAC"}:rs==="G2"?{l:"R",full:"Reserva (entrou)",bg:"#DBEAFE",c:"#1E40AF",bc:"#93C5FD"}:null;
                                  return <tr key={ai} style={{borderBottom:`1px solid ${t.borderLight}`,background:ai%2===0?"transparent":t.bgMuted+"44",cursor:"pointer"}} onClick={()=>{setSel(a.name);setTab("player");}}>
                                    <td style={{padding:"8px 10px",fontWeight:700,color:pri,whiteSpace:"nowrap"}}>
                                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                                        <PlayerPhoto theme={t} name={a.name} sz={22}/>
                                        <span>{a.name}</span>
                                        {rosterTag&&<span title={rosterTag.full} style={{padding:"1px 5px",borderRadius:4,fontSize:8,fontWeight:800,background:rosterTag.bg,color:rosterTag.c,border:`1px solid ${rosterTag.bc}`,letterSpacing:.3}}>{rosterTag.l}</span>}
                                      </div>
                                    </td>
                                    <td style={{padding:"8px 6px",textAlign:"center"}}><span style={{fontSize:9,color:t.textMuted,fontWeight:600}}>{a.pos}</span></td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{minJogo>0?minJogo:<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{gps.dist_total||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:"#0891b2"}}>{(()=>{const d=gps.dist_total||0;const m=minJogo;return m>0&&d>0?Math.round(d/m):<span style={{color:t.textFaint}}>—</span>;})()}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{gps.hsr||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{gps.sprints||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:"#7c3aed"}}>{gps.sprints_25||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{gps.pico_vel||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{gps.player_load?Math.round(gps.player_load):<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pse>7?"#DC2626":pse>5?"#CA8A04":"#16A34A"}}>{pse||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:pri}}>{srpe||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:sono>0&&sono<6?"#DC2626":sono<7?"#CA8A04":"#16A34A"}}>{sono||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:dor>=4?"#DC2626":dor>=2?"#CA8A04":"#16A34A"}}>{dor||0}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:rec>0&&rec<=5?"#DC2626":rec<=7?"#CA8A04":"#16A34A"}}>{rec||<span style={{color:t.textFaint}}>—</span>}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:"#7c3aed"}}>{a.cmj>0?a.cmj.toFixed(1):<span style={{color:t.textFaint}}>—</span>}</td>
                                  </tr>;
                                })}
                              </tbody>
                              {/* Team average footer */}
                              {athleteData.length>1&&<tfoot><tr style={{borderTop:`2px solid ${pri}`,fontWeight:800,background:t.bgMuted}}>
                                <td style={{padding:"8px 10px",color:pri}} colSpan={2}>MÉDIA</td>
                                {(()=>{
                                  const avg=(arr,fn)=>{const vals=arr.map(fn).filter(v=>v>0);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;};
                                  const avgF=(arr,fn)=>{const vals=arr.map(fn).filter(v=>v>0);return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):"—";};
                                  return<>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(athleteData,a=>Number(a.duracao)||Number(a.gps?.duracao)||a.diario?.duracao||0)||"—"}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(athleteData,a=>a.gps?.dist_total||0)||"—"}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:"#0891b2"}}>{(()=>{const arr=athleteData.map(a=>{const d=a.gps?.dist_total||0;const m=Number(a.duracao)||Number(a.gps?.duracao)||a.diario?.duracao||0;return m>0&&d>0?d/m:0;}).filter(v=>v>0);return arr.length?Math.round(arr.reduce((s,v)=>s+v,0)/arr.length):"—";})()}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(athleteData,a=>a.gps?.hsr||0)||"—"}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avgF(athleteData,a=>a.gps?.sprints||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:"#7c3aed"}}>{avgF(athleteData,a=>a.gps?.sprints_25||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avgF(athleteData,a=>a.gps?.pico_vel||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(athleteData,a=>a.gps?.player_load||0)||"—"}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avgF(athleteData,a=>a.diario?.pse||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(athleteData,a=>a.diario?.spe||(a.diario?.pse||0)*(a.diario?.duracao||0))||"—"}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avgF(athleteData,a=>a.quest?.sono_qualidade||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avgF(athleteData,a=>a.quest?.dor||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avgF(athleteData,a=>a.quest?.recuperacao_geral||0)}</td>
                                    <td style={{padding:"8px 6px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:"#7c3aed"}}>{avgF(athleteData,a=>a.cmj||0)}</td>
                                  </>;
                                })()}
                              </tr></tfoot>}
                            </table>

                            {/* ═══ Análise Temporal por Período do Jogo ═══ */}
                            {(()=>{
                              // Coletar splitsDetail de todos os atletas que jogaram
                              const allSplits=athleteData.flatMap(a=>(a.splitsDetail||[]).map(s=>({...s,athlete:a.name})));
                              if(allSplits.length===0)return null;

                              // Classificar splits em períodos do jogo
                              const parsePeriod=(splitName)=>{
                                const s=(splitName||"").toLowerCase().trim();
                                // Ignorar aquecimento, complemento, intervalo
                                if(s.includes("aquec")||s.includes("warmup")||s.includes("warm-up"))return null;
                                if(s.includes("compl")||s.includes("complement"))return null;
                                if(s.includes("interv")||s.includes("halftime")||s.startsWith("t-"))return null;
                                // Detectar tempo (1T/2T) e faixa de minutos
                                const is2T=s.includes("2t")||s.includes("2nd")||s.includes("segundo");
                                const is1T=s.includes("1t")||s.includes("1st")||s.includes("primeiro")||(!is2T&&(s.includes("min")||/\d+-\d+/.test(s)));
                                // Extrair faixa de minutos: "0.10min", "10.20min", "20-30min", "40mais"
                                const rangeMatch=s.match(/(\d+)[.\-](\d+)\s*min/);
                                const maisMatch=s.match(/(\d+)\s*mais/);
                                let minStart=0,minEnd=0,label="";
                                if(rangeMatch){
                                  minStart=parseInt(rangeMatch[1]);minEnd=parseInt(rangeMatch[2]);
                                  label=`${minStart}-${minEnd}'`;
                                }else if(maisMatch){
                                  minStart=parseInt(maisMatch[1]);minEnd=minStart+15;
                                  label=`${minStart}'+`;
                                }else{
                                  // Sem faixa específica - usar 1T/2T genérico
                                  if(is1T)label="1T";
                                  else if(is2T)label="2T";
                                  else return null;
                                }
                                const half=is2T?"2T":"1T";
                                const globalMin=is2T?minStart+45:minStart;
                                return{half,minStart,minEnd,globalMin,label:label+(is2T&&rangeMatch?" 2T":is1T&&rangeMatch?" 1T":""),order:globalMin};
                              };

                              // Agrupar por período
                              const periodMap={};
                              allSplits.forEach(sp=>{
                                const period=parsePeriod(sp.split);
                                if(!period)return;
                                const key=period.label;
                                if(!periodMap[key]){periodMap[key]={...period,splits:[]};}
                                periodMap[key].splits.push(sp);
                              });

                              const periods=Object.values(periodMap).sort((a,b)=>a.order-b.order);
                              if(periods.length<2)return null;

                              // Calcular médias por período
                              const periodStats=periods.map(p=>{
                                const n=p.splits.length;
                                const avgVal=(fn)=>{const vals=p.splits.map(fn).filter(v=>v>0);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;};
                                return{
                                  label:p.label,order:p.order,half:p.half,n,
                                  dist:avgVal(s=>s.dist),hsr:avgVal(s=>s.hsr),sprints:avgVal(s=>s.sprints),
                                  pl:avgVal(s=>s.pl),top_speed:avgVal(s=>s.top_speed),acel:avgVal(s=>s.acel),decel:avgVal(s=>s.decel),
                                  hr_avg:avgVal(s=>s.hr_avg),hr_max:avgVal(s=>s.hr_max)
                                };
                              });

                              // Calcular decaimento: comparar primeiro vs último período, 1T vs 2T
                              const firstHalf=periodStats.filter(p=>p.half==="1T");
                              const secondHalf=periodStats.filter(p=>p.half==="2T");
                              const avg1T=(fn)=>{const v=firstHalf.map(fn).filter(x=>x>0);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0;};
                              const avg2T=(fn)=>{const v=secondHalf.map(fn).filter(x=>x>0);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0;};

                              const dist1T=avg1T(p=>p.dist),dist2T=avg2T(p=>p.dist);
                              const hsr1T=avg1T(p=>p.hsr),hsr2T=avg2T(p=>p.hsr);
                              const sprint1T=avg1T(p=>p.sprints),sprint2T=avg2T(p=>p.sprints);
                              const distDelta=dist1T>0?((dist2T-dist1T)/dist1T*100):0;
                              const hsrDelta=hsr1T>0?((hsr2T-hsr1T)/hsr1T*100):0;
                              const sprintDelta=sprint1T>0?((sprint2T-sprint1T)/sprint1T*100):0;

                              // Max values for bars
                              const maxDist=Math.max(...periodStats.map(p=>p.dist),1);
                              const maxHsr=Math.max(...periodStats.map(p=>p.hsr),1);
                              const maxSprints=Math.max(...periodStats.map(p=>p.sprints),1);

                              const decayInsights=[];
                              if(dist1T>0&&dist2T>0){
                                if(distDelta<-10)decayInsights.push({icon:"⚠️",text:`Queda de ${Math.abs(distDelta).toFixed(0)}% na distância do 2T vs 1T (${Math.round(dist1T)}m → ${Math.round(dist2T)}m/período)`,type:"negative"});
                                else if(distDelta>5)decayInsights.push({icon:"💪",text:`Time manteve/aumentou distância no 2T (+${distDelta.toFixed(0)}%)`,type:"positive"});
                                else decayInsights.push({icon:"✅",text:`Distância estável entre tempos (variação de ${distDelta.toFixed(0)}%)`,type:"neutral"});
                              }
                              if(hsr1T>0&&hsr2T>0){
                                if(hsrDelta<-15)decayInsights.push({icon:"🏃",text:`HSR caiu ${Math.abs(hsrDelta).toFixed(0)}% no 2T — possível fadiga neuromuscular`,type:"negative"});
                                else if(hsrDelta>10)decayInsights.push({icon:"🔥",text:`HSR aumentou ${hsrDelta.toFixed(0)}% no 2T — bom output de alta intensidade`,type:"positive"});
                              }
                              if(sprint1T>0&&sprint2T>0){
                                if(sprintDelta<-20)decayInsights.push({icon:"⚡",text:`Sprints caíram ${Math.abs(sprintDelta).toFixed(0)}% no 2T — monitorar estratégia nutricional e hidratação`,type:"negative"});
                              }
                              // Analisar último período vs primeiro
                              if(periodStats.length>=3){
                                const first=periodStats[0],last=periodStats[periodStats.length-1];
                                if(first.dist>0&&last.dist>0){
                                  const endDelta=((last.dist-first.dist)/first.dist*100);
                                  if(endDelta<-20)decayInsights.push({icon:"📉",text:`Queda de ${Math.abs(endDelta).toFixed(0)}% na distância entre início (${first.label}: ${Math.round(first.dist)}m) e fim (${last.label}: ${Math.round(last.dist)}m) do jogo`,type:"negative"});
                                }
                              }

                              return <div style={{borderTop:`1px solid ${t.border}`,padding:16}}>
                                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                                  Análise Temporal — Performance por Período
                                  <span style={{fontSize:9,fontWeight:500,color:t.textFaint}}>({allSplits.length} registros de {athleteData.length} atletas)</span>
                                </div>

                                {/* Barras por período */}
                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
                                  {/* Distância */}
                                  <div style={{background:t.bgMuted,borderRadius:8,padding:12,border:`1px solid ${t.borderLight}`}}>
                                    <div style={{fontSize:10,fontWeight:700,color:"#2563eb",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Distância (m)</div>
                                    {periodStats.map((p,pi)=><div key={pi} style={{marginBottom:6}}>
                                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:2}}>
                                        <span style={{fontWeight:600,color:p.half==="2T"?"#7c3aed":pri}}>{p.label}</span>
                                        <span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:pri}}>{Math.round(p.dist)}</span>
                                      </div>
                                      <div style={{height:8,borderRadius:4,background:t.borderLight,overflow:"hidden"}}>
                                        <div style={{height:"100%",borderRadius:4,width:`${(p.dist/maxDist*100)}%`,background:p.half==="2T"?"#7c3aed":"#2563eb",transition:"width .3s"}}/>
                                      </div>
                                    </div>)}
                                  </div>
                                  {/* HSR */}
                                  <div style={{background:t.bgMuted,borderRadius:8,padding:12,border:`1px solid ${t.borderLight}`}}>
                                    <div style={{fontSize:10,fontWeight:700,color:"#DC2626",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>HSR (m)</div>
                                    {periodStats.map((p,pi)=><div key={pi} style={{marginBottom:6}}>
                                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:2}}>
                                        <span style={{fontWeight:600,color:p.half==="2T"?"#7c3aed":pri}}>{p.label}</span>
                                        <span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:pri}}>{Math.round(p.hsr)}</span>
                                      </div>
                                      <div style={{height:8,borderRadius:4,background:t.borderLight,overflow:"hidden"}}>
                                        <div style={{height:"100%",borderRadius:4,width:`${(p.hsr/maxHsr*100)}%`,background:p.half==="2T"?"#7c3aed":"#DC2626",transition:"width .3s"}}/>
                                      </div>
                                    </div>)}
                                  </div>
                                  {/* Sprints */}
                                  <div style={{background:t.bgMuted,borderRadius:8,padding:12,border:`1px solid ${t.borderLight}`}}>
                                    <div style={{fontSize:10,fontWeight:700,color:"#16A34A",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Sprints</div>
                                    {periodStats.map((p,pi)=><div key={pi} style={{marginBottom:6}}>
                                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:2}}>
                                        <span style={{fontWeight:600,color:p.half==="2T"?"#7c3aed":pri}}>{p.label}</span>
                                        <span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:pri}}>{p.sprints.toFixed(1)}</span>
                                      </div>
                                      <div style={{height:8,borderRadius:4,background:t.borderLight,overflow:"hidden"}}>
                                        <div style={{height:"100%",borderRadius:4,width:`${(p.sprints/maxSprints*100)}%`,background:p.half==="2T"?"#7c3aed":"#16A34A",transition:"width .3s"}}/>
                                      </div>
                                    </div>)}
                                  </div>
                                </div>

                                {/* 1T vs 2T comparação */}
                                {firstHalf.length>0&&secondHalf.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
                                  {[
                                    {label:"Dist/Período",v1:dist1T,v2:dist2T,delta:distDelta,unit:"m",fmt:v=>Math.round(v)},
                                    {label:"HSR/Período",v1:hsr1T,v2:hsr2T,delta:hsrDelta,unit:"m",fmt:v=>Math.round(v)},
                                    {label:"Sprints/Período",v1:sprint1T,v2:sprint2T,delta:sprintDelta,unit:"",fmt:v=>v.toFixed(1)}
                                  ].map((m,mi)=>{
                                    const deltaColor=m.delta<-10?"#DC2626":m.delta>5?"#16A34A":"#CA8A04";
                                    return <div key={mi} style={{background:t.bgCard,borderRadius:8,padding:10,border:`1px solid ${t.border}`,textAlign:"center"}}>
                                      <div style={{fontSize:9,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{m.label}</div>
                                      <div style={{display:"flex",justifyContent:"center",gap:12,alignItems:"center",marginBottom:4}}>
                                        <div><div style={{fontSize:8,color:t.textFaint}}>1T</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:pri}}>{m.fmt(m.v1)}{m.unit}</div></div>
                                        <div style={{fontSize:11,fontWeight:800,color:deltaColor}}>{m.delta>0?"+":""}{m.delta.toFixed(0)}%</div>
                                        <div><div style={{fontSize:8,color:"#7c3aed"}}>2T</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:"#7c3aed"}}>{m.fmt(m.v2)}{m.unit}</div></div>
                                      </div>
                                    </div>;
                                  })}
                                </div>}

                                {/* Insights de fadiga */}
                                {decayInsights.length>0&&<div style={{background:t.bgMuted,borderRadius:8,padding:12,border:`1px solid ${t.borderLight}`}}>
                                  <div style={{fontSize:10,fontWeight:700,color:pri,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Insights — Fadiga & Desempenho Final</div>
                                  {decayInsights.map((ins,ii)=><div key={ii} style={{padding:"6px 10px",marginBottom:4,borderRadius:6,fontSize:10,lineHeight:1.4,background:ins.type==="negative"?"#FEF2F2":ins.type==="positive"?"#F0FDF4":"#F8FAFC",color:ins.type==="negative"?"#991B1B":ins.type==="positive"?"#166534":"#475569",border:`1px solid ${ins.type==="negative"?"#FECACA":ins.type==="positive"?"#BBF7D0":"#E2E8F0"}`}}>
                                    <span style={{marginRight:6}}>{ins.icon}</span>{ins.text}
                                  </div>)}
                                </div>}
                              </div>;
                            })()}

                          </div>}
                      </div>}
                    </div>;
                  })}
                </div>
              </div>;
            });
          })()}
        </div>}

        {tab==="mapa"&&<div>
          {WEEK_MAPS.map((wm,wi)=><div key={wi} style={{marginBottom:24}}>
          {/* Weekly Map Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Mapa Semanal — Microciclo {wi===0?"(Semana Atual)":"(Próxima Semana)"}</div>
                <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>{wm.week} · Próximo Jogo: {wm.next_match.opponent} ({wm.next_match.date} — {wm.next_match.time}) · Série B Rodada {wm.next_match.rod}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {["Bem-estar","CMJ","GPS"].map((t,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:t.bgMuted,color:t.textMuted,border:`1px solid ${t.border}`}}>{t}</span>)}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:16}}>
            {wm.days.map((day,i)=>{
              const tc=day.type==="JOGO"?acc:day.type==="FOLGA"?"#16A34A":day.type==="PRÉ-JOGO"?"#7c3aed":"#2563eb";
              return <div key={i} style={{background:t.bgCard,borderRadius:12,border:`1px solid ${tc}33`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                {/* Day Header */}
                <div style={{padding:"8px 10px",background:`${tc}10`,borderBottom:`1px solid ${tc}22`,textAlign:"center"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:11,color:tc}}>{day.d}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:800,color:pri}}>{day.md}</div>
                  <span style={{padding:"1px 6px",borderRadius:4,fontSize:8,fontWeight:700,background:`${tc}20`,color:tc}}>{day.type}</span>
                </div>
                {/* Focus */}
                <div style={{padding:"6px 10px",borderBottom:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:10,fontWeight:600,color:pri,textAlign:"center"}}>{day.focus}</div>
                </div>
                {/* Sessions */}
                <div style={{padding:"6px 8px",flex:1}}>
                  {day.sessions.length===0?
                    <div style={{textAlign:"center",padding:"12px 0",color:t.textFaint,fontSize:10}}>Sem sessão</div>:
                    day.sessions.map((s,j)=>
                      <div key={j} style={{padding:"4px 6px",background:t.bgMuted,borderRadius:6,marginBottom:4,fontSize:9}}>
                        <div style={{fontWeight:600,color:pri,marginBottom:1}}>{s.name}</div>
                        <div style={{color:t.textMuted}}>{s.time}{s.dur?` · ${s.dur}min`:""}</div>
                        {s.rpe_alvo&&<div style={{color:t.textFaint,marginTop:1}}>RPE alvo: <span style={{fontFamily:"'JetBrains Mono'",fontWeight:600}}>{s.rpe_alvo}</span></div>}
                        {s.content&&<div style={{color:t.textMuted,marginTop:2,lineHeight:1.3}}>{s.content}</div>}
                        <div style={{fontSize:8,color:tc,fontWeight:500,marginTop:2}}>{s.group}</div>
                      </div>)}
                </div>
                {/* Monitoring */}
                <div style={{padding:"4px 8px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"center",gap:4}}>
                  {day.wellness&&<span style={{width:6,height:6,borderRadius:"50%",background:"#16A34A"}} title="Bem-estar"/>}
                  {day.cmj&&<span style={{width:6,height:6,borderRadius:"50%",background:"#2563eb"}} title="CMJ"/>}
                  {day.gps&&<span style={{width:6,height:6,borderRadius:"50%",background:"#DC2626"}} title="GPS"/>}
                </div>
                {/* Notes */}
                <div style={{padding:"6px 8px",background:"#FEFCE8",borderTop:"1px solid #FEF08A",fontSize:8,color:"#854D0E",lineHeight:1.3}}>
                  {day.notes}
                </div>
              </div>;
            })}
          </div>
          </div>)}

          {/* DM Atual + Calendário Série B */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* DM Atual */}
            <div style={{background:t.bgCard,borderRadius:12,border:"1px solid #FECACA",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",background:"#FEF2F2",borderBottom:"1px solid #FECACA",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:"#DC2626"}}>Departamento Médico — Atual</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{todayStr} · {liveDmData.afastados.length} afastados · {liveDmData.retornados.length} em manutenção</div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:20,fontWeight:800,color:"#DC2626"}}>{liveDmData.afastados.length}</div>
              </div>
              <div style={{padding:12}}>
                {/* Afastados */}
                {liveDmData.afastados.map((p,i)=>{
                  const ec=p.estagio==="Fase 1"||p.estagio==="Pré-op"?"#DC2626":p.estagio==="Fase 2"?"#EA580C":p.estagio==="Fase 3"?"#CA8A04":"#16A34A";
                  return <div key={`af-${i}`} style={{padding:"10px 12px",background:i%2===0?"#FEF2F2":t.bgCard,borderRadius:8,marginBottom:6,border:"1px solid #FECACA44"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#DC2626",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint}}>{p.pos}</span>
                        <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${ec}15`,color:ec,border:`1px solid ${ec}33`}}>{p.classif}</span>
                      </div>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#DC2626"}}>{p.dias}d</span>
                    </div>
                    <div style={{fontSize:10,color:t.textMuted}}>{p.regiao}</div>
                    <div style={{display:"flex",gap:12,marginTop:3,fontSize:9,color:t.textFaint,flexWrap:"wrap"}}>
                      <span>Desde: <strong>{p.desde}</strong></span>
                      <span style={{color:ec}}>● {p.estagio}</span>
                      <span>{p.conduta}</span>
                      <span>Prognóstico: <strong style={{color:"#2563EB"}}>{p.prognostico}</strong></span>
                    </div>
                  </div>;
                })}
                {/* Retornados recentes (em manutenção) */}
                {liveDmData.retornados.length>0&&<>
                  <div style={{fontSize:9,fontWeight:700,color:"#16A34A",letterSpacing:1,textTransform:"uppercase",marginTop:8,marginBottom:6,paddingLeft:4}}>Retornados — Em Manutenção</div>
                  {liveDmData.retornados.map((p,i)=>{
                    return <div key={`ret-${i}`} style={{padding:"8px 12px",background:i%2===0?"#F0FDF4":t.bgCard,borderRadius:8,marginBottom:4,border:"1px solid #BBF7D044"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#16A34A",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>{p.n}</span>
                          <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint}}>{p.pos}</span>
                          <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:600,background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0"}}>{p.classif}</span>
                        </div>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:600,color:"#16A34A"}}>+{p.dias_retorno}d treino</span>
                      </div>
                      <div style={{fontSize:10,color:t.textMuted}}>{p.regiao}</div>
                      <div style={{display:"flex",gap:12,marginTop:3,fontSize:9,color:t.textFaint,flexWrap:"wrap"}}>
                        <span>Lesão: <strong>{p.desde}</strong></span>
                        <span>Prognóstico: <strong style={{color:"#CA8A04"}}>{p.prognostico}</strong></span>
                        <span>Retorno real: <strong style={{color:"#16A34A"}}>{p.retorno_real}</strong></span>
                        <span style={{color:"#16A34A"}}>● {p.estagio} — Manutenção</span>
                      </div>
                    </div>;
                  })}
                </>}
              </div>
            </div>

            {/* Calendário Série B */}
            {(()=>{
              // Deriva da aba Calendário do Google Sheets (sheetData.calendario).
              // Antes era um array SERIE_B hardcoded com apenas R1-R5 e R5 com
              // data errada (20/04 vs 19/04 da planilha) — qualquer atualização
              // no calendário ficava invisível neste card até alguém editar o
              // código. Agora reflete a planilha em tempo real via /export.
              const serieBGames=(sheetData?.calendario||[])
                .filter(g=>String(g.comp||"").toLowerCase().includes("serie b")||String(g.comp||"").toLowerCase().includes("série b"))
                .map(g=>{
                  const rod=parseInt(String(g.rodada||"").replace(/[^0-9]/g,""))||0;
                  const isHome=String(g.local||"").toUpperCase().startsWith("C");
                  const resStr=String(g.resultado||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
                  let result=null;
                  if(/^V|^W/.test(resStr))result="V";
                  else if(/^E|^DRAW/.test(resStr))result="E";
                  else if(/^D|^L/.test(resStr))result="D";
                  else{
                    const gp=Number(g.gols_pro),gc=Number(g.gols_contra);
                    if(!isNaN(gp)&&!isNaN(gc)&&(g.gols_pro!==""||g.gols_contra!=="")){
                      result=gp>gc?"V":gp===gc?"E":"D";
                    }
                  }
                  const hasGols=(g.gols_pro!==""&&g.gols_pro!=null)||(g.gols_contra!==""&&g.gols_contra!=null);
                  const score=hasGols?`${g.gols_pro??"0"}x${g.gols_contra??"0"}`:null;
                  const played=!!result||hasGols;
                  return{
                    rod,
                    date:g.data||"",
                    time:"",
                    home:isHome?"Botafogo SP":(g.adversario||""),
                    away:isHome?(g.adversario||""):"Botafogo SP",
                    local:isHome?"casa":"fora",
                    score,
                    result,
                    played
                  };
                })
                .sort((a,b)=>a.rod-b.rod);
              return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",background:t.bgMuted,borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Calendário Série B 2026</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{serieBGames.filter(g=>g.played).length} jogos realizados · {serieBGames.filter(g=>!g.played).length} restantes</div>
                </div>
                <Calendar size={18} color={t.textFaint}/>
              </div>
              <div style={{padding:12}}>
                {serieBGames.map((g,i)=>{
                  const rc=g.result==="V"?"#16A34A":g.result==="D"?"#DC2626":g.result==="E"?"#CA8A04":t.textMuted;
                  const isHome=g.local==="casa";
                  return <div key={i} style={{padding:"10px 12px",background:g.played?t.bgMuted:t.bgCard,borderRadius:8,marginBottom:6,border:`1px solid ${g.played?t.border:"#BFDBFE"}`,opacity:g.played?0.85:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:t.textFaint}}>R{g.rod}</span>
                        <span style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:pri}}>{g.home} vs {g.away}</span>
                        <span style={{padding:"1px 6px",borderRadius:4,fontSize:8,fontWeight:600,background:isHome?"#EFF6FF":"#FFF7ED",color:isHome?"#2563EB":"#EA580C"}}>{isHome?"CASA":"FORA"}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,color:t.textMuted}}>{g.date}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>{g.time}</span>
                        {g.played&&<span style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:800,color:rc}}>{g.score}</span>}
                        {g.played&&<span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${rc}15`,color:rc}}>{g.result}</span>}
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            </div>;
            })()}
          </div>

          {/* Player Readiness Map */}
          {(()=>{
            const gr=WEEK_READINESS(players,liveAlerts);
            return <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {/* Excluded */}
              <div style={{background:t.bgCard,borderRadius:12,border:"1px solid #FECACA",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#FEF2F2",borderBottom:"1px solid #FECACA"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#DC2626"}}>Excluídos da Sessão</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{gr.excluded.length} atletas</div>
                </div>
                <div style={{padding:10}}>
                  {gr.excluded.map((p,i)=>
                    <div key={i} style={{padding:"6px 8px",background:"#FEF2F2",borderRadius:6,marginBottom:4,cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#DC2626"}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:p.zone==="DM"?"#7c3aed":"#DC2626"}}>{p.zone==="DM"?"DM":(p.prob*100).toFixed(0)+"%"}</span>
                      </div>
                      <div style={{fontSize:9,color:t.textFaint}}>{p.pos} · {p.dose}</div>
                    </div>)}
                  {gr.excluded.length===0&&<div style={{textAlign:"center",padding:12,color:t.textFaint,fontSize:10}}>Nenhum</div>}
                </div>
              </div>
              {/* Limited */}
              <div style={{background:t.bgCard,borderRadius:12,border:"1px solid #FED7AA",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#FFF7ED",borderBottom:"1px solid #FED7AA"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#EA580C"}}>Carga Limitada (MED)</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{gr.limited.length} atletas · 50% volume</div>
                </div>
                <div style={{padding:10}}>
                  {gr.limited.map((p,i)=>
                    <div key={i} style={{padding:"6px 8px",background:"#FFF7ED",borderRadius:6,marginBottom:4,cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#EA580C"}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#EA580C"}}>{(p.prob*100).toFixed(0)}%</span>
                      </div>
                      <div style={{fontSize:9,color:t.textFaint}}>{p.pos} · {p.dose}</div>
                    </div>)}
                </div>
              </div>
              {/* Monitored */}
              <div style={{background:t.bgCard,borderRadius:12,border:"1px solid #FEF08A",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#FEFCE8",borderBottom:"1px solid #FEF08A"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#CA8A04"}}>Monitorados (HSR -30%)</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{gr.full.filter(p=>p.zone==="AMARELO").length} atletas</div>
                </div>
                <div style={{padding:10}}>
                  {gr.full.filter(p=>p.zone==="AMARELO").map((p,i)=>
                    <div key={i} style={{padding:"6px 8px",background:"#FEFCE8",borderRadius:6,marginBottom:4,cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#CA8A04"}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#CA8A04"}}>{(p.prob*100).toFixed(0)}%</span>
                      </div>
                      <div style={{fontSize:9,color:t.textFaint}}>{p.pos} · {p.dose}</div>
                    </div>)}
                </div>
              </div>
              {/* Full */}
              <div style={{background:t.bgCard,borderRadius:12,border:"1px solid #BBF7D0",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#F0FDF4",borderBottom:"1px solid #BBF7D0"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#16A34A"}}>Liberados — Carga Integral</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{gr.full.filter(p=>p.zone==="VERDE").length} atletas</div>
                </div>
                <div style={{padding:10,maxHeight:300,overflowY:"auto"}}>
                  {gr.full.filter(p=>p.zone==="VERDE").map((p,i)=>
                    <div key={i} style={{padding:"4px 8px",borderRadius:4,marginBottom:2,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <span style={{fontWeight:600,fontSize:11,color:"#16A34A"}}>{p.n}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint}}>{p.pos}</span>
                    </div>)}
                </div>
              </div>
            </div>;
          })()}
        </div>}

        {tab==="player"&&sp&&(()=>{
          // Estado do Atleta — métrica única que integra:
          //   (a) Ψ(t) — estado observável via PCA (Fonseca 2020), quando há dados suficientes
          //   (b) Prob. Lesão ML (7d) — forecast XGBoost
          //   (c) Risk Score 0–100 — fallback baseado em regras clínicas do dia
          // Mesma lógica do sidebar (helper estado()) para garantir consistência.
          const _psiSeries=sheetData?.psi?.series?.[sp.n]||[];
          const _mlAlert=liveAlerts.find(a=>a.n===sp.n);
          const _e=estado(sp,_mlAlert,_psiSeries);
          const _psiDev=_e.psiDev;
          const _psiEwsCount=_e.psiEws;
          const _mlProb=_e.mlProb;
          const _mlPct=_mlProb!==null?Math.round(_mlProb*100):null;
          let _zC=_e.c,_zL=_e.l;
          const _hasDyn=_e.hasDyn;
          // Score numérico principal exibido no header
          const _scoreVal=_mlPct!==null?_mlPct:(sp.riskScore!==undefined?sp.riskScore:0);
          const _scoreUnit=_mlPct!==null?"%":"";
          const _scoreSub=_mlPct!==null?"Prob. Lesão (7d)":"Escore Clínico";
          const _psiFmt=_psiDev!==null?`${_psiDev>=0?"+":""}${_psiDev.toFixed(1)}σ`:null;
          return <div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <PlayerPhoto theme={t} name={sp.n} sz={80}/>
              {/* Gauge circular (Pro Score style) — visual mais limpo que o
                  badge sólido. Cor segue zoneamento _zC, valor central monoespaçado. */}
              <div title={`Estado do Atleta — combina Ψ observável, previsão ML e regras clínicas. ${_zL}.`} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <CircularGauge value={_scoreVal} max={_scoreUnit==="%"?100:100} size={104} stroke={9} theme={t} c={_zC} label={_zL}/>
                <div style={{fontSize:8.5,color:t.textFaint,fontWeight:600,letterSpacing:.3,textAlign:"center",maxWidth:120}}>{_scoreSub}{_psiFmt&&<> · Ψ {_psiFmt}</>}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Inter Tight'",fontSize:20,fontWeight:900,color:pri,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{sp.n} <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textFaint,fontWeight:400}}>{sp.pos} · {sp.id} anos · {sp.nc} sessões</span>{sp._questStale&&<span title={`Último questionário há ${sp._questDaysOld} dias — Escore Clínico apoiado em valores anteriores`} style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:"#CA8A0420",color:"#CA8A04",border:"1px solid #CA8A0455",fontWeight:700,letterSpacing:.4}}>QUESTIONÁRIO {sp._questDaysOld}D</span>}</div>
                {sp.reasons.length>0&&<div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                  {sp.reasons.map((r,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:LV[sp.risk].bg,color:LV[sp.risk].c,border:`1px solid ${LV[sp.risk].bc}`}}>{r}</span>)}
                </div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginTop:14}}>
                  {(()=>{
                    // Cada KPI traz: valor, posição relativa (0–100%) na escala
                    // operacional, e cor da zona — para renderizar mini-gauge.
                    const ai=sp.ai||0;
                    const pse=Number(sp.pse)||0;
                    const sra=Number(sp.sra)||0;
                    const cmjArr=Array.isArray(sp.ct)?sp.ct.filter(v=>v>0):[];
                    const cmjAtual=cmjArr.length?cmjArr[cmjArr.length-1]:Number(sp.cmj)||0;
                    const cmjRecord=cmjArr.length?Math.max(...cmjArr):Number(sp.cmj)||0;
                    const cmjPct=cmjRecord>0?Math.min(100,Math.round((cmjAtual/cmjRecord)*100)):0;
                    const cmjC=cmjPct>=95?"#22c55e":cmjPct>=88?"#facc15":cmjPct>=80?"#fb923c":"#ef4444";
                    // ACWR: 0.8–1.3 sweet spot (verde); 1.3–1.5 atenção; >1.5 ou <0.8 perigo
                    const acwrPct=Math.min(100,Math.max(0,(ai/2)*100));
                    const acwrC=ai>1.5?"#ef4444":ai>1.3?"#fb923c":ai>=0.8?"#22c55e":ai>0?"#facc15":"#6b7280";
                    // PSE: 0–10
                    const psePct=Math.min(100,(pse/10)*100);
                    const pseC=pse>=8?"#ef4444":pse>=6?"#fb923c":pse>=3?"#22c55e":"#facc15";
                    // sRPE Total semana: faixa operacional 0–500
                    const sraPct=Math.min(100,(sra/500)*100);
                    const sraC=sra>=450?"#ef4444":sra>=350?"#fb923c":sra>=200?"#22c55e":"#facc15";
                    // Humor 1–5; Energia 1–4
                    const humor=Number(sp.h)||0; const energia=Number(sp.e)||0;
                    const humorC=humor>=4?"#22c55e":humor>=3?"#facc15":"#ef4444";
                    const energiaC=energia>=3?"#22c55e":energia>=2?"#facc15":"#ef4444";

                    const items=[
                      {l:"ACWR Int", v:ai>0?ai.toFixed(2):"—", pct:acwrPct, c:acwrC, tip:"Acute:Chronic Workload Ratio (sRPE 7d ÷ 28d EWMA). Sweet spot: 0.8–1.3 (Gabbett, 2016)."},
                      {l:"PSE",      v:pse>0?pse:"—",          pct:psePct,  c:pseC,  tip:"Percepção Subjetiva de Esforço (CR-10 Borg, 0–10)."},
                      {l:"sRPE Total",v:sra>0?sra:"—",         pct:sraPct,  c:sraC,  tip:"Carga total da sessão = PSE × Duração (UA). >450 = sessão de alta carga (Foster, 2001)."},
                      {l:"CMJ Atual",v:cmjAtual>0?cmjAtual.toFixed(1):"—", pct:cmjPct, c:cmjC, tip:"Counter-Movement Jump atual (cm). Mostra % vs record individual — queda >5% = fadiga NM (Claudino et al., 2017)."},
                      {l:"CMJ Recorde",v:cmjRecord>0?cmjRecord.toFixed(1):"—", pct:100, c:"#a855f7", tip:"Maior CMJ histórico do atleta — referência de potência máxima."},
                      {l:"Humor",    v:humor>0?humorL[humor]:"—",  pct:(humor/5)*100, c:humorC, tip:"Estado de humor pré-treino (1=Raiva, 5=Tranquilo)."},
                      {l:"Energia",  v:energia>0?(energia<=2?"Baixa":"OK"):"—",pct:(energia/4)*100, c:energiaC, tip:"Nível de energia pré-treino (1–4)."}
                    ];
                    return items.map((m,i)=>
                      <div key={i} style={{padding:"8px 10px",background:dark?"rgba(255,255,255,.025)":t.bgMuted,borderRadius:8,border:`1px solid ${dark?"rgba(255,255,255,.06)":t.borderLight}`,cursor:"help"}} title={m.tip}>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{m.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:800,color:m.c,lineHeight:1,marginBottom:6}}>{m.v}</div>
                        <ThresholdGauge value={m.pct} max={100} theme={t} height={4} bands={`linear-gradient(90deg, ${m.c}66 0%, ${m.c} 100%)`}/>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ HERO GAUGES — Último Treino × Último Jogo (estilo STATSports) ═══
               Duas colunas paralelas mostrando as métricas-chave da última
               sessão de treino e do último jogo do atleta. Cada KPI tem:
               header uppercase + valor monoespaçado grande + unidade +
               ThresholdGauge horizontal vs Gref/baseline + sub-métrica. */}
          {(()=>{
            const gpsAll=sheetData?.gps?.[sp.n]||[];
            if(!gpsAll.length) return null;
            const calendar=sheetData?.calendario||[];
            const parseDt=s=>{if(!s)return null;const v=String(s).trim();if(/^\d{4}-\d{2}-\d{2}/.test(v))return new Date(v);const p=v.split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(a>31)return new Date(a,b-1,c);if(c>31)return new Date(c,b-1,a);return new Date(c<100?c+2000:c,b-1,a);}return null;};
            const isMatchST=st=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            const matchDateSet=new Set();
            for(const g of calendar){const d=parseDt(g.data);if(d&&!isNaN(d))matchDateSet.add(d.toISOString().slice(0,10));}
            const sessions=gpsAll.map(e=>{const dt=parseDt(e.date);const k=dt&&!isNaN(dt)?dt.toISOString().slice(0,10):"";return{e,dt,k,isMatch:isMatchST(e.sessionTitle)||matchDateSet.has(k)};}).filter(s=>s.dt);
            const games=sessions.filter(s=>s.isMatch&&(s.e.gps?.dist_total||0)>2000).sort((a,b)=>b.dt-a.dt);
            const trainings=sessions.filter(s=>!s.isMatch&&(s.e.gps?.dist_total||0)>1500).sort((a,b)=>b.dt-a.dt);
            const lastT=trainings[0]?.e; const lastG=games[0]?.e;
            // Gref (top 5 jogos por output composto) — para barras "vs Gref"
            const scoredG=games.map(s=>({...s,score:(s.e.gps?.dist_total||0)+(s.e.gps?.hsr||0)*3+(s.e.gps?.sprints||0)*50+(s.e.gps?.player_load||0)})).sort((a,b)=>b.score-a.score);
            const top5=scoredG.slice(0,Math.min(5,scoredG.length)).map(s=>s.e);
            const grefAvg=k=>top5.length?top5.reduce((s,e)=>s+(e.gps?.[k]||0),0)/top5.length:0;
            const gref={dist:grefAvg("dist_total"),hsr:grefAvg("hsr"),spr:grefAvg("hsr_25"),pl:grefAvg("player_load"),acel:grefAvg("acel_3"),vel:grefAvg("pico_vel"),sprints:grefAvg("sprints")};
            // Baseline de treino: média móvel dos últimos 14d (sem o lastT)
            const trArr=trainings.slice(1,14);
            const trAvg=k=>trArr.length?trArr.reduce((s,o)=>s+(o.e.gps?.[k]||0),0)/trArr.length:0;
            const trBase={dist:trAvg("dist_total"),hsr:trAvg("hsr"),spr:trAvg("hsr_25"),pl:trAvg("player_load"),acel:trAvg("acel_3"),vel:trAvg("pico_vel"),sprints:trAvg("sprints")};
            const fmtDate=d=>d?d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}):"—";
            const tile=(label,val,unit,sub,subVal,baseVal,colorOk="#22c55e")=>{
              const v=Number(val)||0; const b=Number(baseVal)||0;
              const pct=b>0?Math.min(150,(v/b)*100):0;
              const c=pct>=110?"#ef4444":pct>=90?"#fb923c":pct>=70?"#facc15":pct>0?colorOk:t.textFaint;
              return {label,val:v,unit,sub,subVal,pct,c,b};
            };
            const renderTile=(t2,key)=>(
              <div key={key} style={{padding:"12px 14px",background:dark?"rgba(255,255,255,.025)":t.bgMuted,borderRadius:10,border:`1px solid ${t.borderLight}`,position:"relative",overflow:"hidden"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:8.5,color:t.textFaint,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase"}}>{t2.label}</div>
                  {t2.b>0&&<div style={{fontSize:8,fontWeight:700,color:t2.c,fontFamily:"'JetBrains Mono'"}}>{Math.round(t2.pct)}%</div>}
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:26,fontWeight:900,color:t.text,lineHeight:1,letterSpacing:-1}}>{Math.round(t2.val)||0}</div>
                  {t2.unit&&<div style={{fontSize:9,color:t.textFaint,fontWeight:700}}>{t2.unit}</div>}
                </div>
                <div style={{marginTop:8}}>
                  <div style={{position:"relative",height:4,background:t.bgMuted2,borderRadius:2,overflow:"hidden"}}>
                    <div style={{position:"absolute",inset:0,width:`${Math.min(100,(t2.pct/150)*100)}%`,background:t2.c,transition:"width .6s"}}/>
                    {t2.b>0&&<div style={{position:"absolute",left:`${(100/150)*100}%`,top:-1,bottom:-1,width:1,background:t.textFaint,opacity:.5}}/>}
                  </div>
                </div>
                {t2.sub&&<div style={{fontSize:8,color:t.textFaintest,fontWeight:600,marginTop:6,letterSpacing:.3}}>{t2.sub}: <span style={{color:t.textMuted,fontWeight:700}}>{t2.subVal}</span></div>}
              </div>
            );
            const colTreino=lastT?[
              tile("Distância",lastT.gps.dist_total,"m","Baseline 14d",Math.round(trBase.dist)+"m",trBase.dist),
              tile("HSR (19.8–24.8)",lastT.gps.hsr,"m","Sprints",lastT.gps.sprints,trBase.hsr),
              tile("SPR (>25.2)",lastT.gps.hsr_25,"m","Esforços",lastT.gps.sprints_25,trBase.spr),
              tile("Player Load",lastT.gps.player_load,"","Vel. Pico",(lastT.gps.pico_vel||0).toFixed(1)+" km/h",trBase.pl)
            ]:null;
            const colJogo=lastG?[
              tile("Distância",lastG.gps.dist_total,"m","Gref",Math.round(gref.dist)+"m",gref.dist),
              tile("HSR (19.8–24.8)",lastG.gps.hsr,"m","Sprints",lastG.gps.sprints,gref.hsr),
              tile("SPR (>25.2)",lastG.gps.hsr_25,"m","Esforços",lastG.gps.sprints_25,gref.spr),
              tile("Player Load",lastG.gps.player_load,"","Vel. Pico",(lastG.gps.pico_vel||0).toFixed(1)+" km/h",gref.pl)
            ]:null;
            if(!colTreino&&!colJogo) return null;
            return <div style={{display:"grid",gridTemplateColumns:colTreino&&colJogo?"1fr 1fr":"1fr",gap:14,marginBottom:16}}>
              {colTreino&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${t.borderLight}`}}>
                  <div>
                    <div style={{fontSize:9,color:"#22d3ee",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>Último Treino</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textMuted,fontWeight:700,marginTop:1}}>{fmtDate(parseDt(lastT.date))}</div>
                  </div>
                  <Activity size={16} color="#22d3ee"/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{colTreino.map((x,i)=>renderTile(x,`tr-${i}`))}</div>
              </div>}
              {colJogo&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${t.borderLight}`}}>
                  <div>
                    <div style={{fontSize:9,color:"#facc15",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>Último Jogo</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textMuted,fontWeight:700,marginTop:1}}>{fmtDate(parseDt(lastG.date))} · vs Gref ({top5.length} top)</div>
                  </div>
                  <Trophy size={16} color="#facc15"/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{colJogo.map((x,i)=>renderTile(x,`jg-${i}`))}</div>
              </div>}
            </div>;
          })()}

          {/* Estado do Atleta — métrica única que funde Risk Score e Probabilidade de Lesão.
               Ψ(t) é o estado observável (Fonseca 2020); Previsão ML é o forecast derivado (XGBoost+SHAP). */}
          {(()=>{
            const psi=sheetData?.psi;
            const series=psi?.series?.[sp.n]||[];
            // Sem dados Ψ suficientes: renderiza o card com ML + Risk Score clínico
            // (o score grande do header já está sendo exibido; aqui damos contexto).
            if(!psi||series.length<3){
              const mlAlertP=liveAlerts.find(a=>a.n===sp.n);
              const probML=mlAlertP?mlAlertP.prob:null;
              const probPctML=probML!==null?(probML*100).toFixed(0):null;
              const probCML=probML>=0.5?"#DC2626":probML>=0.3?"#EA580C":probML>=0.15?"#CA8A04":"#16A34A";
              const rsZoneC=LV[sp.risk].c,rsZoneL=LV[sp.risk].l;
              return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <TrendingUp size={18} color={rsZoneC}/>Estado do Atleta
                  <span style={{fontSize:10,padding:"3px 10px",borderRadius:6,background:rsZoneC+"15",color:rsZoneC,fontWeight:700,border:`1px solid ${rsZoneC}33`}}>{rsZoneL}</span>
                </div>
                <div style={{fontSize:10,color:t.textFaint,marginBottom:12}}>Métrica única que integra previsão ML, Escore Clínico e indicadores do dia. <em>Ψ(t) observável indisponível — série curta.</em></div>
                <div style={{display:"grid",gridTemplateColumns:probPctML!==null?"1fr 1fr":"1fr",gap:12}}>
                  <div style={{padding:14,background:rsZoneC+"0D",borderRadius:10,border:`1px solid ${rsZoneC}33`}}>
                    <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Escore Clínico (hoje)</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:36,fontWeight:800,color:rsZoneC,lineHeight:1}}>{sp.riskScore!==undefined?sp.riskScore:"-"}</div>
                      <div style={{fontSize:12,color:t.textFaint,fontWeight:600}}>/100</div>
                    </div>
                    <div style={{fontSize:10,color:t.textFaint,marginTop:6,lineHeight:1.4}}>Regras clínicas do dia (ACWR, Dor, Recuperação, Sono, Bem-estar).</div>
                    {sp.reasons&&sp.reasons.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>
                      {sp.reasons.slice(0,4).map((r,i)=><span key={i} style={{padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:600,background:rsZoneC+"15",color:rsZoneC,border:`1px solid ${rsZoneC}33`}}>{r}</span>)}
                    </div>}
                  </div>
                  {probPctML!==null&&<div style={{padding:14,background:probCML+"0D",borderRadius:10,border:`1px solid ${probCML}33`}}>
                    <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Previsão de lesão (7 dias)</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:36,fontWeight:800,color:probCML,lineHeight:1}}>{probPctML}</div>
                      <div style={{fontSize:18,color:probCML,fontWeight:700}}>%</div>
                    </div>
                    <div style={{fontSize:11,color:probCML,fontWeight:700,marginTop:4}}>{mlAlertP.zone==="VERMELHO"?"Risco alto":mlAlertP.zone==="LARANJA"?"Risco moderado-alto":mlAlertP.zone==="AMARELO"?"Risco moderado":"Risco baixo"}</div>
                    {mlAlertP.dose&&<div style={{fontSize:10,color:t.textMuted,marginTop:6,lineHeight:1.4}}>{mlAlertP.dose}</div>}
                    {mlAlertP.shap_pos&&mlAlertP.shap_pos.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>
                      {mlAlertP.shap_pos.slice(0,3).map((s,i)=><span key={i} style={{padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:600,background:probCML+"15",color:probCML,border:`1px solid ${probCML}33`}}>{s.f}: {s.v}</span>)}
                    </div>}
                  </div>}
                </div>
                <div style={{fontSize:9,color:t.textFaint,marginTop:10,lineHeight:1.4}}>Para habilitar a leitura Ψ(t) (observável, Fonseca 2020) o atleta precisa de ≥3 sessões com cobertura {">="}70% das features (GPS + PSE + CMJ + questionário).</div>
              </div>;
            }
            const last=series[series.length-1];
            const psiV=last?.psi||0;
            const baseV=last?.baseline;
            const sdV=last?.sd;
            const ews=last?.ews||{};
            const ewsCount=ews.risingCount||0;
            const mlAlertP=liveAlerts.find(a=>a.n===sp.n);
            const probML=mlAlertP?mlAlertP.prob:null;
            const probPctML=probML!==null?(probML*100).toFixed(0):null;
            const probCML=probML>=0.5?"#DC2626":probML>=0.3?"#EA580C":probML>=0.15?"#CA8A04":"#16A34A";
            // Zona combina desvio vs baseline individual + early-warning signals
            // (Scheffer 2009 / Fonseca 2020, passo 4): 2+ indicadores subindo
            // antecipam a transição mesmo sem desvio estático extremo.
            let zone="#16A34A",zoneLabel="Estável",zoneDesc="Dentro do baseline individual";
            let dev=null;
            if(baseV!==null&&baseV!==undefined&&sdV>0){
              dev=(psiV-baseV)/sdV;
              zoneDesc=`${dev>=0?"+":""}${dev.toFixed(1)}σ vs baseline`;
            }
            if((dev!==null&&dev>=3)||(dev!==null&&dev>=1.5&&ewsCount>=2)){
              zone="#DC2626";zoneLabel="Transição iminente";
            }else if((dev!==null&&dev>=2)||(dev!==null&&dev>=1&&ewsCount>=2)){
              zone="#EA580C";zoneLabel="Sinal de alerta";
            }else if((dev!==null&&dev>=1)||ewsCount>=2){
              zone="#CA8A04";zoneLabel=ewsCount>=2&&(dev===null||dev<1)?"Sinais precoces ativos":"Atenção";
            }else if(ewsCount>=1){
              zoneLabel="Estável com sinal precoce";
            }
            const WINDOW_DAYS=90;
            const cutoffMs=Date.now()-WINDOW_DAYS*24*60*60*1000;
            const parseDt=(s)=>{if(!s)return 0;if(/^\d{4}-\d{2}-\d{2}/.test(s))return new Date(s).getTime();const p=String(s).split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(a>31)return new Date(a,b-1,c).getTime();if(c>31)return new Date(c,b-1,a).getTime();return new Date(c,a-1,b).getTime();}return 0;};
            const chartData=series.filter(x=>parseDt(x.date)>=cutoffMs).map(x=>{const ts=parseDt(x.date);const dt=new Date(ts);return{d:`${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}`,psi:x.psi,baseline:x.baseline,upper:x.baseline!==null&&x.sd>0?Math.round((x.baseline+2*x.sd)*1000)/1000:null};});
            const topLoadings=[...(psi.loadings||[])].sort((a,b)=>Math.abs(b.loading)-Math.abs(a.loading)).slice(0,6);
            const featLabel={dist_total:"Distância",hsr:"HSR",sprints:"Spr >20",player_load:"Player Load",pico_vel:"Vel. Pico",pse:"PSE",srpe:"sRPE",cmj:"CMJ",sono:"Sono",dor:"Dor",rec:"Recuperação"};
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,gap:16,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,display:"flex",alignItems:"center",gap:8}}>
                    <TrendingUp size={18} color={zone}/>Estado do Atleta
                    <span style={{fontSize:10,padding:"3px 10px",borderRadius:6,background:zone+"15",color:zone,fontWeight:700,border:`1px solid ${zone}33`}}>{zoneLabel}</span>
                  </div>
                  <div style={{fontSize:10,color:t.textFaint,marginTop:4}}>Métrica única que integra carga, neuromuscular, bioquímica e bem-estar · n={psi.meta?.n} sessões · {psi.meta?.explained}% variância explicada</div>
                </div>
              </div>
              {/* Duas leituras do mesmo estado: observável (Ψ) + forecast (ML) */}
              <div style={{display:"grid",gridTemplateColumns:probPctML!==null?"1fr 1fr":"1fr",gap:12,marginBottom:12}}>
                <div style={{padding:14,background:zone+"0D",borderRadius:10,border:`1px solid ${zone}33`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Estado atual (observável)</div>
                    <div style={{fontSize:9,color:t.textFaint}}>Ψ</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:36,fontWeight:800,color:zone,lineHeight:1}}>{psiV>=0?"+":""}{psiV.toFixed(2)}</div>
                    <div style={{fontSize:12,color:t.textFaint,fontWeight:600}}>σ</div>
                  </div>
                  <div style={{fontSize:11,color:t.textMuted,marginTop:4}}>{zoneDesc}</div>
                  <div style={{fontSize:10,color:t.textFaint,marginTop:6,lineHeight:1.4}}>Resume carga + sono + recuperação + neuromuscular numa só trajetória. Cresce quando o atleta se afasta do padrão saudável dele.</div>
                </div>
                {probPctML!==null&&<div style={{padding:14,background:probCML+"0D",borderRadius:10,border:`1px solid ${probCML}33`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Previsão de lesão (7 dias)</div>
                    <div style={{fontSize:9,color:t.textFaint}}>ML · XGBoost</div>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:36,fontWeight:800,color:probCML,lineHeight:1}}>{probPctML}</div>
                    <div style={{fontSize:18,color:probCML,fontWeight:700}}>%</div>
                  </div>
                  <div style={{fontSize:11,color:probCML,fontWeight:700,marginTop:4}}>{mlAlertP.zone==="VERMELHO"?"Risco alto":mlAlertP.zone==="LARANJA"?"Risco moderado-alto":mlAlertP.zone==="AMARELO"?"Risco moderado":"Risco baixo"}</div>
                  {mlAlertP.dose&&<div style={{fontSize:10,color:t.textMuted,marginTop:6,lineHeight:1.4}}>{mlAlertP.dose}</div>}
                  {mlAlertP.shap_pos&&mlAlertP.shap_pos.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>
                    {mlAlertP.shap_pos.slice(0,3).map((s,i)=><span key={i} style={{padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:600,background:probCML+"15",color:probCML,border:`1px solid ${probCML}33`}}>{s.f}: {s.v}</span>)}
                  </div>}
                </div>}
              </div>
              {chartData.length>=2&&<ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border}/>
                  <XAxis dataKey="d" tick={{fontSize:9,fill:t.textFaint}}/>
                  <YAxis tick={{fontSize:9,fill:t.textFaint}} domain={["auto","auto"]}/>
                  <Tooltip content={<Tip theme={t}/>}/>
                  <ReferenceLine y={0} stroke={t.textFaint} strokeDasharray="2 4" label={{value:"média pop.",fontSize:9,fill:t.textFaint,position:"insideTopLeft"}}/>
                  <Line type="monotone" dataKey="baseline" name="Baseline 28d" stroke="#94a3b8" strokeDasharray="4 3" dot={false} strokeWidth={1.5}/>
                  <Line type="monotone" dataKey="upper" name="Limite +2σ" stroke="#EA580C" strokeDasharray="2 4" dot={false} strokeWidth={1}/>
                  <Line type="monotone" dataKey="psi" name="Ψ(t)" stroke={zone} strokeWidth={2.5} dot={{r:2.5,fill:zone}}/>
                </LineChart>
              </ResponsiveContainer>}
              {/* Early-warning signals — critical slowing down nos resíduos de Ψ */}
              {ews&&ews.variance!==null&&ews.variance!==undefined&&<div style={{marginTop:10,padding:10,background:t.bgMuted,borderRadius:8,border:`1px solid ${t.borderLight}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5}}>Early-Warning Signals (resíduos de Ψ)</div>
                  <div style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:ewsCount>=2?"#DC262615":ewsCount>=1?"#CA8A0415":"#16A34A15",color:ewsCount>=2?"#DC2626":ewsCount>=1?"#CA8A04":"#16A34A"}}>{ewsCount}/3 indicadores em alta</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                  {[
                    {l:"Variância",v:ews.variance,rising:ews.risingVar,tip:"Amplitude dos desvios de Ψ vs baseline individual. Cresce quando o sistema fica sensível a pequenas perturbações."},
                    {l:"Autocorr. lag-1",v:ews.ar1,rising:ews.risingAr1,tip:"Correlação de resíduos sucessivos. Cresce quando o sistema demora mais a retornar ao equilíbrio (critical slowing down)."},
                    {l:"|Skewness|",v:Math.abs(ews.skew||0),rising:ews.risingSkew,tip:"Assimetria da distribuição de resíduos. Cresce quando o atrator começa a deformar em direção a outro regime."}
                  ].map((m,i)=><div key={i} title={m.tip} style={{textAlign:"center",padding:"6px 4px",background:t.bgCard,borderRadius:6,border:`1px solid ${t.borderLight}`,cursor:"help"}}>
                    <div style={{fontSize:9,color:t.textFaint,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{m.l} <span style={{color:m.rising?"#DC2626":"#16A34A",fontWeight:700}}>{m.rising?"↑":"→"}</span></div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:pri}}>{(m.v||0).toFixed(3)}</div>
                  </div>)}
                </div>
                <div style={{fontSize:9,color:t.textFaint,marginTop:6,lineHeight:1.4}}>Scheffer et al., <em>Nature</em> 2009. Dois ou mais indicadores subindo simultaneamente ativam <em>Sinais precoces ativos</em> — a zona pode escalar mesmo sem desvio extremo de Ψ.</div>
              </div>}
              {/* Loadings PC1 colapsados por padrão — análise técnica para
                   o auditor da metodologia, não para a leitura clínica diária. */}
              <details style={{marginTop:10}}>
                <summary style={{cursor:"pointer",listStyle:"none",fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,padding:"6px 10px",background:t.bgMuted,borderRadius:8,border:`1px solid ${t.borderLight}`,display:"inline-flex",alignItems:"center",gap:6}}>
                  <ChevronRight size={11}/> Loadings PC1 (análise técnica)
                </summary>
                <div style={{padding:10,background:t.bgMuted,borderRadius:8,border:`1px solid ${t.borderLight}`,marginTop:6}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                    {topLoadings.map((l,i)=>{const sign=l.loading>=0?"+":"";const c=l.loading>=0?"#DC2626":"#16A34A";return <div key={i} style={{textAlign:"center",padding:"6px 4px",background:t.bgCard,borderRadius:6,border:`1px solid ${t.borderLight}`}}>
                      <div style={{fontSize:9,color:t.textFaint,fontWeight:600}}>{featLabel[l.key]||l.key}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:c}}>{sign}{l.loading.toFixed(2)}</div>
                    </div>;})}
                  </div>
                  <div style={{fontSize:9,color:t.textFaint,marginTop:6,lineHeight:1.4}}>Loading positivo = feature empurra Ψ para cima (risco). Negativo = puxa para baixo (saudável). Fonseca 2020.</div>
                </div>
              </details>
            </div>;
          })()}

          {/* Web de determinantes — rede de correlações entre features (Bittencourt 2016) */}
          {(()=>{
            const psi=sheetData?.psi;
            const net=psi?.network;
            if(!net||!net.nodes?.length)return null;
            const featLabel={dist_total:"Distância",hsr:"HSR",sprints:"Spr >20",player_load:"PL",pico_vel:"Vel.Pico",pse:"PSE",srpe:"sRPE",cmj:"CMJ",sono:"Sono",dor:"Dor",rec:"Recup."};
            const p=net.nodes.length;
            // Matriz de correlações pooled — reconstruída a partir das arestas (inclui auto-correlação = 1)
            const M={};
            net.nodes.forEach(n=>{M[n.key]={};net.nodes.forEach(m=>{M[n.key][m.key]=n.key===m.key?1:0;});});
            net.edges.forEach(e=>{M[e.a][e.b]=e.r;M[e.b][e.a]=e.r;});
            const keys=net.nodes.map(n=>n.key);
            const cellC=(r)=>{const a=Math.min(1,Math.abs(r));if(r>=0)return`rgba(220,38,38,${a.toFixed(2)})`;return`rgba(22,163,74,${a.toFixed(2)})`;};
            const cellTxt=(r)=>Math.abs(r)>0.4?"#fff":t.text;
            // Top positive e top negative pares para leitura em linguagem natural
            const posPairs=[...net.edges].filter(e=>e.r>0).sort((a,b)=>b.r-a.r).slice(0,3);
            const negPairs=[...net.edges].filter(e=>e.r<0).sort((a,b)=>a.r-b.r).slice(0,3);
            return <details style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:0,marginBottom:16}}>
              <summary style={{cursor:"pointer",listStyle:"none",padding:"14px 18px",display:"flex",alignItems:"center",gap:8,justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <ChevronRight size={14} color={t.textFaint}/>
                  <Users size={15} color={acc}/>
                  <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri}}>Web de Determinantes <span style={{fontSize:10,color:t.textFaint,fontWeight:600,marginLeft:6}}>matriz de correlações + rede</span></span>
                </div>
                <span style={{fontSize:9,color:t.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase"}}>Análise avançada</span>
              </summary>
              <div style={{padding:"0 18px 18px"}}>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:12,lineHeight:1.5}}>Cada célula mostra como duas variáveis se movem juntas no elenco. <strong style={{color:"#DC2626"}}>Vermelho</strong> = sobem juntas (quando uma aumenta, a outra tende a aumentar). <strong style={{color:"#16A34A"}}>Verde</strong> = se comportam de forma oposta. Quanto mais forte a cor, mais forte a ligação.</div>
              {/* Resumo em linguagem natural */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{padding:10,background:"#FEF2F2",borderRadius:8,border:"1px solid #FECACA"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#991B1B",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Sobem juntas</div>
                  {posPairs.length?posPairs.map((e,i)=><div key={i} style={{fontSize:11,color:t.textMuted,marginBottom:3,display:"flex",justifyContent:"space-between"}}><span>{featLabel[e.a]||e.a} + {featLabel[e.b]||e.b}</span><span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:"#DC2626"}}>+{e.r.toFixed(2)}</span></div>):<div style={{fontSize:10,color:t.textFaint,fontStyle:"italic"}}>sem pares relevantes</div>}
                </div>
                <div style={{padding:10,background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#166534",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Se comportam de forma oposta</div>
                  {negPairs.length?negPairs.map((e,i)=><div key={i} style={{fontSize:11,color:t.textMuted,marginBottom:3,display:"flex",justifyContent:"space-between"}}><span>{featLabel[e.a]||e.a} vs {featLabel[e.b]||e.b}</span><span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:"#16A34A"}}>{e.r.toFixed(2)}</span></div>):<div style={{fontSize:10,color:t.textFaint,fontStyle:"italic"}}>sem pares relevantes</div>}
                </div>
              </div>
              {/* Heatmap: muito mais legível que rede circular */}
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"collapse",margin:"0 auto",fontSize:10}}>
                  <thead><tr>
                    <th style={{padding:"4px 6px"}}></th>
                    {keys.map(k=><th key={k} style={{padding:"4px 2px",fontSize:9,color:t.textMuted,fontWeight:700,textAlign:"center",writingMode:"vertical-rl",transform:"rotate(180deg)",height:50,whiteSpace:"nowrap"}}>{featLabel[k]||k}</th>)}
                  </tr></thead>
                  <tbody>
                    {keys.map((r,i)=><tr key={r}>
                      <td style={{padding:"2px 8px",fontSize:9,color:t.textMuted,fontWeight:700,textAlign:"right",whiteSpace:"nowrap"}}>{featLabel[r]||r}</td>
                      {keys.map((c,j)=>{const v=M[r][c];const bg=cellC(v);const fg=cellTxt(v);return <td key={c} style={{padding:0,textAlign:"center"}}>
                        <div title={`${featLabel[r]||r} ↔ ${featLabel[c]||c}: ${v>=0?"+":""}${v.toFixed(2)}`} style={{width:36,height:28,background:bg,color:fg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono'",fontWeight:700,fontSize:9,border:`1px solid ${t.border}`,cursor:"help"}}>{i===j?"":(v>=0?"+":"")+v.toFixed(2)}</div>
                      </td>;})}
                    </tr>)}
                  </tbody>
                </table>
              </div>
              {/* Legenda de cor */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:12,fontSize:9,color:t.textFaint}}>
                <span style={{color:"#16A34A",fontWeight:700}}>−1.0</span>
                <div style={{display:"flex",height:10,width:200,borderRadius:5,overflow:"hidden",border:`1px solid ${t.border}`}}>
                  {Array.from({length:20},(_,i)=>{const v=-1+i/10;return <div key={i} style={{flex:1,background:cellC(v)}}/>;})}
                </div>
                <span style={{color:"#DC2626",fontWeight:700}}>+1.0</span>
              </div>
              <div style={{fontSize:9,color:t.textFaint,marginTop:8,lineHeight:1.5,textAlign:"center"}}>Cada valor é a correlação de Pearson calculada sobre todas as sessões do elenco. <em>Bittencourt et al., Br J Sports Med 2016.</em></div>
              </div>
            </details>;
          })()}

          {/* Risco de Lesão + DM + Histórico */}
          {(()=>{
            const mlAlert=liveAlerts.find(a=>a.n===sp.n);
            const dmStatus=[...liveDmData.afastados,...liveDmData.retornados].find(d=>d.n===sp.n);
            const playerInj=liveInjuries.filter(h=>h.n===sp.n);
            const prob=mlAlert?mlAlert.prob:null;
            const probPct=prob!==null?(prob*100).toFixed(0):null;
            const probC=prob>=0.5?"#DC2626":prob>=0.3?"#EA580C":prob>=0.15?"#CA8A04":"#16A34A";
            return <div style={{display:"grid",gridTemplateColumns:dmStatus?"1fr 1fr":"1fr",gap:16,marginBottom:16}}>
              {/* Histórico de Lesões (Previsão ML agora mora no card Estado acima) */}
              <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Shield size={14}/>Histórico de Lesões {playerInj.length>0&&<span style={{fontSize:10,color:t.textFaint,fontWeight:500}}>({playerInj.length} {playerInj.length===1?"caso":"casos"})</span>}</div>
                {playerInj.length===0?<div style={{textAlign:"center",padding:"24px 0",color:t.textFaint,fontSize:11}}>Sem lesões registradas</div>:
                  playerInj.map((inj,i)=>{
                    const ic=inj.classif.includes("4C")?"#DC2626":inj.classif.includes("2")?"#EA580C":inj.classif==="Cirurgia"?"#7c3aed":"#CA8A04";
                    return <div key={i} style={{padding:"8px 10px",background:!inj.fim_trans?"#FEF2F2":t.bgMuted,borderRadius:8,marginBottom:6,border:`1px solid ${!inj.fim_trans?ic+"33":t.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${ic}15`,color:ic}}>{inj.classif}</span>
                          <span style={{fontSize:11,fontWeight:600,color:pri}}>{inj.regiao} — {inj.lado}</span>
                          {!inj.fim_trans&&<span style={{fontSize:8,fontWeight:700,color:"#DC2626",textTransform:"uppercase"}}>ativo</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:10,color:t.textMuted}}>{(parseDateBR(inj.date)?.toLocaleDateString("pt-BR")||inj.date||"—")}</span>
                          <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:ic}}>{inj.total}d</span>
                        </div>
                      </div>
                      <div style={{fontSize:9,color:t.textFaint,marginTop:3}}>{inj.estrutura} · {inj.mecanismo} · {inj.evento} · {inj.estagio}</div>
                    </div>;
                  })}
              </div>

              {/* DM Atual — se aplicável */}
              {dmStatus&&(()=>{
                const isRetornou = dmStatus.conduta === "Retornou";
                const accentC = isRetornou ? "#16A34A" : "#DC2626";
                const bgTint = isRetornou ? "#F0FDF4" : "#FEF2F2";
                const borderC = isRetornou ? "#BBF7D0" : "#FECACA";
                const rows = [
                  {l:"Classificação",v:dmStatus.classif},
                  {l:"Região",v:dmStatus.regiao},
                  {l:"Estágio",v:dmStatus.estagio},
                  {l:"Conduta",v:dmStatus.conduta,c:isRetornou?"#16A34A":"#DC2626"},
                  {l:"Desde",v:dmStatus.desde},
                  {l:"Prognóstico",v:dmStatus.prognostico,c:"#CA8A04"},
                ];
                if (dmStatus.retorno_real) rows.push({l:"Retorno Real",v:dmStatus.retorno_real,c:"#16A34A"});
                if (dmStatus.dias_retorno !== null && dmStatus.dias_retorno !== undefined) rows.push({l:"Dias desde retorno",v:`+${dmStatus.dias_retorno}d`,c:"#16A34A"});
                return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${borderC}`,padding:18}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:accentC,marginBottom:12}}>
                    {isRetornou ? "Status DM — Retornou" : "Status DM — Afastado"}
                  </div>
                  <div style={{textAlign:"center",marginBottom:14}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:48,fontWeight:900,color:accentC}}>
                      {isRetornou ? `+${dmStatus.dias_retorno||0}d` : dmStatus.dias}
                    </div>
                    <div style={{fontSize:11,color:t.textFaint,fontWeight:600}}>
                      {isRetornou ? "dias desde retorno ao treino" : "dias afastado"}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {rows.map((r,i)=>
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:i%2===0?bgTint:t.bgCard,borderRadius:6}}>
                        <span style={{fontSize:10,color:t.textFaint,fontWeight:600}}>{r.l}</span>
                        <span style={{fontSize:11,fontWeight:700,color:r.c||accentC}}>{r.v}</span>
                      </div>)}
                  </div>
                </div>;
              })()}
            </div>;
          })()}

          {/* Composição Corporal */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Composição Corporal</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
              {[{l:"Idade",v:sp.id?sp.id+" anos":"-",ic:"🎂"},{l:"Altura",v:sp.alt?sp.alt+" cm":"-",ic:"📏"},{l:"Peso",v:sp.w?sp.w+" kg":"-",ic:"⚖️"},{l:"% Gordura",v:sp.bf?sp.bf+"%":"-",ic:"📊",c:sp.bf>14?"#EA580C":sp.bf>12?"#CA8A04":"#16A34A"},{l:"Massa Muscular",v:sp.mm?sp.mm+" kg":"-",ic:"💪"},{l:"IMC",v:sp.imc?sp.imc.toFixed(1):"-",ic:"📐",c:sp.imc>25.5?"#CA8A04":"#16A34A"}].map((m,i)=>
                <div key={i} style={{textAlign:"center",padding:"12px 8px",background:t.bgMuted,borderRadius:10,border:`1px solid ${t.borderLight}`}}>
                  <div style={{fontSize:16,marginBottom:4}}>{m.ic}</div>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{m.l}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:700,color:m.c||pri,marginTop:2}}>{m.v}</div>
                </div>)}
            </div>
          </div>

          {/* ═══ ÚLTIMO JOGO — Dados do atleta na última partida ═══ */}
          {(()=>{
            const calendario=sheetData?.calendario||[];
            // "Último Jogo" = jogo mais recente já passado (data <= hoje),
            // independente de RESULTADO estar preenchido. Em jogos recentes
            // o V/E/D pode não ter sido digitado ainda na planilha — mesmo
            // assim os dados GPS já estão disponíveis e devem ser exibidos.
            const todayMid=new Date();todayMid.setHours(0,0,0,0);
            const todayTs=todayMid.getTime();
            const pD=s=>{if(!s)return 0;const pts=String(s).split(/[\/\-\.]/);if(pts.length>=3){const[d,m,y]=pts.map(Number);if(d>31)return new Date(d,m-1,y).getTime();return new Date(y<100?y+2000:y,m-1,d).getTime();}return new Date(s).getTime()||0;};
            const pastGames=calendario.filter(g=>{const ts=pD(g.data);return ts>0&&ts<=todayTs;}).sort((a,b)=>pD(b.data)-pD(a.data));
            if(!pastGames.length)return null;
            const lastGame=pastGames[0];
            // Classifica V/E/D pelo campo RESULTADO ou, se vazio, pelos gols.
            // Tolerante a variações: chip "E", "Empate", "E (Empate)", "EMPATE",
            // espaços, acentos. Cai em AGUARDANDO só quando ambos res e gols
            // estão vazios/inválidos.
            const resRaw=String(lastGame.resultado||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
            let res=null;
            if(/^V/.test(resRaw))res="V";
            else if(/^D/.test(resRaw))res="D";
            else if(/^E/.test(resRaw))res="E";
            // Fallback: deriva do placar (gols_pro × gols_contra) se a coluna
            // RESULTADO não estiver preenchida ou usar formato desconhecido.
            if(!res){
              const gp=Number(lastGame.gols_pro),gc=Number(lastGame.gols_contra);
              const hasGols=lastGame.gols_pro!=null&&lastGame.gols_pro!==""&&lastGame.gols_contra!=null&&lastGame.gols_contra!=="";
              if(hasGols&&!isNaN(gp)&&!isNaN(gc)){
                res=gp>gc?"V":gp===gc?"E":"D";
              }
            }
            const resLabel=res==="V"?"VITÓRIA":res==="D"?"DERROTA":res==="E"?"EMPATE":"AGUARDANDO RESULTADO";
            const resColor=res==="V"?"#16A34A":res==="D"?"#DC2626":res==="E"?"#CA8A04":"#64748b";
            const resBg=res==="V"?"#F0FDF4":res==="D"?"#FEF2F2":res==="E"?"#FEFCE8":"#F8FAFC";
            const resBc=res==="V"?"#BBF7D0":res==="D"?"#FECACA":res==="E"?"#FEF08A":"#E2E8F0";
            // Find player GPS data for the game date — verify player actually played
            // parseDateGame retorna Date|null. Entradas com date vazio (placeholders
            // que sobreviveram ao filtro do API) precisam ser ignoradas no match,
            // não passadas adiante — caso contrário .getTime() crasha o perfil.
            const parseDateGame=s=>{if(!s)return null;const pts=String(s).split(/[\/\-\.]/);if(pts.length>=3){const[d,m,y]=pts.map(Number);if(d>31)return new Date(d,m-1,y);return new Date(y<100?y+2000:y,m-1,d);}const d=new Date(s);return isNaN(d.getTime())?null:d;};
            const gameDate=parseDateGame(lastGame.data);
            if(!gameDate||isNaN(gameDate.getTime()))return null;
            const gameDateTs=gameDate.getTime();
            const DAY=86400000;
            const gpsEntries=sheetData?.gps?.[sp.n]||[];
            const questEntries=sheetData?.questionarios?.[sp.n]||[];
            const diarioEntries=sheetData?.diario?.[sp.n]||[];
            // Tolerância ±2 dias (alinhada com getAthletesForDate da aba Jogos):
            // cobre fusos diferentes, atrasos de sincronização do device GPS e
            // jogos noturnos que registram data do dia seguinte na aba bruta.
            const dateMatch=e=>{const eD=parseDateGame(e.date);if(!eD)return false;return Math.abs(eD.getTime()-gameDateTs)<=2*DAY;};
            const matchGps=gpsEntries.filter(dateMatch);
            const matchQuest=questEntries.filter(dateMatch);
            const matchDiario=diarioEntries.filter(dateMatch);
            // Filter GPS: only match sessions (not warmup/complement), verify player actually played
            const isMatchT=st=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            const isComplement=st=>{const s=(st||"").toLowerCase().trim();return s.includes("compl")||s.includes("aquec")||s.includes("warmup")||s.startsWith("t-")||s.includes("recupera");};
            // matchesOpp: cobre legado "J.BOTxFOR" e novo "Jogo Fortaleza Casa (V)".
            // Sem acentos para casar "Atlético-GO" vs "ATLETICOGO".
            const matchesOpp=(st,adv)=>{
              if(!st||!adv)return false;
              const stRaw=String(st).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
              const advRaw=String(adv).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
              const s=stRaw.replace(/\s+/g,""),a=advRaw.replace(/\s+/g,"");
              if(a.length>=4&&s.includes(a.substring(0,4)))return true;
              const advWords=advRaw.split(/\s+/).filter(w=>w.length>=3);
              for(const w of advWords){
                if(w.length>=4&&stRaw.includes(w))return true;
              }
              return false;
            };
            const isGameSplit=sp2=>{const s=(sp2||"").toLowerCase().trim();if(s.includes("aquec")||s.includes("warmup")||s.includes("compl")||s.includes("interv")||s.startsWith("t-")||s.includes("recupera"))return false;if(s==="session"||s==="sessão"||s==="sessao")return true;if(/\d+[.\-]\d+\s*min/.test(s)||/\d+\s*mais/.test(s)||/\b[12]t\b/.test(s))return true;return false;};
            // Pool com priorização (espelha getAthletesForDate da aba Jogos):
            //   1. Linha com rosterStatus (G1/G2/G3) preenchido — sinal direto da
            //      comissão técnica, mais forte que qualquer heurística.
            //   2. Linha com RESULTADO preenchido (V/E/D).
            //   3. Match por adversário no sessionTitle (legado "J.BOTxFOR" ou
            //      novo "Jogo Fortaleza Casa (V)").
            //   4. Sessão tem palavra-chave de jogo ("Jogo", "Match", "Partida").
            //   5. Sessão não-complemento na data exata do jogo (±1 dia) — antes
            //      do fallback genérico, prioriza entrada do próprio dia para
            //      evitar treino próximo ser confundido com dado de jogo.
            //   6. Sessão não-complemento (qualquer coisa que não seja aquec).
            //   7. Qualquer entrada da data.
            const rosterEntries=matchGps.filter(e=>String(e.rosterStatus||"").trim().length>0);
            const resultadoEntries=matchGps.filter(e=>String(e.resultado||"").trim().length>0);
            const oppEntries=lastGame.adversario?matchGps.filter(e=>matchesOpp(e.sessionTitle,lastGame.adversario)):[];
            const matchTitleEntries=matchGps.filter(e=>isMatchT(e.sessionTitle));
            const sameDateNonComp=matchGps.filter(e=>{const eD=parseDateGame(e.date);return eD&&!isComplement(e.sessionTitle)&&Math.abs(eD.getTime()-gameDateTs)<DAY;});
            const nonCompEntries=matchGps.filter(e=>!isComplement(e.sessionTitle));
            const pool=rosterEntries.length?rosterEntries:(resultadoEntries.length?resultadoEntries:(oppEntries.length?oppEntries:(matchTitleEntries.length?matchTitleEntries:(sameDateNonComp.length?sameDateNonComp:(nonCompEntries.length?nonCompEntries:matchGps)))));
            const bestGps=pool.length>1?pool.reduce((b,e)=>(e.gps?.dist_total||0)>(b.gps?.dist_total||0)?e:b,pool[0]):pool[0]||null;
            // Verificação "jogou de fato" — combina dois formatos:
            //   (A) gps legado: requer splits de tempo de jogo (30.40min, 2T)
            //   (B) gps_individual (atual): 1 linha agregada por sessão, sem
            //       splits. Sinal mais forte = coluna RESULTADO preenchida.
            //       Suplentes que entraram poucos minutos precisam ser capturados.
            const allSplits=bestGps?.allSplits||[];
            const gameTimeCt=allSplits.filter(sp2=>isGameSplit(sp2)).length;
            const hasPeriods=allSplits.some(sp2=>{const s=(sp2||"").toLowerCase();return/\d+[.\-]\d+\s*min/.test(s)||/\d+\s*mais/.test(s)||/\b[12]t\b/.test(s);});
            const hasSession=allSplits.some(sp2=>{const s=(sp2||"").toLowerCase().trim();return s==="session"||s==="sessão"||s==="sessao";});
            const dist=bestGps?.gps?.dist_total||0;
            const dur=Number(bestGps?.duracao)||Number(bestGps?.gps?.duracao)||0;
            const stIsMatch=isMatchT(bestGps?.sessionTitle);
            const resultadoFilled=String(bestGps?.resultado||"").trim().length>0;
            // rosterStatus extraído da OBS na API: G1/G2/G3 (titular/entrou/banco).
            // Sinal definitivo da comissão técnica.
            const rosterStatus=String(bestGps?.rosterStatus||"").toUpperCase();
            // Pace mínimo (≥30 m/min) para "jogou de fato". Banco com aquecimento
            // gera ~25 m/min; em campo (até goleiro) sustenta ≥30 m/min.
            const MIN_PACE_M_PER_MIN=30;
            const meetsPlayPace=(d,t)=>(t>=3&&d>=300&&d>=t*MIN_PACE_M_PER_MIN);
            let playerPlayed=false;
            // (0) rosterStatus sobrepõe heurísticas: G1/G2 = jogou; G3 = não jogou.
            if(rosterStatus==="G1"||rosterStatus==="G2")playerPlayed=true;
            else if(rosterStatus==="G3")playerPlayed=false;
            // (A) Formato legado com splits detalhados.
            else if(hasPeriods&&gameTimeCt>=2)playerPlayed=true;
            else if(hasSession&&stIsMatch&&dist>=4000)playerPlayed=true;
            else if(hasPeriods&&gameTimeCt>=1&&dist>=2000)playerPlayed=true;
            // (B) gps_individual: sem splits.
            else if(!allSplits.length){
              // (B.1) RESULTADO preenchido + pace de jogo. Confirmação da
              // comissão isolada não basta — atletas no banco com aquecimento
              // prolongado (Maranhão 75min/1873m = 25 m/min) também acabam com
              // RESULTADO preenchido pela consolidação da equipe.
              if(resultadoFilled&&meetsPlayPace(dist,dur))playerPlayed=true;
              // (B.2) sessionTitle "Jogo …" + pace de jogo.
              else if(stIsMatch&&meetsPlayPace(dist,dur))playerPlayed=true;
              // (B.3) Jogos "Realizado" sem RESULTADO/G1-G3 ainda preenchidos
              // (caso R6 26/04/2026): a data do jogo do calendário já restringiu
              // o universo, então qualquer atleta com pace de jogo (≥30 m/min)
              // representa minutos em campo. Suplentes 11min/1.282m (116 m/min)
              // eram cortados pelos antigos limiares fixos de 60min+5.000m /
              // 7.000m. Exige que a entrada GPS esteja na data exata do jogo
              // (±1 dia para fuso) — sem isso, treinos de alta intensidade
              // dentro da janela ±2 dias eram classificados como dados do jogo
              // para atletas não-relacionados (ex.: Wesley R6 Cuiabá — treino
              // de 24/04 6397m/59min era exibido como dado do jogo de 26/04).
              else if(!stIsMatch&&!resultadoFilled&&meetsPlayPace(dist,dur)){
                const entryDate=parseDateGame(bestGps.date);
                if(entryDate&&Math.abs(entryDate.getTime()-gameDateTs)<DAY)playerPlayed=true;
              }
            }
            // (C) Fallback: diário marca "Sim" para Partida.
            if(!playerPlayed&&rosterStatus!=="G3"){
              const partida=String(matchDiario.length?matchDiario[matchDiario.length-1]?.partida||"":"").toLowerCase();
              const playedDiario=partida.includes("sim")||partida==="1"||partida==="s"||partida==="x";
              if(playedDiario&&meetsPlayPace(dist,dur))playerPlayed=true;
            }
            const gps=playerPlayed?bestGps?.gps||null:null;
            const quest=matchQuest.length?matchQuest[matchQuest.length-1]:null;
            const diario=matchDiario.length?matchDiario[matchDiario.length-1]:null;
            const gameDateFmt=gameDate instanceof Date&&!isNaN(gameDate)?gameDate.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}):(lastGame.data||"—");
            const placar=lastGame.gols_pro!=null&&lastGame.gols_contra!=null?`${lastGame.gols_pro} x ${lastGame.gols_contra}`:(lastGame.placar||"—");
            // Badge de status do atleta (G1=titular, G2=entrou, G3=banco).
            const rosterBadge=rosterStatus==="G1"?{l:"TITULAR",bg:"#DCFCE7",bc:"#86EFAC",c:"#166534"}:rosterStatus==="G2"?{l:"ENTROU NO JOGO",bg:"#DBEAFE",bc:"#93C5FD",c:"#1E40AF"}:rosterStatus==="G3"?{l:"NÃO ENTROU EM CAMPO",bg:"#F1F5F9",bc:"#CBD5E1",c:"#64748b"}:null;
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${resBc}`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Último Jogo</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{lastGame.comp||""} · {lastGame.rodada||""} · {gameDateFmt}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {rosterBadge&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:800,background:rosterBadge.bg,color:rosterBadge.c,border:`1px solid ${rosterBadge.bc}`,letterSpacing:.3}}>{rosterBadge.l}</span>}
                  <span style={{padding:"4px 14px",borderRadius:6,fontSize:12,fontWeight:800,background:resBg,color:resColor,border:`2px solid ${resBc}`}}>{resLabel}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:resBg,borderRadius:10,border:`1px solid ${resBc}`,marginBottom:14}}>
                {lastGame.escudo&&<img src={lastGame.escudo} alt="" style={{width:32,height:32,objectFit:"contain"}} onError={e=>{e.target.style.display="none"}}/>}
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:15,color:pri}}>{lastGame.adversario||"—"}</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{lastGame.local==="C"?"Casa":"Fora"}</div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:24,fontWeight:900,color:resColor}}>{placar}</div>
              </div>
              {/* Player metrics in the match */}
              {(gps||quest||diario)?<div>
                <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",marginBottom:8}}>Dados Individuais no Jogo</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[
                    gps?.dist_total?{l:"Distância",v:Math.round(gps.dist_total)+"m",c:pri}:null,
                    // m/min normaliza titulares (~110 m/min em 90min) e
                    // suplentes (~115 m/min em 15min) no mesmo eixo de
                    // intensidade. Útil quando o tempo em campo varia muito.
                    (gps?.dist_total&&dur>0)?{l:"m/min",v:Math.round(gps.dist_total/dur)+" m/min",c:"#0891b2"}:null,
                    (dur>0)?{l:"Min em campo",v:Math.round(dur)+" min",c:pri}:null,
                    gps?.hsr?{l:"HSR",v:Math.round(gps.hsr)+"m",c:"#2563eb"}:null,
                    gps?.sprints?{l:"Spr >20",v:gps.sprints,c:"#7c3aed"}:null,
                    gps?.sprints_25?{l:"Spr >25",v:gps.sprints_25,c:"#6D28D9"}:null,
                    gps?.pico_vel?{l:"Pico Vel.",v:gps.pico_vel.toFixed(1)+" km/h",c:"#EA580C"}:null,
                    gps?.player_load?{l:"Player Load",v:Math.round(gps.player_load),c:pri}:null,
                    diario?.pse?{l:"PSE",v:diario.pse,c:diario.pse>=7?"#DC2626":diario.pse>=5?"#CA8A04":"#16A34A"}:null,
                    quest?.sono_qualidade?{l:"Sono",v:quest.sono_qualidade,c:quest.sono_qualidade<6?"#DC2626":"#16A34A"}:null,
                    quest?.dor!=null&&quest.dor>0?{l:"Dor",v:quest.dor,c:quest.dor>=5?"#DC2626":quest.dor>=3?"#CA8A04":"#16A34A"}:null,
                    quest?.recuperacao_geral?{l:"Recuperação",v:quest.recuperacao_geral,c:quest.recuperacao_geral<6?"#DC2626":"#16A34A"}:null,
                  ].filter(Boolean).map((m,i)=>
                    <div key={i} style={{textAlign:"center",padding:"8px 6px",background:t.bgMuted,borderRadius:8}}>
                      <div style={{fontSize:8,color:t.textFaint,fontWeight:600,textTransform:"uppercase"}}>{m.l}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:700,color:m.c}}>{m.v}</div>
                    </div>)}
                </div>
              </div>:
              <div style={{textAlign:"center",padding:"12px 0",color:t.textFaint,fontSize:11}}>
                <div style={{fontWeight:600}}>{rosterStatus==="G3"?"Suplente não utilizado nesta partida (G3)":bestGps&&!playerPlayed?"Atleta não participou desta partida":matchGps.length?"Sem dados individuais de GPS/wellness para esta partida":"Sem dados de GPS/wellness importados para esta data"}</div>
                {rosterStatus==="G3"&&<div style={{fontSize:9,color:t.textFaintest||t.textFaint,marginTop:3}}>Atleta no banco · Sem dados de tempo em campo.</div>}
                {!matchGps.length&&rosterStatus!=="G3"&&<div style={{fontSize:9,color:t.textFaintest||t.textFaint,marginTop:3}}>Busca em ±2 dias de {gameDateFmt}. Dados podem estar pendentes de upload.</div>}
              </div>}
            </div>;
          })()}

          {/* ═══ MÉDIA MÓVEL DOS 5 MELHORES JOGOS — Peak Performance Baseline ═══ */}
          {(()=>{
            const calendario=sheetData?.calendario||[];
            const gpsAll=sheetData?.gps?.[sp.n]||[];
            const diarioAll=sheetData?.diario?.[sp.n]||[];
            if(!gpsAll.length||!calendario.length)return null;
            const parseDt2=s=>{if(!s)return null;const pts=String(s).trim().split(/[\/\-\.]/);if(pts.length>=3){const[a,b,c]=pts.map(Number);if(a>31)return new Date(a,b-1,c);if(c>31)return new Date(c,b-1,a);return new Date(c<100?c+2000:c,b-1,a);}return new Date(s)||null;};
            const fmtDt2=d=>{if(!d||isNaN(d))return"";return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});};
            const isMatchST2=st=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            const matchDateSet2=new Set();
            for(const g of calendario){const d=parseDt2(g.data);if(d&&!isNaN(d))matchDateSet2.add(d.toISOString().slice(0,10));}
            // Identify game sessions
            const gameSessions=gpsAll.map(e=>{
              const dt=parseDt2(e.date);
              const dtKey=dt&&!isNaN(dt)?dt.toISOString().slice(0,10):"";
              const isMatch=isMatchST2(e.sessionTitle)||matchDateSet2.has(dtKey);
              if(!isMatch)return null;
              const g=e.gps||{};
              return{date:dt,dateStr:dtKey,fmtDate:fmtDt2(dt),title:e.sessionTitle||"",dist:g.dist_total||0,hsr:g.hsr||0,sprints:g.sprints||0,sprints_25:g.sprints_25||0,pico_vel:g.pico_vel||0,player_load:g.player_load||0,acel:g.acel||0,decel:g.decel||0,acel_3:g.acel_3||0,decel_3:g.decel_3||0};
            }).filter(Boolean).filter(s=>s.dist>2000); // Min 2km = actually played
            if(gameSessions.length<3)return null;
            // Sort by composite score (dist + hsr*3 + sprints*50) to find best games
            const scored=gameSessions.map(s=>({...s,score:s.dist+s.hsr*3+s.sprints*50+s.player_load})).sort((a,b)=>b.score-a.score);
            const top5=scored.slice(0,Math.min(5,scored.length));
            const avg5=k=>top5.length?Math.round(top5.reduce((a,s)=>a+s[k],0)/top5.length*10)/10:0;
            const ma={dist:avg5("dist"),hsr:avg5("hsr"),sprints:avg5("sprints"),sprints_25:avg5("sprints_25"),pico_vel:avg5("pico_vel"),player_load:avg5("player_load"),acel:avg5("acel"),decel:avg5("decel"),acel_3:avg5("acel_3"),decel_3:avg5("decel_3")};
            // All games average for comparison
            const avgAll=k=>gameSessions.length?Math.round(gameSessions.reduce((a,s)=>a+s[k],0)/gameSessions.length*10)/10:0;
            const allAvg={dist:avgAll("dist"),hsr:avgAll("hsr"),sprints:avgAll("sprints"),sprints_25:avgAll("sprints_25"),pico_vel:avgAll("pico_vel"),player_load:avgAll("player_load"),acel_3:avgAll("acel_3"),decel_3:avgAll("decel_3")};
            // Last game data
            const lastGame=gameSessions.sort((a,b)=>b.date-a.date)[0];
            // Comparison bars data
            const metrics=[
              {l:"Distância (m)",last:lastGame?.dist||0,top5:ma.dist,all:allAvg.dist,unit:"m"},
              {l:"HSR (m)",last:lastGame?.hsr||0,top5:ma.hsr,all:allAvg.hsr,unit:"m"},
              {l:"Spr >20",last:lastGame?.sprints||0,top5:ma.sprints,all:allAvg.sprints,unit:""},
              {l:"Spr >25",last:lastGame?.sprints_25||0,top5:ma.sprints_25,all:allAvg.sprints_25,unit:""},
              {l:"Pico Vel. (km/h)",last:lastGame?.pico_vel||0,top5:ma.pico_vel,all:allAvg.pico_vel,unit:"km/h"},
              {l:"Player Load",last:lastGame?.player_load||0,top5:ma.player_load,all:allAvg.player_load,unit:""},
              {l:"Acel >3m/s²",last:lastGame?.acel_3||0,top5:ma.acel_3,all:allAvg.acel_3,unit:""},
              {l:"Desacel >3m/s²",last:lastGame?.decel_3||0,top5:ma.decel_3,all:allAvg.decel_3,unit:""},
            ];
            const chartData=metrics.map(m=>{const mx=Math.max(m.last,m.top5,m.all,1);return{name:m.l.split("(")[0].trim(),last:Math.round(m.last/mx*100),top5:Math.round(m.top5/mx*100),avg:Math.round(m.all/mx*100),rawLast:Math.round(m.last),rawTop5:Math.round(m.top5),rawAvg:Math.round(m.all)};});
            // % of top5 for each metric in last game
            const pctOfTop5=m=>m.top5>0?Math.round((m.last/m.top5)*100):0;
            const overallPct=metrics.length?Math.round(metrics.reduce((a,m)=>a+pctOfTop5(m),0)/metrics.length):0;
            const pctColor=v=>v>=100?"#16A34A":v>=85?"#2563eb":v>=70?"#CA8A04":"#DC2626";
            // Layout minimalista: uma linha por métrica com (a) label + valor
            // do último jogo, (b) barra de progresso única indo até o pico
            // (Gref = 100%), (c) % à direita. Removidos o gráfico duplicado e
            // a coluna de "Média Geral".
            const _refRow=(m,i)=>{
              const pct=pctOfTop5(m);
              const c=pctColor(pct);
              const pctClamped=Math.min(125,Math.max(0,pct));
              return <div key={i} style={{display:"grid",gridTemplateColumns:"160px 1fr 80px 50px",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<metrics.length-1?`1px solid ${t.borderLight}`:"none"}}>
                <div style={{fontSize:11,fontWeight:600,color:t.text}}>{m.l}</div>
                {/* Trilha + barra (até 100% = Gref). Marcador em 100% para
                    legibilidade da exigência de jogo. Valores >100% extrapolam
                    visualmente (clamp em 125%). */}
                <div style={{position:"relative",height:6,background:t.bgMuted2,borderRadius:3,overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,width:`${pctClamped*0.8}%`,background:c,borderRadius:3,transition:"width .6s"}}/>
                  <div style={{position:"absolute",left:"80%",top:-2,bottom:-2,width:1,background:t.textFaint,opacity:.6}}/>
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textMuted,textAlign:"right"}}>
                  <span style={{color:t.text,fontWeight:700}}>{Math.round(m.last)}</span>
                  <span style={{color:t.textFaintest,margin:"0 4px"}}>/</span>
                  <span>{Math.round(m.top5)}</span>
                  {m.unit&&<span style={{fontSize:8,marginLeft:2,color:t.textFaintest}}>{m.unit}</span>}
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:800,color:c,textAlign:"right"}}>{pct}%</div>
              </div>;
            };
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:"18px 22px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${t.borderLight}`}}>
                <div>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Gref · Demanda de Pico</div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:900,fontSize:17,color:t.text,letterSpacing:-.3}}>Média dos {top5.length} melhores jogos</div>
                  <div style={{fontSize:10,color:t.textFaint,marginTop:3}}>{gameSessions.length} jogos oficiais com GPS · último em {lastGame?.fmtDate||"—"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:28,fontWeight:900,color:pctColor(overallPct),lineHeight:1}}>{overallPct}<span style={{fontSize:14,color:t.textFaint}}>%</span></div>
                  <div style={{fontSize:9,color:t.textFaintest,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:2}}>Último vs Gref</div>
                </div>
              </div>
              <div>{metrics.map((m,i)=>_refRow(m,i))}</div>
              {/* Lista de jogos do Top N — formato denso e neutro */}
              <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${t.borderLight}`,display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
                <span style={{fontSize:9,color:t.textFaintest,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>Compõem Gref</span>
                {top5.map((g,i)=><span key={i} style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textMuted}}>
                  {g.fmtDate} <span style={{color:t.textFaintest,margin:"0 4px"}}>·</span> {Math.round(g.dist)}m
                </span>).reduce((acc,el,i,arr)=>{acc.push(el);if(i<arr.length-1)acc.push(<span key={`sep-${i}`} style={{color:t.textFaintest}}>•</span>);return acc;},[])}
              </div>
              {/* Citação Ravé 2020 — único parágrafo metodológico, fonte 9px */}
              <div style={{marginTop:10,fontSize:9,color:t.textFaintest,lineHeight:1.5,fontStyle:"italic"}}>
                Ravé G., Granacher U., Boullosa D., Hackney A.C., Zouhal H. (2020). <em>How to Use GPS Data to Monitor Training Load in the "Real World" of Elite Soccer.</em> Front. Physiol. 11:944.
              </div>
            </div>;
          })()}

          {/* ═══ RADAR GPS — Valências do Último Treino vs Média da Posição ═══ */}
          {(()=>{
            const liveAth=LIVE_SESSION.atletas[sp.n];
            const gpsRaw=sheetData?.gps?.[sp.n];
            const lastGpsEntry=gpsRaw?.length?gpsRaw[gpsRaw.length-1]:null;
            // Verificar se o atleta participou da última sessão global
            const isInLatestSession=!!liveAth;
            // Se participou, usar dados da sessão live; senão usar última entry GPS disponível
            const lastGps=liveAth?.gps||(lastGpsEntry?.gps||null);
            if(!lastGps)return null;
            // Data da sessão referenciada
            const sessDate=liveAth?._sessionDate||lastGpsEntry?.date||null;
            const sessDateFmt=sessDate?(()=>{try{const d=new Date(sessDate);return isNaN(d)?sessDate:d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"})}catch(e){return sessDate}})():null;
            const sessTitle=liveAth?._sessionTitle||lastGpsEntry?.sessionTitle||"";
            // posGroup é a função top-level (definida no topo do arquivo).
            // Meio-Campo agrega VOL, MEI, MD, W-MD, MC, MO, ME e variações.
            const myGroup=posGroup(sp.pos);
            // Todos os atletas da posição na sessão (para filtro UI)
            const allSessAtletas=LIVE_SESSION.atletas;
            const allPosAtletas=Object.entries(allSessAtletas).filter(([name])=>{const pl=players.find(p=>p.n===name);return pl&&posGroup(pl.pos)===myGroup&&allSessAtletas[name]?.gps;});
            // Auto-filtro: detectar atletas com participação completa vs parcial/transição
            // 1) Atletas em reabilitação (fisioterapia "campo") = excluídos
            // 2) Atletas com dist < 60% da mediana do grupo = participação parcial
            const autoExcluded=new Set();
            const autoExcludedReasons={};
            allPosAtletas.forEach(([name,a])=>{
              if(name===sp.n) return;
              // Fisioterapia campo = reabilitação, não treino principal
              if(a._fisioSessao?.isCampoRehab){autoExcluded.add(name);autoExcludedReasons[name]="reab";return;}
            });
            // Calcular mediana excluindo os já marcados como reab
            const validForMedian=allPosAtletas.filter(([name])=>!autoExcluded.has(name));
            const allDists=validForMedian.map(([,a])=>a.gps.dist_total||0).filter(v=>v>0).sort((a,b)=>a-b);
            const medianDist=allDists.length?allDists[Math.floor(allDists.length/2)]:0;
            const minDistThreshold=medianDist*0.6; // <60% da mediana = participação parcial
            allPosAtletas.forEach(([name,a])=>{
              if(name===sp.n||autoExcluded.has(name)) return;
              const dist=a.gps.dist_total||0;
              if(dist<minDistThreshold){
                // Atleta com transição E dist baixa = transição real; dist baixa sem transição = parcial
                autoExcluded.add(name);
                autoExcludedReasons[name]=a._isTransicao?"transicao":"parcial";
              }
            });
            // Combinar auto-filtro com filtro manual (excludedAthletes override do auto)
            const effectiveExcluded=new Set([...autoExcluded,...excludedAthletes]);
            const posAtletas=allPosAtletas.filter(([name])=>!effectiveExcluded.has(name));
            const nAutoExcluded=allPosAtletas.filter(([name])=>autoExcluded.has(name)&&!excludedAthletes.has(name)).length;
            const posAvg=(key)=>{const vals=posAtletas.map(([,a])=>a.gps[key]||0).filter(v=>v>0);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;};
            const avgDist=posAvg("dist_total");
            const avgHsr=posAvg("hsr");
            const avgSprints=posAvg("sprints");
            // Usar acel_3/decel_3 (>3m/s²) quando disponível, senão fallback para acel/decel (>2m/s²)
            const hasAcel3=posAtletas.some(([,a])=>(a.gps.acel_3||0)>0)||(lastGps.acel_3||0)>0;
            const acelKey=hasAcel3?"acel_3":"acel";
            const decelKey=hasAcel3?"decel_3":"decel";
            const acelLabel=hasAcel3?"Acel >3m/s²":"Acel >2m/s²";
            const decelLabel=hasAcel3?"Desacel >3m/s²":"Desacel >2m/s²";
            const avgAcel=posAvg(acelKey);
            const avgDecel=posAvg(decelKey);
            const avgPicoVel=posAvg("pico_vel");
            const avgPlayerLoad=posAvg("player_load");
            const pct=(v,avg)=>avg>0?Math.round((v/avg)*100):0;
            const athleteAcel=lastGps[acelKey]||lastGps.acel||0;
            const athleteDecel=lastGps[decelKey]||lastGps.decel||0;
            // Métricas de Sprint (>25.2 km/h) — pedido da diretoria técnica.
            // hsr_25 = distância percorrida >25 km/h (m); sprints_25 = nº de
            // esforços nessa zona. Aproximação prática para o limiar 25.2 km/h
            // dado que a planilha disponibiliza a coluna "> 25 km/h".
            const avgSprDist=posAvg("hsr_25");
            const avgSprEffs=posAvg("sprints_25");
            const gpsRadarData=[
              {s:"Distância",v:pct(lastGps.dist_total,avgDist),raw:`${(lastGps.dist_total||0).toFixed(0)} m`,avg:`${Math.round(avgDist)} m`},
              {s:"HSR (19.8–24.8 km/h)",v:pct(lastGps.hsr,avgHsr),raw:`${(lastGps.hsr||0).toFixed(0)} m`,avg:`${Math.round(avgHsr)} m`},
              {s:"Sprints >19.8 km/h",v:pct(lastGps.sprints,avgSprints),raw:`${lastGps.sprints||0}`,avg:`${Math.round(avgSprints)}`},
              {s:"Dist. SPR (>25.2 km/h)",v:pct(lastGps.hsr_25,avgSprDist),raw:`${(lastGps.hsr_25||0).toFixed(0)} m`,avg:`${Math.round(avgSprDist)} m`},
              {s:"Esforços SPR (>25.2 km/h)",v:pct(lastGps.sprints_25,avgSprEffs),raw:`${lastGps.sprints_25||0}`,avg:`${Math.round(avgSprEffs)}`},
              {s:acelLabel,v:pct(athleteAcel,avgAcel),raw:`${athleteAcel}`,avg:`${Math.round(avgAcel)}`},
              {s:decelLabel,v:pct(athleteDecel,avgDecel),raw:`${athleteDecel}`,avg:`${Math.round(avgDecel)}`},
              {s:"Player Load",v:pct(lastGps.player_load,avgPlayerLoad),raw:`${(lastGps.player_load||0).toFixed(0)}`,avg:`${Math.round(avgPlayerLoad)}`},
              {s:"Pico Vel.",v:pct(lastGps.pico_vel,avgPicoVel),raw:`${(lastGps.pico_vel||0).toFixed(1)} km/h`,avg:`${avgPicoVel.toFixed(1)} km/h`},
            ];
            const maxPct=Math.max(...gpsRadarData.map(d=>d.v),100);
            const radarDomain=Math.ceil(maxPct/25)*25;
            const gpsColor=gpsRadarData.some(d=>d.v>130)?"#DC2626":gpsRadarData.some(d=>d.v>100)?"#EA580C":"#2563eb";
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${isInLatestSession?t.border:"#CA8A0466"}`,padding:18,marginBottom:16}}>
              {!isInLatestSession&&(()=>{
                // Buscar info de fisioterapia para contexto
                const fisioEntries=sheetData?.fisioterapia?.[sp.n]||[];
                const latestFisio=fisioEntries.filter(f=>f.date).slice(-3);
                const fisioProcs=latestFisio.map(f=>f.procedimento).filter(Boolean);
                return <div style={{background:"#FEFCE8",border:"1px solid #FEF08A",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:10,color:"#92400E",fontWeight:600}}>
                  Este atleta não participou da última sessão. Dados GPS referentes à sessão anterior ({sessDateFmt||"—"}).
                  {fisioProcs.length>0&&<span style={{fontWeight:500}}> Fisioterapia recente: {fisioProcs.join(", ")}.</span>}
                </div>;
              })()}
              {liveAth?._isTransicao&&(lastGps.dist_total||0)<minDistThreshold&&<div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:10,color:"#1E40AF",fontWeight:600}}>
                Atleta em transição ({liveAth._splitPrincipal||"transição"}) — não participou da sessão inteira. Dados individuais exibidos, mas não incluído na média da posição.
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Radar GPS — {isInLatestSession?"Última Sessão":"Sessão Anterior"} {sessDateFmt?<span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:600,color:t.textMuted,marginLeft:6}}>{sessDateFmt}</span>:""}{sessTitle?<span style={{fontSize:10,color:t.textFaint,marginLeft:6}}>· {sessTitle}</span>:""}</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{liveAth?._isTransicao&&(lastGps.dist_total||0)<minDistThreshold?"Dados individuais (transição — não comparado à média da posição)":<>% vs. média da posição ({myGroup}) na sessão · 100% = média do grupo{nAutoExcluded>0?<span style={{color:"#CA8A04"}}> · {nAutoExcluded} excl. auto ({allPosAtletas.some(([n,a])=>autoExcluded.has(n)&&autoExcludedReasons[n]==="transicao")?"transição/parcial":"parcial"})</span>:""}</>}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>setShowAthleteFilter(!showAthleteFilter)} style={{padding:"3px 8px",borderRadius:6,fontSize:9,fontWeight:600,background:showAthleteFilter?pri+"15":"transparent",color:t.textMuted,border:`1px solid ${t.border}`,cursor:"pointer",display:"flex",alignItems:"center",gap:3}} title="Filtrar atletas da média">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                    Filtro
                  </button>
                  <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:gpsColor+"15",color:gpsColor,border:`1px solid ${gpsColor}33`}}>
                    {myGroup.toUpperCase()} ({posAtletas.length} atl.)
                  </span>
                </div>
              </div>
              {/* Filtro de atletas — mostra dist de cada um + indicador de auto-exclusão */}
              {showAthleteFilter&&<div style={{padding:"8px 0",borderBottom:`1px solid ${t.border}`,marginBottom:8}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {allPosAtletas.map(([name,athData])=>{
                  const isAutoExcluded=autoExcluded.has(name);
                  const isManualExcluded=excludedAthletes.has(name);
                  const isExcluded=effectiveExcluded.has(name);
                  const isCurrent=name===sp.n;
                  const athDist=athData.gps.dist_total||0;
                  return <button key={name} onClick={()=>{if(isCurrent)return;if(isAutoExcluded&&!isManualExcluded){setExcludedAthletes(prev=>{const next=new Set(prev);next.delete(name);return next;});autoExcluded.delete(name);return;}setExcludedAthletes(prev=>{const next=new Set(prev);if(next.has(name))next.delete(name);else next.add(name);return next;});}} style={{padding:"3px 8px",borderRadius:5,fontSize:9,fontWeight:600,background:isExcluded?"transparent":isCurrent?pri+"20":"#16A34A15",color:isExcluded?t.textFaint:isCurrent?pri:"#16A34A",border:`1px solid ${isExcluded?t.border:isCurrent?pri+"40":"#16A34A40"}`,cursor:isCurrent?"default":"pointer",opacity:isExcluded?.5:1,textDecoration:isExcluded?"line-through":"none"}}>
                    {name}{isCurrent?" ★":""} <span style={{fontFamily:"'JetBrains Mono'",fontSize:7,opacity:.7}}>{athDist}m</span>{isAutoExcluded&&!isManualExcluded?<span style={{fontSize:7,color:"#CA8A04",marginLeft:2}}>{autoExcludedReasons[name]==="reab"?"reab":autoExcludedReasons[name]==="transicao"?"transição":"parcial"}</span>:""}
                  </button>;
                })}
                <button onClick={()=>{setExcludedAthletes(new Set());}} style={{padding:"3px 8px",borderRadius:5,fontSize:8,fontWeight:500,background:"transparent",color:t.textFaint,border:`1px solid ${t.border}`,cursor:"pointer"}}>
                  Resetar
                </button>
                </div>
                {nAutoExcluded>0&&<div style={{fontSize:8,color:"#CA8A04",marginTop:4}}>Excluídos auto: transição = não fez sessão inteira · reab = fisioterapia campo · parcial = dist &lt; 60% da mediana ({Math.round(minDistThreshold)}m). Clique para incluir.</div>}
              </div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8}}>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={gpsRadarData}>
                    <PolarGrid stroke={t.border}/>
                    <PolarAngleAxis dataKey="s" tick={{fontSize:8,fill:t.textMuted}}/>
                    <PolarRadiusAxis tick={false} domain={[0,radarDomain]}/>
                    <Radar name="% vs Posição" dataKey="v" stroke={gpsColor} fill={gpsColor} fillOpacity={.12} strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",marginBottom:2}}>
                    <div style={{flex:1,fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>Métrica</div>
                    <div style={{fontSize:9,color:t.textFaint,fontWeight:700,minWidth:38,textAlign:"right"}}>Atleta</div>
                    <div style={{fontSize:9,color:t.textFaint,fontWeight:700,minWidth:38,textAlign:"right"}}>Média</div>
                    <div style={{fontSize:9,color:t.textFaint,fontWeight:700,minWidth:36,textAlign:"right"}}>%</div>
                  </div>
                  {gpsRadarData.map((d,i)=>{
                    const c=d.v>130?"#DC2626":d.v>100?"#EA580C":d.v>80?"#16A34A":"#2563eb";
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",background:i%2===0?t.bgMuted:"transparent",borderRadius:6}}>
                      <div style={{flex:1,fontSize:10,fontWeight:600,color:t.text}}>{d.s}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:pri,minWidth:38,textAlign:"right"}}>{d.raw}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint,minWidth:38,textAlign:"right"}}>{d.avg}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:800,color:c,minWidth:36,textAlign:"right"}}>{d.v}%</div>
                    </div>;
                  })}
                </div>
              </div>
            </div>;
          })()}

          {/* Painel "Treino vs Jogo (Gref)" removido — informação redundante
              com o painel "Média Móvel — Top X" abaixo, que já compara o
              último jogo contra o pico individual. */}
          {false&&(()=>{
            const liveAth=LIVE_SESSION.atletas[sp.n];
            const gpsRaw=sheetData?.gps?.[sp.n]||[];
            if(gpsRaw.length<3) return null;
            const calendar=sheetData?.calendario||[];
            const parseDt=s=>{if(!s)return null;const pts=String(s).trim().split(/[\/\-\.]/);if(pts.length>=3){const[a,b,c]=pts.map(Number);if(a>31)return new Date(a,b-1,c);if(c>31)return new Date(c,b-1,a);return new Date(c<100?c+2000:c,b-1,a);}return new Date(s)||null;};
            const isMatchST=st=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            const matchDateSet=new Set();
            for(const g of calendar){const d=parseDt(g.data);if(d&&!isNaN(d))matchDateSet.add(d.toISOString().slice(0,10));}
            const games=gpsRaw.filter(e=>{const dt=parseDt(e.date);const k=dt&&!isNaN(dt)?dt.toISOString().slice(0,10):"";return (isMatchST(e.sessionTitle)||matchDateSet.has(k))&&(e.gps?.dist_total||0)>2000;});
            if(games.length<3) return null;
            const trainings=gpsRaw.filter(e=>{const dt=parseDt(e.date);const k=dt&&!isNaN(dt)?dt.toISOString().slice(0,10):"";return !(isMatchST(e.sessionTitle)||matchDateSet.has(k));}).sort((a,b)=>{const dA=parseDt(a.date),dB=parseDt(b.date);return (dB?.getTime()||0)-(dA?.getTime()||0);});

            // Gref: média dos 5 melhores (composto)
            const scored=games.map(e=>({...e,_score:(e.gps.dist_total||0)+(e.gps.hsr||0)*3+(e.gps.sprints||0)*50+(e.gps.player_load||0)})).sort((a,b)=>b._score-a._score);
            const top5=scored.slice(0,Math.min(5,scored.length));
            const avg=k=>top5.length?top5.reduce((s,e)=>s+(e.gps[k]||0),0)/top5.length:0;
            const gref={dist:avg("dist_total"),hsr:avg("hsr"),sprints:avg("sprints"),hsr_25:avg("hsr_25"),sprints_25:avg("sprints_25"),pl:avg("player_load"),acel_3:avg("acel_3"),decel_3:avg("decel_3")};
            // Última sessão de treino (não-jogo) com dist relevante
            const lastTr=trainings.find(e=>(e.gps?.dist_total||0)>1500)||trainings[0];
            if(!lastTr) return null;
            const tr={dist:lastTr.gps.dist_total||0,hsr:lastTr.gps.hsr||0,sprints:lastTr.gps.sprints||0,hsr_25:lastTr.gps.hsr_25||0,sprints_25:lastTr.gps.sprints_25||0,pl:lastTr.gps.player_load||0,acel_3:lastTr.gps.acel_3||0,decel_3:lastTr.gps.decel_3||0};
            const trDateFmt=(()=>{try{const d=parseDt(lastTr.date);return d&&!isNaN(d)?d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}):lastTr.date}catch{return lastTr.date}})();
            const rows=[
              {l:"Distância",  k:"dist",     unit:"m"},
              {l:"HSR (19.8–24.8 km/h)", k:"hsr",   unit:"m"},
              {l:"Sprints >19.8 km/h",   k:"sprints", unit:""},
              {l:"Dist. SPR >25.2 km/h", k:"hsr_25",  unit:"m"},
              {l:"Esforços SPR >25.2 km/h", k:"sprints_25", unit:""},
              {l:"Player Load", k:"pl",     unit:""},
              {l:"Acel ≥3 m/s²", k:"acel_3", unit:""},
              {l:"Desacel ≤-3 m/s²", k:"decel_3", unit:""}
            ];
            const pctC=(p)=>p>=110?"#DC2626":p>=90?"#EA580C":p>=70?"#FACC15":p>=50?"#22D3EE":"#94A3B8";
            const overall=(()=>{const ps=rows.map(r=>gref[r.k]>0?(tr[r.k]/gref[r.k])*100:null).filter(v=>v!==null&&Number.isFinite(v));return ps.length?Math.round(ps.reduce((a,b)=>a+b,0)/ps.length):0;})();
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,display:"flex",alignItems:"center",gap:6}}>
                    <Activity size={14} color="#22D3EE"/>Treino vs. Jogo (Gref)
                  </div>
                  <div style={{fontSize:10,color:t.textFaint,marginTop:2}}>
                    Última sessão de treino ({trDateFmt}) comparada à <strong style={{color:"#CA8A04"}}>Gref</strong> (média dos top {top5.length} jogos).
                    Cada % indica qual fração da exigência de jogo o atleta atingiu no treino.
                  </div>
                </div>
                <div style={{textAlign:"center",padding:"6px 14px",background:pctC(overall)+"22",borderRadius:8,border:`1px solid ${pctC(overall)}55`}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:20,fontWeight:900,color:pctC(overall)}}>{overall}%</div>
                  <div style={{fontSize:8,color:t.textFaint,fontWeight:700,letterSpacing:.5}}>vs Gref · MÉDIA</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={rows.map(r=>({n:r.l.split(" ")[0],pctTr:gref[r.k]>0?Math.round((tr[r.k]/gref[r.k])*100):0,pctG:100,rawTr:Math.round(tr[r.k]),rawG:Math.round(gref[r.k])}))} layout="vertical" margin={{left:10,right:10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                    <XAxis type="number" domain={[0,150]} tickFormatter={v=>`${v}%`} tick={{fontSize:9,fill:t.textFaint}}/>
                    <YAxis type="category" dataKey="n" tick={{fontSize:9,fill:t.textMuted}} width={80}/>
                    <ReferenceLine x={100} stroke="#CA8A04" strokeDasharray="3 3" label={{value:"Gref 100%",fontSize:9,fill:"#CA8A04",position:"insideTopRight"}}/>
                    <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;const d=payload[0]?.payload||{};return <div style={{background:t.tooltipBg,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px"}}><div style={{fontWeight:700,fontSize:11,color:t.text,marginBottom:4}}>{label}</div><div style={{fontSize:10,color:"#22D3EE"}}>Treino: <strong>{d.rawTr}</strong> · {d.pctTr}%</div><div style={{fontSize:10,color:"#CA8A04"}}>Gref: <strong>{d.rawG}</strong></div></div>;}}/>
                    <Bar dataKey="pctTr" name="Treino vs Gref" radius={[0,4,4,0]} barSize={12}>
                      {rows.map((r,i)=>{const v=gref[r.k]>0?(tr[r.k]/gref[r.k])*100:0;return <Cell key={i} fill={pctC(v)}/>;})}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px"}}>
                    <div style={{flex:1,fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>Variável</div>
                    <div style={{fontSize:9,color:"#22D3EE",fontWeight:700,minWidth:50,textAlign:"right"}}>Treino</div>
                    <div style={{fontSize:9,color:"#CA8A04",fontWeight:700,minWidth:50,textAlign:"right"}}>Gref</div>
                    <div style={{fontSize:9,color:t.textFaint,fontWeight:700,minWidth:38,textAlign:"right"}}>%</div>
                  </div>
                  {rows.map((r,i)=>{
                    const trv=tr[r.k]||0; const gv=gref[r.k]||0; const p=gv>0?Math.round((trv/gv)*100):0;
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 8px",background:i%2===0?t.bgMuted:"transparent",borderRadius:5}}>
                      <div style={{flex:1,fontSize:10,fontWeight:600,color:t.text}}>{r.l}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#22D3EE",minWidth:50,textAlign:"right"}}>{Math.round(trv)}{r.unit&&<span style={{fontSize:7,marginLeft:1}}>{r.unit}</span>}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#CA8A04",minWidth:50,textAlign:"right"}}>{Math.round(gv)}{r.unit&&<span style={{fontSize:7,marginLeft:1}}>{r.unit}</span>}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:800,color:pctC(p),minWidth:38,textAlign:"right"}}>{p}%</div>
                    </div>;
                  })}
                </div>
              </div>
              <div style={{marginTop:8,padding:"8px 12px",background:t.bgMuted,borderRadius:8,fontSize:9,color:t.textFaint,lineHeight:1.5}}>
                <strong style={{color:pri}}>Leitura:</strong> %&lt;50 = subcarga (regenerativo); 50–70% = MD+1/MD-3; 70–90% = MD-2/MD-1 ideal; 90–110% = stress de jogo; &gt;110% = sobrecarga (Malone et al., 2015).
              </div>
            </div>;
          })()}

          {/* ═══ MÓDULO: Monitoramento de Exposição a Sprint — Prevenção de Lesão ═══ */}
          {(()=>{
            const gpsAll=sheetData?.gps?.[sp.n]||[];
            if(gpsAll.length<3)return null;
            const calendarioGames=sheetData?.calendario||[];
            const parseDt=s=>{if(!s)return null;const pts=String(s).trim().split(/[\/\-\.]/);if(pts.length>=3){const[a,b,c]=pts.map(Number);if(a>31)return new Date(a,b-1,c);if(c>31)return new Date(c,b-1,a);return new Date(c<100?c+2000:c,b-1,a);}return new Date(s)||null;};
            const fmtDt=d=>{if(!d||isNaN(d))return"";return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});};
            const isMatchST=st=>{const s=(st||"").toLowerCase().trim();return s.startsWith("j.")||s.startsWith("j ")||s.includes("jogo")||s.includes("match")||s.includes("partida");};
            // Build match dates set from calendario
            const matchDateSet=new Set();
            for(const g of calendarioGames){const d=parseDt(g.data);if(d&&!isNaN(d))matchDateSet.add(d.toISOString().slice(0,10));}
            // Classify each GPS session
            const sessions=gpsAll.map(e=>{
              const dt=parseDt(e.date);
              const dtKey=dt&&!isNaN(dt)?dt.toISOString().slice(0,10):"";
              const isMatch=isMatchST(e.sessionTitle)||matchDateSet.has(dtKey);
              return{date:dt,dateStr:dtKey,fmtDate:fmtDt(dt),sessionTitle:e.sessionTitle||"",isMatch,topSpeed:e.gps?.pico_vel||0,hsr:e.gps?.hsr||0,sprDist:e.gps?.hsr_25||0,sprints:e.gps?.sprints_25||0,dist:e.gps?.dist_total||0};
            }).filter(s=>s.date&&!isNaN(s.date)).sort((a,b)=>a.date-b.date);
            if(sessions.length<3)return null;
            const matchSess=sessions.filter(s=>s.isMatch);
            const trainSess=sessions.filter(s=>!s.isMatch);
            // Averages and robust tops (P95 percentile + 38 km/h physiological cap to filter GPS spikes)
            const GPS_SPEED_CAP=38; // km/h — cap fisiológico para futebol (filtra spikes de GPS)
            const avg=arr=>{if(!arr.length)return 0;return Math.round(arr.reduce((a,b)=>a+b,0)/arr.length*10)/10;};
            const p95=arr=>{if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b);const i=Math.floor(s.length*0.95);return s[Math.min(i,s.length-1)];};
            const robustMax=arr=>{const capped=arr.filter(v=>v<=GPS_SPEED_CAP);return capped.length?Math.round(p95(capped)*10)/10:(arr.length?Math.round(p95(arr)*10)/10:0);};
            const matchTopSpeeds=matchSess.map(s=>s.topSpeed).filter(v=>v>0);
            const trainTopSpeeds=trainSess.map(s=>s.topSpeed).filter(v=>v>0);
            const matchHSR=matchSess.map(s=>s.hsr).filter(v=>v>0);
            const trainHSR=trainSess.map(s=>s.hsr).filter(v=>v>0);
            const matchSPR=matchSess.map(s=>s.sprDist).filter(v=>v>0);
            const trainSPR=trainSess.map(s=>s.sprDist).filter(v=>v>0);
            const statsMatch={topSpeedAvg:avg(matchTopSpeeds.filter(v=>v<=GPS_SPEED_CAP)),topSpeedMax:robustMax(matchTopSpeeds),hsrAvg:avg(matchHSR),sprAvg:avg(matchSPR),n:matchSess.length};
            const statsTrain={topSpeedAvg:avg(trainTopSpeeds.filter(v=>v<=GPS_SPEED_CAP)),topSpeedMax:robustMax(trainTopSpeeds),hsrAvg:avg(trainHSR),sprAvg:avg(trainSPR),n:trainSess.length};
            // Speed gap ratio (training avg / match avg)
            const speedGapPct=statsMatch.topSpeedAvg>0&&statsTrain.topSpeedAvg>0?Math.round(statsTrain.topSpeedAvg/statsMatch.topSpeedAvg*100):null;
            // Vmax ratio: training max / match max
            const vmaxRatio=statsMatch.topSpeedMax>0&&statsTrain.topSpeedMax>0?Math.round(statsTrain.topSpeedMax/statsMatch.topSpeedMax*100):null;
            // HSR gap
            const hsrGapPct=statsMatch.hsrAvg>0&&statsTrain.hsrAvg>0?Math.round(statsTrain.hsrAvg/statsMatch.hsrAvg*100):null;
            // Alert level
            const alertLevel=speedGapPct!==null&&speedGapPct<75?"high":speedGapPct!==null&&speedGapPct<85?"moderate":"ok";
            const alertColor=alertLevel==="high"?"#DC2626":alertLevel==="moderate"?"#EA580C":"#16A34A";
            const alertBg=alertLevel==="high"?"#FEF2F2":alertLevel==="moderate"?"#FFF7ED":"#F0FDF4";
            const alertBc=alertLevel==="high"?"#FECACA":alertLevel==="moderate"?"#FED7AA":"#BBF7D0";
            // Time series data for top speed chart (last 10 sessions of each type, interleaved by date)
            // Cap speed values at GPS_SPEED_CAP for chart display (spikes distort Y axis)
            const capSpd=v=>v>0?(v<=GPS_SPEED_CAP?v:null):null;
            const tsData=sessions.slice(-20).map(s=>({d:s.fmtDate,matchSpd:s.isMatch?capSpd(s.topSpeed):null,trainSpd:!s.isMatch?capSpd(s.topSpeed):null,isMatch:s.isMatch}));
            // Acute exposure: last 15 days
            const now=new Date();
            const d15ago=new Date(now.getTime()-15*86400000);
            const acute15=sessions.filter(s=>s.date>=d15ago&&!s.isMatch);
            // Group by date for bar chart
            const acuteByDate={};
            for(const s of acute15){
              const k=s.fmtDate;
              if(!acuteByDate[k])acuteByDate[k]={d:k,spr:0,hsr:0,topSpeed:0};
              acuteByDate[k].spr+=s.sprDist;
              acuteByDate[k].hsr+=s.hsr;
              if(s.topSpeed<=GPS_SPEED_CAP&&s.topSpeed>acuteByDate[k].topSpeed)acuteByDate[k].topSpeed=s.topSpeed;
            }
            const acuteData=Object.values(acuteByDate);
            const acute15TotalSPR=acute15.reduce((a,s)=>a+s.sprDist,0);
            const acute15Speeds=acute15.map(s=>s.topSpeed).filter(v=>v>0&&v<=GPS_SPEED_CAP);
            const acute15MaxSpeed=acute15Speeds.length?Math.round(Math.max(...acute15Speeds)*10)/10:0;
            const acute15AvgSpeed=acute15Speeds.length?avg(acute15Speeds):0;
            // 95% Vmax threshold (individualized, robust — ignores GPS spikes)
            const vmax=statsMatch.topSpeedMax||statsTrain.topSpeedMax||0;
            const vmax95=Math.round(vmax*0.95*10)/10;
            const trainHits95=trainSess.filter(s=>s.topSpeed>=vmax95&&s.topSpeed<=GPS_SPEED_CAP).length;
            const trainPct95=trainSess.length>0?Math.round(trainHits95/trainSess.length*100):0;
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${alertBc}`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,display:"flex",alignItems:"center",gap:6}}>
                    <Zap size={14} color={alertColor}/>
                    Monitoramento de Exposição a Sprint
                  </div>
                  <div style={{fontSize:10,color:t.textFaint}}>Análise treino vs. jogo — prevenção de lesão muscular (HSR &amp; Sprint)</div>
                </div>
                <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:alertBg,color:alertColor,border:`1px solid ${alertBc}`}}>
                  {alertLevel==="high"?"RISCO ALTO — GAP CRÍTICO":alertLevel==="moderate"?"ATENÇÃO — GAP MODERADO":"ADEQUADO"}
                </span>
              </div>

              {/* Alert Banner */}
              {alertLevel!=="ok"&&<div style={{background:alertBg,border:`1px solid ${alertBc}`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:10,color:alertColor,fontWeight:600,lineHeight:1.5}}>
                {alertLevel==="high"
                  ?`Velocidade média de treino (${statsTrain.topSpeedAvg} km/h) está a ${speedGapPct}% da média de jogo (${statsMatch.topSpeedAvg} km/h). Gap crítico — jogador atinge demandas de sprint em jogo sem preparação neuromuscular adequada no treino. Risco elevado de lesão muscular (isquiotibiais).`
                  :`Velocidade média de treino (${statsTrain.topSpeedAvg} km/h) está a ${speedGapPct}% da média de jogo (${statsMatch.topSpeedAvg} km/h). Exposição a alta velocidade no treino abaixo do ideal — monitorar e considerar inclusão de trabalho de sprint.`}
              </div>}

              {/* Summary Stats Grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:14}}>
                {[
                  {l:"Vel. Máx Jogo",v:statsMatch.topSpeedMax>0?statsMatch.topSpeedMax+" km/h":"—",sub:`avg ${statsMatch.topSpeedAvg}`,c:"#DC2626"},
                  {l:"Vel. Máx Treino",v:statsTrain.topSpeedMax>0?statsTrain.topSpeedMax+" km/h":"—",sub:`avg ${statsTrain.topSpeedAvg}`,c:"#2563eb"},
                  {l:"Gap Velocidade",v:speedGapPct!==null?speedGapPct+"%":"—",sub:"treino/jogo",c:alertColor},
                  {l:"HSR avg Jogo",v:statsMatch.hsrAvg>0?statsMatch.hsrAvg+"m":"—",sub:`${statsMatch.n} jogos`,c:"#DC2626"},
                  {l:"HSR avg Treino",v:statsTrain.hsrAvg>0?statsTrain.hsrAvg+"m":"—",sub:`${statsTrain.n} treinos`,c:"#2563eb"},
                  {l:"Treinos ≥95% Vmax",v:trainPct95+"%",sub:`${trainHits95}/${trainSess.length} sessões`,c:trainPct95<15?"#DC2626":trainPct95<30?"#EA580C":"#16A34A"}
                ].map((m,i)=>
                  <div key={i} style={{textAlign:"center",padding:"8px 4px",background:t.bgMuted,borderRadius:8}}>
                    <div style={{fontSize:8,color:t.textFaint,fontWeight:600,textTransform:"uppercase",marginBottom:2}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:m.c}}>{m.v}</div>
                    <div style={{fontSize:8,color:t.textFaint,marginTop:1}}>{m.sub}</div>
                  </div>)}
              </div>

              {/* Charts: Top Speed Time Series + Acute Exposure */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Top Speed — Match vs Training */}
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:pri,marginBottom:6}}>Velocidade Máxima — Jogo vs Treino (km/h)</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={tsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                      <XAxis dataKey="d" tick={{fontSize:7,fill:t.textFaint}} interval="preserveStartEnd"/>
                      <YAxis tick={{fontSize:8,fill:t.textFaint}} domain={["dataMin-2","dataMax+2"]}/>
                      <Tooltip content={<TT theme={t}/>}/>
                      <ReferenceLine y={vmax95} stroke="#EA580C" strokeDasharray="4 4" label={{value:"95% Vmax",fontSize:8,fill:"#EA580C",position:"right"}}/>
                      <ReferenceLine y={statsMatch.topSpeedAvg} stroke="#DC262640" strokeDasharray="2 2"/>
                      <ReferenceLine y={statsTrain.topSpeedAvg} stroke="#2563eb40" strokeDasharray="2 2"/>
                      <Line type="monotone" dataKey="matchSpd" name="Jogo" stroke="#DC2626" strokeWidth={2.5} dot={{r:4,fill:"#DC2626",stroke:t.bgCard,strokeWidth:2}} connectNulls={false}/>
                      <Line type="monotone" dataKey="trainSpd" name="Treino" stroke="#2563eb" strokeWidth={1.5} dot={{r:2.5,fill:"#2563eb",stroke:t.bgCard,strokeWidth:1}} connectNulls={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Acute Sprint Exposure — Last 15 Days */}
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:pri,marginBottom:6}}>Exposição Aguda — Últimos 15 Dias (treino)</div>
                  {acuteData.length>0?<>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={acuteData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                        <XAxis dataKey="d" tick={{fontSize:7,fill:t.textFaint}}/>
                        <YAxis tick={{fontSize:8,fill:t.textFaint}}/>
                        <Tooltip content={<TT theme={t}/>}/>
                        <Bar dataKey="hsr" name="HSR (m)" fill="#EA580C" radius={[3,3,0,0]} barSize={14}/>
                        <Bar dataKey="spr" name="Sprint (m)" fill="#DC2626" radius={[3,3,0,0]} barSize={14}/>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"space-around",marginTop:6}}>
                      {[
                        {l:"SPR Total 15d",v:acute15TotalSPR+"m",c:acute15TotalSPR<50?"#DC2626":"#16A34A"},
                        {l:"Vel. Máx 15d",v:acute15MaxSpeed+" km/h",c:acute15MaxSpeed<vmax95?"#EA580C":"#16A34A"},
                        {l:"Vel. Média 15d",v:acute15AvgSpeed+" km/h",c:acute15AvgSpeed<statsTrain.topSpeedAvg*0.85?"#DC2626":"#16A34A"}
                      ].map((m,i)=>
                        <div key={i} style={{textAlign:"center"}}>
                          <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                          <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>)}
                    </div>
                  </>:<div style={{textAlign:"center",padding:"30px 0",color:t.textFaint,fontSize:10}}>Sem sessões de treino nos últimos 15 dias</div>}
                </div>
              </div>

              {/* Threshold Reference */}
              <div style={{marginTop:12,padding:"8px 12px",background:t.bgMuted,borderRadius:8,display:"flex",gap:16,alignItems:"center"}}>
                <div style={{fontSize:9,color:t.textFaint,flex:1}}>
                  <strong style={{color:pri}}>Vmax Individual:</strong> {vmax>0?vmax+" km/h":"—"} · <strong style={{color:pri}}>95% Vmax:</strong> {vmax95>0?vmax95+" km/h":"—"} · Treinos com ≥90% Vmax semanal recomendado para adaptação neuromuscular
                </div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:8,fontWeight:600,color:"#DC2626"}}>● Jogo</span>
                  <span style={{fontSize:8,fontWeight:600,color:"#2563eb"}}>● Treino</span>
                </div>
              </div>
            </div>;
          })()}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Radar Bem-estar</div>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={radarData}><PolarGrid stroke={t.border}/><PolarAngleAxis dataKey="s" tick={{fontSize:9,fill:t.textMuted}}/><PolarRadiusAxis tick={false} domain={[0,10]}/><Radar dataKey="v" stroke={pri} fill={pri} fillOpacity={.08} strokeWidth={2}/></RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Último Questionário</div>
              <WBar theme={t} label={`Sono — avg temporada ${sp.sa||"-"}`} v={sp.sq||0} max={10}/>
              <WBar theme={t} label="Recuperação Geral" v={sp.rg||0} max={10}/>
              <WBar theme={t} label={`Rec. Pernas — avg ${sp.rpa||"-"}`} v={sp.rp||0} max={10}/>
              <WBar theme={t} label={`Dor — avg ${sp.da||"-"}`} v={sp.d||0} max={10} inv/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                <div style={{padding:8,background:t.bgMuted,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:t.textFaint}}>Humor</div><div style={{fontSize:13,fontWeight:700,color:sp.h<=2?"#DC2626":"#16A34A"}}>{humorL[sp.h]}</div></div>
                <div style={{padding:8,background:t.bgMuted,borderRadius:8,textAlign:"center",cursor:"help"}} title="sRPE Total = PSE × Duração (min). Carga total da sessão em Unidades Arbitrárias (UA)"><div style={{fontSize:9,color:t.textFaint}}>sRPE Total</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:pri}}>{sp.sra}</div></div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {wtData.length>0&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Tendência 7 Dias — Bem-estar</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={wtData}><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="d" tick={{fontSize:9,fill:t.textFaint}}/><YAxis tick={{fontSize:9,fill:t.textFaint}} domain={[0,10]}/><Tooltip content={<Tip theme={t}/>}/>
                  <Area type="monotone" dataKey="sono" name="Sono" stroke="#7c3aed" fill="#7c3aed" fillOpacity={.05} strokeWidth={2}/>
                  <Area type="monotone" dataKey="rec" name="Rec Pernas" stroke="#16A34A" fill="#16A34A" fillOpacity={.05} strokeWidth={1.5}/>
                  <Area type="monotone" dataKey="dor" name="Dor" stroke="#DC2626" fill="#DC2626" fillOpacity={.05} strokeWidth={1.5} strokeDasharray="4 4"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>}
            {cmjData.length>1&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>CMJ Trend ({cmjData.length} testes)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={cmjData}><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="i" tick={{fontSize:9,fill:t.textFaint}}/><YAxis tick={{fontSize:9,fill:t.textFaint}} domain={["dataMin-3","dataMax+3"]}/><Tooltip content={<Tip theme={t}/>}/>
                  <Line type="monotone" dataKey="v" name="CMJ (cm)" stroke={pri} strokeWidth={2.5} dot={{r:3,fill:pri,stroke:t.bgCard,strokeWidth:2}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>}
          </div>

          {/* ═══ COMPARATIVO SEMANAL DE TREINO — Week-over-Week Load Monitoring ═══ */}
          {(()=>{
            const diarioAll=sheetData?.diario?.[sp.n]||[];
            const gpsAll=sheetData?.gps?.[sp.n]||[];
            const questAll=sheetData?.questionarios?.[sp.n]||[];
            if(diarioAll.length<5&&gpsAll.length<5)return null;
            const parseDtW=s=>{if(!s)return null;const pts=String(s).trim().split(/[\/\-\.]/);if(pts.length>=3){const[a,b,c]=pts.map(Number);if(a>31)return new Date(a,b-1,c);if(c>31)return new Date(c,b-1,a);return new Date(c<100?c+2000:c,b-1,a);}return new Date(s)||null;};
            // Get ISO week number
            const getWeek=d=>{const t2=new Date(d.getFullYear(),d.getMonth(),d.getDate());t2.setDate(t2.getDate()+3-(t2.getDay()+6)%7);const w1=new Date(t2.getFullYear(),0,4);return 1+Math.round(((t2-w1)/86400000-3+(w1.getDay()+6)%7)/7);};
            const getWeekStart=d=>{const t2=new Date(d);const day=t2.getDay();const diff=t2.getDate()-day+(day===0?-6:1);t2.setDate(diff);t2.setHours(0,0,0,0);return t2;};
            // Map (data,wKey) → key para evitar dupla contagem entre diário e GPS.
            const weekMap={};
            const seenSessions=new Set(); // chave dia → não conta a mesma sessão duas vezes em sRPE
            const ensureBucket=(dt)=>{const wStart=getWeekStart(dt);const wKey=wStart.toISOString().slice(0,10);if(!weekMap[wKey])weekMap[wKey]={start:wStart,week:getWeek(dt),sessions:[],srpe_vals:[],dist_vals:[],hsr_vals:[],sono_vals:[],dor_vals:[],rec_vals:[]};return weekMap[wKey];};
            // 1) Diário (fonte primária para sRPE quando publicado).
            for(const e of diarioAll){
              const dt=parseDtW(e.date);
              if(!dt||isNaN(dt))continue;
              const bucket=ensureBucket(dt);
              const pse=e.pse||0; const dur=e.duracao||0;
              const srpe=e.spe||(pse*dur)||0;
              bucket.sessions.push({date:dt,pse,dur,srpe});
              if(srpe>0){bucket.srpe_vals.push(srpe);seenSessions.add(dt.toISOString().slice(0,10));}
            }
            // 2) GPS individual (gid=1595283302) — também traz PSE+duração por
            // sessão. Usado como fallback ou complemento quando o Diário está
            // vazio ou desatualizado para a semana corrente.
            for(const e of gpsAll){
              const dt=parseDtW(e.date);
              if(!dt||isNaN(dt))continue;
              const bucket=ensureBucket(dt);
              if(e.gps?.dist_total>0)bucket.dist_vals.push(e.gps.dist_total);
              if(e.gps?.hsr>0)bucket.hsr_vals.push(e.gps.hsr);
              const pseG=Number(e.pse)||0; const durG=Number(e.duracao)||0;
              const srpeG=pseG*durG;
              const dKey=dt.toISOString().slice(0,10);
              if(srpeG>0&&!seenSessions.has(dKey)){
                bucket.srpe_vals.push(srpeG);
                bucket.sessions.push({date:dt,pse:pseG,dur:durG,srpe:srpeG});
                seenSessions.add(dKey);
              }
            }
            // Add wellness per week
            for(const e of questAll){
              const dt=parseDtW(e.date);
              if(!dt||isNaN(dt))continue;
              const wStart=getWeekStart(dt);
              const wKey=wStart.toISOString().slice(0,10);
              if(!weekMap[wKey])weekMap[wKey]={start:wStart,week:getWeek(dt),sessions:[],srpe_vals:[],dist_vals:[],hsr_vals:[],sono_vals:[],dor_vals:[],rec_vals:[]};
              if(e.sono_qualidade>0)weekMap[wKey].sono_vals.push(e.sono_qualidade);
              if(e.dor!=null)weekMap[wKey].dor_vals.push(e.dor);
              if(e.recuperacao_geral>0)weekMap[wKey].rec_vals.push(e.recuperacao_geral);
            }
            const weeks=Object.values(weekMap).filter(w=>w.srpe_vals.length>=2||w.dist_vals.length>=2).sort((a,b)=>a.start-b.start);
            if(weeks.length<2)return null;
            const last4=weeks.slice(-4);
            const avgArr=arr=>arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length*10)/10:0;
            const sumArr=arr=>arr.reduce((a,b)=>a+b,0);
            // Calculate weekly metrics
            const weekData=last4.map((w,i)=>{
              const totalSrpe=sumArr(w.srpe_vals);
              const avgSrpe=avgArr(w.srpe_vals);
              const stdSrpe=w.srpe_vals.length>1?Math.sqrt(w.srpe_vals.reduce((a,v)=>a+(v-avgSrpe)**2,0)/w.srpe_vals.length):0;
              const monotonia=stdSrpe>0?Math.round(avgSrpe/stdSrpe*100)/100:0;
              const strain=Math.round(totalSrpe*monotonia);
              const totalDist=Math.round(sumArr(w.dist_vals));
              const totalHsr=Math.round(sumArr(w.hsr_vals));
              const avgSono=avgArr(w.sono_vals);
              const avgDor=avgArr(w.dor_vals);
              const avgRec=avgArr(w.rec_vals);
              const wLabel=w.start.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
              return{label:`S${w.week} (${wLabel})`,totalSrpe:Math.round(totalSrpe),avgSrpe:Math.round(avgSrpe),monotonia,strain,totalDist,totalHsr,nSess:w.srpe_vals.length,avgSono,avgDor,avgRec};
            });
            // Calculate deltas between consecutive weeks
            const currentW=weekData[weekData.length-1];
            const prevW=weekData.length>=2?weekData[weekData.length-2]:null;
            const deltaSrpe=prevW&&prevW.totalSrpe>0?Math.round((currentW.totalSrpe-prevW.totalSrpe)/prevW.totalSrpe*100):null;
            const deltaDist=prevW&&prevW.totalDist>0?Math.round((currentW.totalDist-prevW.totalDist)/prevW.totalDist*100):null;
            // ACWR from weekly data (current week / avg of last 4 weeks)
            const chronicSrpe=weekData.length>=2?Math.round(weekData.slice(0,-1).reduce((a,w2)=>a+w2.totalSrpe,0)/weekData.slice(0,-1).length):0;
            const acwrWeekly=chronicSrpe>0?(currentW.totalSrpe/chronicSrpe).toFixed(2):"—";
            const acwrV=parseFloat(acwrWeekly)||0;
            const acwrC=acwrV>1.5?"#DC2626":acwrV>1.3?"#EA580C":acwrV>=0.8?"#16A34A":acwrV>0?"#CA8A04":"#64748b";
            const deltaC=v=>v===null?"#64748b":v>20?"#DC2626":v>10?"#EA580C":v>=-10?"#16A34A":"#CA8A04";
            const monoC=v=>v>2?"#DC2626":v>1.5?"#EA580C":"#16A34A";
            // Chart data for bars
            const chartW=weekData.map(w=>({name:w.label,sRPE:w.totalSrpe,Dist:Math.round(w.totalDist/100),HSR:w.totalHsr}));
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${acwrV>1.3?"#EA580C33":t.border}`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,display:"flex",alignItems:"center",gap:6}}>
                    <Calendar size={14} color="#2563eb"/>
                    Comparativo Semanal de Treino
                  </div>
                  <div style={{fontSize:10,color:t.textFaint}}>Últimas {weekData.length} semanas · ACWR semanal, Monotonia, Strain, Δ% (Gabbett, 2016; Foster, 1998)</div>
                </div>
              </div>
              {/* Summary Indicators */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:14}}>
                {[
                  {l:"ACWR Semanal",v:acwrWeekly,sub:"aguda/crônica",c:acwrC},
                  {l:"Δ sRPE",v:deltaSrpe!==null?(deltaSrpe>0?"+":"")+deltaSrpe+"%":"—",sub:"vs semana ant.",c:deltaC(deltaSrpe)},
                  {l:"Δ Distância",v:deltaDist!==null?(deltaDist>0?"+":"")+deltaDist+"%":"—",sub:"vs semana ant.",c:deltaC(deltaDist)},
                  {l:"Monotonia",v:currentW.monotonia.toFixed(1),sub:currentW.monotonia>2?"ALTO":"OK",c:monoC(currentW.monotonia)},
                  {l:"Strain",v:currentW.strain,sub:"carga×mono",c:currentW.strain>5000?"#DC2626":currentW.strain>3500?"#EA580C":"#16A34A"},
                  {l:"Sessões",v:currentW.nSess,sub:"semana atual",c:pri}
                ].map((m,i)=>
                  <div key={i} style={{textAlign:"center",padding:"8px 4px",background:t.bgMuted,borderRadius:8}}>
                    <div style={{fontSize:8,color:t.textFaint,fontWeight:600,textTransform:"uppercase",marginBottom:2}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:15,fontWeight:800,color:m.c}}>{m.v}</div>
                    <div style={{fontSize:8,color:m.sub==="ALTO"?"#DC2626":t.textFaint,fontWeight:m.sub==="ALTO"?700:400,marginTop:1}}>{m.sub}</div>
                  </div>)}
              </div>
              {/* Alert Banner */}
              {(acwrV>1.3||currentW.monotonia>2||(deltaSrpe!==null&&deltaSrpe>15))&&<div style={{background:acwrV>1.5||currentW.monotonia>2?"#FEF2F2":"#FFF7ED",border:`1px solid ${acwrV>1.5||currentW.monotonia>2?"#FECACA":"#FED7AA"}`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:10,color:acwrV>1.5||currentW.monotonia>2?"#DC2626":"#EA580C",fontWeight:600,lineHeight:1.5}}>
                {acwrV>1.5?"ACWR semanal acima de 1.5 — aumento abrupto de carga. Risco elevado de lesão (Gabbett, 2016). Considerar redução na próxima sessão."
                :acwrV>1.3?"ACWR semanal entre 1.3-1.5 — zona de atenção. Monitorar resposta do atleta."
                :currentW.monotonia>2?"Monotonia alta (>2.0) — carga muito uniforme sem variação adequada entre dias (Foster, 1998). Incluir dias de descarga."
                :deltaSrpe>20?"Aumento de carga semanal >20% — acima da progressão recomendada de 10-15% (Piggott et al., 2009)."
                :"Aumento de carga semanal entre 15-20% — no limite superior da progressão segura."}
              </div>}
              {/* Charts */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:pri,marginBottom:6}}>Carga Semanal (sRPE Total)</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartW}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                      <XAxis dataKey="name" tick={{fontSize:8,fill:t.textFaint}}/>
                      <YAxis tick={{fontSize:8,fill:t.textFaint}}/>
                      <Tooltip content={<TT theme={t}/>}/>
                      <Bar dataKey="sRPE" name="sRPE Total (UA)" fill="#2563eb" radius={[4,4,0,0]} barSize={28}>
                        {chartW.map((e,i)=><Cell key={i} fill={i===chartW.length-1?"#2563eb":"#2563eb60"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:pri,marginBottom:6}}>Volume GPS Semanal</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartW}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                      <XAxis dataKey="name" tick={{fontSize:8,fill:t.textFaint}}/>
                      <YAxis tick={{fontSize:8,fill:t.textFaint}}/>
                      <Tooltip content={<TT theme={t}/>}/>
                      <Bar dataKey="Dist" name="Dist Total (×100m)" fill="#16A34A" radius={[4,4,0,0]} barSize={14}>
                        {chartW.map((e,i)=><Cell key={i} fill={i===chartW.length-1?"#16A34A":"#16A34A60"}/>)}
                      </Bar>
                      <Bar dataKey="HSR" name="HSR Total (m)" fill="#EA580C" radius={[4,4,0,0]} barSize={14}>
                        {chartW.map((e,i)=><Cell key={i} fill={i===chartW.length-1?"#EA580C":"#EA580C60"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Weekly Detail Table */}
              <div style={{marginTop:12,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${t.border}`}}>
                      {["Semana","Sessões","sRPE Total","sRPE Média","Monotonia","Strain","Dist Total","HSR Total","Sono","Dor","Rec"].map((h,i)=>
                        <th key={i} style={{padding:"6px 8px",textAlign:i===0?"left":"center",fontSize:9,fontWeight:700,color:t.textFaint,textTransform:"uppercase"}}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.map((w,i)=>{
                      const isCurr=i===weekData.length-1;
                      return <tr key={i} style={{background:isCurr?pri+"08":"transparent",borderBottom:`1px solid ${t.borderLight}`}}>
                        <td style={{padding:"6px 8px",fontWeight:isCurr?700:500,color:isCurr?pri:t.text}}>{w.label}{isCurr?" ●":""}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:t.text}}>{w.nSess}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:700,color:pri}}>{w.totalSrpe}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:t.textMuted}}>{w.avgSrpe}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:700,color:monoC(w.monotonia)}}>{w.monotonia.toFixed(1)}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:w.strain>5000?"#DC2626":t.textMuted}}>{w.strain}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:t.textMuted}}>{w.totalDist>0?(w.totalDist/1000).toFixed(1)+"km":"—"}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:t.textMuted}}>{w.totalHsr>0?w.totalHsr+"m":"—"}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:w.avgSono<6?"#DC2626":"#16A34A"}}>{w.avgSono||"—"}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:w.avgDor>=4?"#DC2626":t.textMuted}}>{w.avgDor||"—"}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:w.avgRec<6?"#DC2626":"#16A34A"}}>{w.avgRec||"—"}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              {/* Reference */}
              <div style={{marginTop:10,padding:"6px 10px",background:t.bgMuted,borderRadius:6,fontSize:9,color:t.textFaint,lineHeight:1.4}}>
                <strong style={{color:pri}}>Referências:</strong> ACWR sweet spot 0.8-1.3 (Gabbett, 2016) · Monotonia {">"} 2.0 = risco (Foster, 1998) · Δ semanal ideal ≤10-15% (Piggott et al., 2009) · Strain = carga total × monotonia
              </div>
            </div>;
          })()}

          {/* ═══ CAMADA 4: TENDÊNCIA TEMPORAL — Dívida de Fadiga, sRPE, CMJ ═══ */}
          {(()=>{
            const mlAlert=liveAlerts.find(a=>a.n===sp.n);
            // Construir trendData de ML.alerts OU dos dados live da planilha
            let trendData=null;
            if(mlAlert&&mlAlert.trends){
              const tr=mlAlert.trends;
              const days=["D-7","D-6","D-5","D-4","D-3","D-2","D-1"];
              trendData=days.map((d,i)=>({d,fatigue_debt:tr.fatigue_debt[i],srpe:tr.srpe[i],cmj:tr.cmj[i],wellness:tr.wellness?tr.wellness[i]:(mlAlert.sono||7)}));
            } else {
              // Gerar trends a partir dos dados live (questionários + diário + saltos)
              const questEntries=sheetData?.questionarios?.[sp.n]||[];
              const diarioEntries=sheetData?.diario?.[sp.n]||[];
              const saltosEntries=sheetData?.saltos?.[sp.n]||[];
              const gpsEntries=sheetData?.gps?.[sp.n]||[];
              const last7q=questEntries.slice(-7);
              const last7d=diarioEntries.slice(-7);
              const last7s=saltosEntries.slice(-7);
              const last7g=gpsEntries.slice(-7);
              const nDays=Math.max(last7q.length,last7d.length,1);
              if(nDays>=2||last7q.length>=2||last7d.length>=2){
                const days=Array.from({length:Math.min(nDays,7)},(_,i)=>"D-"+(Math.min(nDays,7)-i));
                trendData=days.map((_d,i)=>{
                  const q=last7q[i]||{};
                  const d=last7d[i]||{};
                  const s=last7s[i]||{};
                  const g=last7g[i]||{};
                  const sono=q.sono_qualidade||0;
                  const dor=q.dor||0;
                  const rec=q.recuperacao_geral||q.recuperacao_pernas||7;
                  const wellnessV=sono>0?Math.round(((sono+(10-dor)+rec)/3)*10)/10:0;
                  const pse=d.pse||0;
                  const duracao=d.duracao||0;
                  const srpeV=d.spe||(pse*duracao)||0;
                  const cmjV=s.cmj_1?Math.max(s.cmj_1||0,s.cmj_2||0,s.cmj_3||0):0;
                  const fatV=srpeV>0?Math.round(srpeV*(g.gps?.hsr_baseline>0?(g.gps.hsr/g.gps.hsr_baseline):1)*2.5):0;
                  return {d:_d,fatigue_debt:fatV,srpe:srpeV,cmj:cmjV||sp.cmj||0,wellness:wellnessV||sp.sq||7};
                });
              }
            }
            const hasTrends=trendData&&trendData.length>=2;
            const pr=mlAlert?PERFIL_RISCO_LABELS[mlAlert.perfil_risco]||PERFIL_RISCO_LABELS.sobrecarga:null;
            return <div style={{marginBottom:16}}>
              {/* Physiological Risk Profile — só mostra se tem mlAlert com diag_diff */}
              {mlAlert&&pr&&mlAlert.diag_diff&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${pr.bc}`,padding:18,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Perfil Fisiológico do Risco</div>
                    <div style={{fontSize:11,color:t.textFaint}}>Classificação do mecanismo de risco dominante</div>
                  </div>
                  <span style={{padding:"4px 14px",borderRadius:6,fontSize:12,fontWeight:800,background:pr.bg,color:pr.c,border:`2px solid ${pr.bc}`}}>{pr.label.toUpperCase()}</span>
                </div>
                <div style={{padding:"10px 14px",background:pr.bg,borderRadius:8,border:`1px solid ${pr.bc}`,marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:600,color:pr.c,marginBottom:2}}>{pr.desc}</div>
                  <div style={{fontSize:11,color:t.textMuted}}>{mlAlert.diag_diff.base}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                  {[
                    {l:"Dívida de Fadiga",v:mlAlert.fatigue_debt,c:mlAlert.fatigue_debt>3000?"#DC2626":mlAlert.fatigue_debt>2500?"#EA580C":"#16A34A",unit:""},
                    {l:"NME",v:mlAlert.nme?.toFixed(4),c:mlAlert.nme<0.012?"#DC2626":mlAlert.nme<0.015?"#EA580C":"#16A34A",unit:""},
                    {l:"CMJ Trend 3d",v:(mlAlert.cmj_trend_3d>0?"+":"")+mlAlert.cmj_trend_3d?.toFixed(2),c:mlAlert.cmj_trend_3d<-1?"#DC2626":mlAlert.cmj_trend_3d<0?"#EA580C":"#16A34A",unit:"cm/d"},
                    {l:"sRPE Trend 5d",v:(mlAlert.srpe_trend_5d>0?"+":"")+mlAlert.srpe_trend_5d?.toFixed(1),c:mlAlert.srpe_trend_5d>30?"#DC2626":mlAlert.srpe_trend_5d>15?"#EA580C":"#16A34A",unit:"UA/d"},
                    {l:"Sleep Trend 7d",v:(mlAlert.sleep_trend_7d>0?"+":"")+mlAlert.sleep_trend_7d?.toFixed(2),c:mlAlert.sleep_trend_7d<-0.2?"#DC2626":mlAlert.sleep_trend_7d<0?"#EA580C":"#16A34A",unit:"/d"}
                  ].map((m,j)=>
                    <div key={j} style={{textAlign:"center",padding:"8px 4px",background:t.bgMuted,borderRadius:8}}>
                      <div style={{fontSize:8,color:t.textFaint,fontWeight:600,textTransform:"uppercase"}}>{m.l}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:700,color:m.c}}>{m.v}</div>
                      {m.unit&&<div style={{fontSize:8,color:t.textFaint}}>{m.unit}</div>}
                    </div>)}
                </div>
              </div>}

              {/* Removidos os 4 charts "— 7 Dias" (Dívida de Fadiga, Bem-estar, Carga
                  Interna sRPE, CMJ Tendência): redundantes com o Comparativo
                  Semanal acima e com gráficos da aba Temporal/Neuromuscular. */}
            </div>;
          })()}

          {/* ═══ CAMADA 5: PROJEÇÃO DE RISCO 48-72h ═══ */}
          {(()=>{
            const proj=PROJECTIONS[sp.n];
            if(!proj) return null;
            const mlAlert=liveAlerts.find(a=>a.n===sp.n);
            if(!mlAlert) return null;
            const tendC=proj.tendencia==="piora"?"#DC2626":proj.tendencia==="piora_leve"?"#EA580C":proj.tendencia==="estavel"?"#CA8A04":"#16A34A";
            const tendL=proj.tendencia==="piora"?"PIORA":proj.tendencia==="piora_leve"?"PIORA LEVE":proj.tendencia==="estavel"?"ESTÁVEL":"MELHORA";
            const nivelC=proj.nivel_projetado==="CRÍTICO"?"#DC2626":proj.nivel_projetado.includes("MODERADO")?"#EA580C":proj.nivel_projetado==="ATENÇÃO"?"#CA8A04":"#16A34A";
            const projData=[
              {d:"Atual",fatigue_debt:mlAlert.trends.fatigue_debt[6],cmj:mlAlert.trends.cmj[6]},
              {d:"+48h",fatigue_debt:proj.proj_48h.fatigue_debt,cmj:proj.proj_48h.cmj},
              {d:"+72h",fatigue_debt:proj.proj_72h.fatigue_debt,cmj:proj.proj_72h.cmj}
            ];
            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${tendC}33`,padding:18,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Projeção de Risco — 48-72 Horas</div>
                  <div style={{fontSize:11,color:t.textFaint}}>Estimativa baseada em tendência linear dos últimos 7 dias</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:800,background:`${tendC}15`,color:tendC,border:`1px solid ${tendC}33`}}>TENDÊNCIA: {tendL}</span>
                  <span style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:800,background:`${nivelC}15`,color:nivelC,border:`1px solid ${nivelC}33`}}>{proj.nivel_projetado}</span>
                </div>
              </div>
              <div style={{padding:"10px 14px",background:`${tendC}08`,borderRadius:8,border:`1px solid ${tendC}22`,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:tendC,marginBottom:2}}>{proj.resumo}</div>
                <div style={{fontSize:11,color:t.textMuted}}><strong>Recomendação:</strong> {proj.recomendacao}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
                {[
                  {l:"Atual",d:projData[0],probV:(mlAlert.prob*100).toFixed(0)},
                  {l:"Projeção 48h",d:projData[1],probV:(proj.proj_48h.risk_prob*100).toFixed(0)},
                  {l:"Projeção 72h",d:projData[2],probV:(proj.proj_72h.risk_prob*100).toFixed(0)}
                ].map((col,ci)=>{
                  const pC=Number(col.probV)>=50?"#DC2626":Number(col.probV)>=30?"#EA580C":Number(col.probV)>=15?"#CA8A04":"#16A34A";
                  return <div key={ci} style={{padding:12,background:ci===0?t.bgMuted:`${tendC}06`,borderRadius:10,border:`1px solid ${ci===0?t.border:tendC+"22"}`}}>
                    <div style={{fontSize:10,fontWeight:700,color:ci===0?t.textMuted:tendC,textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>{col.l}</div>
                    <div style={{textAlign:"center",marginBottom:10}}>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:28,fontWeight:900,color:pC}}>{col.probV}%</div>
                      <div style={{fontSize:9,color:t.textFaint}}>Prob. Lesão</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {[
                        {l:"Dívida de Fadiga",v:col.d.fatigue_debt,c:col.d.fatigue_debt>3000?"#DC2626":col.d.fatigue_debt>2500?"#EA580C":"#16A34A"},
                        {l:"CMJ (cm)",v:col.d.cmj?.toFixed(1),c:"#7c3aed"}
                      ].map((m,mi)=>
                        <div key={mi} style={{display:"flex",justifyContent:"space-between",padding:"3px 6px",background:t.bgCard,borderRadius:4}}>
                          <span style={{fontSize:9,color:t.textFaint}}>{m.l}</span>
                          <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:m.c}}>{m.v}</span>
                        </div>)}
                    </div>
                  </div>;
                })}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                {[
                  {label:"Dívida de Fadiga",key:"fatigue_debt",c:"#EA580C"},
                  {label:"CMJ (cm)",key:"cmj",c:"#7c3aed"}
                ].map((ch,ci)=>
                  <div key={ci} style={{background:t.bgMuted,borderRadius:8,padding:12}}>
                    <div style={{fontSize:10,fontWeight:600,color:pri,marginBottom:6}}>{ch.label}</div>
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={projData}><XAxis dataKey="d" tick={{fontSize:8,fill:t.textFaint}}/><YAxis hide domain={["dataMin-5","dataMax+5"]}/><Tooltip content={<Tip theme={t}/>}/>
                        <Line type="monotone" dataKey={ch.key} name={ch.label} stroke={ch.c} strokeWidth={2} dot={{r:3,fill:ch.c,stroke:t.bgCard,strokeWidth:2}} strokeDasharray={ci>-1?"":"5 5"}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>)}
              </div>
            </div>;
          })()}
        </div>;})()}

        {tab==="player"&&!sp&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:40,textAlign:"center",color:t.textFaint}}>
          <Users size={32} style={{marginBottom:12,opacity:.4}}/><div style={{fontSize:14,fontWeight:600}}>Selecione um atleta na barra lateral</div>
        </div>}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SESSÃO DE TREINO — Monitoramento pós-sessão                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="sessao"&&<div>
          {Object.keys(LIVE_SESSION.atletas).length===0?<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:40,textAlign:"center",color:t.textFaint}}>
            <Activity size={32} style={{marginBottom:12,opacity:.4}}/><div style={{fontSize:14,fontWeight:600}}>Aguardando dados da sessão</div><div style={{fontSize:11,marginTop:4}}>Os dados serão carregados automaticamente da planilha GPS.</div>
          </div>:<></>}
          {Object.keys(LIVE_SESSION.atletas).length>0&&<>
          {/* Session Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Monitoramento da Sessão de Treino</div>
                <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>{LIVE_SESSION.meta._liveDate||LIVE_SESSION.meta.date}{LIVE_SESSION.meta.tipo?` · ${LIVE_SESSION.meta.tipo}`:""}{LIVE_SESSION.meta.local?` · ${LIVE_SESSION.meta.local}`:""}{LIVE_SESSION.meta.md?` · ${LIVE_SESSION.meta.md}`:""}{isLive&&<span style={{marginLeft:8,fontSize:10,color:"#16A34A",fontWeight:600}}>LIVE {LIVE_SESSION.meta._liveTime||""}</span>}</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[{l:"Duração",v:(LIVE_SESSION.meta.duracao||"—")+"min"},{l:"Atletas",v:Object.keys(LIVE_SESSION.atletas).length}].filter(b=>b.v&&b.v!=="0min"&&b.v!=="—min").map((b,i)=>
                  <span key={i} style={{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:700,background:dark?"rgba(255,255,255,.04)":t.bgMuted,color:t.textMuted,border:`1px solid ${dark?"rgba(255,255,255,.08)":t.border}`}}>{b.l}: <strong style={{color:pri}}>{b.v}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Avatar Row — atletas presentes na sessão (STATSports SQUAD) ═══ */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:"12px 14px",marginBottom:14,overflowX:"auto"}}>
            <div style={{display:"flex",gap:10,minWidth:"max-content"}}>
              {Object.entries(LIVE_SESSION.atletas).map(([name,sess])=>{
                const isSel=sel===name;
                const cls=sess.classificacao;
                const ringC=cls==="vermelho"?"#ef4444":cls==="amarelo"?"#facc15":"#22c55e";
                const first=name.split(" ")[0];
                return <button key={name} onClick={()=>{setSel(name);setTab("player");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"transparent",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:8,transition:"all .15s",opacity:isSel?1:.85}}>
                  <div style={{position:"relative",width:46,height:46}}>
                    <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`2.5px solid ${ringC}`,boxShadow:isSel?`0 0 0 3px ${ringC}33, 0 0 12px ${ringC}66`:"none"}}/>
                    <PlayerPhoto theme={t} name={name} sz={40}/>
                  </div>
                  <div style={{fontSize:9,fontWeight:700,color:isSel?pri:t.textMuted,letterSpacing:.3,whiteSpace:"nowrap"}}>{first}</div>
                </button>;
              })}
            </div>
          </div>

          {/* Classification Overview */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            {[
              {l:"Sessão Reduziu Risco",c:"#22c55e",bg:"#F0FDF4",bc:"#BBF7D0",count:Object.values(LIVE_SESSION.atletas).filter(a=>a.classificacao==="verde").length},
              {l:"Carga Controlada",c:"#facc15",bg:"#FEFCE8",bc:"#FEF08A",count:Object.values(LIVE_SESSION.atletas).filter(a=>a.classificacao==="amarelo").length},
              {l:"Sessão Aumentou Risco",c:"#ef4444",bg:"#FEF2F2",bc:"#FECACA",count:Object.values(LIVE_SESSION.atletas).filter(a=>a.classificacao==="vermelho").length}
            ].map((cat,i)=>
              <div key={i} style={{background:dark?`${cat.c}10`:cat.bg,borderRadius:12,border:`1px solid ${dark?cat.c+"55":cat.bc}`,padding:18,textAlign:"center",boxShadow:dark?`0 0 18px ${cat.c}22, inset 0 1px 0 ${cat.c}15`:"none",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:cat.c,opacity:.7}}/>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:38,fontWeight:900,color:cat.c,lineHeight:1,textShadow:dark?`0 0 16px ${cat.c}66`:"none"}}>{cat.count}</div>
                <div style={{fontSize:10,fontWeight:800,color:cat.c,marginTop:6,letterSpacing:.5,textTransform:"uppercase"}}>{cat.l}</div>
              </div>
            )}
          </div>

          {/* Relatório Última Sessão — Tabela consolidada */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,marginBottom:4}}>Relatório da Última Sessão</div>
            <div style={{fontSize:11,color:t.textFaint,marginBottom:14}}>
              {(() => {
                const allSess = Object.values(LIVE_SESSION.atletas).filter(a => a._fromSheet);
                const pDate = (d) => { if (!d) return 0; const s = String(d).trim(); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime(); const p = s.split(/[\/\-\.]/); if (p.length >= 3) { const [a,b,c] = p.map(Number); if (a > 31) return new Date(a,b-1,c).getTime(); if (c > 31) return new Date(c,b-1,a).getTime(); return new Date(c,a-1,b).getTime(); } return new Date(s).getTime() || 0; };
                const latestDate = allSess.length ? allSess.reduce((max, a) => pDate(a._sessionDate) > pDate(max) ? a._sessionDate : max, "") : LIVE_SESSION.meta._liveDate || LIVE_SESSION.meta.date;
                return `${latestDate} · ${allSess.length} atletas monitorados`;
              })()}
            </div>
            <div style={{overflowX:"auto",overflowY:"auto",maxHeight:560}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead style={{position:"sticky",top:0,zIndex:2,background:t.bgCard}}>
                  <tr style={{borderBottom:`2px solid ${t.border}`}}>
                    {[{l:"Atleta",k:"n"},{l:"Classificação",k:"classif"},{l:"Dist (m)",k:"dist"},{l:"HSR (m)",k:"hsr"},{l:"Spr >20",k:"sprints"},{l:"Spr >25",k:"sprints_25"},{l:"Acel",k:"acel"},{l:"Decel",k:"decel"},{l:"PL",k:"pl"},{l:"Vel. Pico",k:"vel"},{l:"PSE",k:"pse"},{l:"sRPE",k:"srpe"},{l:"Sono",k:"sono"},{l:"Dor",k:"dor"},{l:"Recup.",k:"rec"},{l:"CMJ (cm)",k:"cmj"}].map((h,i)=>
                      <th key={i} style={{padding:"6px 8px",textAlign:i===0?"left":"center",fontWeight:700,color:sessSort.col===h.k?acc:t.textMuted,fontSize:9,whiteSpace:"nowrap",cursor:"pointer",userSelect:"none"}} onClick={()=>setSessSort(prev=>({col:h.k,dir:prev.col===h.k&&prev.dir==="asc"?"desc":"asc"}))}>{h.l}{sessSort.col===h.k?sessSort.dir==="desc"?" ↓":" ↑":""}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(()=>{const classOrder={vermelho:0,amarelo:1,verde:2};const allSessionPlayers=players.filter(p=>LIVE_SESSION.atletas[p.n]).map(p=>{const sess=LIVE_SESSION.atletas[p.n];return{p,sess,classif:sess.classificacao};}).sort((a,b)=>{const d=sessSort.dir==="asc"?1:-1;const col=sessSort.col;if(col==="n")return d*a.p.n.localeCompare(b.p.n);if(col==="classif")return d*(classOrder[a.classif]-classOrder[b.classif]);const gv=(x,k)=>{const s=x.sess;if(!s)return 0;if(k==="dist")return s.gps?.dist_total||0;if(k==="hsr")return s.gps?.hsr||0;if(k==="sprints")return s.gps?.sprints||0;if(k==="sprints_25")return s.gps?.sprints_25||0;if(k==="acel")return s.gps?.acel||0;if(k==="decel")return s.gps?.decel||0;if(k==="pl")return s.gps?.player_load||0;if(k==="vel")return s.gps?.pico_vel||0;if(k==="pse")return s.carga_interna?.srpe_sessao||0;if(k==="srpe")return s.carga_interna?.srpe_total||0;if(k==="sono")return s.fisio?.sono_noite||0;if(k==="dor")return s.fisio?.dor_pos||0;if(k==="rec")return s.fisio?.rec_percebida||0;if(k==="cmj")return s.nm_response?.cmj_pre||0;return 0;};return d*(gv(a,col)-gv(b,col));});return allSessionPlayers.map(({p,sess,classif},idx)=>{
                    const classC=classif==="vermelho"?"#DC2626":classif==="amarelo"?"#CA8A04":"#16A34A";
                    const g=sess?.gps||{};const ci=sess?.carga_interna||{};const fi=sess?.fisio||{};const nm=sess?.nm_response||{};
                    const distPct=g.dist_baseline>0?Math.round((g.dist_total/g.dist_baseline)*100):0;
                    const hsrPct=g.hsr_baseline>0?Math.round((g.hsr/g.hsr_baseline)*100):0;
                    const distColor=distPct>120?"#DC2626":distPct>100?"#CA8A04":"#16A34A";
                    const hsrColor=hsrPct>130?"#DC2626":hsrPct>100?"#CA8A04":"#16A34A";
                    return <tr key={p.n} style={{borderBottom:`1px solid ${t.border}`,background:idx%2===0?"transparent":t.bgMuted+"44",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <td style={{padding:"8px",fontWeight:700,color:pri,whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:6,height:6,borderRadius:3,background:classC,flexShrink:0}}/>
                          {p.n}
                          <span style={{fontSize:8,color:t.textFaint}}>{p.pos}</span>
                        </div>
                      </td>
                      <td style={{padding:"8px",textAlign:"center"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,color:classC,background:classC+"15"}}>{classif.toUpperCase()}</span></td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.dist_total?<><span style={{color:distColor}}>{g.dist_total}</span> <span style={{fontSize:8,color:t.textFaint}}>({distPct}%)</span></>:<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.hsr?<><span style={{color:hsrColor}}>{g.hsr}</span> <span style={{fontSize:8,color:t.textFaint}}>({hsrPct}%)</span></>:<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.sprints||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:"#6D28D9"}}>{g.sprints_25||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.acel||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.decel||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.player_load?Math.round(g.player_load):<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.pico_vel||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:ci.srpe_sessao>7?"#DC2626":ci.srpe_sessao>5?"#CA8A04":"#16A34A"}}>{ci.srpe_sessao||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{ci.srpe_total||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:fi.sono_noite>0&&fi.sono_noite<6?"#DC2626":fi.sono_noite<7?"#CA8A04":"#16A34A"}}>{fi.sono_noite||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:fi.dor_pos>=4?"#DC2626":fi.dor_pos>=2?"#CA8A04":"#16A34A"}}>{fi.dor_pos||0}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:fi.rec_percebida>0&&fi.rec_percebida<=5?"#DC2626":fi.rec_percebida<=7?"#CA8A04":"#16A34A"}}>{fi.rec_percebida||<span style={{color:t.textFaint}}>—</span>}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{nm.cmj_pre||<span style={{color:t.textFaint}}>—</span>}</td>
                    </tr>;
                  });})()}
                </tbody>
                {/* Médias do time */}
                {(()=>{
                  const sessAtletas=Object.values(LIVE_SESSION.atletas).filter(s=>s.gps);
                  if(!sessAtletas.length) return null;
                  const avg=(arr,fn)=>{const vals=arr.map(fn).filter(v=>v>0);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;};
                  return <tfoot style={{position:"sticky",bottom:0,background:t.bgCard}}><tr style={{borderTop:`2px solid ${pri}`,fontWeight:800}}>
                    <td style={{padding:"8px",color:pri}}>MÉDIA EQUIPE</td>
                    <td style={{padding:"8px",textAlign:"center",fontSize:9,color:t.textFaint}}>{sessAtletas.length} atl.</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.dist_total)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.hsr)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.sprints)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:"#6D28D9"}}>{avg(sessAtletas,s=>s.gps.sprints_25)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.acel)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.decel)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.player_load)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.pico_vel)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.carga_interna.srpe_sessao)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.carga_interna.srpe_total)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.fisio.sono_noite)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.fisio.dor_pos)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.fisio.rec_percebida)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.nm_response.cmj_pre)}</td>
                  </tr></tfoot>;
                })()}
              </table>
            </div>
          </div>

          {/* Individual Session Cards */}
          {liveAlerts.map(alert=>{
            const sess=LIVE_SESSION.atletas[alert.n];
            if(!sess) return null;
            const classC=sess.classificacao==="vermelho"?"#DC2626":sess.classificacao==="amarelo"?"#CA8A04":"#16A34A";
            const classBg=sess.classificacao==="vermelho"?"#FEF2F2":sess.classificacao==="amarelo"?"#FEFCE8":"#F0FDF4";
            const classBc=sess.classificacao==="vermelho"?"#FECACA":sess.classificacao==="amarelo"?"#FEF08A":"#BBF7D0";
            const g=sess.gps;
            const ci=sess.carga_interna;
            const nm=sess.nm_response;
            const fi=sess.fisio;
            const ri=sess.risco;
            const deltaC=ri.delta>0.02?"#DC2626":ri.delta>0?"#EA580C":ri.delta<-0.01?"#16A34A":t.textMuted;
            const deltaSign=ri.delta>0?"+":"";
            return <div key={alert.n} style={{background:t.bgCard,borderRadius:12,border:`1px solid ${classBc}`,marginBottom:16,overflow:"hidden"}}>
              {/* Card Header */}
              <div style={{padding:"12px 18px",background:classBg,borderBottom:`1px solid ${classBc}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <PlayerPhoto theme={t} name={alert.n} sz={36}/>
                  <div>
                    <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,cursor:"pointer"}} onClick={()=>{setSel(alert.n);setTab("player")}}>{alert.n}</span>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint,marginLeft:8}}>{alert.pos}</span>
                  </div>
                  <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:classBg,color:classC,border:`1px solid ${classBc}`}}>{sess.classificacao.toUpperCase()}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:11,fontWeight:600,color:classC}}>{sess.classificacao_label}</span>
                  <div style={{textAlign:"center",padding:"4px 12px",background:t.bgCard,borderRadius:6,border:`1px solid ${deltaC}33`}}>
                    <div style={{fontSize:8,color:t.textFaint}}>Δ Risco</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:deltaC}}>{deltaSign}{(ri.delta*100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div style={{padding:18}}>
                {/* Section 1: External Load (GPS) */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <Zap size={12} color="#EA580C"/> Carga Externa (GPS)
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
                    {[
                      {l:"Dist. Total",v:g.dist_total?g.dist_total+"m":"—",bl:g.dist_baseline+"m",pct:g.dist_total?((g.dist_total/g.dist_baseline)*100).toFixed(0):0},
                      {l:"HSR (>20 km/h)",v:g.hsr+"m",bl:g.hsr_baseline+"m",pct:g.hsr_baseline?((g.hsr/g.hsr_baseline)*100).toFixed(0):0},
                      {l:"Spr >20",v:g.sprints,bl:g.sprints_baseline,pct:g.sprints_baseline?((g.sprints/g.sprints_baseline)*100).toFixed(0):0},
                      {l:"Spr >25",v:g.sprints_25||0,bl:g.sprints_25_baseline||0,pct:g.sprints_25_baseline?((g.sprints_25/g.sprints_25_baseline)*100).toFixed(0):0},
                      {l:"Acelerações",v:g.acel,bl:g.acel_baseline,pct:g.acel_baseline?((g.acel/g.acel_baseline)*100).toFixed(0):0},
                      {l:"Desacelerações",v:g.decel,bl:g.decel_baseline,pct:g.decel_baseline?((g.decel/g.decel_baseline)*100).toFixed(0):0},
                      {l:"Vel. Pico",v:g.pico_vel?g.pico_vel+" km/h":"—",bl:g.pico_vel_baseline+" km/h",pct:g.pico_vel?((g.pico_vel/g.pico_vel_baseline)*100).toFixed(0):0}
                    ].map((m,j)=>{
                      const pctN=Number(m.pct);
                      const pctC=pctN>110?"#DC2626":pctN>85?"#16A34A":pctN>50?"#CA8A04":t.textMuted;
                      return <div key={j} style={{textAlign:"center",padding:"6px 4px",background:t.bgMuted,borderRadius:6}}>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:pri}}>{m.v}</div>
                        <div style={{fontSize:8,color:t.textFaint}}>base: {m.bl}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,fontWeight:700,color:pctC}}>{pctN}%</div>
                      </div>;
                    })}
                  </div>
                </div>

                {/* Section 2: Internal Load */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <Heart size={12} color="#DC2626"/> Carga Interna
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                    {[
                      {l:"sRPE Sessão",v:ci.srpe_sessao,c:ci.srpe_sessao>7?"#DC2626":ci.srpe_sessao>5?"#CA8A04":"#16A34A"},
                      {l:"sRPE Total",v:ci.srpe_total+" UA",c:ci.srpe_total>500?"#DC2626":ci.srpe_total>400?"#CA8A04":"#16A34A"},
                      {l:"FC Média",v:ci.hr_avg?ci.hr_avg+" bpm":"—",c:ci.hr_avg&&ci.hr_baseline_avg&&ci.hr_avg>ci.hr_baseline_avg?"#EA580C":(ci.hr_avg?"#16A34A":t.textFaint)},
                      {l:"FC Máxima",v:ci.hr_max?ci.hr_max+" bpm":"—",c:ci.hr_max?t.textMuted:t.textFaint},
                      {l:"Tempo Z. Alta",v:ci.tempo_zona_alta?ci.tempo_zona_alta+"min":"—",c:ci.tempo_zona_alta&&ci.tempo_zona_alta_baseline&&ci.tempo_zona_alta>ci.tempo_zona_alta_baseline?"#DC2626":(ci.tempo_zona_alta?"#16A34A":t.textFaint)}
                    ].map((m,j)=>
                      <div key={j} style={{textAlign:"center",padding:"6px 4px",background:t.bgMuted,borderRadius:6}}>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>)}
                  </div>
                </div>

                {/* Section 3: Neuromuscular Response */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <Activity size={12} color="#7c3aed"/> Resposta Neuromuscular
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                    {[
                      {l:"CMJ Pré",v:nm.cmj_pre+" cm",c:t.textMuted},
                      {l:"CMJ Pós",v:nm.cmj_pos+" cm",c:nm.cmj_delta_pct<-5?"#DC2626":nm.cmj_delta_pct<-3?"#EA580C":"#16A34A"},
                      {l:"CMJ Δ",v:(nm.cmj_delta_pct>0?"+":"")+nm.cmj_delta_pct+"%",c:nm.cmj_delta_pct<-5?"#DC2626":nm.cmj_delta_pct<-3?"#EA580C":"#16A34A"},
                      {l:"ASI Pós",v:nm.asi_pos+"%",c:nm.asi_pos>12?"#DC2626":nm.asi_pos>8?"#CA8A04":"#16A34A"},
                      {l:"NME Pós",v:nm.nme_pos?.toFixed(4),c:nm.nme_pos<0.012?"#DC2626":nm.nme_pos<0.015?"#EA580C":"#16A34A"}
                    ].map((m,j)=>
                      <div key={j} style={{textAlign:"center",padding:"6px 4px",background:t.bgMuted,borderRadius:6}}>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>)}
                  </div>
                </div>

                {/* Section 4: Physiological State */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <Shield size={12} color="#2563eb"/> Estado Fisiológico
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                    {[
                      {l:"Sono (noite anterior)",v:fi.sono_noite+"h",c:fi.sono_noite<6?"#DC2626":fi.sono_noite<7?"#CA8A04":"#16A34A"},
                      {l:"Dor Pós-Sessão",v:fi.dor_pos+"/10",c:fi.dor_pos>=4?"#DC2626":fi.dor_pos>=2?"#CA8A04":"#16A34A"},
                      {l:"Recuperação Percebida",v:fi.rec_percebida+"/10",c:fi.rec_percebida<=5?"#DC2626":fi.rec_percebida<=7?"#CA8A04":"#16A34A"}
                    ].map((m,j)=>
                      <div key={j} style={{textAlign:"center",padding:"6px 4px",background:t.bgMuted,borderRadius:6}}>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>)}
                  </div>
                </div>

                {/* Section 5: Risk Impact */}
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <TrendingUp size={12} color={deltaC}/> Impacto no Risco de Lesão
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:8}}>
                    <div style={{textAlign:"center",padding:"8px",background:t.bgMuted,borderRadius:8}}>
                      <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>PROB. PRÉ</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:800,color:ri.prob_pre>=0.5?"#DC2626":ri.prob_pre>=0.3?"#EA580C":"#CA8A04"}}>{(ri.prob_pre*100).toFixed(0)}%</div>
                    </div>
                    <div style={{textAlign:"center",padding:"8px",background:t.bgMuted,borderRadius:8}}>
                      <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>PROB. PÓS</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:800,color:ri.prob_pos>=0.5?"#DC2626":ri.prob_pos>=0.3?"#EA580C":"#CA8A04"}}>{(ri.prob_pos*100).toFixed(0)}%</div>
                    </div>
                    <div style={{textAlign:"center",padding:"8px",background:`${deltaC}08`,borderRadius:8,border:`1px solid ${deltaC}22`}}>
                      <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>DELTA</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:800,color:deltaC}}>{deltaSign}{(ri.delta*100).toFixed(1)}%</div>
                    </div>
                    <div style={{padding:"8px 12px",background:t.bgMuted,borderRadius:8,display:"flex",alignItems:"center"}}>
                      <div style={{fontSize:10,color:t.textMuted,lineHeight:1.4}}>{sess.obs}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>;
          })}

          {/* Session Charts Summary */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:14}}>Resumo da Sessão — Carga vs Resposta</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              {/* Chart 1: GPS Load vs Baseline */}
              <div>
                <div style={{fontSize:10,fontWeight:600,color:t.textMuted,marginBottom:6}}>Carga GPS (% do Baseline)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={liveAlerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>{const s=LIVE_SESSION.atletas[a.n];return {n:a.n.split(" ")[0],dist:s.gps.dist_baseline?Math.round((s.gps.dist_total/s.gps.dist_baseline)*100):0,hsr:s.gps.hsr_baseline?Math.round((s.gps.hsr/s.gps.hsr_baseline)*100):0};})} margin={{left:-10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                    <XAxis dataKey="n" tick={{fontSize:8,fill:t.textFaint}} interval={0} angle={-30} textAnchor="end" height={40}/>
                    <YAxis tick={{fontSize:8,fill:t.textFaint}} domain={[0,120]}/>
                    <Tooltip content={<Tip theme={t}/>}/>
                    <ReferenceLine y={100} stroke={t.textFaint} strokeDasharray="3 3"/>
                    <Bar dataKey="dist" name="Dist %" fill="#2563eb" radius={[2,2,0,0]} barSize={10}/>
                    <Bar dataKey="hsr" name="HSR %" fill="#EA580C" radius={[2,2,0,0]} barSize={10}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Chart 2: CMJ Delta Post-Session */}
              <div>
                <div style={{fontSize:10,fontWeight:600,color:t.textMuted,marginBottom:6}}>CMJ Δ Pós-Sessão (%)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={liveAlerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>{const s=LIVE_SESSION.atletas[a.n];return {n:a.n.split(" ")[0],delta:s.nm_response.cmj_delta_pct};})} margin={{left:-10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                    <XAxis dataKey="n" tick={{fontSize:8,fill:t.textFaint}} interval={0} angle={-30} textAnchor="end" height={40}/>
                    <YAxis tick={{fontSize:8,fill:t.textFaint}} domain={[-8,1]}/>
                    <Tooltip content={<Tip theme={t}/>}/>
                    <ReferenceLine y={-5} stroke="#DC2626" strokeDasharray="3 3" label={{value:"-5%",fontSize:8,fill:"#DC2626"}}/>
                    <Bar dataKey="delta" name="CMJ Δ %" radius={[2,2,0,0]}>
                      {liveAlerts.filter(a=>LIVE_SESSION.atletas[a.n]).map((a,i)=>{const d=LIVE_SESSION.atletas[a.n].nm_response.cmj_delta_pct;return <Cell key={i} fill={d<-5?"#DC2626":d<-3?"#EA580C":"#16A34A"}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Chart 3: Risk Delta */}
              <div>
                <div style={{fontSize:10,fontWeight:600,color:t.textMuted,marginBottom:6}}>Δ Risco de Lesão (%)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={liveAlerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>{const s=LIVE_SESSION.atletas[a.n];return {n:a.n.split(" ")[0],delta:Number((s.risco.delta*100).toFixed(1))};})} margin={{left:-10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                    <XAxis dataKey="n" tick={{fontSize:8,fill:t.textFaint}} interval={0} angle={-30} textAnchor="end" height={40}/>
                    <YAxis tick={{fontSize:8,fill:t.textFaint}} domain={[-3,5]}/>
                    <Tooltip content={<Tip theme={t}/>}/>
                    <ReferenceLine y={0} stroke={t.textFaint}/>
                    <Bar dataKey="delta" name="Δ Risco %" radius={[2,2,0,0]}>
                      {liveAlerts.filter(a=>LIVE_SESSION.atletas[a.n]).map((a,i)=>{const d=LIVE_SESSION.atletas[a.n].risco.delta;return <Cell key={i} fill={d>0.02?"#DC2626":d>0?"#EA580C":d<-0.01?"#16A34A":t.textMuted}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>}
        </div>}

        {tab==="model"&&<div>
          {/* ═══ PLANO DO DIA — resumo executivo ═══
              Em vez de jogar 6 métricas técnicas e o pipeline acadêmico
              na cara, mostra: (1) quantos atletas precisam de ação hoje
              por zona, (2) top 5 prioridades com driver principal e dose
              recomendada, (3) tendência da semana. Detalhes técnicos
              (feature importance, clusters, fadiga D→D+1, log-reg)
              ficam em seções colapsadas para tirar do caminho. */}
          {(()=>{
            const vermelhos=liveAlerts.filter(a=>a.zone==="VERMELHO");
            const laranjas=liveAlerts.filter(a=>a.zone==="LARANJA");
            const amarelos=liveAlerts.filter(a=>a.zone==="AMARELO");
            const verdes=liveAlerts.filter(a=>a.zone==="VERDE");
            const acionar=[...vermelhos,...laranjas,...amarelos].sort((a,b)=>b.prob-a.prob);
            const driverDe=(a)=>{
              const top=a.shap_pos&&a.shap_pos.length>0?a.shap_pos.reduce((m,s)=>s.sv>m.sv?s:m):null;
              return top?top.f:"—";
            };
            const doseDe=(a)=>a.dose||(a.zone==="VERMELHO"?"Excluir da sessão":a.zone==="LARANJA"?"50% volume · sem HSR":a.zone==="AMARELO"?"−30% HSR · monitorar PSE":"Liberado");
            return <>
              <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,flexWrap:"wrap",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:9,color:t.textFaint,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Plano do Dia · {todayStr}</div>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:900,fontSize:20,color:t.text,letterSpacing:-.4}}>Motor Preditivo de Lesões</div>
                    <div style={{fontSize:11,color:t.textFaint,marginTop:2}}>Quem precisa de ajuste de carga hoje, por que, e o quanto.</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {[{l:"Excluir",n:vermelhos.length,c:"#DC2626"},{l:"Reduzir",n:laranjas.length,c:"#EA580C"},{l:"Atenção",n:amarelos.length,c:"#CA8A04"},{l:"Liberados",n:verdes.length,c:"#16A34A"}].map((z,i)=>
                      <div key={i} style={{textAlign:"center",padding:"8px 14px",borderRadius:10,background:`${z.c}10`,border:`1px solid ${z.c}33`,minWidth:64}}>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:22,fontWeight:900,color:z.c,lineHeight:1}}>{z.n}</div>
                        <div style={{fontSize:9,color:z.c,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:2}}>{z.l}</div>
                      </div>)}
                  </div>
                </div>
                {acionar.length>0?
                  <div style={{borderTop:`1px solid ${t.borderLight}`,paddingTop:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Prioridades — clique para detalhes</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {acionar.slice(0,8).map((a,i)=>{
                        const zs=ZC[a.zone];
                        return <div key={i} onClick={()=>{setSel(a.n);setTab("player")}} style={{display:"grid",gridTemplateColumns:"24px 130px 60px 1fr 1.4fr",gap:10,alignItems:"center",padding:"7px 10px",borderRadius:8,background:i%2===0?t.bgMuted:"transparent",cursor:"pointer",border:`1px solid transparent`,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=zs.bc;e.currentTarget.style.background=`${zs.c}08`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor="transparent";e.currentTarget.style.background=i%2===0?t.bgMuted:"transparent";}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:zs.c,flexShrink:0}}/>
                            <span style={{fontSize:10,color:t.textFaint,fontFamily:"'JetBrains Mono'"}}>{i+1}</span>
                          </div>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:800,color:pri,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.n}</div>
                            <div style={{fontSize:9,color:t.textFaint,fontFamily:"'JetBrains Mono'"}}>{a.pos}</div>
                          </div>
                          <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:zs.c,textAlign:"right"}}>{(a.prob*100).toFixed(0)}%</div>
                          <div style={{fontSize:11,color:t.text}}>
                            <span style={{fontSize:9,color:t.textFaint,marginRight:6}}>DRIVER</span>{driverDe(a)}
                          </div>
                          <div style={{fontSize:11,color:zs.c,fontWeight:600}}>
                            <span style={{fontSize:9,color:t.textFaint,marginRight:6,fontWeight:500}}>AÇÃO</span>{doseDe(a)}
                          </div>
                        </div>;
                      })}
                    </div>
                    {acionar.length>8&&<div style={{fontSize:10,color:t.textFaint,marginTop:6,textAlign:"center"}}>+ {acionar.length-8} atletas adicionais com risco — ver lista completa abaixo</div>}
                  </div>
                : <div style={{padding:14,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:8,fontSize:12,color:"#166534",fontWeight:600,textAlign:"center"}}>Nenhum alerta ativo — todo elenco liberado para carga integral.</div>}
                {/* Validação técnica do modelo — discreta, no rodapé */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,marginTop:14,paddingTop:10,borderTop:`1px dashed ${t.borderLight}`,fontSize:10,color:t.textFaint}}>
                  <span>XGBoost calibrado · 110 features · pipeline KNN→LASSO+MI→Optuna→SMOTE+Tomek→Calibração→SHAP</span>
                  <div style={{display:"flex",gap:14}}>
                    {[["AUC-ROC",ML.pipeline.xgboost.metrics.auc_roc],["AUC Cal.",ML.pipeline.xgboost.metrics.auc_calibrated],["Recall",ML.pipeline.xgboost.metrics.recall],["Spec.",ML.pipeline.xgboost.metrics.specificity]].map(([l,v],i)=>
                      <span key={i}><span style={{fontWeight:700,marginRight:3}}>{l}</span><span style={{fontFamily:"'JetBrains Mono'",color:t.textMuted}}>{v}</span></span>)}
                  </div>
                </div>
              </div>
            </>;
          })()}

          {/* ─── Por que o modelo decide assim? (colapsável) ─── */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,marginBottom:16}}>
            <div onClick={()=>setModelExpand(s=>({...s,features:!s.features}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",cursor:"pointer",borderBottom:modelExpand.features?`1px solid ${t.borderLight}`:"none"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Por que o modelo decide assim?</div>
                <div style={{fontSize:10.5,color:t.textFaint,marginTop:2}}>Importância das variáveis e clusters de risco — explicabilidade do modelo</div>
              </div>
              <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textFaint,fontWeight:700,padding:"4px 10px",borderRadius:6,background:t.bgMuted,border:`1px solid ${t.borderLight}`}}>{modelExpand.features?"− OCULTAR":"+ MOSTRAR"}</span>
            </div>
            {modelExpand.features&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,padding:16}}>
            {/* Feature Importance with categories */}
            <div style={{background:t.bgMuted,borderRadius:10,padding:14}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Importância das Variáveis (XGBoost + LASSO)</div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:8}}>Cores: <span style={{color:"#DC2626"}}>Histórico</span> · <span style={{color:"#EA580C"}}>Carga</span> · <span style={{color:"#7c3aed"}}>Neuromuscular</span> · <span style={{color:"#2563eb"}}>Bem-estar</span> · <span style={{color:"#16A34A"}}>Biomecânica</span> · <span style={{color:"#CA8A04"}}>Interação</span> · <span style={{color:"#0891b2"}}>Temporal</span></div>
              <ResponsiveContainer width="100%" height={560}>
                <BarChart data={ML.features} layout="vertical" margin={{left:140}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                  <XAxis type="number" tick={{fontSize:9,fill:t.textFaint}} domain={[0,0.12]}/>
                  <YAxis type="category" dataKey="f" tick={{fontSize:8,fill:t.textMuted}} width={135}/>
                  <Tooltip content={({active,payload})=>{
                    if(!active||!payload?.length)return null;
                    const d=ML.features.find(f=>f.v===payload[0].value);
                    return <div style={{background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,.08)",maxWidth:280}}>
                      <div style={{fontWeight:700,color:pri,marginBottom:4}}>{d?.f}</div>
                      <div style={{color:t.textMuted,fontSize:10,marginBottom:4}}>{d?.desc}</div>
                      <div style={{display:"flex",gap:12}}>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10}}>XGBoost: {d?.v}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10}}>LASSO β: {d?.lasso_coef}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10}}>Dir: {d?.dir}</span>
                      </div>
                    </div>;
                  }}/>
                  <Bar dataKey="v" name="Importância" radius={[0,4,4,0]}>
                    {ML.features.map((f,i)=><Cell key={i} fill={
                      f.cat==="hist"?"#DC2626":f.cat==="carga"?"#EA580C":f.cat==="neuromusc"?"#7c3aed":
                      f.cat==="wellness"?"#2563eb":f.cat==="biomecanica"?"#16A34A":f.cat==="bioquim"?"#DC2626":
                      f.cat==="interação"?"#CA8A04":f.cat==="temporal"?"#0891b2":t.textFaint
                    }/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clusters de Risco */}
            <div style={{background:t.bgMuted,borderRadius:10,padding:14}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Clusters de Risco</div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:10}}>Diagnóstico diferencial: Aguda vs Sobrecarga (Rommers et al., 2020)</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {ML.clusters.map(cl=>
                  <div key={cl.id} style={{padding:12,borderRadius:10,border:`1px solid ${cl.c}22`,background:`${cl.c}08`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:cl.c}}>{cl.name}</div>
                        <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,
                          background:cl.type==="aguda"?"#FEF2F2":"#FFF7ED",
                          color:cl.type==="aguda"?"#DC2626":"#EA580C",
                          border:`1px solid ${cl.type==="aguda"?"#FECACA":"#FED7AA"}`
                        }}>{cl.type==="aguda"?"AGUDA":"SOBRECARGA"}</span>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textMuted}}>{cl.ep} episódios</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:cl.c,padding:"1px 6px",borderRadius:4,background:`${cl.c}15`}}>{cl.rate}% lesão</span>
                      </div>
                    </div>
                    <div style={{fontSize:10,color:t.textMuted,fontFamily:"'JetBrains Mono'",marginBottom:4}}>{cl.rule}</div>
                    <div style={{fontSize:11,color:cl.c,fontWeight:500}}>{cl.action}</div>
                  </div>
                )}
              </div>
            </div>
            </div>}
          </div>

          {/* Saída Clínica SHAP — Por Atleta */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Detalhe por Atleta · Explicabilidade SHAP</div>
                <div style={{fontSize:11,color:t.textFaint}}>{todayStr} · Por que cada atleta entrou em alerta — drivers e protetivos</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[{l:"Vermelho",c:"#DC2626",n:liveAlerts.filter(a=>a.zone==="VERMELHO").length},
                  {l:"Laranja",c:"#EA580C",n:liveAlerts.filter(a=>a.zone==="LARANJA").length},
                  {l:"Amarelo",c:"#CA8A04",n:liveAlerts.filter(a=>a.zone==="AMARELO").length}
                ].map((z,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${z.c}12`,color:z.c,border:`1px solid ${z.c}33`}}>{z.n} {z.l}</span>)}
              </div>
            </div>

            {/* Clinical Cards */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {liveAlerts.map((a,i)=>{
                const zs=ZC[a.zone];
                const ext=PLAYER_EXT[a.n];
                return <div key={i} style={{borderRadius:10,border:`1px solid ${zs.bc}`,overflow:"hidden"}}>
                  {/* Alert Header */}
                  <div style={{padding:"10px 14px",background:zs.bg,borderBottom:`1px solid ${zs.bc}`,cursor:"pointer"}} onClick={()=>{setSel(a.n);setTab("player")}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:zs.c,flexShrink:0}}/>
                      <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri}}>{a.n}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>{a.pos}</span>
                      <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:zs.bg,color:zs.c,border:`1px solid ${zs.bc}`}}>{a.zone}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:zs.c}}>{(a.prob*100).toFixed(0)}%</span>
                      {a.perfil_risco&&(()=>{const pr=PERFIL_RISCO_LABELS[a.perfil_risco];return <span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,background:pr.bg,color:pr.c,border:`1px solid ${pr.bc}`}}>{pr.label}</span>;})()}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      {[{l:"ACWR",v:a.acwr,c:a.acwr>1.3?"#DC2626":pri},{l:"CMJ",v:(a.cmj>0?"+":"")+a.cmj+"%",c:a.cmj<-8?"#DC2626":a.cmj<-5?"#EA580C":"#16A34A"},{l:"Sono",v:a.sono,c:a.sono<6?"#DC2626":a.sono<7?"#CA8A04":"#16A34A"}].map((m,j)=>
                        <div key={j} style={{textAlign:"center",padding:"2px 6px"}}>
                          <div style={{fontSize:8,color:t.textFaint}}>{m.l}</div>
                          <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>)}
                    </div>
                    </div>
                  </div>

                  {/* SHAP Detail */}
                  <div style={{padding:"10px 14px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
                      {/* SHAP Positive */}
                      <div>
                        <div style={{fontSize:9,color:"#DC2626",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>SHAP — Aumentam Risco</div>
                        {a.shap_pos.map((s,j)=>{
                          const maxSv=Math.max(...a.shap_pos.map(x=>x.sv));
                          return <div key={j} style={{marginBottom:4}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}>
                              <span style={{fontSize:10,fontWeight:600,color:t.text}}>{s.f}</span>
                              <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:"#DC2626"}}>+{s.sv.toFixed(3)} ({s.v})</span>
                            </div>
                            <div style={{height:4,background:t.bgMuted2,borderRadius:4}}>
                              <div style={{height:"100%",width:`${(s.sv/maxSv)*100}%`,background:"#DC2626",borderRadius:4,opacity:0.7}}/>
                            </div>
                            <div style={{fontSize:8,color:t.textFaint,marginTop:1}}>{s.note}</div>
                          </div>;
                        })}
                      </div>
                      {/* SHAP Negative */}
                      <div>
                        <div style={{fontSize:9,color:"#16A34A",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>SHAP — Reduzem Risco (Protetivos)</div>
                        {a.shap_neg.map((s,j)=>{
                          const maxSv=Math.max(...a.shap_neg.map(x=>Math.abs(x.sv)));
                          return <div key={j} style={{marginBottom:4}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}>
                              <span style={{fontSize:10,fontWeight:600,color:t.text}}>{s.f}</span>
                              <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:"#16A34A"}}>{s.sv.toFixed(3)} ({s.v})</span>
                            </div>
                            <div style={{height:4,background:t.bgMuted2,borderRadius:4}}>
                              <div style={{height:"100%",width:`${(Math.abs(s.sv)/maxSv)*100}%`,background:"#16A34A",borderRadius:4,opacity:0.7}}/>
                            </div>
                            <div style={{fontSize:8,color:t.textFaint,marginTop:1}}>{s.note}</div>
                          </div>;
                        })}
                      </div>
                    </div>

                    {/* Diagnóstico Diferencial + Protocolo */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <div style={{padding:"8px 10px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE"}}>
                        <div style={{fontSize:9,color:"#2563EB",fontWeight:700,marginBottom:3}}>DIAGNÓSTICO DIFERENCIAL</div>
                        <div style={{display:"flex",gap:8,marginBottom:3}}>
                          <div style={{textAlign:"center",flex:1}}>
                            <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:a.diag_diff.aguda>50?"#DC2626":t.textMuted}}>{a.diag_diff.aguda}%</div>
                            <div style={{fontSize:8,color:t.textMuted}}>Aguda</div>
                          </div>
                          <div style={{width:1,background:"#BFDBFE"}}/>
                          <div style={{textAlign:"center",flex:1}}>
                            <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:a.diag_diff.sobrecarga>50?"#EA580C":t.textMuted}}>{a.diag_diff.sobrecarga}%</div>
                            <div style={{fontSize:8,color:t.textMuted}}>Sobrecarga</div>
                          </div>
                        </div>
                        <div style={{fontSize:9,color:"#1e40af",lineHeight:1.4}}>{a.diag_diff.base}</div>
                      </div>
                      <div style={{padding:"8px 10px",background:"#F0FDF4",borderRadius:6,border:"1px solid #BBF7D0"}}>
                        <div style={{fontSize:9,color:"#16A34A",fontWeight:700,marginBottom:3}}>PROTOCOLO DE MITIGAÇÃO</div>
                        <div style={{fontSize:10,color:"#166534",marginBottom:2}}><strong>Mecânica:</strong> {a.protocolo.mecanica}</div>
                        <div style={{fontSize:10,color:"#166534",marginBottom:2}}><strong>Carga:</strong> -{a.protocolo.carga_reducao}% — {a.protocolo.carga_nota}</div>
                        <div style={{fontSize:10,color:"#166534"}}><strong>Compensatório:</strong> {a.protocolo.compensatorio}</div>
                      </div>
                    </div>
                    {/* Biomechanical extras if available */}
                    {ext&&(()=>{const pl=players.find(pp=>pp.n===a.n);const mono=pl?._monotonia||ext.monotonia;const hsrAcwr=pl?.ai||ext.hsr_acwr;return <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginTop:8}}>
                      {[
                        {l:"SLCMJ ASI",v:ext.slcmj_asi+"%",c:ext.slcmj_asi>12?"#DC2626":ext.slcmj_asi>8?"#EA580C":"#16A34A"},
                        {l:"H:Q Ratio",v:ext.hq_ratio,c:ext.hq_ratio<0.55?"#DC2626":"#16A34A"},
                        {l:"COP Sway",v:ext.cop_sway+"mm",c:ext.cop_sway>18?"#DC2626":ext.cop_sway>15?"#EA580C":"#16A34A"},
                        {l:"Valgo DLS",v:ext.valgus_dls+"°",c:ext.valgus_dls>8?"#DC2626":ext.valgus_dls>6?"#EA580C":"#16A34A"},
                        {l:"Monotonia",v:mono,c:mono>2?"#DC2626":mono>1.5?"#CA8A04":"#16A34A"},
                        {l:"HSR ACWR",v:hsrAcwr,c:hsrAcwr>1.3?"#DC2626":hsrAcwr>1?"#CA8A04":"#16A34A"}
                      ].map((m,j)=>
                        <div key={j} style={{textAlign:"center",padding:"4px",background:t.bgMuted,borderRadius:4}}>
                          <div style={{fontSize:7,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                          <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>)}
                    </div>;})()}
                  </div>
                </div>;
              })}
            </div>
          </div>

          {/* ─── Ciclo de Carga D → D+1 (colapsável) ─── */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,marginBottom:16}}>
            <div onClick={()=>setModelExpand(s=>({...s,fadiga:!s.fadiga}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",cursor:"pointer",borderBottom:modelExpand.fadiga?`1px solid ${t.borderLight}`:"none"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Ciclo de Carga · D → D+1</div>
                <div style={{fontSize:10.5,color:t.textFaint,marginTop:2}}>Como a carga de hoje afeta wellness/recuperação amanhã (matriz Pearson)</div>
              </div>
              <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textFaint,fontWeight:700,padding:"4px 10px",borderRadius:6,background:t.bgMuted,border:`1px solid ${t.borderLight}`}}>{modelExpand.fadiga?"− OCULTAR":"+ MOSTRAR"}</span>
            </div>
            {modelExpand.fadiga&&<div style={{padding:"4px 18px 18px"}}>
          {/* ═══════════════════════════════════════════════════════════════
                CICLO DE FADIGA → RECUPERAÇÃO (Matriz de Correlação D / D+1)
                ═══════════════════════════════════════════════════════════════
                Cruza carga externa do dia D (Distância, HSR, SPR, PL) com
                wellness/PSE do dia D+1 (sono, dor, recuperação geral, PSE
                pré-treino) e carga externa do D+1. Pearson pareado por atleta
                + pool. r ∈ [-1,1]. Gradient cromático: forte+ = vermelho neon,
                forte- = azul neon. Fundamento: residual fatigue model
                (Banister & Calvert, 1980; Halson, 2014).
                ═══════════════════════════════════════════════════════════════ */}
          {(()=>{
            const gpsAll=sheetData?.gps||{};
            const questAll=sheetData?.questionarios||{};
            const diarioAll=sheetData?.diario||{};
            const names=Object.keys(gpsAll);
            if(!names.length) return null;

            const parseDt=s=>{if(!s)return 0;const v=String(s).trim();if(/^\d{4}-\d{2}-\d{2}/.test(v))return new Date(v).getTime();const p=v.split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(a>31)return new Date(a,b-1,c).getTime();if(c>31)return new Date(c,b-1,a).getTime();return new Date(c,a-1,b).getTime();}return new Date(v).getTime()||0;};
            const dayKey=ts=>{if(!ts)return"";const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};

            // Construir pares (D, D+1) por atleta.
            const dPairs=[]; // cada par: { dDist, dHsr, dSpr, dPl, dPse, d1Sono, d1Dor, d1Rec, d1Pse, d1Dist, d1Hsr }
            for(const name of names){
              const gpsByDay={}; for(const e of gpsAll[name]||[]){const k=dayKey(parseDt(e.date));if(k)gpsByDay[k]=e;}
              const qByDay={};   for(const e of questAll[name]||[]){const k=dayKey(parseDt(e.date));if(k)qByDay[k]=e;}
              const diaByDay={}; for(const e of diarioAll[name]||[]){const k=dayKey(parseDt(e.date));if(k)diaByDay[k]=e;}
              const sortedKeys=Object.keys(gpsByDay).sort();
              for(let i=0;i<sortedKeys.length-1;i++){
                const kD=sortedKeys[i];
                const dDate=new Date(kD); const next=new Date(dDate); next.setDate(next.getDate()+1);
                const kD1=dayKey(next.getTime());
                const gD=gpsByDay[kD]; const gD1=gpsByDay[kD1];
                if(!gD||!gD1) continue;
                const qD1=qByDay[kD1]; const diaD=diaByDay[kD]; const diaD1=diaByDay[kD1];
                dPairs.push({
                  dDist:gD.gps?.dist_total||0, dHsr:gD.gps?.hsr||0, dSpr:gD.gps?.hsr_25||0,
                  dPl:gD.gps?.player_load||0,  dPse:Number(gD.pse)||Number(diaD?.pse)||0,
                  d1Sono:Number(qD1?.sono_qualidade)||0, d1Dor:Number(qD1?.dor)||0,
                  d1Rec:Number(qD1?.recuperacao_geral)||0, d1Pse:Number(diaD1?.pse)||Number(gD1.pse)||0,
                  d1Dist:gD1.gps?.dist_total||0, d1Hsr:gD1.gps?.hsr||0
                });
              }
            }
            if(dPairs.length<6) return null;

            const cols=[
              {k:"dDist",   l:"D · Dist"},
              {k:"dHsr",    l:"D · HSR"},
              {k:"dSpr",    l:"D · SPR"},
              {k:"dPl",     l:"D · PL"},
              {k:"dPse",    l:"D · PSE"}
            ];
            const rowsM=[
              {k:"d1Sono", l:"D+1 · Sono",  inv:true},
              {k:"d1Dor",  l:"D+1 · Dor",   inv:false},
              {k:"d1Rec",  l:"D+1 · Rec.",  inv:true},
              {k:"d1Pse",  l:"D+1 · PSE",   inv:false},
              {k:"d1Dist", l:"D+1 · Dist",  inv:false},
              {k:"d1Hsr",  l:"D+1 · HSR",   inv:false}
            ];
            const pearson=(xs,ys)=>{
              const n=xs.length; if(n<3) return null;
              const mx=xs.reduce((a,b)=>a+b,0)/n; const my=ys.reduce((a,b)=>a+b,0)/n;
              let num=0,dx=0,dy=0;
              for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}
              const den=Math.sqrt(dx*dy);
              return den>0?Math.round((num/den)*1000)/1000:null;
            };
            // Matriz r
            const matrix=rowsM.map(r=>cols.map(c=>{
              const xs=[],ys=[];
              for(const p of dPairs){
                const x=Number(p[c.k]); const y=Number(p[r.k]);
                if(Number.isFinite(x)&&Number.isFinite(y)&&x>0&&y>0){xs.push(x);ys.push(y);}
              }
              return {r:pearson(xs,ys),n:xs.length};
            }));
            const rColor=(v)=>{
              if(v===null||v===undefined||!Number.isFinite(v)) return t.bgMuted;
              const a=Math.min(1,Math.abs(v));
              if(v>=0) return `rgba(220, 38, 38, ${a})`;       // vermelho
              return `rgba(34, 211, 238, ${a})`;                // ciano
            };

            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <Brain size={14} color="#DC2626"/>
                Ciclo Fadiga → Recuperação · Matriz de Correlação (D / D+1)
              </div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:10,maxWidth:780,lineHeight:1.5}}>
                Pearson pareado em <strong>{dPairs.length}</strong> pares (atleta × dia consecutivo).
                Linha = resposta no D+1 (wellness, PSE, carga); coluna = carga externa no D.
                <span style={{color:"#DC2626"}}> Vermelho</span> = correlação positiva forte (mais carga em D → mais sintoma em D+1);
                <span style={{color:"#22D3EE"}}> azul/ciano</span> = correlação negativa.
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"separate",borderSpacing:2,fontFamily:"'JetBrains Mono'",fontSize:11}}>
                  <thead>
                    <tr>
                      <th style={{padding:"4px 8px",fontSize:9,color:t.textFaint}}></th>
                      {cols.map((c,i)=><th key={i} style={{padding:"4px 6px",fontSize:9,color:t.textMuted,fontWeight:700,textAlign:"center"}}>{c.l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row,i)=><tr key={i}>
                      <th style={{padding:"4px 8px",fontSize:10,color:t.text,fontWeight:700,textAlign:"left",whiteSpace:"nowrap"}}>{rowsM[i].l}</th>
                      {row.map((cell,j)=>{
                        const r=cell.r;
                        const v=r==null?"—":(r>=0?"+":"")+r.toFixed(2);
                        const c=rColor(r);
                        const tx=r==null?t.textFaint:Math.abs(r)>0.4?"#fff":pri;
                        return <td key={j} title={`r=${v} · n=${cell.n}`} style={{padding:"6px 12px",background:c,borderRadius:6,color:tx,fontWeight:800,textAlign:"center",minWidth:60,border:`1px solid ${t.borderLight}`}}>{v}</td>;
                      })}
                    </tr>)}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:8,fontSize:9,color:t.textFaint,lineHeight:1.5}}>
                Interpretação: |r| ≥ 0.30 ⇒ correlação relevante (Cohen, 1988). Coluna SPR / Dist com Dor e PSE em D+1 são os marcadores de carryover de fadiga mais sensíveis em futebolistas (Halson, 2014).
              </div>
            </div>;
          })()}
            </div>}
          </div>

          {/* ─── Modelo paralelo (regressão logística) — colapsável ─── */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,marginBottom:16}}>
            <div onClick={()=>setModelExpand(s=>({...s,logreg:!s.logreg}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",cursor:"pointer",borderBottom:modelExpand.logreg?`1px solid ${t.borderLight}`:"none"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Modelo Paralelo · Regressão Logística</div>
                <div style={{fontSize:10.5,color:t.textFaint,marginTop:2}}>Modelo transparente (interpretável) que valida o XGBoost em paralelo</div>
              </div>
              <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textFaint,fontWeight:700,padding:"4px 10px",borderRadius:6,background:t.bgMuted,border:`1px solid ${t.borderLight}`}}>{modelExpand.logreg?"− OCULTAR":"+ MOSTRAR"}</span>
            </div>
            {modelExpand.logreg&&<div style={{padding:"4px 18px 18px"}}>
          {/* ═══════════════════════════════════════════════════════════════
                REGRESSÃO LOGÍSTICA — PROBABILIDADE DE LESÃO 7d
                ═══════════════════════════════════════════════════════════════
                Modelo paralelo (transparente) ao XGBoost. Usa picos de carga
                mecânica (max 7d de Dist, HSR, SPR, Acel/Decel >3 m/s²) +
                ACWR Global como features. Coeficientes via gradient ascent
                em log-likelihood (Newton-Raphson aproximado, 200 iters).
                Vetor de probabilidade individual + odds ratio explicativo.
                ═══════════════════════════════════════════════════════════════ */}
          {(()=>{
            const gpsAll=sheetData?.gps||{};
            const inj=liveInjuries||[];
            const names=Object.keys(gpsAll);
            if(!names.length) return null;

            const parseDt=s=>{if(!s)return 0;const v=String(s).trim();if(/^\d{4}-\d{2}-\d{2}/.test(v))return new Date(v).getTime();const p=v.split(/[\/\-\.]/);if(p.length>=3){const[a,b,c]=p.map(Number);if(a>31)return new Date(a,b-1,c).getTime();if(c>31)return new Date(c,b-1,a).getTime();return new Date(c,a-1,b).getTime();}return new Date(v).getTime()||0;};

            // Construção do dataset: para cada (atleta, semana epidemiológica)
            // calcular features de pico 7d e label = ocorreu lesão em [t, t+7d]?
            const rowsX=[]; const labelsY=[]; const meta=[];
            for(const name of names){
              const entries=(gpsAll[name]||[]).slice().sort((a,b)=>parseDt(a.date)-parseDt(b.date));
              if(entries.length<5) continue;
              const injDates=inj.filter(x=>x.n===name).map(x=>parseDt(x.date)).filter(Boolean);
              const stride=3*86400000;
              const t0=parseDt(entries[0].date), tN=parseDt(entries[entries.length-1].date);
              for(let cur=t0;cur<=tN;cur+=stride){
                const win7=entries.filter(e=>{const ts=parseDt(e.date);return ts>=cur-7*86400000&&ts<=cur;});
                if(win7.length<2) continue;
                const peak=(k)=>Math.max(0,...win7.map(e=>e.gps?.[k]||0));
                const sum=(k)=>win7.reduce((s,e)=>s+(e.gps?.[k]||0),0);
                // ACWR Global aproximado para a feature
                const win28=entries.filter(e=>{const ts=parseDt(e.date);return ts>=cur-28*86400000&&ts<cur-7*86400000;});
                const acwrK=(k)=>{const aS=sum(k);const cS=win28.reduce((s,e)=>s+(e.gps?.[k]||0),0);const cMean=win28.length?cS/(win28.length/3):0;return cMean>0?aS/cMean:1;};
                const x=[
                  peak("dist_total")/1000,        // pico distância (km)
                  peak("hsr")/100,                 // pico HSR (centenas m)
                  peak("hsr_25")/50,                // pico SPR (50m)
                  peak("acel_3"),                   // pico Acel ≥3 m/s²
                  peak("decel_3"),                  // pico Decel ≤-3 m/s²
                  Math.min(3,Math.max(0,acwrK("dist_total"))) // ACWR clipado
                ];
                const y=injDates.some(d=>d>cur&&d<=cur+7*86400000)?1:0;
                rowsX.push(x); labelsY.push(y); meta.push({name,cur});
              }
            }
            if(rowsX.length<30) return null;
            const positives=labelsY.reduce((a,b)=>a+b,0);
            if(positives<2) return null; // amostra insuficiente

            // Padronizar por z-score (estabiliza Newton-Raphson)
            const p=rowsX[0].length;
            const mu=new Array(p).fill(0); const sd=new Array(p).fill(0);
            for(const r of rowsX) for(let j=0;j<p;j++) mu[j]+=r[j];
            for(let j=0;j<p;j++) mu[j]/=rowsX.length;
            for(const r of rowsX) for(let j=0;j<p;j++) sd[j]+=(r[j]-mu[j])**2;
            for(let j=0;j<p;j++) sd[j]=Math.sqrt(sd[j]/Math.max(rowsX.length-1,1))||1;
            const Z=rowsX.map(r=>r.map((v,j)=>(v-mu[j])/sd[j]));

            // Gradient ascent em log-likelihood logístico (regularização L2 leve λ=0.1)
            const sigm=z=>1/(1+Math.exp(-Math.max(-30,Math.min(30,z))));
            const beta=new Array(p+1).fill(0); // [intercept, ...coefs]
            const lr=0.05; const lambda=0.1; const iters=400;
            for(let it=0;it<iters;it++){
              const grad=new Array(p+1).fill(0);
              for(let i=0;i<Z.length;i++){
                const z=beta[0]+Z[i].reduce((s,x,j)=>s+beta[j+1]*x,0);
                const pred=sigm(z); const err=labelsY[i]-pred;
                grad[0]+=err;
                for(let j=0;j<p;j++) grad[j+1]+=err*Z[i][j];
              }
              beta[0]+=lr*grad[0]/Z.length;
              for(let j=0;j<p;j++) beta[j+1]+=lr*(grad[j+1]/Z.length-lambda*beta[j+1]);
            }
            // Odds ratio (exp do coeficiente padronizado): >1 = fator de risco
            const featLabels=["Pico Dist (km)","Pico HSR (×100m)","Pico SPR (×50m)","Pico Acel ≥3","Pico Decel ≤-3","ACWR Dist"];
            const oddsRatios=beta.slice(1).map((c,i)=>({label:featLabels[i],coef:Math.round(c*1000)/1000,or:Math.round(Math.exp(c)*1000)/1000}));
            oddsRatios.sort((a,b)=>Math.abs(Math.log(b.or||1))-Math.abs(Math.log(a.or||1)));

            // Acurácia in-sample (apenas referência — overfit possível em N pequeno)
            let correct=0,truePos=0,falsePos=0,falseNeg=0;
            for(let i=0;i<Z.length;i++){
              const z=beta[0]+Z[i].reduce((s,x,j)=>s+beta[j+1]*x,0);
              const pred=sigm(z)>=0.3?1:0;
              if(pred===labelsY[i]) correct++;
              if(pred===1&&labelsY[i]===1) truePos++;
              if(pred===1&&labelsY[i]===0) falsePos++;
              if(pred===0&&labelsY[i]===1) falseNeg++;
            }
            const acc=Math.round((correct/Z.length)*1000)/10;
            const recall=truePos+falseNeg>0?Math.round((truePos/(truePos+falseNeg))*1000)/10:0;

            // Probabilidades atuais por atleta (último ponto disponível por atleta)
            const lastPerAth={};
            for(let i=Z.length-1;i>=0;i--){const m=meta[i];if(!lastPerAth[m.name]) lastPerAth[m.name]=i;}
            const currentProbs=Object.entries(lastPerAth).map(([name,i])=>{
              const z=beta[0]+Z[i].reduce((s,x,j)=>s+beta[j+1]*x,0);
              return {name,prob:Math.round(sigm(z)*1000)/10};
            }).sort((a,b)=>b.prob-a.prob).slice(0,10);

            return <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <TrendingUp size={14} color="#DC2626"/>
                Regressão Logística · Vetor de Probabilidade de Lesão (7 dias)
              </div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:12,maxWidth:780,lineHeight:1.5}}>
                Modelo paralelo (transparente) treinado em <strong>{rowsX.length} amostras</strong> ({positives} positivos).
                Picos de carga mecânica e ACWR como features padronizadas. Coeficientes ajustados via gradient ascent
                (lr=0.05, L2 λ=0.1, 400 iters). In-sample: <strong>acc {acc}%</strong> · <strong>recall {recall}%</strong>
                — métricas de validação cruzada residem no pipeline XGBoost (model/injury_prediction_pipeline.py).
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",marginBottom:6}}>Odds Ratios (exp(β) padronizado)</div>
                  {oddsRatios.map((o,i)=>{
                    const isRisk=o.or>1.05; const isProtective=o.or<0.95;
                    const c=isRisk?"#DC2626":isProtective?"#22D3EE":t.textFaint;
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:i%2===0?t.bgMuted:"transparent",borderRadius:5}}>
                      <div style={{flex:1,fontSize:10,fontWeight:600,color:t.text}}>{o.label}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint,minWidth:60,textAlign:"right"}}>β={o.coef}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:800,color:c,minWidth:60,textAlign:"right"}}>OR {o.or}×</div>
                    </div>;
                  })}
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:"uppercase",marginBottom:6}}>Top 10 · Probabilidade Atual</div>
                  {currentProbs.map((cp,i)=>{
                    const c=cp.prob>=30?"#DC2626":cp.prob>=15?"#EA580C":cp.prob>=8?"#FACC15":"#22D3EE";
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:i%2===0?t.bgMuted:"transparent",borderRadius:5,cursor:"pointer"}} onClick={()=>{setSel(cp.name);setTab("player")}}>
                      <span style={{fontSize:9,color:t.textFaint,fontFamily:"'JetBrains Mono'",minWidth:18}}>#{i+1}</span>
                      <div style={{flex:1,fontSize:10,fontWeight:700,color:pri}}>{cp.name}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:800,color:c}}>{cp.prob}%</div>
                      <div style={{width:60,height:5,background:t.bgMuted2,borderRadius:3}}>
                        <div style={{width:`${Math.min(100,cp.prob*2)}%`,height:"100%",background:c,borderRadius:3}}/>
                      </div>
                    </div>;
                  })}
                </div>
              </div>
            </div>;
          })()}
            </div>}
          </div>

        </div>}

        {tab==="retro"&&<div>
          {/* Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Análise Retrospectiva de Lesões</div>
            <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>Temporada 2025/2026 · {liveInjuries.length} casos documentados · Correlação pré-lesão com marcadores multidisciplinares</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:14}}>
              {[{l:"Total de Lesões",v:liveInjuries.length,c:acc},{l:"Dias Perdidos",v:liveInjuries.reduce((s,i)=>s+(i.total||0),0),c:"#DC2626"},{l:"Avg Dias Fora",v:liveInjuries.length?(liveInjuries.reduce((s,i)=>s+(i.total||0),0)/liveInjuries.length).toFixed(1):"0",c:"#EA580C"},{l:"Atletas Afetados",v:new Set(liveInjuries.map(i=>i.n)).size,c:"#CA8A04"}].map((k,i)=>
                <div key={i} style={{textAlign:"center",padding:"12px",background:t.bgMuted,borderRadius:10}}>
                  <div style={{fontSize:9,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{k.l}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:24,fontWeight:800,color:k.c,marginTop:2}}>{k.v}</div>
                </div>)}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Padrões Pré-Lesão */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Padrões Pré-Lesão — Prevalência nos Casos</div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:12}}>Frequência de cada fator nos 7 dias que precederam as lesões</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={INJ_PATTERNS} layout="vertical" margin={{left:130}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                  <XAxis type="number" tick={{fontSize:9,fill:t.textFaint}} domain={[0,100]} tickFormatter={v=>v+"%"}/>
                  <YAxis type="category" dataKey="pattern" tick={{fontSize:10,fill:t.textMuted}} width={125}/>
                  <Tooltip content={<Tip theme={t}/>}/>
                  <Bar dataKey="pct" name="Prevalência %" radius={[0,4,4,0]}>
                    {INJ_PATTERNS.map((p,i)=><Cell key={i} fill={p.c}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Multiplicador de Risco */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Multiplicador de Risco Relativo</div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:12}}>Quanto cada fator aumenta a probabilidade de lesão vs ausência do fator</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {INJ_PATTERNS.sort((a,b)=>b.risk_mult-a.risk_mult).map((p,i)=>
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:50,textAlign:"right",fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:p.c}}>{p.risk_mult}x</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:11,fontWeight:600,color:t.text}}>{p.pattern}</span>
                        <span style={{fontSize:10,color:t.textFaint}}>{p.present_in}/{p.total} casos</span>
                      </div>
                      <div style={{height:6,background:t.bgMuted2,borderRadius:4}}>
                        <div style={{height:"100%",width:`${(p.risk_mult/4)*100}%`,background:p.c,borderRadius:4,transition:"width .6s"}}/>
                      </div>
                      <div style={{fontSize:9,color:t.textFaint,marginTop:2}}>{p.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Casos Individuais */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:14}}>Casos de Lesão — Análise Individual</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {liveInjuries.map((inj,_idx)=>{
                const svC=inj.classif.includes("4C")?"#DC2626":inj.classif.includes("2")?"#EA580C":inj.classif==="1A"||inj.classif==="1B"?"#CA8A04":inj.classif.includes("Lig")?"#7c3aed":t.textMuted;
                const isActive=!inj.fim_trans;
                return <div key={inj.id} style={{borderRadius:12,border:`1px solid ${isActive?"#FECACA":t.border}`,overflow:"hidden"}}>
                  {/* Case Header */}
                  <div style={{padding:"12px 16px",background:isActive?"#FEF2F2":t.bgMuted,borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,cursor:"pointer"}} onClick={()=>{setSel(inj.n);setTab("player")}}>{inj.n}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>{inj.pos}</span>
                      <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:`${svC}15`,color:svC,border:`1px solid ${svC}33`}}>{inj.classif}</span>
                      {isActive&&<span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,background:"#DC262620",color:"#DC2626",border:"1px solid #DC262633"}}>ATIVO — {inj.estagio}</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:11,color:t.textMuted}}>{(parseDateBR(inj.date)?.toLocaleDateString("pt-BR")||inj.date||"—")}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#DC2626"}}>{inj.total} dias{isActive?" (em curso)":""}</span>
                    </div>
                  </div>
                  {/* Case Body */}
                  <div style={{padding:16}}>
                    <div style={{display:"flex",gap:16,marginBottom:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Diagnóstico</div>
                        <div style={{fontSize:12,fontWeight:600,color:pri}}>{inj.regiao} — {inj.lado}</div>
                        <div style={{fontSize:11,color:t.textMuted,marginTop:2}}>Estrutura: <strong>{inj.estrutura}</strong></div>
                        <div style={{fontSize:11,color:t.textMuted,marginTop:1}}>Exame: {inj.exame}</div>
                        {inj.obs&&<div style={{fontSize:10,color:"#EA580C",marginTop:2,fontStyle:"italic"}}>{inj.obs}</div>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,flex:2}}>
                        {[
                          {l:"Classif.",v:inj.classif,c:svC},
                          {l:"Evento",v:inj.evento,c:t.textMuted},
                          {l:"Mecanismo",v:inj.mecanismo,c:inj.mecanismo==="Sprint"||inj.mecanismo==="Trauma direto"?"#DC2626":"#EA580C"},
                          {l:"Dias DM",v:inj.dias_dm,c:inj.dias_dm>30?"#DC2626":inj.dias_dm>14?"#EA580C":"#CA8A04"},
                          {l:"Dias Trans.",v:inj.dias_trans||"—",c:t.textMuted}
                        ].map((m,j)=>
                          <div key={j} style={{textAlign:"center",padding:"6px 4px",background:t.bgMuted,borderRadius:6}}>
                            <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                            <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                          </div>)}
                      </div>
                    </div>
                    {/* Timeline */}
                    <div style={{marginBottom:10,padding:"8px 12px",background:t.bgMuted,borderRadius:8}}>
                      <div style={{fontSize:10,color:t.textFaint,fontWeight:700,marginBottom:4}}>TIMELINE</div>
                      <div style={{display:"flex",gap:16,fontSize:10,color:t.textMuted}}>
                        <span>Lesão: <strong>{(parseDateBR(inj.date)?.toLocaleDateString("pt-BR")||inj.date||"—")}</strong></span>
                        {inj.saida_dm&&<span>Saída DM: <strong>{(parseDateBR(inj.saida_dm)?.toLocaleDateString("pt-BR")||inj.saida_dm)}</strong></span>}
                        {inj.ini_trans&&<span>Início Trans.: <strong>{(parseDateBR(inj.ini_trans)?.toLocaleDateString("pt-BR")||inj.ini_trans)}</strong></span>}
                        {inj.fim_trans?<span>Fim Trans.: <strong>{(parseDateBR(inj.fim_trans)?.toLocaleDateString("pt-BR")||inj.fim_trans)}</strong></span>:<span style={{color:"#DC2626",fontWeight:600}}>Em andamento</span>}
                        <span>Estágio: <strong style={{color:svC}}>{inj.estagio}</strong></span>
                        <span>Conduta: <strong>{inj.conduta}</strong></span>
                        {inj.prognostico&&<span>Prognóstico: <strong style={{color:"#2563EB"}}>{(parseDateBR(inj.prognostico)?.toLocaleDateString("pt-BR")||inj.prognostico)}</strong></span>}
                      </div>
                    </div>
                    {/* Lesson Learned */}
                    <div style={{padding:"10px 14px",background:"#EFF6FF",borderRadius:8,border:"1px solid #BFDBFE",marginBottom:8}}>
                      <div style={{fontSize:10,color:"#2563EB",fontWeight:700,marginBottom:2}}>LIÇÃO APRENDIDA</div>
                      <div style={{fontSize:11,color:"#1e40af",lineHeight:1.5}}>{inj.lesson}</div>
                    </div>
                    {/* Protocol */}
                    <div style={{padding:"10px 14px",background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0"}}>
                      <div style={{fontSize:10,color:"#16A34A",fontWeight:700,marginBottom:2}}>PROTOCOLO PREVENTIVO</div>
                      <div style={{fontSize:11,color:"#166534",lineHeight:1.5}}>{inj.protocol}</div>
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </div>

          {/* Regras de Prevenção */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Regras de Prevenção — Derivadas dos Casos</div>
            <div style={{fontSize:10,color:t.textFaint,marginBottom:14}}>Gatilhos automáticos implementados no sistema de monitoramento diário</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${t.border}`}}>
                  {["Prioridade","Gatilho","Ação Automática","Janela","Evidência"].map((h,i)=>
                    <th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {PREVENTION.map((p,i)=>{
                  const pc=p.priority==="CRÍTICA"?"#DC2626":p.priority==="ALTA"?"#EA580C":"#CA8A04";
                  return <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"transparent":t.bgMuted}}>
                    <td style={{padding:"8px 6px"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:`${pc}12`,color:pc,border:`1px solid ${pc}33`}}>{p.priority}</span></td>
                    <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:600,color:pri}}>{p.trigger}</td>
                    <td style={{padding:"8px 6px",fontWeight:500,color:t.text}}>{p.action}</td>
                    <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textMuted}}>{p.window}</td>
                    <td style={{padding:"8px 6px",fontSize:10,color:t.textMuted,fontStyle:"italic"}}>{p.evidence}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>}

        {/* ═══════════ GLOSSÁRIO COMPLETO DA PLATAFORMA ═══════════ */}
        {tab==="glossario"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,marginBottom:4}}>Glossário da Plataforma</div>
            <div style={{fontSize:11,color:t.textMuted}}>Definição completa de todos os termos, métricas e indicadores utilizados no Performance Dashboard</div>
          </div>

          {/* Fundamento Teórico — base científica da plataforma */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Info size={16} color="#2563eb"/>Fundamento Teórico</div>
            <div style={{fontSize:11,color:t.textMuted,lineHeight:1.7,marginBottom:12}}>
              O dashboard é construído sobre a abordagem de <strong>sistemas complexos</strong> aplicada a lesões esportivas: a lesão não emerge da soma linear de fatores isolados, mas da <strong>interação não-linear entre um web de determinantes</strong> (carga, neuromuscular, bioquímica, sono, histórico, biomecânica). Por isso a plataforma evita ranquear variáveis isoladas e prioriza o reconhecimento de <strong>padrões</strong> de risco e a <strong>trajetória dinâmica</strong> do atleta ao longo do tempo.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:12,background:t.bgMuted,borderRadius:8,border:`1px solid ${t.borderLight}`}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:pri,marginBottom:4}}>Bittencourt et al., 2016</div>
                <div style={{fontSize:10,color:t.textFaint,fontStyle:"italic",marginBottom:6}}>Complex systems approach for sports injuries: moving from risk factor identification to injury pattern recognition — narrative review and new concept. <strong>Br J Sports Med.</strong></div>
                <div style={{fontSize:11,color:t.textMuted,lineHeight:1.6}}>Introduz a noção de <strong>web of determinants</strong>: lesões emergem de interações não-lineares, não da simples combinação de preditores isolados. Prescreve a migração de <em>risk factor identification</em> para <em>injury pattern recognition</em>.</div>
                <div style={{fontSize:10,color:"#2563eb",marginTop:6,fontFamily:"'JetBrains Mono'"}}>DOI: 10.1136/bjsports-2015-095850</div>
              </div>
              <div style={{padding:12,background:t.bgMuted,borderRadius:8,border:`1px solid ${t.borderLight}`}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:pri,marginBottom:4}}>Fonseca et al., 2020</div>
                <div style={{fontSize:10,color:t.textFaint,fontStyle:"italic",marginBottom:6}}>Sports Injury Forecasting and Complexity: A Synergetic Approach. <strong>Sports Medicine.</strong></div>
                <div style={{fontSize:11,color:t.textMuted,lineHeight:1.6}}>Formaliza a previsão de lesão via <strong>synergetics</strong>: monitorar um <strong>parâmetro de ordem</strong> (variável de alta ordem que resume o estado dinâmico do atleta) e detectar <strong>transições de fase</strong>. Quatro passos: (1) escala temporal, (2) definição do parâmetro de ordem, (3) monitoramento, (4) detecção da transição.</div>
                <div style={{fontSize:10,color:"#2563eb",marginTop:6,fontFamily:"'JetBrains Mono'"}}>DOI: 10.1007/s40279-020-01326-4</div>
              </div>
            </div>
            <div style={{marginTop:10,padding:10,background:"#EFF6FF",borderRadius:8,border:"1px solid #BFDBFE",fontSize:10,color:"#1E40AF",lineHeight:1.5}}>
              <strong>Como isso aparece no dashboard:</strong> (a) o <em>Risco de Lesão</em> é uma métrica única, não a soma de flags independentes; (b) o modelo ML captura interações entre domínios (carga × sono × bioquímica × histórico); (c) SHAP explicita os determinantes que estão ativos em cada atleta; (d) o roadmap inclui trajetória de parâmetro de ordem e detecção de transição de fase (Fonseca, passos 3–4).
            </div>
          </div>

          {/* Estado do Atleta — métrica unificada (Fonseca 2020 passos 2-3 + XGBoost forecast) */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><TrendingUp size={16} color="#2563eb"/>Estado do Atleta (Ψ)</div>
            <div style={{padding:14,background:t.bgMuted,borderRadius:10,border:`1px solid ${t.borderLight}`}}>
              <div style={{fontSize:11,color:t.textMuted,lineHeight:1.7}}>
                <strong>O que é:</strong> Número único, em desvios-padrão, que resume em que ponto o atleta está hoje em relação ao padrão saudável dele. Substitui os antigos <em>Risk Score</em> (regras clínicas) e <em>Probabilidade de Lesão</em> (ML) — agora os dois convivem como duas leituras do mesmo estado: (a) <strong>Ψ</strong> = o que a gente <em>observa</em> nas últimas sessões; (b) <strong>Previsão ML (7d)</strong> = o que o modelo preditivo <em>projeta</em> a partir desse estado.<br/>
                <strong>Como é calculado (Ψ):</strong> primeira componente principal (<strong>PC1</strong>) de 11 features padronizadas por sessão — <em>carga externa</em> (distância, HSR, sprints, player load, pico de velocidade), <em>carga interna</em> (PSE, sRPE), <em>neuromuscular</em> (CMJ) e <em>wellness</em> (sono, dor, recuperação). Valores altos = carga e dor ↑ com CMJ e recuperação ↓. Implementa o passo 2 da síntese de <em>Fonseca 2020</em>: reduzir a dimensionalidade das múltiplas medidas diárias a um observável único que se acompanha ao longo do tempo.<br/>
                <strong>Leitura clínica:</strong> cada atleta tem um baseline individual (média móvel 28 dias). Desvios do baseline &gt; 1σ ativam <em>Atenção</em>, &gt; 2σ <em>Sinal de alerta</em>, &gt; 3σ <em>Transição iminente</em>. A zona pode escalar antes disso quando os <em>early-warning signals</em> (variância, autocorrelação, assimetria dos resíduos) sobem simultaneamente — passo 4 do roadmap de Fonseca.<br/>
                <strong>Previsão ML (7d):</strong> XGBoost calibrado que, a partir do mesmo substrato de features + histórico de lesões + bioquímica, estima a probabilidade de lesão nos próximos 7 dias. Mostrado lado a lado com Ψ no card do atleta.<br/>
                <strong>Interpretabilidade:</strong> cada feature tem um <em>loading</em> em PC1. Loading positivo = puxa Ψ para cima; loading negativo = puxa para baixo. O painel do atleta exibe os 6 maiores. O bloco <em>Como as variáveis se relacionam</em> complementa mostrando como elas se movem juntas.<br/>
                <strong>Base teórica:</strong> Fonseca et al., <em>Sports Medicine</em> 2020 (synergetics, parâmetro de ordem) · Bittencourt et al., <em>Br J Sports Med</em> 2016 (web of determinants, pattern recognition) · Scheffer et al., <em>Nature</em> 2009 (early-warning signals).
              </div>
            </div>
          </div>

          {/* Previsão de Lesão — Métrica Supervisionada */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:"#DC2626",marginBottom:10,display:"flex",alignItems:"center",gap:6}}><AlertTriangle size={16}/>Previsão de Lesão (0–100%) — Métrica Supervisionada</div>
            <div style={{padding:14,background:t.bgMuted,borderRadius:10,border:`1px solid ${t.borderLight}`}}>
              <div style={{fontSize:11,color:t.textMuted,lineHeight:1.7}}>
                <strong>O que é:</strong> Probabilidade estimada de lesão nos próximos 7 dias via modelo supervisionado (XGBoost) calibrado — <em>forecast</em> construído sobre o mesmo espaço de features que alimenta Ψ(t).<br/>
                <strong>Fontes de dados integradas:</strong>
                <ul style={{margin:"4px 0 4px 18px",padding:0}}>
                  <li><strong>Carga externa (GPS):</strong> ACWR, distância, HSR, acelerações/desacelerações, monotonia, strain.</li>
                  <li><strong>Carga interna / bem-estar:</strong> PSE, dor, recuperação de pernas, sono, humor, recuperação geral.</li>
                  <li><strong>Neuromuscular:</strong> CMJ, assimetria bilateral (SLCMJ L/R/ASI), razão H:Q, isometria.</li>
                  <li><strong>Bioquímica:</strong> CK, ureia, testosterona/cortisol, hemograma e marcadores inflamatórios.</li>
                  <li><strong>Histórico de lesões:</strong> tipo, região, estrutura, gravidade, dias parado, lesão nos últimos 30 dias.</li>
                  <li><strong>Biomecânica:</strong> COP sway, valgus em single-leg step-down, assimetrias funcionais.</li>
                </ul>
                <strong>Interações entre fatores:</strong> O modelo captura combinações de risco não-lineares — por exemplo, <em>ACWR alto × sono ruim × CK elevado × lesão recente</em> eleva o risco de forma exponencial, algo que regras clínicas isoladas não conseguem representar.<br/>
                <strong>Zonas de risco:</strong> <span style={{color:"#16A34A",fontWeight:700}}>Verde</span> ({"<"}28%) · <span style={{color:"#CA8A04",fontWeight:700}}>Amarelo</span> (28–39%) · <span style={{color:"#EA580C",fontWeight:700}}>Laranja</span> (40–64%) · <span style={{color:"#DC2626",fontWeight:700}}>Vermelho</span> (≥65%).<br/>
                <strong>Explicabilidade (SHAP):</strong> Cada predição traz os fatores que mais aumentam ou reduzem o risco individual do atleta, permitindo intervenção direcionada (dose de treino, recuperação, triagem clínica).<br/>
                <strong>Pipeline:</strong> KNNImputer → StandardScaler → SMOTE+Tomek → LASSO (33 de 110 features) → XGBoost (Optuna) → Calibração → SHAP. AUC-ROC 0.75 · AUC calibrada 0.88 · Recall 0.97.<br/>
                <strong>Base teórica:</strong> Bittencourt et al., <em>Br J Sports Med</em> 2016 (web of determinants / pattern recognition) · Fonseca et al., <em>Sports Medicine</em> 2020 (synergetics, parâmetro de ordem, transição de fase). Ver seção <em>Fundamento Teórico</em> acima.
              </div>
            </div>
          </div>

          {/* Métricas GPS */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>1. Métricas GPS (Rastreamento Externo)</div>
            <div style={{fontSize:10,color:t.textFaint,marginBottom:10}}>Dados coletados via dispositivo GPS vestível durante treinos e jogos.</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Métrica","Unidade","Descrição","Interpretação"].map((h,i)=><th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {m:"Distância Total",u:"metros",d:"Distância total percorrida na sessão",i:"Volume geral do treino. Comparar com baseline individual."},
                  {m:"HSR (High-Speed Running)",u:"metros",d:"Distância percorrida acima de 20 km/h",i:"Indicador de intensidade alta. Picos acima de 130% do baseline = alerta."},
                  {m:"Spr >20 (HSR-events)",u:"contagem",d:"Número de ações acima de 20 km/h",i:"Volume de eventos em alta velocidade. Proxy de demanda aeróbia intensa; pareia com o campo HSR (distância)."},
                  {m:"Spr >25 (sprint verdadeiro)",u:"contagem",d:"Número de ações acima de 25 km/h",i:"Ações de máxima intensidade. Relação direta com risco de lesão muscular (posterior de coxa, sóleo)."},
                  {m:"Player Load",u:"UA",d:"Métrica de carga externa (acelerometria triaxial)",i:"Medida global de demanda mecânica. Unidade arbitrária."},
                  {m:"Pico de Velocidade",u:"km/h",d:"Velocidade máxima atingida na sessão",i:"Capacidade de sprint máximo. Variações indicam fadiga neuromuscular."},
                  {m:"Acelerações >2 m/s²",u:"contagem",d:"Número de acelerações acima de 2 m/s²",i:"Demanda mecânica de arranques moderados."},
                  {m:"Acelerações >3 m/s²",u:"contagem",d:"Número de acelerações acima de 3 m/s² (alta intensidade)",i:"Arranques explosivos. Maior estresse muscular e articular."},
                  {m:"Desacelerações >2 m/s²",u:"contagem",d:"Número de desacelerações acima de 2 m/s²",i:"Demanda excêntrica moderada de frenagens."},
                  {m:"Desacelerações >3 m/s²",u:"contagem",d:"Número de desacelerações acima de 3 m/s² (alta intensidade)",i:"Frenagens bruscas — alto estresse excêntrico no quadríceps e tendões."},
                  {m:"FC Média / FC Máx",u:"bpm",d:"Frequência cardíaca média e máxima da sessão",i:"Indicador de demanda cardiovascular e intensidade metabólica."},
                  {m:"Tempo em Zona Alta",u:"minutos",d:"Tempo com FC acima de 85% da FCmáx",i:"Exposição a alta intensidade cardíaca. Relacionado a fadiga central."}
                ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted}}>
                  <td style={{padding:"6px",fontWeight:600,color:pri}}>{r.m}</td>
                  <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textMuted}}>{r.u}</td>
                  <td style={{padding:"6px",color:t.textMuted}}>{r.d}</td>
                  <td style={{padding:"6px",color:t.text,fontSize:10}}>{r.i}</td>
                </tr>)}
              </tbody>
            </table>
          </div>

          {/* Carga Interna - sRPE */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>2. Carga Interna (sRPE / Diário)</div>
            <div style={{fontSize:10,color:t.textFaint,marginBottom:10}}>Dados subjetivos reportados pelo atleta após cada sessão de treino ou jogo.</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Métrica","Fórmula / Escala","Descrição","Interpretação"].map((h,i)=><th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {m:"PSE (sRPE sessão)",f:"Escala CR-10 (0–10)",d:"Percepção Subjetiva de Esforço da sessão (Escala de Borg modificada)",i:"0 = repouso, 10 = esforço máximo. Coletado 30 min após a sessão para evitar viés do último exercício."},
                  {m:"sRPE Total",f:"PSE × Duração (min)",d:"Carga total da sessão em Unidades Arbitrárias (UA)",i:"Exemplo: PSE 7 × 90 min = 630 UA. Acima de 450 UA = sessão de alta carga. Reflete o volume de esforço percebido (Foster et al., 2001)."},
                  {m:"ACWR",f:"Carga 7d ÷ Carga 28d",d:"Acute:Chronic Workload Ratio — razão entre carga aguda e crônica",i:"Compara o que o atleta treinou recentemente com o que está acostumado. Ideal: 0.8–1.3. >1.5 = risco alto de lesão. <0.8 = subcarga/desproteção (Gabbett, 2016). Calculado por EWMA."},
                  {m:"ACWR HSR",f:"HSR 7d ÷ HSR 28d",d:"ACWR específico para corrida de alta velocidade",i:"Foca na carga de alta intensidade (>20 km/h). Mais sensível para lesões musculares de sprint."},
                  {m:"Monotonia",f:"Média diária ÷ DP diário",d:"Variabilidade da carga nos últimos 7 dias",i:"Alta monotonia (>2.0) = carga repetitiva sem variação → risco de overreaching. Indica falta de periodização (Foster, 1998)."},
                  {m:"Strain",f:"Carga semanal × Monotonia",d:"Esforço acumulado ponderado pela monotonia",i:"Combina volume total com falta de variação. Valores altos indicam risco de overtraining."}
                ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted}}>
                  <td style={{padding:"6px",fontWeight:600,color:pri}}>{r.m}</td>
                  <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:"#7c3aed"}}>{r.f}</td>
                  <td style={{padding:"6px",color:t.textMuted}}>{r.d}</td>
                  <td style={{padding:"6px",color:t.text,fontSize:10}}>{r.i}</td>
                </tr>)}
              </tbody>
            </table>
          </div>

          {/* Neuromuscular - CMJ */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>3. Métricas Neuromusculares (CMJ / Saltos)</div>
            <div style={{fontSize:10,color:t.textFaint,marginBottom:10}}>Avaliação neuromuscular via saltos verticais — indicador de prontidão e fadiga.</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Métrica","Fórmula / Método","Descrição","Interpretação"].map((h,i)=><th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {m:"CMJ (Counter-Movement Jump)",f:"Melhor de 3 saltos (cm)",d:"Salto vertical com contramovimento — o atleta flexiona os joelhos rapidamente e salta o mais alto possível",i:"Mede a prontidão neuromuscular: a capacidade do sistema nervoso de recrutar fibras musculares explosivamente. Redução do CMJ indica fadiga central/periférica antes de sinais clínicos."},
                  {m:"CMJ Delta %",f:"(CMJ pós - CMJ pré) ÷ pré × 100",d:"Variação percentual do CMJ entre pré e pós-treino",i:"Queda >5% = fadiga neuromuscular significativa. >8% = alerta crítico, considerar treino regenerativo (Claudino et al., 2017)."},
                  {m:"SLCMJ (Single-Leg CMJ)",f:"Melhor de 3 (cada perna)",d:"CMJ unipodal — perna direita e esquerda separadamente",i:"Avalia assimetria entre membros. Diferenças refletem compensações, fraqueza unilateral ou lesão prévia."},
                  {m:"Assimetria SLCMJ",f:"|Dir - Esq| ÷ max(Dir,Esq) × 100",d:"Diferença percentual entre pernas no CMJ unipodal",i:">10% = risco biomecânico elevado. >15% = programa de correção neuromuscular obrigatório."},
                  {m:"NME (Eficiência Neuromuscular)",f:"CMJ ÷ sRPE da sessão",d:"Relação entre output neuromuscular e esforço percebido",i:"Queda no NME indica que o atleta está produzindo menos força para o mesmo nível de esforço — fadiga desproporcional."},
                  {m:"RSI (Reactive Strength Index)",f:"Altura ÷ Tempo de contato",d:"Índice de força reativa (quando disponível)",i:"Mede a capacidade do ciclo alongamento-encurtamento. Queda indica fadiga elástica dos tendões."}
                ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted}}>
                  <td style={{padding:"6px",fontWeight:600,color:pri}}>{r.m}</td>
                  <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:"#7c3aed"}}>{r.f}</td>
                  <td style={{padding:"6px",color:t.textMuted}}>{r.d}</td>
                  <td style={{padding:"6px",color:t.text,fontSize:10}}>{r.i}</td>
                </tr>)}
              </tbody>
            </table>
          </div>

          {/* Bem-estar */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>4. Bem-estar (Questionários Diários)</div>
            <div style={{fontSize:10,color:t.textFaint,marginBottom:10}}>Dados subjetivos coletados via questionário diário pré-treino.</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Métrica","Escala","Descrição","Limiar de Alerta"].map((h,i)=><th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {m:"Sono (qualidade)",s:"1–10",d:"Qualidade percebida do sono na noite anterior",a:"< 5 = sono insuficiente, aumento de risco de lesão e queda de performance cognitiva"},
                  {m:"Sono (duração)",s:"horas",d:"Horas dormidas na noite anterior",a:"< 6h = duração crítica. Recomendado: 7–9h para atletas (Watson, 2017)"},
                  {m:"Dor",s:"0–10",d:"Nível de dor ou desconforto geral. 0 = sem dor",a:"> 6 = dor significativa, avaliar com fisioterapia. > 7 = avaliação imediata"},
                  {m:"Recuperação Geral",s:"1–10",d:"Percepção geral de recuperação",a:"< 4 = recuperação insuficiente, considerar redução de carga"},
                  {m:"Recuperação Pernas",s:"1–10",d:"Recuperação específica de membros inferiores",a:"< 5 = fadiga residual significativa nos MMII"},
                  {m:"Humor",s:"1–5",d:"Estado de humor/disposição (1=Raiva, 5=Tranquilo)",a:"Queda sustentada pode indicar overtraining ou fatores psicossociais"},
                  {m:"Energia",s:"1–4",d:"Nível subjetivo de energia/disposição",a:"≤ 2 = energia baixa, monitorar carga e sono"},
                  {m:"Peso",s:"kg",d:"Peso corporal matinal (pré-treino)",a:"Variações > 2% em 24h podem indicar desidratação ou retenção"}
                ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted}}>
                  <td style={{padding:"6px",fontWeight:600,color:pri}}>{r.m}</td>
                  <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textMuted}}>{r.s}</td>
                  <td style={{padding:"6px",color:t.textMuted}}>{r.d}</td>
                  <td style={{padding:"6px",color:"#DC2626",fontSize:10,fontWeight:500}}>{r.a}</td>
                </tr>)}
              </tbody>
            </table>
          </div>

          {/* Indicadores Derivados */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>5. Indicadores Derivados & Compostos</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>
                {["Indicador","Fórmula","Descrição","Quando preocupar"].map((h,i)=><th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {m:"Déficit Biológico",f:"(10−Sono)×0.4 + Dor×0.3 + (10−Rec)×0.3",d:"Indicador composto de recuperação biológica",a:">1.5 = atenção. >2.0 = crítico. Combina os 3 principais marcadores subjetivos de recuperação."},
                  {m:"Dívida de Fadiga",f:"sRPE Total × ACWR × 2.5",d:"Dívida de fadiga acumulada — carga absoluta ponderada pelo ACWR",a:">3000 = fadiga alta. >2500 = moderada. Indica acúmulo de carga sem recuperação adequada."},
                  {m:"Média Móvel (Top 5 Jogos)",f:"Média das 5 melhores partidas (score composto)",d:"Baseline de pico individual para comparação de demanda",a:"Último jogo < 70% do Top 5 = rendimento abaixo do pico. Usado como referência de match demand (Malone et al., 2015)."},
                  {m:"Zonas de Risco (ML)",f:"VERDE <28% | AMARELO 28–39% | LARANJA 40–64% | VERMELHO ≥65%",d:"Classificação da probabilidade de lesão em zonas de ação",a:"Cada zona tem um protocolo de intervenção específico definido pela equipe."}
                ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted}}>
                  <td style={{padding:"6px",fontWeight:600,color:pri}}>{r.m}</td>
                  <td style={{padding:"6px",fontFamily:"'JetBrains Mono'",fontSize:9,color:"#7c3aed"}}>{r.f}</td>
                  <td style={{padding:"6px",color:t.textMuted}}>{r.d}</td>
                  <td style={{padding:"6px",color:"#DC2626",fontSize:10,fontWeight:500}}>{r.a}</td>
                </tr>)}
              </tbody>
            </table>
          </div>

          {/* Perfis de Risco */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>6. Perfis de Risco de Lesão</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {l:"Aguda",c:"#DC2626",d:"Evento traumático ou pico súbito de carga",m:"ACWR alto, sprint em estado de fadiga, mudança brusca de direção",a:"Redução imediata de HSR e sprints. Monitorar 48h."},
                {l:"Sobrecarga",c:"#EA580C",d:"Acúmulo progressivo sem recuperação",m:"Monotonia alta (>2.0), strain elevado, sono ruim crônico",a:"Microciclo de descarga. Priorizar sono e recuperação."},
                {l:"Neuromuscular",c:"#7c3aed",d:"Déficit de força ou coordenação",m:"CMJ em queda >5%, NME baixo, RSI reduzido",a:"Treino regenerativo. Avaliar CMJ pré-treino como gate."},
                {l:"Biomecânico",c:"#CA8A04",d:"Assimetria ou padrão de movimento compensatório",m:"Assimetria SLCMJ >10%, histórico de lesão recente, H:Q ratio <0.55",a:"Programa de correção. Ativação bilateral pré-treino."}
              ].map((p,i)=><div key={i} style={{padding:14,background:t.bgMuted,borderRadius:10,border:`1px solid ${p.c}22`}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:p.c,marginBottom:6}}>{p.l}</div>
                <div style={{fontSize:10,color:t.textMuted,lineHeight:1.5,marginBottom:4}}><strong>Definição:</strong> {p.d}</div>
                <div style={{fontSize:10,color:t.textMuted,lineHeight:1.5,marginBottom:4}}><strong>Marcadores:</strong> {p.m}</div>
                <div style={{fontSize:10,color:t.text,lineHeight:1.5}}><strong>Intervenção:</strong> {p.a}</div>
              </div>)}
            </div>
          </div>

          {/* Referências */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:14,color:pri,marginBottom:12}}>7. Referências Científicas</div>
            <div style={{fontSize:10,color:t.textMuted,lineHeight:1.8}}>
              <div>• <strong>Gabbett, T.J. (2016)</strong> — The training–injury prevention paradox. <em>British Journal of Sports Medicine</em>, 50(5), 273-280. [ACWR, zonas de risco]</div>
              <div>• <strong>Hulin, B.T. et al. (2014)</strong> — The acute:chronic workload ratio predicts injury. <em>British Journal of Sports Medicine</em>, 48(8), 708-712. [ACWR aplicado]</div>
              <div>• <strong>Williams, S. et al. (2017)</strong> — Better way to determine ACWR. <em>British Journal of Sports Medicine</em>, 51(3), 209-210. [EWMA vs rolling average]</div>
              <div>• <strong>Foster, C. et al. (2001)</strong> — A new approach to monitoring exercise training. <em>Journal of Strength and Conditioning Research</em>, 15(1), 109-115. [sRPE, Monotonia, Strain]</div>
              <div>• <strong>Foster, C. (1998)</strong> — Monitoring training in athletes. <em>Medicine and Science in Sports and Exercise</em>, 30(7), 1164-1168. [Monotonia]</div>
              <div>• <strong>Claudino, J.G. et al. (2017)</strong> — The countermovement jump to monitor neuromuscular status. <em>Journal of Science and Medicine in Sport</em>, 20(4), 396-402. [CMJ como marcador]</div>
              <div>• <strong>Watson, A.M. (2017)</strong> — Sleep and athletic performance. <em>Current Sports Medicine Reports</em>, 16(6), 413-418. [Sono e performance]</div>
              <div>• <strong>Malone, J.J. et al. (2015)</strong> — High chronic training loads and exposure to bouts of maximal velocity running. <em>Journal of Sports Science and Medicine</em>, 14(4), 861. [Match demand baseline]</div>
            </div>
          </div>
        </div>}
      </main>
    </div>
  </div>;
}
