"""
================================================================================
MOTOR PREDITIVO DE LESÕES NÃO-TRAUMÁTICAS & READINESS
Botafogo-SP FSA — Núcleo de Saúde e Performance
================================================================================
Paradigma: Sistemas Complexos (Bittencourt et al., 2016)
Arquitetura ML: Gradient Boosted Trees + SMOTE (Rossi et al., 2022)

Autor: Núcleo de Ciência de Dados — Saúde e Performance
================================================================================
"""

import numpy as np
import pandas as pd
import json
import warnings
from datetime import datetime, timedelta
from pathlib import Path

# ML
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    classification_report, roc_auc_score, precision_recall_curve,
    average_precision_score, confusion_matrix
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV

# Imbalanced Learning
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

# Tree-based models (obrigatório conforme spec)
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier

# Survival Analysis (opcional/avançado)
try:
    from lifelines import CoxPHFitter
    HAS_LIFELINES = True
except ImportError:
    HAS_LIFELINES = False

warnings.filterwarnings("ignore")
np.random.seed(42)


# ==============================================================================
# 1. SIMULAÇÃO DE DADOS LONGITUDINAIS (ATLETA-DIA)
# ==============================================================================
# Em produção, substituir por: pd.read_csv() / pd.read_excel() / SQL query
# Estrutura: 32 atletas x 120 dias = ~3840 registros

