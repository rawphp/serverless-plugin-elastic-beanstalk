import fsp from 'fs-promise';
import { spawn, exec } from 'child-process-promise';

/**
 * Wait for spawn to complete.
 *
 * @param {Promise} promise the promise to wait for
 *
 * @returns {undefined}
 */
async function waitFor(promise) {
  const child = promise.childProcess;

  const logger = console;

  child.stdout.on('data', (data) => {
    logger.log(data.toString());
  });
  child.stderr.on('data', (data) => {
    logger.log(data.toString());
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

    const git = await exec('which git');
    const eb = await exec('which eb');

    const logger = console;

    logger.log(git);
    logger.log(eb);

    await waitFor(spawn('git', ['add', 'config/config.json']));

    await waitFor(spawn('eb', ['deploy', applicationEnvironment, '--process', '--staged']));
  } catch (error) {
    this.logger.log(error);
  }
}
