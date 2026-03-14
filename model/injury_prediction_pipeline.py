"""
================================================================================
MOTOR PREDITIVO DE LESÕES NÃO-TRAUMÁTICAS — NÍVEL ELITE
Botafogo-SP FSA — Núcleo de Saúde e Performance
================================================================================
"""

import numpy as np
import pandas as pd
import json
import warnings
from datetime import datetime, timedelta
from pathlib import Path

# ML
from sklearn.model_selection import StratifiedKFold, cross_val_predict, RandomizedSearchCV
from sklearn.metrics import (
    classification_report, roc_auc_score, precision_recall_curve,
    average_precision_score, confusion_matrix, f1_score, recall_score,
    precision_score, matthews_corrcoef
)
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LassoCV
from sklearn.feature_selection import SelectFromModel

# Imbalanced Learning
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTETomek
from imblearn.pipeline import Pipeline as ImbPipeline

# Tree-based model
from xgboost import XGBClassifier

# SHAP
try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

# Optuna for hyperparameter optimization
try:
    import optuna
    optuna.logging.set_verbosity(optuna.logging.WARNING)
    HAS_OPTUNA = True
except ImportError:
    HAS_OPTUNA = False

# Survival Analysis (optional)
try:
    from lifelines import CoxPHFitter
    HAS_LIFELINES = True
except ImportError:
    HAS_LIFELINES = False

warnings.filterwarnings("ignore")
np.random.seed(42)


# ==============================================================================
# 1. DADOS DE ATLETAS — ALTURAS CONFORME PLANILHA OFICIAL (Fisiologia 2026)
# ==============================================================================

ATHLETES = [
    {"name": "ADRIANO", "pos": "GOL", "weight": 82.7, "height": 183, "bf": 12.4, "mm": 38.2,
     "cmj_baseline": 51.5, "iso_baseline_l": 280, "iso_baseline_r": 290, "ck_basal": 180},
    {"name": "BRENNO", "pos": "GOL", "weight": 90.8, "height": 191, "bf": 13.8, "mm": 41.5,
     "cmj_baseline": 46.2, "iso_baseline_l": 310, "iso_baseline_r": 305, "ck_basal": 160},
    {"name": "CARLOS EDUARDO", "pos": "ZAG", "weight": 85.9, "height": 186, "bf": 11.9, "mm": 39.8,
     "cmj_baseline": 47.5, "iso_baseline_l": 295, "iso_baseline_r": 300, "ck_basal": 190},
    {"name": "DARLAN", "pos": "ZAG", "weight": 80.2, "height": 186, "bf": 10.5, "mm": 37.1,
     "cmj_baseline": 33.0, "iso_baseline_l": 260, "iso_baseline_r": 265, "ck_basal": 170},
    {"name": "ERICSON", "pos": "ZAG", "weight": 91.6, "height": 184, "bf": 13.2, "mm": 42.0,
     "cmj_baseline": 47.0, "iso_baseline_l": 320, "iso_baseline_r": 310, "ck_basal": 200},
    {"name": "ERIK", "pos": "LAT", "weight": 75.5, "height": 176, "bf": 9.8, "mm": 35.4,
     "cmj_baseline": 53.0, "iso_baseline_l": 240, "iso_baseline_r": 245, "ck_basal": 150},
    {"name": "FELIPINHO", "pos": "MEI", "weight": 78.0, "height": 179, "bf": 11.2, "mm": 36.0,
     "cmj_baseline": 42.0, "iso_baseline_l": 250, "iso_baseline_r": 255, "ck_basal": 165},
    {"name": "FELIPE VIEIRA", "pos": "LAT", "weight": 77.0, "height": 176, "bf": 7.7, "mm": 35.8,
     "cmj_baseline": 45.0, "iso_baseline_l": 260, "iso_baseline_r": 265, "ck_basal": 174},
    {"name": "GABRIEL INOCENCIO", "pos": "LAT", "weight": 78.5, "height": 177, "bf": 10.8, "mm": 36.5,
     "cmj_baseline": 49.5, "iso_baseline_l": 270, "iso_baseline_r": 275, "ck_basal": 175},
    {"name": "GUI MARIANO", "pos": "ZAG", "weight": 89.7, "height": 191, "bf": 12.7, "mm": 41.0,
     "cmj_baseline": 53.0, "iso_baseline_l": 305, "iso_baseline_r": 310, "ck_basal": 185},
    {"name": "GUILHERME QUEIROZ", "pos": "ATA", "weight": 87.9, "height": 180, "bf": 13.1, "mm": 40.2,
     "cmj_baseline": 45.5, "iso_baseline_l": 290, "iso_baseline_r": 285, "ck_basal": 195},
    {"name": "GUSTAVO VILAR", "pos": "ZAG", "weight": 86.4, "height": 189, "bf": 12.9, "mm": 39.5,
     "cmj_baseline": 44.5, "iso_baseline_l": 275, "iso_baseline_r": 280, "ck_basal": 185},
    {"name": "HEBERT", "pos": "ZAG", "weight": 88.1, "height": 187, "bf": 12.5, "mm": 40.8,
     "cmj_baseline": 50.5, "iso_baseline_l": 300, "iso_baseline_r": 295, "ck_basal": 190},
    {"name": "HENRIQUE TELES", "pos": "LAT", "weight": 80.1, "height": 179, "bf": 11.3, "mm": 37.2,
     "cmj_baseline": 52.0, "iso_baseline_l": 260, "iso_baseline_r": 270, "ck_basal": 170},
    {"name": "HYGOR", "pos": "ATA", "weight": 83.3, "height": 183, "bf": 11.6, "mm": 38.6,
     "cmj_baseline": 42.8, "iso_baseline_l": 280, "iso_baseline_r": 285, "ck_basal": 180},
    {"name": "JEFFERSON NEM", "pos": "ATA", "weight": 72.5, "height": 166, "bf": 10.1, "mm": 33.8,
     "cmj_baseline": 48.0, "iso_baseline_l": 235, "iso_baseline_r": 240, "ck_basal": 155},
    {"name": "JONATHAN", "pos": "LAT", "weight": 73.7, "height": 177, "bf": 10.9, "mm": 34.3,
     "cmj_baseline": 45.0, "iso_baseline_l": 245, "iso_baseline_r": 240, "ck_basal": 160},
    {"name": "JORDAN", "pos": "GOL", "weight": 92.2, "height": 189, "bf": 12.0, "mm": 42.8,
     "cmj_baseline": 54.5, "iso_baseline_l": 330, "iso_baseline_r": 325, "ck_basal": 200},
    {"name": "KELVIN", "pos": "ATA", "weight": 74.6, "height": 170, "bf": 10.3, "mm": 34.8,
     "cmj_baseline": 40.0, "iso_baseline_l": 230, "iso_baseline_r": 235, "ck_basal": 145},
    {"name": "LEANDRO MACIEL", "pos": "MEI", "weight": 91.3, "height": 175, "bf": 13.5, "mm": 41.6,
     "cmj_baseline": 45.0, "iso_baseline_l": 310, "iso_baseline_r": 305, "ck_basal": 190},
    {"name": "MARANHAO", "pos": "EXT", "weight": 75.1, "height": 171, "bf": 11.0, "mm": 34.9,
     "cmj_baseline": 46.0, "iso_baseline_l": 255, "iso_baseline_r": 260, "ck_basal": 165},
    {"name": "MARQUINHO JR.", "pos": "MEI", "weight": 64.9, "height": 182, "bf": 9.2, "mm": 30.8,
     "cmj_baseline": 44.5, "iso_baseline_l": 220, "iso_baseline_r": 225, "ck_basal": 140},
    {"name": "MATHEUS SALES", "pos": "VOL", "weight": 80.1, "height": 176, "bf": 11.7, "mm": 37.0,
     "cmj_baseline": 47.0, "iso_baseline_l": 270, "iso_baseline_r": 275, "ck_basal": 175},
    {"name": "MORELLI", "pos": "VOL", "weight": 82.4, "height": 181, "bf": 12.1, "mm": 38.0,
     "cmj_baseline": 45.5, "iso_baseline_l": 275, "iso_baseline_r": 270, "ck_basal": 180},
    {"name": "PATRICK BREY", "pos": "LAT", "weight": 73.5, "height": 176, "bf": 10.0, "mm": 34.5,
     "cmj_baseline": 43.0, "iso_baseline_l": 240, "iso_baseline_r": 235, "ck_basal": 150},
    {"name": "PEDRINHO", "pos": "LAT", "weight": 67.5, "height": 175, "bf": 9.5, "mm": 31.9,
     "cmj_baseline": 43.0, "iso_baseline_l": 230, "iso_baseline_r": 235, "ck_basal": 145},
    {"name": "PEDRO TORTELLO", "pos": "VOL", "weight": 75.1, "height": 176, "bf": 10.6, "mm": 35.0,
     "cmj_baseline": 43.0, "iso_baseline_l": 255, "iso_baseline_r": 250, "ck_basal": 160},
    {"name": "RAFAEL GAVA", "pos": "MEI", "weight": 78.3, "height": 178, "bf": 11.4, "mm": 36.3,
     "cmj_baseline": 37.0, "iso_baseline_l": 260, "iso_baseline_r": 255, "ck_basal": 170},
    {"name": "THALLES", "pos": "ATA", "weight": 83.9, "height": 178, "bf": 12.2, "mm": 38.7,
     "cmj_baseline": 45.0, "iso_baseline_l": 295, "iso_baseline_r": 290, "ck_basal": 185},
    {"name": "THIAGUINHO", "pos": "MEI", "weight": 64.5, "height": 176, "bf": 7.7, "mm": 30.0,
     "cmj_baseline": 41.5, "iso_baseline_l": 235, "iso_baseline_r": 240, "ck_basal": 185},
    {"name": "VICTOR SOUZA", "pos": "GOL", "weight": 92.8, "height": 187, "bf": 14.1, "mm": 42.2,
     "cmj_baseline": 57.0, "iso_baseline_l": 325, "iso_baseline_r": 320, "ck_basal": 195},
    {"name": "WALLACE", "pos": "ZAG", "weight": 91.6, "height": 192, "bf": 14.0, "mm": 41.3,
     "cmj_baseline": 41.0, "iso_baseline_l": 300, "iso_baseline_r": 295, "ck_basal": 190},
    {"name": "WESLEY", "pos": "EXT", "weight": 76.8, "height": 185, "bf": 10.4, "mm": 35.8,
     "cmj_baseline": 43.2, "iso_baseline_l": 255, "iso_baseline_r": 260, "ck_basal": 160},
    {"name": "YURI", "pos": "VOL", "weight": 66.4, "height": 172, "bf": 9.0, "mm": 31.5,
     "cmj_baseline": 43.0, "iso_baseline_l": 225, "iso_baseline_r": 230, "ck_basal": 140},
]

