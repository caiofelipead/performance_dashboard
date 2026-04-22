// ═══════════════════════════════════════════════════════════════════════════════
// API Route — Proxy para Google Sheets (evita CORS + cache server-side)
// Busca dados CSV de múltiplas abas e agrega por atleta/sessão
// Estrutura: Planilha "Cópia de Fisiologia - 2026"
// Abas: Diário, VBT, GPS, Saltos, Bioquímico, Antropometria, Questionários, Atletas
// ═══════════════════════════════════════════════════════════════════════════════

const SHEETS_CONFIG = {
  // URL publicada (pubhtml → CSV) — chave pública
  published_key: "2PACX-1vQSxRZObs5anHZcJH7LsETalW7vY1U5A066mLFpWVZMWgHNWL28PWSnhjJHWtznCQ2R8AV5YYdlt6AP",
  // IDs das planilhas editáveis (principal + fallback)
  spreadsheet_ids: [
    "1yUQ2faGfJOsWYWqxG3E5p2ksrvFr3jxmPNRccwR3mLo",
    "1f4j4Qj0o3BYZPZ5YOTKoG0mk3H7UUCiK8gw2Ywv2LPU",
    "1PRwHxkPWQmlwiXC6i2kbkaQSOmqW6-BKFq51pWaPwxY"
  ],
  // GIDs das abas (publicadas no Google Sheets) — verificados manualmente
  tabs: {
    diario: 555914149,
    vbt: 2056067101,
    gps: 0,
    gps_individual: 1595283302,
    saltos: 1915291461,
    bioquimico: 193203862,
    antropometria: 461631273,
    questionarios: 1014986912,
    atletas: 1315104851,
    fisioterapia: 1541953765,
    calendario: 460942009
  },
  // Planilhas externas (publicadas separadamente)
  external: {
    lesoes: {
      csv_url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSoScIHg_LFmt7CraUjcwVGoUZAwtri3YT-MwtS890B01L5eLCnoh4Yx9q9CHJ7Zw/pub?output=csv",
      published_key: "2PACX-1vSoScIHg_LFmt7CraUjcwVGoUZAwtri3YT-MwtS890B01L5eLCnoh4Yx9q9CHJ7Zw",
      spreadsheet_id: "1cAPY5omeDQlCy19khEuRvXuM4yoj3Y05"
    },
    cmj: {
      csv_url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLtLBwIDepJ2biUoLrYW7Jlibwc9CZSsk2yiX1CYtb4gDdacebsrdo33aIWrVBIdwEE3D1RfE13AAF/pub?gid=117504582&single=true&output=csv",
      published_key: "2PACX-1vSLtLBwIDepJ2biUoLrYW7Jlibwc9CZSsk2yiX1CYtb4gDdacebsrdo33aIWrVBIdwEE3D1RfE13AAF",
      spreadsheet_id: "1BbwelzhdGfQnSks5vIwplh0r46EgxPE4",
      gid: 117504582
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Mapeamento: Nome na planilha → Nome no dashboard (P array)
// Planilha usa abreviações (ex: "Adriano A"), dashboard usa nomes curtos (ex: "ADRIANO")
// ═══════════════════════════════════════════════════════════════════════════════
const NAME_MAP = {
  "Adriano A": "ADRIANO",
  "Brenno F": "BRENNO",
  "Carlos Eduardo": "CARLOS EDUARDO",
  "Darlan B": "DARLAN",
  "E Morelli": "MORELLI",
  "Ericson S": "ERICSON",
  "Erik R": "ERIK",
  "F Vieira": "FELIPE VIEIRA",
  "G Queiroz": "GUILHERME QUEIROZ",
  "G Vilar": "GUSTAVO VILAR",
  "G Mariano": "GUI MARIANO",
  "Gabriel I": "GABRIEL INOCENCIO",
  "Hebert W": "HEBERT",
  "Henrique L": "HENRIQUE TELES",
  "Hygor C": "HYGOR",
  "J Nem": "JEFFERSON NEM",
  "Jeferson C": "JEFERSON",
  "J Costa": "J COSTA",
  "Jonas Toró": "JONAS TORO",
  "Jonathan F": "JONATHAN",
  "Jordan E": "JORDAN",
  "Kelvin G": "KELVIN",
  "L Maciel": "LEANDRO MACIEL",
  "Leo Gamalho": "LEO GAMALHO",
  "M Sales": "MATHEUS SALES",
  "M Maranhao": "MARANHAO",
  "Marco Antonio": "MARCO ANTONIO",
  "Marquinho A": "MARQUINHO JR.",
  "P Brey": "PATRICK BREY",
  "Pedro H": "PEDRINHO",
  "Pedro T": "PEDRO TORTELLO",
  "R Gava": "RAFAEL GAVA",
  "Thalles E": "THALLES",
  "Thiago M": "THIAGUINHO",
  "Victor Souza": "VICTOR SOUZA",
  "Wallace F": "WALLACE",
  "Whalacy W": "WHALACY",
  "Wesley P": "WESLEY",
  "Yuri F": "YURI",
  "Luizao G": "LUIZAO",
  "Ze Hugo": "ZE HUGO",
  "Ruan R": "RUAN",
  "Caua F": "CAUA",
  // Nomes truncados da aba Fisioterapia
  "CARLOS EDUA": "CARLOS EDUARDO",
  "CARLOS EDUARDO": "CARLOS EDUARDO",
  "GUILHERME QU": "GUILHERME QUEIROZ",
  "GUILHERME QUEIROZ": "GUILHERME QUEIROZ",
  "LEANDRO MAC": "LEANDRO MACIEL",
  "LEANDRO MACIEL": "LEANDRO MACIEL",
  "JEFERSON": "JEFFERSON NEM",
  "HENRIQUE TEL": "HENRIQUE TELES",
  "HENRIQUE TELES": "HENRIQUE TELES",
  "MATHEUS SALE": "MATHEUS SALES",
  "MATHEUS SALES": "MATHEUS SALES",
  "MARQUINHO JR": "MARQUINHO JR.",
  "MARQUINHO JR.": "MARQUINHO JR.",
  "VICTOR SOUZA": "VICTOR SOUZA",
  "RAFAEL GAVA": "RAFAEL GAVA",
  "LÉO GAMALHO": "LEO GAMALHO",
  "LEO GAMALHO": "LEO GAMALHO",
  "JOÃO COSTA": "J COSTA",
  "JOAO COSTA": "J COSTA",
  "WALLACE": "WALLACE",
  "JORDAN": "JORDAN",
  "ERICSON": "ERICSON",
  "MARANHAO": "MARANHAO",
  "ERIK": "ERIK",
  "THALLES": "THALLES",
  "JONATHAN": "JONATHAN",
  "ADRIANO": "ADRIANO",
  "BRENNO": "BRENNO",
  "HYGOR": "HYGOR",
  "KELVIN": "KELVIN",
  "PEDRINHO": "PEDRINHO",
  "MORELLI": "MORELLI",
  "WESLEY": "WESLEY",
  "WESLEY PINHEIRO": "WESLEY",
  "Wesley Pinheiro": "WESLEY",
  "YURI": "YURI",
  "LUIZAO": "LUIZAO",
  "LUIZÃO": "LUIZAO",
  "Luizão": "LUIZAO",
  "DARLAN": "DARLAN"
};

function resolveName(sheetName) {
  if (!sheetName) return null;
  const trimmed = sheetName.trim();
  // Busca direta
  if (NAME_MAP[trimmed]) return NAME_MAP[trimmed];
  // Normalizar acentos para comparação
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lower = norm(trimmed);
  for (const [k, v] of Object.entries(NAME_MAP)) {
    if (norm(k) === lower) return v;
  }
  // Fallback: usa o primeiro nome em maiúsculas (sem acentos)
  // Isso garante que "Jonathan Ferreira" → "JONATHAN" (match com P array)
  const firstName = trimmed.split(/\s+/)[0];
  const normalized = (firstName || trimmed).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Verificar se esse primeiro nome existe como valor no NAME_MAP (é um nome válido do P array)
  const isKnown = Object.values(NAME_MAP).includes(normalized);
  if (isKnown) return normalized;
  // Se não é conhecido, retornar nome completo maiúsculo para evitar conflitos
  return trimmed.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ═══════════════════════════════════════════════════════════════════════════════
// Parser CSV robusto (suporta aspas, vírgulas internas, quebras de linha)
// ═══════════════════════════════════════════════════════════════════════════════
function parseCSV(text) {
  // Split em linhas respeitando campos entre aspas (newlines dentro de aspas não quebram)
  const lines = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { current += '""'; i++; }
      else inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = "";
      if (ch === '\r' && text[i + 1] === '\n') i++; // skip \r\n
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (row) => {
    const fields = [];
    let field = "";
    let q = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (q && row[i + 1] === '"') { field += '"'; i++; }
        else q = !q;
      } else if (ch === ',' && !q) {
        fields.push(field.trim());
        field = "";
      } else if ((ch === '\n' || ch === '\r') && q) {
        field += ' '; // newlines inside quotes become spaces
      } else {
        field += ch;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const rawHeaders = parseRow(lines[0]);
  const headers = rawHeaders.map(h =>
    h.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
  );

  const rows = lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => {
      const v = vals[i] || "";
      const num = v.replace(",", ".");
      obj[h] = num !== "" && !isNaN(Number(num)) ? Number(num) : v;
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== "" && v !== 0));

  return { headers, rawHeaders, rows };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Processadores por aba — cada um conhece a estrutura de colunas
// ═══════════════════════════════════════════════════════════════════════════════

// GPS: Colunas conhecidas da planilha
// Atleta, Nº Bloco, Date, Session Title, Split Name, Time (h),
// Distance (km), Sprint Distance 20km/h (m), Sprints 20km/h, Player Load,
// Distance Per Min (m/min), Sprint Distance Per Min (m/min), Top Speed (km/h),
// Sprint Distance 25km/h (km), Sprints 25km/h,
// Acelerações B1-3 (>1), Acelerações B2-3 (>3),
// Desacelerações B1-3 (>1), Desacelerações B2-3 (>3),
// Ações>30Km/h, RHIE, Tempo de Jogo, Tags, Dia da Semana, Semana, Grupo, DPJ
function processGPS(rows) {
  // Agrupar por atleta + data + sessão
  // IMPORTANTE: A planilha GPS tem múltiplos splits por sessão (Total, 1st Half, 2nd Half, etc.)
  // Se existir um split "Total" ou genérico, usar apenas ele (já é a soma).
  // Caso contrário, somar os splits individuais.
  const sessionRows = {};
  const _gpsRawNames = new Set();
  const _gpsResolvedMap = {};
  for (const row of rows) {
    const athlete = row.atleta || row.athlete || "";
    const date = row.date || row.data || "";
    const sessionTitle = row.session_title || "";
    if (!athlete) continue;
    _gpsRawNames.add(athlete);
    _gpsResolvedMap[athlete] = resolveName(athlete);

    const key = `${athlete}||${date}||${sessionTitle}`;
    if (!sessionRows[key]) sessionRows[key] = { athlete, date, sessionTitle, tags: row.tags || "", grupo: row.grupo || "", dpj: row.dpj || "", rows: [] };
    sessionRows[key].rows.push(row);
  }

  const sessions = {};
  for (const [key, sr] of Object.entries(sessionRows)) {
    const splitName = (r) => (r.split_name || r.split || "").toString().toLowerCase().trim();

    // Se há um split "total" ou sessão inteira, usar apenas esse
    let useRows = sr.rows;
    const totalRow = sr.rows.find(r => {
      const sn = splitName(r);
      return sn === "" || sn === "total" || sn === "session" || sn === "match" || sn === "sessão" || sn === "sessao" || sn === "jogo";
    });
    if (totalRow && sr.rows.length > 1) {
      // Existe uma linha "Total" + splits individuais → usar só o Total
      useRows = [totalRow];
    }

    // Detectar se atleta está em transição REAL
    // Splits como "3-Analit Transição" são exercícios do treino (têm número na frente) — NÃO é transição
    // Splits como "Transição T2" (sem número na frente) = transição real, atleta não fez sessão inteira
    const allSplitNames = sr.rows.map(r => splitName(r)).filter(Boolean);
    const hasRealTransition = allSplitNames.some(sn => sn.includes("transi") && !/^\d+[-.]/.test(sn.trim()));
    // Se há um totalRow, o atleta fez a sessão completa
    const isTransicao = hasRealTransition && !totalRow;
    // Detectar split principal para exibição
    const splitPrincipal = allSplitNames.length ? allSplitNames[0] : "";

    // Extrair métricas de cada split individual para análise temporal
    const extractRowMetrics = (row) => {
      const dist_km = toNum(row.distance__km_) || toNum(row.distance_km) || 0;
      const hsr_m = toNum(row.sprint_distance_20km_h__m_) || toNum(row.sprint_distance_20km_h_m) || 0;
      const sprints = toNum(row.sprints_20km_h) || 0;
      const pl = toNum(row.player_load) || 0;
      const spd = toNum(row.top_speed__km_h_) || toNum(row.top_speed_km_h) || 0;
      const acel = toNum(row.aceleracoes_b1_3__1_) || toNum(row.aceleracoes_b1_3_1) || 0;
      const decel = toNum(row.desaceleracoes_b1_3__1_) || toNum(row.desaceleracoes_b1_3_1) || 0;
      const hrAvg = toNum(row.average_heart_rate_bpm) || toNum(row.average_heart_rate__bpm_) || toNum(row.hr_avg) || toNum(row.fc_media) || toNum(row.fc_med) || 0;
      const hrMax = toNum(row.max_heart_rate_bpm) || toNum(row.max_heart_rate__bpm_) || toNum(row.hr_max) || toNum(row.fc_maxima) || toNum(row.fc_max) || 0;
      return { dist: Math.round(dist_km * 1000), hsr: Math.round(hsr_m), sprints: Math.round(sprints), pl: Math.round(pl * 100) / 100, top_speed: Math.round(spd * 10) / 10, acel: Math.round(acel), decel: Math.round(decel), hr_avg: Math.round(hrAvg), hr_max: Math.round(hrMax) };
    };

    // Guardar dados detalhados por split (para análise temporal em jogos)
    const splitsDetail = sr.rows.map(r => {
      const sn = splitName(r);
      const bloco = toNum(r.n__bloco || r.no_bloco || r.bloco || r.n_bloco) || 0;
      return { split: sn, bloco, ...extractRowMetrics(r) };
    }).filter(sd => sd.split);

    sessions[key] = {
      athlete: sr.athlete,
      dashName: resolveName(sr.athlete),
      date: sr.date,
      sessionTitle: sr.sessionTitle,
      tags: sr.tags,
      grupo: sr.grupo,
      dpj: sr.dpj,
      isTransicao,
      splitPrincipal,
      allSplits: allSplitNames,
      splitsDetail,
      dist_km: 0, hsr_20_m: 0, sprints_20: 0, player_load: 0, top_speed: 0,
      hsr_25_km: 0, sprints_25: 0, acel_b1: 0, acel_b2: 0, decel_b1: 0, decel_b2: 0,
      acoes_30: 0, rhie: 0, dist_per_min: 0, hr_avg: 0, hr_max: 0, hr_exertion: 0,
      time_z4: 0, time_z5: 0, splits: 0, time_total_sec: 0
    };
    const s = sessions[key];
    for (const row of useRows) {
      s.dist_km += toNum(row.distance__km_) || toNum(row.distance_km) || 0;
      s.hsr_20_m += toNum(row.sprint_distance_20km_h__m_) || toNum(row.sprint_distance_20km_h_m) || 0;
      s.sprints_20 += toNum(row.sprints_20km_h) || 0;
      s.player_load += toNum(row.player_load) || 0;
      const spd = toNum(row.top_speed__km_h_) || toNum(row.top_speed_km_h) || 0;
      if (spd > s.top_speed) s.top_speed = spd;
      s.hsr_25_km += toNum(row.sprint_distance_25km_h__km_) || toNum(row.sprint_distance_25km_h_km) || 0;
      s.sprints_25 += toNum(row.sprints_25km_h) || 0;
      s.acel_b1 += toNum(row.aceleracoes_b1_3__1_) || toNum(row.aceleracoes_b1_3_1) || 0;
      s.acel_b2 += toNum(row.aceleracoes_b2_3__3_) || toNum(row.aceleracoes_b2_3_3) || 0;
      s.decel_b1 += toNum(row.desaceleracoes_b1_3__1_) || toNum(row.desaceleracoes_b1_3_1) || 0;
      s.decel_b2 += toNum(row.desaceleracoes_b2_3__3_) || toNum(row.desaceleracoes_b2_3_3) || 0;
      s.acoes_30 += toNum(row.acoes_30km_h) || 0;
      s.rhie += toNum(row.rhie) || 0;
      const hrAvg = toNum(row.average_heart_rate_bpm) || toNum(row.average_heart_rate__bpm_) || toNum(row.hr_avg) || toNum(row.fc_media) || toNum(row.fc_med) || 0;
      const hrMax = toNum(row.max_heart_rate_bpm) || toNum(row.max_heart_rate__bpm_) || toNum(row.hr_max) || toNum(row.fc_maxima) || toNum(row.fc_max) || 0;
      if (hrAvg > s.hr_avg) s.hr_avg = hrAvg;
      if (hrMax > s.hr_max) s.hr_max = hrMax;
      s.hr_exertion += toNum(row.heart_rate_exertion) || toNum(row.hr_exertion) || 0;
      s.time_z4 += toNum(row.time_in_hr_zone_4) || toNum(row.time_in_hr_zone_4__min_) || toNum(row.tempo_zona_4) || toNum(row.tempo_z4) || 0;
      s.time_z5 += toNum(row.time_in_hr_zone_5) || toNum(row.time_in_hr_zone_5__min_) || toNum(row.tempo_zona_5) || toNum(row.tempo_z5) || 0;
      s.splits++;
    }
  }

  // Converter para formato do dashboard
  const result = {};
  for (const s of Object.values(sessions)) {
    if (!s.dashName) continue;
    if (!result[s.dashName]) result[s.dashName] = [];
    result[s.dashName].push({
      date: s.date,
      sessionTitle: s.sessionTitle,
      tags: s.tags,
      grupo: s.grupo,
      dpj: s.dpj,
      isTransicao: s.isTransicao || false,
      splitPrincipal: s.splitPrincipal || "",
      allSplits: s.allSplits || [],
      splitsDetail: s.splitsDetail || [],
      gps: {
        dist_total: Math.round(s.dist_km * 1000), // km → m
        hsr: Math.round(s.hsr_20_m),
        sprints: Math.round(s.sprints_20),
        player_load: Math.round(s.player_load * 100) / 100,
        pico_vel: Math.round(s.top_speed * 10) / 10,
        acel: Math.round(s.acel_b1),  // B1 (>2 m/s²) = Acel>2 da planilha
        acel_3: Math.round(s.acel_b2),  // B2 (>3 m/s²)
        decel: Math.round(s.decel_b1),  // B1 (>2 m/s²) = Decel>2 da planilha
        decel_3: Math.round(s.decel_b2),  // B2 (>3 m/s²)
        hsr_25: Math.round(s.hsr_25_km * 1000),
        sprints_25: Math.round(s.sprints_25),
        acoes_30: Math.round(s.acoes_30),
        rhie: Math.round(s.rhie),
        dist_per_min: 0,
        hr_avg: Math.round(s.hr_avg),
        hr_max: Math.round(s.hr_max),
        tempo_zona_alta: Math.round((s.time_z4 + s.time_z5) * 10) / 10
      }
    });
  }

  // Calcular baselines (média das últimas 4 semanas / 21 dias para cada atleta)
  for (const [name, entries] of Object.entries(result)) {
    // Ordenar por data (parsing robusto para DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    const parseDate = (d) => {
      if (!d) return 0;
      const s = String(d).trim();
      // YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime();
      // DD/MM/YYYY ou D/M/YYYY
      const parts = s.split(/[\/\-\.]/);
      if (parts.length >= 3) {
        const [a, b, c] = parts.map(Number);
        if (a > 31) return new Date(a, b - 1, c).getTime(); // YYYY/MM/DD
        if (c > 31) return new Date(c, b - 1, a).getTime(); // DD/MM/YYYY
        return new Date(c, a - 1, b).getTime(); // MM/DD/YYYY fallback
      }
      return new Date(s).getTime() || 0;
    };
    entries.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const len = entries.length;
    if (len < 2) continue;

    // Baseline = média de todas as sessões exceto a última
    const baseline = entries.slice(0, -1);
    const avg = (arr, key) => {
      const vals = arr.map(e => e.gps[key]).filter(v => v > 0);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };
    const avgF = (arr, key) => {
      const vals = arr.map(e => e.gps[key]).filter(v => v > 0);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0;
    };

    const last = entries[len - 1];
    last.gps.dist_baseline = avg(baseline, "dist_total");
    last.gps.hsr_baseline = avg(baseline, "hsr");
    last.gps.sprints_baseline = avg(baseline, "sprints");
    last.gps.acel_baseline = avg(baseline, "acel");
    last.gps.decel_baseline = avg(baseline, "decel");
    last.gps.pico_vel_baseline = avgF(baseline, "pico_vel");
    last.gps.hr_baseline_avg = avg(baseline, "hr_avg");
    last.gps.tempo_zona_alta_baseline = avgF(baseline, "tempo_zona_alta");
  }

  result._nameDebug = { rawNames: [..._gpsRawNames], resolvedMap: _gpsResolvedMap };
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// GPS_INDIVIDUAL (aba nova — long format, 1 linha por atleta/sessão).
// Fonte da verdade do GPS do elenco atual. Substitui processGPS em tab=all.
// Colunas conhecidas:
//   Atleta, Data, Duração (min), Distância (metros),
//   Distância > 20 km/h (metros), Números de Sprint > 20 km/h,
//   Distância > 25 km/h (metros), Números de Sprint > 25 km/h,
//   Ações de Acc > 2m/s, Ações de Acc > 3m/s,
//   Ações de Dcc > 2 m/s, Ações de Dcc > 3 m/s,
//   Player Load, Max Vel (km/h), FC Max, RHIE, PE, LOCAL, RESULTADO, OBS.
// Limiares aqui já são 20 km/h (HSR) e 25 km/h (sprint "verdadeiro").
// Linhas de agregado semanal (Data = "SEMANA N") vão para bucket _weekly.
// ─────────────────────────────────────────────────────────────────────────────
function processGPSIndividual(rows) {
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

  // Colunas normalizadas (headers passam por lower + deaccent + non-alnum→_ + collapse _)
  const col = (row, ...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== "") return row[k];
    }
    return undefined;
  };

  const result = {};
  const weekly = {};
  const _rawNames = new Set();
  const _resolvedMap = {};
  let _weekSkipped = 0;
  let _noAthleteSkipped = 0;

  for (const row of rows) {
    const athleteRaw = col(row, "atleta", "athlete", "atletas");
    if (!athleteRaw) { _noAthleteSkipped++; continue; }
    const athlete = String(athleteRaw).trim();
    if (!athlete) { _noAthleteSkipped++; continue; }

    const dateVal = col(row, "data", "date");
    const dateStr = dateVal === undefined ? "" : String(dateVal).trim();

    _rawNames.add(athlete);
    const dashName = resolveName(athlete);
    _resolvedMap[athlete] = dashName;
    if (!dashName) continue;

    // Linha de agregado semanal: "SEMANA N", "Semana 3", etc.
    if (/^semana\b/i.test(dateStr)) {
      if (!weekly[dashName]) weekly[dashName] = [];
      weekly[dashName].push({
        periodo: dateStr,
        duracao:     toNum(col(row, "duracao_min", "duracao")),
        dist_total:  Math.round(toNum(col(row, "distancia_metros", "distance_m", "distancia"))),
        hsr:         Math.round(toNum(col(row, "distancia_20_km_h_metros", "distancia_20_km_h", "hsr"))),
        sprints:     Math.round(toNum(col(row, "numeros_de_sprint_20_km_h", "sprints_20km_h", "sprints"))),
        dist_25:     Math.round(toNum(col(row, "distancia_25_km_h_metros", "distancia_25_km_h"))),
        sprints_25:  Math.round(toNum(col(row, "numeros_de_sprint_25_km_h", "sprints_25km_h"))),
        acel:        Math.round(toNum(col(row, "acoes_de_acc_2m_s", "acoes_de_acc_2_m_s"))),
        acel_3:      Math.round(toNum(col(row, "acoes_de_acc_3m_s", "acoes_de_acc_3_m_s"))),
        decel:       Math.round(toNum(col(row, "acoes_de_dcc_2_m_s", "acoes_de_dcc_2m_s"))),
        decel_3:     Math.round(toNum(col(row, "acoes_de_dcc_3_m_s", "acoes_de_dcc_3m_s"))),
        player_load: Math.round(toNum(col(row, "player_load")) * 100) / 100,
        pico_vel:    Math.round(toNum(col(row, "max_vel_km_h", "top_speed_km_h", "top_speed__km_h_")) * 10) / 10,
        hr_max:      Math.round(toNum(col(row, "fc_max", "hr_max")))
      });
      _weekSkipped++;
      continue;
    }

    const duracao    = toNum(col(row, "duracao_min", "duracao"));
    const dist_total = toNum(col(row, "distancia_metros", "distance_m", "distancia"));
    const hsr        = toNum(col(row, "distancia_20_km_h_metros", "distancia_20_km_h", "hsr"));
    const sprints    = toNum(col(row, "numeros_de_sprint_20_km_h", "sprints_20km_h", "sprints"));
    const dist_25    = toNum(col(row, "distancia_25_km_h_metros", "distancia_25_km_h"));
    const sprints_25 = toNum(col(row, "numeros_de_sprint_25_km_h", "sprints_25km_h"));
    const acel       = toNum(col(row, "acoes_de_acc_2m_s", "acoes_de_acc_2_m_s"));
    const acel_3     = toNum(col(row, "acoes_de_acc_3m_s", "acoes_de_acc_3_m_s"));
    const decel      = toNum(col(row, "acoes_de_dcc_2_m_s", "acoes_de_dcc_2m_s"));
    const decel_3    = toNum(col(row, "acoes_de_dcc_3_m_s", "acoes_de_dcc_3m_s"));
    const pLoad      = toNum(col(row, "player_load"));
    const picoVel    = toNum(col(row, "max_vel_km_h", "top_speed_km_h", "top_speed__km_h_"));
    const hrMax      = toNum(col(row, "fc_max", "hr_max"));
    const rhie       = toNum(col(row, "rhie"));
    const pse        = toNum(col(row, "pe", "pse"));

    // Linhas placeholder (atleta preenchido, mas sem dado de sessão) não contam
    // como sessão. A planilha carrega o calendário completo por atleta, então
    // dias sem treino aparecem com todas as colunas de carga vazias.
    if (duracao <= 0 && dist_total <= 0 && pLoad <= 0 && hsr <= 0 && sprints <= 0 && pse <= 0) {
      continue;
    }

    const localV     = col(row, "local") || "";
    const resultado  = col(row, "resultado") || "";
    const obs        = col(row, "obs") || "";

    // sessionTitle compatível com matchesOpponent* / isMatchTitle do Dashboard:
    //   - se há RESULTADO, marca como "Jogo" para isMatchTitle acertar
    //   - anexa OBS para que matchesOpp (substring) acerte o adversário
    let sessionTitle = "";
    if (String(resultado).trim()) {
      const piece = String(obs).trim();
      sessionTitle = piece ? `Jogo ${piece} (${String(resultado).trim()})` : `Jogo (${String(resultado).trim()})`;
    } else if (String(obs).trim()) {
      sessionTitle = String(obs).trim();
    }

    if (!result[dashName]) result[dashName] = [];
    result[dashName].push({
      date: dateStr,
      sessionTitle,
      tags: "",
      grupo: "",
      dpj: "",
      isTransicao: false,
      splitPrincipal: "",
      allSplits: [],
      splitsDetail: [],
      local: String(localV),
      resultado: String(resultado),
      obs: String(obs),
      pse: Math.round(pse * 10) / 10,
      duracao: Math.round(duracao),
      gps: {
        dist_total: Math.round(dist_total),
        hsr: Math.round(hsr),
        sprints: Math.round(sprints),
        player_load: Math.round(pLoad * 100) / 100,
        pico_vel: Math.round(picoVel * 10) / 10,
        acel: Math.round(acel),
        acel_3: Math.round(acel_3),
        decel: Math.round(decel),
        decel_3: Math.round(decel_3),
        hsr_25: Math.round(dist_25),
        sprints_25: Math.round(sprints_25),
        acoes_30: 0,
        rhie: Math.round(rhie),
        dist_per_min: duracao > 0 ? Math.round(dist_total / duracao) : 0,
        // Campos inexistentes na nova aba — mantidos como null para o Dashboard
        // renderizar "—" em vez de 0 (falso-zero).
        hr_avg: null,
        hr_max: hrMax > 0 ? Math.round(hrMax) : null,
        tempo_zona_alta: null
      }
    });
  }

  // Ordenar por data asc e calcular baselines (média móvel 14d antes da última sessão)
  for (const [name, entries] of Object.entries(result)) {
    entries.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const len = entries.length;
    if (len < 2) continue;

    const last = entries[len - 1];
    const lastTs = parseDate(last.date);
    const WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
    let baseline = entries.slice(0, -1).filter(e => {
      const ts = parseDate(e.date);
      return ts > 0 && (lastTs - ts) <= WINDOW_MS;
    });
    // Fallback: se não há dados nos últimos 14d, usa todas as entradas anteriores
    if (!baseline.length) baseline = entries.slice(0, -1);

    const avg = (arr, key) => {
      const vals = arr.map(e => e.gps[key]).filter(v => v !== null && v !== undefined && v > 0);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };
    const avgF = (arr, key) => {
      const vals = arr.map(e => e.gps[key]).filter(v => v !== null && v !== undefined && v > 0);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0;
    };

    last.gps.dist_baseline      = avg(baseline, "dist_total");
    last.gps.hsr_baseline       = avg(baseline, "hsr");
    last.gps.sprints_baseline   = avg(baseline, "sprints");
    last.gps.hsr_25_baseline    = avg(baseline, "hsr_25");
    last.gps.sprints_25_baseline= avg(baseline, "sprints_25");
    last.gps.acel_baseline      = avg(baseline, "acel");
    last.gps.decel_baseline     = avg(baseline, "decel");
    last.gps.pico_vel_baseline  = avgF(baseline, "pico_vel");
    // HR e zona alta não existem nessa fonte
    last.gps.hr_baseline_avg           = null;
    last.gps.tempo_zona_alta_baseline  = null;
  }

  result._weekly = weekly;
  result._nameDebug = {
    rawNames: [..._rawNames],
    resolvedMap: _resolvedMap,
    weekSkipped: _weekSkipped,
    noAthleteSkipped: _noAthleteSkipped
  };
  return result;
}

// Diário: PSE, Duração, sPE, CK, Peso
// Colunas: Data, Semana, Dia_da_Semana, Periodo, Atletas, Posição, Grupo,
// Atividade, DPJ, JNS, Local, Tags, Partida, PSE, Duração, sPE,
// Peso Pré, Peso Pós, Dif, CK, CK Basal, % CK Basal, CK Media, %CK Media, CK Máx
function processDiario(rows) {
  const result = {};
  for (const row of rows) {
    const athlete = row.atletas || "";
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;

    if (!result[name]) result[name] = [];
    result[name].push({
      date: row.data || "",
      semana: toNum(row.semana) || 0,
      dia: row.dia_da_semana || "",
      periodo: row.periodo || "",
      atividade: row.atividade || "",
      dpj: toNum(row.dpj) || 0,
      local: row.local || "",
      tags: row.tags || "",
      partida: row.partida || "",
      pse: toNum(row.pse) || 0,
      duracao: toNum(row.duracao) || 0,
      spe: toNum(row.spe) || 0,
      peso_pre: toNum(row.peso_pre) || 0,
      peso_pos: toNum(row.peso_pos) || 0,
      ck: toNum(row.ck) || 0,
      ck_basal: toNum(row.ck_basal) || 0
    });
  }
  return result;
}

// Saltos: CMJ, SJ, assimetria
function processSaltos(rows) {
  const result = {};
  for (const row of rows) {
    const athlete = row.atletas || "";
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;

    if (!result[name]) result[name] = [];
    result[name].push({
      date: row.data || "",
      tag: row.tag || "",
      cmj_1: toNum(row.cmj_1) || 0,
      cmj_2: toNum(row.cmj_2) || 0,
      cmj_3: toNum(row.cmj_3) || 0,
      sj_1: toNum(row.sj_1) || 0,
      sj_2: toNum(row.sj_2) || 0,
      sj_3: toNum(row.sj_3) || 0,
      cmjd_1: toNum(row.cmjd_1) || 0,
      cmjd_2: toNum(row.cmjd_2) || 0,
      cmjd_3: toNum(row.cmjd_3) || 0,
      cmje_1: toNum(row.cmje_1) || 0,
      cmje_2: toNum(row.cmje_2) || 0,
      cmje_3: toNum(row.cmje_3) || 0,
      media_cmj: toNum(row.media_cmj) || 0,
      media_sj: toNum(row.media_sj) || 0,
      media_d: toNum(row.media_d) || 0,
      media_e: toNum(row.media_e) || 0,
      simetria: toNum(row.simetria_d_e____) || 0
    });
  }
  return result;
}

// Questionários: wellness (sono, dor, recuperação)
// Helper: busca valor por substring no nome da coluna (headers já normalizados)
function findCol(row, ...substrings) {
  for (const sub of substrings) {
    // Busca exata primeiro
    if (row[sub] !== undefined && row[sub] !== "") return row[sub];
  }
  // Busca por substring nas chaves
  const keys = Object.keys(row);
  for (const sub of substrings) {
    const found = keys.find(k => k.includes(sub));
    if (found && row[found] !== undefined && row[found] !== "") return row[found];
  }
  return "";
}

function processQuestionarios(rows) {
  const result = {};
  const _rawNames = new Set();
  const _resolvedMap = {};
  for (const row of rows) {
    const athlete = findCol(row, "nome_", "nome") || "";
    if (!athlete) continue;
    _rawNames.add(athlete);
    const name = resolveName(athlete);
    if (!name) continue;
    _resolvedMap[athlete] = name;

    if (!result[name]) result[name] = [];

    // Recuperação geral: "sua recuperação" ou "recuperacao_geral"
    const recGeral = toNum(findCol(row, "sua_recuperacao", "recuperacao_geral", "como_esta_sua_recuperacao"));
    // Recuperação pernas: "recuperação nas pernas" ou similar
    const recPernas = toNum(findCol(row, "recuperacao_nas_pernas", "pernas"));
    // Dor: "presença de dor" ou similar
    const dor = toNum(findCol(row, "presenca_de_dor", "presenca_de_d", "dor"));
    // Sono qualidade: "qualidade do sono" ou "sono" ou "como dormiu"
    const sonoQual = toNum(findCol(row, "qualidade_subjetiva_do_sono", "qualidade_do_sono", "como_dormiu", "sono"));
    // Sono horas
    const sonoHoras = toNum(findCol(row, "horas_de_sono", "quantas_horas"));
    // Peso
    const peso = toNum(findCol(row, "seu_peso_hoje", "peso_hoje", "peso"));
    // Estado geral: "como se sente hoje"
    const estado = findCol(row, "como_se_sente_hoje", "como_voce_se_sente_hoje") || "";
    // Humor / disposição: "você se sente" (pode haver 2 colunas)
    const humor = findCol(row, "voce_se_sente");
    // Dores regionais (braços, costas, quadris, coxa)
    const dorBracos = toNum(findCol(row, "bracos_e_omb", "bracos"));
    const dorCostas = toNum(findCol(row, "costas_e_colu", "costas"));
    const dorQuadris = toNum(findCol(row, "quadris_glut", "quadris"));
    const dorCoxa = toNum(findCol(row, "coxa_ant", "coxa"));

    result[name].push({
      date: findCol(row, "data_", "data", "carimbo", "timestamp", "data_hora") || "",
      peso,
      estado,
      humor: humor || "",
      recuperacao_geral: recGeral || 0,
      recuperacao_pernas: recPernas || 0,
      dor: dor || 0,
      dor_bracos: dorBracos || 0,
      dor_costas: dorCostas || 0,
      dor_quadris: dorQuadris || 0,
      dor_coxa: dorCoxa || 0,
      sono_qualidade: sonoQual || 0,
      sono_horas: sonoHoras || 0
    });
  }
  result._nameDebug = { rawNames: [..._rawNames], resolvedMap: _resolvedMap };
  return result;
}

// Fisioterapia: Referência, Texto, Data, Período, Nome, Horário Chegada, Horário Saída, Procedimento, Responsável
function processFisioterapia(rows) {
  const result = {};
  // Helper: busca valor por múltiplas chaves possíveis ou substring
  const findVal = (row, ...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== "") return row[k];
    }
    // Fallback: busca por substring nas keys do row
    const rowKeys = Object.keys(row);
    for (const k of keys) {
      const match = rowKeys.find(rk => rk.includes(k));
      if (match && row[match] !== undefined && row[match] !== "") return row[match];
    }
    return "";
  };

  for (const row of rows) {
    const athlete = findVal(row, "nome", "nome_", "atleta", "atletas");
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;

    if (!result[name]) result[name] = [];

    const chegada = findVal(row, "horario_de_chegada", "horario_chegada", "chegada", "hora_chegada");
    const saida = findVal(row, "horario_de_saida", "horario_saida", "saida", "hora_saida");

    result[name].push({
      date: findVal(row, "data", "data_", "carimbo", "timestamp"),
      periodo: findVal(row, "periodo", "periodo_"),
      chegada: String(chegada).slice(0, 5),
      saida: String(saida).slice(0, 5),
      procedimento: findVal(row, "procedimento", "procedimentos", "proc"),
      responsavel: findVal(row, "responsavel", "responsavel_", "fisioterapeuta", "fisio"),
      referencia: findVal(row, "referencia", "referencia_", "ref")
    });
  }
  return result;
}

// Antropometria: composição corporal (peso, % gordura, massa muscular)
function processAntropometria(rows) {
  const result = {};
  if (rows.length > 0) {
    result._colDebug = Object.keys(rows[0]);
    result._sampleRow = rows[0];
  }
  for (const row of rows) {
    const athlete = findCol(row, "nome", "atleta", "atletas", "jogador") || "";
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;
    if (!result[name]) result[name] = [];
    result[name].push({
      date: findCol(row, "data", "data_", "carimbo") || "",
      peso: toNum(findCol(row, "peso", "peso_kg", "massa_corporal")),
      gordura: toNum(findCol(row, "gordura", "percentual_de_gordura", "bf", "gordura_corporal", "gordura_%")),
      massa_muscular: toNum(findCol(row, "massa_muscular", "massa_magra", "musculo")),
      imc: toNum(findCol(row, "imc", "indice_de_massa")),
      altura: toNum(findCol(row, "altura", "estatura")),
      perimetros: findCol(row, "perimetros", "observacoes") || ""
    });
  }
  return result;
}

// Lesões: Histórico de lesões do elenco (planilha externa)
function processLesoes(rows) {
  const result = [];
  for (const row of rows) {
    // Flexível: busca nome por múltiplas colunas possíveis
    const athlete = row.nome || row.atleta || row.atletas || row.jogador || row.name || "";
    if (!athlete) continue;
    const name = resolveName(athlete);

    // Busca data por múltiplas colunas
    const findField = (row, ...keys) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== "") return row[k];
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const match = rowKeys.find(rk => rk.includes(k));
        if (match && row[match] !== undefined && row[match] !== "") return row[match];
      }
      return "";
    };

    const dateStr = findField(row, "data_lesao", "data_da_lesao", "data", "date", "data_inicio", "inicio");
    const saidaDm = findField(row, "saida_dm", "saida_do_dm", "data_saida", "saida");
    const iniTrans = findField(row, "inicio_transicao", "ini_trans", "ini_transicao", "data_transicao", "transicao");
    const fimTrans = findField(row, "fim_transicao", "fim_trans", "data_retorno", "retorno", "data_fim", "fim", "alta");
    const prognostico = findField(row, "prognostico", "previsao", "previsao_retorno", "data_prognostico");

    result.push({
      n: name,
      pos: findField(row, "posicao", "pos", "position") || "",
      date: dateStr,
      saida_dm: saidaDm,
      ini_trans: iniTrans,
      fim_trans: fimTrans,
      dias_dm: toNum(findField(row, "dias_dm", "dias_afastado", "dias_departamento_medico")),
      dias_trans: toNum(findField(row, "dias_trans", "dias_transicao")),
      total: toNum(findField(row, "total", "total_dias", "dias_total")),
      classif: findField(row, "classificacao", "classif", "grau", "gravidade", "tipo") || "",
      regiao: findField(row, "regiao", "regiao_lesao", "local", "area") || "",
      lado: findField(row, "lado", "lateralidade") || "",
      evento: findField(row, "evento", "contexto", "momento", "atividade") || "",
      mecanismo: findField(row, "mecanismo", "mecanismo_lesao", "causa") || "",
      estrutura: findField(row, "estrutura", "estrutura_lesada", "musculo", "tecido") || "",
      exame: findField(row, "exame", "exame_complementar", "diagnostico_exame") || "",
      estagio: findField(row, "estagio", "fase", "fase_atual", "status") || "",
      conduta: findField(row, "conduta", "conduta_atual", "tratamento") || "",
      prognostico: prognostico,
      obs: findField(row, "observacao", "obs", "observacoes", "notas", "nota") || ""
    });
  }
  return result;
}

