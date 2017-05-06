import Promise from 'bluebird';
import fsp from 'fs-promise';
import { exec } from 'child_process';

const execAsync = Promise.promisify(exec);

/**
 * Waits for promise to resolve and logs data
 *
 * @param {Promise} promise the promise to wait for
 * @param {Object}  logger  logger instance
 *
 * @returns {undefined}
 */
async function waitFor(promise, logger) {
  promise.stdout.on('data', (data) => {
    logger.log(data);
  });
  promise.stderr.on('data', (data) => {
    logger.log(data);
  });

  return promise;
}

/**
 * Retrieves stack Ouputs from AWS.
 *
 * @returns {undefined}
 */
export default async function deploy() {
  try {
    this.logger.log('Deploying Application to ElasticBeanstalk...');

    const configPath = `${process.cwd()}/.serverless/stack-config.json`;

    const config = await fsp.readJson(configPath);

    const applicationEnvironment = config[this.config.variables.applicationEnvironmentName];

    await waitFor(execAsync('git add config/config.json'), this.logger);
    await waitFor(execAsync(`eb deploy ${applicationEnvironment} --process --staged`), this.logger);
  } catch (error) {
    this.logger.log(error);
  }
}