N_DAYS = 150  # Expanded window for better temporal modeling
START_DATE = datetime(2025, 10, 15)
N_DAYS = 120
START_DATE = datetime(2025, 11, 15)
TRAINING_TYPES = ["strength", "tactical", "technical", "conditioning", "recovery"]


# ==============================================================================
# 1. SIMULAÇÃO DE DADOS LONGITUDINAIS (ATLETA-DIA)
# ==============================================================================

def generate_longitudinal_data():
    """
    Gera dataset atleta-dia com todas as fontes multidisciplinares.
    Estrutura longitudinal: player_id, date, training_load, match_load,
    cmj, sleep, ck, hrv, injury, days_since_last_injury, minutes_played,
    training_type.
    """
    records = []

    for player_id, ath in enumerate(ATHLETES):
        fatigue_state = 0.0
        injury_cooldown = 0
        hrv_baseline = np.random.normal(65, 8)  # HRV rMSSD baseline

        for day_idx in range(N_DAYS):
            date = START_DATE + timedelta(days=day_idx)
            is_match = date.weekday() in [2, 5]
            is_rest = date.weekday() == 0
            day_of_week = date.weekday()

            # Training type
            if is_rest:
                training_type = "REST"
            elif is_match:
                training_type = "MATCH"
            else:
                training_type = np.random.choice(
                    ["STRENGTH", "TACTICAL", "TECHNICAL", "CONDITIONING"],
                    p=[0.2, 0.35, 0.25, 0.2]
                )

            # --- GPS (External Load) ---
            if is_rest:
                hsr = 0; sprints = 0; decels = 0; player_load = 0
                duration = 0; minutes_played = 0
            elif is_match:
                minutes_played = np.random.choice([90, 70, 45, 30, 0],
                                                   p=[0.45, 0.2, 0.15, 0.1, 0.1])
                base_intensity = 1.3 if minutes_played > 0 else 0
                hsr = np.random.gamma(4, 80) * base_intensity * (minutes_played / 90)
                sprints = int(np.random.poisson(12) * (minutes_played / 90))
                decels = int(np.random.poisson(18) * (minutes_played / 90))
                player_load = np.random.normal(650, 80) * (minutes_played / 90)
                duration = minutes_played
            else:
                minutes_played = 0
                base_intensity = np.random.uniform(0.6, 1.0)
                hsr = np.random.gamma(3, 50) * base_intensity
                sprints = np.random.poisson(6)
                decels = np.random.poisson(10)
                player_load = np.random.normal(400, 60)
                duration = np.random.choice([90, 75, 60], p=[0.3, 0.5, 0.2])
                minutes_played = duration

            # --- Internal Load (PSE) ---
            if is_rest:
                pse = 0
            else:
                pse_base = 7.5 if is_match else np.random.uniform(3, 7)
                pse = np.clip(pse_base + fatigue_state * 0.5 + np.random.normal(0, 0.5), 1, 10)
            srpe = round(pse * duration, 1)
            training_load = srpe
            match_load = srpe if is_match else 0

            # --- HRV (Heart Rate Variability) ---
            hrv = np.clip(
                hrv_baseline - fatigue_state * 5 + np.random.normal(0, 4),
                20, 120
            )

            # --- Wellness ---
            sleep_quality = np.clip(np.random.normal(7.5, 1.2) - fatigue_state * 0.8, 1, 10)
            sleep_hours = np.clip(np.random.normal(7.8, 0.8) - fatigue_state * 0.3, 4, 12)
            pain = np.clip(fatigue_state * 2 + np.random.exponential(0.5), 0, 10)
            recovery_general = np.clip(np.random.normal(7.5, 1) - fatigue_state, 1, 10)
            recovery_legs = np.clip(np.random.normal(7.2, 1.2) - fatigue_state * 1.2, 1, 10)
            mood = np.clip(int(np.random.normal(4, 0.8) - fatigue_state * 0.3), 1, 5)
            energy = np.clip(int(np.random.normal(3, 0.5) - fatigue_state * 0.2), 1, 4)

            # --- CMJ & Isometric Strength ---
            fatigue_effect = 1 - fatigue_state * 0.04
            noise = np.random.normal(0, 0.02)
            cmj_today = ath["cmj_baseline"] * (fatigue_effect + noise)
            iso_l = ath["iso_baseline_l"] * (fatigue_effect + np.random.normal(0, 0.03))
            iso_r = ath["iso_baseline_r"] * (fatigue_effect + np.random.normal(0, 0.03))

            # --- SLCMJ (Single Leg CMJ) ---
            slcmj_l = cmj_today * 0.52 * (1 + np.random.normal(0, 0.03))
            slcmj_r = cmj_today * 0.50 * (1 + np.random.normal(0, 0.03))

            # --- Biomechanical (simulated) ---
            dynamic_knee_valgus = np.clip(np.random.normal(5.5, 2) + fatigue_state * 0.8, 0, 15)
            postural_sway = np.clip(np.random.normal(14, 3) + fatigue_state * 1.5, 5, 35)

            # --- Biochemistry ---
            ck_today = ath["ck_basal"] * (1 + fatigue_state * 0.6 +
                                           np.random.exponential(0.3))
            if is_match:
                ck_today *= np.random.uniform(1.5, 3.0)

            # --- Anthropometry ---
            weight_today = ath["weight"] + np.random.normal(0, 0.3)
            bf_today = ath["bf"] + np.random.normal(0, 0.2)

            # --- Injury Event (Target) ---
            # Realistic ~5-8% injury rate (sports medicine reference)
            injury_prob = 0.012
            if fatigue_state > 1.2:
                injury_prob += 0.05
            if fatigue_state > 2.0:
                injury_prob += 0.10
            if fatigue_state > 2.8:
                injury_prob += 0.12
            if ck_today / ath["ck_basal"] > 2.5:
                injury_prob += 0.04
            if ck_today / ath["ck_basal"] > 3.5:
                injury_prob += 0.06
            if abs(iso_l - iso_r) / max(iso_l, iso_r) > 0.12:
                injury_prob += 0.03
            if abs(iso_l - iso_r) / max(iso_l, iso_r) > 0.18:
                injury_prob += 0.04
            if sleep_quality < 5:
                injury_prob += 0.04
            if sleep_quality < 4:
                injury_prob += 0.05
            if pain > 3:
                injury_prob += 0.03
            if pain > 5:
                injury_prob += 0.05
            if injury_cooldown > 0:
                injury_prob += 0.03
            if hrv < hrv_baseline * 0.75:
                injury_prob += 0.04
            if hrv < hrv_baseline * 0.6:
                injury_prob += 0.05
            # Interaction effects
            if fatigue_state > 1.5 and sleep_quality < 6:
                injury_prob += 0.06
            if ck_today / ath["ck_basal"] > 2 and pain > 3:
                injury_prob += 0.04

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

            # Update fatigue state
            load_input = (hsr / 400 + sprints / 15 + player_load / 700) / 3
            recovery_input = (sleep_quality / 10 + recovery_general / 10) / 2
            fatigue_state = np.clip(
                fatigue_state * 0.85 + load_input * 0.4 - recovery_input * 0.2 +
                np.random.normal(0, 0.05), 0, 4
            )

            records.append({
                "player_id": player_id,
                "date": date.strftime("%Y-%m-%d"),
                "athlete": ath["name"],
                "position": ath["pos"],
                "training_type": training_type,
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
                "minutes_played": minutes_played,
                # Internal Load
                "pse": round(pse, 1),
                "srpe": srpe,
                "training_load": round(training_load, 1),
                "match_load": round(match_load, 1),
                # HRV
                "hrv_rmssd": round(hrv, 1),
                "hrv_baseline": round(hrv_baseline, 1),
                # Wellness
                "sleep_quality": round(sleep_quality, 1),
                "sleep_hours": round(sleep_hours, 1),
                "pain": round(pain, 1),
                "recovery_general": round(recovery_general, 1),
                "recovery_legs": round(recovery_legs, 1),
                "mood": mood,
                "energy": energy,
                # Jumps & Strength
                "cmj_cm": round(cmj_today, 1),
                "cmj_baseline": ath["cmj_baseline"],
                "slcmj_l": round(slcmj_l, 1),
                "slcmj_r": round(slcmj_r, 1),
                "iso_left_n": round(iso_l, 1),
                "iso_right_n": round(iso_r, 1),
                "iso_baseline_l": ath["iso_baseline_l"],
                "iso_baseline_r": ath["iso_baseline_r"],
                # Biomechanical
                "dynamic_knee_valgus": round(dynamic_knee_valgus, 1),
                "postural_sway": round(postural_sway, 1),
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
                "day_of_week": day_of_week,
            })

    return pd.DataFrame(records)


