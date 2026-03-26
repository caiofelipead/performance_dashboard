# Documentacao da API

## Visao Geral

A API interna do Performance Dashboard consiste em uma unica rota server-side que atua como proxy para Google Sheets. Implementada como Next.js API Route, evita problemas de CORS e centraliza o processamento de dados.

**Base URL:** `http://localhost:3000/api` (desenvolvimento) ou dominio de producao.

---

## Endpoints

### `GET /api/sheets`

Busca e processa dados de multiplas abas do Google Sheets, retornando JSON agregado por atleta.

#### Query Parameters

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `tab` | string | Nao | Aba(s) a buscar. Default: `all` |

**Valores aceitos para `tab`:**

| Valor | Descricao |
|-------|-----------|
| `all` | Busca todas as abas (recomendado) |
| `gps` | Apenas dados GPS |
| `diario` | Apenas diario (sRPE/PSE) |
| `saltos` | Apenas dados de saltos (CMJ) |
| `questionarios` | Apenas questionarios de bem-estar |
| `fisioterapia` | Apenas registros de fisioterapia |
| `antropometria` | Apenas dados antropometricos |
| `lesoes` | Apenas historico de lesoes |
| `calendario` | Apenas calendario de jogos |

#### Resposta de Sucesso

**Status:** `200 OK`

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
        "pico_vel": 31.2,
        "acel": 45,
        "acel_3": 12,
        "decel": 42,
        "decel_3": 10,
        "hr_avg": 145,
        "hr_max": 185,
        "tempo_zona_alta": 12.5,
        "dist_baseline": 5200,
        "hsr_baseline": 280,
        "sprints_baseline": 10,
        "hr_baseline_avg": 140
      }
    ],
    "ERIK": [...]
  },
  "diario": {
    "ADRIANO": [
      {
        "data": "24/03/2026",
        "srpe_sessao": 7,
        "duracao": 90,
        "srpe_total": 630,
        "hr_avg": 145,
        "hr_max": 185,
        "tempo_zona_alta": 12.5
      }
    ]
  },
  "saltos": {
    "ADRIANO": [
      {
        "data": "24/03/2026",
        "cmj_pre": 38.5,
        "cmj_pos": 36.2,
        "cmj_delta_pct": -5.97,
        "asi_pos": 8.2,
        "nme_pos": 5.5
      }
    ]
  },
  "questionarios": {
    "ADRIANO": [
      {
        "data": "24/03/2026",
        "sono_noite": 7,
        "dor_pos": 3,
        "rec_percebida": 6,
        "ck_estimado": 350
      }
    ]
  },
  "fisioterapia": {
    "ADRIANO": [
      {
        "data": "24/03/2026",
        "procedimento": "Crioterapia",
        "timing": "Pos-treino"
      }
    ]
  },
  "antropometria": {
    "ADRIANO": [
      {
        "data": "01/03/2026",
        "peso": 78.5,
        "gordura_pct": 10.2,
        "massa_muscular": 38.4,
        "altura": 180,
        "imc": 24.2
      }
    ]
  },
  "lesoes": [
    {
      "n": "ERIK",
      "pos": "ATA",
      "date": "15/01/2026",
      "classif": "2A",
      "regiao": "Coxa posterior",
      "lado": "D",
      "mecanismo": "Sprint",
      "estrutura": "Semitendineo",
      "dias_dm": 5,
      "dias_trans": 7,
      "total": 13
    }
  ],
  "cmj_externo": {
    "ADRIANO": [...]
  },
  "calendario": [
    {
      "data": "22/03/2026",
      "adversario": "Guarani",
      "placar": "2x1",
      "mando": "Casa"
    }
  ],
  "_debug": {
    "gps_names": ["ADRIANO", "ERIK", "JONATHAN"],
    "diario_count": 30
  }
}
```

#### Resposta de Erro

**Status:** `500 Internal Server Error`

```json
{
  "ok": false,
  "error": "Failed to fetch GPS data: HTTP 403"
}
```

---

## Processamento Interno

### Fluxo de Busca

```
1. Recebe requisicao com ?tab=all
2. Monta URLs de CSV para cada aba
3. Fetch paralelo de todas as abas
4. Para cada aba:
   a. Tenta URL publicada (pubhtml → CSV)
   b. Se falhar, tenta URL da planilha editavel
   c. Se falhar, tenta planilha externa