ATHLETES = [
    {"name": "ADRIANO", "pos": "ZAG", "weight": 82.7, "height": 185, "bf": 12.4, "mm": 38.2,
     "cmj_baseline": 51.5, "iso_baseline_l": 280, "iso_baseline_r": 290, "ck_basal": 180},
    {"name": "BRENNO", "pos": "GOL", "weight": 90.8, "height": 191, "bf": 13.8, "mm": 41.5,
     "cmj_baseline": 46.2, "iso_baseline_l": 310, "iso_baseline_r": 305, "ck_basal": 160},
    {"name": "CARLOS EDUARDO", "pos": "ZAG", "weight": 85.9, "height": 187, "bf": 11.9, "mm": 39.8,
     "cmj_baseline": 47.5, "iso_baseline_l": 295, "iso_baseline_r": 300, "ck_basal": 190},
    {"name": "DARLAN", "pos": "MC", "weight": 80.2, "height": 178, "bf": 10.5, "mm": 37.1,
     "cmj_baseline": 33.0, "iso_baseline_l": 260, "iso_baseline_r": 265, "ck_basal": 170},
    {"name": "ERICSON", "pos": "ZAG", "weight": 91.6, "height": 190, "bf": 13.2, "mm": 42.0,
     "cmj_baseline": 47.0, "iso_baseline_l": 320, "iso_baseline_r": 310, "ck_basal": 200},
    {"name": "ERIK", "pos": "ATA", "weight": 75.5, "height": 176, "bf": 9.8, "mm": 35.4,
     "cmj_baseline": 53.0, "iso_baseline_l": 240, "iso_baseline_r": 245, "ck_basal": 150},
    {"name": "FELIPINHO", "pos": "LAT", "weight": 78.0, "height": 179, "bf": 11.2, "mm": 36.0,
     "cmj_baseline": 42.0, "iso_baseline_l": 250, "iso_baseline_r": 255, "ck_basal": 165},
    {"name": "FELIPE VIEIRA", "pos": "LE", "weight": 77.0, "height": 176, "bf": 7.7, "mm": 35.8,
     "cmj_baseline": 45.0, "iso_baseline_l": 260, "iso_baseline_r": 265, "ck_basal": 174},
    {"name": "GABRIEL INOCENCIO", "pos": "MC", "weight": 78.5, "height": 177, "bf": 10.8, "mm": 36.5,
     "cmj_baseline": 49.5, "iso_baseline_l": 270, "iso_baseline_r": 275, "ck_basal": 175},
    {"name": "GUI MARIANO", "pos": "ZAG", "weight": 89.7, "height": 189, "bf": 12.7, "mm": 41.0,
     "cmj_baseline": 53.0, "iso_baseline_l": 305, "iso_baseline_r": 310, "ck_basal": 185},
    {"name": "GUILHERME QUEIROZ", "pos": "ZAG", "weight": 87.9, "height": 188, "bf": 13.1, "mm": 40.2,
     "cmj_baseline": 45.5, "iso_baseline_l": 290, "iso_baseline_r": 285, "ck_basal": 195},
    {"name": "GUSTAVO VILAR", "pos": "LAT", "weight": 86.4, "height": 183, "bf": 12.9, "mm": 39.5,
     "cmj_baseline": 44.5, "iso_baseline_l": 275, "iso_baseline_r": 280, "ck_basal": 185},
    {"name": "HEBERT", "pos": "ZAG", "weight": 88.1, "height": 186, "bf": 12.5, "mm": 40.8,
     "cmj_baseline": 50.5, "iso_baseline_l": 300, "iso_baseline_r": 295, "ck_basal": 190},
    {"name": "HENRIQUE TELES", "pos": "LAT", "weight": 80.1, "height": 180, "bf": 11.3, "mm": 37.2,
     "cmj_baseline": 52.0, "iso_baseline_l": 260, "iso_baseline_r": 270, "ck_basal": 170},
    {"name": "HYGOR", "pos": "MC", "weight": 83.3, "height": 182, "bf": 11.6, "mm": 38.6,
     "cmj_baseline": 42.8, "iso_baseline_l": 280, "iso_baseline_r": 285, "ck_basal": 180},
    {"name": "JEFFERSON NEM", "pos": "ATA", "weight": 72.5, "height": 174, "bf": 10.1, "mm": 33.8,
     "cmj_baseline": 48.0, "iso_baseline_l": 235, "iso_baseline_r": 240, "ck_basal": 155},
    {"name": "JONATHAN", "pos": "LAT", "weight": 73.7, "height": 175, "bf": 10.9, "mm": 34.3,
     "cmj_baseline": 45.0, "iso_baseline_l": 245, "iso_baseline_r": 240, "ck_basal": 160},
    {"name": "JORDAN", "pos": "MC", "weight": 92.2, "height": 192, "bf": 12.0, "mm": 42.8,
     "cmj_baseline": 54.5, "iso_baseline_l": 330, "iso_baseline_r": 325, "ck_basal": 200},
    {"name": "KELVIN", "pos": "ATA", "weight": 74.6, "height": 177, "bf": 10.3, "mm": 34.8,
     "cmj_baseline": 40.0, "iso_baseline_l": 230, "iso_baseline_r": 235, "ck_basal": 145},
    {"name": "LEANDRO MACIEL", "pos": "LAT", "weight": 91.3, "height": 188, "bf": 13.5, "mm": 41.6,
     "cmj_baseline": 45.0, "iso_baseline_l": 310, "iso_baseline_r": 305, "ck_basal": 190},
    {"name": "MARANHAO", "pos": "MC", "weight": 75.1, "height": 176, "bf": 11.0, "mm": 34.9,
     "cmj_baseline": 46.0, "iso_baseline_l": 255, "iso_baseline_r": 260, "ck_basal": 165},
    {"name": "MARQUINHO JR.", "pos": "ATA", "weight": 64.9, "height": 170, "bf": 9.2, "mm": 30.8,
     "cmj_baseline": 44.5, "iso_baseline_l": 220, "iso_baseline_r": 225, "ck_basal": 140},
    {"name": "MATHEUS SALES", "pos": "MC", "weight": 80.1, "height": 180, "bf": 11.7, "mm": 37.0,
     "cmj_baseline": 47.0, "iso_baseline_l": 270, "iso_baseline_r": 275, "ck_basal": 175},
    {"name": "MORELLI", "pos": "MC", "weight": 82.4, "height": 183, "bf": 12.1, "mm": 38.0,
     "cmj_baseline": 45.5, "iso_baseline_l": 275, "iso_baseline_r": 270, "ck_basal": 180},
    {"name": "PATRICK BREY", "pos": "ATA", "weight": 73.5, "height": 175, "bf": 10.0, "mm": 34.5,
     "cmj_baseline": 43.0, "iso_baseline_l": 240, "iso_baseline_r": 235, "ck_basal": 150},
    {"name": "PEDRINHO", "pos": "MC", "weight": 67.5, "height": 172, "bf": 9.5, "mm": 31.9,
     "cmj_baseline": 43.0, "iso_baseline_l": 230, "iso_baseline_r": 235, "ck_basal": 145},
    {"name": "PEDRO TORTELLO", "pos": "LAT", "weight": 75.1, "height": 178, "bf": 10.6, "mm": 35.0,
     "cmj_baseline": 43.0, "iso_baseline_l": 255, "iso_baseline_r": 250, "ck_basal": 160},
    {"name": "RAFAEL GAVA", "pos": "MC", "weight": 78.3, "height": 179, "bf": 11.4, "mm": 36.3,
     "cmj_baseline": 37.0, "iso_baseline_l": 260, "iso_baseline_r": 255, "ck_basal": 170},
    {"name": "THALLES", "pos": "ZAG", "weight": 83.9, "height": 184, "bf": 12.2, "mm": 38.7,
     "cmj_baseline": 45.0, "iso_baseline_l": 295, "iso_baseline_r": 290, "ck_basal": 185},
    {"name": "THIAGUINHO", "pos": "MC", "weight": 64.5, "height": 176, "bf": 7.7, "mm": 30.0,
     "cmj_baseline": 41.5, "iso_baseline_l": 235, "iso_baseline_r": 240, "ck_basal": 185},
    {"name": "VICTOR SOUZA", "pos": "GOL", "weight": 92.8, "height": 193, "bf": 14.1, "mm": 42.2,
     "cmj_baseline": 57.0, "iso_baseline_l": 325, "iso_baseline_r": 320, "ck_basal": 195},
    {"name": "WALLACE", "pos": "LAT", "weight": 91.6, "height": 186, "bf": 14.0, "mm": 41.3,
     "cmj_baseline": 41.0, "iso_baseline_l": 300, "iso_baseline_r": 295, "ck_basal": 190},
    {"name": "WHALACY", "pos": "MC", "weight": 72.3, "height": 174, "bf": 10.2, "mm": 33.9,
     "cmj_baseline": 42.0, "iso_baseline_l": 240, "iso_baseline_r": 245, "ck_basal": 150},
    {"name": "YURI", "pos": "LAT", "weight": 66.4, "height": 169, "bf": 9.0, "mm": 31.5,
     "cmj_baseline": 43.0, "iso_baseline_l": 225, "iso_baseline_r": 230, "ck_basal": 140},
]

