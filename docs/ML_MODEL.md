# Modelo de Machine Learning — Predicao de Risco de Lesao

## Visao Geral

O modelo prediz a probabilidade de lesao de cada atleta combinando dados de carga externa (GPS), carga interna (sRPE), resposta neuromuscular (CMJ), bem-estar (sono, dor, recuperacao) e historico de lesoes.

**Algoritmo:** XGBoost (Gradient Boosting)
**Explicabilidade:** SHAP (TreeExplainer)
**Calibracao:** Isotonica
**Ultima atualizacao:** 2026-03-14

---

## Pipeline Completo

```
┌──────────────────────────────────────────────────────────────────┐
│  1. COLETA DE DADOS                                              │
│     Google Sheets → CSV → DataFrame pandas                       │
│     Fontes: GPS, sRPE, CMJ, Questionarios, Lesoes               │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. PRE-PROCESSAMENTO                                            │
│     ├── Feature engineering (89 features)                        │
│     │   ├── ACWR (7d / 28d) para carga total e HSR              │
│     │   ├── Monotonia e Strain semanais                          │
│     │   ├── Delta CMJ (pre/pos e 7 dias)                        │
│     │   ├── Assimetrias (SLCMJ, isometrica)                     │
│     │   ├── Lags (CK_lag7, sleep_lag3)                          │
│     │   ├── Ratios (HSR/baseline, sprint/baseline)              │
│     │   └── Historico (lesoes 180d, dias desde ultima)           │
│     │                                                            │
│     ├── KNNImputer (k=5)                                        │
│     │   Imputa valores faltantes usando k vizinhos mais proximos │
│     │                                                            │
│     └── StandardScaler                                           │
│         Normaliza features para media=0, desvio=1                │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. BALANCEAMENTO DE CLASSES                                     │
│     SMOTE + Tomek Links                                          │
│                                                                  │
│     Problema: classes extremamente desbalanceadas                │
│     - Nao-lesao: ~98% dos registros                              │
│     - Lesao: ~2% dos registros (scale_pos_weight = 52.66)       │
│                                                                  │
│     SMOTE: gera amostras sinteticas da classe minoritaria        │
│     Tomek: remove amostras ambiguas na fronteira                 │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. SELECAO DE FEATURES                                          │
│     LASSO (L1 Regularization)                                    │
│                                                                  │
│     Input: 89 features                                           │
│     Output: 50 features selecionadas                             │
│                                                                  │
│     Remove features redundantes ou irrelevantes                  │
│     Coeficientes zero = feature descartada                       │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. TREINAMENTO                                                  │
│     XGBoost Classifier                                           │
│                                                                  │
│     - Gradient boosting com arvores de decisao                   │
│     - scale_pos_weight = 52.66 (compensacao de desbalanco)       │
│     - Cross-validation temporal (dados cronologicos)              │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. CALIBRACAO                                                   │
│     Isotonic Regression                                          │
│                                                                  │
│     Ajusta probabilidades brutas do XGBoost para refletir        │
│     frequencias reais de lesao                                   │
│                                                                  │
│     Threshold otimizado: 0.28                                    │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  7. EXPLICABILIDADE                                              │
│     SHAP TreeExplainer                                           │
│                                                                  │
│     - Calcula contribuicao individual de cada feature            │
│     - Valores positivos = aumentam risco                         │
│     - Valores negativos = reduzem risco (protetores)             │
│     - Usado no dashboard para explicar cada predição              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Metricas de Avaliacao

| Metrica | Valor | Interpretacao |
|---------|-------|---------------|
| **AUC-ROC** | 0.666 | Capacidade discriminativa moderada |
| **AUC-PR** | 0.04 | Baixa — reflete desbalanco extremo de classes |
| **Recall** | 0.172 | Detecta 17.2% das lesoes reais |
| **Precision** | 0.076 | 7.6% dos alertas sao lesoes reais |
| **F1-Score** | 0.106 | Media harmonica de precision e recall |
| **Especificidade** | 0.961 | 96.1% dos nao-lesionados classificados corretamente |
| **MCC** | 0.089 | Matthews Correlation Coefficient |

### Contexto das Metricas

O modelo opera em um cenario de **extremo desbalanco de classes** (apenas ~2% dos registros sao lesoes). Nesse contexto:

- AUC-PR baixo e esperado (baseline ~0.02)
- O modelo prioriza **alta especificidade** (poucos falsos positivos)
- Recall moderado e aceitavel pois o modelo e **complementar** a avaliacao clinica
- O threshold de 0.28 foi otimizado para balancear alertas uteis vs fadiga de alarme

---

## Top Features por Importancia

### Categoria 1: Historico de Lesoes (23.28%)

| Feature | Importancia | Descricao |
|---------|-------------|-----------|
| `injury_last_180d` | 13.67% | Lesao nos ultimos 6 meses |
| `days_since_last_injury` | 9.61% | Dias desde a ultima lesao |

O historico de lesoes e o fator mais importante. Atletas com lesao recente tem risco significativamente maior de recidiva.

### Categoria 2: Marcadores Bioquimicos (10.46%)

| Feature | Importancia | Descricao |
|---------|-------------|-----------|
| `ck_lag7` | 6.80% | CK medio dos ultimos 7 dias |
| `ck_ratio` | 3.66% | Razao CK atual / baseline |

CK elevado indica dano muscular acumulado, precursor de lesao.

### Categoria 3: Recuperacao (4.12%)

| Feature | Importancia | Descricao |
|---------|-------------|-----------|
| `recovery_legs` | 4.12% | Recuperacao percebida de pernas |

Percepcao subjetiva de recuperacao e um indicador confiavel de prontidao.

### Categoria 4: Carga (6.65%)

| Feature | Importancia | Descricao |
|---------|-------------|-----------|
| `strain` | 3.73% | Carga semanal x Monotonia |
| `acwr_hsr` | 2.92% | ACWR de corrida alta velocidade |

Picos de carga (especialmente HSR) em relacao ao historico cronico aumentam risco.

### Categoria 5: Neuromuscular (6.39%)

| Feature | Importancia | Descricao |
|---------|-------------|-----------|
| `slcmj_asymmetry` | 3.30% | Assimetria de CMJ unipodal |
| `iso_asymmetry_pct` | 3.09% | Assimetria isometrica |

Assimetrias entre membros sao indicadores de risco biomecanico.

### Categoria 6: Sono (2.75%)

| Feature | Importancia | Descricao |
|---------|-------------|-----------|
| `sleep_quality` | 2.75% | Qualidade do sono |

Sono de baixa qualidade compromete recuperacao e aumenta suscetibilidade.

---

## Zonas de Risco e Threshold

```
Probabilidade:  0.0        0.28       0.40       0.65       1.0
                │──────────│──────────│──────────│──────────│
