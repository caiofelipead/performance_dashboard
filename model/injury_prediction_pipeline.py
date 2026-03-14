"""
================================================================================
MOTOR PREDITIVO DE LESÕES — NÍVEL ELITE
Botafogo-SP FSA — Núcleo de Saúde e Performance
================================================================================
Paradigma: Sistemas Complexos (Bittencourt et al., 2016)
Arquitetura ML: KNNImputer → Scaler → SMOTE → LASSO → XGBoost → Calibração → SHAP
Otimização: Optuna (Bayesian HPO)
Referências:
  - Williams et al. (2017) — EWMA ACWR
  - Hulin et al. (2014) — Fatigue Debt
  - Rossi et al. (2022) — Gradient Boosted Trees for injury prediction
  - Gabbett (2016) — Training-injury prevention paradox
================================================================================
"""

import numpy as np
import pandas as pd
import json
import warnings
from datetime import datetime, timedelta
from pathlib import Path

# ML Core
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    classification_report, roc_auc_score, precision_recall_curve,
    average_precision_score, confusion_matrix, f1_score, recall_score,
    precision_score, matthews_corrcoef
)
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.linear_model import LassoCV
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV, calibration_curve

# Imbalanced Learning
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTETomek
from imblearn.pipeline import Pipeline as ImbPipeline

# XGBoost
from xgboost import XGBClassifier

# Hyperparameter Optimization
import optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

# Explainability
import shap

# Survival Analysis (optional)
try:
    from lifelines import CoxPHFitter
    HAS_LIFELINES = True
except ImportError:
    HAS_LIFELINES = False

warnings.filterwarnings("ignore")
np.random.seed(42)


# ==============================================================================
# 1. DADOS LONGITUDINAIS (ATLETA-DIA)
# ==============================================================================

ATHLETES = [
    {"name": "ADRIANO", "pos": "ZAG", "weight": 82.7, "height": 183, "bf": 12.4, "mm": 38.2,
     "cmj_baseline": 51.5, "iso_baseline_l": 280, "iso_baseline_r": 290, "ck_basal": 180},
    {"name": "BRENNO", "pos": "GOL", "weight": 90.8, "height": 191, "bf": 13.8, "mm": 41.5,
     "cmj_baseline": 46.2, "iso_baseline_l": 310, "iso_baseline_r": 305, "ck_basal": 160},
    {"name": "CARLOS EDUARDO", "pos": "ZAG", "weight": 85.9, "height": 186, "bf": 11.9, "mm": 39.8,
     "cmj_baseline": 47.5, "iso_baseline_l": 295, "iso_baseline_r": 300, "ck_basal": 190},
    {"name": "DARLAN", "pos": "MC", "weight": 80.2, "height": 186, "bf": 10.5, "mm": 37.1,
     "cmj_baseline": 33.0, "iso_baseline_l": 260, "iso_baseline_r": 265, "ck_basal": 170},
    {"name": "ERICSON", "pos": "ZAG", "weight": 91.6, "height": 184, "bf": 13.2, "mm": 42.0,
     "cmj_baseline": 47.0, "iso_baseline_l": 320, "iso_baseline_r": 310, "ck_basal": 200},
    {"name": "ERIK", "pos": "ATA", "weight": 75.5, "height": 176, "bf": 9.8, "mm": 35.4,
     "cmj_baseline": 53.0, "iso_baseline_l": 240, "iso_baseline_r": 245, "ck_basal": 150},
    {"name": "FELIPINHO", "pos": "LAT", "weight": 78.0, "height": 179, "bf": 11.2, "mm": 36.0,
     "cmj_baseline": 42.0, "iso_baseline_l": 250, "iso_baseline_r": 255, "ck_basal": 165},
    {"name": "FELIPE VIEIRA", "pos": "LE", "weight": 77.0, "height": 176, "bf": 7.7, "mm": 35.8,
     "cmj_baseline": 45.0, "iso_baseline_l": 260, "iso_baseline_r": 265, "ck_basal": 174},
    {"name": "GABRIEL INOCENCIO", "pos": "MC", "weight": 78.5, "height": 177, "bf": 10.8, "mm": 36.5,
     "cmj_baseline": 49.5, "iso_baseline_l": 270, "iso_baseline_r": 275, "ck_basal": 175},
    {"name": "GUI MARIANO", "pos": "ZAG", "weight": 89.7, "height": 191, "bf": 12.7, "mm": 41.0,
     "cmj_baseline": 53.0, "iso_baseline_l": 305, "iso_baseline_r": 310, "ck_basal": 185},
    {"name": "GUILHERME QUEIROZ", "pos": "ZAG", "weight": 87.9, "height": 180, "bf": 13.1, "mm": 40.2,
     "cmj_baseline": 45.5, "iso_baseline_l": 290, "iso_baseline_r": 285, "ck_basal": 195},
    {"name": "GUSTAVO VILAR", "pos": "LAT", "weight": 86.4, "height": 189, "bf": 12.9, "mm": 39.5,
     "cmj_baseline": 44.5, "iso_baseline_l": 275, "iso_baseline_r": 280, "ck_basal": 185},
    {"name": "HEBERT", "pos": "ZAG", "weight": 88.1, "height": 187, "bf": 12.5, "mm": 40.8,
     "cmj_baseline": 50.5, "iso_baseline_l": 300, "iso_baseline_r": 295, "ck_basal": 190},
    {"name": "HENRIQUE TELES", "pos": "LAT", "weight": 80.1, "height": 179, "bf": 11.3, "mm": 37.2,
     "cmj_baseline": 52.0, "iso_baseline_l": 260, "iso_baseline_r": 270, "ck_basal": 170},
    {"name": "HYGOR", "pos": "MC", "weight": 83.3, "height": 183, "bf": 11.6, "mm": 38.6,
     "cmj_baseline": 42.8, "iso_baseline_l": 280, "iso_baseline_r": 285, "ck_basal": 180},
    {"name": "JEFFERSON NEM", "pos": "ATA", "weight": 72.5, "height": 166, "bf": 10.1, "mm": 33.8,
     "cmj_baseline": 48.0, "iso_baseline_l": 235, "iso_baseline_r": 240, "ck_basal": 155},
    {"name": "JONATHAN", "pos": "LAT", "weight": 73.7, "height": 177, "bf": 10.9, "mm": 34.3,
     "cmj_baseline": 45.0, "iso_baseline_l": 245, "iso_baseline_r": 240, "ck_basal": 160},
    {"name": "JORDAN", "pos": "MC", "weight": 92.2, "height": 189, "bf": 12.0, "mm": 42.8,
     "cmj_baseline": 54.5, "iso_baseline_l": 330, "iso_baseline_r": 325, "ck_basal": 200},
    {"name": "KELVIN", "pos": "ATA", "weight": 74.6, "height": 170, "bf": 10.3, "mm": 34.8,
     "cmj_baseline": 40.0, "iso_baseline_l": 230, "iso_baseline_r": 235, "ck_basal": 145},
    {"name": "LEANDRO MACIEL", "pos": "LAT", "weight": 91.3, "height": 175, "bf": 13.5, "mm": 41.6,
     "cmj_baseline": 45.0, "iso_baseline_l": 310, "iso_baseline_r": 305, "ck_basal": 190},
    {"name": "MARANHAO", "pos": "MC", "weight": 75.1, "height": 171, "bf": 11.0, "mm": 34.9,
     "cmj_baseline": 46.0, "iso_baseline_l": 255, "iso_baseline_r": 260, "ck_basal": 165},
    {"name": "MARQUINHO JR.", "pos": "ATA", "weight": 64.9, "height": 182, "bf": 9.2, "mm": 30.8,
     "cmj_baseline": 44.5, "iso_baseline_l": 220, "iso_baseline_r": 225, "ck_basal": 140},
    {"name": "MATHEUS SALES", "pos": "MC", "weight": 80.1, "height": 176, "bf": 11.7, "mm": 37.0,
     "cmj_baseline": 47.0, "iso_baseline_l": 270, "iso_baseline_r": 275, "ck_basal": 175},
    {"name": "MORELLI", "pos": "MC", "weight": 82.4, "height": 181, "bf": 12.1, "mm": 38.0,
     "cmj_baseline": 45.5, "iso_baseline_l": 275, "iso_baseline_r": 270, "ck_basal": 180},
    {"name": "PATRICK BREY", "pos": "ATA", "weight": 73.5, "height": 176, "bf": 10.0, "mm": 34.5,
     "cmj_baseline": 43.0, "iso_baseline_l": 240, "iso_baseline_r": 235, "ck_basal": 150},
    {"name": "PEDRINHO", "pos": "MC", "weight": 67.5, "height": 175, "bf": 9.5, "mm": 31.9,
     "cmj_baseline": 43.0, "iso_baseline_l": 230, "iso_baseline_r": 235, "ck_basal": 145},
    {"name": "PEDRO TORTELLO", "pos": "LAT", "weight": 75.1, "height": 176, "bf": 10.6, "mm": 35.0,
     "cmj_baseline": 43.0, "iso_baseline_l": 255, "iso_baseline_r": 250, "ck_basal": 160},
    {"name": "RAFAEL GAVA", "pos": "MC", "weight": 78.3, "height": 178, "bf": 11.4, "mm": 36.3,
     "cmj_baseline": 37.0, "iso_baseline_l": 260, "iso_baseline_r": 255, "ck_basal": 170},
    {"name": "THALLES", "pos": "ZAG", "weight": 83.9, "height": 178, "bf": 12.2, "mm": 38.7,
     "cmj_baseline": 45.0, "iso_baseline_l": 295, "iso_baseline_r": 290, "ck_basal": 185},
    {"name": "THIAGUINHO", "pos": "MC", "weight": 64.5, "height": 176, "bf": 7.7, "mm": 30.0,
     "cmj_baseline": 41.5, "iso_baseline_l": 235, "iso_baseline_r": 240, "ck_basal": 185},
    {"name": "VICTOR SOUZA", "pos": "GOL", "weight": 92.8, "height": 187, "bf": 14.1, "mm": 42.2,
     "cmj_baseline": 57.0, "iso_baseline_l": 325, "iso_baseline_r": 320, "ck_basal": 195},
    {"name": "WALLACE", "pos": "LAT", "weight": 91.6, "height": 192, "bf": 14.0, "mm": 41.3,
     "cmj_baseline": 41.0, "iso_baseline_l": 300, "iso_baseline_r": 295, "ck_basal": 190},
    {"name": "WHALACY", "pos": "MC", "weight": 72.3, "height": 174, "bf": 10.2, "mm": 33.9,  # sem altura na planilha
     "cmj_baseline": 42.0, "iso_baseline_l": 240, "iso_baseline_r": 245, "ck_basal": 150},
    {"name": "YURI", "pos": "LAT", "weight": 66.4, "height": 172, "bf": 9.0, "mm": 31.5,
     "cmj_baseline": 43.0, "iso_baseline_l": 225, "iso_baseline_r": 230, "ck_basal": 140},
]