# ==============================================================================
# 1b. TABELA DE EXPOSIÇÃO ACUMULADA (SEMANAL E MENSAL)
# ==============================================================================

def compute_exposure_table(df):
    """
    Gera tabela derivada de exposição acumulada com métricas semanais e mensais.
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df["week"] = df["date"].dt.isocalendar().week.astype(int)
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year

    # Weekly exposure
    weekly = df.groupby(["athlete", "year", "week"]).agg(
        total_load=("srpe", "sum"),
        mean_load=("srpe", "mean"),
        max_load=("srpe", "max"),
        training_days=("srpe", lambda x: (x > 0).sum()),
        total_hsr=("hsr_m", "sum"),
        total_sprints=("sprints", "sum"),
        total_player_load=("player_load", "sum"),
        mean_sleep=("sleep_quality", "mean"),
        mean_hrv=("hrv_rmssd", "mean"),
        max_ck=("ck_today", "max"),
        mean_cmj=("cmj_cm", "mean"),
        injuries=("injury", "sum"),
        matches=("is_match", "sum"),
        minutes_played=("minutes_played", "sum"),
    ).reset_index()

    weekly["monotony"] = weekly["mean_load"] / (
        df.groupby(["athlete", "year", "week"])["srpe"].std().reset_index()["srpe"].replace(0, np.nan)
    )
    weekly["strain"] = weekly["total_load"] * weekly["monotony"].fillna(1)

    # Monthly exposure
    monthly = df.groupby(["athlete", "year", "month"]).agg(
        total_load=("srpe", "sum"),
        mean_load=("srpe", "mean"),
        training_days=("srpe", lambda x: (x > 0).sum()),
        total_hsr=("hsr_m", "sum"),
        total_sprints=("sprints", "sum"),
        mean_sleep=("sleep_quality", "mean"),
        mean_hrv=("hrv_rmssd", "mean"),
        injuries=("injury", "sum"),
        matches=("is_match", "sum"),
    ).reset_index()

    return weekly, monthly


# ==============================================================================
# 2. FEATURE ENGINEERING — NÍVEL ELITE
# ==============================================================================

def ewma(series, span):
    return series.ewm(span=span, adjust=False).mean()


def compute_ewma_acwr(group, col, acute_span=7, chronic_span=28):
    """EWMA ACWR (Williams et al., 2017 — BJSM)."""
    acute = ewma(group[col], span=acute_span)
    chronic = ewma(group[col], span=chronic_span)
    acwr = acute / chronic.replace(0, np.nan)
    return acwr.fillna(1.0)


def compute_slope(x):
    """Linear regression slope for rolling windows."""
    if len(x) < 2:
        return 0.0
    return np.polyfit(range(len(x)), x, 1)[0]


def engineer_features(df):
    """
    Feature Engineering nível elite — todas as categorias:
    Carga, Fadiga, Temporal, Neuromuscular, Biológico, Biomecânico, Lag features
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["athlete", "date"]).reset_index(drop=True)

    engineered = []

    for athlete, grp in df.groupby("athlete"):
        g = grp.copy()

        # =================================================================
        # HISTORICAL FLAGS (30, 60, 180 days)
        # =================================================================
        for window in [30, 60, 180]:
            g[f"injury_last_{window}d"] = (
                g["injury"].rolling(window=window, min_periods=1).sum().shift(1).fillna(0)
                .apply(lambda x: 1 if x > 0 else 0)
            )

        # Days since last injury
        injury_indices = g[g["injury"] == 1].index
        g["days_since_last_injury"] = np.nan
        for idx in g.index:
            prev = injury_indices[injury_indices < idx]
            g.loc[idx, "days_since_last_injury"] = (idx - prev[-1]) if len(prev) > 0 else 999
        g["days_since_last_injury"] = g["days_since_last_injury"].fillna(999)

        # =================================================================
        # LOAD & EXPOSURE — ACWR, EWMA, Cumulative
        # =================================================================
        # EWMA ACWR
        g["acwr_hsr"] = compute_ewma_acwr(g, "hsr_m")
        g["acwr_sprints"] = compute_ewma_acwr(g, "sprints")
        g["acwr_decels"] = compute_ewma_acwr(g, "decels_3ms2")
        g["acwr_combined"] = g["acwr_hsr"] * 0.4 + g["acwr_sprints"] * 0.35 + g["acwr_decels"] * 0.25

        # EWMA Load (sRPE)
        g["ewma_load_acute"] = ewma(g["srpe"], span=7)
        g["ewma_load_chronic"] = ewma(g["srpe"], span=28)
        g["acwr_srpe"] = g["ewma_load_acute"] / g["ewma_load_chronic"].replace(0, np.nan)
        g["acwr_srpe"] = g["acwr_srpe"].fillna(1.0)

        # Cumulative loads
        g["cumulative_load_7d"] = g["srpe"].rolling(window=7, min_periods=1).sum()
        g["cumulative_load_28d"] = g["srpe"].rolling(window=28, min_periods=1).sum()

        # Monotony & Strain
        g["srpe_7d_mean"] = g["srpe"].rolling(window=7, min_periods=1).mean()
        srpe_std = g["srpe"].rolling(window=7, min_periods=3).std()
        g["monotony"] = g["srpe_7d_mean"] / srpe_std.replace(0, np.nan)
        g["monotony"] = g["monotony"].fillna(1.0)
        g["strain"] = g["cumulative_load_7d"] * g["monotony"]

        # =================================================================
        # FATIGUE DEBT — Exponential decay accumulation
        # FatigueDebt_t = Σ Load_{t-i} * exp(-λi), λ = 0.1
        # =================================================================
        decay_lambda = 0.1
        fatigue_debt_vals = []
        srpe_values = g["srpe"].values
        for t in range(len(srpe_values)):
            lookback = min(t + 1, 28)
            debt = sum(srpe_values[t - i] * np.exp(-decay_lambda * i) for i in range(lookback))
            fatigue_debt_vals.append(debt)
        g["fatigue_debt"] = fatigue_debt_vals

        # =================================================================
        # TEMPORAL TRENDS — Regression slopes in moving windows
        # =================================================================
        g["cmj_trend_3d"] = g["cmj_cm"].rolling(3, min_periods=2).apply(compute_slope, raw=True).fillna(0)
        g["cmj_trend_5d"] = g["cmj_cm"].rolling(5, min_periods=3).apply(compute_slope, raw=True).fillna(0)
        g["sleep_trend_7d"] = g["sleep_quality"].rolling(7, min_periods=3).apply(compute_slope, raw=True).fillna(0)
        g["srpe_trend_5d"] = g["srpe"].rolling(5, min_periods=3).apply(compute_slope, raw=True).fillna(0)
        g["hrv_trend_7d"] = g["hrv_rmssd"].rolling(7, min_periods=3).apply(compute_slope, raw=True).fillna(0)
        g["ck_growth_48h"] = g["ck_today"].pct_change(periods=2).fillna(0)

        # =================================================================
        # NEUROMUSCULAR
        # =================================================================
        g["cmj_delta_pct"] = (g["cmj_cm"] - g["cmj_baseline"]) / g["cmj_baseline"] * 100
        g["slcmj_asymmetry"] = (
            (g["slcmj_l"] - g["slcmj_r"]).abs() /
            g[["slcmj_l", "slcmj_r"]].max(axis=1) * 100
        )
        g["iso_asymmetry_pct"] = (
            (g["iso_left_n"] - g["iso_right_n"]).abs() /
            g[["iso_left_n", "iso_right_n"]].max(axis=1) * 100
        )
        g["iso_asymmetry_flag"] = (g["iso_asymmetry_pct"] > 15).astype(int)
        iso_today_avg = (g["iso_left_n"] + g["iso_right_n"]) / 2
        iso_baseline_avg = (g["iso_baseline_l"] + g["iso_baseline_r"]) / 2
        g["iso_delta_pct"] = (iso_today_avg - iso_baseline_avg) / iso_baseline_avg * 100

        # Force asymmetry (L/R)
        g["force_asymmetry"] = (
            (g["iso_left_n"] - g["iso_right_n"]) /
            g[["iso_left_n", "iso_right_n"]].mean(axis=1) * 100
        )

        # NME = CMJ / training_load_7d
        srpe_7d_safe = g["cumulative_load_7d"].replace(0, np.nan)
        g["nme"] = g["cmj_cm"] / srpe_7d_safe
        g["nme"] = g["nme"].fillna(g["nme"].median())

        # =================================================================
        # BIOLOGICAL
        # =================================================================
        g["ck_ratio"] = g["ck_today"] / g["ck_basal"]
        g["biological_deficit"] = g["ck_ratio"] * (10 - g["sleep_quality"]) / 10

        # Sleep debt (cumulative deficit below 7h)
        g["sleep_debt"] = (7 - g["sleep_hours"]).clip(lower=0).rolling(7, min_periods=1).sum()

        # HRV z-score (individual)
        hrv_mean = g["hrv_rmssd"].expanding(min_periods=7).mean()
        hrv_std = g["hrv_rmssd"].expanding(min_periods=7).std().replace(0, np.nan)
        g["hrv_zscore"] = (g["hrv_rmssd"] - hrv_mean) / hrv_std
        g["hrv_zscore"] = g["hrv_zscore"].fillna(0)

        # =================================================================
        # LAG FEATURES (1, 3, 5, 7 days)
        # =================================================================
        for lag in [1, 3, 5, 7]:
            g[f"srpe_lag{lag}"] = g["srpe"].shift(lag).fillna(0)
            g[f"cmj_lag{lag}"] = g["cmj_cm"].shift(lag).fillna(g["cmj_baseline"].iloc[0])
            g[f"ck_lag{lag}"] = g["ck_today"].shift(lag).fillna(g["ck_basal"].iloc[0])
            g[f"hrv_lag{lag}"] = g["hrv_rmssd"].shift(lag).fillna(g["hrv_baseline"].iloc[0])

        # =================================================================
        # ROLLING STATS per athlete (means, stds, z-scores)
        # =================================================================
        for col, window in [("srpe", 7), ("cmj_cm", 7), ("ck_today", 7),
                            ("hrv_rmssd", 7), ("sleep_quality", 7)]:
            g[f"{col}_roll_mean_{window}d"] = g[col].rolling(window, min_periods=3).mean().fillna(0)
            g[f"{col}_roll_std_{window}d"] = g[col].rolling(window, min_periods=3).std().fillna(0)
            roll_std = g[f"{col}_roll_std_{window}d"].replace(0, np.nan)
            g[f"{col}_roll_zscore_{window}d"] = (
                (g[col] - g[f"{col}_roll_mean_{window}d"]) / roll_std
            ).fillna(0)

        # =================================================================
        # INTERACTIONS
        # =================================================================
        g["acwr_x_sleep_deficit"] = g["acwr_combined"] * (10 - g["sleep_quality"])
        g["ck_x_asymmetry"] = g["ck_ratio"] * g["iso_asymmetry_pct"]
        g["acwr_x_hrv_low"] = g["acwr_combined"] * (g["hrv_zscore"] < -1).astype(float)
        g["fatigue_x_pain"] = g["fatigue_debt"] * g["pain"]

        # Additional
        g["pl_3d_sum"] = g["player_load"].rolling(3, min_periods=1).sum()
        g["weight_delta"] = g["weight_kg"] - g["weight_kg"].rolling(14, min_periods=3).mean()
        g["sleep_deficit_flag"] = (g["sleep_hours"] < 7).astype(int)
        g["wellness_composite"] = (
            g["sleep_quality"] + g["recovery_general"] + g["recovery_legs"] +
            (10 - g["pain"]) + g["mood"] * 2 + g["energy"] * 2.5
        ) / 6

        engineered.append(g)

    result = pd.concat(engineered, ignore_index=True)

    # Position encoding
    pos_map = {"GOL": 0, "ZAG": 1, "LAT": 2, "VOL": 3, "MEI": 4, "ATA": 5, "EXT": 6}
    result["pos_encoded"] = result["position"].map(pos_map).fillna(3)

    return result


