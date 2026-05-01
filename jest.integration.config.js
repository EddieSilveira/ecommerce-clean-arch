/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.spec.ts"],
  moduleNameMapper: {
    "^@domain/(.*)$": "<rootDir>/apps/api/src/domain/$1",
    "^@application/(.*)$": "<rootDir>/apps/api/src/application/$1",
    "^@infra/(.*)$": "<rootDir>/apps/api/src/infrastructure/$1",
    "^@helpers/(.*)$": "<rootDir>/tests/helpers/$1"
  },
  testTimeout: 30000,
  setupFiles: ["dotenv/config"]
};