N_DAYS = 120
START_DATE = datetime(2025, 11, 15)
TRAINING_TYPES = ["strength", "tactical", "technical", "conditioning", "recovery"]


def generate_longitudinal_data():
    """
    Gera dataset atleta-dia com estrutura longitudinal completa.
    Campos obrigatórios: player_id, date, training_load, match_load, cmj,
    sleep, ck, hrv, injury, days_since_last_injury, minutes_played, training_type.
    """
    records = []

    for pid, ath in enumerate(ATHLETES):
        fatigue_state = 0.0
        injury_cooldown = 0
        days_since_last_injury = 999
        hrv_baseline = np.random.uniform(55, 75)

        for day_idx in range(N_DAYS):
            date = START_DATE + timedelta(days=day_idx)
            is_match = date.weekday() in [2, 5]
            is_rest = date.weekday() == 0

            # Training type
            if is_rest:
                training_type = "recovery"
            elif is_match:
                training_type = "match"
            else:
                training_type = np.random.choice(TRAINING_TYPES[:4],
                                                  p=[0.25, 0.30, 0.25, 0.20])

            # --- GPS (External Load) ---
            if is_rest:
                hsr = 0; sprints = 0; decels = 0; player_load = 0; duration = 0
                minutes_played = 0
            elif is_match:
                base_intensity = 1.3
                hsr = np.random.gamma(4, 80) * base_intensity
                sprints = np.random.poisson(12)
                decels = np.random.poisson(18)
                player_load = np.random.normal(650, 80)
                duration = np.random.choice([90, 70, 45, 30], p=[0.5, 0.25, 0.15, 0.1])
                minutes_played = duration
            else:
                base_intensity = np.random.uniform(0.6, 1.0)
                hsr = np.random.gamma(3, 50) * base_intensity
                sprints = np.random.poisson(6)
                decels = np.random.poisson(10)
                player_load = np.random.normal(400, 60)
                duration = np.random.choice([90, 75, 60], p=[0.3, 0.5, 0.2])
                minutes_played = duration

            # --- PSE / sRPE ---
            if is_rest:
                pse = 0
            else:
                pse_base = 7.5 if is_match else np.random.uniform(3, 7)
                pse = np.clip(pse_base + fatigue_state * 0.5 + np.random.normal(0, 0.5), 1, 10)
            srpe = round(pse * duration, 1)
            training_load = srpe
            match_load = srpe if is_match else 0.0

            # --- Wellness ---
            sleep_quality = np.clip(np.random.normal(7.5, 1.2) - fatigue_state * 0.8, 1, 10)
            sleep_hours = np.clip(np.random.normal(7.8, 0.8) - fatigue_state * 0.3, 4, 12)
            pain = np.clip(fatigue_state * 2 + np.random.exponential(0.5), 0, 10)
            recovery_general = np.clip(np.random.normal(7.5, 1) - fatigue_state, 1, 10)
            recovery_legs = np.clip(np.random.normal(7.2, 1.2) - fatigue_state * 1.2, 1, 10)
            mood = np.clip(int(np.random.normal(4, 0.8) - fatigue_state * 0.3), 1, 5)
            energy = np.clip(int(np.random.normal(3, 0.5) - fatigue_state * 0.2), 1, 4)

            # --- HRV (Heart Rate Variability) ---
            hrv = np.clip(
                hrv_baseline * (1 - fatigue_state * 0.06) + np.random.normal(0, 3),
                30, 100
            )

            # --- CMJ & Isometric ---
            fatigue_effect = 1 - fatigue_state * 0.04
            noise = np.random.normal(0, 0.02)
            cmj_today = ath["cmj_baseline"] * (fatigue_effect + noise)
            iso_l = ath["iso_baseline_l"] * (fatigue_effect + np.random.normal(0, 0.03))
            iso_r = ath["iso_baseline_r"] * (fatigue_effect + np.random.normal(0, 0.03))

            # --- Biochemistry ---
            ck_today = ath["ck_basal"] * (1 + fatigue_state * 0.6 + np.random.exponential(0.3))
            if is_match:
                ck_today *= np.random.uniform(1.5, 3.0)

            # --- Biomechanical ---
            dynamic_knee_valgus = np.clip(np.random.normal(8, 3) + fatigue_state * 1.5, 0, 25)
            postural_sway = np.clip(np.random.normal(12, 4) + fatigue_state * 2, 2, 40)
            force_asymmetry = abs(iso_l - iso_r) / max(iso_l, iso_r) * 100

            # --- Anthropometry ---
            weight_today = ath["weight"] + np.random.normal(0, 0.3)
            bf_today = ath["bf"] + np.random.normal(0, 0.2)

            # --- Injury event ---
            # Broad definition (injury / complaint / reduced training)
            # Target ~18-22% positive rate on exposure days
            injury_prob = 0.06
            # Fatigue state is the primary driver (correlated with all markers)
            injury_prob += 0.10 * fatigue_state
            if fatigue_state > 1.2:
                injury_prob += 0.12
            if fatigue_state > 2.0:
                injury_prob += 0.15
            # Biological stress markers
            ck_r = ck_today / ath["ck_basal"]
            if ck_r > 2.0:
                injury_prob += 0.06
            if ck_r > 3.0:
                injury_prob += 0.10
            # Asymmetry / biomechanics
            if force_asymmetry > 10:
                injury_prob += 0.05
            if dynamic_knee_valgus > 12:
                injury_prob += 0.04
            # Sleep deficit
            if sleep_quality < 6:
                injury_prob += 0.06
            if sleep_hours < 6.5:
                injury_prob += 0.05
            # Pain / recovery
            if pain > 2.5:
                injury_prob += 0.06
            if pain > 4:
                injury_prob += 0.08
            # Autonomic
            if hrv < hrv_baseline * 0.85:
                injury_prob += 0.06
            # Recurrence risk
            if injury_cooldown > 0:
                injury_prob += 0.05
            # Match = higher exposure
            if is_match:
                injury_prob *= 1.4

            injury = 1 if (np.random.random() < injury_prob and injury_cooldown <= 0) else 0

            # days_since_last_injury is recorded BEFORE this day's injury
            # (to avoid leakage: we only know yesterday's status)
            days_since_inj_today = days_since_last_injury

            if injury:
                injury_cooldown = np.random.randint(3, 10)
                days_since_last_injury = 0
            else:
                days_since_last_injury += 1

            if injury_cooldown > 0:
                injury_cooldown -= 1

            # --- Update fatigue state ---
            load_input = (hsr / 400 + sprints / 15 + player_load / 700) / 3
            recovery_input = (sleep_quality / 10 + recovery_general / 10) / 2
            fatigue_state = np.clip(
                fatigue_state * 0.85 + load_input * 0.4 - recovery_input * 0.2 +
                np.random.normal(0, 0.05), 0, 4
            )

            records.append({
                "player_id": pid,
                "date": date.strftime("%Y-%m-%d"),
                "athlete": ath["name"],
                "position": ath["pos"],
                "weight_kg": round(weight_today, 1),
                "bf_pct": round(bf_today, 1),
                "height_cm": ath["height"],
                "muscle_mass_kg": ath["mm"],
                "training_load": round(training_load, 1),
                "match_load": round(match_load, 1),
                "training_type": training_type,
                "minutes_played": minutes_played,
                # GPS
                "hsr_m": round(hsr, 1),
                "sprints": sprints,
                "decels_3ms2": decels,
                "player_load": round(player_load, 1),
                "duration_min": duration,
                # Internal
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
                # HRV
                "hrv": round(hrv, 1),
                "hrv_baseline": round(hrv_baseline, 1),
                # CMJ & Iso
                "cmj_cm": round(cmj_today, 1),
                "cmj_baseline": ath["cmj_baseline"],
                "iso_left_n": round(iso_l, 1),
                "iso_right_n": round(iso_r, 1),
                "iso_baseline_l": ath["iso_baseline_l"],
                "iso_baseline_r": ath["iso_baseline_r"],
                # Biochemistry
                "ck_today": round(ck_today, 1),
                "ck_basal": ath["ck_basal"],
                # Biomechanical
                "dynamic_knee_valgus": round(dynamic_knee_valgus, 1),
                "postural_sway": round(postural_sway, 1),
                "force_asymmetry": round(force_asymmetry, 1),
                # Target
                "injury": injury,
                "days_since_last_injury": days_since_inj_today,
                "is_match": int(is_match),
                "is_rest": int(is_rest),
            })

    return pd.DataFrame(records)