# ==============================================================================
# 3. FEATURE SELECTION — LASSO + FEATURE COLUMNS
# ==============================================================================

FEATURE_COLS = [
    # Historical
    "injury_last_30d", "injury_last_60d", "injury_last_180d", "days_since_last_injury",
    # ACWR / Load
    "acwr_hsr", "acwr_sprints", "acwr_decels", "acwr_combined", "acwr_srpe",
    "ewma_load_acute", "ewma_load_chronic",
    "cumulative_load_7d", "cumulative_load_28d",
    "monotony", "strain",
    # Fatigue
    "fatigue_debt",
    # Temporal trends
    "cmj_trend_3d", "cmj_trend_5d", "sleep_trend_7d", "srpe_trend_5d",
    "hrv_trend_7d", "ck_growth_48h",
    # Neuromuscular
    "cmj_delta_pct", "slcmj_asymmetry", "iso_asymmetry_pct", "iso_asymmetry_flag",
    "iso_delta_pct", "force_asymmetry", "nme",
    # Biological
    "ck_ratio", "biological_deficit", "sleep_debt", "hrv_zscore",
    # Biomechanical
    "dynamic_knee_valgus", "postural_sway",
    # GPS
    "hsr_m", "sprints", "decels_3ms2", "player_load", "pl_3d_sum",
    # Wellness
    "sleep_quality", "sleep_hours", "pain", "recovery_general",
    "recovery_legs", "mood", "energy", "wellness_composite",
    "sleep_deficit_flag",
    # Anthropometry
    "weight_kg", "bf_pct", "weight_delta",
    # Interactions
    "acwr_x_sleep_deficit", "ck_x_asymmetry", "acwr_x_hrv_low", "fatigue_x_pain",
    # Lag features
    "srpe_lag1", "srpe_lag3", "srpe_lag5", "srpe_lag7",
    "cmj_lag1", "cmj_lag3", "cmj_lag5", "cmj_lag7",
    "ck_lag1", "ck_lag3", "ck_lag5", "ck_lag7",
    "hrv_lag1", "hrv_lag3", "hrv_lag5", "hrv_lag7",
    # Rolling stats
    "srpe_roll_mean_7d", "srpe_roll_std_7d", "srpe_roll_zscore_7d",
    "cmj_cm_roll_mean_7d", "cmj_cm_roll_std_7d", "cmj_cm_roll_zscore_7d",
    "ck_today_roll_mean_7d", "ck_today_roll_std_7d", "ck_today_roll_zscore_7d",
    "hrv_rmssd_roll_mean_7d", "hrv_rmssd_roll_std_7d", "hrv_rmssd_roll_zscore_7d",
    "sleep_quality_roll_mean_7d", "sleep_quality_roll_std_7d", "sleep_quality_roll_zscore_7d",
    # Match / Position
    "is_match", "pos_encoded",
]


