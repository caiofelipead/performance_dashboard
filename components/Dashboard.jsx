import { useState, useMemo } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Cell, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Heart, Zap, Shield, Users, Eye, Brain, Target, Calendar } from "lucide-react";

const P=[{n:"ADRIANO",pos:"GOL",h:5,e:4,rg:7,rp:6,d:2,sq:7,rpa:7,da:1.6,sa:7.3,nw:39,pse:3,sra:331,w:82.7,alt:185,bf:12.4,mm:38.2,imc:24.2,nc:60,ai:1.24,cmj:49.6,ct:[54.2,50.3,48.5,51.4,52,52.2,52.6,49.6],wt:{dt:["02","03","07","09","10","11","12"],s:[10,8,7,7,8,7,7],r:[8,6,6,8,8,7,6],dr:[1,1,1,1,2,1,2]}},{n:"BRENNO",pos:"GOL",h:4,e:4,rg:8,rp:8,d:3,sq:7,rpa:7.3,da:1.3,sa:7.3,nw:50,pse:4,sra:310,w:90.8,alt:191,bf:13.8,mm:41.5,imc:24.9,nc:75,ai:1.17,cmj:44.6,ct:[45,47.8,49.3,48,47.6,49.3,46.2,44.6],wt:{dt:["04","05","06","07","09","10","11"],s:[7,7,7,6,10,8,7],r:[7,7,8,5,8,7,8],dr:[0,0,0,0,0,2,3]}},{n:"CARLOS EDUARDO",pos:"ZAG",h:5,e:3,rg:8,rp:8,d:2,sq:8,rpa:7.9,da:1,sa:9.2,nw:57,pse:3,sra:391,w:85.9,alt:187,bf:11.9,mm:39.8,imc:24.6,ck:973,nc:75,ai:1.07,cmj:46.7,ckm:973,ct:[49.1,44,47.1,44.5,48.8,46.5,52.6,46.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,9,8,8,9,10,8],r:[9,5,6,9,8,6,8],dr:[1,1,0,0,0,2,2]}},{n:"DARLAN",pos:"ZAG",h:4,e:3,rg:9,rp:8,d:0,sq:8,rpa:7.8,da:.7,sa:7.8,nw:17,pse:5,sra:317,w:80.2,alt:178,bf:10.5,mm:37.1,imc:25.3,nc:20,ai:.95,cmj:31.1,ct:[31.1]},{n:"ERICSON",pos:"ZAG",h:5,e:3,rg:10,rp:9,d:3,sq:9,rpa:6.7,da:1.1,sa:8.8,nw:51,pse:0,sra:431,w:91.6,alt:190,bf:13.2,mm:42.0,imc:25.4,ck:562,nc:75,ai:.64,cmj:43.1,ckm:916,ct:[44.3,47.4,42.4,47.1,50.9,50.9,55.5,43.1],wt:{dt:["26","27","28","02","03","04","06"],s:[9,9,9,7,9,8,9],r:[6,6,5,8,7,9,9],dr:[1,1,1,1,4,3,3]}},{n:"ERIK",pos:"LAT",h:5,e:4,rg:7,rp:7,d:0,sq:9,rpa:7.2,da:.2,sa:9.3,nw:22,pse:6,sra:308,w:75.5,alt:176,bf:9.8,mm:35.4,imc:24.4,nc:59,ai:1.97,ct:[54.1,52.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,8,8,10,10,9],r:[7,8,7,10,7,7,7],dr:[0,0,0,0,0,0,0]}},{n:"FELIPINHO",pos:"MEI",h:5,e:3,rg:7,rp:7,d:0,sq:7,rpa:6.8,da:0,sa:7.5,nw:16,pse:7,sra:347,w:78,alt:179,bf:11.2,mm:36.0,imc:24.3,nc:27,ai:.85,cmj:38.9,ct:[44.5,38.9]},{n:"GABRIEL INOCENCIO",pos:"LAT",h:4,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.8,da:.4,sa:7.2,nw:58,pse:3,sra:407,w:78.5,alt:177,bf:10.8,mm:36.5,imc:25.1,ck:533,nc:75,ai:.97,cmj:48.2,ckm:916,ct:[48.2,52.3,45.3,48.9,53.6,49.3,50.8,48.2],wt:{dt:["04","05","06","09","10","11","12"],s:[8,9,8,8,7,7,8],r:[7,7,7,8,8,8,8],dr:[1,2,7,2,2,2,1]}},{n:"GUI MARIANO",pos:"ZAG",h:5,e:4,rg:8,rp:8,d:4,sq:8,rpa:7.6,da:.3,sa:8.2,nw:59,pse:7,sra:476,w:89.7,alt:189,bf:12.7,mm:41.0,imc:25.1,nc:75,ai:1.1,cmj:53.1,ct:[52.4,52.2,52,55.1,47.5,53.7,53.5,53.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,9,9,8,8],r:[7,7,5,10,8,6,8],dr:[0,0,0,0,0,0,4]}},{n:"GUILHERME QUEIROZ",pos:"ATA",h:5,e:3,rg:7,rp:7,d:2,sq:8,rpa:7.3,da:1.5,sa:6.9,nw:56,pse:6,sra:369,w:87.9,alt:188,bf:13.1,mm:40.2,imc:24.9,ck:493,nc:75,ai:1.14,cmj:46,ckm:493,ct:[43.3,43.3,46.2,47.4,44.7,48.3,48,46],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,7,7,5,8],r:[10,7,6,8,6,7,7],dr:[0,0,1,0,1,1,2]}},{n:"GUSTAVO VILAR",pos:"ZAG",h:5,e:3,rg:6,rp:6,d:0,sq:7,rpa:6.5,da:.2,sa:7.7,nw:55,pse:5,sra:410,w:86.4,alt:183,bf:12.9,mm:39.5,imc:25.8,ck:658,nc:75,ai:1.07,cmj:43.5,ckm:1113,ct:[43.3,42.9,47.9,42.8,43.1,44,44.8,43.5]},{n:"HEBERT",pos:"ZAG",h:5,e:3,rg:8,rp:7,d:0,sq:7,rpa:6.7,da:.1,sa:7.7,nw:46,pse:5,sra:366,w:88.1,alt:186,bf:12.5,mm:40.8,imc:25.5,nc:59,ai:1.04,cmj:46.9,ct:[50.1,49.8,50,52.5,48.6,51.2,53.3,46.9]},{n:"HENRIQUE TELES",pos:"LAT",h:5,e:4,rg:8,rp:8,d:2,sq:8,rpa:7,da:1.4,sa:7.7,nw:54,pse:6,sra:415,w:80.1,alt:180,bf:11.3,mm:37.2,imc:24.7,ck:415,nc:69,ai:1.14,cmj:45.5,ckm:415,ct:[53.1,55.5,49.8,54.9,51.6,50.8,55.1,45.5],wt:{dt:["04","05","07","09","10","11","12"],s:[8,9,6,9,8,9,8],r:[6,8,6,10,8,9,8],dr:[2,1,7,5,3,3,2]}},{n:"HYGOR",pos:"ATA",h:5,e:4,rg:10,rp:8,d:2,sq:7,rpa:8.8,da:1.6,sa:9.2,nw:57,pse:4,sra:387,w:83.3,alt:182,bf:11.6,mm:38.6,imc:25.2,ck:749,nc:75,ai:1.12,cmj:42.1,ckm:1034,ct:[40.8,44.5,39.9,44.2,43.5,42.4,41.9,42.1],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,10,10,10,10,7],r:[10,6,8,10,8,8,8],dr:[0,2,0,0,0,3,2]}},{n:"JEFFERSON NEM",pos:"ATA",h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:7.1,da:.8,sa:7.9,nw:57,pse:7,sra:423,w:72.5,alt:174,bf:10.1,mm:33.8,imc:23.9,ck:985,nc:75,ai:.97,cmj:47.5,ckm:3539,ct:[44,48.2,44.5,50.4,50,44.1,47.2,47.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,7],r:[7,6,7,8,8,7,7],dr:[0,0,0,0,0,0,2]}},{n:"JONATHAN",pos:"LD",h:5,e:4,rg:5,rp:5,d:4,sq:7,rpa:5.8,da:2.9,sa:5.9,nw:51,pse:4,sra:333,w:73.7,alt:175,bf:10.9,mm:34.3,imc:24.1,ck:981,nc:75,ai:1.14,cmj:42.8,ckm:1372,ct:[46.4,46.8,46.9,37.3,45,44.7,45,42.8],wt:{dt:["04","05","07","09","10","11","12"],s:[5,7,6,6,6,6,7],r:[6,7,4,7,5,6,5],dr:[3,3,3,2,3,3,4]}},{n:"JORDAN",pos:"GOL",h:5,e:3,rg:7,rp:7,d:0,sq:9,rpa:8,da:.7,sa:8,nw:60,pse:4,sra:418,w:92.2,alt:192,bf:12.0,mm:42.8,imc:25.0,nc:75,ai:1.1,cmj:54.1,ct:[52.2,53.4,53.4,53.2,54.5,56,55.7,54.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,9],r:[8,8,6,8,8,7,7],dr:[1,0,0,0,0,0,0]}},{n:"KELVIN",pos:"EXT",h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:6.9,da:3,sa:7.4,nw:49,pse:3,sra:288,w:74.6,alt:177,bf:10.3,mm:34.8,imc:23.8,ck:207,nc:67,ai:.86,cmj:38.4,ckm:375,ct:[40.4,38.3,40.8,40.2,40.6,39.5,42.3,38.4],wt:{dt:["04","05","06","09","10","11","12"],s:[7,9,8,9,9,8,7],r:[7,7,7,10,10,9,7],dr:[3,3,3,0,0,2,2]}},{n:"LEANDRO MACIEL",pos:"MEI",h:4,e:3,rg:8,rp:8,d:0,sq:9,rpa:7.7,da:.5,sa:8.6,nw:57,pse:4,sra:399,w:91.3,alt:188,bf:13.5,mm:41.6,imc:25.8,ck:349,nc:75,ai:1.08,cmj:43.8,ckm:510,ct:[41.7,47.4,40.5,46.2,47.8,44.3,50.4,43.8],wt:{dt:["05","06","07","09","10","11","12"],s:[8,7,9,8,8,8,9],r:[8,7,8,8,7,7,8],dr:[0,1,0,0,0,1,0]}},{n:"MARANHAO",pos:"EXT",h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:6.9,da:1,sa:6.8,nw:58,pse:4,sra:339,w:75.1,alt:176,bf:11.0,mm:34.9,imc:24.2,ck:274,nc:75,ai:.95,cmj:42.2,ckm:419,ct:[45.2,45.2,44.4,48.8,44.9,43.8,54.1,42.2],wt:{dt:["05","06","07","09","10","11","12"],s:[7,5,6,7,7,7,7],r:[7,6,5,7,7,7,7],dr:[1,1,1,1,1,1,1]}},{n:"MARQUINHO JR.",pos:"ATA",h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.4,da:0,sa:8.1,nw:58,pse:5,sra:360,w:64.9,alt:170,bf:9.2,mm:30.8,imc:22.5,ck:511,nc:75,ai:1.17,cmj:41.3,ckm:511,ct:[44.4,45.7,42.6,46.7,43.1,42.5,47.6,41.3]},{n:"MATHEUS SALES",pos:"MEI",h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:7.2,da:.6,sa:6.8,nw:58,pse:7,sra:454,w:80.1,alt:180,bf:11.7,mm:37.0,imc:24.7,ck:558,nc:75,ai:1.06,cmj:44.3,ckm:558,ct:[47.4,47.9,46.1,47.3,44.3,49.1,49.8,44.3],wt:{dt:["05","06","07","09","10","11","12"],s:[6,4,8,7,7,5,7],r:[7,4,5,8,8,7,7],dr:[1,2,1,0,1,2,1]}},{n:"MORELLI",pos:"MEI",h:5,e:3,rg:6,rp:7,d:0,sq:8,rpa:7,da:.5,sa:7.4,nw:56,pse:3,sra:356,w:82.4,alt:183,bf:12.1,mm:38.0,imc:24.6,ck:298,nc:75,ai:1.07,cmj:43.8,ckm:621,ct:[46,50.6,44.9,44.8,43.8,38.1,46.6,43.8]},{n:"PATRICK BREY",pos:"EXT",h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.9,da:2,sa:7.3,nw:33,pse:3,sra:385,w:73.5,alt:175,bf:10.0,mm:34.5,imc:24.0,ck:347,nc:63,ai:1.3,ct:[43.2,42.6,42.3,41.9,41,45.8,42.8,45.1],wt:{dt:["05","06","07","09","10","11","12"],s:[4,7,2,9,8,7,8],r:[4,5,3,9,8,7,8],dr:[3,2,4,0,0,3,1]}},{n:"PEDRINHO",pos:"LD",h:5,e:3,rg:8,rp:8,d:0,sq:10,rpa:7.3,da:.4,sa:9.9,nw:44,pse:6,sra:343,w:67.5,alt:172,bf:9.5,mm:31.9,imc:22.8,nc:52,ai:1.02,cmj:45.5,ct:[41.6,42.6,38.6,42.9,44.9,40.1,44,45.5]},{n:"PEDRO TORTELLO",pos:"VOL",h:5,e:3,rg:7,rp:7,d:0,sq:10,rpa:8.4,da:.3,sa:9.2,nw:56,pse:4,sra:381,w:75.1,alt:178,bf:10.6,mm:35.0,imc:23.7,nc:75,ai:1.14,cmj:41,ct:[40.6,47.6,41.3,43.7,39.2,41.6,44,41]},{n:"RAFAEL GAVA",pos:"MEI",h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:6.2,da:1,sa:5.8,nw:55,pse:7,sra:364,w:78.3,alt:179,bf:11.4,mm:36.3,imc:24.4,ck:303,nc:75,ai:1.1,ckm:2969,ct:[36.2,38.9,33.8,33.6,39.2,35.3,36.7,38.7],wt:{dt:["05","06","07","09","10","11","12"],s:[4,4,6,4,5,6,8],r:[5,5,6,4,7,7,7],dr:[1,1,1,0,0,0,0]}},{n:"THALLES",pos:"MEI",h:5,e:4,rg:10,rp:10,d:2,sq:7,rpa:5.7,da:.5,sa:7.4,dpo:1,nw:60,pse:3,sra:409,w:83.9,alt:184,bf:12.2,mm:38.7,imc:24.8,ck:1865,nc:75,ai:1.19,cmj:43.3,ckm:1865,ct:[46.4,44.1,44,45.1,43,47.4,44.9,43.3],wt:{dt:["04","05","06","07","09","11","12"],s:[7,7,10,6,7,8,7],r:[5,5,7,4,7,10,10],dr:[3,0,0,3,3,3,2]}},{n:"VICTOR SOUZA",pos:"GOL",h:4,e:3,rg:7,rp:7,d:0,sq:6,rpa:7.2,da:.5,sa:6.1,nw:57,pse:3,sra:473,w:92.8,alt:193,bf:14.1,mm:42.2,imc:24.9,nc:75,ai:1.04,cmj:46.9,ct:[55.4,56.5,60.9,57.9,58.7,53.2,59.5,46.9]},{n:"WALLACE",pos:"ZAG",h:4,e:3,rg:7,rp:7,d:0,sq:8,rpa:6.7,da:.8,sa:7.8,nw:47,pse:5,sra:305,w:91.6,alt:186,bf:14.0,mm:41.3,imc:26.5,nc:75,ai:.98,cmj:40.8,ct:[43.6,38.3,40.3,39.4,40.8],wt:{dt:["04","05","06","09","10","11","12"],s:[8,8,8,8,8,8,8],r:[7,8,5,8,7,7,7],dr:[2,2,2,0,2,2,0]}},{n:"WHALACY",pos:"EXT",h:5,e:3,rg:6,rp:6,d:0,sq:9,rpa:6,da:.1,sa:8.8,nw:21,pse:5,sra:277,w:72.3,alt:174,bf:10.2,mm:33.9,imc:23.9,nc:34,ai:1.05,cmj:42.8,ct:[42.3,39.7,41.3,40.5,42.4,42.9,42.8]},{n:"YURI",pos:"VOL",h:4,e:4,rg:8,rp:8,d:0,sq:8,rpa:7.9,da:0,sa:8.1,nw:49,pse:6,sra:320,w:66.4,alt:169,bf:9.0,mm:31.5,imc:23.2,nc:69,ai:1.16,cmj:41.5,ct:[40.8,44.9,43.8,43.2,42.8,42.9,43.5,41.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,8,8,8],r:[9,8,7,8,7,8,8],dr:[0,0,0,0,0,0,0]}}];

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
    preprocessing:{
      smote:{applied:true,original_ratio:"7:27 (20.6% positivos)",resampled_ratio:"24:27 (47.1%)",k_neighbors:3,note:"SMOTE obrigatório — sem ele: acurácia 91% ilusória com recall 14%"},
      scaling:"StandardScaler (z-score) — exceto variáveis binárias",
      missing:"KNN Imputer (k=5) para CK ausente em 6 atletas",
      validation:{primary:"Stratified 5-Fold CV",secondary:"LOOCV (n=34, robustez)",note:"k-fold estratificado preserva proporção lesão/não-lesão em cada fold"}
    },
    lasso:{
      role:"Baseline + Feature Selection (L1 regularization)",
      alpha_optimal:0.023,
      features_selected:11,
      features_eliminated:["PL Acum. 3d","Wellness Comp.","IMC","BF% pontual"],
      metrics:{auc_roc:0.781,f1:0.42,recall:0.57,specificity:0.83,precision:0.33}
    },
    xgboost:{
      role:"Motor Principal — captura interações não-lineares",
      hyperparams:{max_depth:4,n_estimators:200,learning_rate:0.05,min_child_weight:3,subsample:0.8,colsample_bytree:0.8,scale_pos_weight:3.8},
      metrics:{auc_roc:0.847,auc_pr:0.412,f1:0.61,recall:0.71,specificity:0.89,precision:0.53,mcc:0.54},
      note:"AUC-ROC sem SMOTE: 0.62 → com SMOTE: 0.847 (+36%)"
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
    {f:"Tendência Dor 3d",v:0.0356,cat:"wellness",lasso_coef:0.28,dir:"+",desc:"Dor progressiva (slope 3d) > pontual. Sinaliza falha adaptativa."}
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
    {n:"ERIK",pos:"LAT",prob:0.72,zone:"VERMELHO",
      dose:"EXCLUIR da sessão. Apenas fisioterapia preventiva.",
      acwr:1.97,ck:2.1,cmj:-5.4,sono:6.2,bio:1.8,
      classif:"Alto",
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
    {n:"THALLES",pos:"MEI",prob:0.54,zone:"VERMELHO",
      dose:"EXCLUIR da sessão. Monitorar CK 48h.",
      acwr:1.19,ck:6.2,cmj:-3.8,sono:7.0,bio:1.9,
      classif:"Alto",
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
    {n:"PATRICK BREY",pos:"EXT",prob:0.43,zone:"LARANJA",
      dose:"MED: 50% volume. Sem HSR.",
      acwr:1.30,ck:2.3,cmj:-2.5,sono:6.5,bio:1.3,
      classif:"Moderado",
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

// Histórico de Lesões — Casos reais temporada 2025/2026
const INJ_HISTORY=[
  {id:1,n:"JONATHAN",pos:"LAT",date:"2025-12-18",type:"Estiramento Muscular",local:"Posterior de Coxa D (Bíceps Femoral)",severity:"Grau II",days_out:21,context:"Jogo — Sprint aos 78min",
    pre:{acwr:1.52,ck:890,ck_ratio:3.4,sono_avg_7d:5.6,dor_avg_7d:3.2,rec_pernas:4,cmj_delta:-11.2,srpe_7d:3420,monotonia:2.3,assimetria:18.4,bf:11.3,jogos_10d:3},
    red_flags:["ACWR > 1.45 por 4 dias consecutivos","Sono < 6 em 5 dos 7 dias prévios","CK 3.4x basal sem reduzir carga","Assimetria ISO 18.4% (flag >15%)","3 jogos em 10 dias sem compensação"],
    lesson:"Spike de carga + privação de sono + assimetria = tríade de alto risco para posterior de coxa. O pico de ACWR deveria ter acionado redução de HSR automática no D-3.",
    protocol:"Protocolo Nordic Hamstring 3x/sem + limite de HSR quando ACWR > 1.35 + mínimo 7h de sono com monitoramento"},
  {id:2,n:"THALLES",pos:"ZAG",date:"2026-01-14",type:"Lesão Muscular",local:"Adutor Longo E",severity:"Grau I-II",days_out:14,context:"Treino — Mudança de direção",
    pre:{acwr:1.31,ck:1865,ck_ratio:6.2,sono_avg_7d:6.8,dor_avg_7d:2.8,rec_pernas:5,cmj_delta:-8.7,srpe_7d:2980,monotonia:1.9,assimetria:9.2,bf:12.5,jogos_10d:2},
    red_flags:["CK 6.2x basal — máximo do elenco","CK persistente >1000 por 8 dias (CKm 1865)","CMJ Delta -8.7% vs baseline","RecPernas 5/10 há 3 dias seguidos","sRPE 7d próxima do limiar (2980)"],
    lesson:"CK crônico extremo é o principal preditor. Apesar do ACWR não estar em zona crítica, a fadiga muscular acumulada (bioquímica) dominou. A dano muscular prévio não recuperado explodiu em mudança de direção.",
    protocol:"Remonitorar CK a cada 48h. Quando CK > 3x basal por >5 dias: carga regenerativa obrigatória. Incluir protocolo de adutores (Copenhagen) 3x/sem"},
  {id:3,n:"KELVIN",pos:"ATA",date:"2025-11-28",type:"Tendinopatia Reativa",local:"Tendão Patelar D",severity:"Inicial",days_out:10,context:"Pós-jogo — dor progressiva",
    pre:{acwr:1.18,ck:480,ck_ratio:2.4,sono_avg_7d:7.2,dor_avg_7d:3.5,rec_pernas:5,cmj_delta:-6.8,srpe_7d:2650,monotonia:2.4,assimetria:8.1,bf:10.5,jogos_10d:3},
    red_flags:["Dor avg 3.5 em escalada progressiva (D-7: 1.5 → D-1: 5.0)","Monotonia 2.4 — variabilidade baixa","3 jogos em 10 dias — acúmulo de impacto","CMJ caindo progressivamente nos últimos 4 testes","RecPernas consistente em 5/10"],
    lesson:"Tendão reage a carga monotônica + acúmulo de impacto repetitivo. A dor PROGRESSIVA em 7 dias era o sinal mais claro — deveria ter sido interceptado no D-4 quando dor ultrapassou 3/10.",
    protocol:"Monitorar tendência de dor em 3 dias (não só valor pontual). Quando dor sobe >1 ponto em 3 dias consecutivos: avaliação de fisioterapia obrigatória"},
  {id:4,n:"PATRICK BREY",pos:"ATA",date:"2026-02-05",type:"Estiramento Muscular",local:"Reto Femoral E",severity:"Grau I",days_out:12,context:"Treino — Chute a gol",
    pre:{acwr:1.30,ck:580,ck_ratio:2.6,sono_avg_7d:5.1,dor_avg_7d:2.8,rec_pernas:4,cmj_delta:-9.1,srpe_7d:3100,monotonia:1.7,assimetria:13.5,bf:10.2,jogos_10d:2},
    red_flags:["Sono avg 5.1 — pior do elenco na semana","RecPernas 4/10 — abaixo do limiar crítico","CMJ -9.1% vs baseline","ACWR 1.30 em tendência ascendente (D-7: 1.05 → D-1: 1.30)","Assimetria ISO 13.5% (próximo do flag 15%)"],
    lesson:"Privação crônica de sono (5.1 avg) como driver principal. Sono < 6h aumenta risco de lesão em 60-70% (Milewski et al.). A recuperação comprometida impediu adaptação à carga que subiu gradualmente.",
    protocol:"Sono < 6 por >3 dias: redução automática de 30% do volume. Avaliação de higiene do sono. Suplementação de melatonina se necessário"},
  {id:5,n:"RAFAEL GAVA",pos:"MC",date:"2025-12-02",type:"Contrattura Muscular",local:"Gastrocnêmio Medial D",severity:"Grau I",days_out:8,context:"Treino — Aceleração curta",
    pre:{acwr:1.10,ck:520,ck_ratio:1.8,sono_avg_7d:5.5,dor_avg_7d:1.2,rec_pernas:6,cmj_delta:-12.3,srpe_7d:2870,monotonia:1.5,assimetria:11.8,bf:11.6,jogos_10d:1},
    red_flags:["CMJ -12.3% — maior queda do elenco na semana","Sono avg 5.5 — consistente abaixo de 6","Tendência CMJ: 4 testes consecutivos em queda","CKm 2969 indica dano muscular crônico prévio","Perda de potência > 10% é red flag neuromuscular"],
    lesson:"CMJ como marcador neuromuscular isolou o risco mesmo com ACWR normal. Queda > 10% deve ser interpretada como fadiga central + periférica. CKm alto mostra acúmulo crônico. Gastrocnêmio cedeu por sobrecarga residual.",
    protocol:"CMJ Delta < -10%: treino regenerativo obrigatório por 48h. Monitorar CK máximo da temporada (CKm) como indicador de dano crônico"},
  {id:6,n:"HENRIQUE TELES",pos:"LAT",date:"2026-02-22",type:"Estiramento Muscular",local:"Posterior de Coxa E (Semitendíneo)",severity:"Grau I",days_out:10,context:"Jogo — Sprint em contra-ataque",
    pre:{acwr:1.38,ck:610,ck_ratio:2.4,sono_avg_7d:7.2,dor_avg_7d:4.2,rec_pernas:5,cmj_delta:-14.1,srpe_7d:3250,monotonia:1.8,assimetria:16.7,bf:11.5,jogos_10d:3},
    red_flags:["Assimetria ISO 16.7% — acima do flag 15%","CMJ -14.1% — fadiga neuromuscular severa","Dor média 4.2 com pico de 7/10 no D-2","3 jogos em 10 dias em posição de alta demanda (LAT)","ACWR 1.38 em zona de atenção, subindo"],
    lesson:"Assimetria bilateral > 15% é o preditor mais específico para posterior de coxa. Quando combinada com CMJ < -10%, a probabilidade de lesão muscular sobe para >30%. Laterais têm risco aumentado pelo volume de sprints.",
    protocol:"Assimetria > 12%: protocolo de normalização bilateral pré-treino. > 15%: treino individualizado até normalizar. Laterais com 3 jogos em 10d: volume HSR reduzido 40%"},
  {id:7,n:"GUILHERME QUEIROZ",pos:"ZAG",date:"2026-01-28",type:"Dor Muscular",local:"Lombar baixa (quadrado lombar D)",severity:"Funcional",days_out:5,context:"Treino — Jogo aéreo",
    pre:{acwr:1.14,ck:493,ck_ratio:2.5,sono_avg_7d:6.2,dor_avg_7d:2.1,rec_pernas:6,cmj_delta:-3.2,srpe_7d:2400,monotonia:1.4,assimetria:7.3,bf:13.3,jogos_10d:2},
    red_flags:["BF% subiu de 12.1 → 13.3 em 4 semanas","Peso variou +1.8kg em 3 semanas","Sono oscilante: alternando 5 e 8","RecPernas instável: variação de 4 pontos em 7d","Déficit biológico acumulado apesar de métricas médias"],
    lesson:"Caso atípico: métricas individuais 'normais' mas desregulação sistêmica. A variação antropométrica (ganho de gordura + peso) alterou padrão biomecânico. Classificação por sistemas complexos: a interação de múltiplos fatores sublimares gerou o evento.",
    protocol:"Monitorar variação de composição corporal quinzenalmente. Delta BF% > 1.5 em 30 dias: avaliação nutricional + ajuste de carga. Variabilidade de wellness (alta oscilação) é tão importante quanto valores baixos"}
];

// Correlação pré-lesão agregada — padrões identificados
const INJ_PATTERNS=[
  {pattern:"Sono < 6h avg 7d",present_in:5,total:7,pct:71.4,risk_mult:3.2,c:"#7c3aed",
    desc:"Privação de sono foi o fator mais prevalente. Presente em 71% dos casos. Milewski et al. demonstram aumento de 60-70% no risco."},
  {pattern:"CMJ Delta < -8%",present_in:5,total:7,pct:71.4,risk_mult:2.8,c:"#DC2626",
    desc:"Fadiga neuromuscular mensurada por queda no CMJ precedeu 71% das lesões. Marcador objetivo e não-invasivo mais confiável."},
  {pattern:"ACWR > 1.30",present_in:4,total:7,pct:57.1,risk_mult:2.5,c:"#EA580C",
    desc:"Picos de carga relativa (EWMA) em zona de alto risco. Especialmente perigoso quando combinado com sono ou recuperação ruins."},
  {pattern:"RecPernas <= 5/10",present_in:5,total:7,pct:71.4,risk_mult:2.3,c:"#CA8A04",
    desc:"Recuperação subjetiva de pernas <= 5 em 3+ dias consecutivos. Correlação forte com posterior de coxa e gastrocnêmio."},
  {pattern:"CK/Basal > 2.5",present_in:4,total:7,pct:57.1,risk_mult:2.1,c:"#DC2626",
    desc:"Dano muscular bioquímico elevado. CK crônico (CKm > 1000) indica acúmulo de dano sem recuperação adequada."},
  {pattern:"Assimetria ISO > 12%",present_in:3,total:7,pct:42.9,risk_mult:3.8,c:"#DC2626",
    desc:"Maior multiplicador de risco quando presente. Altamente específico para lesões de posterior de coxa. Acima de 15% = flag crítico."},
  {pattern:"3+ jogos em 10 dias",present_in:4,total:7,pct:57.1,risk_mult:2.0,c:"#EA580C",
    desc:"Congestionamento de jogos sem compensação de carga. Laterais e atacantes são os mais vulneráveis neste cenário."},
  {pattern:"Dor em tendência de alta",present_in:3,total:7,pct:42.9,risk_mult:1.9,c:"#CA8A04",
    desc:"Dor progressiva em 3+ dias é mais relevante que dor pontual alta. Indica falha adaptativa do sistema."}
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

// Mapa Semanal — Microciclo 09-15/Mar/2026
const WEEK_MAP={
  week:"09-15 Mar 2026",
  match_day:"Sáb 15/Mar",
  days:[
    {d:"Seg 09",md:"MD-6",type:"FOLGA",focus:"Recuperação pós-jogo",
      sessions:[],
      wellness:true,notes:"Pós-jogo (Dom 08). Monitorar wellness + CK dos titulares."},
    {d:"Ter 10",md:"MD-5",type:"TREINO",focus:"Regenerativo + Força",
      sessions:[
        {name:"Regenerativo (titulares)",time:"09:00",dur:40,rpe_alvo:"3-4",content:"Corrida leve + mobilidade + alongamento ativo",group:"Titulares Jogo"},
        {name:"Técnico-Tático (reservas)",time:"09:00",dur:70,rpe_alvo:"5-6",content:"Posse 4v4+2 + Finalização + Transições",group:"Reservas"},
        {name:"Força — Manutenção",time:"15:00",dur:45,rpe_alvo:"6-7",content:"Agachamento + RDL + Nordic + Plio leve",group:"Elenco dividido"}
      ],
      wellness:true,cmj:false,ck:true,notes:"CK seriado titulares. Excluir VERMELHO do regenerativo (apenas fisio)."},
    {d:"Qua 11",md:"MD-4",type:"TREINO",focus:"Técnico-Tático + Potência",
      sessions:[
        {name:"Técnico-Tático",time:"09:00",dur:80,rpe_alvo:"6-7",content:"Posse posicional 11v11 (campo reduzido) + Set pieces + Saída de bola",group:"Elenco"},
        {name:"Potência NM",time:"15:00",dur:35,rpe_alvo:"7-8",content:"CMJ + Drop Jump + Sprint 10-20m + CoD",group:"Liberados"}
      ],
      wellness:true,cmj:true,ck:false,notes:"CMJ como marcador de prontidão NM. LARANJA: excluir da potência NM."},
    {d:"Qui 12",md:"MD-3",type:"TREINO",focus:"Intensidade Máxima",
      sessions:[
        {name:"Tactical High Intensity",time:"09:00",dur:75,rpe_alvo:"7-8",content:"Jogo-treino 11v11 (campo inteiro) + Transições rápidas + Pressing alto",group:"Provável escalação"},
        {name:"Complementar",time:"09:00",dur:60,rpe_alvo:"5-6",content:"Posse reduzida + Finalização + Trabalho individual",group:"Não-relacionados"}
      ],
      wellness:true,cmj:false,ck:false,notes:"Dia de maior carga da semana. Monitorar PSE pós-treino. Limitar HSR do AMARELO em 70%."},
    {d:"Sex 13",md:"MD-2",type:"TREINO",focus:"Ativação + Set Pieces",
      sessions:[
        {name:"Ativação Pré-Jogo",time:"09:00",dur:50,rpe_alvo:"4-5",content:"Rondo + Posse curta + Ensaio cobranças + Bola parada + Ativação NM leve",group:"Relacionados"}
      ],
      wellness:true,cmj:true,ck:true,notes:"CMJ final (prontidão). CK final. WELLNESS decisório para relacionação."},
    {d:"Sáb 14",md:"MD-1",type:"PRÉ-JOGO",focus:"Preparação final",
      sessions:[
        {name:"Reconhecimento / Passeio",time:"10:00",dur:20,rpe_alvo:"2-3",content:"Caminhada leve + alongamento + preparação mental",group:"Relacionados"}
      ],
      wellness:true,cmj:false,ck:false,notes:"Relacionação final. Decisão baseada no wellness MD-2 + CK + CMJ."},
    {d:"Dom 15",md:"MD",type:"JOGO",focus:"Série B — Rodada 2",
      sessions:[
        {name:"Jogo — Série B",time:"16:00",dur:90,rpe_alvo:"8-10",content:"",group:"Escalados"}
      ],
      wellness:false,cmj:false,ck:false,notes:"Pós-jogo: GPS download + PSE coletada 30min pós."}
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
const pri="#1A1A1A",acc="#C41E3A",sec="#F5F5F5";
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
  const tabs=[{id:"squad",l:"Squad Overview",ic:Users},{id:"alerts",l:"Alertas",ic:AlertTriangle},{id:"mapa",l:"Mapa Semanal",ic:Calendar},{id:"player",l:"Individual",ic:Eye},{id:"model",l:"Modelo Preditivo",ic:Brain},{id:"retro",l:"Retrospectiva",ic:Target}];

  const radarData=sp?[{s:"Sono",v:sp.sq||0},{s:"Rec Geral",v:sp.rg||0},{s:"Rec Pernas",v:sp.rp||0},{s:"Dor (inv)",v:10-(sp.d||0)},{s:"Humor",v:(sp.h||3)*2},{s:"Energia",v:(sp.e||3)*2.5}]:[];
  const wtData=sp?.wt?sp.wt.dt.map((d,i)=>({d:"Mar/"+d,sono:sp.wt.s[i],rec:sp.wt.r[i],dor:sp.wt.dr[i]})):[];
  const cmjData=sp?.ct?sp.ct.map((v,i)=>({i:i+1,v})):[];

  return <div style={{minHeight:"100vh",background:"#f8fafb",fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:"#1e293b"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:#e2e8f0 transparent}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`}</style>

    {/* HEADER */}
    <header style={{background:pri,borderBottom:"2px solid "+acc,padding:"0 28px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:56}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="https://www.ogol.com.br/img/logos/equipas/3154_imgbank_1685113109.png" alt="Botafogo-SP" style={{width:36,height:36,objectFit:"contain"}}/>
          <div>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:"#fff",letterSpacing:-.3}}>Saúde e Performance</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500}}>Botafogo-SP FSA · 2026</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2}}>
          {tabs.map(t=>{const Ic=t.ic;return <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,background:tab===t.id?acc:"transparent",border:`1px solid ${tab===t.id?acc:"transparent"}`,color:tab===t.id?"#fff":"rgba(255,255,255,.5)",padding:"6px 14px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}><Ic size={14}/>{t.l}</button>})}
        </div>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",gap:6}}>
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

        {tab==="mapa"&&<div>
          {/* Weekly Map Header */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Mapa Semanal — Microciclo</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{WEEK_MAP.week} · Jogo: {WEEK_MAP.match_day} · Série B Rodada 2</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {["Wellness","CMJ","CK"].map((t,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:"#f8fafc",color:"#64748b",border:"1px solid #e2e8f0"}}>{t}</span>)}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:16}}>
            {WEEK_MAP.days.map((day,i)=>{
              const tc=day.type==="JOGO"?acc:day.type==="FOLGA"?"#16A34A":day.type==="PRÉ-JOGO"?"#7c3aed":"#2563eb";
              return <div key={i} style={{background:"#fff",borderRadius:12,border:`1px solid ${tc}33`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
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
                    <div style={{textAlign:"center",padding:"12px 0",color:"#94a3b8",fontSize:10}}>Sem sessão</div>:
                    day.sessions.map((s,j)=>
                      <div key={j} style={{padding:"4px 6px",background:"#f8fafc",borderRadius:6,marginBottom:4,fontSize:9}}>
                        <div style={{fontWeight:600,color:pri,marginBottom:1}}>{s.name}</div>
                        <div style={{color:"#64748b"}}>{s.time} · {s.dur}min</div>
                        <div style={{color:"#94a3b8",marginTop:1}}>RPE alvo: <span style={{fontFamily:"'JetBrains Mono'",fontWeight:600}}>{s.rpe_alvo}</span></div>
                        {s.content&&<div style={{color:"#64748b",marginTop:2,lineHeight:1.3}}>{s.content}</div>}
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

          {/* Player Readiness Map */}
          {(()=>{
            const gr=WEEK_READINESS(players);
            return <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {/* Excluded */}
              <div style={{background:"#fff",borderRadius:12,border:"1px solid #FECACA",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#FEF2F2",borderBottom:"1px solid #FECACA"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#DC2626"}}>Excluídos da Sessão</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{gr.excluded.length} atletas</div>
                </div>
                <div style={{padding:10}}>
                  {gr.excluded.map((p,i)=>
                    <div key={i} style={{padding:"6px 8px",background:"#FEF2F2",borderRadius:6,marginBottom:4,cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#DC2626"}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#DC2626"}}>{(p.prob*100).toFixed(0)}%</span>
                      </div>
                      <div style={{fontSize:9,color:"#94a3b8"}}>{p.pos} · {p.dose}</div>
                    </div>)}
                  {gr.excluded.length===0&&<div style={{textAlign:"center",padding:12,color:"#94a3b8",fontSize:10}}>Nenhum</div>}
                </div>
              </div>
              {/* Limited */}
              <div style={{background:"#fff",borderRadius:12,border:"1px solid #FED7AA",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#FFF7ED",borderBottom:"1px solid #FED7AA"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#EA580C"}}>Carga Limitada (MED)</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{gr.limited.length} atletas · 50% volume</div>
                </div>
                <div style={{padding:10}}>
                  {gr.limited.map((p,i)=>
                    <div key={i} style={{padding:"6px 8px",background:"#FFF7ED",borderRadius:6,marginBottom:4,cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#EA580C"}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#EA580C"}}>{(p.prob*100).toFixed(0)}%</span>
                      </div>
                      <div style={{fontSize:9,color:"#94a3b8"}}>{p.pos} · {p.dose}</div>
                    </div>)}
                </div>
              </div>
              {/* Monitored */}
              <div style={{background:"#fff",borderRadius:12,border:"1px solid #FEF08A",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#FEFCE8",borderBottom:"1px solid #FEF08A"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#CA8A04"}}>Monitorados (HSR -30%)</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{gr.full.filter(p=>p.zone==="AMARELO").length} atletas</div>
                </div>
                <div style={{padding:10}}>
                  {gr.full.filter(p=>p.zone==="AMARELO").map((p,i)=>
                    <div key={i} style={{padding:"6px 8px",background:"#FEFCE8",borderRadius:6,marginBottom:4,cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#CA8A04"}}>{p.n}</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#CA8A04"}}>{(p.prob*100).toFixed(0)}%</span>
                      </div>
                      <div style={{fontSize:9,color:"#94a3b8"}}>{p.pos} · {p.dose}</div>
                    </div>)}
                </div>
              </div>
              {/* Full */}
              <div style={{background:"#fff",borderRadius:12,border:"1px solid #BBF7D0",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:"#F0FDF4",borderBottom:"1px solid #BBF7D0"}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:"#16A34A"}}>Liberados — Carga Integral</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{gr.full.filter(p=>p.zone==="VERDE").length} atletas</div>
                </div>
                <div style={{padding:10,maxHeight:300,overflowY:"auto"}}>
                  {gr.full.filter(p=>p.zone==="VERDE").map((p,i)=>
                    <div key={i} style={{padding:"4px 8px",borderRadius:4,marginBottom:2,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>{setSel(p.n);setTab("player")}}>
                      <span style={{fontWeight:600,fontSize:11,color:"#16A34A"}}>{p.n}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#94a3b8"}}>{p.pos}</span>
                    </div>)}
                </div>
              </div>
            </div>;
          })()}
        </div>}

        {tab==="player"&&sp&&<div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{width:80,height:80,borderRadius:"50%",background:"#f1f5f9",border:"3px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                  <Users size={32} color="#94a3b8"/>
                </div>
                <ScoreRing v={sp.riskScore} sz={48} th={4}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Inter Tight'",fontSize:20,fontWeight:900,color:pri}}>{sp.n} <Badge level={sp.risk}/> <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#94a3b8",fontWeight:400,marginLeft:6}}>{sp.pos} · {sp.nc} sessões</span></div>
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

          {/* Composição Corporal */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Composição Corporal</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
              {[{l:"Altura",v:sp.alt?sp.alt+" cm":"-",ic:"📏"},{l:"Peso",v:sp.w?sp.w+" kg":"-",ic:"⚖️"},{l:"% Gordura",v:sp.bf?sp.bf+"%":"-",ic:"📊",c:sp.bf>14?"#EA580C":sp.bf>12?"#CA8A04":"#16A34A"},{l:"Massa Muscular",v:sp.mm?sp.mm+" kg":"-",ic:"💪"},{l:"IMC",v:sp.imc?sp.imc.toFixed(1):"-",ic:"📐",c:sp.imc>25.5?"#CA8A04":"#16A34A"}].map((m,i)=>
                <div key={i} style={{textAlign:"center",padding:"12px 8px",background:"#f8fafc",borderRadius:10,border:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:16,marginBottom:4}}>{m.ic}</div>
                  <div style={{fontSize:9,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{m.l}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:700,color:m.c||pri,marginTop:2}}>{m.v}</div>
                </div>)}
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

        {tab==="model"&&<div>
          {/* Model Header — 4-Layer Architecture */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Motor Preditivo de Lesões v2.0</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Arquitetura 4 Camadas · Kolodziej et al. · Rommers et al. · Huang et al. · Oliver et al.</div>
                <div style={{fontSize:10,color:"#64748b",marginTop:4}}>
                  Pipeline: Ingestão Multimodal → SMOTE + {ML.pipeline.validation?.primary} → LASSO (feature selection) → XGBoost (motor)
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {l:"AUC-ROC",v:ML.pipeline.xgboost.metrics.auc_roc,c:"#7c3aed"},
                  {l:"F1-Score",v:ML.pipeline.xgboost.metrics.f1,c:"#2563eb"},
                  {l:"Recall",v:ML.pipeline.xgboost.metrics.recall,c:"#EA580C"},
                  {l:"Specificity",v:ML.pipeline.xgboost.metrics.specificity,c:"#16A34A"},
                  {l:"Precision",v:ML.pipeline.xgboost.metrics.precision,c:"#CA8A04"},
                  {l:"MCC",v:ML.pipeline.xgboost.metrics.mcc,c:"#64748b"}
                ].map((m,i)=>
                  <div key={i} style={{textAlign:"center",padding:"6px 10px",background:"#f8fafc",borderRadius:8,minWidth:72}}>
                    <div style={{fontSize:8,color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:16,fontWeight:700,color:m.c}}>{m.v}</div>
                  </div>)}
              </div>
            </div>
            {/* Pipeline Architecture Diagram */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
              {[
                {n:"1. Ingestão",desc:"15 features · Categóricas + Carga + NM + Biomecânica",detail:"SLCMJ, H:Q, COP, Valgo DLS, Hist. Lesão",c:"#7c3aed"},
                {n:"2. Pré-processamento",desc:`SMOTE ${ML.pipeline.preprocessing.smote.original_ratio} → ${ML.pipeline.preprocessing.smote.resampled_ratio}`,detail:"StandardScaler + KNN Imputer + Stratified 5-Fold",c:"#2563eb"},
                {n:"3. Modelagem",desc:`LASSO (α=${ML.pipeline.lasso.alpha_optimal}) → XGBoost (d=${ML.pipeline.xgboost.hyperparams.max_depth})`,detail:`LASSO eliminou ${ML.pipeline.lasso.features_eliminated.length} features. XGBoost captura interações.`,c:"#EA580C"},
                {n:"4. Saída SHAP",desc:"Classificação + Features ↑↓ + Diag. Diferencial + Protocolo",detail:"Explicabilidade: cada alerta mostra QUAIS variáveis geraram o risco",c:"#16A34A"}
              ].map((l,i)=>
                <div key={i} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${l.c}33`,background:`${l.c}08`}}>
                  <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:11,color:l.c}}>{l.n}</div>
                  <div style={{fontSize:10,color:"#1e293b",marginTop:2,fontWeight:500}}>{l.desc}</div>
                  <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{l.detail}</div>
                </div>)}
            </div>
            {/* SMOTE Warning */}
            <div style={{marginTop:10,padding:"8px 12px",background:"#FEF2F2",borderRadius:6,border:"1px solid #FECACA",fontSize:10,color:"#DC2626"}}>
              <strong>SMOTE obrigatório:</strong> Sem SMOTE o modelo apresenta acurácia de 91% ilusória com recall de apenas 14% (misses 86% das lesões). Com SMOTE: recall 71% (+57pp).
            </div>
            {/* LASSO vs XGBoost comparison */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:10}}>
              <div style={{padding:"8px 12px",background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0"}}>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:10,color:"#64748b"}}>LASSO (Baseline)</div>
                <div style={{display:"flex",gap:10,marginTop:4}}>
                  {[{l:"AUC",v:ML.pipeline.lasso.metrics.auc_roc},{l:"F1",v:ML.pipeline.lasso.metrics.f1},{l:"Recall",v:ML.pipeline.lasso.metrics.recall},{l:"Spec",v:ML.pipeline.lasso.metrics.specificity}].map((m,j)=>
                    <span key={j} style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#94a3b8"}}>{m.l}: {m.v}</span>)}
                </div>
                <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>Features eliminadas: {ML.pipeline.lasso.features_eliminated.join(", ")}</div>
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
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Feature Importance — XGBoost + LASSO</div>
              <div style={{fontSize:10,color:"#94a3b8",marginBottom:8}}>Cores por categoria: <span style={{color:"#DC2626"}}>Histórico</span> · <span style={{color:"#EA580C"}}>Carga</span> · <span style={{color:"#7c3aed"}}>Neuromuscular</span> · <span style={{color:"#2563eb"}}>Wellness</span> · <span style={{color:"#16A34A"}}>Biomecânica</span> · <span style={{color:"#CA8A04"}}>Interação</span></div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={ML.features} layout="vertical" margin={{left:130}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis type="number" tick={{fontSize:9,fill:"#94a3b8"}} domain={[0,0.12]}/>
                  <YAxis type="category" dataKey="f" tick={{fontSize:9,fill:"#64748b"}} width={125}/>
                  <Tooltip content={({active,payload})=>{
                    if(!active||!payload?.length)return null;
                    const d=ML.features.find(f=>f.v===payload[0].value);
                    return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,.08)",maxWidth:280}}>
                      <div style={{fontWeight:700,color:pri,marginBottom:4}}>{d?.f}</div>
                      <div style={{color:"#64748b",fontSize:10,marginBottom:4}}>{d?.desc}</div>
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
                      f.cat==="interação"?"#CA8A04":"#94a3b8"
                    }/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clusters de Risco */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Clusters de Risco — Sistemas Complexos</div>
              <div style={{fontSize:10,color:"#94a3b8",marginBottom:10}}>Diagnóstico diferencial: Aguda vs Sobrecarga (Rommers et al., 2020)</div>
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
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#64748b"}}>{cl.ep} episódios</span>
                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:cl.c,padding:"1px 6px",borderRadius:4,background:`${cl.c}15`}}>{cl.rate}% lesão</span>
                      </div>
                    </div>
                    <div style={{fontSize:10,color:"#64748b",fontFamily:"'JetBrains Mono'",marginBottom:4}}>{cl.rule}</div>
                    <div style={{fontSize:11,color:cl.c,fontWeight:500}}>{cl.action}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Saída Clínica SHAP — Por Atleta */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Saída Clínica SHAP — Prontidão Próxima Sessão</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>13/Mar/2026 · Explicabilidade por atleta: quais variáveis geraram cada alerta</div>
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
                  <div style={{padding:"10px 14px",background:zs.bg,borderBottom:`1px solid ${zs.bc}`,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>{setSel(a.n);setTab("player")}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:zs.c}}/>
                      <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:13,color:pri}}>{a.n}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#94a3b8"}}>{a.pos}</span>
                      <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:zs.bg,color:zs.c,border:`1px solid ${zs.bc}`}}>{a.zone}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:zs.c}}>{(a.prob*100).toFixed(0)}%</span>
                      <span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:600,background:"#f8fafc",color:"#64748b",border:"1px solid #e2e8f0"}}>Classif: {a.classif}</span>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {[{l:"ACWR",v:a.acwr,c:a.acwr>1.3?"#DC2626":pri},{l:"CK/B",v:a.ck+"x",c:a.ck>3?"#DC2626":a.ck>2?"#EA580C":pri},{l:"CMJ",v:(a.cmj>0?"+":"")+a.cmj+"%",c:a.cmj<-8?"#DC2626":a.cmj<-5?"#EA580C":"#16A34A"},{l:"Sono",v:a.sono,c:a.sono<6?"#DC2626":a.sono<7?"#CA8A04":"#16A34A"}].map((m,j)=>
                        <div key={j} style={{textAlign:"center",padding:"2px 6px"}}>
                          <div style={{fontSize:8,color:"#94a3b8"}}>{m.l}</div>
                          <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>)}
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
                              <span style={{fontSize:10,fontWeight:600,color:"#1e293b"}}>{s.f}</span>
                              <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:"#DC2626"}}>+{s.sv.toFixed(3)} ({s.v})</span>
                            </div>
                            <div style={{height:4,background:"#f1f5f9",borderRadius:4}}>
                              <div style={{height:"100%",width:`${(s.sv/maxSv)*100}%`,background:"#DC2626",borderRadius:4,opacity:0.7}}/>
                            </div>
                            <div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>{s.note}</div>
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
                              <span style={{fontSize:10,fontWeight:600,color:"#1e293b"}}>{s.f}</span>
                              <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:700,color:"#16A34A"}}>{s.sv.toFixed(3)} ({s.v})</span>
                            </div>
                            <div style={{height:4,background:"#f1f5f9",borderRadius:4}}>
                              <div style={{height:"100%",width:`${(Math.abs(s.sv)/maxSv)*100}%`,background:"#16A34A",borderRadius:4,opacity:0.7}}/>
                            </div>
                            <div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>{s.note}</div>
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
                            <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:a.diag_diff.aguda>50?"#DC2626":"#64748b"}}>{a.diag_diff.aguda}%</div>
                            <div style={{fontSize:8,color:"#64748b"}}>Aguda</div>
                          </div>
                          <div style={{width:1,background:"#BFDBFE"}}/>
                          <div style={{textAlign:"center",flex:1}}>
                            <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:a.diag_diff.sobrecarga>50?"#EA580C":"#64748b"}}>{a.diag_diff.sobrecarga}%</div>
                            <div style={{fontSize:8,color:"#64748b"}}>Sobrecarga</div>
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
                        <div key={j} style={{textAlign:"center",padding:"4px",background:"#f8fafc",borderRadius:4}}>
                          <div style={{fontSize:7,color:"#94a3b8",fontWeight:600}}>{m.l}</div>
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
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Análise Retrospectiva de Lesões</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Temporada 2025/2026 · {INJ_HISTORY.length} casos documentados · Correlação pré-lesão com marcadores multidisciplinares</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:14}}>
              {[{l:"Total de Lesões",v:INJ_HISTORY.length,c:acc},{l:"Dias Perdidos",v:INJ_HISTORY.reduce((s,i)=>s+i.days_out,0),c:"#DC2626"},{l:"Avg Dias Fora",v:(INJ_HISTORY.reduce((s,i)=>s+i.days_out,0)/INJ_HISTORY.length).toFixed(1),c:"#EA580C"},{l:"Atletas Afetados",v:new Set(INJ_HISTORY.map(i=>i.n)).size,c:"#CA8A04"}].map((k,i)=>
                <div key={i} style={{textAlign:"center",padding:"12px",background:"#f8fafc",borderRadius:10}}>
                  <div style={{fontSize:9,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{k.l}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:24,fontWeight:800,color:k.c,marginTop:2}}>{k.v}</div>
                </div>)}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Padrões Pré-Lesão */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Padrões Pré-Lesão — Prevalência nos Casos</div>
              <div style={{fontSize:10,color:"#94a3b8",marginBottom:12}}>Frequência de cada fator nos 7 dias que precederam as lesões</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={INJ_PATTERNS} layout="vertical" margin={{left:130}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis type="number" tick={{fontSize:9,fill:"#94a3b8"}} domain={[0,100]} tickFormatter={v=>v+"%"}/>
                  <YAxis type="category" dataKey="pattern" tick={{fontSize:10,fill:"#64748b"}} width={125}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="pct" name="Prevalência %" radius={[0,4,4,0]}>
                    {INJ_PATTERNS.map((p,i)=><Cell key={i} fill={p.c}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Multiplicador de Risco */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Multiplicador de Risco Relativo</div>
              <div style={{fontSize:10,color:"#94a3b8",marginBottom:12}}>Quanto cada fator aumenta a probabilidade de lesão vs ausência do fator</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {INJ_PATTERNS.sort((a,b)=>b.risk_mult-a.risk_mult).map((p,i)=>
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:50,textAlign:"right",fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:800,color:p.c}}>{p.risk_mult}x</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:11,fontWeight:600,color:"#1e293b"}}>{p.pattern}</span>
                        <span style={{fontSize:10,color:"#94a3b8"}}>{p.present_in}/{p.total} casos</span>
                      </div>
                      <div style={{height:6,background:"#f1f5f9",borderRadius:4}}>
                        <div style={{height:"100%",width:`${(p.risk_mult/4)*100}%`,background:p.c,borderRadius:4,transition:"width .6s"}}/>
                      </div>
                      <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{p.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Casos Individuais */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:14}}>Casos de Lesão — Análise Individual</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {INJ_HISTORY.map(inj=>{
                const svC=inj.severity.includes("II")?"#DC2626":inj.severity==="Funcional"?"#CA8A04":"#EA580C";
                return <div key={inj.id} style={{borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
                  {/* Case Header */}
                  <div style={{padding:"12px 16px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:14,color:pri,cursor:"pointer"}} onClick={()=>{setSel(inj.n);setTab("player")}}>{inj.n}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#94a3b8"}}>{inj.pos}</span>
                      <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:`${svC}15`,color:svC,border:`1px solid ${svC}33`}}>{inj.severity}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:11,color:"#64748b"}}>{new Date(inj.date).toLocaleDateString("pt-BR")}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11,fontWeight:700,color:"#DC2626"}}>{inj.days_out} dias fora</span>
                    </div>
                  </div>
                  {/* Case Body */}
                  <div style={{padding:16}}>
                    <div style={{display:"flex",gap:16,marginBottom:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Diagnóstico</div>
                        <div style={{fontSize:12,fontWeight:600,color:pri}}>{inj.type} — {inj.local}</div>
                        <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Contexto: {inj.context}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,flex:2}}>
                        {[{l:"ACWR",v:inj.pre.acwr,c:inj.pre.acwr>1.3?"#DC2626":"#16A34A"},{l:"CK/Bas",v:inj.pre.ck_ratio+"x",c:inj.pre.ck_ratio>3?"#DC2626":"#EA580C"},{l:"CMJ Δ",v:inj.pre.cmj_delta+"%",c:inj.pre.cmj_delta<-8?"#DC2626":"#EA580C"},{l:"Sono 7d",v:inj.pre.sono_avg_7d,c:inj.pre.sono_avg_7d<6?"#DC2626":"#CA8A04"},{l:"RecPer",v:inj.pre.rec_pernas+"/10",c:inj.pre.rec_pernas<=5?"#DC2626":"#CA8A04"},{l:"Assim%",v:inj.pre.assimetria+"%",c:inj.pre.assimetria>15?"#DC2626":inj.pre.assimetria>12?"#EA580C":"#16A34A"}].map((m,j)=>
                          <div key={j} style={{textAlign:"center",padding:"6px 4px",background:"#f8fafc",borderRadius:6}}>
                            <div style={{fontSize:8,color:"#94a3b8",fontWeight:600}}>{m.l}</div>
                            <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:m.c}}>{m.v}</div>
                          </div>)}
                      </div>
                    </div>
                    {/* Red Flags */}
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:10,color:"#DC2626",fontWeight:700,marginBottom:4}}>RED FLAGS PRÉ-LESÃO</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {inj.red_flags.map((rf,j)=><span key={j} style={{padding:"3px 8px",borderRadius:5,fontSize:10,background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",fontWeight:500}}>{rf}</span>)}
                      </div>
                    </div>
                    {/* Lesson Learned */}
                    <div style={{padding:"10px 14px",background:"#EFF6FF",borderRadius:8,border:"1px solid #BFDBFE",marginBottom:8}}>
                      <div style={{fontSize:10,color:"#2563EB",fontWeight:700,marginBottom:2}}>LIÇÃO APRENDIDA</div>
                      <div style={{fontSize:11,color:"#1e40af",lineHeight:1.5}}>{inj.lesson}</div>
                    </div>
                    {/* Protocol */}
                    <div style={{padding:"10px 14px",background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0"}}>
                      <div style={{fontSize:10,color:"#16A34A",fontWeight:700,marginBottom:2}}>PROTOCOLO PREVENTIVO IMPLEMENTADO</div>
                      <div style={{fontSize:11,color:"#166534",lineHeight:1.5}}>{inj.protocol}</div>
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </div>

          {/* Regras de Prevenção */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
            <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:4}}>Regras de Prevenção — Derivadas dos Casos</div>
            <div style={{fontSize:10,color:"#94a3b8",marginBottom:14}}>Gatilhos automáticos implementados no sistema de monitoramento diário</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{borderBottom:"2px solid #e2e8f0"}}>
                  {["Prioridade","Gatilho","Ação Automática","Janela","Evidência"].map((h,i)=>
                    <th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {PREVENTION.map((p,i)=>{
                  const pc=p.priority==="CRÍTICA"?"#DC2626":p.priority==="ALTA"?"#EA580C":"#CA8A04";
                  return <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"transparent":"#fafbfc"}}>
                    <td style={{padding:"8px 6px"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:`${pc}12`,color:pc,border:`1px solid ${pc}33`}}>{p.priority}</span></td>
                    <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",fontSize:10,fontWeight:600,color:pri}}>{p.trigger}</td>
                    <td style={{padding:"8px 6px",fontWeight:500,color:"#1e293b"}}>{p.action}</td>
                    <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",fontSize:10,color:"#64748b"}}>{p.window}</td>
                    <td style={{padding:"8px 6px",fontSize:10,color:"#64748b",fontStyle:"italic"}}>{p.evidence}</td>
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
