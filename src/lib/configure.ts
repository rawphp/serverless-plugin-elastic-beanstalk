import * as BPromise from 'bluebird';
import * as fsp from 'fs-promise';
import * as path from 'path';
import CLI from 'serverless/lib/classes/CLI';
import { IEB, IS3 } from "../types";

/**
 * List of supported platforms.
 *
 * @see http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts.platforms.html
 */
const platforms = {
  go: '64bit Amazon Linux 2017.03 v2.4.2 running Go 1.7',
  java8SE: '64bit Amazon Linux 2017.03 v2.5.1 running Java 8',
  java8Tomcat8: '64bit Amazon Linux 2017.03 v2.6.1 running Tomcat 8 Java 8',
  multiContainerDocker: '64bit Amazon Linux 2017.03 v2.7.1 running Multi-container Docker 17.03.1-ce (Generic)',
  netIIS85: '64bit Windows Server 2016 v1.2.0 running IIS 10.0',
  nodejs: '64bit Amazon Linux 2017.03 v4.2.0 running Node.js',
  packer: '64bit Amazon Linux 2017.03 v2.2.2 running Packer 1.0.0',
  php70: '64bit Amazon Linux 2017.03 v2.4.1 running PHP 7.0',
  python34: '64bit Amazon Linux 2017.03 v2.4.1 running Python 3.4',
  ruby23: '64bit Amazon Linux 2017.03 v2.4.1 running Ruby 2.3 (Puma)',
  singleContainerDocker: '64bit Amazon Linux 2017.03 v2.7.0 running Docker 17.03.1-ce',
};

/**
 * Create a new ElasticBeanstalk configuration file.
 *
 * @param {Object} config stack configuration object
 * @param {Object} logger log instance
 *
 * @returns {undefined}
 */
async function createEBConfig(config: any, logger: CLI): Promise<void> {
  const templatePath = `${__dirname}/../../resources/eb.config.yml`;
  const filePath = `${process.cwd()}/.elasticbeanstalk/config.yml`;

  let content = await fsp.readFile(templatePath, 'utf-8');

  // create output dir if not exists
  await fsp.ensureDir(`${process.cwd()}/.elasticbeanstalk`);

  const variables = {
    APPLICATION_ENVIRONMENT: config.environmentName,
    APPLICATION_NAME: config.applicationName,
    ENV: config.env,
    KEY: config.key,
    PLATFORM: platforms[config.platform],
    REGION: config.region,
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
 * @param {IS3}    S3     s3 instance
 * @param {Object} config config object
 * @param {Object} logger logger instance
 *
 * @returns {undefined}
 */
async function configureDockerRun(S3: IS3, config: any, logger: CLI): Promise<void> {
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
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  });

  try {
    await fsp.writeFile(runtimeDockerRunFile, content);

    await S3.uploadAsync({
      Body: content,
      Bucket: config.bucketName,
      Key: 'Dockerrun.aws.json',
    });
  } catch (error) {
    logger.log(error);
  }
}

/**
 * Create a new application version.
 *
 * @param {IEB}    EB     elastic beanstalk instance
 * @param {Object} params update environment parameters
 *
 * @returns {Object} update environment response
 */
async function deployApplicationVersion(EB: IEB, params: any): Promise<any> {
  return EB.createApplicationVersionAsync(params);
}

/**
 * Configure service for deployment.
 *
 * @returns {undefined}
 */
export default async function configure(): Promise<void> {
  this.logger.log('Configuring ElasticBeanstalk Deployment...');

  const stackOutputs = await fsp.readJson(path.resolve(`${process.cwd()}/.serverless/stack-config.json`));

  const options = {
    applicationName: stackOutputs[this.config.variables.applicationName],
    env: this.options.env,
    environmentName: stackOutputs[this.config.variables.environmentName],
    key: this.options.key,
    platform: this.config.platform,
    region: this.options.region,
  };

  await createEBConfig(options, this.logger);

  if (this.config.docker) {
    let bucketName;
    let configFile;

    const docker = this.config.docker;

    const S3: IS3 = this.getS3Instance(this.serverless, this.options.region);

    if (docker && docker.auth) {
      bucketName = docker.auth.configBucketName;
      configFile = docker.auth.configFile;

      this.logger.log('Uploading docker auth file to S3...');

      await S3.uploadAsync({
        Body: await fsp.readFile(configFile, 'utf-8'),
        Bucket: bucketName,
        Key: configFile,
      });

      this.logger.log('docker auth file uploaded to to S3 successfully');
    }

    const dockerConfig = {
      bucketName,
      configFile,
      image: docker.image,
      version: docker.version,
    };

    await configureDockerRun(S3, dockerConfig, this.logger);

    const EB: IEB = this.getElasticBeanstalkInstance(this.serverless, this.options.region);

    const params = {
      ApplicationName: stackOutputs[this.config.variables.applicationName],
      SourceBundle: {
        S3Bucket: dockerConfig.bucketName,
        S3Key: 'Dockerrun.aws.json',
      },
      VersionLabel: dockerConfig.version,
    };

    await deployApplicationVersion(EB, params);
  }

  // execute custom script if provided
  if (this.config.script) {
    this.logger.log(`Executing custom script command: ${this.config.script}`);

    const script = require(`${process.cwd()}/${this.config.script}`);

    await script(this.serverless, stackOutputs);
  }
}
