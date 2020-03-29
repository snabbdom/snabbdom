import { UAParser } from 'ua-parser-js';

export const benchmarkMaxDurationEnvPrefix = 'BENCHMARK_';

export const getBrowserId = (userAgentString: string) => {
  const { name, version } = new UAParser(userAgentString).getBrowser();
  if (name === undefined) {
    throw new Error();
  }
  if (version === undefined) {
    throw new Error();
  }
  return `${name}_${version.split('.')[0]}`;
};

export const missingBrowserMaxTimeMessage = (browserId: string) => `\
\`${benchmarkMaxDurationEnvPrefix}${browserId}\` environment variable could not be found. \
For each browser, an acceptable maximum duration must be provided`;
