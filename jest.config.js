/* eslint-env node */

module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    testRegex: '(/test/.*|(\\.|/)(test|spec))\\.(js|ts)$',

    transform: {
        '^.+\\.ts$': require.resolve('ts-jest/preprocessor.js'),
    },

    mapCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 69,
            functions: 87,
            lines: 87,
            statements: 87,
        },
    },
};