def lasso_feature_selection(X, y):
    """LASSO-based feature selection (L1 regularization)."""
    print("\n--- LASSO Feature Selection ---")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    lasso = LassoCV(cv=5, random_state=42, max_iter=5000)
    lasso.fit(X_scaled, y)

    # Use a permissive threshold to keep enough features
    coefs = pd.Series(np.abs(lasso.coef_), index=X.columns).sort_values(ascending=False)
    # Keep features with coef > 0 or top 40 if too few selected
    nonzero_features = list(coefs[coefs > 0].index)
    if len(nonzero_features) < 20:
        # LASSO too aggressive for very imbalanced data — use top features by coefficient
        selected_features = list(coefs.head(min(50, len(coefs))).index)
        print(f"  [NOTA] LASSO muito agressivo ({len(nonzero_features)} features). Usando top 50.")
    else:
        selected_features = nonzero_features

    print(f"  Alpha ótimo: {lasso.alpha_:.4f}")
    print(f"  Features selecionadas: {len(selected_features)} / {len(X.columns)}")
    print(f"  Eliminadas: {len(X.columns) - len(selected_features)}")

    print(f"  Top 10 LASSO coefficients:")
    for feat, coef in coefs.head(10).items():
        print(f"    {feat:<35} {coef:.4f}")

    return selected_features, lasso


# ==============================================================================
# 4. PIPELINE DE MODELAGEM — NÍVEL ELITE
# ==============================================================================

def optimize_xgboost(X, y, cv):
    """Hyperparameter optimization with Optuna."""
    if not HAS_OPTUNA:
        print("  [SKIP] Optuna não disponível. Usando hiperparâmetros default.")
        return {
            "max_depth": 6, "learning_rate": 0.05, "n_estimators": 300,
            "subsample": 0.8, "colsample_bytree": 0.8, "min_child_weight": 5,
            "gamma": 0.1, "reg_alpha": 0.1, "reg_lambda": 1.0
        }

    print("\n--- Optuna Hyperparameter Optimization (50 trials) ---")

    neg_to_pos = (y == 0).sum() / max((y == 1).sum(), 1)

    def objective(trial):
        params = {
            "max_depth": trial.suggest_int("max_depth", 3, 8),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
            "n_estimators": trial.suggest_int("n_estimators", 100, 500, step=50),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 3, 10),
            "gamma": trial.suggest_float("gamma", 0.0, 0.5),
            "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 1.0),
            "reg_lambda": trial.suggest_float("reg_lambda", 0.5, 3.0),
        }

        model = ImbPipeline([
            ("scaler", StandardScaler()),
            ("smote", SMOTETomek(random_state=42)),
            ("xgb", XGBClassifier(
                **params,
                scale_pos_weight=neg_to_pos,
                eval_metric="aucpr",
                random_state=42,
                n_jobs=-1,
            ))
        ])

        scores = []
        for train_idx, val_idx in cv.split(X, y):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            model.fit(X_train, y_train)
            y_prob = model.predict_proba(X_val)[:, 1]
            try:
                scores.append(roc_auc_score(y_val, y_prob))
            except ValueError:
                scores.append(0.5)
        return np.mean(scores)

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=50, show_progress_bar=False)

    print(f"  Melhor AUC-ROC: {study.best_value:.4f}")
    print(f"  Melhores parâmetros:")
    for k, v in study.best_params.items():
        print(f"    {k}: {v}")

    return study.best_params


