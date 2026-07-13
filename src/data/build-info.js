export const BUILD_VERSION = typeof __BUILD_VERSION__ === "string" ? __BUILD_VERSION__ : "dev";

export function withAssetVersion(source) {
  const separator = source.includes("?") ? "&" : "?";
  return `${source}${separator}v=${encodeURIComponent(BUILD_VERSION)}`;
}