N_DAYS = 120
START_DATE = datetime(2025, 11, 15)


def generate_longitudinal_data():
    """
    Gera dataset atleta-dia com todas as fontes multidisciplinares.
    Em produção: substituir por ETL real (planilhas / banco de dados).
    """
    records = []

    for ath in ATHLETES:
        # Estado latente de fadiga (varia por atleta)
        fatigue_state = 0.0
        injury_cooldown = 0

        for day_idx in range(N_DAYS):
            date = START_DATE + timedelta(days=day_idx)
            is_match = date.weekday() in [2, 5]  # Qua e Sab = jogos
            is_rest = date.weekday() == 0  # Seg = folga

            # --- GPS (Carga Externa) ---
            if is_rest:
                hsr = 0; sprints = 0; decels = 0; player_load = 0; duration = 0
            elif is_match:
                base_intensity = 1.3
                hsr = np.random.gamma(4, 80) * base_intensity
                sprints = np.random.poisson(12)
                decels = np.random.poisson(18)
                player_load = np.random.normal(650, 80)
                duration = np.random.choice([90, 70, 45, 30],
                                            p=[0.5, 0.25, 0.15, 0.1])
            else:
                base_intensity = np.random.uniform(0.6, 1.0)
                hsr = np.random.gamma(3, 50) * base_intensity
                sprints = np.random.poisson(6)
                decels = np.random.poisson(10)
                player_load = np.random.normal(400, 60)
                duration = np.random.choice([90, 75, 60], p=[0.3, 0.5, 0.2])

            # --- PSE (Carga Interna) ---
            if is_rest:
                pse = 0
            else:
                pse_base = 7.5 if is_match else np.random.uniform(3, 7)
                pse = np.clip(pse_base + fatigue_state * 0.5 +
                              np.random.normal(0, 0.5), 1, 10)
            srpe = round(pse * duration, 1)

            # --- Wellness ---
            sleep_quality = np.clip(
                np.random.normal(7.5, 1.2) - fatigue_state * 0.8, 1, 10)
            sleep_hours = np.clip(
                np.random.normal(7.8, 0.8) - fatigue_state * 0.3, 4, 12)
            pain = np.clip(fatigue_state * 2 + np.random.exponential(0.5), 0, 10)
            recovery_general = np.clip(
                np.random.normal(7.5, 1) - fatigue_state, 1, 10)
            recovery_legs = np.clip(
                np.random.normal(7.2, 1.2) - fatigue_state * 1.2, 1, 10)
            mood = np.clip(int(np.random.normal(4, 0.8) - fatigue_state * 0.3), 1, 5)
            energy = np.clip(int(np.random.normal(3, 0.5) - fatigue_state * 0.2), 1, 4)

            # --- CMJ & Força Isométrica ---
            fatigue_effect = 1 - fatigue_state * 0.04
            noise = np.random.normal(0, 0.02)
            cmj_today = ath["cmj_baseline"] * (fatigue_effect + noise)
            iso_l = ath["iso_baseline_l"] * (fatigue_effect + np.random.normal(0, 0.03))
            iso_r = ath["iso_baseline_r"] * (fatigue_effect + np.random.normal(0, 0.03))

            # --- Bioquímica ---
            ck_today = ath["ck_basal"] * (1 + fatigue_state * 0.6 +
                                           np.random.exponential(0.3))
            if is_match:
                ck_today *= np.random.uniform(1.5, 3.0)

            # --- Antropometria ---
            weight_today = ath["weight"] + np.random.normal(0, 0.3)
            bf_today = ath["bf"] + np.random.normal(0, 0.2)

            # --- Evento de Lesão (Target) ---
            # Probabilidade baseada em fatigue_state + interações
            injury_prob = 0.005  # base
            if fatigue_state > 1.5:
                injury_prob += 0.04
            if fatigue_state > 2.5:
                injury_prob += 0.08
            if ck_today / ath["ck_basal"] > 3:
                injury_prob += 0.03
            if abs(iso_l - iso_r) / max(iso_l, iso_r) > 0.15:
                injury_prob += 0.025
            if sleep_quality < 5:
                injury_prob += 0.02
            if pain > 4:
                injury_prob += 0.03
            if injury_cooldown > 0:
                injury_prob += 0.02  # recidiva

            injury = 1 if (np.random.random() < injury_prob and
                          injury_cooldown <= 0) else 0

            if injury:
                injury_cooldown = np.random.randint(7, 21)
            if injury_cooldown > 0:
                injury_cooldown -= 1

            # --- Atualizar estado de fadiga ---
            load_input = (hsr / 400 + sprints / 15 + player_load / 700) / 3
            recovery_input = (sleep_quality / 10 + recovery_general / 10) / 2
            fatigue_state = np.clip(
                fatigue_state * 0.85 + load_input * 0.4 - recovery_input * 0.2 +
                np.random.normal(0, 0.05), 0, 4)

            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "athlete": ath["name"],
                "position": ath["pos"],
                "weight_kg": round(weight_today, 1),
                "bf_pct": round(bf_today, 1),
                "height_cm": ath["height"],
                "muscle_mass_kg": ath["mm"],
                # GPS
                "hsr_m": round(hsr, 1),
                "sprints": sprints,
                "decels_3ms2": decels,
                "player_load": round(player_load, 1),
                "duration_min": duration,
                # Carga Interna
                "pse": round(pse, 1),
                "srpe": srpe,
                # Wellness
                "sleep_quality": round(sleep_quality, 1),
                "sleep_hours": round(sleep_hours, 1),
                "pain": round(pain, 1),
                "recovery_general": round(recovery_general, 1),
                "recovery_legs": round(recovery_legs, 1),
                "mood": mood,
                "energy": energy,
                # Saltos & Força
                "cmj_cm": round(cmj_today, 1),
                "cmj_baseline": ath["cmj_baseline"],
                "iso_left_n": round(iso_l, 1),
                "iso_right_n": round(iso_r, 1),
                "iso_baseline_l": ath["iso_baseline_l"],
                "iso_baseline_r": ath["iso_baseline_r"],
                # Bioquímica
                "ck_today": round(ck_today, 1),
                "ck_basal": ath["ck_basal"],
                # Target
                "injury": injury,
                "is_match": int(is_match),
                "is_rest": int(is_rest),
            })

    return pd.DataFrame(records)


