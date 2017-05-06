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

    await execAsync('git add config/config.json', (error, stdout, stderr) => {
      if (error) {
        this.logger.log(error);
      }

      this.logger.log(stdout);
      this.logger.log(stderr);
    });

    await execAsync(`eb deploy ${applicationEnvironment} --process --staged`, (error, stdout, stderr) => {
      if (error) {
        this.logger.log(error);
      }

      this.logger.log(stdout);
      this.logger.log(stderr);
    });
  } catch (error) {
    this.logger.log(error);
  }
}
