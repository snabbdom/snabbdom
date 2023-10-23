export default {
  // Latest mainstream
  BS_Chrome_Current: {
    browserName: "chrome",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  BS_Firefox_Current: {
    browserName: "firefox",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  BS_Safari_Current: {
    browserName: "safari",
    browser_version: "latest",
    os: "OS X",
    os_version: "Big Sur",
  },
  BS_Android_Current: {
    browserName: "chrome",
    device: "Samsung Galaxy S23",
    os: "Android",
    os_version: "13.0",
  },
  BS_Android_8: {
    base: "BrowserStack",
    browserName: "Android",
    device: "Google Pixel 2",
    os: "Android",
    os_version: "8.0",
    real_mobile: true,
  },
  BS_MS_Edge: {
    base: "BrowserStack",
    browserName: "edge",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
};
