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
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "gps";
    const dateFilter = searchParams.get("date") || null;
    const format = searchParams.get("format") || "json";

    if (tab === "all") {
      // Buscar todas as abas em paralelo
      const [gpsCSV, diarioCSV, saltosCSV, questCSV, fisioCSV, lesoesCSV, cmjExtCSV, antropCSV, calendarioCSV] = await Promise.allSettled([
        fetchSheetCSV(SHEETS_CONFIG.tabs.gps),
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
        result.gps = processGPS(rows);
        const gpsNameDebug = result.gps._nameDebug;
        delete result.gps._nameDebug;
        result._debug.gps = { rows: rows.length, headers: headers?.slice(0, 10), athletes: Object.keys(result.gps).length, nameResolution: gpsNameDebug };
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