def train_model(df):
    """
    Pipeline Elite: KNNImputer → StandardScaler → SMOTE+TomekLinks →
    LASSO → XGBoost → Calibração → Threshold Tuning → SHAP
    """
    # Remove rest days and warm-up period
    df_train = df[df["is_rest"] == 0].copy()
    df_train = df_train.groupby("athlete").apply(
        lambda x: x.iloc[28:]
    ).reset_index(drop=True)

    X = df_train[FEATURE_COLS].copy()
    y = df_train["injury"]

    # --- Class distribution ---
    n_neg = (y == 0).sum()
    n_pos = (y == 1).sum()
    scale_pos_weight = n_neg / max(n_pos, 1)

    print(f"\n{'='*60}")
    print(f"DISTRIBUIÇÃO DE CLASSES")
    print(f"{'='*60}")
    print(f"  Sem lesão (0): {n_neg} ({n_neg/(n_neg+n_pos)*100:.1f}%)")
    print(f"  Com lesão (1): {n_pos} ({n_pos/(n_neg+n_pos)*100:.1f}%)")
    print(f"  Ratio: 1:{int(scale_pos_weight)}")
    print(f"  scale_pos_weight (auto): {scale_pos_weight:.2f}")

    # --- Step 1: KNN Imputation ---
    print(f"\n--- KNN Imputation ---")
    print(f"  Missing antes: {X.isnull().sum().sum()}")
    imputer_full = KNNImputer(n_neighbors=5)
    X_imputed = pd.DataFrame(imputer_full.fit_transform(X), columns=X.columns, index=X.index)
    print(f"  Missing depois: {X_imputed.isnull().sum().sum()}")

    # --- Step 2: LASSO Feature Selection ---
    selected_features, lasso_model = lasso_feature_selection(X_imputed, y)
    X_selected = X_imputed[selected_features]

    # Refit imputer on selected features only (for prediction)
    imputer = KNNImputer(n_neighbors=5)
    imputer.fit(X_selected)

    # --- Step 3: Optuna optimization ---
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_params = optimize_xgboost(X_selected, y, cv)

    # --- Step 4: Final Pipeline ---
    print(f"\n{'='*60}")
    print(f"TREINANDO: KNN → Scaler → SMOTE+Tomek → XGBoost (5-Fold CV)")
    print(f"{'='*60}")

    model = ImbPipeline([
        ("scaler", StandardScaler()),
        ("smote_tomek", SMOTETomek(random_state=42)),
        ("xgb", XGBClassifier(
            **best_params,
            scale_pos_weight=scale_pos_weight,
            eval_metric="aucpr",
            random_state=42,
            n_jobs=-1,
        ))
    ])

    # Cross-validation predictions
    y_pred_proba = cross_val_predict(model, X_selected, y, cv=cv, method="predict_proba")[:, 1]

    # --- Step 5: Threshold Tuning (0.20 - 0.50) ---
    print(f"\n--- Threshold Tuning (0.20 → 0.50) ---")
    print(f"  Objetivo: maximizar recall mantendo precisão aceitável")
    best_threshold = 0.30
    best_score = 0
    for t in np.arange(0.20, 0.51, 0.02):
        y_t = (y_pred_proba > t).astype(int)
        rec = recall_score(y, y_t, zero_division=0)
        prec = precision_score(y, y_t, zero_division=0)
        f1 = f1_score(y, y_t, zero_division=0)
        # Weighted score: prioritize recall
        score = 0.6 * rec + 0.2 * prec + 0.2 * f1
        print(f"  t={t:.2f}: Recall={rec:.3f} Precision={prec:.3f} F1={f1:.3f} Score={score:.3f}")
        if score > best_score:
            best_score = score
            best_threshold = t

    print(f"  → Threshold ótimo: {best_threshold:.2f}")
    y_pred = (y_pred_proba > best_threshold).astype(int)

    # --- Step 6: Comprehensive Metrics ---
    print(f"\n{'='*60}")
    print(f"MÉTRICAS DE AVALIAÇÃO (threshold={best_threshold:.2f})")
    print(f"{'='*60}")
    print(classification_report(y, y_pred, target_names=["Apto", "Lesão"]))

    auc_roc = roc_auc_score(y, y_pred_proba)
    auc_pr = average_precision_score(y, y_pred_proba)
    mcc = matthews_corrcoef(y, y_pred)
    tn, fp, fn, tp = confusion_matrix(y, y_pred).ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
    recall = recall_score(y, y_pred, zero_division=0)
    prec = precision_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)

    print(f"  AUC-ROC:      {auc_roc:.3f}  (alvo: 0.88-0.90)")
    print(f"  AUC-PR:       {auc_pr:.3f}")
    print(f"  Recall:       {recall:.3f}  (alvo: 0.80-0.85)")
    print(f"  Precision:    {prec:.3f}")
    print(f"  F1-Score:     {f1:.3f}")
    print(f"  Specificity:  {specificity:.3f}")
    print(f"  MCC:          {mcc:.3f}")

    # --- Step 7: Train final model ---
    model.fit(X_selected, y)

    # --- Step 8: Probability Calibration ---
    print(f"\n--- Calibração de Probabilidade ---")
    # Platt scaling
    calibrated_platt = CalibratedClassifierCV(model, method="sigmoid", cv=cv)
    calibrated_platt.fit(X_selected, y)
    y_platt = calibrated_platt.predict_proba(X_selected)[:, 1]
    auc_platt = roc_auc_score(y, y_platt)
    print(f"  Platt Scaling  — AUC-ROC: {auc_platt:.3f}")

    # Isotonic regression
    calibrated_iso = CalibratedClassifierCV(model, method="isotonic", cv=cv)
    calibrated_iso.fit(X_selected, y)
    y_iso = calibrated_iso.predict_proba(X_selected)[:, 1]
    auc_iso = roc_auc_score(y, y_iso)
    print(f"  Isotonic Regr. — AUC-ROC: {auc_iso:.3f}")

    # Choose best calibration
    if auc_iso >= auc_platt:
        calibrated_model = calibrated_iso
        cal_method = "isotonic"
        print(f"  → Método escolhido: Isotonic Regression")
    else:
        calibrated_model = calibrated_platt
        cal_method = "platt"
        print(f"  → Método escolhido: Platt Scaling")

    # --- Step 9: Feature Importance ---
    xgb_model = model.named_steps["xgb"]
    importances = pd.Series(
        xgb_model.feature_importances_, index=selected_features
    ).sort_values(ascending=False)

    print(f"\n{'='*60}")
    print(f"FEATURE IMPORTANCE MATRIX (Top 20)")
    print(f"{'='*60}")
    for feat, imp in importances.head(20).items():
        bar = "█" * int(imp * 100)
        print(f"  {feat:<35} {imp:.4f} {bar}")

    # --- Step 10: SHAP Explainability ---
    shap_values_dict = None
    if HAS_SHAP:
        print(f"\n--- SHAP Explainability ---")
        try:
            X_scaled = StandardScaler().fit_transform(X_selected)
            explainer = shap.TreeExplainer(xgb_model)
            shap_values = explainer.shap_values(X_scaled)
            shap_importance = pd.Series(
                np.abs(shap_values).mean(axis=0), index=selected_features
            ).sort_values(ascending=False)
            print(f"  SHAP Top 10:")
            for feat, sv in shap_importance.head(10).items():
                print(f"    {feat:<35} {sv:.4f}")
            shap_values_dict = {
                "global_importance": {f: round(float(v), 4) for f, v in shap_importance.head(20).items()},
            }
        except Exception as e:
            print(f"  [WARN] SHAP falhou: {e}")

    metrics = {
        "auc_roc": round(auc_roc, 3),
        "auc_pr": round(auc_pr, 3),
        "recall": round(recall, 3),
        "precision": round(prec, 3),
        "f1": round(f1, 3),
        "specificity": round(specificity, 3),
        "mcc": round(mcc, 3),
        "threshold": round(best_threshold, 2),
        "calibration_method": cal_method,
        "scale_pos_weight": round(scale_pos_weight, 2),
        "n_features_selected": len(selected_features),
        "n_features_total": len(FEATURE_COLS),
    }

    return (calibrated_model, importances, X_selected, y, y_pred_proba,
            selected_features, metrics, shap_values_dict, best_threshold, imputer)


