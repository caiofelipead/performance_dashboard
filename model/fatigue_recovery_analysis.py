"""
================================================================================
ANÁLISE DE FADIGA-RECUPERAÇÃO E REGRESSÃO DE LESÕES
Botafogo-SP FSA — Núcleo de Saúde e Performance
================================================================================

Dois módulos relacionais implementados aqui (ver Dashboard.jsx aba "Modelo
Preditivo" para a versão JS leve):

1. MATRIZ DE CORRELAÇÃO D / D+1
   Pearson pareado entre carga externa do dia D (Distância, HSR, SPR, PL) e
   resposta no dia D+1 (sono, dor, recuperação geral, PSE pré-treino, carga).
   Detecta carryover de fadiga (Banister & Calvert, 1980; Halson, 2014).

2. REGRESSÃO LOGÍSTICA — VETOR DE PROBABILIDADE 7d
   Modelo paralelo (transparente) ao XGBoost. Picos de carga mecânica + ACWR
   como features padronizadas. Cross-validation StratifiedKFold(k=5),
   regularização L2 (Ridge), interpretação via odds ratio.

Uso:
    python model/fatigue_recovery_analysis.py \
        --gps data/gps_individual.csv --quest data/questionarios.csv \
        --diario data/diario.csv --lesoes data/lesoes.csv \
        --output model/fatigue_output.json
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report

np.random.seed(42)


# ─────────────────────────────────────────────────────────────────────────────
# 1. CARGA E ALINHAMENTO TEMPORAL
# ─────────────────────────────────────────────────────────────────────────────

def parse_dates(df: pd.DataFrame, col: str) -> pd.DataFrame:
    df[col] = pd.to_datetime(df[col], dayfirst=True, errors="coerce")
    return df.dropna(subset=[col])


def align_d_dplus1(gps: pd.DataFrame, quest: pd.DataFrame, diario: pd.DataFrame) -> pd.DataFrame:
    """Constroi pares (D, D+1) por atleta para correlação carryover."""
    gps = gps.rename(columns=str.lower).copy()
    quest = quest.rename(columns=str.lower).copy()
    diario = diario.rename(columns=str.lower).copy()

    # Normaliza nomes de colunas críticas para padrões esperados.
    rename_map = {
        "atleta": "athlete", "atletas": "athlete", "nome": "athlete",
        "data": "date", "distancia_metros": "dist_m", "distancia": "dist_m",
        "distancia_20_km_h_metros": "hsr_m", "distancia_25_km_h_metros": "spr_m",
        "player_load": "pl",
        "qualidade_subjetiva_do_sono": "sono", "qualidade_do_sono": "sono",
        "presenca_de_dor": "dor", "como_esta_sua_recuperacao": "rec",
        "sua_recuperacao": "rec", "pse": "pse"
    }
    for df in (gps, quest, diario):
        df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    gps = parse_dates(gps, "date")
    if "date" in quest: quest = parse_dates(quest, "date")
    if "date" in diario: diario = parse_dates(diario, "date")

    pairs: List[dict] = []
    for athlete, g in gps.groupby("athlete"):
        g = g.sort_values("date")
        athlete_quest = quest[quest["athlete"] == athlete] if "athlete" in quest else pd.DataFrame()
        athlete_diario = diario[diario["athlete"] == athlete] if "athlete" in diario else pd.DataFrame()
        for i in range(len(g) - 1):
            d_row = g.iloc[i]
            d_date = d_row["date"]
            d1 = g[g["date"] == d_date + pd.Timedelta(days=1)]
            if d1.empty:
                continue
            d1_row = d1.iloc[0]
            q_d1 = athlete_quest[athlete_quest["date"] == d1_row["date"]] if not athlete_quest.empty else pd.DataFrame()
            di_d1 = athlete_diario[athlete_diario["date"] == d1_row["date"]] if not athlete_diario.empty else pd.DataFrame()
            pairs.append({
                "athlete": athlete,
                "date": d_date,
                "d_dist": d_row.get("dist_m", np.nan),
                "d_hsr":  d_row.get("hsr_m",  np.nan),
                "d_spr":  d_row.get("spr_m",  np.nan),
                "d_pl":   d_row.get("pl",     np.nan),
                "d_pse":  d_row.get("pse",    np.nan),
                "d1_sono": q_d1["sono"].iloc[0] if not q_d1.empty and "sono" in q_d1 else np.nan,
                "d1_dor":  q_d1["dor"].iloc[0]  if not q_d1.empty and "dor"  in q_d1 else np.nan,
                "d1_rec":  q_d1["rec"].iloc[0]  if not q_d1.empty and "rec"  in q_d1 else np.nan,
                "d1_pse":  di_d1["pse"].iloc[0] if not di_d1.empty and "pse" in di_d1 else d1_row.get("pse", np.nan),
                "d1_dist": d1_row.get("dist_m", np.nan),
                "d1_hsr":  d1_row.get("hsr_m",  np.nan)
            })
    return pd.DataFrame(pairs)


# ─────────────────────────────────────────────────────────────────────────────
# 2. MATRIZ DE CORRELAÇÃO D / D+1
# ─────────────────────────────────────────────────────────────────────────────

def correlation_matrix(pairs: pd.DataFrame) -> Dict:
    cols_d = ["d_dist", "d_hsr", "d_spr", "d_pl", "d_pse"]
    rows_d1 = ["d1_sono", "d1_dor", "d1_rec", "d1_pse", "d1_dist", "d1_hsr"]
    matrix = []
    for r in rows_d1:
        row = []
        for c in cols_d:
            sub = pairs[[c, r]].dropna()
            sub = sub[(sub[c] > 0) & (sub[r] > 0)]
            if len(sub) < 5:
                row.append({"r": None, "p": None, "n": int(len(sub))})
            else:
                rr, pp = stats.pearsonr(sub[c], sub[r])
                row.append({"r": round(float(rr), 3), "p": round(float(pp), 4), "n": int(len(sub))})
        matrix.append({"row": r, "values": row})
    return {"columns": cols_d, "rows": rows_d1, "matrix": matrix, "n_pairs": int(len(pairs))}


# ─────────────────────────────────────────────────────────────────────────────
# 3. REGRESSÃO LOGÍSTICA — PROBABILIDADE DE LESÃO 7d
# ─────────────────────────────────────────────────────────────────────────────

def build_injury_dataset(gps: pd.DataFrame, lesoes: pd.DataFrame, stride_days: int = 3) -> Tuple[pd.DataFrame, np.ndarray]:
    """Para cada (atleta, t) com stride de 3 dias, calcula features de pico 7d
    e label = ocorreu lesão em (t, t+7d]?"""
    gps = parse_dates(gps.rename(columns=str.lower), "date")
    if "atleta" in gps.columns: gps = gps.rename(columns={"atleta": "athlete"})
    lesoes = parse_dates(lesoes.rename(columns=str.lower), "data" if "data" in lesoes.columns else "date")
    inj_by_ath = lesoes.groupby("nome" if "nome" in lesoes else "atleta")

    rows: List[dict] = []
    labels: List[int] = []
    for athlete, g in gps.groupby("athlete"):
        g = g.sort_values("date").reset_index(drop=True)
        if len(g) < 5:
            continue
        try:
            inj_dates = pd.to_datetime(inj_by_ath.get_group(athlete).iloc[:, 0], dayfirst=True, errors="coerce").dropna().tolist()
        except KeyError:
            inj_dates = []
        t0, tN = g["date"].min(), g["date"].max()
        cur = t0
        while cur <= tN:
            win7 = g[(g["date"] >= cur - pd.Timedelta(days=7)) & (g["date"] <= cur)]
            win28 = g[(g["date"] >= cur - pd.Timedelta(days=28)) & (g["date"] < cur - pd.Timedelta(days=7))]
            if len(win7) >= 2:
                peak_dist = win7.get("dist_m", pd.Series([0])).max() / 1000
                peak_hsr = win7.get("hsr_m", pd.Series([0])).max() / 100
                peak_spr = win7.get("spr_m", pd.Series([0])).max() / 50
                peak_acel = win7.get("acel_3", pd.Series([0])).max() if "acel_3" in win7 else 0
                peak_decel = win7.get("decel_3", pd.Series([0])).max() if "decel_3" in win7 else 0
                acute = win7.get("dist_m", pd.Series([0])).sum()
                chronic_mean = win28.get("dist_m", pd.Series([0])).sum() / max(1, len(win28) / 3) if len(win28) else 0
                acwr = min(3.0, max(0.0, acute / chronic_mean)) if chronic_mean > 0 else 1.0
                feats = [peak_dist, peak_hsr, peak_spr, peak_acel, peak_decel, acwr]
                # label
                y = int(any(cur < d <= cur + pd.Timedelta(days=7) for d in inj_dates))
                rows.append({"athlete": athlete, "date": cur, "feats": feats})
                labels.append(y)
            cur += pd.Timedelta(days=stride_days)
    if not rows:
        return pd.DataFrame(), np.array([])
    X = np.array([r["feats"] for r in rows])
    y = np.array(labels)
    df = pd.DataFrame(X, columns=["peak_dist", "peak_hsr", "peak_spr", "peak_acel", "peak_decel", "acwr_dist"])
    df["athlete"] = [r["athlete"] for r in rows]
    df["date"] = [r["date"] for r in rows]
    return df, y


def fit_logistic(X: np.ndarray, y: np.ndarray) -> Dict:
    pos = int(y.sum())
    if pos < 5:
        return {"error": "amostra positiva insuficiente", "n": int(len(y)), "positives": pos}
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)
    clf = LogisticRegression(C=1.0, penalty="l2", max_iter=400, class_weight="balanced", random_state=42)
    cv = StratifiedKFold(n_splits=min(5, pos), shuffle=True, random_state=42)
    auc_cv = cross_val_score(clf, Xs, y, cv=cv, scoring="roc_auc").mean()
    clf.fit(Xs, y)
    coefs = clf.coef_[0].tolist()
    odds = [float(np.exp(c)) for c in coefs]
    feat_names = ["peak_dist", "peak_hsr", "peak_spr", "peak_acel", "peak_decel", "acwr_dist"]
    probs = clf.predict_proba(Xs)[:, 1]
    return {
        "n": int(len(y)),
        "positives": pos,
        "auc_cv_5fold": round(float(auc_cv), 4),
        "intercept": round(float(clf.intercept_[0]), 4),
        "coefficients": [
            {"feature": f, "beta": round(c, 4), "odds_ratio": round(o, 4)}
            for f, c, o in zip(feat_names, coefs, odds)
        ],
        "probability_quantiles": {
            "p25": round(float(np.percentile(probs, 25)), 4),
            "p50": round(float(np.percentile(probs, 50)), 4),
            "p75": round(float(np.percentile(probs, 75)), 4),
            "p95": round(float(np.percentile(probs, 95)), 4)
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def main(args: argparse.Namespace) -> None:
    gps = pd.read_csv(args.gps)
    quest = pd.read_csv(args.quest)
    diario = pd.read_csv(args.diario)
    lesoes = pd.read_csv(args.lesoes)

    pairs = align_d_dplus1(gps, quest, diario)
    corr = correlation_matrix(pairs)

    inj_df, y = build_injury_dataset(gps, lesoes, stride_days=args.stride)
    if not inj_df.empty:
        feat_cols = ["peak_dist", "peak_hsr", "peak_spr", "peak_acel", "peak_decel", "acwr_dist"]
        regression = fit_logistic(inj_df[feat_cols].values, y)
        regression["per_athlete_top10"] = (
            inj_df.groupby("athlete")["acwr_dist"].agg(["mean", "max", "count"])
            .reset_index().sort_values("mean", ascending=False).head(10).to_dict(orient="records")
        )
    else:
        regression = {"error": "dataset vazio (verifique colunas e datas)"}

    output = {
        "version": "1.0.0",
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "fatigue_recovery_correlation": corr,
        "injury_logistic_regression": regression
    }
    Path(args.output).write_text(json.dumps(output, indent=2, default=str), encoding="utf-8")
    print(f"OK · {args.output} · pares={corr['n_pairs']} · amostras_lesão={len(y)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--gps", required=True)
    parser.add_argument("--quest", required=True)
    parser.add_argument("--diario", required=True)
    parser.add_argument("--lesoes", required=True)
    parser.add_argument("--output", default="model/fatigue_output.json")
    parser.add_argument("--stride", type=int, default=3)
    args = parser.parse_args()
    main(args)
