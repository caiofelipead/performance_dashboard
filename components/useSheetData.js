"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// Hook: useSheetData — Busca dados da Google Sheets via API interna
// Retorna dados GPS, diário, saltos e questionários com auto-refresh
// Fonte: Planilha "Cópia de Fisiologia - 2026" (Google Sheets publicada)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_INTERVAL = 120_000; // 2 minutos
const RETRY_DELAYS = [2000, 5000, 15000];

export function useSheetData({ interval = DEFAULT_INTERVAL, enabled = true } = {}) {
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const retryCount = useRef(0);
  const timerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      // Buscar todas as abas de uma vez
      const res = await fetch("/api/sheets?tab=all", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const result = await res.json();
      if (!result.ok) throw new Error(result.error || "Dados inválidos");

      // Processar GPS → formato SESSION_DATA.atletas
      const sessionAtletas = buildSessionData(result);

      console.log("[useSheetData] Dados recebidos:", {
        gps: Object.keys(result.gps || {}).length + " atletas",
        diario: Object.keys(result.diario || {}).length + " atletas",
        saltos: Object.keys(result.saltos || {}).length + " atletas",
        questionarios: Object.keys(result.questionarios || {}).length + " atletas",
        fisioterapia: Object.keys(result.fisioterapia || {}).length + " atletas",
        sessionAtletas: Object.keys(sessionAtletas).length + " atletas mergeados",
        _debug: result._debug
      });

      setSheetData({
        raw: result,
        gps: result.gps || {},
        diario: result.diario || {},
        saltos: result.saltos || {},
        questionarios: result.questionarios || {},
        fisioterapia: result.fisioterapia || {},
        lesoes: result.lesoes || [],
        cmj_externo: result.cmj_externo || {},
        sessionAtletas,
        timestamp: result.timestamp
      });

      setLastUpdate(new Date());
      retryCount.current = 0;
    } catch (err) {
      console.warn("[useSheetData] Erro:", err.message);
      setError(err.message);

      if (retryCount.current < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[retryCount.current];
        retryCount.current++;
        setTimeout(fetchData, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    timerRef.current = setInterval(fetchData, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData, interval, enabled]);

  return { sheetData, loading, error, lastUpdate, refresh: fetchData, isLive: !!sheetData && !error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Construir SESSION_DATA.atletas a partir dos dados da planilha
// Combina GPS (última sessão) + Diário (PSE) + Questionários (wellness)
// ═══════════════════════════════════════════════════════════════════════════════
function buildSessionData(result) {
  const gpsData = result.gps || {};
  const diarioData = result.diario || {};
  const saltosData = result.saltos || {};
  const questData = result.questionarios || {};

  const parseDate = (d) => {
    if (!d) return 0;
    const s = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime();
    const parts = s.split(/[\/\-\.]/);
    if (parts.length >= 3) {
      const [a, b, c] = parts.map(Number);
      if (a > 31) return new Date(a, b - 1, c).getTime();
      if (c > 31) return new Date(c, b - 1, a).getTime();
      return new Date(c, a - 1, b).getTime();
    }
    return new Date(s).getTime() || 0;
  };

  // Encontrar a data da última sessão GLOBAL (mais recente entre todos)
  let latestGlobalDate = 0;
  for (const entries of Object.values(gpsData)) {
    for (const e of entries) {
      const d = parseDate(e.date);
      if (d > latestGlobalDate) latestGlobalDate = d;
    }
  }

  const atletas = {};

  for (const [name, entries] of Object.entries(gpsData)) {
    if (!entries.length) continue;

    // Filtrar apenas entradas da última sessão global
    const latestEntries = entries.filter(e => parseDate(e.date) === latestGlobalDate);
    if (!latestEntries.length) continue;

    const latest = latestEntries[latestEntries.length - 1];
    const g = latest.gps;

    // Dados do diário para o mesmo atleta (última entrada)
    const diario = diarioData[name];
    const latestDiario = diario?.length ? diario[diario.length - 1] : null;

    // Dados de saltos (última avaliação)
    const saltos = saltosData[name];
    const latestSaltos = saltos?.length ? saltos[saltos.length - 1] : null;

    // Dados de questionário (última resposta)
    const quest = questData[name];
    const latestQuest = quest?.length ? quest[quest.length - 1] : null;

    // sRPE e duração do diário
    const pse = latestDiario?.pse || 0;
    const duracao = latestDiario?.duracao || 0;
    const spe = latestDiario?.spe || (pse * duracao);
    const peso = latestDiario?.peso_pre || 0;

    // CMJ (melhor dos 3 saltos)
    const cmjPre = latestSaltos ? Math.max(latestSaltos.cmj_1, latestSaltos.cmj_2, latestSaltos.cmj_3) : 0;

    // Wellness do questionário
    const sonoQual = latestQuest?.sono_qualidade || 0;
    const dor = latestQuest?.dor || 0;
    const recGeral = latestQuest?.recuperacao_geral || 0;

    // Assimetria SLCMJ
    const cmjD = latestSaltos ? Math.max(latestSaltos.cmjd_1, latestSaltos.cmjd_2, latestSaltos.cmjd_3) : 0;
    const cmjE = latestSaltos ? Math.max(latestSaltos.cmje_1, latestSaltos.cmje_2, latestSaltos.cmje_3) : 0;
    const asi = (cmjD > 0 && cmjE > 0) ? Math.round(Math.abs(cmjD - cmjE) / Math.max(cmjD, cmjE) * 1000) / 10 : 0;

    // Classificação automática
    let classificacao = "verde";
    let classificacao_label = "Sessão bem tolerada";

    const distPct = g.dist_baseline > 0 ? (g.dist_total / g.dist_baseline) * 100 : 100;
    const hsrPct = g.hsr_baseline > 0 ? (g.hsr / g.hsr_baseline) * 100 : 100;

    if (hsrPct > 130 || distPct > 120 || (sonoQual > 0 && sonoQual < 4) || dor > 5) {
      classificacao = "vermelho";
      classificacao_label = "Sessão aumentou risco — atenção";
    } else if (hsrPct > 100 || distPct > 100 || (sonoQual > 0 && sonoQual < 6) || dor > 3) {
      classificacao = "amarelo";
      classificacao_label = "Carga controlada — monitorar";
    }

    atletas[name] = {
      gps: {
        dist_total: g.dist_total || 0,
        dist_baseline: g.dist_baseline || 0,
        hsr: g.hsr || 0,
        hsr_baseline: g.hsr_baseline || 0,
        sprints: g.sprints || 0,
        sprints_baseline: g.sprints_baseline || 0,
        acel: g.acel || 0,
        acel_baseline: g.acel_baseline || 0,
        decel: g.decel || 0,
        decel_baseline: g.decel_baseline || 0,
        pico_vel: g.pico_vel || 0,
        pico_vel_baseline: g.pico_vel_baseline || 0,
        player_load: g.player_load || 0
      },
      carga_interna: {
        srpe_sessao: pse,
        duracao: duracao,
        srpe_total: spe,
        hr_avg: g.hr_avg || 0,
        hr_max: g.hr_max || 0,
        hr_baseline_avg: g.hr_baseline_avg || 0,
        tempo_zona_alta: g.tempo_zona_alta || 0,
        tempo_zona_alta_baseline: g.tempo_zona_alta_baseline || 0
      },
      nm_response: {
        cmj_pre: cmjPre,
        cmj_pos: 0,
        cmj_delta_pct: 0,
        asi_pos: asi,
        nme_pos: 0
      },
      fisio: {
        sono_noite: sonoQual,
        dor_pos: dor,
        rec_percebida: recGeral,
        ck_estimado: 0
      },
      risco: {
        prob_pre: 0,
        prob_pos: 0,
        delta: 0,
        impacto: "neutro"
      },
      classificacao,
      classificacao_label,
      obs: `Dados em tempo real — ${latest.sessionTitle || latest.date}`,
      _fromSheet: true,
      _sessionDate: latest.date,
      _tags: latest.tags
    };
  }

  return atletas;
}
