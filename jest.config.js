module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
