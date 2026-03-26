# Performance Dashboard - Botafogo-SP

Dashboard de monitoramento de desempenho e risco de lesao em tempo real para o elenco profissional do Botafogo Futebol SA (Ribeirão Preto - SP).

Integra dados de GPS, carga interna (sRPE), metricas neuromusculares (CMJ), dados de bem-estar (sono, dor, recuperacao) e historico de lesoes para predizer risco de lesao utilizando machine learning (XGBoost + SHAP).

---

## Sumario

- [Visao Geral](#visao-geral)
- [Stack Tecnologica](#stack-tecnologica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalacao e Execucao](#instalacao-e-execucao)
- [Arquitetura](#arquitetura)
- [Fontes de Dados](#fontes-de-dados)
- [API Interna](#api-interna)
- [Modelo de Machine Learning](#modelo-de-machine-learning)
- [Componentes do Dashboard](#componentes-do-dashboard)
- [Schemas de Dados](#schemas-de-dados)
- [Deploy](#deploy)

---

## Visao Geral

O sistema foi projetado para auxiliar o departamento de fisiologia e performance do Botafogo-SP no monitoramento diario dos atletas. Principais funcionalidades:

- **Monitoramento em tempo real** de sessoes de treino (GPS + carga interna)
- **Classificacao de risco de lesao** por atleta (zonas: Verde, Amarelo, Laranja, Vermelho)
- **Predição via ML** com XGBoost calibrado + explicabilidade SHAP
- **Projecoes de 48-72h** de fadiga, CMJ e eficiencia neuromuscular
- **Historico completo de lesoes** com diagnostico diferencial e padroes pre-lesao
- **Protocolos de mitigacao** automaticos por perfil de risco
- **Analise de jogos** com correlacao de disponibilidade do elenco
- **Atualizacao automatica** a cada 2 minutos via Google Sheets

---

## Stack Tecnologica

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| **Next.js** | ^14.2.0 | Framework React, SSR, API Routes |
| **React** | ^18.2.0 | Biblioteca de UI |
| **Recharts** | ^2.12.0 | Graficos responsivos (Bar, Line, Pie, Radar) |
| **Lucide React** | ^0.363.0 | Icones (Zap, TrendingUp, Shield, etc.) |
| **Google Sheets** | - | Fonte de dados (export CSV publico) |
| **XGBoost** | - | Modelo de predição de risco (pipeline externo) |

---

## Estrutura do Projeto

```
performance_dashboard/
├── app/
│   ├── api/
│   │   └── sheets/
│   │       └── route.js          # API proxy para Google Sheets (1042 linhas)
│   ├── layout.js                 # Layout raiz HTML (metadata, lang pt-BR)
│   └── page.js                   # Pagina principal (renderiza Dashboard)
├── components/
│   ├── Dashboard.jsx             # Componente principal do dashboard (4435 linhas)
│   └── useSheetData.js           # Hook customizado de busca de dados (280 linhas)
├── model/
│   └── risk_output.json          # Saida do modelo ML (metricas + importancia de features)
├── public/
│   ├── icon.png                  # Icone da aplicacao
│   └── players/                  # Fotos dos atletas (~35 arquivos PNG)
│       ├── ADRIANO.png
│       ├── ERIK.png
│       └── ...
├── package.json                  # Dependencias e scripts
├── next.config.js                # Configuracao Next.js (reactStrictMode)
└── *.xlsx                        # Planilhas fonte (backup offline)
```

---

## Instalacao e Execucao

### Pre-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x

### Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/caiofelipead/performance_dashboard.git
cd performance_dashboard

# Instalar dependencias
npm install
```

### Execucao

```bash
# Desenvolvimento (http://localhost:3000)
npm run dev

# Build de producao
npm run build

# Rodar build de producao
npm start
```

### Variaveis de Ambiente

O projeto nao requer variaveis de ambiente. Os dados sao buscados de planilhas Google Sheets publicadas publicamente via export CSV.

---

## Arquitetura

### Pipeline de Dados

```
Google Sheets (planilha publicada)
        │
        ▼
  CSV Export (publico)
        │
        ▼
  Next.js API Route (/api/sheets)
  ├── Fetch CSV de 10+ abas
  ├── Parse robusto (campos com virgula, aspas, quebras de linha)
  ├── Mapeamento de nomes (planilha → dashboard)
  ├── Processamento por categoria (GPS, sRPE, CMJ, etc.)
  └── Agregacao por atleta
        │
        ▼
  useSheetData Hook (client-side)
  ├── Polling a cada 2 minutos
  ├── Retry com backoff exponencial (2s, 5s, 15s)
  ├── Merge de dados (GPS + PSE + Wellness)
  └── Cache em estado React
        │
        ▼
  Dashboard.jsx (renderizacao)
  ├── Grid de jogadores com status
  ├── Alertas de risco (ML + regras)
  ├── Graficos e tendencias
  └── Modais detalhados por atleta
```

### Fluxo de Dados em Tempo Real

1. A comissao tecnica preenche a planilha Google Sheets com dados da sessao
2. A API Route busca o CSV publicado (sem autenticacao)
3. O hook `useSheetData` faz polling a cada 2 minutos
4. Dados novos sao mergeados com dados pre-computados (risco ML, historico)
5. O dashboard atualiza automaticamente a visualizacao

---

## Fontes de Dados

O sistema consome dados de **10 abas** distribuidas em **2 planilhas** Google Sheets:

### Planilha Principal: "Copia de Fisiologia - 2026"

| Aba | GID | Conteudo |
|-----|-----|----------|
| **GPS** | 0 | Distancia total, HSR, sprints, aceleracoes, player load, FC |
| **Diario** | 555914149 | sRPE, duracao, carga (sRPE x duracao), variacao de peso, CK |
| **Saltos** | 1915291461 | CMJ, SJ, SLCMJ (assimetria perna direita/esquerda) |
| **Questionarios** | 1014986912 | Sono (qualidade/duracao), dor, recuperacao, humor, peso |
| **Antropometria** | 461631273 | Peso, % gordura, massa muscular, altura, IMC |
| **Fisioterapia** | 1541953765 | Sessoes de fisioterapia: data, procedimentos, timing |
| **VBT** | 2056067101 | Velocity-Based Training |
| **Bioquimico** | 193203862 | Marcadores bioquimicos |
| **Calendario** | 460942009 | Jogos: data, adversario, placar, mando |

### Planilha Externa: Dados de Lesoes

| Aba | Conteudo |
|-----|----------|
| **Lesoes** | Historico completo: data, gravidade, regiao, mecanismo, estrutura, conduta |

### Planilha Externa: CMJ Externo

| Aba | Conteudo |
|-----|----------|
| **CMJ** | Dados de salto de plataforma de forca externa |

---

## API Interna

### `GET /api/sheets`

Proxy server-side para Google Sheets. Evita problemas de CORS e permite cache no servidor.

#### Query Parameters

| Parametro | Valor | Descricao |
|-----------|-------|-----------|
| `tab` | `all` | Busca todas as abas de uma vez (recomendado) |
| `tab` | `gps` | Busca apenas dados de GPS |
| `tab` | `diario` | Busca apenas dados do diario (sRPE) |
| `tab` | `saltos` | Busca apenas dados de saltos |
| `tab` | `questionarios` | Busca apenas questionarios de bem-estar |

#### Resposta de Sucesso (200)

```json
{
  "ok": true,
  "timestamp": "2026-03-26T14:30:00.000Z",
  "gps": {
    "ADRIANO": [
      {
        "data": "24/03/2026",
        "dist_total": 5420,
        "hsr": 320,
        "sprints": 12,
        "player_load": 450,
        "hr_avg": 145,
        "hr_max": 185
      }
    ]
  },
  "diario": { "ADRIANO": [...] },
  "saltos": { "ADRIANO": [...] },
  "questionarios": { "ADRIANO": [...] },
  "fisioterapia": { "ADRIANO": [...] },
  "antropometria": { "ADRIANO": [...] },
  "lesoes": [...],
  "cmj_externo": { "ADRIANO": [...] },
  "calendario": [...],
  "_debug": {
    "gps_names": ["ADRIANO", "ERIK", "..."],
    "diario_count": 30
  }
}
```

#### Resposta de Erro

```json
{
  "ok": false,
  "error": "Failed to fetch GPS data: HTTP 403"
}
```

#### Processadores de Dados

A API possui 8 funcoes de processamento especializadas:

| Funcao | Entrada (CSV) | Saida |
|--------|---------------|-------|
| `processGPS()` | Aba GPS | Distancia, HSR, sprints, aceleracoes, FC, baselines |
| `processDiario()` | Aba Diario | sRPE, duracao, carga total, variacao de peso, CK |
| `processSaltos()` | Aba Saltos | CMJ, SJ, assimetria SLCMJ |
| `processQuestionarios()` | Aba Questionarios | Sono, dor, recuperacao, humor |
| `processFisioterapia()` | Aba Fisioterapia | Sessoes, procedimentos, datas |
| `processAntropometria()` | Aba Antropometria | Peso, gordura, massa muscular, IMC |
| `processLesoes()` | Planilha externa | Historico completo de lesoes |
| `processCalendario()` | Aba Calendario | Jogos, adversarios, placares |

#### Mapeamento de Nomes

A API converte nomes da planilha para o formato do dashboard:

```
"Adriano A"     → "ADRIANO"
"Erik R"        → "ERIK"
"Jonas Toró"    → "JONAS TORO"
"Marquinho A"   → "MARQUINHO JR."
```

Sao mais de **70 mapeamentos** incluindo variacoes com acentos e nomes truncados.

---

## Modelo de Machine Learning

### Pipeline

```
Dados Brutos
    │
    ▼
KNNImputer (imputacao de valores faltantes)
    │
    ▼
StandardScaler (normalizacao)
    │
    ▼
SMOTE + Tomek Links (balanceamento de classes)
    │
    ▼
LASSO (selecao de features: 50 de 89)
    │
    ▼
XGBoost (classificador)
    │
    ▼
Calibracao Isotonica (calibracao de probabilidades)
    │
    ▼
SHAP TreeExplainer (explicabilidade)
```

### Metricas do Modelo

| Metrica | Valor |
|---------|-------|
| AUC-ROC | 0.666 |
| AUC-PR | 0.04 |
| Recall | 0.172 |
| Precision | 0.076 |
| F1-Score | 0.106 |
| Especificidade | 0.961 |
| MCC | 0.089 |
| Threshold | 0.28 |
| Calibracao | Isotonica |
| scale_pos_weight | 52.66 |
| Features selecionadas | 50 / 89 |

### Top 10 Features (Importancia)

| # | Feature | Importancia |
|---|---------|-------------|
| 1 | `injury_last_180d` | 13.67% |
| 2 | `days_since_last_injury` | 9.61% |
| 3 | `ck_lag7` | 6.80% |
| 4 | `recovery_legs` | 4.12% |
| 5 | `strain` | 3.73% |
| 6 | `ck_ratio` | 3.66% |
| 7 | `slcmj_asymmetry` | 3.30% |
| 8 | `iso_asymmetry_pct` | 3.09% |
| 9 | `acwr_hsr` | 2.92% |
| 10 | `sleep_quality` | 2.75% |

### Zonas de Risco

| Zona | Cor | Probabilidade | Acao |
|------|-----|---------------|------|
| **VERMELHO** | Vermelho | >= 0.65 | Restricao de treino, acompanhamento medico |
| **LARANJA** | Laranja | 0.40 - 0.64 | Reducao de carga, monitoramento intensivo |
| **AMARELO** | Amarelo | 0.28 - 0.39 | Atencao, ajuste pontual |
| **VERDE** | Verde | < 0.28 | Liberado para treino normal |

### Explicabilidade (SHAP)

Cada atleta possui valores SHAP individualizados:

- **shap_pos**: Features que aumentam o risco (ex: ACWR alto, sono ruim)
- **shap_neg**: Features protetoras (ex: CMJ estavel, boa recuperacao)

---

## Componentes do Dashboard

### `Dashboard.jsx`

Componente monolitico principal com as seguintes secoes:

#### 1. Grid de Jogadores
- Cards de status para cada atleta do elenco (~30 jogadores)
- Cor de fundo indica zona de risco (Verde/Amarelo/Laranja/Vermelho)
- Foto do atleta, posicao, probabilidade de risco

#### 2. Resumo da Sessao
- Carga total da sessao (sRPE medio)
- Calendario de jogos
- Contagem de atletas por zona de risco

#### 3. Alertas de Risco
- Lista priorizada de atletas em risco
- Classificacao: Aguda, Sobrecarga, Neuromuscular, Biomecanica
- ACWR, CMJ delta, qualidade do sono, deficit biologico

#### 4. Perfil do Atleta (Modal)
- **Metricas GPS**: Distancia, HSR, sprints, aceleracoes vs baseline
- **Carga Interna**: sRPE, duracao, ACWR
- **Neuromuscular**: CMJ pre/pos, assimetria SLCMJ, NME
- **Bem-estar**: Sono, dor, recuperacao percebida
- **Historico de Lesoes**: Timeline completa com gravidade
- **Explicabilidade SHAP**: Contribuicao de cada feature ao risco
- **Projecoes 48-72h**: Tendencia de fadiga, CMJ, NME

#### 5. Diagnostico Diferencial
- Classificacao Aguda vs Sobrecarga
- Baseado em padroes de ACWR, CMJ, sono, volume

#### 6. Protocolos de Mitigacao
- **Mecanica**: Ajustes biomecanicos
- **Reducao de Carga**: % de reducao de HSR, volume
- **Compensatorio**: Exercicios corretivos, sono, nutricao

#### 7. Analise Retrospectiva
- Padroes pre-lesao historicos
- Prevalencia: sono < 6h, ACWR > 1.35, queda de CMJ
- Licoes aprendidas por caso

#### 8. Tendencias Temporais
- Graficos de 7 dias: fadiga acumulada, sRPE, CMJ, sono
- Visualizacao com Recharts (Line, Bar)

#### 9. Analise de Jogos
- Correlacao de disponibilidade do elenco com resultados
- Contagem de vitorias/derrotas/empates

#### 10. Tema
- Modo escuro/claro
- Sistema de cores customizado (inline styles)

### `useSheetData.js`

Hook customizado React para busca e gerenciamento de dados:

```javascript
const { sheetData, loading, error, lastUpdate, refresh, isLive } = useSheetData({
  interval: 120000,  // 2 minutos (padrao)
  enabled: true      // ativar/desativar polling
});
```

**Funcionalidades:**
- Polling automatico configuravel
- Retry com backoff exponencial (2s → 5s → 15s)
- Estado de carregamento e erro
- Funcao `refresh()` para atualizacao manual
- Flag `isLive` indicando conexao ativa
- Merge automatico de dados de sessao (`SESSION_DATA.atletas`)

---

## Schemas de Dados

### GPS

```javascript
{
  data: "24/03/2026",       // Data da sessao
  dist_total: 5420,          // Distancia total (metros)
  dist_baseline: 5200,       // Baseline individual
  hsr: 320,                  // High-Speed Running (metros, >19.8 km/h)
  hsr_baseline: 280,         // Baseline HSR
  sprints: 12,               // Numero de sprints (>25.2 km/h)
  sprints_baseline: 10,      // Baseline sprints
  player_load: 450,          // Player Load (unidade arbitraria)
  pico_vel: 31.2,            // Velocidade maxima (km/h)
  acel: 45,                  // Aceleracoes >2 m/s²
  acel_3: 12,                // Aceleracoes >3 m/s²
  decel: 42,                 // Desaceleracoes >2 m/s²
  decel_3: 10,               // Desaceleracoes >3 m/s²
  hr_avg: 145,               // FC media (bpm)
  hr_max: 185,               // FC maxima (bpm)
  hr_baseline_avg: 140,      // FC media baseline
  tempo_zona_alta: 12.5      // Minutos em zona alta de FC
}
```

### Carga Interna (sRPE)

```javascript
{
  data: "24/03/2026",
  srpe_sessao: 7,            // PSE da sessao (0-10)
  duracao: 90,               // Duracao (minutos)
  srpe_total: 630,           // Carga total (PSE x duracao)
  hr_avg: 145,               // FC media
  hr_max: 185,               // FC maxima
  tempo_zona_alta: 12.5      // Min em zona alta
}
```

### Saltos (Neuromuscular)

```javascript
{
  data: "24/03/2026",
  cmj_pre: 38.5,             // CMJ pre-treino (cm)
  cmj_pos: 36.2,             // CMJ pos-treino (cm)
  cmj_delta_pct: -5.97,      // Variacao percentual
  asi_pos: 8.2,              // Indice de assimetria SLCMJ (%)
  nme_pos: 5.5               // Eficiencia neuromuscular (CMJ/sRPE)
}
```

### Bem-estar (Questionarios)

```javascript
{
  data: "24/03/2026",
  sono_noite: 7,             // Qualidade do sono (1-10)
  dor_pos: 3,                // Dor (1-10)
  rec_percebida: 6,          // Recuperacao percebida (1-10)
  ck_estimado: 350           // CK estimado (U/L)
}
```

### Lesoes

```javascript
{
  id: 1,
  n: "ERIK",                    // Nome do atleta
  pos: "ATA",                   // Posicao
  date: "15/01/2026",           // Data da lesao
  saida_dm: "20/01/2026",       // Saida do departamento medico
  ini_trans: "21/01/2026",      // Inicio da transicao
  fim_trans: "28/01/2026",      // Fim da transicao
  dias_dm: 5,                   // Dias no DM
  dias_trans: 7,                // Dias em transicao
  total: 13,                    // Total de dias fora
  classif: "2A",                // Classificacao de gravidade
  regiao: "Coxa posterior",     // Regiao anatomica
  lado: "D",                    // Lado (D/E)
  evento: "Jogo",               // Contexto (Jogo/Treino)
  mecanismo: "Sprint",          // Mecanismo de lesao
  estrutura: "Semitendíneo",    // Estrutura lesionada
  exame: "RM",                  // Exame de imagem
  estagio: "Competicao",       // Fase da temporada
  conduta: "Fisioterapia",      // Tratamento
  obs: "Retorno progressivo"    // Observacoes
}
```

### Alerta de Risco (por Atleta)

```javascript
{
  n: "ERIK",                          // Nome
  pos: "ATA",                         // Posicao
  prob: 0.72,                         // Probabilidade de lesao (0-1)
  zone: "VERMELHO",                   // Zona de risco
  dose: "Treino regenerativo",        // Intervencao sugerida
  acwr: 1.52,                         // Acute:Chronic Workload Ratio
  cmj: -8.3,                          // Delta CMJ (%)
  sono: 5.2,                          // Media de sono
  bio: -12,                           // Deficit biologico
  classif: "Alta carga + fadiga",     // Classificacao
  perfil_risco: "sobrecarga",         // Perfil (aguda/sobrecarga/neuromuscular/biomecanico)
  fatigue_debt: 24.5,                 // Divida de fadiga acumulada
  nme: 3.8,                           // Eficiencia neuromuscular
  trends: {
    fatigue_debt: [20, 21, 22, 23, 24, 24, 24.5],  // 7 dias
    srpe: [6, 7, 8, 7, 6, 7, 8],
    cmj: [39, 38, 37, 36, 36, 35, 35]
  },
  shap_pos: [                         // Features que aumentam risco
    { f: "acwr_hsr", v: "+0.12" },
    { f: "sono", v: "+0.08" }
  ],
  shap_neg: [                         // Features protetoras
    { f: "cmj_estavel", v: "-0.05" }
  ],
  protocolo: {
    mecanica: "Reducao de sprints em arcos fechados",
    carga_reducao: "HSR -30%, volume -20%",
    compensatorio: "Crioterapia pos, melatonina 3mg"
  }
}
```

### Calendario

```javascript
{
  data: "22/03/2026",
  adversario: "Guarani",
  placar: "2x1",
  mando: "Casa"                  // Casa / Fora
}
```

---

## Deploy

### Vercel (Recomendado)

O projeto e compativel nativamente com Vercel:

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Deploy
vercel
```

Nenhuma variavel de ambiente e necessaria.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Node.js Tradicional

```bash
npm run build
PORT=3000 npm start
```

---

## Observacoes Tecnicas

- **Sem banco de dados**: Todos os dados vem de Google Sheets via CSV publico
- **Sem autenticacao**: A planilha e publicada publicamente
- **Dados hard-coded**: Alertas de risco, historico de lesoes e projecoes estao embutidos no codigo fonte (`Dashboard.jsx`) e sao atualizados periodicamente pela equipe de data science
- **Componente monolitico**: O `Dashboard.jsx` possui 4.435 linhas em um unico componente
- **Sem testes automatizados**: O projeto nao possui suite de testes
- **Sem TypeScript**: Todo o codigo e JavaScript puro (JSX)
- **Estilos inline**: Nao utiliza CSS framework; todos os estilos sao inline

---

## Licenca

Projeto privado - Botafogo Futebol SA. Todos os direitos reservados.