# ==============================================================================
# 2. FEATURE ENGINEERING (TRANSFORMAÇÕES OBRIGATÓRIAS)
# ==============================================================================

def ewma(series, span):
    """Exponentially Weighted Moving Average."""
    return series.ewm(span=span, adjust=False).mean()


def compute_ewma_acwr(group, col, acute_span=7, chronic_span=28):
    """
    EWMA ACWR (Razão Aguda/Crônica Exponencial).
    Referência: Williams et al. (2017) — BJSM.
    """
    acute = ewma(group[col], span=acute_span)
    chronic = ewma(group[col], span=chronic_span)
    # Evitar divisão por zero
    acwr = acute / chronic.replace(0, np.nan)
    return acwr.fillna(1.0)


def engineer_features(df):
    """
    Executa todas as transformações de Feature Engineering conforme spec.
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["athlete", "date"]).reset_index(drop=True)

    engineered = []

    for athlete, grp in df.groupby("athlete"):
        g = grp.copy()

        # =====================================================================
        # TAREFA 1: FLAGS DE HISTÓRICO DE LESÃO (30, 60, 180 dias)
        # =====================================================================
        g["injury_last_30d"] = (
            g["injury"].rolling(window=30, min_periods=1).sum().shift(1).fillna(0)
            .apply(lambda x: 1 if x > 0 else 0)
        )
        g["injury_last_60d"] = (
            g["injury"].rolling(window=60, min_periods=1).sum().shift(1).fillna(0)
            .apply(lambda x: 1 if x > 0 else 0)
        )
        g["injury_last_180d"] = (
            g["injury"].rolling(window=180, min_periods=1).sum().shift(1).fillna(0)
            .apply(lambda x: 1 if x > 0 else 0)
        )

        # =====================================================================
        # TAREFA 2: EWMA ACWR — HSR, Sprints, Desacelerações
        # =====================================================================
        g["acwr_hsr"] = compute_ewma_acwr(g, "hsr_m")
        g["acwr_sprints"] = compute_ewma_acwr(g, "sprints")
        g["acwr_decels"] = compute_ewma_acwr(g, "decels_3ms2")

        # ACWR combinado (média ponderada)
        g["acwr_combined"] = (
            g["acwr_hsr"] * 0.4 +
            g["acwr_sprints"] * 0.35 +
            g["acwr_decels"] * 0.25
        )

        # =====================================================================
        # TAREFA 3: FADIGA RESIDUAL — Delta CMJ & Assimetria Iso
        # =====================================================================
        g["cmj_delta_pct"] = (
            (g["cmj_cm"] - g["cmj_baseline"]) / g["cmj_baseline"] * 100
        )
        g["iso_asymmetry_pct"] = (
            (g["iso_left_n"] - g["iso_right_n"]).abs() /
            g[["iso_left_n", "iso_right_n"]].max(axis=1) * 100
        )
        g["iso_asymmetry_flag"] = (g["iso_asymmetry_pct"] > 15).astype(int)

        # Delta força isométrica vs baseline (média L+R)
        iso_today_avg = (g["iso_left_n"] + g["iso_right_n"]) / 2
        iso_baseline_avg = (g["iso_baseline_l"] + g["iso_baseline_r"]) / 2
        g["iso_delta_pct"] = (
            (iso_today_avg - iso_baseline_avg) / iso_baseline_avg * 100
        )

        # =====================================================================
        # TAREFA 4: ÍNDICE DE ESTRESSE SISTÊMICO (sRPE acumulada 7d)
        # =====================================================================
        g["srpe_7d_sum"] = (
            g["srpe"].rolling(window=7, min_periods=1).sum()
        )
        g["srpe_7d_mean"] = (
            g["srpe"].rolling(window=7, min_periods=1).mean()
        )
        # Monotonia (Foster) = média / desvio padrão da carga semanal
        srpe_std = g["srpe"].rolling(window=7, min_periods=3).std()
        g["training_monotony"] = g["srpe_7d_mean"] / srpe_std.replace(0, np.nan)
        g["training_monotony"] = g["training_monotony"].fillna(1.0)
        # Strain = carga semanal x monotonia
        g["training_strain"] = g["srpe_7d_sum"] * g["training_monotony"]

        # =====================================================================
        # TAREFA 5: DÉFICIT BIOLÓGICO (CK ratio x Sono)
        # =====================================================================
        g["ck_ratio"] = g["ck_today"] / g["ck_basal"]
        g["biological_deficit"] = g["ck_ratio"] * (10 - g["sleep_quality"]) / 10

        # =====================================================================
        # FEATURES ADICIONAIS (interações não-lineares)
        # =====================================================================
        # Player Load acumulado 3 dias
        g["pl_3d_sum"] = g["player_load"].rolling(window=3, min_periods=1).sum()

        # Variação de peso vs média
        g["weight_delta"] = g["weight_kg"] - g["weight_kg"].rolling(
            window=14, min_periods=3).mean()

        # Sleep deficit (< 7h)
        g["sleep_deficit"] = (g["sleep_hours"] < 7).astype(int)

        # Wellness composite score
        g["wellness_composite"] = (
            g["sleep_quality"] +
            g["recovery_general"] +
            g["recovery_legs"] +
            (10 - g["pain"]) +
            g["mood"] * 2 +
            g["energy"] * 2.5
        ) / 6

        # Pain trend (3 dias)
        g["pain_3d_trend"] = g["pain"].rolling(window=3, min_periods=1).mean()

        # Interaction: ACWR alto + Sono ruim
        g["acwr_x_sleep_deficit"] = g["acwr_combined"] * (10 - g["sleep_quality"])

        # Interaction: CK elevado + assimetria
        g["ck_x_asymmetry"] = g["ck_ratio"] * g["iso_asymmetry_pct"]

        # Dias desde última lesão
        injury_dates = g[g["injury"] == 1].index
        g["days_since_injury"] = np.nan
        for idx in g.index:
            prev_injuries = injury_dates[injury_dates < idx]
            if len(prev_injuries) > 0:
                g.loc[idx, "days_since_injury"] = idx - prev_injuries[-1]
            else:
                g.loc[idx, "days_since_injury"] = 999
        g["days_since_injury"] = g["days_since_injury"].fillna(999)

        engineered.append(g)

    result = pd.concat(engineered, ignore_index=True)

    # Position encoding
    pos_map = {"GOL": 0, "ZAG": 1, "LAT": 2, "MC": 3, "ATA": 4}
    result["pos_encoded"] = result["position"].map(pos_map)

    return result


# ==============================================================================
# 3. FEATURE SELECTION & MODELO PREDITIVO
# ==============================================================================

FEATURE_COLS = [
    # Histórico
    "injury_last_30d", "injury_last_60d", "injury_last_180d",
    # EWMA ACWR
    "acwr_hsr", "acwr_sprints", "acwr_decels", "acwr_combined",
    # Fadiga Residual
    "cmj_delta_pct", "iso_asymmetry_pct", "iso_asymmetry_flag", "iso_delta_pct",
    # Estresse Sistêmico
    "srpe_7d_sum", "srpe_7d_mean", "training_monotony", "training_strain",
    # Déficit Biológico
    "ck_ratio", "biological_deficit",
    # GPS
    "hsr_m", "sprints", "decels_3ms2", "player_load", "pl_3d_sum",
    # Wellness
    "sleep_quality", "sleep_hours", "pain", "recovery_general",
    "recovery_legs", "mood", "energy", "wellness_composite",
    "pain_3d_trend", "sleep_deficit",
    # Antropometria
    "weight_kg", "bf_pct", "weight_delta",
    # Interações
    "acwr_x_sleep_deficit", "ck_x_asymmetry",
    # Temporal
    "days_since_injury", "is_match",
    # Posição
    "pos_encoded",
]


def train_model(df):
    """
    Pipeline: SMOTE + XGBoost com Stratified K-Fold.
    Proibido: regressão linear/logística simples.
    """
    # Remover dias de folga (sem exposição = sem risco)
    df_train = df[df["is_rest"] == 0].copy()

    # Remover primeiros 28 dias (warm-up do EWMA)
    df_train = df_train.groupby("athlete").apply(
        lambda x: x.iloc[28:]
    ).reset_index(drop=True)

    X = df_train[FEATURE_COLS].fillna(0)
    y = df_train["injury"]

    print(f"\n{'='*60}")
    print(f"DISTRIBUIÇÃO DE CLASSES")
    print(f"{'='*60}")
    print(f"  Sem lesão (0): {(y==0).sum()} ({(y==0).mean()*100:.1f}%)")
    print(f"  Com lesão (1): {(y==1).sum()} ({(y==1).mean()*100:.1f}%)")
    print(f"  Ratio: 1:{int((y==0).sum()/(y==1).sum()) if (y==1).sum()>0 else 'N/A'}")

    # --- PIPELINE: SMOTE + XGBoost ---
    model = ImbPipeline([
        ("scaler", StandardScaler()),
        ("smote", SMOTE(
            sampling_strategy=0.3,
            random_state=42,
            k_neighbors=5
        )),
        ("xgb", XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=5,
            gamma=0.1,
            scale_pos_weight=3,
            reg_alpha=0.1,
            reg_lambda=1.0,
            eval_metric="aucpr",
            random_state=42,
            use_label_encoder=False,
            n_jobs=-1,
        ))
    ])

    # --- Stratified K-Fold Cross-Validation ---
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print(f"\n{'='*60}")
    print(f"TREINANDO: SMOTE + XGBoost (5-Fold Stratified CV)")
    print(f"{'='*60}")

    # Cross-val predictions
    y_pred_proba = cross_val_predict(
        model, X, y, cv=cv, method="predict_proba"
    )[:, 1]

    y_pred = (y_pred_proba > 0.3).astype(int)  # threshold otimizado

    # Métricas
    print(f"\n--- Classification Report (threshold=0.30) ---")
    print(classification_report(y, y_pred, target_names=["Apto", "Lesão"]))

    auc_roc = roc_auc_score(y, y_pred_proba)
    auc_pr = average_precision_score(y, y_pred_proba)
    print(f"  AUC-ROC: {auc_roc:.3f}")
    print(f"  AUC-PR:  {auc_pr:.3f}")

    # --- Treinar modelo final em todos os dados ---
    model.fit(X, y)

    # --- Feature Importance (do XGBoost interno) ---
    xgb_model = model.named_steps["xgb"]
    importances = pd.Series(
        xgb_model.feature_importances_, index=FEATURE_COLS
    ).sort_values(ascending=False)

    print(f"\n{'='*60}")
    print(f"FEATURE IMPORTANCE MATRIX (Top 15)")
    print(f"{'='*60}")
    for feat, imp in importances.head(15).items():
        bar = "█" * int(imp * 100)
        print(f"  {feat:<30} {imp:.4f} {bar}")

    return model, importances, X, y, y_pred_proba


# ==============================================================================
# 4. IDENTIFICAÇÃO DE CLUSTERS DE RISCO
# ==============================================================================

def identify_risk_clusters(df, importances):
    """
    Identifica padrões multimodais de risco (Bittencourt — Sistemas Complexos).
    """
    print(f"\n{'='*60}")
    print(f"CLUSTERS DE RISCO IDENTIFICADOS")
    print(f"{'='*60}")

    clusters = []

    # Cluster 1: ACWR extremo + Assimetria
    mask1 = (df["acwr_combined"] > 1.4) & (df["iso_asymmetry_pct"] > 12)
    inj_rate1 = df.loc[mask1, "injury"].mean() * 100 if mask1.sum() > 0 else 0
    clusters.append({
        "name": "ACWR Alto + Assimetria Bilateral",
        "rule": "ACWR combinado > 1.4 + Assimetria ISO > 12%",
        "n_episodes": int(mask1.sum()),
        "injury_rate": round(inj_rate1, 1),
        "action": "Reduzir volume HSR 30%. Protocolo de simetria pré-treino."
    })
    print(f"\n  CLUSTER 1: ACWR > 1.4 + Assimetria > 12%")
    print(f"    Episódios: {mask1.sum()} | Taxa de lesão: {inj_rate1:.1f}%")

    # Cluster 2: CK elevado + Sono ruim + Dor
    mask2 = (df["ck_ratio"] > 2.5) & (df["sleep_quality"] < 6) & (df["pain"] > 3)
    inj_rate2 = df.loc[mask2, "injury"].mean() * 100 if mask2.sum() > 0 else 0
    clusters.append({
        "name": "Estresse Biológico Composto",
        "rule": "CK/Basal > 2.5 + Sono < 6 + Dor > 3",
        "n_episodes": int(mask2.sum()),
        "injury_rate": round(inj_rate2, 1),
        "action": "Sessão regenerativa. Crioterapia. Remonitorar CK 48h."
    })
    print(f"\n  CLUSTER 2: CK ratio > 2.5 + Sono < 6 + Dor > 3")
    print(f"    Episódios: {mask2.sum()} | Taxa de lesão: {inj_rate2:.1f}%")

    # Cluster 3: Sobrecarga acumulada + queda CMJ
    mask3 = (df["srpe_7d_sum"] > 3000) & (df["cmj_delta_pct"] < -8)
    inj_rate3 = df.loc[mask3, "injury"].mean() * 100 if mask3.sum() > 0 else 0
    clusters.append({
        "name": "Sobrecarga + Fadiga Neuromuscular",
        "rule": "sRPE 7d > 3000 + CMJ Delta < -8%",
        "n_episodes": int(mask3.sum()),
        "injury_rate": round(inj_rate3, 1),
        "action": "MED (Minimum Effective Dose). Apenas treino técnico-tático."
    })
    print(f"\n  CLUSTER 3: sRPE 7d > 3000 + CMJ delta < -8%")
    print(f"    Episódios: {mask3.sum()} | Taxa de lesão: {inj_rate3:.1f}%")

    # Cluster 4: Monotonia alta + Recidiva
    mask4 = (df["training_monotony"] > 2.0) & (df["injury_last_30d"] == 1)
    inj_rate4 = df.loc[mask4, "injury"].mean() * 100 if mask4.sum() > 0 else 0
    clusters.append({
        "name": "Monotonia + Histórico Recente",
        "rule": "Monotonia > 2.0 + Lesão nos últimos 30 dias",
        "n_episodes": int(mask4.sum()),
        "injury_rate": round(inj_rate4, 1),
        "action": "Variar estímulos. Reduzir frequência semanal. Fisioterapia preventiva."
    })
    print(f"\n  CLUSTER 4: Monotonia > 2.0 + Lesão recente (30d)")
    print(f"    Episódios: {mask4.sum()} | Taxa de lesão: {inj_rate4:.1f}%")

    # Cluster 5: Déficit biológico + carga alta
    mask5 = (df["biological_deficit"] > 1.5) & (df["acwr_hsr"] > 1.3)
    inj_rate5 = df.loc[mask5, "injury"].mean() * 100 if mask5.sum() > 0 else 0
    clusters.append({
        "name": "Déficit Biológico + Carga HSR",
        "rule": "Déficit Bio > 1.5 + ACWR HSR > 1.3",
        "n_episodes": int(mask5.sum()),
        "injury_rate": round(inj_rate5, 1),
        "action": "Protocolo de recuperação ativa. Suplementação. Sono prioritário."
    })
    print(f"\n  CLUSTER 5: Déficit Biológico > 1.5 + ACWR HSR > 1.3")
    print(f"    Episódios: {mask5.sum()} | Taxa de lesão: {inj_rate5:.1f}%")

    return clusters


# ==============================================================================
# 5. SURVIVAL ANALYSIS (OPCIONAL / AVANÇADO)
# ==============================================================================

def survival_analysis(df):
    """
    Modelo de Cox com covariáveis dependentes do tempo.
    Opcional: requer lifelines.
    """
    if not HAS_LIFELINES:
        print("\n[SKIP] lifelines não instalado. Survival analysis desabilitada.")
        return None

    print(f"\n{'='*60}")
    print(f"ANÁLISE DE SOBREVIVÊNCIA — Cox PH")
    print(f"{'='*60}")

    # Preparar dados para survival: tempo até lesão
    survival_data = []
    for athlete, grp in df.groupby("athlete"):
        g = grp.sort_values("date").reset_index(drop=True)
        last_event = 0
        for i, row in g.iterrows():
            time_since = i - last_event
            if row["injury"] == 1:
                survival_data.append({
                    "duration": max(time_since, 1),
                    "event": 1,
                    "acwr_combined": row["acwr_combined"],
                    "ck_ratio": row["ck_ratio"],
                    "cmj_delta_pct": row["cmj_delta_pct"],
                    "sleep_quality": row["sleep_quality"],
                    "pain": row["pain"],
                    "iso_asymmetry_pct": row["iso_asymmetry_pct"],
                    "srpe_7d_sum": row["srpe_7d_sum"],
                    "biological_deficit": row["biological_deficit"],
                })
                last_event = i
        # Censored observation (último dia sem lesão)
        survival_data.append({
            "duration": max(len(g) - last_event, 1),
            "event": 0,
            "acwr_combined": g.iloc[-1]["acwr_combined"],
            "ck_ratio": g.iloc[-1]["ck_ratio"],
            "cmj_delta_pct": g.iloc[-1]["cmj_delta_pct"],
            "sleep_quality": g.iloc[-1]["sleep_quality"],
            "pain": g.iloc[-1]["pain"],
            "iso_asymmetry_pct": g.iloc[-1]["iso_asymmetry_pct"],
            "srpe_7d_sum": g.iloc[-1]["srpe_7d_sum"],
            "biological_deficit": g.iloc[-1]["biological_deficit"],
        })

    surv_df = pd.DataFrame(survival_data)

    cph = CoxPHFitter(penalizer=0.1)
    cph.fit(surv_df, duration_col="duration", event_col="event")
    cph.print_summary()

    return cph


# ==============================================================================
# 6. GERAR ALERTAS PARA PRÓXIMA SESSÃO
# ==============================================================================

def generate_tomorrow_alerts(df, model, feature_cols):
    """
    Prediz risco para a próxima sessão de cada atleta.
    Gera tabela de alertas com dosagem recomendada.
    """
    # Último registro de cada atleta
    latest = df.groupby("athlete").last().reset_index()

    X_latest = latest[feature_cols].fillna(0)
    probs = model.predict_proba(X_latest)[:, 1]
    latest["risk_probability"] = probs
    latest["risk_zone"] = pd.cut(
        probs,
        bins=[0, 0.15, 0.30, 0.50, 1.0],
        labels=["VERDE", "AMARELO", "LARANJA", "VERMELHO"]
    )

    # Dosagem recomendada
    def dosage(row):
        p = row["risk_probability"]
        if p >= 0.50:
            return "EXCLUIR da sessão. Apenas fisioterapia."
        elif p >= 0.30:
            return "MED: 50% do volume. Sem HSR. Técnico-tático apenas."
        elif p >= 0.15:
            return "Reduzir HSR 30%. Monitorar PSE pós-treino."
        else:
            return "Carga normal. Manter monitoramento de rotina."

    latest["dosage"] = latest.apply(dosage, axis=1)

    # Ordenar por risco
    alerts = latest.sort_values("risk_probability", ascending=False)

    print(f"\n{'='*60}")
    print(f"ALERTA — PRONTIDÃO PARA PRÓXIMA SESSÃO (13/Mar/2026)")
    print(f"{'='*60}")
    print(f"{'Atleta':<22} {'Pos':<5} {'Prob%':<8} {'Zona':<10} {'Dosagem'}")
    print("-" * 100)
    for _, row in alerts.iterrows():
        zone_colors = {"VERMELHO": "🔴", "LARANJA": "🟠", "AMARELO": "🟡", "VERDE": "🟢"}
        icon = zone_colors.get(row["risk_zone"], "⚪")
        print(f"  {icon} {row['athlete']:<20} {row['position']:<5} "
              f"{row['risk_probability']*100:>5.1f}%  {row['risk_zone']:<10} "
              f"{row['dosage']}")

    return alerts


# ==============================================================================
# 7. EXPORTAR DADOS PARA DASHBOARD (JSON)
# ==============================================================================

def export_to_dashboard(alerts, importances, clusters):
    """
    Exporta resultados do modelo para JSON consumido pelo dashboard Next.js.
    """
    output = {
        "generated_at": datetime.now().isoformat(),
        "model": "XGBoost + SMOTE (5-Fold Stratified CV)",
        "feature_importance": [
            {"feature": feat, "importance": round(float(imp), 4)}
            for feat, imp in importances.head(20).items()
        ],
        "risk_clusters": clusters,
        "alerts": [
            {
                "athlete": row["athlete"],
                "position": row["position"],
                "risk_probability": round(float(row["risk_probability"]), 3),
                "risk_zone": row["risk_zone"],
                "dosage": row["dosage"],
                "acwr_combined": round(float(row["acwr_combined"]), 2),
                "ck_ratio": round(float(row["ck_ratio"]), 2),
                "cmj_delta_pct": round(float(row["cmj_delta_pct"]), 1),
                "sleep_quality": round(float(row["sleep_quality"]), 1),
                "biological_deficit": round(float(row["biological_deficit"]), 2),
                "wellness_composite": round(float(row["wellness_composite"]), 1),
            }
            for _, row in alerts.iterrows()
        ]
    }

    output_path = Path(__file__).parent / "risk_output.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Dados exportados para: {output_path}")
    return output


# ==============================================================================
# MAIN — EXECUÇÃO COMPLETA DO PIPELINE
# ==============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("  MOTOR PREDITIVO DE LESÕES — Botafogo-SP FSA")
    print("  Saúde e Performance · 2026")
    print("=" * 60)

    # 1. Gerar / Carregar dados
    print("\n[1/6] Gerando dados longitudinais (32 atletas x 120 dias)...")
    df_raw = generate_longitudinal_data()
    print(f"  → {len(df_raw)} registros | {df_raw['injury'].sum()} eventos de lesão")

    # 2. Feature Engineering
    print("\n[2/6] Executando Feature Engineering...")
    df_feat = engineer_features(df_raw)
    print(f"  → {len(FEATURE_COLS)} features engenheiradas")

    # 3. Treinar modelo
    print("\n[3/6] Treinando pipeline SMOTE + XGBoost...")
    model, importances, X, y, y_proba = train_model(df_feat)

    # 4. Clusters de risco
    print("\n[4/6] Identificando clusters de risco...")
    df_analysis = df_feat[df_feat["is_rest"] == 0].copy()
    clusters = identify_risk_clusters(df_analysis, importances)

    # 5. Survival Analysis
    print("\n[5/6] Análise de sobrevivência...")
    survival_analysis(df_feat)

    # 6. Alertas
    print("\n[6/6] Gerando alertas para próxima sessão...")
    alerts = generate_tomorrow_alerts(df_feat, model, FEATURE_COLS)

    # Export
    export_to_dashboard(alerts, importances, clusters)

    print(f"\n{'='*60}")
    print(f"  PIPELINE CONCLUÍDO COM SUCESSO")
    print(f"{'='*60}")
