module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/FlowPlugins', '<rootDir>/tests/NovePlugins'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: false }],
  },
  collectCoverageFrom: [
    'FlowPluginsTs/**/*.ts',
    '!FlowPluginsTs/**/*.d.ts',
  ],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  extensionsToTreatAsEsm: [],
};
