/**
 * disclaimer-kit v1.1.0
 * License: MIT
 * https://github.com/YuruTechLog/nature-forecast
 *
 * Usage:
 *   1. Set window.DISCLAIMER_CONFIG before loading this script
 *   2. <script src="https://nature-forecast.pages.dev/shared/disclaimer/disclaimer.js"></script>
 */
(function () {
  'use strict';

  // tone = 語調のみ。免責の核心（参考値・予報業否定・損害不責任・現地確認）は全tone共通。
  const TONES = {
    // soft: フッター向け。控えめ・丁寧。通常サイト向け。
    soft: {
      text: (cfg) =>
        `${cfg.siteName} が提供する情報は、気象・潮汐データの数値計算をもとにした参考値です。` +
        `<br>現地の状況・気象条件は実際と異なる場合があります。` +
        `<br>必ずご自身で現地状況をご確認ください。` +
        (cfg.showWeatherLaw !== false
          ? '<br>本サービスは気象業務法第17条に基づく気象予報業ではありません。'
          : '') +
        `<br>本情報の利用により生じた損害について、運営者は責任を負いません。`,
    },
    // strict: 法的明示が必要な場面。断定的・明確。
    strict: {
      text: (cfg) =>
        `【免責事項】${cfg.siteName} の掲載情報は気象・潮汐データの数値計算による参考値です。` +
        `<br>正確性・完全性を保証しません。` +
        (cfg.showWeatherLaw !== false
          ? '<br>本サービスは気象業務法第17条に基づく気象予報業ではありません。'
          : '') +
        `<br>自然環境・気象条件は急変します。` +
        `<br>現地の状況・安全は必ずご自身でご確認ください。` +
        `<br>本情報の利用により生じた一切の損害について、運営者は責任を負いません。`,
    },
    // warn: 危険度の高い自然環境向け。強い警告。
    warn: {
      text: (cfg) =>
        `【重要】${cfg.siteName} の情報は気象・潮汐データの数値計算による参考値です。` +
        `<br>正確性を保証しません。` +
        (cfg.showWeatherLaw !== false
          ? '<br>本サービスは気象業務法第17条に基づく気象予報業ではありません。'
          : '') +
        `<br>荒天・強風・高潮時は現地への訪問を中止してください。` +
        `<br>気象・潮位は急変します。` +
        `<br>本情報による行動に起因するいかなる損害についても、運営者は一切の責任を負いません。`,
    },
  };

  const LABEL_COLOR = '#64748b';

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
          display:inline-block;
          color:${LABEL_COLOR};font-size:0.7rem;font-weight:700;
          margin-bottom:0.4rem;letter-spacing:0.05em;
        ">免責事項</span>
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
      return;
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
