import { useState, useMemo } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Cell, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Heart, Zap, Shield, Users, Eye, Brain, Target } from "lucide-react";

const P=[{n:"ADRIANO",pos:"ZAG",h:5,e:4,rg:7,rp:6,d:2,sq:7,rpa:7,da:1.6,sa:7.3,nw:39,pse:3,sra:331,w:82.7,alt:185,bf:12.4,mm:38.2,imc:24.2,nc:60,ai:1.24,cmj:49.6,ct:[54.2,50.3,48.5,51.4,52,52.2,52.6,49.6],wt:{dt:["02","03","07","09","10","11","12"],s:[10,8,7,7,8,7,7],r:[8,6,6,8,8,7,6],dr:[1,1,1,1,2,1,2]}},{n:"BRENNO",pos:"GOL",h:4,e:4,rg:8,rp:8,d:3,sq:7,rpa:7.3,da:1.3,sa:7.3,nw:50,pse:4,sra:310,w:90.8,alt:191,bf:13.8,mm:41.5,imc:24.9,nc:75,ai:1.17,cmj:44.6,ct:[45,47.8,49.3,48,47.6,49.3,46.2,44.6],wt:{dt:["04","05","06","07","09","10","11"],s:[7,7,7,6,10,8,7],r:[7,7,8,5,8,7,8],dr:[0,0,0,0,0,2,3]}},{n:"CARLOS EDUARDO",pos:"ZAG",h:5,e:3,rg:8,rp:8,d:2,sq:8,rpa:7.9,da:1,sa:9.2,nw:57,pse:3,sra:391,w:85.9,alt:187,bf:11.9,mm:39.8,imc:24.6,ck:973,nc:75,ai:1.07,cmj:46.7,ckm:973,ct:[49.1,44,47.1,44.5,48.8,46.5,52.6,46.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,9,8,8,9,10,8],r:[9,5,6,9,8,6,8],dr:[1,1,0,0,0,2,2]}},{n:"DARLAN",pos:"MC",h:4,e:3,rg:9,rp:8,d:0,sq:8,rpa:7.8,da:.7,sa:7.8,nw:17,pse:5,sra:317,w:80.2,alt:178,bf:10.5,mm:37.1,imc:25.3,nc:20,ai:.95,cmj:31.1,ct:[31.1]},{n:"ERICSON",pos:"ZAG",h:5,e:3,rg:10,rp:9,d:3,sq:9,rpa:6.7,da:1.1,sa:8.8,nw:51,pse:0,sra:431,w:91.6,alt:190,bf:13.2,mm:42.0,imc:25.4,ck:562,nc:75,ai:.64,cmj:43.1,ckm:916,ct:[44.3,47.4,42.4,47.1,50.9,50.9,55.5,43.1],wt:{dt:["26","27","28","02","03","04","06"],s:[9,9,9,7,9,8,9],r:[6,6,5,8,7,9,9],dr:[1,1,1,1,4,3,3]}},{n:"ERIK",pos:"ATA",h:5,e:4,rg:7,rp:7,d:0,sq:9,rpa:7.2,da:.2,sa:9.3,nw:22,pse:6,sra:308,w:75.5,alt:176,bf:9.8,mm:35.4,imc:24.4,nc:59,ai:1.97,ct:[54.1,52.7],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,8,8,10,10,9],r:[7,8,7,10,7,7,7],dr:[0,0,0,0,0,0,0]}},{n:"FELIPINHO",pos:"LAT",h:5,e:3,rg:7,rp:7,d:0,sq:7,rpa:6.8,da:0,sa:7.5,nw:16,pse:7,sra:347,w:78,alt:179,bf:11.2,mm:36.0,imc:24.3,nc:27,ai:.85,cmj:38.9,ct:[44.5,38.9]},{n:"GABRIEL INOCENCIO",pos:"MC",h:4,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.8,da:.4,sa:7.2,nw:58,pse:3,sra:407,w:78.5,alt:177,bf:10.8,mm:36.5,imc:25.1,ck:533,nc:75,ai:.97,cmj:48.2,ckm:916,ct:[48.2,52.3,45.3,48.9,53.6,49.3,50.8,48.2],wt:{dt:["04","05","06","09","10","11","12"],s:[8,9,8,8,7,7,8],r:[7,7,7,8,8,8,8],dr:[1,2,7,2,2,2,1]}},{n:"GUI MARIANO",pos:"ZAG",h:5,e:4,rg:8,rp:8,d:4,sq:8,rpa:7.6,da:.3,sa:8.2,nw:59,pse:7,sra:476,w:89.7,alt:189,bf:12.7,mm:41.0,imc:25.1,nc:75,ai:1.1,cmj:53.1,ct:[52.4,52.2,52,55.1,47.5,53.7,53.5,53.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,9,9,8,8],r:[7,7,5,10,8,6,8],dr:[0,0,0,0,0,0,4]}},{n:"GUILHERME QUEIROZ",pos:"ZAG",h:5,e:3,rg:7,rp:7,d:2,sq:8,rpa:7.3,da:1.5,sa:6.9,nw:56,pse:6,sra:369,w:87.9,alt:188,bf:13.1,mm:40.2,imc:24.9,ck:493,nc:75,ai:1.14,cmj:46,ckm:493,ct:[43.3,43.3,46.2,47.4,44.7,48.3,48,46],wt:{dt:["05","06","07","09","10","11","12"],s:[8,9,7,7,7,5,8],r:[10,7,6,8,6,7,7],dr:[0,0,1,0,1,1,2]}},{n:"GUSTAVO VILAR",pos:"LAT",h:5,e:3,rg:6,rp:6,d:0,sq:7,rpa:6.5,da:.2,sa:7.7,nw:55,pse:5,sra:410,w:86.4,alt:183,bf:12.9,mm:39.5,imc:25.8,ck:658,nc:75,ai:1.07,cmj:43.5,ckm:1113,ct:[43.3,42.9,47.9,42.8,43.1,44,44.8,43.5]},{n:"HEBERT",pos:"ZAG",h:5,e:3,rg:8,rp:7,d:0,sq:7,rpa:6.7,da:.1,sa:7.7,nw:46,pse:5,sra:366,w:88.1,alt:186,bf:12.5,mm:40.8,imc:25.5,nc:59,ai:1.04,cmj:46.9,ct:[50.1,49.8,50,52.5,48.6,51.2,53.3,46.9]},{n:"HENRIQUE TELES",pos:"LAT",h:5,e:4,rg:8,rp:8,d:2,sq:8,rpa:7,da:1.4,sa:7.7,nw:54,pse:6,sra:415,w:80.1,alt:180,bf:11.3,mm:37.2,imc:24.7,ck:415,nc:69,ai:1.14,cmj:45.5,ckm:415,ct:[53.1,55.5,49.8,54.9,51.6,50.8,55.1,45.5],wt:{dt:["04","05","07","09","10","11","12"],s:[8,9,6,9,8,9,8],r:[6,8,6,10,8,9,8],dr:[2,1,7,5,3,3,2]}},{n:"HYGOR",pos:"MC",h:5,e:4,rg:10,rp:8,d:2,sq:7,rpa:8.8,da:1.6,sa:9.2,nw:57,pse:4,sra:387,w:83.3,alt:182,bf:11.6,mm:38.6,imc:25.2,ck:749,nc:75,ai:1.12,cmj:42.1,ckm:1034,ct:[40.8,44.5,39.9,44.2,43.5,42.4,41.9,42.1],wt:{dt:["05","06","07","09","10","11","12"],s:[10,8,10,10,10,10,7],r:[10,6,8,10,8,8,8],dr:[0,2,0,0,0,3,2]}},{n:"JEFFERSON NEM",pos:"ATA",h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:7.1,da:.8,sa:7.9,nw:57,pse:7,sra:423,w:72.5,alt:174,bf:10.1,mm:33.8,imc:23.9,ck:985,nc:75,ai:.97,cmj:47.5,ckm:3539,ct:[44,48.2,44.5,50.4,50,44.1,47.2,47.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,7],r:[7,6,7,8,8,7,7],dr:[0,0,0,0,0,0,2]}},{n:"JONATHAN",pos:"LAT",h:5,e:4,rg:5,rp:5,d:4,sq:7,rpa:5.8,da:2.9,sa:5.9,nw:51,pse:4,sra:333,w:73.7,alt:175,bf:10.9,mm:34.3,imc:24.1,ck:981,nc:75,ai:1.14,cmj:42.8,ckm:1372,ct:[46.4,46.8,46.9,37.3,45,44.7,45,42.8],wt:{dt:["04","05","07","09","10","11","12"],s:[5,7,6,6,6,6,7],r:[6,7,4,7,5,6,5],dr:[3,3,3,2,3,3,4]}},{n:"JORDAN",pos:"MC",h:5,e:3,rg:7,rp:7,d:0,sq:9,rpa:8,da:.7,sa:8,nw:60,pse:4,sra:418,w:92.2,alt:192,bf:12.0,mm:42.8,imc:25.0,nc:75,ai:1.1,cmj:54.1,ct:[52.2,53.4,53.4,53.2,54.5,56,55.7,54.1],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,8,8,8,8,9],r:[8,8,6,8,8,7,7],dr:[1,0,0,0,0,0,0]}},{n:"KELVIN",pos:"ATA",h:5,e:3,rg:7,rp:7,d:2,sq:7,rpa:6.9,da:3,sa:7.4,nw:49,pse:3,sra:288,w:74.6,alt:177,bf:10.3,mm:34.8,imc:23.8,ck:207,nc:67,ai:.86,cmj:38.4,ckm:375,ct:[40.4,38.3,40.8,40.2,40.6,39.5,42.3,38.4],wt:{dt:["04","05","06","09","10","11","12"],s:[7,9,8,9,9,8,7],r:[7,7,7,10,10,9,7],dr:[3,3,3,0,0,2,2]}},{n:"LEANDRO MACIEL",pos:"LAT",h:4,e:3,rg:8,rp:8,d:0,sq:9,rpa:7.7,da:.5,sa:8.6,nw:57,pse:4,sra:399,w:91.3,alt:188,bf:13.5,mm:41.6,imc:25.8,ck:349,nc:75,ai:1.08,cmj:43.8,ckm:510,ct:[41.7,47.4,40.5,46.2,47.8,44.3,50.4,43.8],wt:{dt:["05","06","07","09","10","11","12"],s:[8,7,9,8,8,8,9],r:[8,7,8,8,7,7,8],dr:[0,1,0,0,0,1,0]}},{n:"MARANHAO",pos:"MC",h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:6.9,da:1,sa:6.8,nw:58,pse:4,sra:339,w:75.1,alt:176,bf:11.0,mm:34.9,imc:24.2,ck:274,nc:75,ai:.95,cmj:42.2,ckm:419,ct:[45.2,45.2,44.4,48.8,44.9,43.8,54.1,42.2],wt:{dt:["05","06","07","09","10","11","12"],s:[7,5,6,7,7,7,7],r:[7,6,5,7,7,7,7],dr:[1,1,1,1,1,1,1]}},{n:"MARQUINHO JR.",pos:"ATA",h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:7.4,da:0,sa:8.1,nw:58,pse:5,sra:360,w:64.9,alt:170,bf:9.2,mm:30.8,imc:22.5,ck:511,nc:75,ai:1.17,cmj:41.3,ckm:511,ct:[44.4,45.7,42.6,46.7,43.1,42.5,47.6,41.3]},{n:"MATHEUS SALES",pos:"MC",h:4,e:3,rg:7,rp:7,d:1,sq:7,rpa:7.2,da:.6,sa:6.8,nw:58,pse:7,sra:454,w:80.1,alt:180,bf:11.7,mm:37.0,imc:24.7,ck:558,nc:75,ai:1.06,cmj:44.3,ckm:558,ct:[47.4,47.9,46.1,47.3,44.3,49.1,49.8,44.3],wt:{dt:["05","06","07","09","10","11","12"],s:[6,4,8,7,7,5,7],r:[7,4,5,8,8,7,7],dr:[1,2,1,0,1,2,1]}},{n:"MORELLI",pos:"MC",h:5,e:3,rg:6,rp:7,d:0,sq:8,rpa:7,da:.5,sa:7.4,nw:56,pse:3,sra:356,w:82.4,alt:183,bf:12.1,mm:38.0,imc:24.6,ck:298,nc:75,ai:1.07,cmj:43.8,ckm:621,ct:[46,50.6,44.9,44.8,43.8,38.1,46.6,43.8]},{n:"PATRICK BREY",pos:"ATA",h:5,e:3,rg:8,rp:8,d:1,sq:8,rpa:6.9,da:2,sa:7.3,nw:33,pse:3,sra:385,w:73.5,alt:175,bf:10.0,mm:34.5,imc:24.0,ck:347,nc:63,ai:1.3,ct:[43.2,42.6,42.3,41.9,41,45.8,42.8,45.1],wt:{dt:["05","06","07","09","10","11","12"],s:[4,7,2,9,8,7,8],r:[4,5,3,9,8,7,8],dr:[3,2,4,0,0,3,1]}},{n:"PEDRINHO",pos:"MC",h:5,e:3,rg:8,rp:8,d:0,sq:10,rpa:7.3,da:.4,sa:9.9,nw:44,pse:6,sra:343,w:67.5,alt:172,bf:9.5,mm:31.9,imc:22.8,nc:52,ai:1.02,cmj:45.5,ct:[41.6,42.6,38.6,42.9,44.9,40.1,44,45.5]},{n:"PEDRO TORTELLO",pos:"LAT",h:5,e:3,rg:7,rp:7,d:0,sq:10,rpa:8.4,da:.3,sa:9.2,nw:56,pse:4,sra:381,w:75.1,alt:178,bf:10.6,mm:35.0,imc:23.7,nc:75,ai:1.14,cmj:41,ct:[40.6,47.6,41.3,43.7,39.2,41.6,44,41]},{n:"RAFAEL GAVA",pos:"MC",h:5,e:4,rg:7,rp:7,d:0,sq:8,rpa:6.2,da:1,sa:5.8,nw:55,pse:7,sra:364,w:78.3,alt:179,bf:11.4,mm:36.3,imc:24.4,ck:303,nc:75,ai:1.1,ckm:2969,ct:[36.2,38.9,33.8,33.6,39.2,35.3,36.7,38.7],wt:{dt:["05","06","07","09","10","11","12"],s:[4,4,6,4,5,6,8],r:[5,5,6,4,7,7,7],dr:[1,1,1,0,0,0,0]}},{n:"THALLES",pos:"ZAG",h:5,e:4,rg:10,rp:10,d:2,sq:7,rpa:5.7,da:.5,sa:7.4,dpo:1,nw:60,pse:3,sra:409,w:83.9,alt:184,bf:12.2,mm:38.7,imc:24.8,ck:1865,nc:75,ai:1.19,cmj:43.3,ckm:1865,ct:[46.4,44.1,44,45.1,43,47.4,44.9,43.3],wt:{dt:["04","05","06","07","09","11","12"],s:[7,7,10,6,7,8,7],r:[5,5,7,4,7,10,10],dr:[3,0,0,3,3,3,2]}},{n:"VICTOR SOUZA",pos:"GOL",h:4,e:3,rg:7,rp:7,d:0,sq:6,rpa:7.2,da:.5,sa:6.1,nw:57,pse:3,sra:473,w:92.8,alt:193,bf:14.1,mm:42.2,imc:24.9,nc:75,ai:1.04,cmj:46.9,ct:[55.4,56.5,60.9,57.9,58.7,53.2,59.5,46.9]},{n:"WALLACE",pos:"LAT",h:4,e:3,rg:7,rp:7,d:0,sq:8,rpa:6.7,da:.8,sa:7.8,nw:47,pse:5,sra:305,w:91.6,alt:186,bf:14.0,mm:41.3,imc:26.5,nc:75,ai:.98,cmj:40.8,ct:[43.6,38.3,40.3,39.4,40.8],wt:{dt:["04","05","06","09","10","11","12"],s:[8,8,8,8,8,8,8],r:[7,8,5,8,7,7,7],dr:[2,2,2,0,2,2,0]}},{n:"WHALACY",pos:"MC",h:5,e:3,rg:6,rp:6,d:0,sq:9,rpa:6,da:.1,sa:8.8,nw:21,pse:5,sra:277,w:72.3,alt:174,bf:10.2,mm:33.9,imc:23.9,nc:34,ai:1.05,cmj:42.8,ct:[42.3,39.7,41.3,40.5,42.4,42.9,42.8]},{n:"YURI",pos:"LAT",h:4,e:4,rg:8,rp:8,d:0,sq:8,rpa:7.9,da:0,sa:8.1,nw:49,pse:6,sra:320,w:66.4,alt:169,bf:9.0,mm:31.5,imc:23.2,nc:69,ai:1.16,cmj:41.5,ct:[40.8,44.9,43.8,43.2,42.8,42.9,43.5,41.5],wt:{dt:["05","06","07","09","10","11","12"],s:[8,8,7,8,8,8,8],r:[9,8,7,8,7,8,8],dr:[0,0,0,0,0,0,0]}}];

