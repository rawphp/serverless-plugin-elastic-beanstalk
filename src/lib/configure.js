import fsp from 'fs-promise';
import path from 'path';

/**
 * Create a new ElasticBeanstalk configuration file.
 *
 * @param {Object} config         stack configuration object
 * @param {Object} options        app options
 * @param {String} options.env    deployment environment
 * @param {String} options.region deployment region
 * @param {Object} logger         log instance
 *
 * @returns {undefined}
 */
async function createEBConfig(config, options, logger) {
  const templatePath = `${__dirname}/../../resources/eb.config.yml`;
  const filePath = `${process.cwd()}/.elasticbeanstalk/config.yml`;

  let content = await fsp.readFile(templatePath, 'utf-8');

  // create output dir if not exists
  await fsp.ensureDir(`${process.cwd()}/.elasticbeanstalk`);

  const variables = {
    APPLICATION_NAME: config.RacingRouterApplicationName,
    APPLICATION_ENVIRONMENT: config.RacingRouterEnvironmentName,
    REGION: options.region,
    ENV: options.env,
    KEY: options.key,
    PLATFORM: options.platform || 'arn:aws:elasticbeanstalk:eu-west-1::platform/Node.js running on 64bit Amazon Linux/4.0.1',
  };

  Object.keys(variables).forEach((key) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  });

  try {
    await fsp.writeFile(filePath, content);
  } catch (error) {
    logger.log(error);
  }
}

/**
 * Configure service for deployment.
 *
 * @returns {undefined}
 */
export default async function configure() {
  try {
    this.logger.log('Configuring ElasticBeanstalk Deployment...');

    const stackOutputs = await fsp.readJson(path.resolve(`${process.cwd()}/.serverless/stack-config.json`));

    const options = Object.assign(
      {},
      this.config.configure,
      { env: this.options.env, region: this.options.region },
    );

    await createEBConfig(stackOutputs, options, this.logger);

    // execute custom script if provided
    if (this.config.configure.custom) {
      this.logger.log(`Executing custom script command: ${this.config.configure.custom}`);

      /* eslint global-require:0 import/no-dynamic-require:0 */
      const script = require(`${process.cwd()}/${this.config.configure.custom}`);

      await script(this.serverless, stackOutputs);
    }
  } catch (error) {
    this.logger.log(error);
  }
}
