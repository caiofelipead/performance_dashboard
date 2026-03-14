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
    "1f4j4Qj0o3BYZPZ5YOTKoG0mk3H7UUCiK8gw2Ywv2LPU",
    "1PRwHxkPWQmlwiXC6i2kbkaQSOmqW6-BKFq51pWaPwxY"
  ],
  // GIDs das abas (publicadas no Google Sheets) — verificados manualmente
  tabs: {
    diario: 555914149,
    vbt: 2056067101,
    gps: 0,
    saltos: 1915291461,
    bioquimico: 193203862,
    antropometria: 461631273,
    questionarios: 1014986912,
    atletas: 1315104851,
    fisioterapia: 1541953765
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
  "Felipe Penha": "FELIPINHO",
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
  "FELIPINHO": "FELIPINHO",
  "MORELLI": "MORELLI",
  "WESLEY": "WESLEY",
  "YURI": "YURI",
  "LUIZAO": "LUIZAO",
  "DARLAN": "DARLAN"
};

function resolveName(sheetName) {
  if (!sheetName) return null;
  const trimmed = sheetName.trim();
  // Busca direta
  if (NAME_MAP[trimmed]) return NAME_MAP[trimmed];
  // Busca case-insensitive
  const lower = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(NAME_MAP)) {
    if (k.toLowerCase() === lower) return v;
  }
  // Fallback: usa o nome como está, em maiúsculas
  return trimmed.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Parser CSV robusto (suporta aspas, vírgulas internas, quebras de linha)
