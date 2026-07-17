const LABEL_CLASS = { '◎◎': 's2', '◎': 's1', '○': 's0', '△': 'sm', '×': 'sx' };
const SCENIC_EMOJI = { SSS: '✨', BURNING_SKY: '🔥', SILHOUETTE_MIST: '🌫', CYBER_TWILIGHT: '💎' };
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const LOC_ORDER = [
  { id: 'chichibugahama', emoji: '🌅', label: '父母ヶ浜'   },
  { id: 'tenjinzaki',     emoji: '🪨', label: '天神崎'     },
  { id: 'kagami_no_umi',  emoji: '✨', label: 'かがみの海' },
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

/**
 * "HH:MM〜HH:MM、HH:MM〜HH:MM" 形式の low_windows を
 * AM/PM 別に分類して返す。
 * 各窓の開始時刻が 12:00 未満なら AM、以上なら PM。
 * 複数 AM / 複数 PM の場合はカンマで連結。
 * AM のみ / PM のみの場合も適切なラベルを返す。
 */
function splitWindowsByAmPm(lowWindowsStr) {
  if (!lowWindowsStr) return null;

  // "HH:MM〜HH:MM" をパース
  const segments = lowWindowsStr.split('、').map(s => s.trim()).filter(Boolean);
  const am = [], pm = [];
  for (const seg of segments) {
    const startStr = seg.split('〜')[0];
    const [h] = startStr.split(':').map(Number);
    if (h < 12) am.push(seg);
    else pm.push(seg);
  }
  return { am, pm };
}

function renderWindows(lowWindowsStr) {
  // 空 or null → 何も表示しない
  if (!lowWindowsStr) return '';

  const split = splitWindowsByAmPm(lowWindowsStr);

  // 時刻パターンなし（「潮がやや高め」「潮が高すぎ」「見ごろ時間帯なし」等）→ テキスト表示
  if (!split || (!split.am.length && !split.pm.length)) {
    return `<div class="window-none">${lowWindowsStr}</div>`;
  }

  const { am, pm } = split;
  // AM のみ or PM のみ → 1行
  if (!am.length) {
    return `<div class="window-row">🌆 <span class="window-label">PM</span>${pm.join('、')}</div>`;
  }
  if (!pm.length) {
    return `<div class="window-row">🌅 <span class="window-label">AM</span>${am.join('、')}</div>`;
  }
  // 両方 → 2行
  return `<div class="window-row">🌅 <span class="window-label">AM</span>${am.join('、')}</div>` +
         `<div class="window-row">🌆 <span class="window-label">PM</span>${pm.join('、')}</div>`;
}

function renderScoreCell(entry) {
  if (!entry) return '<td class="score-cell"><span class="no-data">—</span></td>';

  const cls = LABEL_CLASS[entry.score_label] || 's0';

  // 絶景モードバッジ【✨🔥】形式
  const modes = entry.scenic_modes || [];
  const scenicBadge = modes.length
    ? `<span class="scenic-badge">【${modes.map(m => SCENIC_EMOJI[m] || m).join('')}】</span>`
    : '';

  // 見ごろ時間帯
  const windowsHtml = renderWindows(entry.low_windows);

  // 気象メタ
  const metaLines = [];
  if (entry.sunset_time) metaLines.push(`🌇 ${entry.sunset_time}`);
  if (entry.low_tide_cm != null) metaLines.push(`🌊 ${entry.low_tide_cm}cm`);
  if (entry.wind_ms != null) metaLines.push(`💨 ${entry.wind_ms}m/s`);

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

/**
 * renderScoreCell の内容を <td> ではなく裸の div として返す。
 * 地点単体ページの縦リスト（.location-card .score-cell）で使用。
 */
function renderScoreCellInner(entry) {
  if (!entry) return '<div class="score-cell"><span class="no-data">—</span></div>';

  const cls = LABEL_CLASS[entry.score_label] || 's0';
  const modes = entry.scenic_modes || [];
  const scenicBadge = modes.length
    ? `<span class="scenic-badge">【${modes.map(m => SCENIC_EMOJI[m] || m).join('')}】</span>`
    : '';
  const windowsHtml = renderWindows(entry.low_windows);
  const metaLines = [];
  if (entry.sunset_time) metaLines.push(`🌇 ${entry.sunset_time}`);
  if (entry.low_tide_cm != null) metaLines.push(`🌊 ${entry.low_tide_cm}cm`);
  if (entry.wind_ms != null) metaLines.push(`💨 ${entry.wind_ms}m/s`);

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
      <div class="legend-item">🌅 <strong>父母ヶ浜</strong>　香川県三豊市の干潟。日本版ウユニ塩湖。干潮80cm以下が見ごろの目安。</div>
      <div class="legend-item">🪨 <strong>天神崎</strong>　和歌山県白浜の岩礁。鏡張りゾーン=潮位140〜150cm。</div>
      <div class="legend-item">✨ <strong>かがみの海</strong>　福岡県福津市宮地浜。宮地嶽神社の光の道の麓。干潮80cm以下が見ごろの目安。</div>
    </div>` : '';

  return `<div class="legend">
    <div class="legend-title">📖 凡例</div>
    <div class="legend-grid">
      <div class="legend-item"><strong>◎◎</strong>　超絶好条件（85点以上）</div>
      <div class="legend-item"><strong>◎</strong>　好条件（70〜84点）</div>
      <div class="legend-item"><strong>○</strong>　まずまず（50〜64点）</div>
      <div class="legend-item"><strong>△</strong>　厳しめ（35〜49点）</div>
      <div class="legend-item"><strong>×</strong>　条件不足（34点以下）／日没後のみ見ごろ（0点・夜は撮影不可）</div>
    </div>
    <hr class="legend-sep">
    <div class="legend-grid">
      <div class="legend-item">🌅 <strong>AM</strong>　午前中の見ごろ時間帯</div>
      <div class="legend-item">🌆 <strong>PM</strong>　午後の見ごろ時間帯</div>
      <div class="legend-item">🌇　日没時刻</div>
      <div class="legend-item">🌊　最低潮位（cm）</div>
      <div class="legend-item">💨　風速（m/s）</div>
    </div>
    <hr class="legend-sep">
    <div class="legend-grid">
      <div class="legend-item">【✨】　超レア好条件。完璧な凪・薄雲・透明度が揃った日。</div>
      <div class="legend-item">【🔥】　焼け空狙い好条件。凪＋適度な低雲。</div>
      <div class="legend-item">【🌫】　幻想的霞み条件。無風＋厚雲。</div>
      <div class="legend-item">【💎】　澄み渡り条件。凪＋快晴＋高視程。</div>
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

/**
 * 地点単体ページ用: 1地点分の forecasts を縦リスト（.location-list）で表示。
 */
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
    const res = await fetch('/data/mirror-tidal-data.json?_=' + Date.now());
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

/**
 * 地点単体ページ用ロード関数。locationId で1地点のみ抽出して表示。
 */
async function loadLocation(locationId) {
  try {
    const res = await fetch('/data/mirror-tidal-data.json?_=' + Date.now());
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
