# Arquitetura do Sistema

## Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FONTES DE DADOS                              │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────┐               │
│  │  Google Sheets        │    │  Google Sheets        │              │
│  │  "Fisiologia 2026"   │    │  "Dados Performance"  │              │
│  │                       │    │                       │              │
│  │  - GPS                │    │  - Lesoes             │              │
│  │  - Diario (sRPE)     │    │  - CMJ Externo        │              │
│  │  - Saltos (CMJ)      │    │                       │              │
│  │  - Questionarios     │    └───────────┬───────────┘              │
│  │  - Fisioterapia      │                │                          │
│  │  - Antropometria     │                │                          │
│  │  - Calendario        │                │                          │
│  │  - VBT               │                │                          │
│  │  - Bioquimico        │                │                          │
│  └───────────┬───────────┘               │                          │
│              │                           │                          │
└──────────────┼───────────────────────────┼──────────────────────────┘
               │  CSV Export (publico)     │
               ▼                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Next.js API)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  /api/sheets (route.js - 1042 linhas)                        │   │
│  │                                                               │   │
│  │  1. Fetch CSV de cada aba (com fallback URLs)                │   │
│  │  2. Parse CSV robusto (campos com virgula, aspas)            │   │
│  │  3. Mapeamento de nomes (70+ mapeamentos)                   │   │
│  │  4. Processamento por categoria (8 funcoes)                  │   │
│  │  5. Agregacao por atleta                                     │   │
│  │  6. Retorno JSON unificado                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │  JSON Response
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React Client)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  useSheetData.js (Hook)                                      │   │
│  │  - Polling a cada 2 minutos                                  │   │
│  │  - Retry com backoff exponencial                             │   │
│  │  - Cache em estado React                                     │   │
│  │  - Merge de dados de sessao                                  │   │
│  └────────────────────────────────┬─────────────────────────────┘   │
│                                    │                                │
│  ┌─────────────────────────────────▼────────────────────────────┐   │
│  │  Dashboard.jsx (4435 linhas)                                 │   │
│  │                                                               │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │   │
│  │  │ Grid de      │  │ Alertas de   │  │ Resumo da         │   │   │
│  │  │ Jogadores    │  │ Risco (ML)   │  │ Sessao            │   │   │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘   │   │
│  │                                                               │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │   │
│  │  │ Perfil do   │  │ SHAP         │  │ Diagnostico       │   │   │
│  │  │ Atleta      │  │ Explanations │  │ Diferencial       │   │   │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘   │   │
│  │                                                               │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │   │
│  │  │ Protocolos  │  │ Tendencias   │  │ Analise de        │   │   │
│  │  │ Mitigacao   │  │ Temporais    │  │ Jogos             │   │   │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘   │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Bibliotecas: Recharts (graficos) | Lucide (icones)                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     PIPELINE ML (Externo)                           │
│                                                                     │
│  KNNImputer → StandardScaler → SMOTE+Tomek → LASSO → XGBoost     │
│  → Calibracao Isotonica → SHAP TreeExplainer                      │
│                                                                     │
│  Saida: model/risk_output.json + dados embutidos no Dashboard.jsx  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Camadas do Sistema

### 1. Camada de Dados (Google Sheets)

A planilha e a unica fonte de verdade. A comissao tecnica insere dados manualmente apos cada sessao de treino ou jogo. A planilha e publicada publicamente em formato CSV, eliminando necessidade de autenticacao.

**Vantagens:**
- Sem custo de infraestrutura de banco de dados
- Interface familiar para a comissao tecnica
- Edicao colaborativa em tempo real

**Limitacoes:**
- Dependencia de disponibilidade do Google Sheets
- Sem controle de schema/validacao
- Performance limitada para grandes volumes

### 2. Camada de API (Next.js Server)

A API Route (`/api/sheets`) serve como proxy e processador:

- **Proxy**: Evita problemas de CORS no browser
- **Parser**: Converte CSV em JSON estruturado
- **Normalizador**: Mapeia nomes e formatos inconsistentes
- **Agregador**: Unifica dados de 10+ abas em uma resposta

