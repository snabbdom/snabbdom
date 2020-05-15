module.exports = {
  // Latest mainstream
  BS_Chrome_Current: {
    base: 'BrowserStack',
    browser: 'chrome',
    browser_version: 'latest',
    os: 'Windows',
    os_version: '10',
  },
  BS_Firefox_Current: {
    base: 'BrowserStack',
    browser: 'firefox',
    browser_version: 'latest',
    os: 'Windows',
    os_version: '10',
  },
  BS_Safari_Current: {
    base: 'BrowserStack',
    browser: 'safari',
    browser_version: 'latest',
    os: 'OS X',
    os_version: 'High Sierra',
  },
  BS_Android_8: {
    base: 'BrowserStack',
    browser: 'Android',
    device: 'Google Pixel 2',
    os: 'Android',
    os_version: '8.0',
    real_mobile: true,
  },

  // Older mainstream
  /* https://github.com/snabbdom/snabbdom/issues/468
  BS_Chrome_49: {
    base: 'BrowserStack',
    browser: 'chrome',
    browser_version: '49',
    os: 'Windows',
    os_version: '10',
  },
  */
  BS_Firefox_52: {
    base: 'BrowserStack',
    browser: 'firefox',
    browser_version: '52',
    os: 'Windows',
    os_version: '10',
  },
  /* https://github.com/snabbdom/snabbdom/issues/469
  BS_Safari_9: {
    base: 'BrowserStack',
    browser: 'safari',
    browser_version: '9.1',
    os: 'OS X',
    os_version: 'El Capitan',
  },
  */

  // Misc
  BS_Android_4_4: {
    base: 'BrowserStack',
    device_browser: 'ucbrowser',
    device: 'Google Nexus 5',
    os: 'Android',
    os_version: '4.4',
    real_mobile: true,
  },
  /* https://github.com/snabbdom/snabbdom/issues/470
  BS_iphone_10: {
    base: 'BrowserStack',
    browser: 'Mobile Safari',
    browser_version: null,
    device: 'iPhone 7',
    real_mobile: true,
    os: 'ios',
    os_version: '10.3',
  },
  */
  BS_MS_Edge: {
    base: 'BrowserStack',
    browser: 'edge',
    browser_version: 'latest',
    os: 'Windows',
    os_version: '10',
  },
  BS_IE_11: {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '7',
  },
  BS_IE_10: {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '10.0',
    os: 'Windows',
    os_version: '7',
  },
};
