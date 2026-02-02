const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro"); // make sure this import exists

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Apply uniwind modifications before exporting
// Use absolute path so the .d.ts is always written to src/, never into src/app/ (Expo Router would treat it as a route)
const uniwindConfig = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: path.resolve(__dirname, "src/uniwind-types.d.ts"),
});

module.exports = uniwindConfig;
