# Dicionario de Dados

Definicao completa de todas as variaveis, metricas e indicadores utilizados no Performance Dashboard.

---

## 0. Conceitos Fundamentais — Risk Score vs. Probabilidade de Lesao

### Risk Score (0–100)
- **O que e:** Indice composto calculado por **regras clinicas** pre-definidas pela equipe de performance.
- **Como calcula:** Soma ponderada de ACWR (>1.45 = +30pts), Dor (>4 = +20pts), Rec. Pernas (<5 = +18pts), Dor media (>2.5 = +10pts), Sono medio (<6 = +8pts) e Bem-estar (<6 = +6pts).
- **Para que serve:** Triagem rapida diaria — identifica quem precisa de atencao imediata baseado em indicadores observaveis do dia.
- **Limitacao:** Nao considera historico de lesoes, biomecanica, bioquimica ou interacoes entre variaveis.

### Probabilidade de Lesao (0–100%)
- **O que e:** Estimativa de machine learning (XGBoost) da **chance real de lesao** nos proximos 7 dias.
- **Como calcula:** Modelo treinado com dados historicos, usando 33 features selecionadas por LASSO (GPS, carga, neuromuscular, sono, bioquimica, historico de lesoes). Calibrado com Isotonic Regression + Platt Scaling.
- **Para que serve:** Predicao individualizada — considera interacoes complexas entre variaveis.
- **Explicabilidade:** Valores SHAP mostram quais fatores aumentam ou reduzem o risco de cada atleta individualmente.

---

## 1. Metricas GPS (Rastreamento Externo)

Dados coletados via dispositivo GPS vestivel durante treinos e jogos.

| Variavel | Tipo | Unidade | Descricao |
|----------|------|---------|-----------|
| `dist_total` | number | metros | Distancia total percorrida na sessao |
| `dist_baseline` | number | metros | Media de distancia das sessoes anteriores (baseline individual) |
| `hsr` | number | metros | High-Speed Running — distancia percorrida acima de 19.8 km/h |
| `hsr_baseline` | number | metros | Baseline individual de HSR |
| `sprints` | number | contagem | Numero de acoes acima de 25.2 km/h |
| `sprints_baseline` | number | contagem | Baseline individual de sprints |
| `player_load` | number | UA | Player Load — metrica de carga externa (unidade arbitraria) |
| `pico_vel` | number | km/h | Velocidade maxima atingida na sessao |
| `acel` | number | contagem | Aceleracoes acima de 2 m/s² |
| `acel_3` | number | contagem | Aceleracoes acima de 3 m/s² (alta intensidade) |
| `decel` | number | contagem | Desaceleracoes acima de 2 m/s² |
| `decel_3` | number | contagem | Desaceleracoes acima de 3 m/s² (alta intensidade) |
| `hr_avg` | number | bpm | Frequencia cardiaca media da sessao |
| `hr_max` | number | bpm | Frequencia cardiaca maxima da sessao |
| `hr_baseline_avg` | number | bpm | FC media baseline individual |
| `tempo_zona_alta` | number | minutos | Tempo em zona de FC alta (>85% FCmax) |

---

## 2. Carga Interna (sRPE / Diario)

Dados subjetivos reportados pelo atleta apos cada sessao.

| Variavel | Tipo | Unidade | Descricao |
|----------|------|---------|-----------|
| `srpe_sessao` | number | 0-10 | Percepcao Subjetiva de Esforco (PSE) da sessao. Escala CR-10 de Borg modificada. 0 = repouso total, 10 = esforco maximo. Coletado ~30 min apos a sessao para evitar vies do ultimo exercicio. |
| `duracao` | number | minutos | Duracao da sessao de treino/jogo |
| `srpe_total` | number | UA | Carga total da sessao = PSE x Duracao (Unidades Arbitrarias). Exemplo: PSE 7 x 90 min = 630 UA. Acima de 450 UA = sessao de alta carga. Reflete o volume de esforco percebido pelo atleta (Foster et al., 2001). |
| `hr_avg` | number | bpm | FC media (pode vir do GPS ou monitor de FC) |
| `hr_max` | number | bpm | FC maxima da sessao |
| `tempo_zona_alta` | number | minutos | Tempo em zona de FC alta |