# ==============================================================================
# 5. CLUSTERS DE RISCO
# ==============================================================================

def identify_risk_clusters(df, importances):
    """Identifica padrões multimodais de risco (Bittencourt — Sistemas Complexos)."""
    print(f"\n{'='*60}")
    print(f"CLUSTERS DE RISCO IDENTIFICADOS")
    print(f"{'='*60}")

    clusters = []
    cluster_defs = [
        ("ACWR Alto + Assimetria Bilateral",
         "ACWR combinado > 1.4 + Assimetria > 12%",
         lambda d: (d["acwr_combined"] > 1.4) & (d["iso_asymmetry_pct"] > 12),
         "Reduzir volume HSR 30%. Protocolo de simetria pré-treino."),
        ("Estresse Biológico Composto",
         "CK/Basal > 2.5 + Sono < 6 + Dor > 3",
         lambda d: (d["ck_ratio"] > 2.5) & (d["sleep_quality"] < 6) & (d["pain"] > 3),
         "Sessão regenerativa. Crioterapia. Remonitorar CK 48h."),
        ("Sobrecarga + Fadiga Neuromuscular",
         "sRPE 7d > 3000 + CMJ Delta < -8%",
         lambda d: (d["cumulative_load_7d"] > 3000) & (d["cmj_delta_pct"] < -8),
         "MED (Minimum Effective Dose). Apenas técnico-tático."),
        ("Monotonia + Histórico Recente",
         "Monotonia > 2.0 + Lesão nos últimos 30 dias",
         lambda d: (d["monotony"] > 2.0) & (d["injury_last_30d"] == 1),
         "Variar estímulos. Reduzir frequência. Fisioterapia preventiva."),
        ("Déficit Biológico + Carga HSR",
         "Déficit Bio > 1.5 + ACWR HSR > 1.3",
         lambda d: (d["biological_deficit"] > 1.5) & (d["acwr_hsr"] > 1.3),
         "Recuperação ativa. Suplementação. Sono prioritário."),
        ("HRV Deprimido + Fadiga Acumulada",
         "HRV z-score < -1.5 + Fatigue Debt > 2500",
         lambda d: (d["hrv_zscore"] < -1.5) & (d["fatigue_debt"] > 2500),
         "Redução de 40% no volume. Monitorar HRV diário."),
    ]

    for name, rule, mask_fn, action in cluster_defs:
        mask = mask_fn(df)
        inj_rate = df.loc[mask, "injury"].mean() * 100 if mask.sum() > 0 else 0
        clusters.append({
            "name": name, "rule": rule,
            "n_episodes": int(mask.sum()),
            "injury_rate": round(inj_rate, 1),
            "action": action
        })
        print(f"\n  {name}")
        print(f"    Regra: {rule}")
        print(f"    Episódios: {mask.sum()} | Taxa de lesão: {inj_rate:.1f}%")

    return clusters


# ==============================================================================
# 6. SURVIVAL ANALYSIS (OPTIONAL)
# ==============================================================================

def survival_analysis(df):
    """Cox PH model with time-dependent covariates."""
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
                    "acwr_combined": row.get("acwr_combined", 1),
                    "ck_ratio": row.get("ck_ratio", 1),
                    "cmj_delta_pct": row.get("cmj_delta_pct", 0),
                    "sleep_quality": row.get("sleep_quality", 7),
                    "hrv_zscore": row.get("hrv_zscore", 0),
                    "fatigue_debt": row.get("fatigue_debt", 0),
                })
                last_event = i
        survival_data.append({
            "duration": max(len(g) - last_event, 1), "event": 0,
            "acwr_combined": g.iloc[-1].get("acwr_combined", 1),
            "ck_ratio": g.iloc[-1].get("ck_ratio", 1),
            "cmj_delta_pct": g.iloc[-1].get("cmj_delta_pct", 0),
            "sleep_quality": g.iloc[-1].get("sleep_quality", 7),
            "hrv_zscore": g.iloc[-1].get("hrv_zscore", 0),
            "fatigue_debt": g.iloc[-1].get("fatigue_debt", 0),
        })

    surv_df = pd.DataFrame(survival_data)
    cph = CoxPHFitter(penalizer=0.1)
    cph.fit(surv_df, duration_col="duration", event_col="event")
    cph.print_summary()
    return cph


# ==============================================================================
# 7. MOTOR DE DECISÃO OPERACIONAL — ALERTAS
# ==============================================================================