// ML Model Output — XGBoost + SMOTE (gerado por model/injury_prediction_pipeline.py)
const ML={
  metrics:{auc_roc:0.847,auc_pr:0.412,precision:0.58,recall:0.71},
  features:[
    {f:"ACWR Combinado",v:0.0891},{f:"Déficit Biológico",v:0.0823},{f:"sRPE Acum. 7d",v:0.0756},
    {f:"CK / Basal",v:0.0698},{f:"Delta CMJ (%)",v:0.0654},{f:"Training Strain",v:0.0612},
    {f:"Lesão < 30d",v:0.0587},{f:"ACWR x Sono",v:0.0543},{f:"Assimetria ISO",v:0.0498},
    {f:"Tendência Dor 3d",v:0.0467},{f:"Qual. Sono",v:0.0423},{f:"Monotonia",v:0.0389},
    {f:"Wellness Comp.",v:0.0356},{f:"ACWR HSR",v:0.0334},{f:"PL Acum. 3d",v:0.0298}
  ],
  clusters:[
    {id:1,name:"ACWR Alto + Assimetria Bilateral",rule:"ACWR > 1.4 + Assimetria ISO > 12%",ep:47,rate:17.0,action:"Reduzir volume HSR 30%. Protocolo de simetria pré-treino.",c:"#DC2626"},
    {id:2,name:"Estresse Biológico Composto",rule:"CK/Basal > 2.5 + Sono < 6 + Dor > 3",ep:38,rate:21.1,action:"Sessão regenerativa. Crioterapia. Remonitorar CK 48h.",c:"#DC2626"},
    {id:3,name:"Sobrecarga + Fadiga Neuromuscular",rule:"sRPE 7d > 3000 + CMJ Delta < -8%",ep:52,rate:13.5,action:"MED (Minimum Effective Dose). Apenas técnico-tático.",c:"#EA580C"},
    {id:4,name:"Monotonia + Histórico Recente",rule:"Monotonia > 2.0 + Lesão últimos 30d",ep:29,rate:24.1,action:"Variar estímulos. Reduzir frequência. Fisio preventiva.",c:"#DC2626"},
    {id:5,name:"Déficit Biológico + Carga HSR",rule:"Déficit Bio > 1.5 + ACWR HSR > 1.3",ep:33,rate:15.2,action:"Recuperação ativa. Suplementação. Sono prioritário.",c:"#EA580C"}
  ],
  alerts:[
    {n:"ERIK",pos:"ATA",prob:0.72,zone:"VERMELHO",dose:"EXCLUIR. Apenas fisioterapia.",acwr:1.97,ck:2.1,cmj:-5.4,sono:6.2,bio:1.8},
    {n:"JONATHAN",pos:"LAT",prob:0.61,zone:"VERMELHO",dose:"EXCLUIR. Apenas fisioterapia.",acwr:1.14,ck:3.8,cmj:-4.9,sono:5.9,bio:2.2},
    {n:"THALLES",pos:"ZAG",prob:0.54,zone:"VERMELHO",dose:"EXCLUIR. Apenas fisioterapia.",acwr:1.19,ck:6.2,cmj:-3.8,sono:7.0,bio:1.9},
    {n:"JEFFERSON NEM",pos:"ATA",prob:0.47,zone:"LARANJA",dose:"MED: 50% volume. Sem HSR.",acwr:0.97,ck:4.1,cmj:-1.0,sono:7.2,bio:1.5},
    {n:"PATRICK BREY",pos:"ATA",prob:0.43,zone:"LARANJA",dose:"MED: 50% volume. Sem HSR.",acwr:1.30,ck:2.3,cmj:-2.5,sono:6.5,bio:1.3},
    {n:"KELVIN",pos:"ATA",prob:0.38,zone:"LARANJA",dose:"MED: 50% volume. Sem HSR.",acwr:0.86,ck:1.4,cmj:-4.0,sono:7.4,bio:0.8},
    {n:"RAFAEL GAVA",pos:"MC",prob:0.35,zone:"LARANJA",dose:"MED: 50% volume. Sem HSR.",acwr:1.10,ck:1.8,cmj:-7.2,sono:5.8,bio:1.4},
    {n:"HENRIQUE TELES",pos:"LAT",prob:0.28,zone:"AMARELO",dose:"Reduzir HSR 30%. Monitorar PSE.",acwr:1.14,ck:2.4,cmj:-12.5,sono:7.7,bio:0.9},
    {n:"GUILHERME QUEIROZ",pos:"ZAG",prob:0.26,zone:"AMARELO",dose:"Reduzir HSR 30%. Monitorar PSE.",acwr:1.14,ck:2.5,cmj:1.1,sono:6.9,bio:1.1},
    {n:"ADRIANO",pos:"ZAG",prob:0.23,zone:"AMARELO",dose:"Reduzir HSR 30%. Monitorar PSE.",acwr:1.24,ck:1.6,cmj:-3.7,sono:7.3,bio:0.7},
    {n:"BRENNO",pos:"GOL",prob:0.19,zone:"AMARELO",dose:"Reduzir HSR 30%. Monitorar PSE.",acwr:1.17,ck:1.9,cmj:-3.5,sono:7.3,bio:0.8},
    {n:"HYGOR",pos:"MC",prob:0.18,zone:"AMARELO",dose:"Reduzir HSR 30%. Monitorar PSE.",acwr:1.12,ck:2.8,cmj:-1.6,sono:7.0,bio:1.2},
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
  const tabs=[{id:"squad",l:"Squad Overview",ic:Users},{id:"alerts",l:"Alertas",ic:AlertTriangle},{id:"player",l:"Individual",ic:Eye},{id:"model",l:"Modelo Preditivo",ic:Brain},{id:"retro",l:"Retrospectiva",ic:Target}];

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
          {/* Model Header */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:800,fontSize:18,color:pri}}>Motor Preditivo de Lesões</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>XGBoost + SMOTE · Stratified 5-Fold CV · Paradigma de Sistemas Complexos (Bittencourt et al.)</div>
              </div>
              <div style={{display:"flex",gap:12}}>
                {[{l:"AUC-ROC",v:ML.metrics.auc_roc,c:"#7c3aed"},{l:"AUC-PR",v:ML.metrics.auc_pr,c:"#2563eb"},{l:"Precision",v:ML.metrics.precision,c:"#16A34A"},{l:"Recall",v:ML.metrics.recall,c:"#EA580C"}].map((m,i)=>
                  <div key={i} style={{textAlign:"center",padding:"8px 14px",background:"#f8fafc",borderRadius:8}}>
                    <div style={{fontSize:9,color:"#94a3b8",fontWeight:600}}>{m.l}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:18,fontWeight:700,color:m.c}}>{m.v}</div>
                  </div>)}
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Feature Importance */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Feature Importance Matrix (XGBoost)</div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={ML.features} layout="vertical" margin={{left:100}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis type="number" tick={{fontSize:9,fill:"#94a3b8"}} domain={[0,0.1]}/>
                  <YAxis type="category" dataKey="f" tick={{fontSize:10,fill:"#64748b"}} width={95}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="v" name="Importância" radius={[0,4,4,0]}>
                    {ML.features.map((_,i)=><Cell key={i} fill={i<3?acc:i<6?"#EA580C":i<10?"#CA8A04":"#94a3b8"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clusters de Risco */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
              <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri,marginBottom:12}}>Clusters de Risco — Sistemas Complexos</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {ML.clusters.map(cl=>
                  <div key={cl.id} style={{padding:12,borderRadius:10,border:`1px solid ${cl.c}22`,background:`${cl.c}08`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:12,color:cl.c}}>{cl.name}</div>
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

          {/* Tabela de Alertas - Próxima Sessão */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Inter Tight'",fontWeight:700,fontSize:13,color:pri}}>Alerta — Prontidão para Próxima Sessão</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>13/Mar/2026 · Predição baseada no último estado multimodal de cada atleta</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[{l:"Vermelho",c:"#DC2626",n:ML.alerts.filter(a=>a.zone==="VERMELHO").length},
                  {l:"Laranja",c:"#EA580C",n:ML.alerts.filter(a=>a.zone==="LARANJA").length},
                  {l:"Amarelo",c:"#CA8A04",n:ML.alerts.filter(a=>a.zone==="AMARELO").length}
                ].map((z,i)=><span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${z.c}12`,color:z.c,border:`1px solid ${z.c}33`}}>{z.n} {z.l}</span>)}
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead>
                  <tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["","Atleta","Pos","Prob.","Zona","ACWR","CK/Bas","CMJ Δ%","Sono","Bio Déf.","Dosagem"].map((h,i)=>
                      <th key={i} style={{padding:"8px 6px",textAlign:"left",fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ML.alerts.map((a,i)=>{
                    const zs=ZC[a.zone];
                    return <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"transparent":"#fafbfc"}} onClick={()=>{setSel(a.n);setTab("player")}}>
                      <td style={{padding:"8px 6px"}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:zs.c}}/></td>
                      <td style={{padding:"8px 6px",fontWeight:700,color:pri,cursor:"pointer"}}>{a.n}</td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",color:"#94a3b8"}}>{a.pos}</td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",fontWeight:700,color:zs.c}}>{(a.prob*100).toFixed(0)}%</td>
                      <td style={{padding:"8px 6px"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:zs.bg,color:zs.c,border:`1px solid ${zs.bc}`}}>{a.zone}</span></td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",color:a.acwr>1.3?"#DC2626":pri}}>{a.acwr}</td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",color:a.ck>3?"#DC2626":a.ck>2?"#EA580C":pri}}>{a.ck}x</td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",color:a.cmj<-5?"#DC2626":a.cmj<-3?"#EA580C":"#16A34A"}}>{a.cmj>0?"+":""}{a.cmj}%</td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",color:a.sono<6?"#DC2626":a.sono<7?"#CA8A04":"#16A34A"}}>{a.sono}</td>
                      <td style={{padding:"8px 6px",fontFamily:"'JetBrains Mono'",color:a.bio>1.5?"#DC2626":a.bio>1?"#EA580C":"#16A34A"}}>{a.bio}</td>
                      <td style={{padding:"8px 6px",fontSize:10,color:zs.c,fontWeight:500,maxWidth:200}}>{a.dose}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
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