### Indicadores Derivados

| Indicador | Formula | Descricao |
|-----------|---------|-----------|
| **ACWR** | Carga aguda (7d) / Carga cronica (28d) | Acute:Chronic Workload Ratio. Compara carga recente com habitual. Ideal: 0.8-1.3 (zona otima). >1.3 = risco moderado. >1.5 = risco alto de lesao (Gabbett, 2016). <0.8 = subcarga/desprotecao contra picos futuros. Calculado por EWMA (mais peso aos dias recentes). |
| **ACWR HSR** | HSR agudo / HSR cronico | ACWR especifico para corrida de alta velocidade (>19.8 km/h). Mais sensivel para lesoes musculares de sprint. |
| **Monotonia** | Media diaria / DP diario | Variabilidade da carga nos ultimos 7 dias. >2.0 = carga repetitiva sem variacao, risco de overreaching (Foster, 1998). Indica falta de periodizacao. |
| **Strain** | Carga semanal x Monotonia | Esforco acumulado ponderado pela monotonia. Combina volume total com falta de variacao. Valores altos indicam risco de overtraining. |

---

## 3. Metricas Neuromusculares (Saltos)

Dados de avaliacao neuromuscular via saltos verticais.

| Variavel | Tipo | Unidade | Descricao |
|----------|------|---------|-----------|
| `cmj_pre` | number | cm | Counter-Movement Jump (Salto com Contramovimento) pre-treino. O atleta realiza flexao rapida de joelhos e salta o mais alto possivel. Melhor de 3 tentativas. Indicador de prontidao neuromuscular — mede a capacidade do sistema nervoso de recrutar fibras musculares explosivamente. |
| `cmj_pos` | number | cm | CMJ pos-treino. Comparacao com pre indica fadiga neuromuscular aguda da sessao. |
| `cmj_delta_pct` | number | % | Variacao percentual do CMJ (pos vs pre). Queda >5% = fadiga neuromuscular significativa. >8% = alerta critico, considerar treino regenerativo (Claudino et al., 2017). |
| `sj` | number | cm | Squat Jump (sem contramovimento) |
| `slcmj_d` | number | cm | Single-Leg CMJ — perna direita |
| `slcmj_e` | number | cm | Single-Leg CMJ — perna esquerda |
| `asi_pos` | number | % | Indice de Assimetria entre pernas. >10% = risco biomecanico |

### Indicadores Derivados

| Indicador | Formula | Descricao |
|-----------|---------|-----------|
| **NME** | CMJ / sRPE | Eficiencia Neuromuscular. Queda indica fadiga desproporcional |
| **RSI** | Altura / Tempo de contato | Reactive Strength Index (quando disponivel) |
| **Assimetria** | abs(D - E) / max(D, E) x 100 | Diferenca percentual entre pernas |

---

## 4. Bem-estar (Questionarios)

Dados subjetivos coletados via questionario diario pre-treino.

| Variavel | Tipo | Escala | Descricao |
|----------|------|--------|-----------|
| `sono_noite` | number | 1-10 | Qualidade do sono na noite anterior |
| `sono_duracao` | number | horas | Duracao do sono |
| `dor_pos` | number | 0-10 | Nivel de dor/desconforto. 0 = sem dor |
| `rec_percebida` | number | 1-10 | Recuperacao geral percebida |
| `rec_pernas` | number | 1-10 | Recuperacao especifica de membros inferiores |
| `humor` | number | 1-10 | Estado de humor/disposicao |
| `peso` | number | kg | Peso corporal matinal |
| `ck_estimado` | number | U/L | Creatina Quinase estimada (marcador de dano muscular) |

### Limiares de Alerta

| Variavel | Limiar | Significado |
|----------|--------|-------------|
| `sono_noite` | < 5 | Sono insuficiente — aumento de risco |
| `sono_duracao` | < 6h | Duracao critica de sono |
| `dor_pos` | > 6 | Dor significativa — avaliar fisioterapia |
| `rec_percebida` | < 4 | Recuperacao insuficiente |
| `ck_estimado` | > 500 | Dano muscular significativo |

