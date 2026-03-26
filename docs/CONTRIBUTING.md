# Guia de Contribuicao

## Configuracao do Ambiente

### 1. Clonar e Instalar

```bash
git clone https://github.com/caiofelipead/performance_dashboard.git
cd performance_dashboard
npm install
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
# Acessar http://localhost:3000
```

### 3. Build de Producao

```bash
npm run build
npm start
```

---

## Estrutura de Codigo

### Arquivos Principais

| Arquivo | Linhas | Responsabilidade |
|---------|--------|------------------|
| `components/Dashboard.jsx` | 4435 | Componente principal (UI + logica + dados) |
| `app/api/sheets/route.js` | 1042 | API proxy para Google Sheets |
| `components/useSheetData.js` | 280 | Hook de busca e cache de dados |
| `model/risk_output.json` | - | Saida do modelo ML |

### Convencoes

- **Linguagem do codigo**: Variaveis e funcoes em ingles
- **Comentarios**: Portugues (pt-BR) com separadores visuais
- **Nomes de atletas**: MAIUSCULO sem acentos (ex: `"ADRIANO"`, `"JONAS TORO"`)
- **Estilos**: Inline (objetos JavaScript), sem CSS externo
- **Componentes**: JSX funcional com hooks

---

## Fluxo de Trabalho Git

### Branches

- `main` — Branch principal de producao
- `feature/*` — Novas funcionalidades
- `fix/*` — Correcoes de bugs
- `claude/*` — Branches geradas por Claude Code

### Commits

Manter mensagens claras e descritivas. Exemplos do historico:

```
Fix opponent matching, add injured to Excluídos, América date, squad filter
Update INJ_HISTORY with official spreadsheet data (Tiago Rocha)
Fix win/loss count, update Inocencio status, add last game to player profile
```

### Pull Requests

1. Criar branch a partir de `main`
2. Implementar mudancas
3. Testar localmente (`npm run dev` + `npm run build`)
4. Abrir PR com descricao clara
5. Aguardar revisao

---

## Tarefas Comuns

### Adicionar Novo Atleta

1. **`app/api/sheets/route.js`**: Adicionar mapeamento de nome em `NAME_MAP`
   ```javascript
   "Nome Planilha": "NOME DASHBOARD",
   ```

2. **`public/players/`**: Adicionar foto do atleta como `NOME DASHBOARD.png`

3. **`components/Dashboard.jsx`**: Se necessario, adicionar em `RISK_ALERTS` com dados de risco

### Atualizar Historico de Lesoes

1. **`components/Dashboard.jsx`**: Editar array `INJ_HISTORY` com novo registro:
   ```javascript
   {
     id: PROXIMO_ID,
     n: "NOME",
     pos: "POS",
     date: "DD/MM/YYYY",
     classif: "CODIGO",
     regiao: "Regiao anatomica",
     // ... demais campos
   }
   ```

### Atualizar Alertas de Risco (ML)

1. Executar pipeline ML externamente
2. Atualizar `model/risk_output.json`
3. Atualizar `RISK_ALERTS` no `Dashboard.jsx`
4. Atualizar `PROJECTIONS` se necessario

### Adicionar Nova Aba da Planilha

1. **`app/api/sheets/route.js`**:
   - Adicionar GID em `SHEETS_CONFIG.tabs`
   - Criar funcao `processNovaAba(rows)`
   - Adicionar ao handler de `tab=all`

2. **`components/useSheetData.js`**:
   - Adicionar parsing no callback de dados

3. **`components/Dashboard.jsx`**:
   - Adicionar visualizacao dos novos dados

### Alterar Intervalo de Polling

Em `components/useSheetData.js`:
```javascript
const DEFAULT_INTERVAL = 120_000; // Alterar valor em milissegundos
```

Ou ao usar o hook:
```javascript
const { sheetData } = useSheetData({ interval: 60_000 }); // 1 minuto
```

---

## Mapeamento de Nomes de Atletas

Ao adicionar ou modificar atletas, garantir consistencia entre:

1. **Planilha Google Sheets** (nome original)
2. **`NAME_MAP`** em `route.js` (mapeamento)
3. **`public/players/`** (nome do arquivo de foto)
4. **`RISK_ALERTS`** em `Dashboard.jsx` (campo `n`)
5. **`INJ_HISTORY`** em `Dashboard.jsx` (campo `n`)

Formato padrao: `"NOME SOBRENOME"` em maiusculo, sem acentos.

---

## Checklist de Verificacao

Antes de submeter um PR:

- [ ] `npm run dev` funciona sem erros
- [ ] `npm run build` completa com sucesso
- [ ] Dados carregam corretamente no dashboard
- [ ] Novos atletas aparecem com foto e nome correto
- [ ] Alertas de risco exibem corretamente
- [ ] Graficos renderizam sem erros no console
- [ ] Responsividade mantida (testar mobile)

---

## Problemas Conhecidos

### Google Sheets retorna 403

A planilha pode nao estar publicada ou a URL expirou. Verificar:
1. Se a planilha esta publicada em `Arquivo > Compartilhar > Publicar na web`
2. Se os GIDs das abas estao corretos
3. Se a chave publica em `SHEETS_CONFIG.published_key` esta atualizada

### Nomes nao aparecem no dashboard

Verificar se o nome da planilha tem mapeamento em `NAME_MAP`. Nomes truncados (especialmente da aba Fisioterapia) precisam de mapeamento adicional.

### Build falha com erro de memoria

O componente `Dashboard.jsx` e grande. Se o build falhar por memoria:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```