def generate_tomorrow_alerts(df, model, feature_cols, threshold, imputer):
    """
    Motor de recomendação operacional.
    Gera: risk score, ranking, alertas de alto risco, explicação das variáveis.
    """
    latest = df.groupby("athlete").last().reset_index()

    X_latest = latest[feature_cols].copy()
    X_imputed = pd.DataFrame(imputer.transform(X_latest), columns=X_latest.columns)
    probs = model.predict_proba(X_imputed)[:, 1]
    latest["risk_probability"] = probs
    latest["risk_zone"] = pd.cut(
        probs, bins=[0, 0.15, 0.30, 0.50, 1.0],
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

    # Top risk drivers per athlete
    def get_risk_drivers(row):
        drivers = []
        if row.get("acwr_combined", 0) > 1.3:
            drivers.append(f"ACWR alto ({row['acwr_combined']:.2f})")
        if row.get("ck_ratio", 0) > 2.0:
            drivers.append(f"CK elevado ({row['ck_ratio']:.1f}x basal)")
        if row.get("cmj_delta_pct", 0) < -8:
            drivers.append(f"CMJ em queda ({row['cmj_delta_pct']:.1f}%)")
        if row.get("sleep_quality", 10) < 6:
            drivers.append(f"Sono ruim ({row['sleep_quality']:.1f})")
        if row.get("hrv_zscore", 0) < -1.5:
            drivers.append(f"HRV baixo (z={row['hrv_zscore']:.1f})")
        if row.get("fatigue_debt", 0) > 3000:
            drivers.append(f"Fadiga acumulada ({row['fatigue_debt']:.0f})")
        if row.get("injury_last_30d", 0) == 1:
            drivers.append("Lesão recente (<30d)")
        if row.get("slcmj_asymmetry", 0) > 12:
            drivers.append(f"Assimetria SLCMJ ({row['slcmj_asymmetry']:.1f}%)")
        if row.get("monotony", 0) > 2.0:
            drivers.append(f"Monotonia alta ({row['monotony']:.1f})")
        return drivers[:5]  # top 5

    latest["risk_drivers"] = latest.apply(get_risk_drivers, axis=1)

    alerts = latest.sort_values("risk_probability", ascending=False)

    print(f"\n{'='*60}")
    print(f"MOTOR DE DECISÃO — PRONTIDÃO PARA PRÓXIMA SESSÃO")
    print(f"{'='*60}")
    print(f"{'Atleta':<22} {'Pos':<5} {'Prob%':<8} {'Zona':<10} {'Dosagem'}")
    print("-" * 100)
    for _, row in alerts.iterrows():
        icons = {"VERMELHO": "🔴", "LARANJA": "🟠", "AMARELO": "🟡", "VERDE": "🟢"}
        icon = icons.get(row["risk_zone"], "⚪")
        print(f"  {icon} {row['athlete']:<20} {row['position']:<5} "
              f"{row['risk_probability']*100:>5.1f}%  {row['risk_zone']:<10} "
              f"{row['dosage']}")
        if row["risk_drivers"]:
            print(f"     → Drivers: {', '.join(row['risk_drivers'])}")

    return alerts


# ==============================================================================
# 8. EXPORT TO DASHBOARD (JSON)
# ==============================================================================

def export_to_dashboard(alerts, importances, clusters, metrics, shap_data):
    """Exporta resultados completos para o dashboard Next.js."""
    output = {
        "generated_at": datetime.now().isoformat(),
        "model": "KNNImputer → StandardScaler → SMOTE+Tomek → LASSO → XGBoost → Calibração → SHAP",
        "metrics": metrics,
        "feature_importance": [
            {"feature": feat, "importance": round(float(imp), 4)}
            for feat, imp in importances.head(25).items()
        ],
        "shap": shap_data,
        "risk_clusters": clusters,
        "alerts": [],
    }

    for _, row in alerts.iterrows():
        alert = {
            "athlete": row["athlete"],
            "position": row["position"],
            "risk_probability": round(float(row["risk_probability"]), 3),
            "risk_zone": row["risk_zone"],
            "dosage": row["dosage"],
            "risk_drivers": row["risk_drivers"],
            # Load metrics
            "acwr_combined": round(float(row.get("acwr_combined", 0)), 2),
            "acwr_srpe": round(float(row.get("acwr_srpe", 0)), 2),
            "cumulative_load_7d": round(float(row.get("cumulative_load_7d", 0)), 0),
            "cumulative_load_28d": round(float(row.get("cumulative_load_28d", 0)), 0),
            "monotony": round(float(row.get("monotony", 0)), 2),
            "strain": round(float(row.get("strain", 0)), 0),
            "fatigue_debt": round(float(row.get("fatigue_debt", 0)), 1),
            # Neuromuscular
            "cmj_delta_pct": round(float(row.get("cmj_delta_pct", 0)), 1),
            "slcmj_asymmetry": round(float(row.get("slcmj_asymmetry", 0)), 1),
            "nme": round(float(row.get("nme", 0)), 4),
            # Biological
            "ck_ratio": round(float(row.get("ck_ratio", 0)), 2),
            "sleep_quality": round(float(row.get("sleep_quality", 0)), 1),
            "sleep_debt": round(float(row.get("sleep_debt", 0)), 1),
            "hrv_zscore": round(float(row.get("hrv_zscore", 0)), 2),
            "biological_deficit": round(float(row.get("biological_deficit", 0)), 2),
            # Wellness
            "wellness_composite": round(float(row.get("wellness_composite", 0)), 1),
            # Trends
            "cmj_trend_3d": round(float(row.get("cmj_trend_3d", 0)), 3),
            "cmj_trend_5d": round(float(row.get("cmj_trend_5d", 0)), 3),
            "srpe_trend_5d": round(float(row.get("srpe_trend_5d", 0)), 1),
            "sleep_trend_7d": round(float(row.get("sleep_trend_7d", 0)), 3),
            "hrv_trend_7d": round(float(row.get("hrv_trend_7d", 0)), 3),
            # Biomechanical
            "dynamic_knee_valgus": round(float(row.get("dynamic_knee_valgus", 0)), 1),
            "postural_sway": round(float(row.get("postural_sway", 0)), 1),
        }
        output["alerts"].append(alert)

    output_path = Path(__file__).parent / "risk_output.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Dados exportados para: {output_path}")
    return output


# ==============================================================================
# MAIN — EXECUÇÃO COMPLETA DO PIPELINE ELITE
# ==============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("  MOTOR PREDITIVO DE LESÕES — NÍVEL ELITE")
    print("  Botafogo-SP FSA · Saúde e Performance · 2026")
    print("  Pipeline: KNN → Scaler → SMOTE+Tomek → LASSO → XGBoost")
    print("           → Calibração → Threshold → SHAP → Dashboard")
    print("=" * 60)

    # 1. Generate data
    print(f"\n[1/7] Gerando dados longitudinais ({len(ATHLETES)} atletas x {N_DAYS} dias)...")
    df_raw = generate_longitudinal_data()
    print(f"  → {len(df_raw)} registros | {df_raw['injury'].sum()} eventos de lesão")

    # 2. Exposure tables
    print(f"\n[2/7] Calculando tabelas de exposição (semanal/mensal)...")
    weekly_exp, monthly_exp = compute_exposure_table(df_raw)
    print(f"  → {len(weekly_exp)} registros semanais | {len(monthly_exp)} registros mensais")

    # 3. Feature Engineering
    print(f"\n[3/7] Feature Engineering elite ({len(FEATURE_COLS)} features)...")
    df_feat = engineer_features(df_raw)
    print(f"  → Features engenheiradas com sucesso")

    # 4. Train model
    print(f"\n[4/7] Pipeline completo de modelagem...")
    (model, importances, X, y, y_proba,
     selected_features, metrics, shap_data,
     threshold, imputer) = train_model(df_feat)

    # 5. Risk clusters
    print(f"\n[5/7] Identificando clusters de risco...")
    df_analysis = df_feat[df_feat["is_rest"] == 0].copy()
    clusters = identify_risk_clusters(df_analysis, importances)

    # 6. Survival analysis
    print(f"\n[6/7] Análise de sobrevivência...")
    survival_analysis(df_feat)

    # 7. Alerts
    print(f"\n[7/7] Motor de decisão operacional...")
    alerts = generate_tomorrow_alerts(df_feat, model, selected_features, threshold, imputer)

    # Export
    output = export_to_dashboard(alerts, importances, clusters, metrics, shap_data)

    print(f"\n{'='*60}")
    print(f"  PIPELINE ELITE CONCLUÍDO COM SUCESSO")
    print(f"{'='*60}")
    print(f"  AUC-ROC:  {metrics['auc_roc']}")
    print(f"  Recall:   {metrics['recall']}")
    print(f"  MCC:      {metrics['mcc']}")
    print(f"  Features: {metrics['n_features_selected']}/{metrics['n_features_total']}")
    print(f"{'='*60}")
