/**
 * disclaimer-kit config example
 * Copy this file, rename to config.js, and customize.
 *
 * CDN: https://nature-forecast.pages.dev/shared/disclaimer/disclaimer.js
 */
window.DISCLAIMER_CONFIG = {
  // 掲載先ページの文体 (必須)
  // "polite" = です・ます調
  // "terse"  = 体言止め
  // "formal" = 文語・法的明示
  tone: "polite",

  // データ種別 (必須)
  // "tidal"   = 気象・潮汐データ
  // "weather" = 気象データのみ
  domain: "weather",

  // Function to call after disclaimer is inserted (your data fetch fn)
  // dataFetchFn: load,

  // Optional: CSS class for banner element (default: built-in card style)
  // When set, all inline styles are removed — style via your own CSS.
  // bannerClass: "my-disclaimer-banner",

  // Optional: 気象業務法第17条の明示 (default: true)
  // showWeatherLaw: true,
};