5. Parse CSV → array de objetos
6. Mapeia nomes (planilha → dashboard)
7. Processa campos especificos por categoria
8. Agrega por nome do atleta
9. Retorna JSON unificado
```

### Parser CSV

O parser customizado lida com:

- Campos entre aspas duplas (`"valor com, virgula"`)
- Virgulas dentro de campos
- Quebras de linha dentro de campos
- Campos vazios
- Caracteres especiais e acentos

### Mapeamento de Nomes

A planilha usa nomes abreviados (ex: `"Adriano A"`) enquanto o dashboard usa nomes curtos em maiusculo (ex: `"ADRIANO"`). O mapeamento inclui:

- **Nomes primarios**: `"Erik R"` → `"ERIK"`
- **Nomes truncados**: `"CARLOS EDUA"` → `"CARLOS EDUARDO"` (aba Fisioterapia trunca nomes)
- **Nomes com acento**: `"LÉO GAMALHO"` → `"LEO GAMALHO"`
- **Identidades**: `"WALLACE"` → `"WALLACE"` (normalizacao)

Total: **70+ mapeamentos** cobrindo todas as variações de nome encontradas nas planilhas.

---

## Processadores por Categoria

### `processGPS(rows)`

Extrai metricas de rastreamento GPS:

**Campos de entrada (CSV):**
- Distancia Total (m), HSR (m), N Sprints, Player Load
- Pico Velocidade (km/h), Acel >2m/s², Acel >3m/s²
- Decel >2m/s², Decel >3m/s²
- FC Media, FC Max, Tempo Zona Alta

**Calculo de baselines:**
- Calcula media das sessoes anteriores (excluindo a atual)
- Usado para comparacao no dashboard (barra vs baseline)

### `processDiario(rows)`

Extrai carga interna subjetiva:

**Campos:** PSE (0-10), Duracao (min), Carga Total (PSE x Duracao), Variacao de Peso, CK

### `processSaltos(rows)`

Extrai metricas neuromusculares:

**Campos:** CMJ Pre (cm), CMJ Pos (cm), Delta % CMJ, SJ, SLCMJ D, SLCMJ E, Assimetria (%)

**Calculo derivado:**
- `cmj_delta_pct = ((cmj_pos - cmj_pre) / cmj_pre) * 100`
- `nme_pos = cmj_pos / srpe_sessao` (eficiencia neuromuscular)

### `processQuestionarios(rows)`

Extrai dados de bem-estar:

**Campos:** Sono Qualidade (1-10), Sono Duracao (h), Dor (0-10), Recuperacao Geral (1-10), Recuperacao Pernas (1-10), Humor (1-10), Peso

### `processFisioterapia(rows)`

Extrai registros de atendimento fisioterapeutico:

**Campos:** Data, Atleta, Procedimento, Local, Observacao

### `processAntropometria(rows)`

Extrai composicao corporal:

**Campos:** Peso (kg), Estatura (cm), % Gordura, Massa Muscular (kg), IMC

### `processLesoes(rows)`

Extrai historico de lesoes da planilha externa:

**Campos:** Data Lesao, Saida DM, Inicio Transicao, Fim Transicao, Dias DM, Dias Transicao, Total Dias, Classificacao, Regiao, Lado, Evento, Mecanismo, Estrutura, Exame, Estagio, Conduta, Observacao

### `processCalendario(rows)`

Extrai calendario de jogos:

**Campos:** Data, Adversario, Placar, Mando (Casa/Fora)

---

## Configuracao de Planilhas

### IDs e GIDs

```javascript
// Chave publica da planilha publicada
published_key: "2PACX-1vQSxRZObs5anHZcJH7LsETalW7vY1U5A066..."

// IDs das planilhas editaveis (principal + fallback)
spreadsheet_ids: [
  "1f4j4Qj0o3BYZPZ5YOTKoG0mk3H7UUCiK8gw2Ywv2LPU",
  "1PRwHxkPWQmlwiXC6i2kbkaQSOmqW6-BKFq51pWaPwxY"
]

// GIDs das abas
tabs: {
  diario:        555914149,
  vbt:           2056067101,
  gps:           0,
  saltos:        1915291461,
  bioquimico:    193203862,
  antropometria: 461631273,
  questionarios: 1014986912,
  atletas:       1315104851,
  fisioterapia:  1541953765,
  calendario:    460942009
}
```

### URLs de Acesso

**Formato CSV publicado:**
```
https://docs.google.com/spreadsheets/d/e/{published_key}/pub?gid={GID}&single=true&output=csv
```

**Formato CSV editavel (fallback):**
```
https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv&gid={GID}
```

---

## Tratamento de Erros

| Cenario | Comportamento |
|---------|---------------|
| Google Sheets indisponivel | Retorna `{ ok: false, error: "..." }` com status 500 |
| Aba individual falha | Tenta fallback URL; se falhar, aba retorna vazio |
| CSV mal-formado | Parser ignora linhas invalidas |
| Nome nao mapeado | Usa nome original da planilha (em maiusculo) |
| Timeout | Fetch tem timeout padrao do Node.js (~30s) |