// ═══════════════════════════════════════════════════════════════════════════════
function parseCSV(text) {
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (row) => {
    const fields = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(field.trim());
        field = "";
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
  // Agrupar por atleta + data + sessão (somar splits)
  const sessions = {};
  for (const row of rows) {
    const athlete = row.atleta || row.athlete || "";
    const date = row.date || row.data || "";
    const sessionTitle = row.session_title || "";
    if (!athlete) continue;

    const key = `${athlete}||${date}||${sessionTitle}`;
    if (!sessions[key]) {
      sessions[key] = {
        athlete,
        dashName: resolveName(athlete),
        date,
        sessionTitle,
        tags: row.tags || "",
        grupo: row.grupo || "",
        dpj: row.dpj || "",
        // Acumuladores
        dist_km: 0,
        hsr_20_m: 0,
        sprints_20: 0,
        player_load: 0,
        top_speed: 0,
        hsr_25_km: 0,
        sprints_25: 0,
        acel_b1: 0,
        acel_b2: 0,
        decel_b1: 0,
        decel_b2: 0,
        acoes_30: 0,
        rhie: 0,
        dist_per_min: 0,
        hr_avg: 0,
        hr_max: 0,
        hr_exertion: 0,
        time_z4: 0,
        time_z5: 0,
        splits: 0,
        time_total_sec: 0
      };
    }
    const s = sessions[key];
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
    // FC — colunas comuns do Catapult/STATSports/Polar
    const hrAvg = toNum(row.average_heart_rate_bpm) || toNum(row.average_heart_rate__bpm_) || toNum(row.hr_avg) || toNum(row.fc_media) || toNum(row.fc_med) || 0;
    const hrMax = toNum(row.max_heart_rate_bpm) || toNum(row.max_heart_rate__bpm_) || toNum(row.hr_max) || toNum(row.fc_maxima) || toNum(row.fc_max) || 0;
    if (hrAvg > s.hr_avg) s.hr_avg = hrAvg;
    if (hrMax > s.hr_max) s.hr_max = hrMax;
    s.hr_exertion += toNum(row.heart_rate_exertion) || toNum(row.hr_exertion) || 0;
    s.time_z4 += toNum(row.time_in_hr_zone_4) || toNum(row.time_in_hr_zone_4__min_) || toNum(row.tempo_zona_4) || toNum(row.tempo_z4) || 0;
    s.time_z5 += toNum(row.time_in_hr_zone_5) || toNum(row.time_in_hr_zone_5__min_) || toNum(row.tempo_zona_5) || toNum(row.tempo_z5) || 0;
    s.splits++;
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
      gps: {
        dist_total: Math.round(s.dist_km * 1000), // km → m
        hsr: Math.round(s.hsr_20_m),
        sprints: Math.round(s.sprints_20),
        player_load: Math.round(s.player_load * 100) / 100,
        pico_vel: Math.round(s.top_speed * 10) / 10,
        acel: Math.round(s.acel_b2),  // B2-3 (>3 m/s²) = mais relevante
        decel: Math.round(s.decel_b2),
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
    // Ordenar por data
    entries.sort((a, b) => (a.date > b.date ? 1 : -1));
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
function processQuestionarios(rows) {
  const result = {};
  for (const row of rows) {
    const athlete = row.nome || row.nome_ || "";
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;

    if (!result[name]) result[name] = [];
    result[name].push({
      date: row.data || row.data_ || "",
      peso: toNum(row["1__seu_peso_hoje_"]) || toNum(row.peso) || 0,
      estado: row.como_se_sente_hoje || "",
      recuperacao_geral: toNum(row.como_esta_sua_recuperacao_geral) || 0,
      recuperacao_pernas: toNum(row.recuperacao_nas_pernas) || 0,
      dor: toNum(row.presenca_de_dor) || 0,
      sono_qualidade: toNum(row.qualidade_subjetiva_do_sono) || 0,
      sono_horas: toNum(row.horas_de_sono) || 0
    });
  }
  return result;
}

// Fisioterapia: Referência, Texto, Data, Período, Nome, Horário Chegada, Horário Saída, Procedimento, Responsável
function processFisioterapia(rows) {
  const result = {};
  for (const row of rows) {
    const athlete = row.nome || row.nome_ || "";
    if (!athlete) continue;
    const name = resolveName(athlete);
    if (!name) continue;

    if (!result[name]) result[name] = [];

    const chegada = row.horario_de_chegada || row.horario_chegada || "";
    const saida = row.horario_de_saida || row.horario_saida || "";

    result[name].push({
      date: row.data || "",
      periodo: row.periodo || "",
      chegada: String(chegada).slice(0, 5),
      saida: String(saida).slice(0, 5),
      procedimento: row.procedimento || "",
      responsavel: row.responsavel || "",
      referencia: row.referencia || ""
    });
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

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sheets?tab=gps|diario|saltos|questionarios|all&date=YYYY-MM-DD
// ═══════════════════════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "gps";
    const dateFilter = searchParams.get("date") || null;
    const format = searchParams.get("format") || "json";

    if (tab === "all") {
      // Buscar todas as abas em paralelo
      const [gpsCSV, diarioCSV, saltosCSV, questCSV, fisioCSV] = await Promise.allSettled([
        fetchSheetCSV(SHEETS_CONFIG.tabs.gps),
        fetchSheetCSV(SHEETS_CONFIG.tabs.diario),
        fetchSheetCSV(SHEETS_CONFIG.tabs.saltos),
        fetchSheetCSV(SHEETS_CONFIG.tabs.questionarios),
        fetchSheetCSV(SHEETS_CONFIG.tabs.fisioterapia)
      ]);

      const result = { ok: true, timestamp: new Date().toISOString(), _debug: {} };

      if (gpsCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(gpsCSV.value);
        result.gps = processGPS(rows);
        result._debug.gps = { rows: rows.length, headers: headers?.slice(0, 10), athletes: Object.keys(result.gps).length };
      } else {
        result._debug.gps = { error: gpsCSV.reason?.message || "failed" };
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
        result._debug.questionarios = { rows: rows.length, athletes: Object.keys(result.questionarios).length };
      } else {
        result._debug.questionarios = { error: questCSV.reason?.message || "failed" };
      }
      if (fisioCSV.status === "fulfilled") {
        const { rows, headers } = parseCSV(fisioCSV.value);
        result.fisioterapia = processFisioterapia(rows);
        result._debug.fisioterapia = { rows: rows.length, athletes: Object.keys(result.fisioterapia).length };
      } else {
        result._debug.fisioterapia = { error: fisioCSV.reason?.message || "failed" };
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
      case "diario": processed = processDiario(rows); break;
      case "saltos": processed = processSaltos(rows); break;
      case "questionarios": processed = processQuestionarios(rows); break;
      case "fisioterapia": processed = processFisioterapia(rows); break;
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