---

## 5. Composicao Corporal (Antropometria)

Avaliacoes periodicas de composicao corporal.

| Variavel | Tipo | Unidade | Descricao |
|----------|------|---------|-----------|
| `peso` | number | kg | Peso corporal |
| `estatura` | number | cm | Altura |
| `gordura_pct` | number | % | Percentual de gordura corporal |
| `massa_muscular` | number | kg | Massa muscular total |
| `imc` | number | kg/m² | Indice de Massa Corporal |

---

## 6. Historico de Lesoes

Registro detalhado de cada ocorrencia de lesao.

| Variavel | Tipo | Descricao |
|----------|------|-----------|
| `n` | string | Nome do atleta |
| `pos` | string | Posicao (GOL, ZAG, LAT, VOL, MEI, ATA, EXT) |
| `date` | string | Data da lesao (DD/MM/YYYY) |
| `saida_dm` | string | Data de saida do departamento medico |
| `ini_trans` | string | Data de inicio da fase de transicao |
| `fim_trans` | string | Data de fim da transicao (retorno ao grupo) |
| `dias_dm` | number | Dias no departamento medico |
| `dias_trans` | number | Dias em fase de transicao |
| `total` | number | Total de dias afastado |
| `classif` | string | Classificacao de gravidade (ver tabela abaixo) |
| `regiao` | string | Regiao anatomica (Coxa anterior, Coxa posterior, Tornozelo, etc.) |
| `lado` | string | Lado acometido (D = direito, E = esquerdo, B = bilateral) |
| `evento` | string | Contexto da lesao (Jogo, Treino) |
| `mecanismo` | string | Mecanismo (Sprint, Chute, Mudanca de direcao, Contato, etc.) |
| `estrutura` | string | Tecido/estrutura lesionada (Semitendineo, Reto femoral, etc.) |
| `exame` | string | Exame de imagem realizado (RM, USG, RX) |
| `estagio` | string | Fase da temporada (Pre-temporada, Competicao) |
| `conduta` | string | Tratamento adotado |
| `obs` | string | Observacoes e licoes aprendidas |

### Classificacao de Gravidade

| Codigo | Gravidade | Descricao |
|--------|-----------|-----------|
| **1A** | Minima | Queixa leve, sem afastamento |
| **1B** | Leve | 1-3 dias de afastamento |
| **2A** | Leve-Moderada | 4-7 dias de afastamento |
| **2B** | Moderada | 8-14 dias de afastamento |
| **3A** | Moderada-Grave | 15-28 dias de afastamento |
| **3B** | Grave | 29-60 dias de afastamento |
| **4A** | Muito Grave | 61-90 dias de afastamento |
| **4B** | Severa | 91-180 dias de afastamento |
| **4C** | Catastrofica | >180 dias de afastamento |

---

## 7. Calendario de Jogos

| Variavel | Tipo | Descricao |
|----------|------|-----------|
| `data` | string | Data do jogo (DD/MM/YYYY) |
| `adversario` | string | Time adversario |
| `placar` | string | Resultado (ex: "2x1") |
| `mando` | string | Casa ou Fora |

---

## 8. Metricas de Risco (ML)

Variaveis calculadas pelo modelo de machine learning.

| Variavel | Tipo | Range | Descricao |
|----------|------|-------|-----------|
| `prob` | number | 0-1 | Probabilidade de lesao predita pelo XGBoost |
| `zone` | string | - | Zona de risco: VERDE, AMARELO, LARANJA, VERMELHO |
| `perfil_risco` | string | - | Tipo de risco: aguda, sobrecarga, neuromuscular, biomecanico |
| `fatigue_debt` | number | UA | Divida de fadiga acumulada (carga - recuperacao) |
| `bio` | number | % | Deficit biologico (desbalanco recuperacao vs estresse) |

### Zonas de Risco

| Zona | Probabilidade | Cor | Acao |
|------|---------------|-----|------|
| VERDE | < 0.28 | Verde | Liberado |
| AMARELO | 0.28 - 0.39 | Amarelo | Atencao |
| LARANJA | 0.40 - 0.64 | Laranja | Reducao de carga |
| VERMELHO | >= 0.65 | Vermelho | Restricao / DM |

