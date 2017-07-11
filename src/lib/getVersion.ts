/**
 * Get version from config.
 *
 * @param {String} version configuration object
 *
 * @returns {String} version string
 */
export default function getVersion(version: string): string {
  if (version === 'latest') {
    return Math.floor(new Date().valueOf() / 1000).toString();
  }

  return version;
}
