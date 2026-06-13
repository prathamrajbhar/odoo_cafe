import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "commonjs",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        jsx: "react-jsx",
        paths: { "@/*": ["./src/*"] },
      },
    },
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  clearMocks: true,
};

export default config;