// CMJ Externo: dados de salto contra-movimento (planilha externa)
function processCmjExterno(rows) {
  const result = {};
  for (const row of rows) {
    const athlete = row.atleta || row.atletas || row.nome || row.jogador || "";
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;

    if (!result[name]) result[name] = [];

    const findField = (row, ...keys) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== "") return row[k];
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const match = rowKeys.find(rk => rk.includes(k));
        if (match && row[match] !== undefined && row[match] !== "") return row[match];
      }
      return "";
    };

    result[name].push({
      date: findField(row, "data", "date", "data_avaliacao"),
      cmj: toNum(findField(row, "cmj", "cmj_cm", "altura_cmj", "counter_movement_jump")),
      cmj_1: toNum(findField(row, "cmj_1", "tentativa_1", "jump_1")),
      cmj_2: toNum(findField(row, "cmj_2", "tentativa_2", "jump_2")),
      cmj_3: toNum(findField(row, "cmj_3", "tentativa_3", "jump_3")),
      nordico: toNum(findField(row, "nordico", "nordic", "nordic_hamstring", "nordico_cm", "forca_nordico")),
      nordico_d: toNum(findField(row, "nordico_d", "nordic_d", "nordico_direito")),
      nordico_e: toNum(findField(row, "nordico_e", "nordic_e", "nordico_esquerdo")),
      tag: findField(row, "tag", "tags", "tipo", "momento") || ""
    });
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Calendário de Jogos — processa aba "Calendário" com dados de jogos
// Colunas: Comp, Rodada, Data, Adversário, escudo, Local
// ═══════════════════════════════════════════════════════════════════════════════
function processCalendario(rows) {
  const result = [];
  for (const row of rows) {
    const findField = (row, ...keys) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== "") return row[k];
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const match = rowKeys.find(rk => rk.toLowerCase().includes(k.toLowerCase()));
        if (match && row[match] !== undefined && row[match] !== "") return row[match];
      }
      return "";
    };

    const comp = findField(row, "comp", "competicao", "competição", "campeonato", "torneio");
    const rodada = findField(row, "rodada", "rod", "round", "jornada");
    const data = findField(row, "data", "date", "dia");
    const adversario = findField(row, "adversario", "adversário", "opponent", "oponente", "adv");
    const escudo = findField(row, "escudo", "logo", "badge", "img", "imagem", "shield");
    const local = findField(row, "local", "mando", "home_away", "casa_fora", "venue");
    const resultado = findField(row, "res", "resultado", "result");
    const placarRaw = findField(row, "placar", "score_full");
    const golsMarcados = findField(row, "gols_marcados", "gols marcados", "goals_scored", "gm");
    const golsSofridos = findField(row, "gols_sofridos", "gols sofridos", "goals_conceded", "gs");

    // Usar colunas "Gols marcados" e "Gols sofridos" se disponíveis, senão parsear Placar
    let gols_pro = "", gols_contra = "";
    if (golsMarcados !== "" || golsSofridos !== "") {
      gols_pro = String(golsMarcados).trim();
      gols_contra = String(golsSofridos).trim();
    } else if (placarRaw) {
      const parts = String(placarRaw).split(/[:xX×]/);
      if (parts.length === 2) {
        gols_pro = parts[0].trim();
        gols_contra = parts[1].trim();
      }
    }

    if (!adversario && !data) continue;

    result.push({ comp, rodada, data, adversario, escudo, local, resultado, gols_pro, gols_contra });
  }
  return result;
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Fetch CSV de uma aba da planilha (3 estratégias de fallback)
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchSheetCSV(gid = 0) {
  const errors = [];

  // Estratégia 1: URL publicada (pub CSV)
  try {
    const pubUrl = `https://docs.google.com/spreadsheets/d/e/${SHEETS_CONFIG.published_key}/pub?gid=${gid}&single=true&output=csv`;
    const res = await fetch(pubUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes("<!DOCTYPE")) return text;
    }
  } catch (e) { errors.push(`pub: ${e.message}`); }

  // Estratégia 2: Export direto
  for (const id of SHEETS_CONFIG.spreadsheet_ids) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE")) return text;
      }
    } catch (e) { errors.push(`export(${id}): ${e.message}`); }
  }

  // Estratégia 3: Google Visualization API
  for (const id of SHEETS_CONFIG.spreadsheet_ids) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE")) return text;
      }
    } catch (e) { errors.push(`gviz(${id}): ${e.message}`); }
  }

  throw new Error(`Falha ao buscar planilha (gid=${gid}). Tentativas: ${errors.join("; ")}`);
}