Zona:           │  VERDE   │ AMARELO  │ LARANJA  │ VERMELHO │
Acao:           │ Liberado │ Atencao  │ Reducao  │Restricao │
```

**Threshold = 0.28**: Valor acima do qual o modelo classifica como "em risco". Otimizado via calibracao isotonica para minimizar falsos alarmes mantendo sensibilidade clinicamente relevante.

---

## Explicabilidade SHAP

### O que sao valores SHAP?

SHAP (SHapley Additive exPlanations) decompoe a predição de cada atleta em contribuicoes individuais de cada feature:

```
P(lesao) = baseline + SHAP_feature1 + SHAP_feature2 + ... + SHAP_featureN
```

### Exemplo para um Atleta

```
Atleta: ERIK (prob = 0.72, VERMELHO)

Features que AUMENTAM risco (shap_pos):
  +0.15  acwr_hsr = 1.52        (pico de corrida alta velocidade)
  +0.12  injury_last_180d = 1   (lesao recente)
  +0.08  sleep_quality = 4.5    (sono ruim)
  +0.06  ck_lag7 = 480          (CK elevado)

Features PROTETORAS (shap_neg):
  -0.05  recovery_legs = 7      (boa recuperacao de pernas)
  -0.03  cmj_delta = -2%        (queda minima de CMJ)
  -0.02  age = 24               (idade jovem)
```

### Como sao Exibidos no Dashboard

1. **Barra horizontal**: Cada feature como barra verde (protetor) ou vermelha (risco)
2. **Tabela ordenada**: Features ordenadas por magnitude absoluta
3. **Tooltip**: Valor real da feature + contribuicao SHAP

---

## Padroes Pre-Lesao Identificados

O modelo identificou padroes recorrentes que precedem lesoes:

| Padrao | Prevalencia | Descricao |
|--------|-------------|-----------|
| Sono < 6h por 2+ noites | 78% | Sono insuficiente acumulado |
| ACWR > 1.35 | 72% | Pico de carga aguda vs cronica |
| Queda de CMJ > 5% | 65% | Fadiga neuromuscular |
| Dor > 5/10 | 60% | Dor crescente ignorada |
| CK > 500 U/L | 55% | Dano muscular acumulado |
| Assimetria > 10% | 48% | Desbalanco biomecanico |

---

## Limitacoes Conhecidas

1. **Desbalanco extremo**: ~2% de positivos limita recall e precision
2. **Dados limitados**: Historico de 1-2 temporadas por atleta
3. **Sem validacao externa**: Modelo treinado e avaliado no mesmo clube
4. **Features manuais**: Depende de preenchimento correto da planilha
5. **Sem atualizacao online**: Retreinamento manual periodico
6. **Dados categoricos ausentes**: Posicao e tipo de treino nao sao features

---

## Fluxo de Atualizacao

```
1. Data scientist exporta dados atualizados da planilha
2. Executa pipeline Python (Jupyter notebook)
3. Gera novo risk_output.json com metricas atualizadas
4. Atualiza RISK_ALERTS e PROJECTIONS no Dashboard.jsx
5. Commit, push e deploy
```

**Frequencia recomendada**: A cada 2-4 semanas ou apos mudancas significativas no elenco.
