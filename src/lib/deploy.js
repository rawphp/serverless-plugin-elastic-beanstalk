import Promise from 'bluebird';
import fsp from 'fs-promise';
import { exec } from 'child_process';

const execAsync = Promise.promisify(exec);

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

    let result = await execAsync('git add config/config.json');

    this.logger.log('git add completed successfully', result);

    result = await execAsync(`eb deploy ${applicationEnvironment} --process --staged`);

    this.logger.log('eb deploy completed successfully', result);
  } catch (error) {
    this.logger.log(error);
  }
}
