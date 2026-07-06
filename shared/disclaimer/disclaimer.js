/**
 * disclaimer-kit v1.0.0
 * License: MIT
 * https://github.com/YuruTechLog/nature-forecast
 *
 * Usage:
 *   1. Set window.DISCLAIMER_CONFIG before loading this script
 *   2. <script src="disclaimer.js"></script>
 *
 * // ES module future path (npm):
 * // export function initDisclaimer(config) { ... }
 */
(function () {
  'use strict';

  const TONES = {
    soft: {
      label: '参考情報',
      color: '#38bdf8',
      icon: 'ℹ️',
      text: (cfg) =>
        `${cfg.siteName} は参考情報サービスです。<br>掲載内容は気象・潮汐の数値計算結果をもとにした参考値であり、現地の状況と異なる場合があります。` +
        (cfg.showWeatherLaw !== false ? '<br>気象業務法第17条に基づく気象予報業ではありません。' : '') +
        '<br>本情報を利用した行動による損害について責任を負いません。',
    },
    strict: {
      label: '免責事項',
      color: '#fbbf24',
      icon: '⚠️',
      text: (cfg) =>
        `【免責事項】${cfg.siteName} の掲載情報は気象・潮汐の数値計算結果をもとに算出した参考値であり、正確性を保証しません。<br>` +
        (cfg.showWeatherLaw !== false ? '気象業務法第17条に基づく気象予報業ではありません。<br>' : '') +
        '自然環境・気象条件は急変します。現地の状況・安全を必ずご自身で確認してください。<br>' +
        '本情報の利用により生じた損害について、運営者は一切の責任を負いません。',
    },
    warn: {
      label: '警告',
      color: '#ef4444',
      icon: '🚨',
      text: (cfg) =>
        `【重要】${cfg.siteName} の情報は数値計算結果をもとにした参考値です。<br>荒天・強風時は現地への訪問を中止してください。<br>` +
        '気象・潮位は急変します。本情報による行動に起因するいかなる損害についても責任を負いません。',
    },
  };

  const GATE_HTML = `
    <div id="dkit-gate" style="
      position:fixed;inset:0;background:rgba(10,14,26,0.97);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;font-family:'Hiragino Sans','Noto Sans JP',sans-serif;
    ">
      <div style="
        background:#111827;border:1px solid #374151;border-radius:16px;
        padding:2rem 1.8rem;max-width:480px;width:90%;text-align:center;
      ">
        <div style="font-size:2rem;margin-bottom:0.8rem;">⛔</div>
        <div style="color:#ef4444;font-size:1rem;font-weight:700;margin-bottom:0.8rem;">
          設定が必要です
        </div>
        <div style="color:#94a3b8;font-size:0.82rem;line-height:1.8;margin-bottom:1.2rem;">
          <code>DISCLAIMER_CONFIG.tone</code> が未設定です。<br>
          <code>config.js</code> を設置してから再度アクセスしてください。
        </div>
        <div style="color:#64748b;font-size:0.72rem;">
          開発者向け:
          <a href="https://github.com/YuruTechLog/nature-forecast/tree/main/shared/disclaimer"
             style="color:#38bdf8;" target="_blank" rel="noopener">README</a>
        </div>
      </div>
    </div>`;

  // Default inline styles (used when bannerClass is not set)
  const DEFAULT_BANNER_STYLE = [
    'background:#111827',
    'border:1px solid #374151',
    'border-radius:8px',
    'padding:0.7rem 1rem',
    'font-size:0.75rem',
    'text-align:center',
    'max-width:520px',
    'margin:0 auto 1rem',
    "font-family:'Hiragino Sans','Noto Sans JP',sans-serif",
  ].join(';');

  function buildBanner(cfg) {
    const tone = TONES[cfg.tone];
    const text = tone.text(cfg);
    const useClass = cfg.bannerClass || '';
    const styleAttr = useClass ? '' : ` style="${DEFAULT_BANNER_STYLE}"`;

    return `
      <div id="dkit-banner"${useClass ? ` class="${useClass}"` : ''}${styleAttr}>
        <span style="
          display:inline-block;background:${tone.color}22;
          color:${tone.color};font-size:0.7rem;font-weight:700;
          padding:0.15rem 0.5rem;border-radius:4px;
          margin-bottom:0.4rem;letter-spacing:0.05em;
        ">${tone.icon} ${tone.label}</span>
        <div style="color:#94a3b8;font-size:0.74rem;line-height:1.7;">
          ${text}
        </div>
      </div>`;
  }

  function insertBanner(cfg) {
    const footer = document.querySelector('footer');
    const existing = document.getElementById('dkit-banner');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.innerHTML = buildBanner(cfg);
    const banner = div.firstElementChild;

    if (footer) {
      // Remove static disclaimer text if present
      const staticDisclaimer = footer.querySelector('.disclaimer');
      if (staticDisclaimer) staticDisclaimer.remove();
      footer.insertBefore(banner, footer.firstChild);
    } else {
      document.body.appendChild(banner);
    }
  }

  function showGate() {
    const div = document.createElement('div');
    div.innerHTML = GATE_HTML;
    document.body.appendChild(div.firstElementChild);
  }

  function init() {
    const cfg = window.DISCLAIMER_CONFIG;

    if (!cfg || !cfg.tone || !TONES[cfg.tone]) {
      showGate();
      return; // data fetch blocked
    }

    insertBanner(cfg);

    if (typeof cfg.dataFetchFn === 'function') {
      cfg.dataFetchFn();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