# ==============================================================================
# 1b. TABELA DE EXPOSIÇÃO ACUMULADA (SEMANAL / MENSAL)
# ==============================================================================

def build_exposure_tables(df):
    """Tabelas derivadas de exposição acumulada semanal e mensal."""
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df["week"] = df["date"].dt.isocalendar().week.astype(int)
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year

    agg_cols = {
        "training_load": ["sum", "mean", "std"],
        "match_load": "sum",
        "hsr_m": ["sum", "mean"],
        "sprints": "sum",
        "player_load": ["sum", "mean"],
        "minutes_played": "sum",
        "sleep_hours": "mean",
        "hrv": "mean",
        "ck_today": "mean",
        "cmj_cm": "mean",
        "pain": "mean",
        "injury": "sum",
    }

    weekly = df.groupby(["athlete", "year", "week"]).agg(agg_cols)
    weekly.columns = ["_".join(c).strip("_") for c in weekly.columns]
    weekly = weekly.reset_index()

    monthly = df.groupby(["athlete", "year", "month"]).agg(agg_cols)
    monthly.columns = ["_".join(c).strip("_") for c in monthly.columns]
    monthly = monthly.reset_index()

    return weekly, monthly


# ==============================================================================
# 2. FEATURE ENGINEERING — NÍVEL ELITE
# ==============================================================================

def ewma(series, span):
    return series.ewm(span=span, adjust=False).mean()


def compute_ewma_acwr(group, col, acute_span=7, chronic_span=28):
    acute = ewma(group[col], span=acute_span)
    chronic = ewma(group[col], span=chronic_span)
    acwr = acute / chronic.replace(0, np.nan)
    return acwr.fillna(1.0)