**Estrategia de fallback:**
```
1. CSV publicado (pubhtml) → rapido, cache do Google
2. CSV da planilha editavel → mais lento, sempre atualizado
3. Planilha externa → para dados em planilhas separadas
```

### 3. Camada de Estado (useSheetData Hook)

Gerencia o ciclo de vida dos dados no client-side:

```
┌──────────────────────────────────────────────┐
│                 useSheetData                  │
│                                              │
│  Estado:                                     │
│  ├── sheetData (dados parseados)             │
│  ├── loading (boolean)                       │
│  ├── error (string | null)                   │
│  ├── lastUpdate (Date)                       │
│  └── isLive (boolean)                        │
│                                              │
│  Ciclo:                                      │
│  1. Mount → fetchData()                      │
│  2. Sucesso → setSheetData + resetRetry      │
│  3. Erro → retry com backoff (2s, 5s, 15s)   │
│  4. Timer → re-fetch a cada 2 min            │
│  5. Unmount → limpar timers                  │
│                                              │
│  Merge:                                      │
│  - GPS + sRPE + Wellness → SESSION_DATA      │
│  - Dados por atleta para o dashboard         │
│                                              │
└──────────────────────────────────────────────┘
```

### 4. Camada de Apresentacao (Dashboard.jsx)

Componente monolitico que contem toda a logica de UI:

**Dados pre-computados embutidos no componente:**
- `RISK_ALERTS` — 12 atletas com risco pre-computado pelo modelo
- `INJ_HISTORY` — 30+ registros de lesoes historicas
- `INJ_PATTERNS` — Padroes pre-lesao com prevalencia
- `PROJECTIONS` — Projecoes de 48-72h por atleta
- `ML` — Configuracao do pipeline ML e explicabilidade SHAP

**Renderizacao:**
- Grid responsivo com CSS inline
- Graficos interativos via Recharts
- Modais para detalhamento por atleta
- Tema escuro/claro

### 5. Pipeline de Machine Learning (Externo)

O modelo e treinado externamente (Python/scikit-learn/XGBoost) e seus outputs sao:

1. **`model/risk_output.json`** — Metricas, importancias de features
2. **Dados embutidos no `Dashboard.jsx`** — Alertas, projecoes, valores SHAP

**Fluxo de atualizacao do modelo:**
```
Dados historicos → Treinamento (Python) → Exportacao JSON → Commit no repo
→ Atualizacao manual dos alertas no Dashboard.jsx
```

---

## Decisoes Arquiteturais

### Por que Google Sheets como banco de dados?

A comissao tecnica ja utilizava planilhas para registrar dados. Manter o Google Sheets como fonte eliminou a curva de aprendizado e permitiu deploy rapido.

### Por que um componente monolitico?

O dashboard foi desenvolvido iterativamente, adicionando secoes conforme demanda. A modularizacao e uma melhoria futura identificada.

### Por que dados de ML embutidos no codigo?

O modelo e retreinado periodicamente (nao em tempo real). Embutir os resultados evita a necessidade de um servico ML separado. A equipe de data science atualiza os dados e faz commit.

### Por que polling ao inves de WebSocket?

A frequencia de atualizacao (a cada sessao de treino) nao justifica a complexidade de WebSocket. Polling a cada 2 minutos e suficiente e mais simples.

---

## Fluxo de Dados Detalhado

### Sessao de Treino (Tempo Real)

```
1. Comissao tecnica insere dados na planilha durante/apos treino
2. Dashboard faz polling (/api/sheets?tab=all)
3. API busca CSV atualizado do Google Sheets
4. Dados sao parseados e agregados por atleta
5. useSheetData recebe JSON e atualiza estado
6. Dashboard re-renderiza com dados novos
7. Alertas pre-computados (ML) sao exibidos junto com dados live
```

### Atualizacao do Modelo ML

```
1. Data scientist coleta dados historicos da planilha
2. Pipeline Python: limpeza → features → treino → calibracao
3. Exporta risk_output.json + atualiza RISK_ALERTS no Dashboard.jsx
4. Commit e deploy
5. Dashboard passa a exibir novas predições
```
