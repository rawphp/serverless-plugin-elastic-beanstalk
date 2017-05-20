import Promise from 'bluebird';
import fsp from 'fs-promise';
import path from 'path';

/**
 * List of supported platforms.
 *
 * @see http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts.platforms.html
 */
const platforms = {
  packer: '64bit Amazon Linux 2017.03 v2.2.0 running Packer 1.0.0',
  singleContainerDocker: '64bit Amazon Linux 2017.03 v2.6.0 running Docker 1.12.6',
  multiContainerDocker: '64bit Amazon Linux 2017.09 v2.6.0 running Multi-container Docker 1.12.6 (Generic)',
  go: '64bit Amazon Linux 2017.03 v2.4.0 running Go 1.7',
  java8SE: '64bit Amazon Linux 2017.03 v2.5.0 running Java 8',
  java8Tomcat8: '64bit Amazon Linux 2017.03 v2.6.0 running Tomcat 8 Java 8',
  netIIS85: '4bit Windows Server 2012 R2 v1.2.0 running IIS 8.5',
  nodejs: '64bit Amazon Linux 2017.03 v4.1.0 running Node.js',
  php70: '64bit Amazon Linux 2017.03 v2.4.0 running PHP 7.0',
  python34: '64bit Amazon Linux 2017.03 v2.4.0 running Python 3.4',
  ruby23: '64bit Amazon Linux 2017.03 v2.4.0 running Ruby 2.3 (Puma)',
};

/**
 * Create a new ElasticBeanstalk configuration file.
 *
 * @param {Object} config         stack configuration object
 * @param {Object} logger         log instance
 *
 * @returns {undefined}
 */
async function createEBConfig(config, logger) {
  const templatePath = `${__dirname}/../../resources/eb.config.yml`;
  const filePath = `${process.cwd()}/.elasticbeanstalk/config.yml`;

  let content = await fsp.readFile(templatePath, 'utf-8');

  // create output dir if not exists
  await fsp.ensureDir(`${process.cwd()}/.elasticbeanstalk`);

  const variables = {
    APPLICATION_NAME: config.applicationName,
    APPLICATION_ENVIRONMENT: config.environmentName,
    REGION: config.region,
    ENV: config.env,
    KEY: config.key,
    PLATFORM: platforms[config.platform],
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
 * Configure docker run configuration file.
 *
 * @param {Object} S3     s3 instance
 * @param {Object} config config object
 * @param {Object} logger logger instance
 *
 * @returns {undefined}
 */
async function configureDockerRun(S3, config, logger) {
  const dockerRunFile = `${process.cwd()}/Dockerrun.aws.json`;
  const runtimeDockerRunFile = `${process.cwd()}/.serverless/Dockerrun.aws.json`;

  let content = await fsp.readFile(dockerRunFile, 'utf-8');

  const variables = {
    BUCKET_NAME: config.bucketName,
    CONFIG_FILE: config.configFile,
    IMAGE: config.image,
    VERSION: config.version,
  };

  Object.keys(variables).forEach((key) => {
    console.log('Replacing', `\${${key}}`, 'with', variables[key]);
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  });

  try {
    await fsp.writeFile(runtimeDockerRunFile, content);

    await S3.putObjectAsync({
      Bucket: config.bucketName,
      Key: 'Dockerrun.aws.json',
      Body: content,
    });
  } catch (error) {
    logger.log(error);
  }
}

/**
 * Create a new application version.
 *
 * @param {Object} EB     elastic beanstalk instance
 * @param {Object} params update environment parameters
 *
 * @returns {Object} update environment response
 */
async function deployApplicationVersion(EB, params) {
  return EB.createApplicationVersionAsync(params);
}

/**
 * Configure service for deployment.
 *
 * @returns {undefined}
 */
export default async function configure() {
  this.logger.log('Configuring ElasticBeanstalk Deployment...');

  const stackOutputs = await fsp.readJson(path.resolve(`${process.cwd()}/.serverless/stack-config.json`));

  const options = {
    applicationName: stackOutputs[this.config.variables.applicationName],
    environmentName: stackOutputs[this.config.variables.environmentName],
    platform: this.config.platform,
    env: this.options.env,
    key: this.options.key,
    region: this.options.region,
  };

  await createEBConfig(options, this.logger);

  if (this.config.docker) {
    let bucketName;
    let configFile;

    const docker = this.config.docker;

    if (docker && docker.auth) {
      bucketName = docker.auth.configBucketName;
      configFile = docker.auth.configFile;

      this.S3 = Promise.promisifyAll(
        new this.provider.sdk.S3({ region: this.options.region }),
      );

      this.logger.log('Uploading docker auth file to S3...');

      await this.S3.putObjectAsync({
        Bucket: bucketName,
        Key: configFile,
        Body: await fsp.readFile(configFile, 'utf-8'),
      });

      this.logger.log('docker auth file uploaded to to S3 successfully');
    }

    const dockerConfig = {
      bucketName,
      configFile,
      image: docker.image,
      version: docker.version,
    };

    await configureDockerRun(this.S3, dockerConfig, this.logger);

    this.EB = Promise.promisifyAll(
      new this.provider.sdk.ElasticBeanstalk({ region: this.options.region }),
    );

    const params = {
      ApplicationName: stackOutputs[this.config.variables.applicationName],
      SourceBundle: {
        S3Bucket: dockerConfig.bucketName,
        S3Key: 'Dockerrun.aws.json',
      },
      VersionLabel: dockerConfig.version,
    };

    await deployApplicationVersion(this.EB, params);
  }

  // execute custom script if provided
  if (this.config.script) {
    this.logger.log(`Executing custom script command: ${this.config.script}`);

    /* eslint global-require:0 import/no-dynamic-require:0 */
    const script = require(`${process.cwd()}/${this.config.script}`);

    await script(this.serverless, stackOutputs);
  }
}
