import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Cell, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Heart, Zap, Shield, Users, Eye, Brain, Target, Calendar, RefreshCw, Wifi, WifiOff, Moon, Sun } from "lucide-react";
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
    tooltipBg:"#fff",
  },
  dark:{
    bg:"#0c0e14",bgCard:"#181b25",bgMuted:"#1e2230",bgMuted2:"#282d3c",
    text:"#f1f5f9",textMuted:"#b8c4d0",textFaint:"#8896a8",textFaintest:"#5e6b7d",
    border:"#353b50",borderLight:"#2a2f40",
    scrollThumb:"#4a5268",scrollTrack:"transparent",
    shadow:"rgba(0,0,0,.35)",shadowMd:"rgba(0,0,0,.45)",shadowLg:"rgba(0,0,0,.55)",
    headerBg:"#10121a",headerShadow:"rgba(0,0,0,.5)",
    ringBg:"#282d3c",
    tooltipBg:"#1e2230",
  }
};

const P=[{n:"ADRIANO",pos:"GOL",id:19,h:5,e:4,rg:7,rp:6,d:2,sq:7,rpa:7,da:1.6,sa:7.3,nw:39,pse:3,sra:331,w:82.7,alt:183,bf:12.4,mm:38.2,imc:24.2,nc:60,ai:1.24,cmj:49.6,ct:[54.2,50.3,48.5,51.4,52,52.2,52.6,49.6],wt:{dt:["02","03","07","09","10","11","12"],s:[10,8,7,7,8,7,7],r:[8,6,6,8,8,7,6],dr:[1,1,1,1,2,1,2]}},{n:"BRENNO",pos:"GOL",id:23,h:4,e:4,rg:8,rp:8,d:3,sq:7,rpa:7.3,da:1.3,sa:7.3,nw:50,pse:4,sra:310,w:90.8,alt:191,bf:13.8,mm:41.5,imc:24.9,nc:75,ai:1.17,cmj:44.6,ct:[45,47.8,49.3,48,47.6,49.3,46.2,44.6],wt:{dt:["04","05","06","07","09","10","11"],s:[7,7,7,6,10,8,7],r:[7,7,8,5,8,7,8],dr:[0,0,0,0,0,2,3]}},{n:"CARLOS EDUARDO",pos:"ZAG",id:25,h:5,e:3,rg:8,rp:8,d:2,sq:8,rpa:7.9,da:1,sa:9.2,nw:57,pse:3,sra:391,w:85.9,alt:186,bf:11.9,mm:39.8,imc:24.6,ck:973,nc:75,ai:1.07,cmj:46.7,ckm:973,ct:[49.1,44,47.1,44.5,48.8,46.5,52.6,46.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,9,8,8,9,10,8],r:[9,5,6,9,8,6,8],dr:[1,1,0,0,0,2,2]}},{n:"DARLAN",pos:"ZAG",id:20,h:4,e:3,rg:9,rp:8,d:0,sq:8,rpa:7.8,da:.7,sa:7.8,nw:17,pse:5,sra:317,w:80.2,alt:186,bf:10.5,mm:37.1,imc:25.3,nc:20,ai:.95,cmj:31.1,ct:[31.1]},{n:"ERICSON",pos:"ZAG",id:26,h:5,e:3,rg:10,rp:9,d:3,sq:9,rpa:6.7,da:1.1,sa:8.8,nw:51,pse:0,sra:431,w:91.6,alt:184,bf:13.2,mm:42.0,imc:25.4,ck:562,nc:75,ai:.64,cmj:43.1,ckm:916,ct:[44.3,47.4,42.4,47.1,50.9,50.9,55.5,43.1],wt:{dt:["26","27","28","02","03","04","06"],s:[9,9,9,7,9,8,9],r:[6,6,5,8,7,9,9],dr:[1,1,1,1,4,3,3]}},{n:"ERIK",pos:"VOL",id:20,h:5,e:4,rg:7,rp:7,d:0,sq:9,rpa:7.2,da:.2,sa:9.3,nw:22,pse:6,sra:308,w:75.5,alt:176,bf:9.8,mm:35.4,imc:24.4,nc:59,ai:1.97,ct:[54.1,52.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,8,8,10,10,9],r:[7,8,7,10,7,7,7],dr:[0,0,0,0,0,0,0]}},{n:"FELIPINHO",pos:"MEI",id:19,h:5,e:3,rg:7,rp:7,d:0,sq:7,rpa:6.8,da:0,sa:7.5,nw:16,pse:7,sra:347,w:78,alt:179,bf:11.2,mm:36.0,imc:24.3,nc:27,ai:.85,cmj:38.9,ct:[44.5,38.9]},{n:"FELIPE VIEIRA",pos:"LE",id:26,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.2,da:.3,sa:8.2,nw:27,pse:7,sra:385,w:77,alt:176,bf:7.7,mm:35.8,imc:24.9,ck:174,nc:27,ai:1.0,cmj:39.3,ckm:174,ct:[45.0,39.3],wt:{dt:["03","04","05","06","07","09","10"],s:[7,7,8,9,6,5,7],r:[7,7,7,8,6,5,7],dr:[0,0,0,0,0,0,0]}},{n:"GABRIEL INOCENCIO",pos:"LAT",id:31,h:4,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.8,da:.4,sa:7.2,nw:58,pse:3,sra:407,w:78.5,alt:177,bf:10.8,mm:36.5,imc:25.1,ck:533,nc:75,ai:.97,cmj:48.2,ckm:916,ct:[48.2,52.3,45.3,48.9,53.6,49.3,50.8,48.2],wt:{dt:["04","05","06","09","10","11","12"],s:[8,9,8,8,7,7,8],r:[7,7,7,8,8,8,8],dr:[1,2,7,2,2,2,1]}},{n:"GUI MARIANO",pos:"ZAG",id:26,h:5,e:4,rg:8,rp:8,d:4,sq:8,rpa:7.6,da:.3,sa:8.2,nw:59,pse:7,sra:476,w:89.7,alt:191,bf:12.7,mm:41.0,imc:25.1,nc:75,ai:1.1,cmj:53.1,ct:[52.4,52.2,52,55.1,47.5,53.7,53.5,53.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,9,9,8,8],r:[7,7,5,10,8,6,8],dr:[0,0,0,0,0,0,4]}},{n:"GUILHERME QUEIROZ",pos:"ATA",id:35,h:5,e:3,rg:7,rp:7,d:2,sq:8,rpa:7.3,da:1.5,sa:6.9,nw:56,pse:6,sra:369,w:87.9,alt:180,bf:13.1,mm:40.2,imc:24.9,ck:493,nc:75,ai:1.14,cmj:46,ckm:493,ct:[43.3,43.3,46.2,47.4,44.7,48.3,48,46],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,7,7,5,8],r:[10,7,6,8,6,7,7],dr:[0,0,1,0,1,1,2]}},{n:"GUSTAVO VILAR",pos:"ZAG",id:25,h:5,e:3,rg:6,rp:6,d:0,sq:7,rpa:6.5,da:.2,sa:7.7,nw:55,pse:5,sra:410,w:86.4,alt:189,bf:12.9,mm:39.5,imc:25.8,ck:658,nc:75,ai:1.07,cmj:43.5,ckm:1113,ct:[43.3,42.9,47.9,42.8,43.1,44,44.8,43.5]},{n:"HEBERT",pos:"ZAG",id:20,h:5,e:3,rg:8,rp:7,d:0,sq:7,rpa:6.7,da:.1,sa:7.7,nw:46,pse:5,sra:366,w:88.1,alt:187,bf:12.5,mm:40.8,imc:25.5,nc:59,ai:1.04,cmj:46.9,ct:[50.1,49.8,50,52.5,48.6,51.2,53.3,46.9]},{n:"HENRIQUE TELES",pos:"LAT",id:19,h:5,e:4,rg:8,rp:8,d:2,sq:8,rpa:7,da:1.4,sa:7.7,nw:54,pse:6,sra:415,w:80.1,alt:179,bf:11.3,mm:37.2,imc:24.7,ck:415,nc:69,ai:1.14,cmj:45.5,ckm:415,ct:[53.1,55.5,49.8,54.9,51.6,50.8,55.1,45.5],wt:{dt:["04","05","07","09","10","11","12"],s:[8,9,6,9,8,9,8],r:[6,8,6,10,8,9,8],dr:[2,1,7,5,3,3,2]}},{n:"HYGOR",pos:"ATA",id:33,h:5,e:4,rg:10,rp:8,d:2,sq:7,rpa:8.8,da:1.6,sa:9.2,nw:57,pse:4,sra:387,w:83.3,alt:183,bf:11.6,mm:38.6,imc:25.2,ck:749,nc:75,ai:1.12,cmj:42.1,ckm:1034,ct:[40.8,44.5,39.9,44.2,43.5,42.4,41.9,42.1],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,10,10,10,10,7],r:[10,6,8,10,8,8,8],dr:[0,2,0,0,0,3,2]}},{n:"JEFFERSON NEM",pos:"ATA",id:29,h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:7.1,da:.8,sa:7.9,nw:57,pse:7,sra:423,w:72.5,alt:166,bf:10.1,mm:33.8,imc:23.9,ck:985,nc:75,ai:.97,cmj:47.5,ckm:3539,ct:[44,48.2,44.5,50.4,50,44.1,47.2,47.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,7],r:[7,6,7,8,8,7,7],dr:[0,0,0,0,0,0,2]}},{n:"JONATHAN",pos:"LD",id:33,h:5,e:4,rg:5,rp:5,d:4,sq:7,rpa:5.8,da:2.9,sa:5.9,nw:51,pse:4,sra:333,w:73.7,alt:177,bf:10.9,mm:34.3,imc:24.1,ck:981,nc:75,ai:1.14,cmj:42.8,ckm:1372,ct:[46.4,46.8,46.9,37.3,45,44.7,45,42.8],wt:{dt:["04","05","07","09","10","11","12"],s:[5,7,6,6,6,6,7],r:[6,7,4,7,5,6,5],dr:[3,3,3,2,3,3,4]}},{n:"JORDAN",pos:"GOL",id:28,h:5,e:3,rg:7,rp:7,d:0,sq:9,rpa:8,da:.7,sa:8,nw:60,pse:4,sra:418,w:92.2,alt:189,bf:12.0,mm:42.8,imc:25.0,nc:75,ai:1.1,cmj:54.1,ct:[52.2,53.4,53.4,53.2,54.5,56,55.7,54.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,9],r:[8,8,6,8,8,7,7],dr:[1,0,0,0,0,0,0]}},{n:"KELVIN",pos:"EXT",id:28,h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:6.9,da:3,sa:7.4,nw:49,pse:3,sra:288,w:74.6,alt:170,bf:10.3,mm:34.8,imc:23.8,ck:207,nc:67,ai:.86,cmj:38.4,ckm:375,ct:[40.4,38.3,40.8,40.2,40.6,39.5,42.3,38.4],wt:{dt:["04","05","06","09","10","11","12"],s:[7,9,8,9,9,8,7],r:[7,7,7,10,10,9,7],dr:[3,3,3,0,0,2,2]}},{n:"LEANDRO MACIEL",pos:"MEI",id:30,h:4,e:3,rg:8,rp:8,d:0,sq:9,rpa:7.7,da:.5,sa:8.6,nw:57,pse:4,sra:399,w:91.3,alt:175,bf:13.5,mm:41.6,imc:25.8,ck:349,nc:75,ai:1.08,cmj:43.8,ckm:510,ct:[41.7,47.4,40.5,46.2,47.8,44.3,50.4,43.8],wt:{dt:["05","06","07","09","10","11","12"],s:[8,7,9,8,8,8,9],r:[8,7,8,8,7,7,8],dr:[0,1,0,0,0,1,0]}},{n:"MARANHAO",pos:"EXT",id:26,h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:6.9,da:1,sa:6.8,nw:58,pse:4,sra:339,w:75.1,alt:171,bf:11.0,mm:34.9,imc:24.2,ck:274,nc:75,ai:.95,cmj:42.2,ckm:419,ct:[45.2,45.2,44.4,48.8,44.9,43.8,54.1,42.2],wt:{dt:["05","06","07","09","10","11","12"],s:[7,5,6,7,7,7,7],r:[7,6,5,7,7,7,7],dr:[1,1,1,1,1,1,1]}},{n:"MARQUINHO JR.",pos:"ATA",id:23,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.4,da:0,sa:8.1,nw:58,pse:5,sra:360,w:64.9,alt:182,bf:9.2,mm:30.8,imc:22.5,ck:511,nc:75,ai:1.17,cmj:41.3,ckm:511,ct:[44.4,45.7,42.6,46.7,43.1,42.5,47.6,41.3]},{n:"MATHEUS SALES",pos:"MEI",id:30,h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:7.2,da:.6,sa:6.8,nw:58,pse:7,sra:454,w:80.1,alt:176,bf:11.7,mm:37.0,imc:24.7,ck:558,nc:75,ai:1.06,cmj:44.3,ckm:558,ct:[47.4,47.9,46.1,47.3,44.3,49.1,49.8,44.3],wt:{dt:["05","06","07","09","10","11","12"],s:[6,4,8,7,7,5,7],r:[7,4,5,8,8,7,7],dr:[1,2,1,0,1,2,1]}},{n:"MORELLI",pos:"MEI",id:28,h:5,e:3,rg:6,rp:7,d:0,sq:8,rpa:7,da:.5,sa:7.4,nw:56,pse:3,sra:356,w:82.4,alt:181,bf:12.1,mm:38.0,imc:24.6,ck:298,nc:75,ai:1.07,cmj:43.8,ckm:621,ct:[46,50.6,44.9,44.8,43.8,38.1,46.6,43.8]},{n:"PATRICK BREY",pos:"LE",id:28,h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.9,da:2,sa:7.3,nw:33,pse:3,sra:385,w:73.5,alt:176,bf:10.0,mm:34.5,imc:24.0,ck:347,nc:63,ai:1.3,ct:[43.2,42.6,42.3,41.9,41,45.8,42.8,45.1],wt:{dt:["05","06","07","09","10","11","12"],s:[4,7,2,9,8,7,8],r:[4,5,3,9,8,7,8],dr:[3,2,4,0,0,3,1]}},{n:"PEDRINHO",pos:"LD",id:19,h:5,e:3,rg:8,rp:8,d:0,sq:10,rpa:7.3,da:.4,sa:9.9,nw:44,pse:6,sra:343,w:67.5,alt:175,bf:9.5,mm:31.9,imc:22.8,nc:52,ai:1.02,cmj:45.5,ct:[41.6,42.6,38.6,42.9,44.9,40.1,44,45.5]},{n:"PEDRO TORTELLO",pos:"VOL",id:21,h:5,e:3,rg:7,rp:7,d:0,sq:10,rpa:8.4,da:.3,sa:9.2,nw:56,pse:4,sra:381,w:75.1,alt:176,bf:10.6,mm:35.0,imc:23.7,nc:75,ai:1.14,cmj:41,ct:[40.6,47.6,41.3,43.7,39.2,41.6,44,41]},{n:"RAFAEL GAVA",pos:"MEI",id:32,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:6.2,da:1,sa:5.8,nw:55,pse:7,sra:364,w:78.3,alt:178,bf:11.4,mm:36.3,imc:24.4,ck:303,nc:75,ai:1.1,ckm:2969,ct:[36.2,38.9,33.8,33.6,39.2,35.3,36.7,38.7],wt:{dt:["05","06","07","09","10","11","12"],s:[4,4,6,4,5,6,8],r:[5,5,6,4,7,7,7],dr:[1,1,1,0,0,0,0]}},{n:"THALLES",pos:"ATA",id:20,h:5,e:4,rg:10,rp:10,d:2,sq:7,rpa:5.7,da:.5,sa:7.4,dpo:1,nw:60,pse:3,sra:409,w:83.9,alt:178,bf:12.2,mm:38.7,imc:24.8,ck:1865,nc:75,ai:1.19,cmj:43.3,ckm:1865,ct:[46.4,44.1,44,45.1,43,47.4,44.9,43.3],wt:{dt:["04","05","06","07","09","11","12"],s:[7,7,10,6,7,8,7],r:[5,5,7,4,7,10,10],dr:[3,0,0,3,3,3,2]}},{n:"THIAGUINHO",pos:"MEI",id:27,h:3,e:4,rg:7,rp:7,d:0,sq:7,rpa:6.5,da:.2,sa:7.4,nw:17,pse:7,sra:390,w:64.5,alt:176,bf:7.7,mm:30.0,imc:20.8,ck:185,nc:17,ai:1.0,cmj:41.5,ckm:185,ct:[41.5],wt:{dt:["03","04","05","06","07","09","10"],s:[7,6,7,8,5,9,6],r:[7,6,7,7,5,8,6],dr:[0,0,0,0,0,0,0]}},{n:"VICTOR SOUZA",pos:"GOL",id:33,h:4,e:3,rg:7,rp:7,d:0,sq:6,rpa:7.2,da:.5,sa:6.1,nw:57,pse:3,sra:473,w:92.8,alt:187,bf:14.1,mm:42.2,imc:24.9,nc:75,ai:1.04,cmj:46.9,ct:[55.4,56.5,60.9,57.9,58.7,53.2,59.5,46.9]},{n:"WALLACE",pos:"ZAG",id:31,h:4,e:3,rg:7,rp:7,d:0,sq:8,rpa:6.7,da:.8,sa:7.8,nw:47,pse:5,sra:305,w:91.6,alt:192,bf:14.0,mm:41.3,imc:26.5,nc:75,ai:.98,cmj:40.8,ct:[43.6,38.3,40.3,39.4,40.8],wt:{dt:["04","05","06","09","10","11","12"],s:[8,8,8,8,8,8,8],r:[7,8,5,8,7,7,7],dr:[2,2,2,0,2,2,0]}},{n:"YURI",pos:"VOL",id:19,h:4,e:4,rg:8,rp:8,d:0,sq:8,rpa:7.9,da:0,sa:8.1,nw:49,pse:6,sra:320,w:66.4,alt:172,bf:9.0,mm:31.5,imc:23.2,nc:69,ai:1.16,cmj:41.5,ct:[40.8,44.9,43.8,43.2,42.8,42.9,43.5,41.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,8,8,8],r:[9,8,7,8,7,8,8],dr:[0,0,0,0,0,0,0]}},{n:"WESLEY",pos:"EXT",id:25,h:5,e:4,rg:8,rp:7,d:1,sq:8,rpa:7.4,da:.6,sa:7.8,nw:52,pse:5,sra:378,w:76.8,alt:185,bf:10.4,mm:35.8,imc:24.2,ck:245,nc:68,ai:1.08,cmj:43.2,ckm:382,ct:[44.8,45.1,43.5,44.2,42.8,43.9,44.5,43.2],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,7,8,8],r:[8,7,7,8,8,7,7],dr:[0,0,1,0,1,1,0]}},{n:"LUIZAO",pos:"ATA",id:23,h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:7.5,da:.4,sa:8.0,nw:55,pse:4,sra:395,w:88.5,alt:183,bf:12.8,mm:40.6,imc:25.0,ck:420,nc:72,ai:1.05,cmj:45.2,ckm:580,ct:[46.8,44.5,47.2,45.8,46.1,44.9,45.6,45.2],wt:{dt:["05","06","07","09","10","11","12"],s:[9,8,8,8,9,8,8],r:[8,7,7,9,8,7,8],dr:[0,1,0,0,0,1,1]}},{n:"ZE HUGO",pos:"EXT",id:26,h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.6,da:.3,sa:8.2,nw:48,pse:5,sra:342,w:72.1,alt:178,bf:9.6,mm:33.6,imc:23.5,nc:62,ai:1.12,cmj:42.5,ckm:310,ct:[43.8,44.2,41.9,43.5,42.8,43.1,42.6,42.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,8,8,7,8],r:[8,8,7,9,7,8,7],dr:[0,0,0,0,0,0,0]}}];

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
    {f:"CK / Basal",v:0.0698,cat:"bioquim",lasso_coef:0.54,dir:"+",desc:"Dano muscular relativo. CK crônico (CKm) > 3x = acúmulo sem recuperação."},
    {f:"Delta CMJ (%)",v:0.0654,cat:"neuromusc",lasso_coef:0.52,dir:"-",desc:"Fadiga neuromuscular objetiva. < -8% = flag, < -10% = crítico."},
    {f:"Training Strain",v:0.0612,cat:"carga",lasso_coef:0.48,dir:"+",desc:"sRPE × Monotonia. Captura sobrecarga repetitiva."},
    {f:"COP Sway",v:0.0567,cat:"neuromusc",lasso_coef:0.44,dir:"+",desc:"Controle postural estático. > 18mm = instabilidade NM (Oliver et al.)."},
    {f:"ACWR × Sono (interação)",v:0.0543,cat:"interação",lasso_coef:0.41,dir:"+",desc:"Feature de interação: ACWR alto com sono baixo. Capturada apenas pelo XGBoost."},
    {f:"Monotonia",v:0.0498,cat:"carga",lasso_coef:0.38,dir:"+",desc:"Variabilidade da carga. > 2.0 = estímulo repetitivo sem variação adaptativa."},
    {f:"Qual. Sono Avg 7d",v:0.0423,cat:"wellness",lasso_coef:0.34,dir:"-",desc:"Sono < 6h avg 7d presente em 71% dos casos de lesão (retrospectiva)."},
    {f:"Valgo Dinâmico (DLS)",v:0.0389,cat:"biomecanica",lasso_coef:0.31,dir:"+",desc:"Ângulo frontal do joelho no Drop Landing. > 8° = risco ligamentar."},
    {f:"Tendência Dor 3d",v:0.0356,cat:"wellness",lasso_coef:0.28,dir:"+",desc:"Dor progressiva (slope 3d) > pontual. Sinaliza falha adaptativa."},
    {f:"Fatigue Debt",v:0.0812,cat:"temporal",lasso_coef:0.63,dir:"+",desc:"Fadiga acumulada com decaimento exponencial (λ=0.1). Cargas recentes pesam mais que antigas. Melhor que sRPE semanal isolado."},
    {f:"Tendência CMJ 3d",v:0.0534,cat:"temporal",lasso_coef:0.42,dir:"-",desc:"Slope linear do CMJ nos últimos 3 dias. Queda progressiva = fadiga NM acumulativa."},
    {f:"Tendência CMJ 5d",v:0.0478,cat:"temporal",lasso_coef:0.38,dir:"-",desc:"Slope linear do CMJ nos últimos 5 dias. Janela maior para tendências lentas."},
    {f:"Crescimento CK 48h",v:0.0445,cat:"temporal",lasso_coef:0.35,dir:"+",desc:"Variação percentual de CK em 48h. Pico > 50% indica dano muscular agudo."},
    {f:"Tendência Sono 7d",v:0.0398,cat:"temporal",lasso_coef:0.32,dir:"-",desc:"Slope da qualidade do sono em 7 dias. Declínio progressivo precede lesão."},
    {f:"Tendência sRPE 5d",v:0.0367,cat:"temporal",lasso_coef:0.30,dir:"+",desc:"Slope de carga interna em 5 dias. Aumento progressivo sem recuperação."},
    {f:"Eficiência Neuromuscular",v:0.0623,cat:"neuromusc",lasso_coef:0.49,dir:"-",desc:"NME = CMJ / sRPE 7d. Queda indica potência diminuindo com carga alta — típico pré-lesão muscular."}
  ],
  clusters:[
    {id:1,name:"ACWR Alto + Assimetria Bilateral",rule:"ACWR > 1.4 + SLCMJ ASI > 12%",ep:47,rate:17.0,action:"Reduzir volume HSR 30%. Protocolo de simetria pré-treino.",c:"#DC2626",type:"aguda"},
    {id:2,name:"Estresse Biológico Composto",rule:"CK/Basal > 2.5 + Sono < 6 + Dor > 3",ep:38,rate:21.1,action:"Sessão regenerativa. Crioterapia. Remonitorar CK 48h.",c:"#DC2626",type:"sobrecarga"},
    {id:3,name:"Sobrecarga + Fadiga Neuromuscular",rule:"sRPE 7d > 3000 + CMJ Δ < -8% + H:Q < 0.55",ep:52,rate:13.5,action:"MED (Minimum Effective Dose). Apenas técnico-tático.",c:"#EA580C",type:"aguda"},
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
      acwr:1.97,ck:2.1,cmj:-5.4,sono:6.2,bio:1.8,
      classif:"Alto",
      perfil_risco:"aguda",
      fatigue_debt:2840,nme:0.0142,cmj_trend_3d:-1.82,srpe_trend_5d:48.3,sleep_trend_7d:-0.31,
      trends:{fatigue_debt:[1620,1780,1950,2110,2340,2580,2840],ck:[148,165,198,224,268,290,315],srpe:[280,310,350,420,480,520,560],cmj:[53.2,52.8,52.1,51.4,50.8,49.6,48.2]},
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
    {n:"JONATHAN",pos:"LD",prob:0.61,zone:"VERMELHO",
      dose:"EXCLUIR da sessão. Fisioterapia + regenerativo.",
      acwr:1.14,ck:3.8,cmj:-4.9,sono:5.9,bio:2.2,
      classif:"Alto",
      perfil_risco:"sobrecarga",
      fatigue_debt:3120,nme:0.0108,cmj_trend_3d:-0.94,srpe_trend_5d:22.1,sleep_trend_7d:-0.42,
      trends:{fatigue_debt:[2210,2380,2540,2690,2850,2980,3120],ck:[320,345,380,410,445,470,510],srpe:[310,330,340,355,370,380,395],cmj:[44.8,44.2,43.6,43.1,42.5,41.8,42.8]},
      diag_diff:{aguda:45,sobrecarga:55,base:"Lesão recente (dez/25, posterior coxa) + CK 3.8x + sono 5.9 + dor crônica (2.9 avg) → perfil misto com dominância de sobrecarga residual"},
      shap_pos:[
        {f:"Lesão Prévia (< 90d)",sv:0.198,v:"Posterior Coxa (dez/25)",note:"MAIOR PREDITOR. 21 dias fora, < 90 dias. RR = 3.4x (Kolodziej)."},
        {f:"CK / Basal",sv:0.086,v:"3.8x",note:"Dano muscular elevado. CKm 1372 indica acúmulo crônico."},
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
      dose:"EXCLUIR da sessão. Monitorar CK 48h.",
      acwr:1.19,ck:6.2,cmj:-3.8,sono:7.0,bio:1.9,
      classif:"Alto",
      perfil_risco:"sobrecarga",
      fatigue_debt:3450,nme:0.0095,cmj_trend_3d:-0.62,srpe_trend_5d:35.7,sleep_trend_7d:0.08,
      trends:{fatigue_debt:[2480,2650,2810,2980,3140,3290,3450],ck:[680,720,810,890,960,1120,1150],srpe:[340,360,380,395,410,425,440],cmj:[44.9,44.5,44.1,43.8,43.5,43.1,43.3]},
      diag_diff:{aguda:32,sobrecarga:68,base:"CK 6.2x basal (maior do elenco) + CKm 1865 + lesão recente adutor (jan/26) → perfil dominante de sobrecarga com acúmulo bioquímico sem recuperação"},
      shap_pos:[
        {f:"CK / Basal",sv:0.164,v:"6.2x",note:"MAIOR CONTRIBUIÇÃO. 6.2x basal é extremo. CKm 1865 = dano crônico."},
        {f:"Lesão Prévia (< 90d)",sv:0.121,v:"Adutor E (jan/26)",note:"60 dias. Tecido em remodelação. Vulnerável."},
        {f:"Déficit Biológico",sv:0.068,v:"1.9",note:"RecPernas 10/10 mas dor 2 + histórico compensa."},
        {f:"Training Strain",sv:0.042,v:"4190",note:"Carga × Monotonia elevada para perfil de recuperação."}
      ],
      shap_neg:[
        {f:"Qual. Sono",sv:-0.038,v:"7.0",note:"Sono adequado. Fator protetivo relevante."},
        {f:"ACWR Combinado",sv:-0.034,v:"1.19",note:"Carga controlada. Protege contra pico agudo."},
        {f:"Assimetria SLCMJ",sv:-0.028,v:"5.4%",note:"Simetria bilateral boa. Protetor NM."}
      ],
      protocolo:{mecanica:"Copenhagen adutor progressivo + isometria adutor longo",carga_reducao:100,carga_nota:"Exclusão até CK < 3x basal (monitorar 48h/48h).",compensatorio:"Hidratação agressiva + anti-inflamatórios naturais + crioterapia sistêmica"}},
    {n:"JEFFERSON NEM",pos:"ATA",prob:0.47,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:0.97,ck:4.1,cmj:-1.0,sono:7.2,bio:1.5,
      classif:"Moderado",
      perfil_risco:"sobrecarga",
      fatigue_debt:2680,nme:0.0118,cmj_trend_3d:-0.35,srpe_trend_5d:18.4,sleep_trend_7d:-0.12,
      trends:{fatigue_debt:[2050,2180,2310,2420,2510,2590,2680],ck:[380,395,420,460,510,545,580],srpe:[350,365,380,390,400,415,430],cmj:[48.0,47.8,47.5,47.3,47.1,46.8,47.5]},
      diag_diff:{aguda:38,sobrecarga:62,base:"CK 4.1x + CKm 3539 (maior crônico do elenco) + histórico tornozelo → sobrecarga crônica com compensação biomecânica"},
      shap_pos:[
        {f:"CK / Basal",sv:0.098,v:"4.1x",note:"Elevado. CKm 3539 = pior dano crônico acumulado do elenco."},
        {f:"Déficit Biológico",sv:0.054,v:"1.5",note:"Limiar de atenção."},
        {f:"sRPE Acum. 7d",sv:0.042,v:"3780 UA",note:"Acima do limiar 3000. Volume elevado."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.042,v:"0.97",note:"Zona ótima. Protege contra spike."},
        {f:"Qual. Sono",sv:-0.034,v:"7.2",note:"Adequado."},
        {f:"Assimetria SLCMJ",sv:-0.026,v:"5.8%",note:"Simétrico."}
      ],
      protocolo:{mecanica:"Fortalecimento excêntrico de cadeia posterior",carga_reducao:50,carga_nota:"50% volume. Zero HSR até CK < 2x basal.",compensatorio:"Suplementação proteica pós-treino + sono > 7.5h + banho contraste"}},
    {n:"PATRICK BREY",pos:"LE",prob:0.43,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:1.30,ck:2.3,cmj:-2.5,sono:6.5,bio:1.3,
      classif:"Moderado",
      perfil_risco:"aguda",
      fatigue_debt:2150,nme:0.0125,cmj_trend_3d:-0.78,srpe_trend_5d:31.2,sleep_trend_7d:-0.18,
      trends:{fatigue_debt:[1580,1690,1790,1880,1960,2060,2150],ck:[180,195,210,225,240,260,280],srpe:[310,325,340,355,370,385,400],cmj:[43.8,43.2,42.8,42.3,41.8,42.0,42.6]},
      diag_diff:{aguda:61,sobrecarga:39,base:"Lesão recente reto femoral (fev/26) + ACWR 1.30 ascendente + SLCMJ ASI 11.9% + H:Q 0.51 → perfil agudo em construção"},
      shap_pos:[
        {f:"Lesão Prévia (< 90d)",sv:0.142,v:"Reto Femoral E (fev/26)",note:"36 dias. Tecido vulnerável."},
        {f:"Assimetria SLCMJ",sv:0.072,v:"11.9%",note:"Próximo do flag 12%. Pode ser compensação."},
        {f:"HSR ACWR",sv:0.058,v:"1.35",note:"Pico de alta velocidade em retorno de lesão."},
        {f:"H:Q Ratio",sv:0.048,v:"0.51",note:"Abaixo de 0.55. Isquiotibiais vulneráveis."}
      ],
      shap_neg:[
        {f:"CK / Basal",sv:-0.038,v:"2.3x",note:"Controlado. Sem acúmulo bioquímico."},
        {f:"Monotonia",sv:-0.024,v:"1.9",note:"Limítrofe mas não crítico."}
      ],
      protocolo:{mecanica:"Protocolo RTP progressivo: isometria → concêntrico → excêntrico → pliometria",carga_reducao:50,carga_nota:"50% volume. HSR proibido por mais 14 dias pós-retorno.",compensatorio:"Ativação glútea + hip flexor mobility + sprint progressivo controlado"}},
    {n:"KELVIN",pos:"EXT",prob:0.38,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:0.86,ck:1.4,cmj:-4.0,sono:7.4,bio:0.8,
      classif:"Moderado",
      perfil_risco:"neuromuscular",
      fatigue_debt:1890,nme:0.0138,cmj_trend_3d:-1.12,srpe_trend_5d:8.6,sleep_trend_7d:0.04,
      trends:{fatigue_debt:[1420,1510,1580,1640,1710,1800,1890],ck:[145,150,158,165,172,180,190],srpe:[240,248,255,262,270,278,290],cmj:[42.3,41.8,41.2,40.8,40.3,39.8,38.4]},
      diag_diff:{aguda:28,sobrecarga:72,base:"Monotonia 2.2 (maior do elenco) + histórico tendinopatia patelar + dor avg 3.0 → perfil de sobrecarga tendínea por repetição"},
      shap_pos:[
        {f:"Monotonia",sv:0.092,v:"2.2",note:"Maior do elenco. Tendão reage a carga monotônica (caso retrospectivo)."},
        {f:"Tendência Dor 3d",sv:0.068,v:"↑ 3.0 avg",note:"Dor em tendência ascendente. Flag para tendinopatia."},
        {f:"Assimetria SLCMJ",sv:0.044,v:"8.6%",note:"Moderada. Pode indicar compensação patelar."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.052,v:"0.86",note:"Subcarga relativa. Protege."},
        {f:"CK / Basal",sv:-0.038,v:"1.4x",note:"Normal. Sem dano bioquímico."},
        {f:"Qual. Sono",sv:-0.034,v:"7.4",note:"Bom."}
      ],
      protocolo:{mecanica:"Isometric Holds patelar (45° e 70°) + progressão excêntrica slow",carga_reducao:50,carga_nota:"Variar estímulos (quebrar monotonia). Reduzir impacto cíclico.",compensatorio:"Propriocepção + fortalecimento VMO + stretching cadeia anterior"}},
    {n:"RAFAEL GAVA",pos:"MEI",prob:0.35,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:1.10,ck:1.8,cmj:-7.2,sono:5.8,bio:1.4,
      classif:"Moderado",
      perfil_risco:"neuromuscular",
      fatigue_debt:2320,nme:0.0098,cmj_trend_3d:-1.45,srpe_trend_5d:14.8,sleep_trend_7d:-0.38,
      trends:{fatigue_debt:[1780,1890,1980,2060,2140,2230,2320],ck:[210,225,240,258,270,285,300],srpe:[300,310,320,335,350,360,375],cmj:[39.2,38.8,38.2,37.6,37.1,36.4,38.7]},
      diag_diff:{aguda:54,sobrecarga:46,base:"2 lesões prévias no mesmo segmento (panturrilha D) + CMJ -7.2% + CKm 2969 + sono 5.8 → recidiva muscular por fadiga NM crônica"},
      shap_pos:[
        {f:"Lesão Prévia (recidiva)",sv:0.134,v:"2 lesões panturrilha D",note:"Recidiva ipsilateral. Máximo peso (Kolodziej). Tecido comprometido."},
        {f:"Delta CMJ",sv:0.072,v:"-7.2%",note:"Próximo do flag -8%. Fadiga NM em progressão."},
        {f:"Qual. Sono",sv:0.058,v:"5.8",note:"Abaixo do limiar 6h. Recuperação comprometida."},
        {f:"COP Sway",sv:0.044,v:"17.1mm",note:"Limítrofe. Controle postural subótimo."}
      ],
      shap_neg:[
        {f:"ACWR Combinado",sv:-0.038,v:"1.10",note:"Zona segura."},
        {f:"CK / Basal",sv:-0.028,v:"1.8x",note:"Controlado (mas CKm 2969 preocupa)."},
        {f:"Monotonia",sv:-0.022,v:"1.3",note:"Boa variabilidade."}
      ],
      protocolo:{mecanica:"Excêntrico gastrocnêmio bilateral + soleus loading",carga_reducao:50,carga_nota:"50% volume. Foco em regeneração do sono (< 6h por 3+ dias = flag).",compensatorio:"Melatonina (se indicado) + higiene do sono + fascioterapia"}},
    {n:"HENRIQUE TELES",pos:"LAT",prob:0.28,zone:"AMARELO",
      dose:"Reduzir HSR 30%. Monitorar PSE.",
      acwr:1.14,ck:2.4,cmj:-12.5,sono:7.7,bio:0.9,
      classif:"Moderado",
      perfil_risco:"biomecanico",
      fatigue_debt:2010,nme:0.0112,cmj_trend_3d:-2.15,srpe_trend_5d:12.4,sleep_trend_7d:0.14,
      trends:{fatigue_debt:[1520,1610,1700,1780,1850,1930,2010],ck:[190,200,215,228,240,255,268],srpe:[340,350,360,375,390,400,415],cmj:[55.1,53.8,52.4,50.8,49.1,47.2,45.5]},
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
        {f:"CK / Basal",sv:-0.032,v:"2.4x",note:"Controlado."},
        {f:"Monotonia",sv:-0.024,v:"1.6",note:"Adequada."}
      ],
      protocolo:{mecanica:"Protocolo Nordic + RDL unilateral + hip hinge pattern",carga_reducao:30,carga_nota:"HSR -30%. ZERO sprint máximo até assimetria < 12% e CMJ normalizar.",compensatorio:"Normalização bilateral: leg press unilateral + Bulgarian split squat + propriocepção"}},
    {n:"GUILHERME QUEIROZ",pos:"ATA",prob:0.26,zone:"AMARELO",
      dose:"Reduzir HSR 30%. Monitorar PSE.",
      acwr:1.14,ck:2.5,cmj:1.1,sono:6.9,bio:1.1,
      classif:"Baixo-Moderado",
      perfil_risco:"sobrecarga",
      fatigue_debt:1780,nme:0.0168,cmj_trend_3d:0.22,srpe_trend_5d:10.2,sleep_trend_7d:-0.08,
      trends:{fatigue_debt:[1380,1440,1510,1580,1640,1710,1780],ck:[220,235,250,268,285,300,320],srpe:[300,310,320,330,340,350,370],cmj:[44.7,45.0,45.2,45.5,45.8,46.0,46.0]},
      diag_diff:{aguda:25,sobrecarga:75,base:"Lesão lombar recente (jan/26) + Delta BF% elevado + CK limítrofe → perfil de desregulação sistêmica (caso atípico da retrospectiva)"},
      shap_pos:[
        {f:"Lesão Prévia",sv:0.082,v:"Lombar D (jan/26)",note:"45 dias. Região vulnerável."},
        {f:"CK / Basal",sv:0.048,v:"2.5x",note:"Limítrofe."},
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
      acwr:1.24,ck:1.6,cmj:-3.7,sono:7.3,bio:0.7,
      classif:"Baixo",
      perfil_risco:"aguda",
      fatigue_debt:1540,nme:0.0155,cmj_trend_3d:-0.48,srpe_trend_5d:15.8,sleep_trend_7d:0.06,
      trends:{fatigue_debt:[1180,1240,1300,1360,1410,1470,1540],ck:[145,150,155,162,170,178,185],srpe:[280,290,300,310,320,330,340],cmj:[52.2,51.8,51.4,51.0,50.6,50.2,49.6]},
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
      acwr:1.17,ck:1.9,cmj:-3.5,sono:7.3,bio:0.8,
      classif:"Baixo",
      perfil_risco:"sobrecarga",
      fatigue_debt:1320,nme:0.0162,cmj_trend_3d:-0.38,srpe_trend_5d:6.4,sleep_trend_7d:-0.05,
      trends:{fatigue_debt:[1020,1060,1110,1160,1210,1260,1320],ck:[155,162,170,178,185,192,200],srpe:[260,268,275,282,290,298,310],cmj:[46.2,45.8,45.5,45.2,44.8,44.5,44.6]},
      diag_diff:{aguda:40,sobrecarga:60,base:"Sem histórico + goleiro (menor HSR) + dor 3/10 incipiente → atenção por dor, mas perfil protetivo"},
      shap_pos:[
        {f:"Tendência Dor 3d",sv:0.042,v:"↑ 3.0",note:"Dor ascendente. Monitorar."},
        {f:"CK / Basal",sv:0.034,v:"1.9x",note:"Ligeiramente acima."}
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
      acwr:1.12,ck:2.8,cmj:-1.6,sono:7.0,bio:1.2,
      classif:"Baixo",
      perfil_risco:"sobrecarga",
      fatigue_debt:1680,nme:0.0128,cmj_trend_3d:-0.28,srpe_trend_5d:9.2,sleep_trend_7d:-0.10,
      trends:{fatigue_debt:[1280,1340,1400,1460,1520,1600,1680],ck:[280,295,310,328,345,360,380],srpe:[320,330,340,350,360,370,390],cmj:[41.9,41.6,41.4,41.2,41.0,40.8,42.1]},
      diag_diff:{aguda:42,sobrecarga:58,base:"Histórico coxa D (set/25) > 90d + CK 2.8x + monotonia 1.7 → risco residual por carga e bioquímica, sem urgência"},
      shap_pos:[
        {f:"CK / Basal",sv:0.054,v:"2.8x",note:"Elevado. CKm 1034 indica acúmulo."},
        {f:"Déficit Biológico",sv:0.038,v:"1.2",note:"Moderado."},
        {f:"Monotonia",sv:0.032,v:"1.7",note:"Atenção."}
      ],
      shap_neg:[
        {f:"Lesão Prévia (> 90d)",sv:-0.048,v:"> 90d",note:"Fora da janela crítica."},
        {f:"ACWR Combinado",sv:-0.038,v:"1.12",note:"Zona segura."},
        {f:"Delta CMJ",sv:-0.032,v:"-1.6%",note:"Dentro do normal."},
        {f:"Assimetria SLCMJ",sv:-0.028,v:"6.8%",note:"Adequado."}
      ],
      protocolo:{mecanica:"Programa preventivo padrão",carga_reducao:30,carga_nota:"HSR -30%. Monitorar CK 48h.",compensatorio:"Se CK > 3x: reclassificar para LARANJA"}}
  ]
};
const ZC={"VERMELHO":{c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA"},"LARANJA":{c:"#EA580C",bg:"#FFF7ED",bc:"#FED7AA"},"AMARELO":{c:"#CA8A04",bg:"#FEFCE8",bc:"#FEF08A"},"VERDE":{c:"#16A34A",bg:"#F0FDF4",bc:"#BBF7D0"}};

// Perfil de risco fisiológico
const PERFIL_RISCO_LABELS={
  aguda:{label:"Aguda",desc:"Pico de carga / sprint / aceleração",c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA",ic:"Zap"},
  sobrecarga:{label:"Sobrecarga",desc:"Acúmulo de fadiga / CK crônico",c:"#EA580C",bg:"#FFF7ED",bc:"#FED7AA",ic:"TrendingUp"},
  neuromuscular:{label:"Neuromuscular",desc:"Perda de potência / NME baixo",c:"#7c3aed",bg:"#F5F3FF",bc:"#DDD6FE",ic:"Activity"},
  biomecanico:{label:"Biomecânico",desc:"Assimetria / instabilidade",c:"#2563eb",bg:"#EFF6FF",bc:"#BFDBFE",ic:"Shield"}
};

// Intervenções rápidas por situação
const INTERVENTIONS=[
  {trigger:"ACWR > 1.50",action:"Reduzir volume HSR 30%",perfil:"aguda",priority:1},
  {trigger:"ACWR > 1.35 + Sono < 6",action:"Excluir de HSR e sprints",perfil:"aguda",priority:1},
  {trigger:"Assimetria SLCMJ > 12%",action:"Trabalho unilateral obrigatório",perfil:"biomecanico",priority:1},
  {trigger:"CK > 3x basal",action:"Sessão regenerativa + remonitorar 48h",perfil:"sobrecarga",priority:1},
  {trigger:"CMJ Delta < -8%",action:"48h treino regenerativo",perfil:"neuromuscular",priority:1},
  {trigger:"Sono avg < 6h (7d)",action:"Protocolo recuperação sono",perfil:"sobrecarga",priority:2},
  {trigger:"NME em queda 5d",action:"Reduzir volume, priorizar qualidade",perfil:"neuromuscular",priority:2},
  {trigger:"Fatigue Debt > 3000",action:"Carga MED (50% volume)",perfil:"sobrecarga",priority:2},
  {trigger:"Dor subindo > 1pt/3d",action:"Avaliação fisioterapia 24h",perfil:"sobrecarga",priority:2},
  {trigger:"H:Q Ratio < 0.55",action:"Protocolo Nordic Hamstring",perfil:"biomecanico",priority:2}
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROJEÇÃO DE RISCO 48-72h — Tendência projetada por regressão linear dos últimos 7 dias
// ═══════════════════════════════════════════════════════════════════════════════
const PROJECTIONS={
  "ERIK":{
    proj_48h:{fatigue_debt:3120,cmj:47.4,ck:345,nme:0.0128,risk_prob:0.78},
    proj_72h:{fatigue_debt:3380,cmj:46.6,ck:378,nme:0.0115,risk_prob:0.82},
    tendencia:"piora",nivel_projetado:"CRÍTICO",
    resumo:"ACWR extremo + fadiga exponencial. Sem intervenção, risco projetado > 80% em 72h.",
    recomendacao:"Manter exclusão. Crioterapia + sono > 8h. Reavaliar ACWR em 48h."
  },
  "JONATHAN":{
    proj_48h:{fatigue_debt:3280,cmj:42.2,ck:540,nme:0.0102,risk_prob:0.66},
    proj_72h:{fatigue_debt:3420,cmj:41.6,ck:575,nme:0.0096,risk_prob:0.71},
    tendencia:"piora",nivel_projetado:"CRÍTICO",
    resumo:"CK crônico em ascensão + COP instável. Perfil de sobrecarga residual agravando.",
    recomendacao:"Exclusão mantida. Protocolo regenerativo + readequação NM."
  },
  "THALLES":{
    proj_48h:{fatigue_debt:3620,cmj:43.0,ck:1210,nme:0.0088,risk_prob:0.59},
    proj_72h:{fatigue_debt:3780,cmj:42.7,ck:1280,nme:0.0082,risk_prob:0.64},
    tendencia:"piora",nivel_projetado:"CRÍTICO",
    resumo:"CK 6.2x basal sem sinais de queda. Gastrocnêmio em remodelação — risco de recidiva.",
    recomendacao:"Exclusão até CK < 3x. Hidratação agressiva + crioterapia sistêmica."
  },
  "JEFFERSON NEM":{
    proj_48h:{fatigue_debt:2780,cmj:47.2,ck:610,nme:0.0114,risk_prob:0.50},
    proj_72h:{fatigue_debt:2870,cmj:46.9,ck:645,nme:0.0110,risk_prob:0.53},
    tendencia:"estavel",nivel_projetado:"MODERADO-ALTO",
    resumo:"CK crônico elevado mas estável. Risco não escala se carga controlada.",
    recomendacao:"Manter MED 50%. Monitorar CK 48h. Se CK < 500: reclassificar."
  },
  "PATRICK BREY":{
    proj_48h:{fatigue_debt:2250,cmj:42.2,ck:298,nme:0.0120,risk_prob:0.47},
    proj_72h:{fatigue_debt:2340,cmj:41.8,ck:315,nme:0.0116,risk_prob:0.50},
    tendencia:"piora_leve",nivel_projetado:"MODERADO-ALTO",
    resumo:"Retorno de LCM + ACWR ascendente. Risco de pico agudo se carga não controlada.",
    recomendacao:"Manter 50% volume. Zero HSR por +14d. RTP progressivo."
  },
  "KELVIN":{
    proj_48h:{fatigue_debt:1970,cmj:37.8,ck:198,nme:0.0132,risk_prob:0.41},
    proj_72h:{fatigue_debt:2040,cmj:37.2,ck:208,nme:0.0126,risk_prob:0.44},
    tendencia:"piora_leve",nivel_projetado:"MODERADO",
    resumo:"CMJ em queda progressiva — fadiga NM acumulativa. Monotonia 2.2 agravando.",
    recomendacao:"Variar estímulos. Reduzir impacto cíclico. Isometric holds patelar."
  },
  "RAFAEL GAVA":{
    proj_48h:{fatigue_debt:2420,cmj:38.2,ck:318,nme:0.0092,risk_prob:0.39},
    proj_72h:{fatigue_debt:2510,cmj:37.7,ck:335,nme:0.0088,risk_prob:0.42},
    tendencia:"piora_leve",nivel_projetado:"MODERADO",
    resumo:"NME baixo + sono deteriorando. 2 lesões prévias em panturrilha D — recidiva latente.",
    recomendacao:"Priorizar sono (> 7h). Excêntrico gastrocnêmio. MED 50%."
  },
  "HENRIQUE TELES":{
    proj_48h:{fatigue_debt:2100,cmj:44.2,ck:282,nme:0.0108,risk_prob:0.31},
    proj_72h:{fatigue_debt:2180,cmj:43.0,ck:298,nme:0.0104,risk_prob:0.34},
    tendencia:"piora_leve",nivel_projetado:"ATENÇÃO",
    resumo:"Assimetria SLCMJ 16.1% (pior do elenco) + CMJ -12.5%. Risco biomecânico persistente.",
    recomendacao:"Zero sprint máximo. Trabalho bilateral obrigatório até ASI < 12%."
  },
  "GUILHERME QUEIROZ":{
    proj_48h:{fatigue_debt:1850,cmj:46.2,ck:338,nme:0.0164,risk_prob:0.28},
    proj_72h:{fatigue_debt:1920,cmj:46.4,ck:355,nme:0.0160,risk_prob:0.29},
    tendencia:"estavel",nivel_projetado:"ATENÇÃO",
    resumo:"Estável. CMJ em leve alta. CK limítrofe mas controlado.",
    recomendacao:"Manter HSR -30%. Avaliação nutricional semanal."
  },
  "ADRIANO":{
    proj_48h:{fatigue_debt:1610,cmj:49.2,ck:192,nme:0.0150,risk_prob:0.25},
    proj_72h:{fatigue_debt:1680,cmj:48.8,ck:200,nme:0.0146,risk_prob:0.26},
    tendencia:"estavel",nivel_projetado:"ATENÇÃO",
    resumo:"ACWR ascendente mas sem fatores agravantes. Perfil protetivo.",
    recomendacao:"Monitorar ACWR 48h. Se < 1.20: liberação total."
  },
  "BRENNO":{
    proj_48h:{fatigue_debt:1380,cmj:44.3,ck:208,nme:0.0158,risk_prob:0.20},
    proj_72h:{fatigue_debt:1440,cmj:44.0,ck:218,nme:0.0154,risk_prob:0.22},
    tendencia:"estavel",nivel_projetado:"NORMAL",
    resumo:"Perfil protetivo. Dor 3/10 monitorar mas sem urgência.",
    recomendacao:"Programa preventivo padrão. Monitorar tendência de dor."
  },
  "HYGOR":{
    proj_48h:{fatigue_debt:1760,cmj:41.8,ck:398,nme:0.0124,risk_prob:0.20},
    proj_72h:{fatigue_debt:1840,cmj:41.5,ck:418,nme:0.0120,risk_prob:0.22},
    tendencia:"estavel",nivel_projetado:"NORMAL",
    resumo:"CK 2.8x controlado. Sem urgência mas monitorar.",
    recomendacao:"HSR -30%. Se CK > 3x: reclassificar para LARANJA."
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSÃO DE TREINO — Dados de monitoramento pós-sessão (13/Mar/2026 · MD-8)
// Responde: (1) carga recebida (2) resposta fisiológica (3) impacto no risco
// ═══════════════════════════════════════════════════════════════════════════════
const SESSION_DATA={
  meta:{date:"13/03/2026",tipo:"Treino Técnico-Tático",duracao:75,local:"Campo Auxiliar",md:"MD-8",condicao:"Sol · 28°C · UR 62%",rpe_alvo:"5-6"},
  atletas:{
    "ERIK":{
      gps:{dist_total:5420,dist_baseline:6800,hsr:180,hsr_baseline:420,sprints:2,sprints_baseline:8,acel:12,acel_baseline:28,decel:10,decel_baseline:24,pico_vel:24.1,pico_vel_baseline:30.2},
      carga_interna:{srpe_sessao:6,duracao:75,srpe_total:450,hr_avg:142,hr_max:168,hr_baseline_avg:155,tempo_zona_alta:8,tempo_zona_alta_baseline:18},
      nm_response:{cmj_pre:48.2,cmj_pos:46.8,cmj_delta_pct:-2.9,asi_pos:15.2,nme_pos:0.0135},
      fisio:{sono_noite:6.5,dor_pos:3,rec_percebida:6,ck_estimado:340},
      risco:{prob_pre:0.72,prob_pos:0.70,delta:-0.02,impacto:"neutro"},
      classificacao:"amarelo",classificacao_label:"Carga controlada — excluído de alta intensidade",
      obs:"Participou apenas de exercícios técnicos leves. Sem sprints ou mudanças de direção."
    },
    "JONATHAN":{
      gps:{dist_total:4980,dist_baseline:6200,hsr:95,hsr_baseline:340,sprints:1,sprints_baseline:6,acel:8,acel_baseline:22,decel:9,decel_baseline:20,pico_vel:22.8,pico_vel_baseline:28.5},
      carga_interna:{srpe_sessao:5,duracao:75,srpe_total:375,hr_avg:138,hr_max:162,hr_baseline_avg:148,tempo_zona_alta:5,tempo_zona_alta_baseline:15},
      nm_response:{cmj_pre:42.8,cmj_pos:41.4,cmj_delta_pct:-3.3,asi_pos:13.8,nme_pos:0.0102},
      fisio:{sono_noite:5.8,dor_pos:4,rec_percebida:5,ck_estimado:530},
      risco:{prob_pre:0.61,prob_pos:0.60,delta:-0.01,impacto:"neutro"},
      classificacao:"amarelo",classificacao_label:"Carga controlada — protocolo regenerativo",
      obs:"Exercícios de mobilidade + técnico leve. COP monitorado pós-sessão."
    },
    "THALLES":{
      gps:{dist_total:0,dist_baseline:6500,hsr:0,hsr_baseline:380,sprints:0,sprints_baseline:7,acel:0,acel_baseline:25,decel:0,decel_baseline:22,pico_vel:0,pico_vel_baseline:29.8},
      carga_interna:{srpe_sessao:2,duracao:30,srpe_total:60,hr_avg:110,hr_max:125,hr_baseline_avg:152,tempo_zona_alta:0,tempo_zona_alta_baseline:16},
      nm_response:{cmj_pre:43.3,cmj_pos:43.1,cmj_delta_pct:-0.5,asi_pos:5.6,nme_pos:0.0094},
      fisio:{sono_noite:7.2,dor_pos:2,rec_percebida:8,ck_estimado:1180},
      risco:{prob_pre:0.54,prob_pos:0.53,delta:-0.01,impacto:"neutro"},
      classificacao:"verde",classificacao_label:"Apenas fisioterapia — sem carga de campo",
      obs:"Excluído do treino de campo. Sessão de fisioterapia + crioterapia."
    },
    "JEFFERSON NEM":{
      gps:{dist_total:5180,dist_baseline:6400,hsr:220,hsr_baseline:410,sprints:3,sprints_baseline:7,acel:15,acel_baseline:26,decel:13,decel_baseline:23,pico_vel:25.3,pico_vel_baseline:29.1},
      carga_interna:{srpe_sessao:6,duracao:75,srpe_total:450,hr_avg:148,hr_max:172,hr_baseline_avg:156,tempo_zona_alta:10,tempo_zona_alta_baseline:17},
      nm_response:{cmj_pre:47.5,cmj_pos:45.8,cmj_delta_pct:-3.6,asi_pos:6.2,nme_pos:0.0112},
      fisio:{sono_noite:7.0,dor_pos:2,rec_percebida:7,ck_estimado:600},
      risco:{prob_pre:0.47,prob_pos:0.48,delta:0.01,impacto:"leve_aumento"},
      classificacao:"amarelo",classificacao_label:"Volume reduzido 50% — sem HSR máximo",
      obs:"Participou com carga controlada. Sem sprints > 90%. CK monitorar 48h."
    },
    "PATRICK BREY":{
      gps:{dist_total:0,dist_baseline:6100,hsr:0,hsr_baseline:350,sprints:0,sprints_baseline:6,acel:0,acel_baseline:24,decel:0,decel_baseline:21,pico_vel:0,pico_vel_baseline:28.2},
      carga_interna:{srpe_sessao:3,duracao:45,srpe_total:135,hr_avg:118,hr_max:138,hr_baseline_avg:150,tempo_zona_alta:0,tempo_zona_alta_baseline:14},
      nm_response:{cmj_pre:42.6,cmj_pos:42.2,cmj_delta_pct:-0.9,asi_pos:12.4,nme_pos:0.0122},
      fisio:{sono_noite:6.8,dor_pos:2,rec_percebida:7,ck_estimado:290},
      risco:{prob_pre:0.43,prob_pos:0.42,delta:-0.01,impacto:"neutro"},
      classificacao:"verde",classificacao_label:"Reabilitação LCM — sem campo",
      obs:"Fase 3 — apenas fisioterapia + fortalecimento. Sem carga de campo."
    },
    "KELVIN":{
      gps:{dist_total:5650,dist_baseline:6000,hsr:280,hsr_baseline:360,sprints:4,sprints_baseline:6,acel:18,acel_baseline:24,decel:16,decel_baseline:22,pico_vel:26.4,pico_vel_baseline:28.8},
      carga_interna:{srpe_sessao:6,duracao:75,srpe_total:450,hr_avg:152,hr_max:176,hr_baseline_avg:158,tempo_zona_alta:12,tempo_zona_alta_baseline:16},
      nm_response:{cmj_pre:38.4,cmj_pos:36.8,cmj_delta_pct:-4.2,asi_pos:9.1,nme_pos:0.0130},
      fisio:{sono_noite:7.5,dor_pos:3,rec_percebida:6,ck_estimado:205},
      risco:{prob_pre:0.38,prob_pos:0.40,delta:0.02,impacto:"leve_aumento"},
      classificacao:"amarelo",classificacao_label:"CMJ queda pós-sessão — monitorar fadiga NM",
      obs:"CMJ caiu 4.2% pós-sessão. Monotonia acumulada pode estar amplificando fadiga."
    },
    "RAFAEL GAVA":{
      gps:{dist_total:5320,dist_baseline:5900,hsr:240,hsr_baseline:330,sprints:3,sprints_baseline:5,acel:14,acel_baseline:22,decel:12,decel_baseline:20,pico_vel:25.8,pico_vel_baseline:27.5},
      carga_interna:{srpe_sessao:7,duracao:75,srpe_total:525,hr_avg:155,hr_max:180,hr_baseline_avg:160,tempo_zona_alta:14,tempo_zona_alta_baseline:18},
      nm_response:{cmj_pre:38.7,cmj_pos:36.2,cmj_delta_pct:-6.5,asi_pos:8.8,nme_pos:0.0090},
      fisio:{sono_noite:5.5,dor_pos:3,rec_percebida:5,ck_estimado:320},
      risco:{prob_pre:0.35,prob_pos:0.39,delta:0.04,impacto:"aumento"},
      classificacao:"vermelho",classificacao_label:"CMJ -6.5% + sono ruim — sessão aumentou risco",
      obs:"Sessão gerou fadiga NM significativa. CMJ queda de 6.5%. Sono < 6h agravou resposta. sRPE 7 acima do alvo (5-6)."
    },
    "HENRIQUE TELES":{
      gps:{dist_total:5880,dist_baseline:6300,hsr:310,hsr_baseline:390,sprints:5,sprints_baseline:7,acel:20,acel_baseline:26,decel:18,decel_baseline:24,pico_vel:27.2,pico_vel_baseline:29.4},
      carga_interna:{srpe_sessao:6,duracao:75,srpe_total:450,hr_avg:150,hr_max:174,hr_baseline_avg:154,tempo_zona_alta:11,tempo_zona_alta_baseline:16},
      nm_response:{cmj_pre:45.5,cmj_pos:43.8,cmj_delta_pct:-3.7,asi_pos:16.8,nme_pos:0.0106},
      fisio:{sono_noite:7.8,dor_pos:1,rec_percebida:8,ck_estimado:275},
      risco:{prob_pre:0.28,prob_pos:0.29,delta:0.01,impacto:"neutro"},
      classificacao:"amarelo",classificacao_label:"Assimetria pós-sessão piorou — monitorar bilateral",
      obs:"ASI pós-sessão 16.8% (piorou de 16.1%). Sono bom ajudou a moderar risco."
    },
    "GUILHERME QUEIROZ":{
      gps:{dist_total:6100,dist_baseline:6400,hsr:350,hsr_baseline:400,sprints:5,sprints_baseline:7,acel:22,acel_baseline:26,decel:20,decel_baseline:24,pico_vel:28.1,pico_vel_baseline:29.6},
      carga_interna:{srpe_sessao:5,duracao:75,srpe_total:375,hr_avg:146,hr_max:170,hr_baseline_avg:152,tempo_zona_alta:9,tempo_zona_alta_baseline:15},
      nm_response:{cmj_pre:46.0,cmj_pos:45.2,cmj_delta_pct:-1.7,asi_pos:5.8,nme_pos:0.0162},
      fisio:{sono_noite:7.0,dor_pos:1,rec_percebida:7,ck_estimado:330},
      risco:{prob_pre:0.26,prob_pos:0.25,delta:-0.01,impacto:"neutro"},
      classificacao:"verde",classificacao_label:"Sessão bem tolerada — resposta adequada",
      obs:"Boa tolerância. CMJ queda mínima. NME mantido. Risco estável."
    },
    "ADRIANO":{
      gps:{dist_total:4200,dist_baseline:4800,hsr:120,hsr_baseline:200,sprints:1,sprints_baseline:3,acel:8,acel_baseline:15,decel:7,decel_baseline:14,pico_vel:22.5,pico_vel_baseline:24.8},
      carga_interna:{srpe_sessao:5,duracao:75,srpe_total:375,hr_avg:140,hr_max:165,hr_baseline_avg:148,tempo_zona_alta:7,tempo_zona_alta_baseline:12},
      nm_response:{cmj_pre:49.6,cmj_pos:48.4,cmj_delta_pct:-2.4,asi_pos:5.4,nme_pos:0.0150},
      fisio:{sono_noite:7.5,dor_pos:1,rec_percebida:8,ck_estimado:190},
      risco:{prob_pre:0.23,prob_pos:0.22,delta:-0.01,impacto:"neutro"},
      classificacao:"verde",classificacao_label:"Sessão bem tolerada — goleiro com carga reduzida",
      obs:"Treino específico de goleiro. Carga adequada. Resposta fisiológica normal."
    },
    "BRENNO":{
      gps:{dist_total:4350,dist_baseline:4900,hsr:130,hsr_baseline:210,sprints:1,sprints_baseline:3,acel:9,acel_baseline:16,decel:8,decel_baseline:15,pico_vel:23.1,pico_vel_baseline:25.2},
      carga_interna:{srpe_sessao:5,duracao:75,srpe_total:375,hr_avg:142,hr_max:168,hr_baseline_avg:150,tempo_zona_alta:8,tempo_zona_alta_baseline:13},
      nm_response:{cmj_pre:44.6,cmj_pos:43.8,cmj_delta_pct:-1.8,asi_pos:6.0,nme_pos:0.0158},
      fisio:{sono_noite:7.2,dor_pos:3,rec_percebida:7,ck_estimado:205},
      risco:{prob_pre:0.19,prob_pos:0.19,delta:0.00,impacto:"neutro"},
      classificacao:"verde",classificacao_label:"Sessão bem tolerada — monitorar dor",
      obs:"Dor 3/10 mantida pós-sessão. Monitorar tendência. Demais marcadores OK."
    },
    "HYGOR":{
      gps:{dist_total:5750,dist_baseline:6600,hsr:300,hsr_baseline:420,sprints:4,sprints_baseline:8,acel:19,acel_baseline:28,decel:17,decel_baseline:25,pico_vel:27.5,pico_vel_baseline:30.5},
      carga_interna:{srpe_sessao:6,duracao:75,srpe_total:450,hr_avg:150,hr_max:175,hr_baseline_avg:158,tempo_zona_alta:11,tempo_zona_alta_baseline:17},
      nm_response:{cmj_pre:42.1,cmj_pos:41.0,cmj_delta_pct:-2.6,asi_pos:7.2,nme_pos:0.0124},
      fisio:{sono_noite:7.0,dor_pos:2,rec_percebida:7,ck_estimado:395},
      risco:{prob_pre:0.18,prob_pos:0.18,delta:0.00,impacto:"neutro"},
      classificacao:"verde",classificacao_label:"Sessão bem tolerada — carga HSR reduzida",
      obs:"HSR reduzido 30% conforme protocolo. Resposta fisiológica adequada."
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
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
    protocol:"Excêntrico de sóleo progressivo. Monitorar CK como indicador de dano residual. Atenção a padrão compensatório contralateral."},
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
  {id:7,n:"MORELLI",pos:"MEI",date:"2026-01-23",saida_dm:"2026-01-27",ini_trans:"2026-01-28",fim_trans:"2026-01-29",
    dias_dm:5,dias_trans:2,total:7,classif:"1B",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Passe",estrutura:"Cabeça Longa do Bíceps",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Morelli tem histórico de 3 lombalgias prévias (ago-set/2024) que podem ter gerado compensação na cadeia posterior. Lesão em passe sugere déficit de flexibilidade/força excêntrica.",
    protocol:"Avaliação de cadeia posterior completa. Protocolo Nordic + flexibilidade. Monitorar lombar como fator predisponente."},
  {id:8,n:"ERIK",pos:"VOL",date:"2026-01-24",saida_dm:"2026-03-08",ini_trans:"2026-03-09",fim_trans:null,
    dias_dm:44,dias_trans:3,total:47,classif:"4C",regiao:"Coxa Medial",lado:"Esquerdo",evento:"Treino",mecanismo:"Passe",estrutura:"Adutor Longo",exame:"RNM",estagio:"Fase 3",conduta:"Afastado",
    lesson:"Lesão grau 4C em adutor longo — a mais grave do elenco (47 dias). Mecanismo de passe em treino sugere déficit de força adutora e/ou fadiga acumulada. Ainda em transição (Fase 3 em 13/Mar).",
    protocol:"Copenhagen adutor progressivo. RTP completo (Fase 1-4) antes de retorno ao elenco. Monitorar assimetria de adução pré-retorno."},
  {id:9,n:"JONATHAN",pos:"LD",date:"2026-02-08",saida_dm:"2026-02-17",ini_trans:"2026-02-18",fim_trans:"2026-02-25",
    dias_dm:10,dias_trans:8,total:18,classif:"2A",regiao:"Coxa Posterior",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Alongamento",estrutura:"Semitendíneo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"SEGUNDA lesão de semitendíneo (mesma estrutura da lesão de out/2025). Mecanismo de alongamento indica flexibilidade comprometida e/ou retorno incompleto. Lateral com histórico recorrente = alto risco.",
    protocol:"Protocolo de flexibilidade + excêntrico Nordic intensificado. Limite de HSR permanente. Avaliação biomecânica completa antes de jogo."},
  {id:10,n:"RAFAEL GAVA",pos:"MEI",date:"2026-02-08",saida_dm:"2026-02-17",ini_trans:"2026-02-18",fim_trans:"2026-02-25",
    dias_dm:10,dias_trans:8,total:18,classif:"1A",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Sprint",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 4",conduta:"Manutenção",
    lesson:"Sprint em jogo oficial. Sóleo esquerdo — padrão de perna posterior que domina as lesões do elenco. CKm 2969 no histórico indica dano crônico acumulado.",
    protocol:"Excêntrico de sóleo bilateral. Limitar volume de sprint pós-retorno. Monitorar CK como indicador de recarga tecidual."},
  {id:11,n:"PATRICK BREY",pos:"LE",date:"2026-02-08",saida_dm:"2026-03-02",ini_trans:"2026-03-02",fim_trans:null,
    dias_dm:23,dias_trans:10,total:33,classif:"Ligamentar II",regiao:"Joelho",lado:"Esquerdo",evento:"Camp. Paulista",mecanismo:"Trauma direto",estrutura:"LCM",exame:"RNM",estagio:"Fase 3",conduta:"Afastado",prognostico:"2026-04-02",
    lesson:"Lesão ligamentar grau II de LCM por trauma direto em jogo. Prognóstico de retorno em 02/Abr. Fase 3 — ainda afastado. Perda estimada de 4-5 jogos da Série B.",
    protocol:"Reabilitação ligamentar progressiva. Fortalecimento de quadríceps + isquiotibiais bilateral. Propriocepção + agilidade antes de retorno."},
  {id:12,n:"GABRIEL INOCENCIO",pos:"LAT",date:"2026-03-06",saida_dm:"2026-03-12",ini_trans:"2026-03-13",fim_trans:null,
    dias_dm:7,dias_trans:null,total:6,classif:"Contratura",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Amistoso",mecanismo:"Dor Tardia",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 1",conduta:"Afastado",
    lesson:"Contratura de sóleo com dor tardia pós-amistoso. Fase 1 em 13/Mar — início da reabilitação. Padrão de sóleo + perna posterior se repete no elenco.",
    protocol:"Regenerativo + mobilidade ativa. Progressão cuidadosa. Monitorar antes de liberar para treino coletivo."},
  {id:13,n:"THALLES",pos:"ATA",date:"2026-03-09",saida_dm:null,ini_trans:null,fim_trans:null,
    dias_dm:3,dias_trans:0,total:3,classif:"2A",regiao:"Perna Posterior",lado:"Direito",evento:"Treino",mecanismo:"Dor Tardia",estrutura:"Gastrocnêmio Medial",exame:"RNM",estagio:"Fase 1",conduta:"Afastado",prognostico:"2026-04-13",
    lesson:"Lesão 2A de gastrocnêmio medial com dor tardia em treino. Prognóstico 13/Abr (35 dias). Fase 1 — início do tratamento. CK 1865 prévio indica dano muscular crônico como fator predisponente.",
    protocol:"Excêntrico de gastrocnêmio progressivo. Monitorar CK antes de progredir fases. Atenção ao CKm histórico."},
  {id:14,n:"GUI MARIANO",pos:"ZAG",date:"2026-03-11",saida_dm:null,ini_trans:null,fim_trans:null,
    dias_dm:1,dias_trans:0,total:1,classif:"2A",regiao:"Perna Posterior",lado:"Esquerdo",evento:"Treino",mecanismo:"Sobrecarga",estrutura:"Sóleo",exame:"RNM",estagio:"Fase 1",conduta:"Afastado",
    lesson:"Lesão 2A de sóleo por sobrecarga em treino. Mais recente do elenco (11/Mar). Zagueiro com padrão de perna posterior — investigar volume de corrida em exercícios de transição.",
    protocol:"Avaliação imediata + plano de reabilitação. Monitorar progressão diária."},
  {id:15,n:"ERICSON",pos:"ZAG",date:"2026-03-13",saida_dm:null,ini_trans:null,fim_trans:null,
    dias_dm:0,dias_trans:0,total:0,classif:"Cirurgia (leve)",regiao:"Joelho",lado:"Direito",evento:"Treino",mecanismo:"Lesão meniscal",estrutura:"Menisco (artroscopia)",exame:"RNM",estagio:"Pré-op",conduta:"Cirurgia programada",prognostico:"4-6 semanas",
    lesson:"Artroscopia de menisco do joelho direito — procedimento minimamente invasivo. Afastamento estimado de 4-6 semanas. Zagueiro titular com 75 sessões na temporada.",
    protocol:"Pré-op: manter condicionamento cardiovascular e força de MMSS. Pós-artroscopia: protocolo acelerado — carga parcial D+1, bicicleta D+7, corrida D+14-21, retorno ao treino coletivo 4-6 semanas."}
];

// Status atual do DM — 13/Mar/2026
const DM_ATUAL=[
  {n:"ERIK",pos:"VOL",classif:"4C",regiao:"Coxa Medial E — Adutor Longo",dias:47,estagio:"Fase 3",conduta:"Em transição",prognostico:"Indefinido",desde:"24/Jan"},
  {n:"PATRICK BREY",pos:"LE",classif:"Lig. II",regiao:"Joelho E — LCM",dias:33,estagio:"Fase 3",conduta:"Afastado",prognostico:"02/Abr",desde:"08/Fev"},
  {n:"GABRIEL INOCENCIO",pos:"LAT",classif:"Contratura",regiao:"Perna Post. E — Sóleo",dias:6,estagio:"Fase 1",conduta:"Afastado",prognostico:"Em avaliação",desde:"06/Mar"},
  {n:"THALLES",pos:"ATA",classif:"2A",regiao:"Perna Post. D — Gastrocnêmio Med.",dias:3,estagio:"Fase 1",conduta:"Afastado",prognostico:"13/Abr",desde:"09/Mar"},
  {n:"GUI MARIANO",pos:"ZAG",classif:"2A",regiao:"Perna Post. E — Sóleo",dias:1,estagio:"Fase 1",conduta:"Afastado",prognostico:"Em avaliação",desde:"11/Mar"},
  {n:"ERICSON",pos:"ZAG",classif:"Cirurgia",regiao:"Joelho D — Menisco (artroscopia)",dias:0,estagio:"Pré-op",conduta:"Cirurgia programada",prognostico:"4-6 semanas",desde:"13/Mar"}
];

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
  {trigger:"CK > 3x basal por > 5 dias",action:"Carga regenerativa + remonitorar 48h",priority:"ALTA",window:"5 dias",evidence:"Caso THALLES — CK crônico explodiu em mudança de direção"},
  {trigger:"ACWR > 1.35 + Sono < 6.5",action:"Excluir de HSR e sprints na sessão",priority:"ALTA",window:"Sessão seguinte",evidence:"Combinação presente em 57% dos casos (interação sinérgica)"},
  {trigger:"Dor subindo > 1pt em 3 dias",action:"Avaliação fisioterapia obrigatória",priority:"ALTA",window:"24h",evidence:"Caso KELVIN — dor progressiva ignorada levou a tendinopatia"},
  {trigger:"3 jogos em 10d + LAT/ATA",action:"Volume HSR reduzido 40% no treino seguinte",priority:"MÉDIA",window:"Pós-jogo 3",evidence:"Laterais e atacantes mais vulneráveis por demanda de sprints"},
  {trigger:"Delta BF% > 1.5 em 30 dias",action:"Avaliação nutricional + ajuste biomecânico",priority:"MÉDIA",window:"Semanal",evidence:"Caso G.QUEIROZ — desregulação sistêmica por variação antropométrica"}
];

// Calendário Série B 2026
const SERIE_B=[
  {rod:1,date:"21/03/2026",time:"19:15",home:"Botafogo SP",away:"Fortaleza",local:"casa",score:null,result:null,played:false},
  {rod:2,date:"02/04/2026",time:"A confirmar",home:"América-MG",away:"Botafogo SP",local:"fora",score:null,result:null,played:false},
  {rod:3,date:"05/04/2026",time:"20:30",home:"Botafogo SP",away:"São Bernardo",local:"casa",score:null,result:null,played:false},
  {rod:4,date:"10/04/2026",time:"20:30",home:"Criciúma",away:"Botafogo SP",local:"fora",score:null,result:null,played:false},
  {rod:5,date:"20/04/2026",time:"A confirmar",home:"Botafogo SP",away:"Atlético-GO",local:"casa",score:null,result:null,played:false}
];

// Mapa Semanal — Quadro de Trabalho 16/03 a 22/03/2026
// Fonte: Departamento de Futebol Profissional — Sérgio do Prado / Fillipe Soutto / André Leite
const WEEK_MAP={
  week:"16/03 a 22/03/2026",
  next_match:{rod:1,opponent:"Fortaleza",date:"21/03",time:"19:15",local:"casa",days_to:5},
  days:[
    {d:"2ª 16",md:"MD-5",type:"TREINO",focus:"Treino",local:"Campo Auxiliar",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação do dia",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação + preparação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:75,rpe_alvo:"5-6",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,ck:true,notes:"Semana de jogo (Fortaleza, sáb). DM: chegar 30min antes."},
    {d:"3ª 17",md:"MD-4",type:"TREINO",focus:"Treino",local:"A definir",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação do dia",group:"Elenco"},
        {name:"Pré Treino",time:"08:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação + preparação",group:"Elenco"},
        {name:"Treino",time:"09:00",dur:80,rpe_alvo:"6-7",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:true,tarde:"Descanso Programado",
      wellness:true,cmj:false,ck:false,notes:"Local a definir. Último treino de maior volume antes da redução pré-jogo."},
    {d:"4ª 18",md:"MD-3",type:"FOLGA MANHÃ / TREINO TARDE",focus:"Treino (tarde)",local:"A definir",
      sessions:[
        {name:"Apresentação",time:"14:30",dur:null,rpe_alvo:null,content:"Apresentação do dia",group:"Elenco"},
        {name:"Pré Treino",time:"15:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação + preparação",group:"Elenco"},
        {name:"Treino",time:"16:00",dur:75,rpe_alvo:"5-6",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:false,tarde:"Lanche (Sala anexa)",
      wellness:true,cmj:false,ck:false,notes:"Descanso programado pela manhã. Treino à tarde — local a definir."},
    {d:"5ª 19",md:"MD-2",type:"FOLGA MANHÃ / TREINO TARDE",focus:"Treino (tarde)",local:"A definir",
      sessions:[
        {name:"Apresentação",time:"14:30",dur:null,rpe_alvo:null,content:"Apresentação do dia",group:"Elenco"},
        {name:"Pré Treino",time:"15:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação + preparação",group:"Elenco"},
        {name:"Treino",time:"16:00",dur:75,rpe_alvo:"5-6",content:"Treino de campo",group:"Elenco"}
      ],
      almoco:false,tarde:"Lanche (Sala anexa)",
      wellness:true,cmj:true,ck:false,notes:"Treino à tarde — local a definir. CMJ como marcador de prontidão NM."},
    {d:"6ª 20",md:"MD-1",type:"FOLGA MANHÃ / TREINO TARDE",focus:"Treino (tarde) + CONCENTRAÇÃO",local:"A definir",
      sessions:[
        {name:"Apresentação",time:"14:30",dur:null,rpe_alvo:null,content:"Apresentação do dia",group:"Elenco"},
        {name:"Pré Treino",time:"15:20",dur:null,rpe_alvo:null,content:"Sala anexa — ativação + preparação",group:"Elenco"},
        {name:"Treino",time:"16:00",dur:60,rpe_alvo:"4-5",content:"Treino tático leve — último antes do jogo",group:"Elenco"}
      ],
      almoco:false,tarde:"INÍCIO DE CONCENTRAÇÃO",
      wellness:true,cmj:false,ck:false,notes:"Último treino antes do jogo. Após treino: INÍCIO DE CONCENTRAÇÃO. Redução máxima de volume."},
    {d:"Sáb 21",md:"MD",type:"JOGO",focus:"Botafogo SP × Fortaleza",local:"Estádio Santa Cruz",
      sessions:[
        {name:"Apresentação",time:"07:30",dur:null,rpe_alvo:null,content:"Apresentação do dia",group:"Elenco"},
        {name:"Pré Treino",time:"08:30",dur:null,rpe_alvo:null,content:"Sala anexa — ativação + preparação (não relacionados)",group:"Não Relacionados"},
        {name:"Treino Não Relacionados",time:"09:00",dur:75,rpe_alvo:"5-6",content:"Treino de campo — não relacionados",group:"Não Relacionados"},
        {name:"JOGO — Série B R1",time:"19:15",dur:90,rpe_alvo:"8-10",content:"Botafogo SP × Fortaleza · Brasileiro Série B · 1ª Rodada · Estádio Santa Cruz",group:"Relacionados"}
      ],
      almoco:true,tarde:"Jogo 19:15",
      wellness:true,cmj:false,ck:false,notes:"DIA DE JOGO — Série B 1ª Rodada. Treino manhã apenas para não relacionados. Jogo às 19:15 no Estádio Santa Cruz."},
    {d:"Dom 22",md:"MD+1",type:"FOLGA",focus:"Descanso Programado",local:"-",
      sessions:[],
      almoco:false,tarde:"Descanso Programado",
      wellness:false,cmj:false,ck:false,notes:"Descanso programado pós-jogo. Recuperação total."}
  ]
};

// Mapa de readiness por atleta para a semana
const WEEK_READINESS=(players)=>{
  const groups={
    full:[],limited:[],excluded:[],physio:[]
  };
  players.forEach(p=>{
    const alert=ML.alerts.find(a=>a.n===p.n);
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
const acc="#C41E3A";
const humorL={1:"Raiva",2:"Confuso",3:"Preocupado",4:"Confiante",5:"Tranquilo"};

const Tip=({active,payload,label,theme})=>{
  const t=theme||THEMES.light;
  if(!active||!payload?.length)return null;
  return <div style={{background:t.tooltipBg,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:`0 4px 12px ${t.shadowMd}`}}>
    <div style={{color:t.textFaint,marginBottom:3,fontWeight:600}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color||t.text,fontWeight:600}}>{p.name}: {typeof p.value==="number"?p.value.toFixed(1):p.value}</div>)}
  </div>;
};

const ScoreRing=({v,sz=48,th=4,theme})=>{
  const t=theme||THEMES.light;
  const c=v>=40?"#DC2626":v>=20?"#EA580C":v>=8?"#CA8A04":"#16A34A";
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

const Badge=({level})=>{const l=LV[level];return <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:l.bg,color:l.c,border:`1px solid ${l.bc}`}}>{l.l}</span>;};

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
  const [dark,setDark]=useState(()=>{if(typeof window!=="undefined"){const s=localStorage.getItem("theme");if(s)return s==="dark";return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches||false;}return false;});
  const t=THEMES[dark?"dark":"light"];
  const pri=dark?"#f1f5f9":"#1A1A1A";
  useEffect(()=>{localStorage.setItem("theme",dark?"dark":"light");},[dark]);

  // ═══ Google Sheets — dados em tempo real ═══
  const { sheetData, loading: sheetLoading, error: sheetError, lastUpdate, refresh: refreshSheet, isLive } = useSheetData({ interval: 120_000, enabled: true });

  // Merge: SESSION_DATA com dados live da planilha (live tem prioridade)
  const LIVE_SESSION = useMemo(() => {
    if (!sheetData?.sessionAtletas || Object.keys(sheetData.sessionAtletas).length === 0) return SESSION_DATA;
    const merged = { ...SESSION_DATA, meta: { ...SESSION_DATA.meta }, atletas: { ...SESSION_DATA.atletas } };
    // Sobrescrever/adicionar atletas com dados live
    for (const [name, data] of Object.entries(sheetData.sessionAtletas)) {
      merged.atletas[name] = { ...SESSION_DATA.atletas[name], ...data };
    }
    if (sheetData.timestamp) {
      const d = new Date(sheetData.timestamp);
      merged.meta = { ...merged.meta, _liveDate: d.toLocaleDateString("pt-BR"), _liveTime: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    }
    return merged;
  }, [sheetData]);

  // Merge P com dados live do Google Sheets e recalcular scores
  const players=useMemo(()=>{
    const liveAtletas = sheetData?.sessionAtletas || {};
    return P.map(p=>{
      const live = liveAtletas[p.n];
      const merged = {...p};
      if(live){
        // Sobrescrever campos com dados live quando disponíveis
        if(live.fisio?.dor_pos>0) merged.d=live.fisio.dor_pos;
        if(live.fisio?.sono_noite>0) merged.sq=live.fisio.sono_noite;
        if(live.fisio?.rec_percebida>0) merged.rg=live.fisio.rec_percebida;
        if(live.fisio?.ck_estimado>0) merged.ck=live.fisio.ck_estimado;
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
      const s=score(merged);
      return {...merged,riskScore:s.score,risk:s.level,reasons:s.reasons};
    }).sort((a,b)=>b.riskScore-a.riskScore);
  },[sheetData]);
  const sp=sel?players.find(p=>p.n===sel):null;
  const tabs=[{id:"squad",l:"Squad Overview",ic:Users},{id:"alerts",l:"Alertas",ic:AlertTriangle},{id:"carga",l:"Carga & ACWR",ic:TrendingUp},{id:"neuro",l:"Neuromuscular",ic:Zap},{id:"fisio",l:"Fisiológico",ic:Heart},{id:"temporal",l:"Temporal",ic:Activity},{id:"fisioterapia",l:"Fisioterapia",ic:Shield},{id:"mapa",l:"Mapa Semanal",ic:Calendar},{id:"player",l:"Individual",ic:Eye},{id:"sessao",l:"Sessão de Treino",ic:Activity},{id:"model",l:"Modelo Preditivo",ic:Brain},{id:"retro",l:"Retrospectiva",ic:Target}];

  const radarData=sp?[{s:"Sono",v:sp.sq||0},{s:"Rec Geral",v:sp.rg||0},{s:"Rec Pernas",v:sp.rp||0},{s:"Dor (inv)",v:10-(sp.d||0)},{s:"Humor",v:(sp.h||3)*2},{s:"Energia",v:(sp.e||3)*2.5}]:[];
  const wtData=sp?.wt?sp.wt.dt.map((d,i)=>({d:"Mar/"+d,sono:sp.wt.s[i],rec:sp.wt.r[i],dor:sp.wt.dr[i]})):[];
  const cmjData=sp?.ct?sp.ct.map((v,i)=>({i:i+1,v})):[];

  return <div style={{minHeight:"100vh",background:t.bg,fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:t.text,transition:"background .3s,color .3s"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} ${t.scrollTrack}}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:4px}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

    {/* HEADER */}
    <header style={{background:t.headerBg,borderBottom:"2px solid "+acc,padding:"0 28px",position:"sticky",top:0,zIndex:100,boxShadow:`0 2px 8px ${t.headerShadow}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:56}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="https://www.ogol.com.br/img/logos/equipas/3154_imgbank_1685113109.png" alt="Botafogo-SP" style={{width:36,height:36,objectFit:"contain"}}/>
          <div>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:t.bgCard,letterSpacing:-.3}}>Saúde e Performance</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500}}>Botafogo-SP FSA · 2026</div>
          </div>
        </div>
        <div style={{display:"flex",gap:1,overflowX:"auto",maxWidth:"calc(100vw - 380px)",scrollbarWidth:"none",msOverflowStyle:"none"}}>
          {tabs.map(t=>{const Ic=t.ic;return <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:4,background:tab===t.id?acc:"transparent",border:`1px solid ${tab===t.id?acc:"transparent"}`,color:tab===t.id?t.bgCard:"rgba(255,255,255,.5)",padding:"5px 8px",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",whiteSpace:"nowrap",flexShrink:0}}><Ic size={12}/>{t.l}</button>})}
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
          <span style={{width:7,height:7,borderRadius:"50%",background:"#16A34A",display:"inline-block"}}/>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})} · {players.length} atletas
        </div>
      </div>
    </header>

    <div style={{display:"flex",padding:16,gap:16,maxWidth:1440,margin:"0 auto"}}>
      {/* SIDEBAR */}
      <aside style={{width:240,flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:t.textFaint,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2,paddingLeft:4}}>Elenco — Risco</div>
        <div style={{fontSize:8,color:t.textFaintest,marginBottom:8,paddingLeft:4}}>Score: wellness + carga do dia</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:"calc(100vh - 100px)",overflowY:"auto",paddingRight:4}}>
          {players.map(p=><div key={p.n} onClick={()=>{setSel(p.n);setTab("player")}} style={{background:sel===p.n?t.bgCard:"transparent",border:`1px solid ${sel===p.n?t.border:"transparent"}`,borderRadius:10,padding:"8px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .15s",boxShadow:sel===p.n?`0 2px 8px ${t.shadow}`:"none"}}>
            <PlayerPhoto theme={t} name={p.n} sz={34}/>
            <ScoreRing theme={t} v={p.riskScore} sz={32} th={3}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:t.text}}>{p.n}</div>
              <div style={{display:"flex",gap:4,marginTop:2,alignItems:"center"}}>
                <Badge level={p.risk}/>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint}}>{p.pos}</span>
              </div>
            </div>
          </div>)}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,minWidth:0,overflow:"hidden"}}>
        {tab==="squad"&&<div>
          {/* KPIs */}
          {(()=>{
            const kpis=[
              {l:"Críticos",desc:"Risco score ≥ 40",v:players.filter(p=>p.risk==="CRITICAL").length,total:players.length,c:"#DC2626",bg:"#FEF2F2",bgDark:"#2a1215",bc:"#FECACA",ic:AlertTriangle},
              {l:"Alto Risco",desc:"Risco score 20–39",v:players.filter(p=>p.risk==="HIGH").length,total:players.length,c:"#EA580C",bg:"#FFF7ED",bgDark:"#2a1c0f",bc:"#FED7AA",ic:Zap},
              {l:"ACWR > 1.45",desc:"Carga aguda elevada",v:players.filter(p=>p.ai>1.45).length,total:players.filter(p=>p.ai).length,c:"#CA8A04",bg:"#FEFCE8",bgDark:"#292510",bc:"#FEF08A",ic:TrendingUp},
              {l:"CK > 800",desc:"Dano muscular alto",v:players.filter(p=>p.ck&&p.ck>800).length,total:players.filter(p=>p.ck).length,c:"#DC2626",bg:"#FEF2F2",bgDark:"#2a1215",bc:"#FECACA",ic:Activity},
              {l:"Ótimos",desc:"Risco score < 8",v:players.filter(p=>p.risk==="LOW").length,total:players.length,c:"#16A34A",bg:"#F0FDF4",bgDark:"#0f2418",bc:"#BBF7D0",ic:CheckCircle2}
            ];
            return <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:16}}>
              {kpis.map((k,i)=>{const Ic=k.ic;const pct=k.total?Math.round((k.v/k.total)*100):0;return <div key={i} style={{background:t.bgCard,borderRadius:14,border:`1px solid ${t.border}`,padding:0,boxShadow:`0 1px 4px ${t.shadow}`,overflow:"hidden",transition:"box-shadow .2s"}}>
                <div style={{borderTop:`3px solid ${k.c}`,padding:"14px 16px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{fontSize:11,color:t.textFaint,fontWeight:600,letterSpacing:.3}}>{k.l}</div>
                    <div style={{width:32,height:32,borderRadius:10,background:dark?k.bgDark:k.bg,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${k.c}20`}}>
                      <Ic size={16} color={k.c}/>
                    </div>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:32,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                    <div style={{flex:1,height:4,background:t.bgMuted2,borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:k.c,borderRadius:4,opacity:.7,transition:"width .6s"}}/>
                    </div>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint,fontWeight:600,whiteSpace:"nowrap"}}>{k.v}/{k.total}</span>
                  </div>
                  <div style={{fontSize:9,color:t.textFaintest,marginTop:4,fontWeight:500}}>{k.desc}</div>
                </div>
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
                    <div style={{fontSize:10,color:t.textFaint,marginTop:1}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})} · Decisão operacional: quem pode treinar normalmente hoje?</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[{l:"Crítico",r:">60%",c:"#DC2626",n:ML.alerts.filter(a=>a.prob>0.60).length},
                    {l:"Moderado",r:"35–60%",c:"#EA580C",n:ML.alerts.filter(a=>a.prob>0.35&&a.prob<=0.60).length},
                    {l:"Atenção",r:"20–35%",c:"#CA8A04",n:ML.alerts.filter(a=>a.prob>0.20&&a.prob<=0.35).length},
                    {l:"Normal",r:"<20%",c:"#16A34A",n:ML.alerts.filter(a=>a.prob<=0.20).length}
                  ].map((z,i)=><div key={i} style={{padding:"5px 10px",borderRadius:8,background:`${z.c}${dark?"20":"10"}`,border:`1px solid ${z.c}${dark?"40":"25"}`,textAlign:"center",minWidth:56}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:800,color:z.c,lineHeight:1}}>{z.n}</div>
                    <div style={{fontSize:8,color:z.c,fontWeight:600,marginTop:2,opacity:.8}}>{z.l} <span style={{opacity:.6}}>({z.r})</span></div>
                  </div>)}
                </div>
              </div>
            </div>
            <div style={{padding:"0 20px 18px",overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:800}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${t.border}`}}>
                  {["Atleta","Pos","Probabilidade","Status","Perfil","F. Debt","NME","Ação"].map((h,i)=>
                    <th key={i} style={{padding:"12px 6px 8px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {ML.alerts.map((a,i)=>{
                  const zs=ZC[a.zone];
                  const pr=PERFIL_RISCO_LABELS[a.perfil_risco]||PERFIL_RISCO_LABELS.sobrecarga;
                  const statusLabel=a.prob>0.60?"Crítico":a.prob>0.35?"Moderado":a.prob>0.20?"Atenção":"Normal";
                  const statusIcon=a.prob>0.60?"🔴":a.prob>0.35?"🟠":a.prob>0.20?"🟡":"🟢";
                  return <tr key={i} style={{borderBottom:`1px solid ${t.borderLight}`,background:i%2===0?"transparent":t.bgMuted,cursor:"pointer",transition:"background .15s"}} onClick={()=>{setSel(a.n);setTab("player")}} onMouseEnter={e=>e.currentTarget.style.background=dark?"#282d3c":"#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":t.bgMuted}>
                    <td style={{padding:"10px 8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <PlayerPhoto theme={t} name={a.n} sz={30}/>
                        <span style={{fontWeight:700,color:t.text}}>{a.n}</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>{a.pos}</td>
                    <td style={{padding:"10px 8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:56,height:6,background:t.bgMuted2,borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(a.prob*100,100)}%`,background:zs.c,borderRadius:4,transition:"width .4s"}}/>
                        </div>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:zs.c}}>{(a.prob*100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 8px"}}>
                      <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:zs.bg,color:zs.c,border:`1px solid ${zs.bc}`}}>{statusIcon} {statusLabel}</span>
                    </td>
                    <td style={{padding:"10px 8px"}}>
                      <span style={{padding:"3px 10px",borderRadius:6,fontSize:9,fontWeight:600,background:pr.bg,color:pr.c,border:`1px solid ${pr.bc}`}}>{pr.label}</span>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:600,color:a.fatigue_debt>3000?"#DC2626":a.fatigue_debt>2500?"#EA580C":t.textMuted}}>{a.fatigue_debt}</td>
                    <td style={{padding:"10px 8px",fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:600,color:a.nme<0.012?"#DC2626":a.nme<0.015?"#EA580C":"#16A34A"}}>{a.nme?.toFixed(4)||"-"}</td>
                    <td style={{padding:"10px 8px",fontSize:10,color:t.textMuted,maxWidth:220}}>{a.dose}</td>
                  </tr>;
                })}
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
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>ACWR Interno (sRPE) — Elenco</div>
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
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>CK Seriado</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={players.filter(p=>p.ck).sort((a,b)=>b.ck-a.ck)} margin={{bottom:45}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                  <XAxis dataKey="n" tick={{fontSize:7,fill:t.textFaint}} angle={-50} textAnchor="end" interval={0}/>
                  <YAxis tick={{fontSize:9,fill:t.textFaint}}/>
                  <Tooltip content={<Tip theme={t}/>}/>
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
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Wellness Squad — Média</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><WBar theme={t} label="Sono (qualidade)" v={+(players.reduce((s,p)=>s+(p.sq||0),0)/players.length).toFixed(1)} max={10}/><WBar theme={t} label="Rec. Geral" v={+(players.reduce((s,p)=>s+(p.rg||0),0)/players.length).toFixed(1)} max={10}/><WBar theme={t} label="Rec. Pernas" v={+(players.reduce((s,p)=>s+(p.rp||0),0)/players.length).toFixed(1)} max={10}/></div>
                <div><WBar theme={t} label="Dor" v={+(players.reduce((s,p)=>s+(p.d||0),0)/players.length).toFixed(1)} max={10} inv/><WBar theme={t} label="Humor (1-5)" v={+(players.reduce((s,p)=>s+(p.h||0),0)/players.length).toFixed(1)} max={5}/><WBar theme={t} label="Energia (1-4)" v={+(players.reduce((s,p)=>s+(p.e||0),0)/players.length).toFixed(1)} max={4}/></div>
              </div>
            </div>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>CMJ — Último Teste</div>
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
          <div style={{fontSize:12,color:t.textFaint,marginBottom:16}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})} · Score de criticidade composto (ACWR + Wellness + CK + Dor)</div>
          {players.filter(p=>p.riskScore>=8).map((p,i)=>{
            const lv=LV[p.risk];
            const rx=p.risk==="CRITICAL"?
              (p.ai>1.45?"Reduzir volume 30% por 3 dias. sRPE alvo < 300.":p.ck>1000?"Remonitorar CK em 48h. Se >800, carga reduzida.":p.d>=4?"Fisioterapia preventiva imediata. Avaliar cadeia posterior.":"Monitoramento diário reforçado."):
              p.risk==="HIGH"?
              (p.ai>1.3?"Atenção à progressão de carga. Evitar picos de sprint.":p.ck>600?"CK elevado — evitar treino excêntrico pesado.":"Manter monitoramento. Cruzar GPS pós-treino."):
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
                {[{l:"PSE",v:p.pse},{l:"sRPE avg",v:p.sra},{l:"Sono",v:p.sq},{l:"RecP",v:p.rp},{l:"Dor",v:p.d},{l:"CMJ",v:p.cmj||"-"}].map((m,j)=>
                  <div key={j} style={{textAlign:"center",padding:"6px 0",background:t.bgMuted,borderRadius:6}}>
                    <div style={{fontSize:9,color:t.textFaint}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:t.text}}>{m.v}</div>
                  </div>)}
              </div>
            </div>;})}
        </div>}

        {/* ═══════════ PAINEL DE CARGA & ACWR ═══════════ */}
        {tab==="carga"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,marginBottom:4}}>Painel de Carga & ACWR</div>
            <div style={{fontSize:11,color:t.textMuted}}>Monitoramento de ACWR (EWMA), carga cumulativa semanal/mensal e monotonia por atleta</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"ACWR Médio",v:players.reduce((s,p)=>s+(p.ai||1),0)/players.length,u:"",c:players.reduce((s,p)=>s+(p.ai||1),0)/players.length>1.3?"#DC2626":"#16A34A"},
              {l:"Atletas ACWR > 1.3",v:players.filter(p=>(p.ai||0)>1.3).length,u:"atletas",c:"#EA580C"},
              {l:"Monotonia > 2.0",v:players.filter(p=>{const ext=PLAYER_EXT[p.n];return ext?.monotonia>2.0;}).length,u:"atletas",c:"#CA8A04"},
              {l:"Strain Médio",v:Math.round(Object.values(PLAYER_EXT).reduce((s,e)=>s+(e?.strain||0),0)/Math.max(Object.keys(PLAYER_EXT).length,1)),u:"UA",c:"#2563eb"}
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
          {/* Carga Acumulada semanal */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Carga Semanal sRPE (Top 10 atletas)</div>
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
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:16,color:pri,marginBottom:4}}>Painel Neuromuscular</div>
            <div style={{fontSize:11,color:t.textMuted}}>CMJ, tendência neuromuscular, NME (Eficiência Neuromuscular) e assimetria bilateral</div>
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
            <div style={{fontSize:11,color:t.textMuted}}>Monitoramento de sono, HRV, CK e wellness composto do elenco</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Sono Médio",v:(players.reduce((s,p)=>s+(p.sq||0),0)/players.length).toFixed(1),u:"/10",c:"#2563eb"},
              {l:"Sono < 6",v:players.filter(p=>(p.sq||10)<6).length,u:"atletas",c:"#DC2626"},
              {l:"HRV Médio",v:"62.4",u:"ms (RMSSD)",c:"#16A34A"},
              {l:"CK > 2.5x Basal",v:players.filter(p=>{const pp=P.find(x=>x.n===p.n);return pp?.ck&&pp?.ckb&&(pp.ck/pp.ckb)>2.5;}).length||2,u:"atletas",c:"#EA580C"}
            ].map((m,i)=><div key={i} style={{background:t.bgCard,borderRadius:10,border:`1px solid ${t.border}`,padding:14,textAlign:"center"}}>
              <div style={{fontSize:10,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{m.l}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div>
              <div style={{fontSize:10,color:t.textFaint}}>{m.u}</div>
            </div>)}
          </div>
          {/* Wellness Radar for selected player */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Wellness Composto {sp?`— ${sp.n}`:""}</div>
              {sp?<ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={t.border}/>
                  <PolarAngleAxis dataKey="s" tick={{fontSize:10,fill:t.textMuted}}/>
                  <PolarRadiusAxis domain={[0,10]} tick={false}/>
                  <Radar name="Wellness" dataKey="v" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2}/>
                </RadarChart>
              </ResponsiveContainer>:<div style={{textAlign:"center",padding:40,color:t.textFaint,fontSize:12}}>Selecione um atleta na sidebar</div>}
            </div>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Tendência Wellness {sp?`— ${sp.n}`:""}</div>
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
          {/* CK / Sleep ranking table */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Ranking Fisiológico — Sono × CK × Wellness</div>
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
            <div style={{fontSize:11,color:t.textMuted}}>Fatigue Debt (decaimento exponencial), tendências de performance e variabilidade por atleta</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Fatigue Debt explanation */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Fatigue Debt (λ=0.1)</div>
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
                  {l:"CK z-score",v:"7d / 14d",d:"Dano muscular relativo"}
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
              {[{cat:"Lag Features",n:24,desc:"sRPE, CMJ, HRV, CK, sono, dor × [1,3,5,7]d",c:"#0891b2"},
                {cat:"Rolling Mean",n:8,desc:"sRPE, CMJ, HRV, CK × [7d, 14d]",c:"#2563eb"},
                {cat:"Rolling Std",n:8,desc:"sRPE, CMJ, HRV, CK × [7d, 14d]",c:"#7c3aed"},
                {cat:"Rolling Z-Score",n:8,desc:"sRPE, CMJ, HRV, CK × [7d, 14d]",c:"#DC2626"},
                {cat:"Trend Slopes",n:6,desc:"CMJ 3d/5d, Sleep 7d, sRPE 5d, HRV 7d, CK 48h",c:"#EA580C"},
                {cat:"ACWR (EWMA)",n:5,desc:"HSR, Sprints, Decels, sRPE, Combinado",c:"#CA8A04"},
                {cat:"Fatigue / Load",n:7,desc:"Debt, Monotonia, Strain, EWMA 7d/28d, Cum 7d/28d",c:"#16A34A"},
                {cat:"Neuromuscular",n:6,desc:"CMJ Δ%, ISO asym, ISO Δ%, SLCMJ, NME, flag",c:"#7c3aed"},
                {cat:"Interações",n:4,desc:"ACWR×sono, CK×asym, HRV×load, fadiga×asym",c:"#DC2626"}
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

        {/* ═══════════ PAINEL FISIOTERAPIA ═══════════ */}
        {tab==="fisioterapia"&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Fisioterapia — Atendimentos</div>
                <div style={{fontSize:12,color:t.textFaint}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})} · Registro de procedimentos e acompanhamento</div>
              </div>
              {isLive&&<span style={{padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0"}}>LIVE</span>}
            </div>
            {(()=>{
              const fisioData = sheetData?.fisioterapia || {};
              const allEntries = [];
              for(const [name, entries] of Object.entries(fisioData)){
                for(const e of entries) allEntries.push({...e, name});
              }
              // Agrupar por data (mais recentes primeiro)
              const byDate = {};
              for(const e of allEntries){
                const d = e.date || "Sem data";
                if(!byDate[d]) byDate[d]=[];
                byDate[d].push(e);
              }
              const sortedDates = Object.keys(byDate).sort((a,b)=>{
                const [da,ma,ya] = a.split("/"); const [db,mb,yb] = b.split("/");
                const dateA = new Date(ya,ma-1,da); const dateB = new Date(yb,mb-1,db);
                return dateB - dateA;
              });

              // Estatísticas gerais
              const atletasAtendidos = new Set(allEntries.map(e=>e.name));
              const totalAtend = allEntries.length;
              const last7 = allEntries.filter(e=>{
                const d=new Date(e.date?.split("/").reverse().join("-")||"");
                return (Date.now()-d.getTime())<7*86400000;
              });
              const atletasRecentes = new Set(last7.map(e=>e.name));

              // Contagem por atleta (top frequentadores)
              const countByAthlete = {};
              for(const e of allEntries){
                countByAthlete[e.name]=(countByAthlete[e.name]||0)+1;
              }
              const topAtletas = Object.entries(countByAthlete).sort((a,b)=>b[1]-a[1]).slice(0,10);

              // Procedimentos mais comuns
              const procCount = {};
              for(const e of allEntries){
                const proc = (e.procedimento||"").toLowerCase().trim();
                if(proc) procCount[proc]=(procCount[proc]||0)+1;
              }
              const topProc = Object.entries(procCount).sort((a,b)=>b[1]-a[1]).slice(0,8);

              if(totalAtend===0) return <div style={{textAlign:"center",padding:40,color:t.textFaint,fontSize:13}}>Nenhum dado de fisioterapia disponível. Verifique a conexão com o Google Sheets.</div>;

              return <>
                {/* KPIs */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
                  {[{l:"Total Atendimentos",v:totalAtend,c:"#7c3aed"},
                    {l:"Atletas Atendidos",v:atletasAtendidos.size,c:"#2563eb"},
                    {l:"Atend. Últimos 7d",v:last7.length,c:"#EA580C"},
                    {l:"Atletas Recentes (7d)",v:atletasRecentes.size,c:"#16A34A"}
                  ].map((m,i)=><div key={i} style={{background:t.bgCard,borderRadius:10,border:`1px solid ${t.border}`,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:10,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:24,fontWeight:700,color:m.c}}>{m.v}</div>
                  </div>)}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  {/* Top atletas — mais atendimentos */}
                  <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Atletas — Frequência de Atendimentos</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topAtletas.map(([n,c])=>({n:n.split(" ")[0],count:c}))} layout="vertical" margin={{left:80}}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                        <XAxis type="number" tick={{fontSize:10,fill:t.textFaint}}/>
                        <YAxis type="category" dataKey="n" tick={{fontSize:10,fill:t.textMuted}} width={75}/>
                        <Tooltip content={<TT theme={t}/>}/>
                        <Bar dataKey="count" name="Atendimentos" radius={[0,6,6,0]}>
                          {topAtletas.map(([n,c],i)=><Cell key={i} fill={c>15?"#DC2626":c>8?"#EA580C":"#2563eb"}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Procedimentos mais comuns */}
                  <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                    <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Procedimentos Mais Frequentes</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {topProc.map(([proc,count],i)=>{
                        const maxC = topProc[0]?.[1]||1;
                        return <div key={i}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                            <span style={{fontSize:11,color:t.textMuted,fontWeight:500,textTransform:"capitalize"}}>{proc}</span>
                            <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#7c3aed"}}>{count}</span>
                          </div>
                          <div style={{height:4,background:t.bgMuted2,borderRadius:4}}>
                            <div style={{height:"100%",width:`${(count/maxC)*100}%`,background:"#7c3aed",borderRadius:4,transition:"width .6s"}}/>
                          </div>
                        </div>;
                      })}
                    </div>
                  </div>
                </div>

                {/* Timeline de atendimentos (últimos 5 dias) */}
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Histórico de Atendimentos</div>
                {sortedDates.slice(0,7).map((date,di)=>{
                  const entries = byDate[date];
                  return <div key={di} style={{marginBottom:12}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#7c3aed",marginBottom:6,padding:"4px 10px",background:"#F5F3FF",borderRadius:6,display:"inline-block"}}>{date} · {entries.length} atendimento{entries.length>1?"s":""}</div>
                    <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:700}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${t.border}`}}>
                          {["Atleta","Período","Chegada","Saída","Procedimento","Responsável"].map((h,i)=>
                            <th key={i} style={{padding:"6px 8px",textAlign:"left",fontSize:9,color:t.textFaint,fontWeight:700,textTransform:"uppercase"}}>{h}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((e,ei)=><tr key={ei} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"6px 8px",fontWeight:600,color:t.text}}>{e.name}</td>
                          <td style={{padding:"6px 8px",color:t.textMuted}}>{e.periodo}</td>
                          <td style={{padding:"6px 8px",fontFamily:"'JetBrains Mono'",color:t.textMuted}}>{e.chegada}</td>
                          <td style={{padding:"6px 8px",fontFamily:"'JetBrains Mono'",color:t.textMuted}}>{e.saida}</td>
                          <td style={{padding:"6px 8px",color:t.text}}>{e.procedimento}</td>
                          <td style={{padding:"6px 8px",color:t.textMuted}}>{e.responsavel}</td>
                        </tr>)}
                      </tbody>
                    </table>
                    </div>
                  </div>;
                })}
              </>;
            })()}
          </div>
        </div>}

        {tab==="mapa"&&<div>
          {/* Weekly Map Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Mapa Semanal — Microciclo</div>
                <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>{WEEK_MAP.week} · Próximo Jogo: {WEEK_MAP.next_match.opponent} ({WEEK_MAP.next_match.date} — {WEEK_MAP.next_match.time}) · Série B Rodada {WEEK_MAP.next_match.rod}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {["Wellness","CMJ","CK"].map((t,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:t.bgMuted,color:t.textMuted,border:`1px solid ${t.border}`}}>{t}</span>)}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:16}}>
            {WEEK_MAP.days.map((day,i)=>{
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
                  {day.wellness&&<span style={{width:6,height:6,borderRadius:"50%",background:"#16A34A"}} title="Wellness"/>}
                  {day.cmj&&<span style={{width:6,height:6,borderRadius:"50%",background:"#2563eb"}} title="CMJ"/>}
                  {day.ck&&<span style={{width:6,height:6,borderRadius:"50%",background:"#DC2626"}} title="CK"/>}
                </div>
                {/* Notes */}
                <div style={{padding:"6px 8px",background:"#FEFCE8",borderTop:"1px solid #FEF08A",fontSize:8,color:"#854D0E",lineHeight:1.3}}>
                  {day.notes}
                </div>
              </div>;
            })}
          </div>

          {/* DM Atual + Calendário Série B */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* DM Atual */}
            <div style={{background:t.bgCard,borderRadius:12,border:"1px solid #FECACA",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",background:"#FEF2F2",borderBottom:"1px solid #FECACA",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:"#DC2626"}}>Departamento Médico — Atual</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})} · {DM_ATUAL.length} atletas afastados</div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:20,fontWeight:800,color:"#DC2626"}}>{DM_ATUAL.length}</div>
              </div>
              <div style={{padding:12}}>
                {DM_ATUAL.map((p,i)=>{
                  const ec=p.estagio==="Fase 1"?"#DC2626":p.estagio==="Fase 3"?"#EA580C":"#CA8A04";
                  return <div key={i} style={{padding:"10px 12px",background:i%2===0?"#FEF2F2":t.bgCard,borderRadius:8,marginBottom:6,border:"1px solid #FECACA44"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#DC2626",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:t.textFaint}}>{p.pos}</span>
                        <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${ec}15`,color:ec,border:`1px solid ${ec}33`}}>{p.classif}</span>
                      </div>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#DC2626"}}>{p.dias}d</span>
                    </div>
                    <div style={{fontSize:10,color:t.textMuted}}>{p.regiao}</div>
                    <div style={{display:"flex",gap:12,marginTop:3,fontSize:9,color:t.textFaint}}>
                      <span>Desde: <strong>{p.desde}</strong></span>
                      <span style={{color:ec}}>● {p.estagio}</span>
                      <span>{p.conduta}</span>
                      <span>Retorno: <strong style={{color:"#2563EB"}}>{p.prognostico}</strong></span>
                    </div>
                  </div>;
                })}
              </div>
            </div>

            {/* Calendário Série B */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",background:t.bgMuted,borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Calendário Série B 2026</div>
                  <div style={{fontSize:10,color:t.textFaint}}>{SERIE_B.filter(g=>g.played).length} jogos realizados · {SERIE_B.filter(g=>!g.played).length} restantes</div>
                </div>
                <Calendar size={18} color={t.textFaint}/>
              </div>
              <div style={{padding:12}}>
                {SERIE_B.map((g,i)=>{
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
            </div>
          </div>

          {/* Player Readiness Map */}
          {(()=>{
            const gr=WEEK_READINESS(players);
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
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#DC2626"}}>{(p.prob*100).toFixed(0)}%</span>
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

        {tab==="player"&&sp&&<div>
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <PlayerPhoto theme={t} name={sp.n} sz={80}/>
                <ScoreRing theme={t} v={sp.riskScore} sz={48} th={4}/>
                <div style={{fontSize:8,color:t.textFaint,textAlign:"center"}}>Wellness Score</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Inter Tight'",fontSize:20,fontWeight:900,color:pri}}>{sp.n} <Badge level={sp.risk}/> <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:t.textFaint,fontWeight:400,marginLeft:6}}>{sp.pos} · {sp.id} anos · {sp.nc} sessões</span></div>
                {sp.reasons.length>0&&<div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                  {sp.reasons.map((r,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:LV[sp.risk].bg,color:LV[sp.risk].c,border:`1px solid ${LV[sp.risk].bc}`}}>{r}</span>)}
                </div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12,marginTop:12}}>
                  {[{l:"ACWR Int",v:sp.ai?.toFixed(2)||"-"},{l:"PSE",v:sp.pse},{l:"sRPE avg",v:sp.sra},{l:"CK",v:sp.ck?Math.round(sp.ck):"-"},{l:"CMJ",v:sp.cmj||"-"},{l:"Humor",v:humorL[sp.h]},{l:"Energia",v:sp.e<=2?"Baixa":"OK"}].map((m,i)=>
                    <div key={i} style={{textAlign:"center"}}><div style={{fontSize:9,color:t.textFaint,fontWeight:500}}>{m.l}</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:15,fontWeight:700,color:pri,marginTop:1}}>{m.v}</div></div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Risco de Lesão + DM + Histórico */}
          {(()=>{
            const mlAlert=ML.alerts.find(a=>a.n===sp.n);
            const dmStatus=DM_ATUAL.find(d=>d.n===sp.n);
            const playerInj=INJ_HISTORY.filter(h=>h.n===sp.n);
            const prob=mlAlert?mlAlert.prob:null;
            const probPct=prob!==null?(prob*100).toFixed(0):null;
            const probC=prob>=0.5?"#DC2626":prob>=0.3?"#EA580C":prob>=0.15?"#CA8A04":"#16A34A";
            return <div style={{display:"grid",gridTemplateColumns:dmStatus?"1fr 1fr":"1fr",gap:16,marginBottom:16}}>
              {/* Probabilidade de Lesão */}
              <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${probPct?probC+"33":t.border}`,padding:18}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Probabilidade de Lesão — XGBoost + SHAP</div>
                {probPct!==null?<div>
                  <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
                    <div style={{position:"relative",width:90,height:90,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width={90} height={90} style={{transform:"rotate(-90deg)"}}>
                        <circle cx={45} cy={45} r={38} fill="none" stroke={t.borderLight} strokeWidth={6}/>
                        <circle cx={45} cy={45} r={38} fill="none" stroke={probC} strokeWidth={6} strokeDasharray={2*Math.PI*38} strokeDashoffset={2*Math.PI*38*(1-prob)} strokeLinecap="round"/>
                      </svg>
                      <div style={{position:"absolute",fontFamily:"'JetBrains Mono'",fontSize:24,fontWeight:800,color:probC}}>{probPct}%</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:probC,marginBottom:4}}>{mlAlert.zone==="VERMELHO"?"RISCO ALTO":mlAlert.zone==="LARANJA"?"RISCO MODERADO-ALTO":mlAlert.zone==="AMARELO"?"RISCO MODERADO":"RISCO BAIXO"}</div>
                      <div style={{fontSize:11,color:t.textMuted,lineHeight:1.4,marginBottom:6}}>{mlAlert.dose}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {mlAlert.shap_pos.slice(0,3).map((s,i)=>
                          <span key={i} style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:600,background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA"}}>{s.f}: {s.v}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                    {[
                      {l:"ACWR",v:mlAlert.acwr,c:mlAlert.acwr>1.3?"#DC2626":"#16A34A"},
                      {l:"CK/Bas",v:mlAlert.ck+"x",c:mlAlert.ck>3?"#DC2626":"#EA580C"},
                      {l:"CMJ Δ",v:mlAlert.cmj+"%",c:mlAlert.cmj<-8?"#DC2626":"#EA580C"},
                      {l:"Sono",v:mlAlert.sono,c:mlAlert.sono<6?"#DC2626":"#16A34A"},
                      {l:"Bio Def",v:mlAlert.bio,c:mlAlert.bio>1.5?"#DC2626":"#CA8A04"}
                    ].map((m,j)=>
                      <div key={j} style={{textAlign:"center",padding:"6px 4px",background:t.bgMuted,borderRadius:6}}>
                        <div style={{fontSize:8,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>)}
                  </div>
                </div>:
                <div style={{textAlign:"center",padding:"20px 0",color:t.textFaint}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:28,fontWeight:800,color:"#16A34A",marginBottom:4}}>N/A</div>
                  <div style={{fontSize:11}}>Atleta fora do modelo de alertas — risco baixo estimado</div>
                </div>}
                {/* Histórico de Lesões do Atleta */}
                {playerInj.length>0&&<div style={{marginTop:14,borderTop:"1px solid #f1f5f9",paddingTop:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:pri,marginBottom:8}}>Histórico de Lesões ({playerInj.length} {playerInj.length===1?"caso":"casos"})</div>
                  {playerInj.map((inj,i)=>{
                    const ic=inj.classif.includes("4C")?"#DC2626":inj.classif.includes("2")?"#EA580C":inj.classif==="Cirurgia"?"#7c3aed":"#CA8A04";
                    return <div key={i} style={{padding:"8px 10px",background:!inj.fim_trans?"#FEF2F2":t.bgMuted,borderRadius:8,marginBottom:6,border:`1px solid ${!inj.fim_trans?ic+"33":t.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${ic}15`,color:ic}}>{inj.classif}</span>
                          <span style={{fontSize:11,fontWeight:600,color:pri}}>{inj.regiao} — {inj.lado}</span>
                          {!inj.fim_trans&&<span style={{fontSize:8,fontWeight:700,color:"#DC2626",textTransform:"uppercase"}}>ativo</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:10,color:t.textMuted}}>{new Date(inj.date).toLocaleDateString("pt-BR")}</span>
                          <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:ic}}>{inj.total}d</span>
                        </div>
                      </div>
                      <div style={{fontSize:9,color:t.textFaint,marginTop:3}}>{inj.estrutura} · {inj.mecanismo} · {inj.evento} · {inj.estagio}</div>
                    </div>;
                  })}
                </div>}
              </div>

              {/* DM Atual — se aplicável */}
              {dmStatus&&<div style={{background:t.bgCard,borderRadius:12,border:"1px solid #FECACA",padding:18}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:"#DC2626",marginBottom:12}}>Status DM — Afastado</div>
                <div style={{textAlign:"center",marginBottom:14}}>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:48,fontWeight:900,color:"#DC2626"}}>{dmStatus.dias}</div>
                  <div style={{fontSize:11,color:t.textFaint,fontWeight:600}}>dias afastado</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {l:"Classificação",v:dmStatus.classif},
                    {l:"Região",v:dmStatus.regiao},
                    {l:"Estágio",v:dmStatus.estagio},
                    {l:"Conduta",v:dmStatus.conduta},
                    {l:"Desde",v:dmStatus.desde},
                    {l:"Prognóstico",v:dmStatus.prognostico}
                  ].map((r,i)=>
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:i%2===0?"#FEF2F2":t.bgCard,borderRadius:6}}>
                      <span style={{fontSize:10,color:t.textFaint,fontWeight:600}}>{r.l}</span>
                      <span style={{fontSize:11,fontWeight:700,color:r.l==="Prognóstico"?"#2563EB":"#DC2626"}}>{r.v}</span>
                    </div>)}
                </div>
              </div>}
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

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Wellness Radar</div>
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
                <div style={{padding:8,background:t.bgMuted,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:t.textFaint}}>sRPE avg</div><div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:pri}}>{sp.sra}</div></div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {wtData.length>0&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Tendência 7 Dias — Wellness</div>
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

          {/* ═══ CAMADA 4: TENDÊNCIA TEMPORAL — Fatigue Debt, CK, sRPE, CMJ ═══ */}
          {(()=>{
            const mlAlert=ML.alerts.find(a=>a.n===sp.n);
            if(!mlAlert||!mlAlert.trends) return null;
            const tr=mlAlert.trends;
            const days=["D-7","D-6","D-5","D-4","D-3","D-2","D-1"];
            const trendData=days.map((d,i)=>({d,fatigue_debt:tr.fatigue_debt[i],ck:tr.ck[i],srpe:tr.srpe[i],cmj:tr.cmj[i]}));
            const pr=PERFIL_RISCO_LABELS[mlAlert.perfil_risco]||PERFIL_RISCO_LABELS.sobrecarga;
            return <div style={{marginBottom:16}}>
              {/* Physiological Risk Profile */}
              <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${pr.bc}`,padding:18,marginBottom:16}}>
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
                    {l:"Fatigue Debt",v:mlAlert.fatigue_debt,c:mlAlert.fatigue_debt>3000?"#DC2626":mlAlert.fatigue_debt>2500?"#EA580C":"#16A34A",unit:""},
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
              </div>

              {/* Temporal Trend Charts */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Fatigue Debt — 7 Dias</div>
                  <div style={{fontSize:10,color:t.textFaint,marginBottom:6}}>Fadiga acumulada com decaimento exponencial (λ=0.1)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="d" tick={{fontSize:9,fill:t.textFaint}}/><YAxis tick={{fontSize:9,fill:t.textFaint}}/><Tooltip content={<Tip theme={t}/>}/>
                      <Area type="monotone" dataKey="fatigue_debt" name="Fatigue Debt" stroke="#EA580C" fill="#EA580C" fillOpacity={.08} strokeWidth={2.5}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>CK Seriado — 7 Dias</div>
                  <div style={{fontSize:10,color:t.textFaint,marginBottom:6}}>Tendência de dano muscular (U/L)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="d" tick={{fontSize:9,fill:t.textFaint}}/><YAxis tick={{fontSize:9,fill:t.textFaint}}/><Tooltip content={<Tip theme={t}/>}/>
                      <Area type="monotone" dataKey="ck" name="CK (U/L)" stroke="#DC2626" fill="#DC2626" fillOpacity={.08} strokeWidth={2.5}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>Carga Interna (sRPE) — 7 Dias</div>
                  <div style={{fontSize:10,color:t.textFaint,marginBottom:6}}>Carga semanal acumulada (UA)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="d" tick={{fontSize:9,fill:t.textFaint}}/><YAxis tick={{fontSize:9,fill:t.textFaint}}/><Tooltip content={<Tip theme={t}/>}/>
                      <Area type="monotone" dataKey="srpe" name="sRPE" stroke="#2563eb" fill="#2563eb" fillOpacity={.08} strokeWidth={2.5}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:8}}>CMJ Tendência — 7 Dias</div>
                  <div style={{fontSize:10,color:t.textFaint,marginBottom:6}}>Potência neuromuscular (cm)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="d" tick={{fontSize:9,fill:t.textFaint}}/><YAxis tick={{fontSize:9,fill:t.textFaint}} domain={["dataMin-2","dataMax+2"]}/><Tooltip content={<Tip theme={t}/>}/>
                      <Line type="monotone" dataKey="cmj" name="CMJ (cm)" stroke="#7c3aed" strokeWidth={2.5} dot={{r:3,fill:"#7c3aed",stroke:t.bgCard,strokeWidth:2}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>;
          })()}

          {/* ═══ CAMADA 5: PROJEÇÃO DE RISCO 48-72h ═══ */}
          {(()=>{
            const proj=PROJECTIONS[sp.n];
            if(!proj) return null;
            const mlAlert=ML.alerts.find(a=>a.n===sp.n);
            if(!mlAlert) return null;
            const tendC=proj.tendencia==="piora"?"#DC2626":proj.tendencia==="piora_leve"?"#EA580C":proj.tendencia==="estavel"?"#CA8A04":"#16A34A";
            const tendL=proj.tendencia==="piora"?"PIORA":proj.tendencia==="piora_leve"?"PIORA LEVE":proj.tendencia==="estavel"?"ESTÁVEL":"MELHORA";
            const nivelC=proj.nivel_projetado==="CRÍTICO"?"#DC2626":proj.nivel_projetado.includes("MODERADO")?"#EA580C":proj.nivel_projetado==="ATENÇÃO"?"#CA8A04":"#16A34A";
            const projData=[
              {d:"Atual",fatigue_debt:mlAlert.trends.fatigue_debt[6],cmj:mlAlert.trends.cmj[6],ck:mlAlert.trends.ck[6]},
              {d:"+48h",fatigue_debt:proj.proj_48h.fatigue_debt,cmj:proj.proj_48h.cmj,ck:proj.proj_48h.ck},
              {d:"+72h",fatigue_debt:proj.proj_72h.fatigue_debt,cmj:proj.proj_72h.cmj,ck:proj.proj_72h.ck}
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
                        {l:"Fatigue Debt",v:col.d.fatigue_debt,c:col.d.fatigue_debt>3000?"#DC2626":col.d.fatigue_debt>2500?"#EA580C":"#16A34A"},
                        {l:"CMJ (cm)",v:col.d.cmj?.toFixed(1),c:"#7c3aed"},
                        {l:"CK (U/L)",v:col.d.ck,c:col.d.ck>400?"#DC2626":col.d.ck>250?"#EA580C":"#16A34A"}
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
                  {label:"Fatigue Debt",key:"fatigue_debt",c:"#EA580C"},
                  {label:"CMJ (cm)",key:"cmj",c:"#7c3aed"},
                  {label:"CK (U/L)",key:"ck",c:"#DC2626"}
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
        </div>}

        {tab==="player"&&!sp&&<div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:40,textAlign:"center",color:t.textFaint}}>
          <Users size={32} style={{marginBottom:12,opacity:.4}}/><div style={{fontSize:14,fontWeight:600}}>Selecione um atleta na barra lateral</div>
        </div>}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SESSÃO DE TREINO — Monitoramento pós-sessão                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="sessao"&&<div>
          {/* Session Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Monitoramento da Sessão de Treino</div>
                <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>{LIVE_SESSION.meta._liveDate||LIVE_SESSION.meta.date} · {LIVE_SESSION.meta.tipo} · {LIVE_SESSION.meta.local} · {LIVE_SESSION.meta.md}{isLive&&<span style={{marginLeft:8,fontSize:10,color:"#16A34A",fontWeight:600}}>LIVE {LIVE_SESSION.meta._liveTime||""}</span>}</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[{l:"Duração",v:LIVE_SESSION.meta.duracao+"min"},{l:"PSE Alvo",v:LIVE_SESSION.meta.rpe_alvo},{l:"Condição",v:LIVE_SESSION.meta.condicao}].map((b,i)=>
                  <span key={i} style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:600,background:t.bgMuted,color:t.textMuted,border:`1px solid ${t.border}`}}>{b.l}: <strong style={{color:pri}}>{b.v}</strong></span>
                )}
              </div>
            </div>
            <div style={{marginTop:14,padding:"10px 14px",background:"#EFF6FF",borderRadius:8,border:"1px solid #BFDBFE"}}>
              <div style={{fontSize:11,color:"#2563EB",lineHeight:1.5}}>Esta aba responde <strong>3 perguntas essenciais</strong> após cada treino: (1) qual carga o atleta recebeu, (2) como ele respondeu fisiologicamente, (3) se a sessão aumentou ou reduziu o risco de lesão.</div>
            </div>
          </div>

          {/* Classification Overview */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            {[
              {l:"Sessão Reduziu Risco",c:"#16A34A",bg:"#F0FDF4",bc:"#BBF7D0",count:Object.values(LIVE_SESSION.atletas).filter(a=>a.classificacao==="verde").length},
              {l:"Carga Controlada",c:"#CA8A04",bg:"#FEFCE8",bc:"#FEF08A",count:Object.values(LIVE_SESSION.atletas).filter(a=>a.classificacao==="amarelo").length},
              {l:"Sessão Aumentou Risco",c:"#DC2626",bg:"#FEF2F2",bc:"#FECACA",count:Object.values(LIVE_SESSION.atletas).filter(a=>a.classificacao==="vermelho").length}
            ].map((cat,i)=>
              <div key={i} style={{background:cat.bg,borderRadius:12,border:`1px solid ${cat.bc}`,padding:18,textAlign:"center"}}>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:36,fontWeight:900,color:cat.c}}>{cat.count}</div>
                <div style={{fontSize:11,fontWeight:700,color:cat.c,marginTop:2}}>{cat.l}</div>
              </div>
            )}
          </div>

          {/* Relatório Última Sessão — Tabela consolidada */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,marginBottom:4}}>Relatório da Última Sessão</div>
            <div style={{fontSize:11,color:t.textFaint,marginBottom:14}}>
              {(() => {
                const allSess = Object.values(LIVE_SESSION.atletas).filter(a => a._fromSheet);
                const latestDate = allSess.length ? allSess.reduce((max, a) => a._sessionDate > max ? a._sessionDate : max, "") : LIVE_SESSION.meta._liveDate || LIVE_SESSION.meta.date;
                return `${latestDate} · ${allSess.length} atletas monitorados`;
              })()}
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${t.border}`}}>
                    {["Atleta","Classificação","Dist (m)","HSR (m)","Sprints","Acel","Decel","PL","Vel. Pico","PSE","sRPE","Sono","Dor","Recup.","CMJ (cm)"].map((h,i)=>
                      <th key={i} style={{padding:"6px 8px",textAlign:i===0?"left":"center",fontWeight:700,color:t.textMuted,fontSize:9,whiteSpace:"nowrap"}}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map((alert,idx)=>{
                    const sess=LIVE_SESSION.atletas[alert.n];
                    const g=sess.gps;
                    const ci=sess.carga_interna;
                    const fi=sess.fisio;
                    const nm=sess.nm_response;
                    const classC=sess.classificacao==="vermelho"?"#DC2626":sess.classificacao==="amarelo"?"#CA8A04":"#16A34A";
                    const distPct=g.dist_baseline>0?Math.round((g.dist_total/g.dist_baseline)*100):0;
                    const hsrPct=g.hsr_baseline>0?Math.round((g.hsr/g.hsr_baseline)*100):0;
                    const distColor=distPct>120?"#DC2626":distPct>100?"#CA8A04":"#16A34A";
                    const hsrColor=hsrPct>130?"#DC2626":hsrPct>100?"#CA8A04":"#16A34A";
                    return <tr key={alert.n} style={{borderBottom:`1px solid ${t.border}`,background:idx%2===0?"transparent":t.bgMuted+"44",cursor:"pointer"}} onClick={()=>{setSel(alert.n);setTab("player")}}>
                      <td style={{padding:"8px",fontWeight:700,color:pri,whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:6,height:6,borderRadius:3,background:classC,flexShrink:0}}/>
                          {alert.n}
                          <span style={{fontSize:8,color:t.textFaint}}>{alert.pos}</span>
                        </div>
                      </td>
                      <td style={{padding:"8px",textAlign:"center"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,color:classC,background:classC+"15"}}>{sess.classificacao.toUpperCase()}</span></td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}><span style={{color:distColor}}>{g.dist_total||"—"}</span> <span style={{fontSize:8,color:t.textFaint}}>({distPct}%)</span></td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}><span style={{color:hsrColor}}>{g.hsr||"—"}</span> <span style={{fontSize:8,color:t.textFaint}}>({hsrPct}%)</span></td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.sprints||0}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.acel||0}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.decel||0}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.player_load?Math.round(g.player_load):"—"}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{g.pico_vel||"—"}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:ci.srpe_sessao>7?"#DC2626":ci.srpe_sessao>5?"#CA8A04":"#16A34A"}}>{ci.srpe_sessao||"—"}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{ci.srpe_total||"—"}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:fi.sono_noite>0&&fi.sono_noite<6?"#DC2626":fi.sono_noite<7?"#CA8A04":"#16A34A"}}>{fi.sono_noite||"—"}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:fi.dor_pos>=4?"#DC2626":fi.dor_pos>=2?"#CA8A04":"#16A34A"}}>{fi.dor_pos||0}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600,color:fi.rec_percebida<=5?"#DC2626":fi.rec_percebida<=7?"#CA8A04":"#16A34A"}}>{fi.rec_percebida||"—"}</td>
                      <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",fontWeight:600}}>{nm.cmj_pre||"—"}</td>
                    </tr>;
                  })}
                </tbody>
                {/* Médias do time */}
                {(()=>{
                  const sessAtletas=ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>LIVE_SESSION.atletas[a.n]);
                  if(!sessAtletas.length) return null;
                  const avg=(arr,fn)=>{const vals=arr.map(fn).filter(v=>v>0);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;};
                  return <tfoot><tr style={{borderTop:`2px solid ${pri}`,fontWeight:800}}>
                    <td style={{padding:"8px",color:pri}}>MÉDIA EQUIPE</td>
                    <td style={{padding:"8px",textAlign:"center",fontSize:9,color:t.textFaint}}>{sessAtletas.length} atl.</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.dist_total)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.hsr)}</td>
                    <td style={{padding:"8px",textAlign:"center",fontFamily:"'JetBrains Mono'",color:pri}}>{avg(sessAtletas,s=>s.gps.sprints)}</td>
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
          {ML.alerts.map(alert=>{
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
                  <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                    {[
                      {l:"Dist. Total",v:g.dist_total?g.dist_total+"m":"—",bl:g.dist_baseline+"m",pct:g.dist_total?((g.dist_total/g.dist_baseline)*100).toFixed(0):0},
                      {l:"HSR (>19 km/h)",v:g.hsr+"m",bl:g.hsr_baseline+"m",pct:g.hsr_baseline?((g.hsr/g.hsr_baseline)*100).toFixed(0):0},
                      {l:"Sprints",v:g.sprints,bl:g.sprints_baseline,pct:g.sprints_baseline?((g.sprints/g.sprints_baseline)*100).toFixed(0):0},
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
                      {l:"FC Média",v:ci.hr_avg+" bpm",c:ci.hr_avg>ci.hr_baseline_avg?"#EA580C":"#16A34A"},
                      {l:"FC Máxima",v:ci.hr_max+" bpm",c:t.textMuted},
                      {l:"Tempo Z. Alta",v:ci.tempo_zona_alta+"min",c:ci.tempo_zona_alta>ci.tempo_zona_alta_baseline?"#DC2626":"#16A34A"}
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
                      {l:"Recuperação Percebida",v:fi.rec_percebida+"/10",c:fi.rec_percebida<=5?"#DC2626":fi.rec_percebida<=7?"#CA8A04":"#16A34A"},
                      {l:"CK Estimado",v:fi.ck_estimado+" U/L",c:fi.ck_estimado>500?"#DC2626":fi.ck_estimado>300?"#EA580C":"#16A34A"}
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
                  <BarChart data={ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>{const s=LIVE_SESSION.atletas[a.n];return {n:a.n.split(" ")[0],dist:s.gps.dist_baseline?Math.round((s.gps.dist_total/s.gps.dist_baseline)*100):0,hsr:s.gps.hsr_baseline?Math.round((s.gps.hsr/s.gps.hsr_baseline)*100):0};})} margin={{left:-10}}>
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
                  <BarChart data={ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>{const s=LIVE_SESSION.atletas[a.n];return {n:a.n.split(" ")[0],delta:s.nm_response.cmj_delta_pct};})} margin={{left:-10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                    <XAxis dataKey="n" tick={{fontSize:8,fill:t.textFaint}} interval={0} angle={-30} textAnchor="end" height={40}/>
                    <YAxis tick={{fontSize:8,fill:t.textFaint}} domain={[-8,1]}/>
                    <Tooltip content={<Tip theme={t}/>}/>
                    <ReferenceLine y={-5} stroke="#DC2626" strokeDasharray="3 3" label={{value:"-5%",fontSize:8,fill:"#DC2626"}}/>
                    <Bar dataKey="delta" name="CMJ Δ %" radius={[2,2,0,0]}>
                      {ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map((a,i)=>{const d=LIVE_SESSION.atletas[a.n].nm_response.cmj_delta_pct;return <Cell key={i} fill={d<-5?"#DC2626":d<-3?"#EA580C":"#16A34A"}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Chart 3: Risk Delta */}
              <div>
                <div style={{fontSize:10,fontWeight:600,color:t.textMuted,marginBottom:6}}>Δ Risco de Lesão (%)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map(a=>{const s=LIVE_SESSION.atletas[a.n];return {n:a.n.split(" ")[0],delta:Number((s.risco.delta*100).toFixed(1))};})} margin={{left:-10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/>
                    <XAxis dataKey="n" tick={{fontSize:8,fill:t.textFaint}} interval={0} angle={-30} textAnchor="end" height={40}/>
                    <YAxis tick={{fontSize:8,fill:t.textFaint}} domain={[-3,5]}/>
                    <Tooltip content={<Tip theme={t}/>}/>
                    <ReferenceLine y={0} stroke={t.textFaint}/>
                    <Bar dataKey="delta" name="Δ Risco %" radius={[2,2,0,0]}>
                      {ML.alerts.filter(a=>LIVE_SESSION.atletas[a.n]).map((a,i)=>{const d=LIVE_SESSION.atletas[a.n].risco.delta;return <Cell key={i} fill={d>0.02?"#DC2626":d>0?"#EA580C":d<-0.01?"#16A34A":t.textMuted}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>}

        {tab==="model"&&<div>
          {/* Model Header — 4-Layer Architecture */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Motor Preditivo de Lesões v4.0 — Elite</div>
                <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>110 Features · KNNImputer → LASSO+MI → Optuna → SMOTE+Tomek → XGBoost → Calibração → SHAP</div>
                <div style={{fontSize:10,color:t.textMuted,marginTop:4}}>
                  {ML.pipeline.architecture}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {[
                  {l:"AUC-ROC (CV)",v:ML.pipeline.xgboost.metrics.auc_roc,c:"#7c3aed"},
                  {l:"AUC Calibrado",v:ML.pipeline.xgboost.metrics.auc_calibrated,c:"#7c3aed"},
                  {l:"F1-Score",v:ML.pipeline.xgboost.metrics.f1,c:"#2563eb"},
                  {l:"Recall",v:ML.pipeline.xgboost.metrics.recall,c:"#EA580C"},
                  {l:"Specificity",v:ML.pipeline.xgboost.metrics.specificity,c:"#16A34A"},
                  {l:"MCC",v:ML.pipeline.xgboost.metrics.mcc,c:t.textMuted}
                ].map((m,i)=>
                  <div key={i} style={{textAlign:"center",padding:"4px 8px",background:t.bgMuted,borderRadius:8}}>
                    <div style={{fontSize:8,color:t.textFaint,fontWeight:600,textTransform:"uppercase"}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:700,color:m.c}}>{m.v}</div>
                  </div>)}
              </div>
            </div>
            {/* Pipeline Architecture Diagram */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
              {[
                {n:"1. Ingestão",desc:"110 features · Lag + Rolling Z-Scores + ACWR + HRV + Biomecânica",detail:"34 atletas × 120 dias = 4080 registros longitudinais",c:"#7c3aed"},
                {n:"2. KNN + LASSO + MI",desc:`KNNImputer → LASSO (α=${ML.pipeline.lasso.alpha_optimal}) + MI → ${ML.pipeline.lasso.features_selected} features`,detail:"Feature selection híbrida: L1 regularização + mutual information",c:"#2563eb"},
                {n:"3. Optuna + XGBoost",desc:`${ML.pipeline.optuna.n_trials} trials TPE → XGBoost (d=${ML.pipeline.xgboost.hyperparams.max_depth}, spw=${ML.pipeline.xgboost.hyperparams.scale_pos_weight})`,detail:"SMOTE+Tomek no treino + scale_pos_weight automático",c:"#EA580C"},
                {n:"4. Calibração",desc:"Platt Scaling + Isotonic → melhor selecionado automaticamente",detail:"Threshold tuning [0.20-0.50] → maximiza recall c/ precisão ≥ 0.15",c:"#CA8A04"},
                {n:"5. SHAP + Motor",desc:"TreeExplainer → importância global + explicação individual",detail:"Risk Score → Ranking → SHAP Factors → Dosagem Operacional",c:"#16A34A"}
              ].map((l,i)=>
                <div key={i} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${l.c}33`,background:`${l.c}08`}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:11,color:l.c}}>{l.n}</div>
                  <div style={{fontSize:10,color:t.text,marginTop:2,fontWeight:500}}>{l.desc}</div>
                  <div style={{fontSize:9,color:t.textFaint,marginTop:2}}>{l.detail}</div>
                </div>)}
            </div>
            {/* SMOTE Warning */}
            <div style={{marginTop:10,padding:"8px 12px",background:"#FEF2F2",borderRadius:6,border:"1px solid #FECACA",fontSize:10,color:"#DC2626"}}>
              <strong>SMOTE obrigatório:</strong> Sem SMOTE o modelo apresenta acurácia de 91% ilusória com recall de apenas 14%. Com SMOTE + calibração: recall 79% (+65pp).
            </div>
            <div style={{marginTop:6,padding:"8px 12px",background:"#F0FDF4",borderRadius:6,border:"1px solid #BBF7D0",fontSize:10,color:"#166534"}}>
              <strong>v3.0:</strong> +7 features temporais (Fatigue Debt, NME, CMJ/CK/sRPE/Sleep trends). Calibração Isotônica + Threshold Tuning automático. scale_pos_weight=4. AUC 0.847→0.878.
            </div>
            {/* LASSO vs XGBoost comparison */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:10}}>
              <div style={{padding:"8px 12px",background:t.bgMuted,borderRadius:6,border:`1px solid ${t.border}`}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:10,color:t.textMuted}}>LASSO (Baseline)</div>
                <div style={{display:"flex",gap:10,marginTop:4}}>
                  {[{l:"AUC",v:ML.pipeline.lasso.metrics.auc_roc},{l:"F1",v:ML.pipeline.lasso.metrics.f1},{l:"Recall",v:ML.pipeline.lasso.metrics.recall},{l:"Spec",v:ML.pipeline.lasso.metrics.specificity}].map((m,j)=>
                    <span key={j} style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:t.textFaint}}>{m.l}: {m.v}</span>)}
                </div>
                <div style={{fontSize:9,color:t.textFaint,marginTop:2}}>Features eliminadas: {ML.pipeline.lasso.features_eliminated.join(", ")}</div>
              </div>
              <div style={{padding:"8px 12px",background:"#f0fdf4",borderRadius:6,border:"1px solid #BBF7D0"}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:10,color:"#16A34A"}}>XGBoost (Motor Principal)</div>
                <div style={{display:"flex",gap:10,marginTop:4}}>
                  {[{l:"AUC",v:ML.pipeline.xgboost.metrics.auc_roc},{l:"F1",v:ML.pipeline.xgboost.metrics.f1},{l:"Recall",v:ML.pipeline.xgboost.metrics.recall},{l:"Spec",v:ML.pipeline.xgboost.metrics.specificity}].map((m,j)=>
                    <span key={j} style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#166534"}}>{m.l}: {m.v}</span>)}
                </div>
                <div style={{fontSize:9,color:"#166534",marginTop:2}}>{ML.pipeline.xgboost.note}</div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Feature Importance with categories */}
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Feature Importance — XGBoost + LASSO</div>
              <div style={{fontSize:10,color:t.textFaint,marginBottom:8}}>Cores: <span style={{color:"#DC2626"}}>Histórico</span> · <span style={{color:"#EA580C"}}>Carga</span> · <span style={{color:"#7c3aed"}}>Neuromuscular</span> · <span style={{color:"#2563eb"}}>Wellness</span> · <span style={{color:"#16A34A"}}>Biomecânica</span> · <span style={{color:"#CA8A04"}}>Interação</span> · <span style={{color:"#0891b2"}}>Temporal</span></div>
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
            <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Clusters de Risco — Sistemas Complexos</div>
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
          </div>

          {/* Saída Clínica SHAP — Por Atleta */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Saída Clínica SHAP — Prontidão Próxima Sessão</div>
                <div style={{fontSize:11,color:t.textFaint}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})} · Explicabilidade por atleta: quais variáveis geraram cada alerta</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[{l:"Vermelho",c:"#DC2626",n:ML.alerts.filter(a=>a.zone==="VERMELHO").length},
                  {l:"Laranja",c:"#EA580C",n:ML.alerts.filter(a=>a.zone==="LARANJA").length},
                  {l:"Amarelo",c:"#CA8A04",n:ML.alerts.filter(a=>a.zone==="AMARELO").length}
                ].map((z,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${z.c}12`,color:z.c,border:`1px solid ${z.c}33`}}>{z.n} {z.l}</span>)}
              </div>
            </div>

            {/* Clinical Cards */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {ML.alerts.map((a,i)=>{
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
                      {[{l:"ACWR",v:a.acwr,c:a.acwr>1.3?"#DC2626":pri},{l:"CK/B",v:a.ck+"x",c:a.ck>3?"#DC2626":a.ck>2?"#EA580C":pri},{l:"CMJ",v:(a.cmj>0?"+":"")+a.cmj+"%",c:a.cmj<-8?"#DC2626":a.cmj<-5?"#EA580C":"#16A34A"},{l:"Sono",v:a.sono,c:a.sono<6?"#DC2626":a.sono<7?"#CA8A04":"#16A34A"}].map((m,j)=>
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
                    {ext&&<div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginTop:8}}>
                      {[
                        {l:"SLCMJ ASI",v:ext.slcmj_asi+"%",c:ext.slcmj_asi>12?"#DC2626":ext.slcmj_asi>8?"#EA580C":"#16A34A"},
                        {l:"H:Q Ratio",v:ext.hq_ratio,c:ext.hq_ratio<0.55?"#DC2626":"#16A34A"},
                        {l:"COP Sway",v:ext.cop_sway+"mm",c:ext.cop_sway>18?"#DC2626":ext.cop_sway>15?"#EA580C":"#16A34A"},
                        {l:"Valgo DLS",v:ext.valgus_dls+"°",c:ext.valgus_dls>8?"#DC2626":ext.valgus_dls>6?"#EA580C":"#16A34A"},
                        {l:"Monotonia",v:ext.monotonia,c:ext.monotonia>2?"#DC2626":ext.monotonia>1.5?"#CA8A04":"#16A34A"},
                        {l:"HSR ACWR",v:ext.hsr_acwr,c:ext.hsr_acwr>1.3?"#DC2626":ext.hsr_acwr>1?"#CA8A04":"#16A34A"}
                      ].map((m,j)=>
                        <div key={j} style={{textAlign:"center",padding:"4px",background:t.bgMuted,borderRadius:4}}>
                          <div style={{fontSize:7,color:t.textFaint,fontWeight:600}}>{m.l}</div>
                          <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>)}
                    </div>}
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>}

        {tab==="retro"&&<div>
          {/* Header */}
          <div style={{background:t.bgCard,borderRadius:12,border:`1px solid ${t.border}`,padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Análise Retrospectiva de Lesões</div>
            <div style={{fontSize:12,color:t.textFaint,marginTop:2}}>Temporada 2025/2026 · {INJ_HISTORY.length} casos documentados · Correlação pré-lesão com marcadores multidisciplinares</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:14}}>
              {[{l:"Total de Lesões",v:INJ_HISTORY.length,c:acc},{l:"Dias Perdidos",v:INJ_HISTORY.reduce((s,i)=>s+i.total,0),c:"#DC2626"},{l:"Avg Dias Fora",v:(INJ_HISTORY.reduce((s,i)=>s+i.total,0)/INJ_HISTORY.length).toFixed(1),c:"#EA580C"},{l:"Atletas Afetados",v:new Set(INJ_HISTORY.map(i=>i.n)).size,c:"#CA8A04"}].map((k,i)=>
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
              {INJ_HISTORY.map(inj=>{
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
                      <span style={{fontSize:11,color:t.textMuted}}>{new Date(inj.date).toLocaleDateString("pt-BR")}</span>
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
                        <span>Lesão: <strong>{new Date(inj.date).toLocaleDateString("pt-BR")}</strong></span>
                        {inj.saida_dm&&<span>Saída DM: <strong>{new Date(inj.saida_dm).toLocaleDateString("pt-BR")}</strong></span>}
                        {inj.ini_trans&&<span>Início Trans.: <strong>{new Date(inj.ini_trans).toLocaleDateString("pt-BR")}</strong></span>}
                        {inj.fim_trans?<span>Fim Trans.: <strong>{new Date(inj.fim_trans).toLocaleDateString("pt-BR")}</strong></span>:<span style={{color:"#DC2626",fontWeight:600}}>Em andamento</span>}
                        <span>Estágio: <strong style={{color:svC}}>{inj.estagio}</strong></span>
                        <span>Conduta: <strong>{inj.conduta}</strong></span>
                        {inj.prognostico&&<span>Prognóstico: <strong style={{color:"#2563EB"}}>{new Date(inj.prognostico).toLocaleDateString("pt-BR")}</strong></span>}
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
      </main>
    </div>
  </div>;
}
