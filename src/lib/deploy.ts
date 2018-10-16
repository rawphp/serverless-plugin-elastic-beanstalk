import * as BPromise from 'bluebird';
import * as fsp from 'fs-promise';
import * as path from 'path';
import { ElasticBeanstalk, S3 } from "aws-sdk";
import { IPluginConfig } from '../types';
import getVersion from './getVersion';

/**
 * Retrieves stack Ouputs from AWS.
 *
 * @returns {undefined}
 */
export default async function deploy() {
  this.logger.log('Deploying Application to ElasticBeanstalk...');

  const configPath = `${process.cwd()}/.serverless/stack-config.json`;

  const ebConfig: IPluginConfig = this.config;

  const config = await fsp.readJson(configPath);
  ebConfig.version = getVersion(ebConfig.version);

  const applicationName = config[ebConfig.variables.applicationName];
  const environmentName = config[ebConfig.variables.environmentName];
  const versionLabel = `${applicationName}-${ebConfig.version}`;

  let fileName = `bundle-${versionLabel}.zip`;

  if (ebConfig.file) {
    fileName = ebConfig.file.prefix ? `${ebConfig.file.prefix}/` : '';
    fileName += ebConfig.file.name ? `${ebConfig.file.name}` : `bundle-${versionLabel}.zip`;
  }

  const bundlePath = path.resolve(this.artifactTmpDir, `bundle-${versionLabel}.zip`);

  process.env.PATH = `/root/.local/bin:${process.env.PATH}`;

  const S3: S3 = this.getS3Instance(this.serverless, this.options.region);

  this.logger.log('Uploading Application Bundle to S3...');

  this.logger.log(
    JSON.stringify(
      await S3.upload({
        Body: fsp.createReadStream(bundlePath),
        Bucket: ebConfig.bucket,
        Key: fileName,
      }).promise(),
    ),
  );

  this.logger.log('Application Bundle Uploaded to S3 Successfully');

  const EB: ElasticBeanstalk = this.getElasticBeanstalkInstance(this.serverless, this.options.region);

  this.logger.log('Creating New Application Version...');

  this.logger.log(
    JSON.stringify(
      await EB.createApplicationVersion({
        ApplicationName: applicationName,
        Process: true,
        SourceBundle: {
          S3Bucket: ebConfig.bucket,
          S3Key: fileName,
        },
        VersionLabel: versionLabel,
      }).promise(),
    ),
  );

  this.logger.log('Waiting for application version...');

  let updated = false;

  while (!updated) {
    const response = await EB.describeApplicationVersions({
      VersionLabels: [versionLabel],
    }).promise();

    this.logger.log(JSON.stringify(response));

    if (response.ApplicationVersions[0].Status === 'PROCESSED') {
      updated = true;
    } else if (response.ApplicationVersions[0].Status === 'FAILED') {
      throw new Error('Creating Application Version Failed');
    } else {
      await BPromise.delay(5000);
    }
  }

  this.logger.log('New Application Version Created Successfully');
  this.logger.log('Updating Application Environment...');

  this.logger.log(
    JSON.stringify(
      await EB.updateEnvironment({
        ApplicationName: applicationName,
        EnvironmentName: environmentName,
        VersionLabel: versionLabel,
      }).promise(),
    ),
  );

  this.logger.log('Waiting for environment...');

  updated = false;

  while (!updated) {
    const response = await EB.describeEnvironments({
      EnvironmentNames: [environmentName],
    }).promise();

    this.logger.log(JSON.stringify(response));

    if (response.Environments[0].Status === 'Ready') {
      updated = true;
    } else {
      await BPromise.delay(5000);
    }
  }

  this.logger.log('Application Environment Updated Successfully');
  this.logger.log('Application Deployed Successfully');
}
