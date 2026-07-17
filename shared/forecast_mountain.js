const LABEL_CLASS = { '◎◎': 's2', '◎': 's1', '○': 's0', '△': 'sm', '×': 'sx' };
const SCENIC_EMOJI = { MIRROR: '🪞', PINK_SKY: '🌸', SILHOUETTE: '⛰', CRYSTAL: '💎' };
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const LOC_ORDER = [
  { id: 'mountain_shojiko',  emoji: '🗻', label: '精進湖' },
  { id: 'mountain_hibarako', emoji: '🏔', label: '桧原湖' },
  { id: 'mountain_tsutanuma',emoji: '🍂', label: '蔦沼'   },
];

function formatUpdated(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} 更新`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const wday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return { main: `${m}/${d}`, sub: `（${wday}）` };
}

function todayStr() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
}

function renderMorningWindow(morningWindowStr) {
  if (!morningWindowStr) return '';
  return `<div class="window-none">🌄 ${morningWindowStr}</div>`;
}

function renderScoreCell(entry) {
  if (!entry) return '<td class="score-cell"><span class="no-data">—</span></td>';

  const cls = LABEL_CLASS[entry.score_label] || 's0';

  const modes = entry.scenic_modes || [];
  const scenicBadge = modes.length
    ? `<span class="scenic-badge">【${modes.map(m => SCENIC_EMOJI[m] || m).join('')}】</span>`
    : '';

  const windowsHtml = renderMorningWindow(entry.morning_window);

  const metaLines = [];
  if (entry.sunrise_time) metaLines.push(`🌄 ${entry.sunrise_time}`);
  if (entry.wind_ms != null) metaLines.push(`💨 ${entry.wind_ms}m/s`);
  if (entry.cloud_cover_low != null) metaLines.push(`☁️ ${entry.cloud_cover_low}%`);
  if (entry.visibility_km != null) metaLines.push(`🔭 ${entry.visibility_km}km`);

  return `<td class="score-cell">
    <div class="score-top">
      <span class="score-label ${cls}">${entry.score_label}</span>
      <span class="score-pts">${entry.score}点</span>
      ${scenicBadge}
    </div>
    <div class="windows-block">${windowsHtml}</div>
    <div class="cell-meta">${metaLines.join('　')}</div>
  </td>`;
}

function renderScoreCellInner(entry) {
  if (!entry) return '<div class="score-cell"><span class="no-data">—</span></div>';

  const cls = LABEL_CLASS[entry.score_label] || 's0';
  const modes = entry.scenic_modes || [];
  const scenicBadge = modes.length
    ? `<span class="scenic-badge">【${modes.map(m => SCENIC_EMOJI[m] || m).join('')}】</span>`
    : '';
  const windowsHtml = renderMorningWindow(entry.morning_window);
  const metaLines = [];
  if (entry.sunrise_time) metaLines.push(`🌄 ${entry.sunrise_time}`);
  if (entry.wind_ms != null) metaLines.push(`💨 ${entry.wind_ms}m/s`);
  if (entry.cloud_cover_low != null) metaLines.push(`☁️ ${entry.cloud_cover_low}%`);
  if (entry.visibility_km != null) metaLines.push(`🔭 ${entry.visibility_km}km`);

  return `<div class="score-cell">
    <div class="score-top">
      <span class="score-label ${cls}">${entry.score_label}</span>
      <span class="score-pts">${entry.score}点</span>
      ${scenicBadge}
    </div>
    <div class="windows-block">${windowsHtml}</div>
    <div class="cell-meta">${metaLines.join('　')}</div>
  </div>`;
}

function renderLegend(showLocations = true) {
  const locationBlock = showLocations ? `
    <hr class="legend-sep">
    <div class="legend-grid">
      <div class="legend-item">🗻 <strong>精進湖</strong>　逆さ子抱き富士・山梨県。</div>
      <div class="legend-item">🏔 <strong>桧原湖</strong>　逆さ磐梯山・福島県。</div>
      <div class="legend-item">🍂 <strong>蔦沼</strong>　朝焼けブナ林・青森県。</div>
    </div>` : '';

  return `<div class="legend">
    <div class="legend-title">📖 凡例</div>
    <div class="legend-grid">
      <div class="legend-item"><strong>◎◎</strong>　超絶好条件（85点以上）</div>
      <div class="legend-item"><strong>◎</strong>　好条件（70〜84点）</div>
      <div class="legend-item"><strong>○</strong>　まずまず（50〜64点）</div>
      <div class="legend-item"><strong>△</strong>　厳しめ（35〜49点）</div>
      <div class="legend-item"><strong>×</strong>　条件不足（34点以下）</div>
    </div>
    <hr class="legend-sep">
    <div class="legend-grid">
      <div class="legend-item">🌄　日の出時刻</div>
      <div class="legend-item">💨　風速（m/s）</div>
      <div class="legend-item">☁️　低層雲（%）</div>
      <div class="legend-item">🔭　視程（km）</div>
    </div>
    <hr class="legend-sep">
    <div class="legend-grid">
      <div class="legend-item">【🪞】　完全鏡面。凪＋快晴＋高透明度。</div>
      <div class="legend-item">【🌸】　朝焼け鏡面。凪＋適度な低雲。焼け空が映り込む。</div>
      <div class="legend-item">【⛰】　山影シルエット。無風＋厚雲＋低視程。</div>
      <div class="legend-item">【💎】　快晴高視程。凪＋快晴＋最高の透明度。</div>
    </div>
    ${locationBlock}
  </div>`;
}

function renderTable(data) {
  const today = todayStr();

  const dataKeys = Object.keys(data);
  const orderedLocs = LOC_ORDER.filter(l => dataKeys.includes(l.id));
  const extra = dataKeys
    .filter(k => !LOC_ORDER.some(l => l.id === k))
    .map(k => ({ id: k, emoji: '📍', label: data[k].name || k }));
  const locs = [...orderedLocs, ...extra];

  if (!locs.length) return '<p style="text-align:center;color:var(--sub);padding:3rem 0">データなし</p>';

  const baseLoc = data[locs[0].id];
  if (!baseLoc || !baseLoc.forecasts) {
    return '<div class="error-section"><p>データ取得中</p></div>';
  }
  const dates = baseLoc.forecasts.map(e => e.date);

  const thCols = locs.map(l => {
    const loc = data[l.id];
    const nameHtml = (loc?.lat && loc?.lon)
      ? `<a href="https://maps.google.com/maps?q=${loc.lat},${loc.lon}" target="_blank" rel="noopener" class="loc-map-link">${l.label}</a>`
      : l.label;
    const updatedHtml = loc?.last_updated
      ? `<span class="loc-updated">${formatUpdated(loc.last_updated)}</span>`
      : '';
    return `<th><span class="loc-emoji">${l.emoji}</span><span class="loc-name">${nameHtml}</span>${updatedHtml}</th>`;
  }).join('');

  const rows = dates.map(dateStr => {
    const isToday = dateStr === today;
    const { main, sub } = formatDate(dateStr);
    const todayBadge = isToday ? '<span class="today-badge">今日</span>' : '';
    const rowClass = isToday ? 'today-row' : '';

    const dateTd = `<td class="date-cell">
      <span class="date-main">${main}</span>
      <span class="date-sub">${sub}</span>
      ${todayBadge}
    </td>`;

    const scoreTds = locs.map(l => {
      const entry = (data[l.id]?.forecasts || []).find(e => e.date === dateStr) || null;
      return renderScoreCell(entry);
    }).join('');

    return `<tr class="${rowClass}">${dateTd}${scoreTds}</tr>`;
  }).join('');

  return `<div class="forecast-table-wrap">
    <table class="forecast-table">
      <thead>
        <tr>
          <th class="date-col">日付</th>
          ${thCols}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
  ${renderLegend()}`;
}

function renderLocationList(loc) {
  if (!loc || !loc.forecasts || !loc.forecasts.length) {
    return '<div class="error-section"><p>データ取得中</p></div>';
  }
  const today = todayStr();

  const mapLink = (loc.lat && loc.lon)
    ? `<div class="loc-map-link-wrap"><a href="https://maps.google.com/maps?q=${loc.lat},${loc.lon}" target="_blank" rel="noopener" class="loc-map-link">📍 Googleマップで開く</a></div>`
    : '';

  const rows = loc.forecasts.map(entry => {
    const isToday = entry.date === today;
    const { main, sub } = formatDate(entry.date);
    const todayBadge = isToday ? '<span class="today-badge">今日</span>' : '';
    const rowClass = isToday ? 'today-row' : '';

    return `<div class="location-card ${rowClass}">
      <div class="date-cell">
        <span class="date-main">${main}</span>
        <span class="date-sub">${sub}</span>
        ${todayBadge}
      </div>
      ${renderScoreCellInner(entry)}
    </div>`;
  }).join('');

  return `${mapLink}<div class="location-list">${rows}</div>${renderLegend(false)}`;
}

async function load() {
  try {
    const res = await fetch('/data/mirror-mountain-data.json?_=' + Date.now());
    const data = await res.json();
    const entries = Object.entries(data);
    if (!entries.length) throw new Error('no data');

    const updatedBar = document.getElementById('updated-bar');
    if (updatedBar) updatedBar.style.display = 'none';

    document.getElementById('main').innerHTML = renderTable(data);
  } catch (e) {
    document.getElementById('main').innerHTML =
      '<p style="text-align:center;color:#ef4444;padding:3rem 0">データの読み込みに失敗しました</p>';
    document.getElementById('updated-bar').textContent = 'データ取得エラー';
  }
}

async function loadLocation(locationId) {
  try {
    const res = await fetch('/data/mirror-mountain-data.json?_=' + Date.now());
    const data = await res.json();
    const loc = data[locationId];
    if (!loc) throw new Error('location not found: ' + locationId);

    document.getElementById('updated-bar').textContent =
      '📅 ' + formatUpdated(loc.last_updated);

    document.getElementById('main').innerHTML = renderLocationList(loc);
  } catch (e) {
    document.getElementById('main').innerHTML =
      '<p style="text-align:center;color:#ef4444;padding:3rem 0">データの読み込みに失敗しました</p>';
    document.getElementById('updated-bar').textContent = 'データ取得エラー';
  }
}
