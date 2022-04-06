/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    roots: ['<rootDir>/tests/'],
    setupFilesAfterEnv: ['jest-extended/all'],
    testPathIgnorePatterns: ['/__utils__/'],
    coveragePathIgnorePatterns: ['/__utils__/']
};