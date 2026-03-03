const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude Next.js src directory from Metro bundle to avoid conflicts
// We use an absolute path regex to ensure it works correctly on Windows
const srcPath = path.resolve(__dirname, 'src');
const escapedSrcPath = srcPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

config.resolver.blockList = [
    new RegExp(`${escapedSrcPath}[/\\\\].*`),
    /.*[/\\]src[/\\]app[/\\].*/,
    /.*[/\\]src[/\\]api[/\\].*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