// Fetch CSV de planilha externa (publicada separadamente)
async function fetchExternalCSV(config, gid) {
  gid = gid ?? config.gid ?? 0;
  const errors = [];

  // Se tem URL direta de CSV
  if (config.csv_url) {
    try {
      const res = await fetch(config.csv_url, { next: { revalidate: 60 } });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE")) return text;
      }
    } catch (e) { errors.push(`csv_url: ${e.message}`); }
  }

  // Via published key
  if (config.published_key) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/e/${config.published_key}/pub?gid=${gid}&single=true&output=csv`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE")) return text;
      }
    } catch (e) { errors.push(`pub: ${e.message}`); }
  }

  // Via spreadsheet_id export
  if (config.spreadsheet_id) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${config.spreadsheet_id}/export?format=csv&gid=${gid}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE")) return text;
      }
    } catch (e) { errors.push(`export: ${e.message}`); }

    try {
      const url = `https://docs.google.com/spreadsheets/d/${config.spreadsheet_id}/gviz/tq?tqx=out:csv&gid=${gid}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE")) return text;
      }
    } catch (e) { errors.push(`gviz: ${e.message}`); }
  }

  throw new Error(`Falha ao buscar planilha externa. Tentativas: ${errors.join("; ")}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sheets?tab=gps|diario|saltos|questionarios|all&date=YYYY-MM-DD
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// Parâmetro de Ordem Ψ(t) — Fase 1 (Fonseca 2020)
//
// Ψ(t) é a 1ª componente principal (PC1) de um conjunto de features
// padronizadas por atleta/dia cobrindo: carga externa (GPS), carga interna
// (PSE/sRPE), neuromuscular (CMJ) e wellness (sono, dor, recuperação).
//
// PCA é resolvido via power iteration sobre a matriz de covariância pooled
// (todos os atletas no mesmo espaço). O sinal de PC1 é orientado para que Ψ
// cresça com indicadores de risco (carga e dor ↑, CMJ e sono ↓). Cada
// ponto da série Ψ(t) é retornado com a data original do gps, mais uma
// baseline individual (média móvel 28d) e desvio-padrão individual.
// ═══════════════════════════════════════════════════════════════════════════════

// Lista de features canônicas usadas para compor Ψ(t). Sinal esperado
// indica a direção associada a "risco" (será usado para orientar PC1).
const PSI_FEATURES = [
  { key: "dist_total",  src: "gps",   sign: +1 },
  { key: "hsr",         src: "gps",   sign: +1 },
  { key: "sprints",     src: "gps",   sign: +1 },
  { key: "player_load", src: "gps",   sign: +1 },
  { key: "pico_vel",    src: "gps",   sign: +1 },
  { key: "pse",         src: "day",   sign: +1 }, // do gps_individual ou diário
  { key: "srpe",        src: "day",   sign: +1 },
  { key: "cmj",         src: "day",   sign: -1 }, // CMJ alto = bom
  { key: "sono",        src: "day",   sign: -1 }, // Sono alto = bom
  { key: "dor",         src: "day",   sign: +1 },
  { key: "rec",         src: "day",   sign: -1 }, // Recuperação alta = bom
];

function psiParseDate(d) {
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
}

function psiDayKey(d) {
  const ts = psiParseDate(d);
  if (!ts) return "";
  const dt = new Date(ts);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

// Monta a matriz de features: uma linha por atleta/sessão GPS, colunas fixas
// por PSI_FEATURES. Valores ausentes são NaN; linhas com muitos NaN são
// descartadas (mínimo 70% de cobertura).
function buildPsiMatrix({ gps, diario, questionarios, saltos }) {
  const rows = [];
  const atletas = Object.keys(gps || {});
  const featKeys = PSI_FEATURES.map(f => f.key);

  for (const name of atletas) {
    // Index auxiliar por dia
    const diarioByDay = {};
    for (const e of (diario?.[name] || [])) {
      const k = psiDayKey(e.date);
      if (k) diarioByDay[k] = e;
    }
    const questByDay = {};
    for (const e of (questionarios?.[name] || [])) {
      const k = psiDayKey(e.date);
      if (k) questByDay[k] = e;
    }
    // Saltos: raros → pega o mais recente até a data
    const saltosSorted = (saltos?.[name] || []).slice().sort((a, b) => psiParseDate(a.date) - psiParseDate(b.date));
    const cmjUpTo = (ts) => {
      let best = null;
      for (const s of saltosSorted) {
        const sts = psiParseDate(s.date);
        if (!sts || sts > ts) break;
        const c = Math.max(s.cmj_1 || 0, s.cmj_2 || 0, s.cmj_3 || 0, s.media_cmj || 0);
        if (c > 0) best = c;
      }
      return best;
    };

    for (const ge of (gps[name] || [])) {
      const ts = psiParseDate(ge.date);
      if (!ts) continue;
      const k = psiDayKey(ge.date);
      const d = diarioByDay[k];
      const q = questByDay[k];
      const g = ge.gps || {};

      const pse    = (ge.pse > 0 ? ge.pse : null) ?? (d?.pse > 0 ? d.pse : null);
      const duracao= (ge.duracao > 0 ? ge.duracao : null) ?? (d?.duracao > 0 ? d.duracao : null);
      const srpe   = (d?.spe > 0 ? d.spe : null) ?? (pse && duracao ? pse * duracao : null);
      const cmj    = cmjUpTo(ts);

      const vec = {
        dist_total:  g.dist_total  > 0 ? g.dist_total  : null,
        hsr:         g.hsr         > 0 ? g.hsr         : null,
        sprints:     g.sprints     > 0 ? g.sprints     : null,
        player_load: g.player_load > 0 ? g.player_load : null,
        pico_vel:    g.pico_vel    > 0 ? g.pico_vel    : null,
        pse:         pse,
        srpe:        srpe,
        cmj:         cmj,
        sono:        q?.sono_qualidade > 0 ? q.sono_qualidade : null,
        dor:         q?.dor > 0 ? q.dor : (q && q.dor === 0 ? 0 : null),
        rec:         q?.recuperacao_geral > 0 ? q.recuperacao_geral : null
      };

      const cov = featKeys.filter(k => vec[k] !== null && vec[k] !== undefined && Number.isFinite(vec[k])).length / featKeys.length;
      if (cov < 0.7) continue; // exige 70% das colunas preenchidas

      rows.push({ athlete: name, date: ge.date, ts, vec });
    }
  }

  return { rows, featKeys };
}

function psiStandardize(rows, featKeys) {
  const p = featKeys.length;
  const mu = new Array(p).fill(0);
  const sigma = new Array(p).fill(0);
  const counts = new Array(p).fill(0);

  for (const r of rows) {
    for (let j = 0; j < p; j++) {
      const v = r.vec[featKeys[j]];
      if (v !== null && Number.isFinite(v)) { mu[j] += v; counts[j]++; }
    }
  }
  for (let j = 0; j < p; j++) mu[j] = counts[j] > 0 ? mu[j] / counts[j] : 0;

  const var_ = new Array(p).fill(0);
  for (const r of rows) {
    for (let j = 0; j < p; j++) {
      const v = r.vec[featKeys[j]];
      if (v !== null && Number.isFinite(v)) var_[j] += (v - mu[j]) * (v - mu[j]);
    }
  }
  for (let j = 0; j < p; j++) sigma[j] = counts[j] > 1 ? Math.sqrt(var_[j] / (counts[j] - 1)) : 1;
  for (let j = 0; j < p; j++) if (!(sigma[j] > 0)) sigma[j] = 1;

  // Imputa valores ausentes com a média (z = 0) e devolve a matriz Z.
  const Z = rows.map(r => featKeys.map((k, j) => {
    const v = r.vec[k];
    if (v === null || !Number.isFinite(v)) return 0;
    return (v - mu[j]) / sigma[j];
  }));

  return { Z, mu, sigma };
}

function psiCovariance(Z) {
  const n = Z.length, p = Z[0]?.length || 0;
  const C = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < n; i++) {
    const row = Z[i];
    for (let a = 0; a < p; a++) {
      const va = row[a];
      for (let b = a; b < p; b++) {
        C[a][b] += va * row[b];
      }
    }
  }
  const denom = Math.max(n - 1, 1);
  for (let a = 0; a < p; a++) for (let b = a; b < p; b++) {
    C[a][b] /= denom;
    if (b !== a) C[b][a] = C[a][b];
  }
  return C;
}

function psiPowerIteration(C, iters = 400) {
  const p = C.length;
  let v = new Array(p).fill(0).map((_, i) => (i === 0 ? 1 : 0.01 * (i + 1)));
  const norm = (x) => Math.sqrt(x.reduce((s, xi) => s + xi * xi, 0)) || 1;
  let n0 = norm(v); v = v.map(x => x / n0);
  for (let it = 0; it < iters; it++) {
    const w = new Array(p).fill(0);
    for (let a = 0; a < p; a++) {
      let s = 0;
      for (let b = 0; b < p; b++) s += C[a][b] * v[b];
      w[a] = s;
    }
    const nw = norm(w);
    if (nw === 0) break;
    const nxt = w.map(x => x / nw);
    let delta = 0;
    for (let j = 0; j < p; j++) delta += Math.abs(nxt[j] - v[j]);
    v = nxt;
    if (delta < 1e-8) break;
  }
  // Eigenvalor de Rayleigh
  let num = 0, den = 0;
  for (let a = 0; a < p; a++) {
    let s = 0;
    for (let b = 0; b < p; b++) s += C[a][b] * v[b];
    num += v[a] * s;
    den += v[a] * v[a];
  }
  return { v, lambda: den > 0 ? num / den : 0 };
}

function psiOrientLoadings(v, featKeys) {
  // Se a soma ponderada pelos sinais esperados der negativa, inverte v.
  let score = 0;
  for (let j = 0; j < featKeys.length; j++) {
    const f = PSI_FEATURES.find(x => x.key === featKeys[j]);
    score += (f?.sign || 0) * v[j];
  }
  if (score < 0) return v.map(x => -x);
  return v;
}

function assembleOrderParameter({ gps, diario, questionarios, saltos }) {
  if (!gps || !Object.keys(gps).length) return null;

  const { rows, featKeys } = buildPsiMatrix({ gps, diario, questionarios, saltos });
  if (rows.length < 20) return { error: "insufficient_data", n: rows.length };

  const { Z, mu, sigma } = psiStandardize(rows, featKeys);
  const C = psiCovariance(Z);
  const { v: vRaw, lambda } = psiPowerIteration(C);
  const v = psiOrientLoadings(vRaw, featKeys);

  // Projeção Ψ = Z · v
  const psiRaw = Z.map(zr => zr.reduce((s, x, i) => s + x * v[i], 0));

  // Normaliza Ψ pela população (z-unit) para interpretabilidade
  const psiMean = psiRaw.reduce((a, b) => a + b, 0) / Math.max(psiRaw.length, 1);
  const psiVar = psiRaw.reduce((a, b) => a + (b - psiMean) ** 2, 0) / Math.max(psiRaw.length - 1, 1);
  const psiSd = Math.sqrt(psiVar) || 1;
  const psiZ = psiRaw.map(x => (x - psiMean) / psiSd);

  // Variância explicada por PC1 (lambda / traço da covariância)
  const trace = C.reduce((s, r, i) => s + r[i], 0) || 1;
  const explained = Math.max(0, Math.min(1, lambda / trace));

  // Agrupa por atleta e ordena por data ascendente
  const series = {};
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!series[r.athlete]) series[r.athlete] = [];
    series[r.athlete].push({ date: r.date, ts: r.ts, psi: Math.round(psiZ[i] * 1000) / 1000 });
  }
  for (const name of Object.keys(series)) {
    series[name].sort((a, b) => a.ts - b.ts);
    // Baseline individual (média móvel 28d) e desvio-padrão individual
    const WIN = 28 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < series[name].length; i++) {
      const cur = series[name][i];
      const window = series[name].slice(0, i).filter(p => cur.ts - p.ts <= WIN);
      if (window.length >= 3) {
        const m = window.reduce((s, p) => s + p.psi, 0) / window.length;
        const s2 = window.reduce((s, p) => s + (p.psi - m) ** 2, 0) / Math.max(window.length - 1, 1);
        cur.baseline = Math.round(m * 1000) / 1000;
        cur.sd = Math.round(Math.sqrt(s2) * 1000) / 1000;
      } else {
        cur.baseline = null;
        cur.sd = null;
      }
      delete cur.ts;
    }

    // EWS: variância, AR1 e skewness dos resíduos, com tendência linear
    const ews = psiEarlyWarning(series[name]);
    for (let i = 0; i < series[name].length; i++) {
      const e = ews[i];
      if (!e) continue;
      series[name][i].ews = {
        variance: e.variance,
        ar1: e.ar1,
        skew: e.skew,
        risingVar: e.risingVar,
        risingAr1: e.risingAr1,
        risingSkew: e.risingSkew,
        risingCount: e.risingCount
      };
    }
  }

  const loadings = featKeys.map((k, i) => ({ key: k, loading: Math.round(v[i] * 1000) / 1000 }));

  // Web of determinants (Bittencourt 2016): matriz de correlações pooled
  // entre as features padronizadas + lista achatada de arestas significativas
  // (|r| ≥ 0.2) para renderização em rede no front-end.
  const p = featKeys.length;
  const corr = Array.from({ length: p }, () => new Array(p).fill(0));
  const traceC = C.reduce((s, r, i) => s + r[i], 0);
  const diag = C.map((r, i) => Math.sqrt(r[i] > 0 ? r[i] : 1));
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) {
      corr[a][b] = Math.round((C[a][b] / (diag[a] * diag[b])) * 1000) / 1000;
    }
  }
  const edges = [];
  for (let a = 0; a < p; a++) {
    for (let b = a + 1; b < p; b++) {
      const r = corr[a][b];
      if (Math.abs(r) >= 0.2) {
        edges.push({ a: featKeys[a], b: featKeys[b], r });
      }
    }
  }
  edges.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));

  const network = {
    nodes: featKeys.map((k, i) => ({
      key: k,
      loading: Math.round(v[i] * 1000) / 1000,
      degree: edges.reduce((s, e) => s + (e.a === k || e.b === k ? 1 : 0), 0)
    })),
    edges,
    citation: "Bittencourt et al., Br J Sports Med 2016 (doi:10.1136/bjsports-2015-095850)"
  };

  return {
    series,
    loadings,
    features: featKeys,
    network,
    meta: {
      n: rows.length,
      p: featKeys.length,
      explained: Math.round(explained * 10000) / 100, // %
      lambda: Math.round(lambda * 10000) / 10000,
      mu: featKeys.map((k, i) => ({ key: k, mu: Math.round(mu[i] * 1000) / 1000 })),
      sigma: featKeys.map((k, i) => ({ key: k, sigma: Math.round(sigma[i] * 1000) / 1000 })),
      citation: "Fonseca et al., Sports Medicine 2020 (doi:10.1007/s40279-020-01326-4)"
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Early-warning signals (EWS) sobre os resíduos de Ψ — Fase 2.
//
// Seguindo Scheffer et al. 2009 (Nature) e alinhado ao passo 4 de Fonseca
// 2020 (detecção da transição de fase), um sistema que se aproxima de uma
// bifurcação ("critical slowing down") apresenta três assinaturas nos
// resíduos da série temporal: variância crescente, autocorrelação lag-1
// crescente e assimetria (skewness) crescente. Nenhum indicador é
// suficiente sozinho — o sinal composto é contar quantos estão em
// tendência de alta simultaneamente.
//
// Implementação: resíduo ε(t) = Ψ(t) − baseline_indivíduo(t). Janela móvel
// WINDOW=7 pontos para var/AR1/skew. Em cada ponto, trend é a inclinação
// de regressão linear dos últimos TREND_K=8 valores de cada indicador.
// ─────────────────────────────────────────────────────────────────────────────
function psiEarlyWarning(series) {
  const WINDOW = 7;
  const TREND_K = 8;
  const round = (x, k = 1000) => Math.round(x * k) / k;

  const resids = series.map(p => ({
    date: p.date,
    psi: p.psi,
    baseline: p.baseline,
    resid: (p.baseline !== null && p.baseline !== undefined) ? p.psi - p.baseline : null
  }));

  const ewsSeries = resids.map((p, i) => {
    const w = resids.slice(Math.max(0, i - WINDOW + 1), i + 1)
                    .map(x => x.resid)
                    .filter(x => x !== null && Number.isFinite(x));
    if (w.length < WINDOW) return { date: p.date, variance: null, ar1: null, skew: null };
    const n = w.length;
    const mean = w.reduce((a, b) => a + b, 0) / n;
    let varNum = 0;
    for (let j = 0; j < n; j++) varNum += (w[j] - mean) ** 2;
    const variance = varNum / (n - 1);
    const sd = Math.sqrt(variance);
    let ar1Num = 0, ar1Den = 0;
    for (let j = 1; j < n; j++) ar1Num += (w[j] - mean) * (w[j - 1] - mean);
    for (let j = 0; j < n; j++) ar1Den += (w[j] - mean) ** 2;
    const ar1 = ar1Den > 0 ? ar1Num / ar1Den : 0;
    let m3 = 0;
    for (let j = 0; j < n; j++) m3 += (w[j] - mean) ** 3;
    m3 /= n;
    const skew = sd > 0 ? m3 / (sd ** 3) : 0;
    return { date: p.date, variance: round(variance), ar1: round(ar1), skew: round(skew) };
  });

  const slope = (arr) => {
    const n = arr.length;
    if (n < 3) return 0;
    const xm = (n - 1) / 2;
    const ym = arr.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let j = 0; j < n; j++) { num += (j - xm) * (arr[j] - ym); den += (j - xm) ** 2; }
    return den > 0 ? num / den : 0;
  };

  return ewsSeries.map((p, i) => {
    if (p.variance === null) return { ...p, risingVar: false, risingAr1: false, risingSkew: false, risingCount: 0 };
    const lookback = ewsSeries.slice(Math.max(0, i - TREND_K + 1), i + 1).filter(x => x.variance !== null);
    const sVar = slope(lookback.map(x => x.variance));
    const sAr1 = slope(lookback.map(x => x.ar1));
    const sSkew = slope(lookback.map(x => Math.abs(x.skew))); // |skew| cresce independente do sinal
    const risingVar = sVar > 0;
    const risingAr1 = sAr1 > 0;
    const risingSkew = sSkew > 0;
    const risingCount = (risingVar ? 1 : 0) + (risingAr1 ? 1 : 0) + (risingSkew ? 1 : 0);
    return {
      ...p,
      slopeVar: round(sVar, 10000),
      slopeAr1: round(sAr1, 10000),
      slopeSkew: round(sSkew, 10000),
      risingVar, risingAr1, risingSkew, risingCount
    };
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "gps";
    const dateFilter = searchParams.get("date") || null;
    const format = searchParams.get("format") || "json";

    if (tab === "all") {
      // Buscar todas as abas em paralelo
      // GPS: fonte primária = gps_individual (aba nova, 32 atletas, HSR >20 km/h)
      const [gpsCSV, diarioCSV, saltosCSV, questCSV, fisioCSV, lesoesCSV, cmjExtCSV, antropCSV, calendarioCSV] = await Promise.allSettled([
        fetchSheetCSV(SHEETS_CONFIG.tabs.gps_individual),
        fetchSheetCSV(SHEETS_CONFIG.tabs.diario),
        fetchSheetCSV(SHEETS_CONFIG.tabs.saltos),
        fetchSheetCSV(SHEETS_CONFIG.tabs.questionarios),
        fetchSheetCSV(SHEETS_CONFIG.tabs.fisioterapia),
        fetchExternalCSV(SHEETS_CONFIG.external.lesoes),
        fetchExternalCSV(SHEETS_CONFIG.external.cmj),
        fetchSheetCSV(SHEETS_CONFIG.tabs.antropometria),
        fetchSheetCSV(SHEETS_CONFIG.tabs.calendario)
      ]);

      const result = { ok: true, timestamp: new Date().toISOString(), _debug: {} };

      if (gpsCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(gpsCSV.value);
        result.gps = processGPSIndividual(rows);
        const gpsNameDebug = result.gps._nameDebug;
        const gpsWeekly = result.gps._weekly;
        delete result.gps._nameDebug;
        delete result.gps._weekly;
        result.gps_weekly = gpsWeekly || {};
        result._debug.gps = {
          source: "gps_individual",
          gid: SHEETS_CONFIG.tabs.gps_individual,
          hsrThresholdKmh: 20,
          rows: rows.length,
          headers: headers?.slice(0, 20),
          athletes: Object.keys(result.gps).length,
          nameResolution: gpsNameDebug
        };
      } else {
        result._debug.gps = { error: gpsCSV.reason?.message || "failed", source: "gps_individual" };
      }
      if (diarioCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(diarioCSV.value);
        result.diario = processDiario(rows);
        result._debug.diario = { rows: rows.length, headers: headers?.slice(0, 10), athletes: Object.keys(result.diario).length };
      } else {
        result._debug.diario = { error: diarioCSV.reason?.message || "failed" };
      }
      if (saltosCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(saltosCSV.value);
        result.saltos = processSaltos(rows);
        result._debug.saltos = { rows: rows.length, athletes: Object.keys(result.saltos).length };
      } else {
        result._debug.saltos = { error: saltosCSV.reason?.message || "failed" };
      }
      if (questCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(questCSV.value);
        result.questionarios = processQuestionarios(rows);
        const qNameDebug = result.questionarios._nameDebug;
        delete result.questionarios._nameDebug;
        result._debug.questionarios = { rows: rows.length, headers: headers, athletes: Object.keys(result.questionarios).length, nameResolution: qNameDebug };
      } else {
        result._debug.questionarios = { error: questCSV.reason?.message || "failed" };
      }
      if (fisioCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(fisioCSV.value);
        result.fisioterapia = processFisioterapia(rows);
        result._debug.fisioterapia = { rows: rows.length, headers: headers, athletes: Object.keys(result.fisioterapia).length };
      } else {
        result._debug.fisioterapia = { error: fisioCSV.reason?.message || "failed" };
      }
      if (lesoesCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(lesoesCSV.value);
        result.lesoes = processLesoes(rows);
        result._debug.lesoes = { rows: rows.length, headers: headers, total: result.lesoes.length };
      } else {
        result._debug.lesoes = { error: lesoesCSV.reason?.message || "failed" };
      }
      if (cmjExtCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(cmjExtCSV.value);
        result.cmj_externo = processCmjExterno(rows);
        result._debug.cmj_externo = { rows: rows.length, headers: headers, athletes: Object.keys(result.cmj_externo).length };
      } else {
        result._debug.cmj_externo = { error: cmjExtCSV.reason?.message || "failed" };
      }
      if (antropCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(antropCSV.value);
        result.antropometria = processAntropometria(rows);
        const colDebug = result.antropometria._colDebug;
        const sampleRow = result.antropometria._sampleRow;
        delete result.antropometria._colDebug;
        delete result.antropometria._sampleRow;
        const sampleAthlete = Object.keys(result.antropometria)[0];
        const sampleData = sampleAthlete ? result.antropometria[sampleAthlete]?.[0] : null;
        result._debug.antropometria = { rows: rows.length, headers: headers, columns: colDebug, sampleRawRow: sampleRow, athletes: Object.keys(result.antropometria).length, sampleProcessed: sampleData };
      } else {
        result._debug.antropometria = { error: antropCSV.reason?.message || "failed" };
      }

      if (calendarioCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(calendarioCSV.value);
        result.calendario = processCalendario(rows);
        result._debug.calendario = { rows: rows.length, headers: headers?.slice(0, 10), games: result.calendario.length };
      } else {
        result._debug.calendario = { error: calendarioCSV.reason?.message || "failed" };
      }

      // Parâmetro de ordem Ψ(t) — PC1 sobre features padronizadas
      try {
        const psi = assembleOrderParameter({
          gps: result.gps,
          diario: result.diario,
          questionarios: result.questionarios,
          saltos: result.saltos
        });
        if (psi) {
          result.psi = psi;
          result._debug.psi = {
            n: psi.meta?.n,
            p: psi.meta?.p,
            explained_pct: psi.meta?.explained,
            lambda: psi.meta?.lambda,
            athletes: psi.series ? Object.keys(psi.series).length : 0,
            error: psi.error || null
          };
        } else {
          result._debug.psi = { error: "no_gps" };
        }
      } catch (e) {
        result._debug.psi = { error: e.message };
      }

      return Response.json(result, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Aba individual
    const gid = SHEETS_CONFIG.tabs[tab];
    if (gid === undefined) {
      return Response.json({ ok: false, error: `Aba '${tab}' não encontrada. Disponíveis: ${Object.keys(SHEETS_CONFIG.tabs).join(", ")}` }, { status: 400 });
    }

    const csvText = await fetchSheetCSV(gid);

    if (format === "csv") {
      return new Response(csvText, {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "public, s-maxage=60", "Access-Control-Allow-Origin": "*" }
      });
    }

    const { headers, rows } = parseCSV(csvText);
    let processed;

    switch (tab) {
      case "gps": processed = processGPS(rows); break;
      case "gps_individual": processed = processGPSIndividual(rows); break;
      case "diario": processed = processDiario(rows); break;
      case "saltos": processed = processSaltos(rows); break;
      case "questionarios": processed = processQuestionarios(rows); break;
      case "fisioterapia": processed = processFisioterapia(rows); break;
      case "antropometria": processed = processAntropometria(rows); break;
      case "calendario": processed = processCalendario(rows); break;
      default: processed = rows;
    }

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
      tab,
      total_rows: rows.length,
      headers,
      data: processed
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 502 });
  }
}
