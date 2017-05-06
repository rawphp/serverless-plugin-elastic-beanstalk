import Promise from 'bluebird';
import fsp from 'fs-promise';
import { spawn } from 'child_process';

const spawnAsync = Promise.promisify(spawn);

// const execAsync = Promise.promisify(exec);

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

    await spawnAsync('eb', ['deploy', applicationEnvironment, '--process'], { stdio: 'inherit' })
      .catch((error) => {
        this.logger.log(error);
      });
  } catch (error) {
    this.logger.log(error);
  }
}
