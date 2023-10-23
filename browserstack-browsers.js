export default {
  // Latest mainstream
  BS_Chrome_Current: {
    base: "BrowserStack",
    browserName: "chrome",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  BS_Firefox_Current: {
    base: "BrowserStack",
    browserName: "firefox",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  BS_Safari_Current: {
    base: "BrowserStack",
    browserName: "safari",
    browser_version: "latest",
    os: "OS X",
    os_version: "Big Sur",
  },
  BS_Android_8: {
    base: "BrowserStack",
    browserName: "Android",
    device: "Google Pixel 2",
    os: "Android",
    os_version: "8.0",
    real_mobile: true,
  },

  // Older mainstream
  BS_Chrome_50: {
    base: "BrowserStack",
    browserName: "chrome",
    browser_version: "50",
    os: "Windows",
    os_version: "10",
  },
  BS_Firefox_52: {
    base: "BrowserStack",
    browserName: "firefox",
    browser_version: "52",
    os: "Windows",
    os_version: "10",
  },
  BS_Safari_10: {
    base: "BrowserStack",
    browserName: "safari",
    browser_version: "10.1",
    os: "OS X",
    os_version: "Sierra",
  },

  // Misc
  BS_Android_4_4: {
    base: "BrowserStack",
    device_browser: "ucbrowser",
    device: "Google Nexus 5",
    os: "Android",
    os_version: "4.4",
    real_mobile: true,
  },
  BS_iphone_10: {
    base: "BrowserStack",
    browserName: "Mobile Safari",
    browser_version: null,
    device: "iPhone 7",
    real_mobile: true,
    os: "ios",
    os_version: "10.3",
  },
  BS_MS_Edge: {
    base: "BrowserStack",
    browserName: "edge",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  BS_IE_11: {
    base: "BrowserStack",
    browserName: "ie",
    browser_version: "11.0",
    os: "Windows",
    os_version: "7",
    es5: true,
  },
};