def rolling_slope(series, window, min_periods=None):
    """Linear regression slope over rolling window."""
    if min_periods is None:
        min_periods = max(2, window // 2)
    return series.rolling(window=window, min_periods=min_periods).apply(
        lambda x: np.polyfit(range(len(x)), x, 1)[0], raw=True
    ).fillna(0)


def engineer_features(df):
    """
    Feature Engineering completo — nível elite.
    Inclui: ACWR, EWMA, monotonia, strain, fatigue debt, lag features,
    rolling z-scores, HRV metrics, biomecânica, NME, sleep debt, trends.
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["athlete", "date"]).reset_index(drop=True)

    engineered = []

    for athlete, grp in df.groupby("athlete"):
        g = grp.copy()

        # =============================================================
        # INJURY HISTORY FLAGS
        # =============================================================
        g["injury_last_30d"] = (
            g["injury"].rolling(30, min_periods=1).sum().shift(1).fillna(0)
            .apply(lambda x: 1 if x > 0 else 0)
        )
        g["injury_last_60d"] = (
            g["injury"].rolling(60, min_periods=1).sum().shift(1).fillna(0)
            .apply(lambda x: 1 if x > 0 else 0)
        )
        g["injury_last_180d"] = (
            g["injury"].rolling(180, min_periods=1).sum().shift(1).fillna(0)
            .apply(lambda x: 1 if x > 0 else 0)
        )

        # =============================================================
        # EWMA ACWR — HSR, Sprints, Decels, sRPE
        # =============================================================
        g["acwr_hsr"] = compute_ewma_acwr(g, "hsr_m")
        g["acwr_sprints"] = compute_ewma_acwr(g, "sprints")
        g["acwr_decels"] = compute_ewma_acwr(g, "decels_3ms2")
        g["acwr_srpe"] = compute_ewma_acwr(g, "srpe")
        g["acwr_combined"] = (
            g["acwr_hsr"] * 0.3 + g["acwr_sprints"] * 0.25 +
            g["acwr_decels"] * 0.2 + g["acwr_srpe"] * 0.25
        )

        # =============================================================
        # EWMA LOAD (exponential weighted)
        # =============================================================
        g["ewma_load_7d"] = ewma(g["srpe"], span=7)
        g["ewma_load_28d"] = ewma(g["srpe"], span=28)

        # =============================================================
        # CUMULATIVE LOAD (7d / 28d)
        # =============================================================
        g["cumulative_load_7d"] = g["srpe"].rolling(7, min_periods=1).sum()
        g["cumulative_load_28d"] = g["srpe"].rolling(28, min_periods=1).sum()

        # =============================================================
        # MONOTONY & STRAIN (Foster)
        # =============================================================
        srpe_7d_mean = g["srpe"].rolling(7, min_periods=3).mean()
        srpe_7d_std = g["srpe"].rolling(7, min_periods=3).std()
        g["srpe_7d_sum"] = g["srpe"].rolling(7, min_periods=1).sum()
        g["srpe_7d_mean"] = srpe_7d_mean
        g["training_monotony"] = (srpe_7d_mean / srpe_7d_std.replace(0, np.nan)).fillna(1.0)
        g["training_strain"] = g["srpe_7d_sum"] * g["training_monotony"]

        # =============================================================
        # FATIGUE DEBT — FatigueDebt_t = Σ Load_{t-i} * exp(-λi)
        # =============================================================
        decay_lambda = 0.1
        srpe_vals = g["srpe"].values
        fatigue_debt = np.zeros(len(srpe_vals))
        for t in range(len(srpe_vals)):
            lookback = min(t + 1, 28)
            fatigue_debt[t] = sum(
                srpe_vals[t - i] * np.exp(-decay_lambda * i) for i in range(lookback)
            )
        g["fatigue_debt"] = fatigue_debt

        # =============================================================
        # NEUROMUSCULAR — CMJ delta, ISO asymmetry, NME
        # =============================================================
        g["cmj_delta_pct"] = (g["cmj_cm"] - g["cmj_baseline"]) / g["cmj_baseline"] * 100
        g["iso_asymmetry_pct"] = (
            (g["iso_left_n"] - g["iso_right_n"]).abs() /
            g[["iso_left_n", "iso_right_n"]].max(axis=1) * 100
        )
        g["iso_asymmetry_flag"] = (g["iso_asymmetry_pct"] > 15).astype(int)
        iso_today = (g["iso_left_n"] + g["iso_right_n"]) / 2
        iso_base = (g["iso_baseline_l"] + g["iso_baseline_r"]) / 2
        g["iso_delta_pct"] = (iso_today - iso_base) / iso_base * 100

        # SLCMJ Asymmetry (simulated single-leg CMJ L vs R proxy)
        g["slcmj_asymmetry"] = g["iso_asymmetry_pct"] * 0.8 + np.random.normal(0, 1, len(g))

        # NME = CMJ / sRPE_7d
        srpe_7d_safe = g["srpe_7d_sum"].replace(0, np.nan)
        g["neuromuscular_efficiency"] = g["cmj_cm"] / srpe_7d_safe
        g["neuromuscular_efficiency"] = g["neuromuscular_efficiency"].fillna(
            g["neuromuscular_efficiency"].median()
        )

        # =============================================================
        # BIOLOGICAL — CK ratio, sleep debt, HRV z-score
        # =============================================================
        g["ck_ratio"] = g["ck_today"] / g["ck_basal"]
        g["biological_deficit"] = g["ck_ratio"] * (10 - g["sleep_quality"]) / 10

        # Sleep debt: cumulative deficit below 8h over 7 days
        g["sleep_debt"] = (8.0 - g["sleep_hours"]).clip(lower=0).rolling(7, min_periods=1).sum()
        g["sleep_deficit"] = (g["sleep_hours"] < 7).astype(int)

        # HRV z-score (individual baseline)
        hrv_rolling_mean = g["hrv"].rolling(14, min_periods=3).mean()
        hrv_rolling_std = g["hrv"].rolling(14, min_periods=3).std().replace(0, 1)
        g["hrv_zscore"] = (g["hrv"] - hrv_rolling_mean) / hrv_rolling_std
        g["hrv_zscore"] = g["hrv_zscore"].fillna(0)

        # =============================================================
        # TEMPORAL TRENDS (rolling slopes)
        # =============================================================
        g["cmj_trend_3d"] = rolling_slope(g["cmj_cm"], 3)
        g["cmj_trend_5d"] = rolling_slope(g["cmj_cm"], 5)
        g["sleep_trend_7d"] = rolling_slope(g["sleep_quality"], 7)
        g["srpe_trend_5d"] = rolling_slope(g["srpe"], 5)
        g["hrv_trend_7d"] = rolling_slope(g["hrv"], 7)
        g["ck_growth_48h"] = g["ck_today"].pct_change(periods=2).fillna(0)

        # =============================================================
        # LAG FEATURES (1, 3, 5, 7 days)
        # =============================================================
        for lag in [1, 3, 5, 7]:
            g[f"srpe_lag_{lag}d"] = g["srpe"].shift(lag).fillna(0)
            g[f"cmj_lag_{lag}d"] = g["cmj_cm"].shift(lag).fillna(g["cmj_baseline"])
            g[f"hrv_lag_{lag}d"] = g["hrv"].shift(lag).fillna(g["hrv_baseline"])
            g[f"ck_lag_{lag}d"] = g["ck_today"].shift(lag).fillna(g["ck_basal"])
            g[f"sleep_lag_{lag}d"] = g["sleep_hours"].shift(lag).fillna(7.8)
            g[f"pain_lag_{lag}d"] = g["pain"].shift(lag).fillna(0)

        # =============================================================
        # ROLLING MEANS / STD / Z-SCORES (individual per athlete)
        # =============================================================
        for col_name, col in [("srpe", "srpe"), ("cmj", "cmj_cm"),
                               ("hrv", "hrv"), ("ck", "ck_today")]:
            for w in [7, 14]:
                g[f"{col_name}_rmean_{w}d"] = g[col].rolling(w, min_periods=2).mean().fillna(0)
                g[f"{col_name}_rstd_{w}d"] = g[col].rolling(w, min_periods=2).std().fillna(0)
                rmean = g[f"{col_name}_rmean_{w}d"]
                rstd = g[f"{col_name}_rstd_{w}d"].replace(0, 1)
                g[f"{col_name}_rzscore_{w}d"] = ((g[col] - rmean) / rstd).fillna(0)

        # =============================================================
        # ADDITIONAL DERIVED FEATURES
        # =============================================================
        g["pl_3d_sum"] = g["player_load"].rolling(3, min_periods=1).sum()
        g["weight_delta"] = g["weight_kg"] - g["weight_kg"].rolling(14, min_periods=3).mean()
        g["wellness_composite"] = (
            g["sleep_quality"] + g["recovery_general"] + g["recovery_legs"] +
            (10 - g["pain"]) + g["mood"] * 2 + g["energy"] * 2.5
        ) / 6
        g["pain_3d_trend"] = g["pain"].rolling(3, min_periods=1).mean()

        # Interactions
        g["acwr_x_sleep_deficit"] = g["acwr_combined"] * (10 - g["sleep_quality"])
        g["ck_x_asymmetry"] = g["ck_ratio"] * g["iso_asymmetry_pct"]
        g["hrv_x_load"] = g["hrv_zscore"] * g["acwr_combined"]
        g["fatigue_x_asymmetry"] = g["fatigue_debt"] * g["force_asymmetry"] / 100

        engineered.append(g)

    result = pd.concat(engineered, ignore_index=True)
    pos_map = {"GOL": 0, "ZAG": 1, "LAT": 2, "LE": 2, "MC": 3, "ATA": 4}
    result["pos_encoded"] = result["position"].map(pos_map).fillna(3)
    return result


# ==============================================================================
# 3. FEATURE COLUMNS
# ==============================================================================

FEATURE_COLS = [
    # History
    "injury_last_30d", "injury_last_60d", "injury_last_180d",
    # ACWR
    "acwr_hsr", "acwr_sprints", "acwr_decels", "acwr_srpe", "acwr_combined",
    # EWMA / Cumulative
    "ewma_load_7d", "ewma_load_28d", "cumulative_load_7d", "cumulative_load_28d",
    # Monotony / Strain
    "srpe_7d_sum", "srpe_7d_mean", "training_monotony", "training_strain",
    # Fatigue Debt
    "fatigue_debt",
    # Neuromuscular
    "cmj_delta_pct", "iso_asymmetry_pct", "iso_asymmetry_flag", "iso_delta_pct",
    "slcmj_asymmetry", "neuromuscular_efficiency",
    # Biological
    "ck_ratio", "biological_deficit", "sleep_debt", "hrv_zscore",
    # Biomechanical
    "dynamic_knee_valgus", "postural_sway", "force_asymmetry",
    # GPS
    "hsr_m", "sprints", "decels_3ms2", "player_load", "pl_3d_sum",
    # Wellness
    "sleep_quality", "sleep_hours", "pain", "recovery_general",
    "recovery_legs", "mood", "energy", "wellness_composite",
    "pain_3d_trend", "sleep_deficit",
    # Anthropometry
    "weight_kg", "bf_pct", "weight_delta",
    # Interactions
    "acwr_x_sleep_deficit", "ck_x_asymmetry", "hrv_x_load", "fatigue_x_asymmetry",
    # Temporal context
    "days_since_last_injury", "is_match",
    # Trends
    "cmj_trend_3d", "cmj_trend_5d", "ck_growth_48h",
    "sleep_trend_7d", "srpe_trend_5d", "hrv_trend_7d",
    # HRV direct
    "hrv",
    # Position
    "pos_encoded",
    # Lag features
    "srpe_lag_1d", "srpe_lag_3d", "srpe_lag_5d", "srpe_lag_7d",
    "cmj_lag_1d", "cmj_lag_3d", "cmj_lag_5d", "cmj_lag_7d",
    "hrv_lag_1d", "hrv_lag_3d", "hrv_lag_5d", "hrv_lag_7d",
    "ck_lag_1d", "ck_lag_3d", "ck_lag_5d", "ck_lag_7d",
    "sleep_lag_1d", "sleep_lag_3d", "sleep_lag_5d", "sleep_lag_7d",
    "pain_lag_1d", "pain_lag_3d", "pain_lag_5d", "pain_lag_7d",
    # Rolling z-scores
    "srpe_rmean_7d", "srpe_rstd_7d", "srpe_rzscore_7d",
    "srpe_rmean_14d", "srpe_rstd_14d", "srpe_rzscore_14d",
    "cmj_rmean_7d", "cmj_rstd_7d", "cmj_rzscore_7d",
    "cmj_rmean_14d", "cmj_rstd_14d", "cmj_rzscore_14d",
    "hrv_rmean_7d", "hrv_rstd_7d", "hrv_rzscore_7d",
    "hrv_rmean_14d", "hrv_rstd_14d", "hrv_rzscore_14d",
    "ck_rmean_7d", "ck_rstd_7d", "ck_rzscore_7d",
    "ck_rmean_14d", "ck_rstd_14d", "ck_rzscore_14d",
]


# ==============================================================================
# 4. LASSO FEATURE SELECTION
# ==============================================================================

def lasso_feature_selection(X, y, feature_names):
    """Use LASSO (L1) to select informative features."""
    print(f"\n{'='*60}")
    print("LASSO FEATURE SELECTION")
    print(f"{'='*60}")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    lasso = LassoCV(cv=5, random_state=42, max_iter=10000)
    lasso.fit(X_scaled, y)

    coefs = pd.Series(lasso.coef_, index=feature_names)
    selected = coefs[coefs.abs() > 1e-5].index.tolist()

    print(f"  Alpha ótimo: {lasso.alpha_:.4f}")
    print(f"  Features selecionadas: {len(selected)} / {len(feature_names)}")
    print(f"  Top features (|coef|):")
    for feat, coef in coefs.abs().sort_values(ascending=False).head(10).items():
        if coef > 1e-4:
            print(f"    {feat:<35} {coef:.4f}")

    return selected


# ==============================================================================
# 5. OPTUNA HYPERPARAMETER OPTIMIZATION
# ==============================================================================

def optimize_hyperparameters(X, y, n_trials=50):
    """Bayesian HPO with Optuna for XGBoost."""
    print(f"\n{'='*60}")
    print(f"OPTUNA HYPERPARAMETER OPTIMIZATION ({n_trials} trials)")
    print(f"{'='*60}")

    scale_pos_weight = (y == 0).sum() / max((y == 1).sum(), 1)

    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 150, 500),
            "max_depth": trial.suggest_int("max_depth", 3, 8),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 0.95),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 0.95),
            "min_child_weight": trial.suggest_int("min_child_weight", 3, 10),
            "gamma": trial.suggest_float("gamma", 0.01, 0.5),
            "reg_alpha": trial.suggest_float("reg_alpha", 0.01, 1.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 0.5, 3.0),
        }

        pipeline = ImbPipeline([
            ("scaler", StandardScaler()),
            ("smote", SMOTETomek(
                smote=SMOTE(sampling_strategy=0.3, random_state=42, k_neighbors=5),
                random_state=42
            )),
            ("xgb", XGBClassifier(
                **params,
                scale_pos_weight=scale_pos_weight,
                eval_metric="aucpr",
                random_state=42,
                use_label_encoder=False,
                n_jobs=-1,
            ))
        ])

        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        y_proba = cross_val_predict(pipeline, X, y, cv=cv, method="predict_proba")[:, 1]
        return roc_auc_score(y, y_proba)

    study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=42))
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)

    print(f"\n  Melhor AUC-ROC: {study.best_value:.4f}")
    print(f"  Melhores parâmetros:")
    for k, v in study.best_params.items():
        print(f"    {k}: {v}")

    return study.best_params


# ==============================================================================
# 6. TRAIN MODEL (FULL PIPELINE)
# ==============================================================================

def train_model(df, use_optuna=True, optuna_trials=50):
    """
    Pipeline completo: KNNImputer → Scaler → SMOTE+Tomek → LASSO → XGBoost
    → Calibração → Threshold tuning → SHAP
    """
    # Filter: remove rest days + warm-up period
    df_train = df[df["is_rest"] == 0].copy()
    df_train = df_train.groupby("athlete").apply(
        lambda x: x.iloc[28:]
    ).reset_index(drop=True)

    X_raw = df_train[FEATURE_COLS].copy()
    y = df_train["injury"]

    print(f"\n{'='*60}")
    print(f"DISTRIBUIÇÃO DE CLASSES")
    print(f"{'='*60}")
    n_neg, n_pos = (y == 0).sum(), (y == 1).sum()
    print(f"  Sem lesão (0): {n_neg} ({n_neg / len(y) * 100:.1f}%)")
    print(f"  Com lesão (1): {n_pos} ({n_pos / len(y) * 100:.1f}%)")
    print(f"  Ratio: 1:{n_neg // max(n_pos, 1)}")
    print(f"  scale_pos_weight: {n_neg / max(n_pos, 1):.2f}")

    # --- KNN Imputation ---
    print(f"\n--- KNN Imputation ---")
    imputer = KNNImputer(n_neighbors=5, weights="distance")
    X_imputed = pd.DataFrame(imputer.fit_transform(X_raw), columns=FEATURE_COLS, index=X_raw.index)
    missing_before = X_raw.isna().sum().sum()
    print(f"  Valores imputados: {missing_before}")

    # --- LASSO Feature Selection ---
    selected_features = lasso_feature_selection(X_imputed, y, FEATURE_COLS)
    # Ensure minimum feature set: LASSO selected + top correlated features
    if len(selected_features) < 20:
        # Add features with highest univariate correlation to target
        from sklearn.feature_selection import mutual_info_classif
        mi = pd.Series(
            mutual_info_classif(X_imputed, y, random_state=42),
            index=FEATURE_COLS
        ).sort_values(ascending=False)
        top_mi = mi.head(30).index.tolist()
        selected_features = list(set(selected_features + top_mi))
        print(f"  LASSO + MI: {len(selected_features)} features selecionadas")
    X = X_imputed[selected_features]

    # --- Optuna HPO ---
    if use_optuna:
        best_params = optimize_hyperparameters(X, y, n_trials=optuna_trials)
    else:
        best_params = {
            "n_estimators": 300, "max_depth": 6, "learning_rate": 0.05,
            "subsample": 0.8, "colsample_bytree": 0.8, "min_child_weight": 5,
            "gamma": 0.1, "reg_alpha": 0.1, "reg_lambda": 1.0,
        }

    scale_pos_weight = n_neg / max(n_pos, 1)

    # --- Pipeline: SMOTE+Tomek → XGBoost ---
    model = ImbPipeline([
        ("scaler", StandardScaler()),
        ("smotetomek", SMOTETomek(
            smote=SMOTE(sampling_strategy=0.3, random_state=42, k_neighbors=5),
            random_state=42
        )),
        ("xgb", XGBClassifier(
            **best_params,
            scale_pos_weight=scale_pos_weight,
            eval_metric="aucpr",
            random_state=42,
            use_label_encoder=False,
            n_jobs=-1,
        ))
    ])

    # --- Stratified K-Fold CV ---
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print(f"\n{'='*60}")
    print(f"TREINANDO: KNN → SMOTE+Tomek → XGBoost (5-Fold Stratified CV)")
    print(f"{'='*60}")

    y_pred_proba = cross_val_predict(model, X, y, cv=cv, method="predict_proba")[:, 1]

    # --- Threshold Tuning (0.20 to 0.50) ---
    print(f"\n--- Threshold Tuning (0.20 - 0.50) ---")
    best_threshold = 0.30
    best_score = 0
    for t in np.arange(0.20, 0.52, 0.02):
        y_t = (y_pred_proba > t).astype(int)
        rec = recall_score(y, y_t, zero_division=0)
        prec = precision_score(y, y_t, zero_division=0)
        f1 = f1_score(y, y_t, zero_division=0)
        # Objective: maximize recall while keeping precision > 0.35
        score = rec * 0.7 + f1 * 0.3 if prec > 0.25 else rec * 0.3
        if score > best_score:
            best_score = score
            best_threshold = round(t, 2)

    y_pred = (y_pred_proba > best_threshold).astype(int)

    # --- Full metrics ---
    print(f"\n  → Threshold ótimo: {best_threshold:.2f}")
    print(f"\n--- Classification Report (threshold={best_threshold:.2f}) ---")
    print(classification_report(y, y_pred, target_names=["Apto", "Lesão"]))

    auc_roc = roc_auc_score(y, y_pred_proba)
    auc_pr = average_precision_score(y, y_pred_proba)
    mcc = matthews_corrcoef(y, y_pred)
    cm = confusion_matrix(y, y_pred)
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
    recall = recall_score(y, y_pred, zero_division=0)
    prec = precision_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)

    print(f"\n{'='*60}")
    print(f"MÉTRICAS COMPLETAS")
    print(f"{'='*60}")
    print(f"  AUC-ROC:     {auc_roc:.3f}")
    print(f"  AUC-PR:      {auc_pr:.3f}")
    print(f"  Recall:      {recall:.3f}")
    print(f"  Precision:   {prec:.3f}")
    print(f"  F1-score:    {f1:.3f}")
    print(f"  Specificity: {specificity:.3f}")
    print(f"  MCC:         {mcc:.3f}")

    metrics = {
        "auc_roc": round(auc_roc, 3),
        "auc_pr": round(auc_pr, 3),
        "recall": round(recall, 3),
        "precision": round(prec, 3),
        "f1": round(f1, 3),
        "specificity": round(specificity, 3),
        "mcc": round(mcc, 3),
        "threshold": best_threshold,
    }

    # --- Train final model on all data ---
    model.fit(X, y)

    # --- Probability Calibration (Platt + Isotonic) ---
    print(f"\n--- Calibração de Probabilidade ---")
    calibrated_platt = CalibratedClassifierCV(model, method="sigmoid", cv=cv)
    calibrated_platt.fit(X, y)
    y_platt = calibrated_platt.predict_proba(X)[:, 1]
    auc_platt = roc_auc_score(y, y_platt)

    calibrated_isotonic = CalibratedClassifierCV(model, method="isotonic", cv=cv)
    calibrated_isotonic.fit(X, y)
    y_isotonic = calibrated_isotonic.predict_proba(X)[:, 1]
    auc_isotonic = roc_auc_score(y, y_isotonic)

    print(f"  Platt scaling AUC:     {auc_platt:.3f}")
    print(f"  Isotonic AUC:          {auc_isotonic:.3f}")

    # Pick best calibration
    if auc_isotonic >= auc_platt:
        calibrated_model = calibrated_isotonic
        calibration_method = "isotonic"
        print(f"  → Usando: Isotonic regression")
    else:
        calibrated_model = calibrated_platt
        calibration_method = "platt"
        print(f"  → Usando: Platt scaling")

    metrics["calibration_method"] = calibration_method
    metrics["auc_calibrated"] = round(max(auc_platt, auc_isotonic), 3)

    # --- Feature Importance ---
    xgb_model = model.named_steps["xgb"]
    importances = pd.Series(
        xgb_model.feature_importances_, index=selected_features
    ).sort_values(ascending=False)

    print(f"\n{'='*60}")
    print(f"FEATURE IMPORTANCE (Top 20)")
    print(f"{'='*60}")
    for feat, imp in importances.head(20).items():
        bar = "█" * int(imp * 100)
        print(f"  {feat:<35} {imp:.4f} {bar}")

    # --- SHAP Explainability ---
    print(f"\n{'='*60}")
    print(f"SHAP EXPLAINABILITY")
    print(f"{'='*60}")

    X_scaled = model.named_steps["scaler"].transform(X)
    explainer = shap.TreeExplainer(xgb_model)
    shap_values = explainer.shap_values(X_scaled)

    # Global SHAP importance
    shap_importance = pd.Series(
        np.abs(shap_values).mean(axis=0), index=selected_features
    ).sort_values(ascending=False)

    print(f"\n  SHAP Global Importance (Top 15):")
    for feat, val in shap_importance.head(15).items():
        bar = "█" * int(val * 50)
        print(f"    {feat:<35} {val:.4f} {bar}")

    return (calibrated_model, model, importances, shap_importance, shap_values,
            X, y, y_pred_proba, selected_features, metrics, best_threshold)


# ==============================================================================
# 7. RISK CLUSTERS
# ==============================================================================

def identify_risk_clusters(df, importances):
    print(f"\n{'='*60}")
    print(f"CLUSTERS DE RISCO IDENTIFICADOS")
    print(f"{'='*60}")

    clusters = []

    definitions = [
        ("ACWR Alto + Assimetria Bilateral",
         "ACWR combinado > 1.4 + Assimetria ISO > 12%",
         (df["acwr_combined"] > 1.4) & (df["iso_asymmetry_pct"] > 12),
         "Reduzir volume HSR 30%. Protocolo de simetria pré-treino."),
        ("Estresse Biológico Composto",
         "CK/Basal > 2.5 + Sono < 6 + Dor > 3",
         (df["ck_ratio"] > 2.5) & (df["sleep_quality"] < 6) & (df["pain"] > 3),
         "Sessão regenerativa. Crioterapia. Remonitorar CK 48h."),
        ("Sobrecarga + Fadiga Neuromuscular",
         "sRPE 7d > 3000 + CMJ Delta < -8%",
         (df["srpe_7d_sum"] > 3000) & (df["cmj_delta_pct"] < -8),
         "MED (Minimum Effective Dose). Apenas treino técnico-tático."),
        ("Monotonia + Histórico Recente",
         "Monotonia > 2.0 + Lesão nos últimos 30 dias",
         (df["training_monotony"] > 2.0) & (df["injury_last_30d"] == 1),
         "Variar estímulos. Reduzir frequência semanal. Fisioterapia preventiva."),
        ("Déficit Biológico + Carga HSR",
         "Déficit Bio > 1.5 + ACWR HSR > 1.3",
         (df["biological_deficit"] > 1.5) & (df["acwr_hsr"] > 1.3),
         "Protocolo de recuperação ativa. Suplementação. Sono prioritário."),
        ("HRV Deprimido + Carga Alta",
         "HRV z-score < -1.5 + Carga cumulativa 7d > P75",
         (df["hrv_zscore"] < -1.5) & (df["cumulative_load_7d"] > df["cumulative_load_7d"].quantile(0.75)),
         "Reduzir intensidade 40%. Monitorar HRV diariamente."),
    ]

    for name, rule, mask, action in definitions:
        inj_rate = df.loc[mask, "injury"].mean() * 100 if mask.sum() > 0 else 0
        clusters.append({
            "name": name, "rule": rule,
            "n_episodes": int(mask.sum()),
            "injury_rate": round(inj_rate, 1),
            "action": action,
        })
        print(f"\n  {name}")
        print(f"    Regra: {rule}")
        print(f"    Episódios: {mask.sum()} | Taxa de lesão: {inj_rate:.1f}%")

    return clusters


# ==============================================================================
# 8. GENERATE ALERTS
# ==============================================================================

def generate_tomorrow_alerts(df, model, feature_cols, threshold):
    latest = df.groupby("athlete").last().reset_index()
    X_raw = latest[feature_cols].fillna(0)

    probs = model.predict_proba(X_raw)[:, 1]
    latest["risk_probability"] = probs
    latest["risk_zone"] = pd.cut(
        probs, bins=[-0.01, 0.15, 0.30, 0.50, 1.01],
        labels=["VERDE", "AMARELO", "LARANJA", "VERMELHO"]
    )

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
    alerts = latest.sort_values("risk_probability", ascending=False)

    print(f"\n{'='*60}")
    print(f"ALERTA — PRONTIDÃO PARA PRÓXIMA SESSÃO")
    print(f"{'='*60}")
    print(f"{'Atleta':<22} {'Pos':<5} {'Prob%':<8} {'Zona':<10} {'Dosagem'}")
    print("-" * 100)
    for _, row in alerts.iterrows():
        icons = {"VERMELHO": "🔴", "LARANJA": "🟠", "AMARELO": "🟡", "VERDE": "🟢"}
        icon = icons.get(row["risk_zone"], "⚪")
        print(f"  {icon} {row['athlete']:<20} {row['position']:<5} "
              f"{row['risk_probability']*100:>5.1f}%  {row['risk_zone']:<10} "
              f"{row['dosage']}")

    return alerts, X_raw


# ==============================================================================
# 9. SHAP PER-ATHLETE EXPLANATIONS
# ==============================================================================

def compute_shap_per_athlete(alerts, X_imputed, model_pipeline, feature_cols):
    """Generate SHAP explanations for each athlete's current risk."""
    xgb_model = model_pipeline.named_steps["xgb"]
    scaler = model_pipeline.named_steps["scaler"]
    X_scaled = scaler.transform(X_imputed)

    explainer = shap.TreeExplainer(xgb_model)
    shap_values = explainer.shap_values(X_scaled)

    athlete_shap = {}
    for i, (_, row) in enumerate(alerts.iterrows()):
        athlete_name = row["athlete"]
        sv = shap_values[i]
        top_idx = np.argsort(np.abs(sv))[::-1][:8]
        factors = []
        for idx in top_idx:
            feat = feature_cols[idx]
            val = float(X_imputed.iloc[i, idx])
            contribution = float(sv[idx])
            factors.append({
                "feature": feat,
                "value": round(val, 3),
                "shap_value": round(contribution, 4),
                "direction": "risk" if contribution > 0 else "protective",
            })
        athlete_shap[athlete_name] = factors

    return athlete_shap


# ==============================================================================
# 10. SURVIVAL ANALYSIS
# ==============================================================================

def survival_analysis(df):
    if not HAS_LIFELINES:
        print("\n[SKIP] lifelines não instalado.")
        return None

    print(f"\n{'='*60}")
    print(f"ANÁLISE DE SOBREVIVÊNCIA — Cox PH")
    print(f"{'='*60}")

    survival_data = []
    for athlete, grp in df.groupby("athlete"):
        g = grp.sort_values("date").reset_index(drop=True)
        last_event = 0
        for i, row in g.iterrows():
            time_since = i - last_event
            if row["injury"] == 1:
                survival_data.append({
                    "duration": max(time_since, 1), "event": 1,
                    "acwr_combined": row["acwr_combined"],
                    "ck_ratio": row["ck_ratio"],
                    "hrv_zscore": row["hrv_zscore"],
                    "cmj_delta_pct": row["cmj_delta_pct"],
                    "sleep_debt": row["sleep_debt"],
                    "fatigue_debt": row["fatigue_debt"],
                })
                last_event = i
        survival_data.append({
            "duration": max(len(g) - last_event, 1), "event": 0,
            "acwr_combined": g.iloc[-1]["acwr_combined"],
            "ck_ratio": g.iloc[-1]["ck_ratio"],
            "hrv_zscore": g.iloc[-1]["hrv_zscore"],
            "cmj_delta_pct": g.iloc[-1]["cmj_delta_pct"],
            "sleep_debt": g.iloc[-1]["sleep_debt"],
            "fatigue_debt": g.iloc[-1]["fatigue_debt"],
        })

    surv_df = pd.DataFrame(survival_data)
    cph = CoxPHFitter(penalizer=0.1)
    cph.fit(surv_df, duration_col="duration", event_col="event")
    cph.print_summary()
    return cph


# ==============================================================================
# 11. EXPORT TO DASHBOARD
# ==============================================================================

def export_to_dashboard(alerts, importances, shap_importance, clusters,
                         metrics, athlete_shap, df_feat, selected_features):
    """Enhanced JSON export with all elite-level data for the dashboard."""

    # Build per-athlete time series (last 8 days)
    athlete_timeseries = {}
    for athlete in alerts["athlete"].values:
        ath_data = df_feat[df_feat["athlete"] == athlete].tail(8)
        athlete_timeseries[athlete] = {
            "dates": ath_data["date"].dt.strftime("%Y-%m-%d").tolist(),
            "cmj": ath_data["cmj_cm"].round(1).tolist(),
            "ck": ath_data["ck_today"].round(0).tolist(),
            "srpe": ath_data["srpe"].round(0).tolist(),
            "hrv": ath_data["hrv"].round(1).tolist(),
            "sleep_hours": ath_data["sleep_hours"].round(1).tolist(),
            "sleep_quality": ath_data["sleep_quality"].round(1).tolist(),
            "fatigue_debt": ath_data["fatigue_debt"].round(0).tolist(),
            "acwr_combined": ath_data["acwr_combined"].round(2).tolist(),
            "pain": ath_data["pain"].round(1).tolist(),
            "wellness_composite": ath_data["wellness_composite"].round(1).tolist(),
            "neuromuscular_efficiency": ath_data["neuromuscular_efficiency"].round(4).tolist(),
            "cumulative_load_7d": ath_data["cumulative_load_7d"].round(0).tolist(),
            "hrv_zscore": ath_data["hrv_zscore"].round(2).tolist(),
            "cmj_delta_pct": ath_data["cmj_delta_pct"].round(1).tolist(),
            "dynamic_knee_valgus": ath_data["dynamic_knee_valgus"].round(1).tolist(),
            "postural_sway": ath_data["postural_sway"].round(1).tolist(),
        }

    output = {
        "generated_at": datetime.now().isoformat(),
        "model": "KNNImputer → SMOTE+Tomek → LASSO → XGBoost (Optuna) → Calibração → SHAP",
        "pipeline_version": "4.0-elite",
        "metrics": metrics,
        "selected_features": selected_features,
        "feature_importance": [
            {"feature": feat, "importance": round(float(imp), 4)}
            for feat, imp in importances.head(25).items()
        ],
        "shap_importance": [
            {"feature": feat, "importance": round(float(imp), 4)}
            for feat, imp in shap_importance.head(25).items()
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
                "acwr_hsr": round(float(row["acwr_hsr"]), 2),
                "acwr_srpe": round(float(row["acwr_srpe"]), 2),
                "ck_ratio": round(float(row["ck_ratio"]), 2),
                "cmj_delta_pct": round(float(row["cmj_delta_pct"]), 1),
                "sleep_quality": round(float(row["sleep_quality"]), 1),
                "sleep_hours": round(float(row["sleep_hours"]), 1),
                "sleep_debt": round(float(row["sleep_debt"]), 1),
                "hrv": round(float(row["hrv"]), 1),
                "hrv_zscore": round(float(row["hrv_zscore"]), 2),
                "biological_deficit": round(float(row["biological_deficit"]), 2),
                "wellness_composite": round(float(row["wellness_composite"]), 1),
                "fatigue_debt": round(float(row["fatigue_debt"]), 1),
                "neuromuscular_efficiency": round(float(row["neuromuscular_efficiency"]), 4),
                "training_monotony": round(float(row["training_monotony"]), 2),
                "training_strain": round(float(row["training_strain"]), 0),
                "cumulative_load_7d": round(float(row["cumulative_load_7d"]), 0),
                "cumulative_load_28d": round(float(row["cumulative_load_28d"]), 0),
                "cmj_trend_3d": round(float(row["cmj_trend_3d"]), 3),
                "cmj_trend_5d": round(float(row["cmj_trend_5d"]), 3),
                "srpe_trend_5d": round(float(row["srpe_trend_5d"]), 1),
                "sleep_trend_7d": round(float(row["sleep_trend_7d"]), 3),
                "hrv_trend_7d": round(float(row["hrv_trend_7d"]), 3),
                "dynamic_knee_valgus": round(float(row["dynamic_knee_valgus"]), 1),
                "postural_sway": round(float(row["postural_sway"]), 1),
                "force_asymmetry": round(float(row["force_asymmetry"]), 1),
                "iso_asymmetry_pct": round(float(row["iso_asymmetry_pct"]), 1),
                "slcmj_asymmetry": round(float(row["slcmj_asymmetry"]), 1),
                "days_since_last_injury": int(row["days_since_last_injury"]),
                "shap_factors": athlete_shap.get(row["athlete"], []),
            }
            for _, row in alerts.iterrows()
        ],
        "athlete_timeseries": athlete_timeseries,
    }

    output_path = Path(__file__).parent / "risk_output.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Dados exportados para: {output_path}")
    return output


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("  MOTOR PREDITIVO DE LESÕES — NÍVEL ELITE")
    print("  Botafogo-SP FSA · Saúde e Performance · 2026")
    print("  Pipeline: KNN → LASSO → XGBoost (Optuna) → SHAP")
    print("=" * 60)

    # 1. Generate data
    print("\n[1/8] Gerando dados longitudinais (34 atletas x 120 dias)...")
    df_raw = generate_longitudinal_data()
    print(f"  → {len(df_raw)} registros | {df_raw['injury'].sum()} eventos de lesão")

    # 2. Exposure tables
    print("\n[2/8] Construindo tabelas de exposição acumulada...")
    weekly_exp, monthly_exp = build_exposure_tables(df_raw)
    print(f"  → Semanal: {len(weekly_exp)} registros | Mensal: {len(monthly_exp)} registros")

    # 3. Feature Engineering
    print("\n[3/8] Feature Engineering (nível elite)...")
    df_feat = engineer_features(df_raw)
    print(f"  → {len(FEATURE_COLS)} features engenheiradas")

    # 4. Train model (full pipeline with Optuna)
    print("\n[4/8] Pipeline completo: KNN → LASSO → Optuna → XGBoost → Calibração...")
    (calibrated_model, raw_model, importances, shap_importance, shap_values,
     X, y, y_proba, selected_features, metrics, threshold) = train_model(
        df_feat, use_optuna=True, optuna_trials=50
    )

    # 5. Risk clusters
    print("\n[5/8] Identificando clusters de risco...")
    df_analysis = df_feat[df_feat["is_rest"] == 0].copy()
    clusters = identify_risk_clusters(df_analysis, importances)

    # 6. Survival analysis
    print("\n[6/8] Análise de sobrevivência...")
    survival_analysis(df_feat)

    # 7. Alerts + SHAP per athlete
    print("\n[7/8] Gerando alertas e explicações SHAP por atleta...")
    alerts, X_alerts = generate_tomorrow_alerts(
        df_feat, calibrated_model, selected_features, threshold
    )
    athlete_shap = compute_shap_per_athlete(
        alerts, X_alerts, raw_model, selected_features
    )

    # 8. Export
    print("\n[8/8] Exportando para dashboard...")
    export_to_dashboard(
        alerts, importances, shap_importance, clusters,
        metrics, athlete_shap, df_feat, selected_features
    )

    print(f"\n{'='*60}")
    print(f"  PIPELINE ELITE CONCLUÍDO COM SUCESSO")
    print(f"  AUC-ROC: {metrics['auc_roc']:.3f} | Recall: {metrics['recall']:.3f}")
    print(f"  MCC: {metrics['mcc']:.3f} | Threshold: {metrics['threshold']:.2f}")
    print(f"{'='*60}")
