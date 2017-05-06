import Promise from 'bluebird';
import fsp from 'fs-promise';
import { exec } from 'child_process';

const spawnAsync = Promise.promisify(exec);

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

    // await spawnAsync('git', ['add', 'config/config.json'], { stdio: 'inherit' });
    await spawnAsync('git add config/config.json');

    try {
      const args = ['deploy', applicationEnvironment, '--process', '--staged'];

      this.logger.log(`Calling eb with: ${args}`);

      // await spawnAsync('eb', args, { stdio: 'inherit' });
      await spawnAsync(`eb ${args.join(' ')}`);
    } catch (error) {
      console.log('spawnAsync.error', error);

      throw error;
    }
  } catch (error) {
    this.logger.log(error);
  }
}
