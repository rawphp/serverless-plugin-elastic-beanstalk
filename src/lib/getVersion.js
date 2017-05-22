import Moment from 'moment';

/**
 * Get version from config.
 *
 * @param {Object} config configuration object
 *
 * @returns {String} version string
 */
export default function getVersion(config) {
  if (config.version === 'latest') {
    return new Moment().unix();
  }

  return config.version;
}
