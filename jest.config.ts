/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testEnvironment: "node"
};

export default config;
