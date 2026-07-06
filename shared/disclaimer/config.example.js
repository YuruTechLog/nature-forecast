/**
 * disclaimer-kit config example
 * Copy this file, rename to config.js, and customize.
 *
 * CDN: https://nature-forecast.pages.dev/shared/disclaimer/disclaimer.js
 */
window.DISCLAIMER_CONFIG = {
  // "soft" | "strict" | "warn" | null
  // null or missing → gate mode (data fetch blocked until user acknowledges)
  tone: "soft",

  // Your site info (shown in disclaimer banner)
  siteName: "あなたのサイト名",
  siteUrl: "https://example.com",

  // Function to call after disclaimer is accepted (your data fetch fn)
  // dataFetchFn: load,

  // Optional: CSS class for banner element (default: built-in card style)
  // When set, all inline styles are removed — style via your own CSS.
  // bannerClass: "my-disclaimer-banner",

  // Optional: law note (default: 気象業務法17条)
  // showWeatherLaw: true,
};