### Perfis de Risco

| Perfil | Descricao | Marcadores Principais |
|--------|-----------|----------------------|
| **Aguda** | Evento traumatico ou pico de carga | ACWR alto, sprint em fadiga |
| **Sobrecarga** | Acumulo progressivo | Monotonia alta, strain elevado, sono ruim |
| **Neuromuscular** | Deficit de forca/coordenacao | CMJ em queda, NME baixo |
| **Biomecanico** | Assimetria ou padrao de movimento | Assimetria SLCMJ >10%, historico de lesao |

---

## 9. Features do Modelo (Top 20)

Features selecionadas pelo LASSO, ordenadas por importancia no XGBoost:

| # | Feature | Importancia | Descricao |
|---|---------|-------------|-----------|
| 1 | `injury_last_180d` | 13.67% | Lesao nos ultimos 180 dias (binario) |
| 2 | `days_since_last_injury` | 9.61% | Dias desde a ultima lesao |
| 3 | `ck_lag7` | 6.80% | CK medio dos ultimos 7 dias |
| 4 | `recovery_legs` | 4.12% | Recuperacao percebida de pernas |
| 5 | `strain` | 3.73% | Carga semanal x Monotonia |
| 6 | `ck_ratio` | 3.66% | Razao CK atual / CK baseline |
| 7 | `slcmj_asymmetry` | 3.30% | Assimetria de CMJ unipodal |
| 8 | `iso_asymmetry_pct` | 3.09% | Assimetria isometrica percentual |
| 9 | `acwr_hsr` | 2.92% | ACWR de corrida de alta velocidade |
| 10 | `sleep_quality` | 2.75% | Qualidade do sono (1-10) |
| 11 | `acwr_total` | 2.61% | ACWR de carga total |
| 12 | `cmj_delta_7d` | 2.48% | Variacao do CMJ nos ultimos 7 dias |
| 13 | `fatigue_debt` | 2.35% | Divida de fadiga acumulada |
| 14 | `pain_score` | 2.20% | Score de dor |
| 15 | `hsr_ratio` | 2.05% | Razao HSR atual / HSR baseline |
| 16 | `sprint_ratio` | 1.93% | Razao sprints atual / sprints baseline |
| 17 | `monotony` | 1.80% | Monotonia da carga semanal |
| 18 | `age` | 1.65% | Idade do atleta |
| 19 | `weight_change` | 1.52% | Variacao de peso recente |
| 20 | `previous_injuries_count` | 1.40% | Total de lesoes anteriores |

---

## 10. Valores SHAP (Explicabilidade)

Cada atleta recebe valores SHAP individualizados que explicam a contribuicao de cada feature:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `shap_pos` | array | Features que AUMENTAM o risco. Formato: `[{ f: "acwr_hsr", v: "+0.12" }]` |
| `shap_neg` | array | Features PROTETORAS (reduzem risco). Formato: `[{ f: "cmj_estavel", v: "-0.05" }]` |

**Interpretacao:**
- Valor SHAP positivo (+) → feature contribui para AUMENTAR o risco
- Valor SHAP negativo (-) → feature contribui para REDUZIR o risco
- Magnitude → intensidade da contribuicao

---

## 11. Protocolos de Mitigacao

| Campo | Descricao | Exemplo |
|-------|-----------|---------|
| `mecanica` | Ajustes biomecanicos | "Reducao de sprints em arcos fechados" |
| `carga_reducao` | Reducao de volume/intensidade | "HSR -30%, volume -20%" |
| `compensatorio` | Medidas compensatorias | "Crioterapia pos, melatonina 3mg" |

### Regras de Intervencao Rapida

| Condicao | Intervencao |
|----------|-------------|
| ACWR > 1.50 | Reduzir HSR em 30% |
| CMJ delta < -8% | Treino regenerativo |
| Sono < 5/10 por 2+ dias | Reducao de volume, higiene do sono |
| Dor > 7/10 | Avaliacao fisioterapeutica imediata |
| Assimetria > 15% | Programa de correcao neuromuscular |
