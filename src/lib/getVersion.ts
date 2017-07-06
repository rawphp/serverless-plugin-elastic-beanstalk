import * as Moment from 'moment';

/**
 * Get version from config.
 *
 * @param {String} version configuration object
 *
 * @returns {String} version string
 */
export default function getVersion(version: string): string {
  if (version === 'latest') {
    return Moment().unix().toString();
  }

  return version;
}
