module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["node_modules", "dist"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
