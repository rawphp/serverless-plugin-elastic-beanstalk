import * as IPromise from 'bluebird';
import * as fsp from 'fs-promise';
import * as path from 'path';
import { IEB, IS3 } from '../index.d';
import getVersion from './getVersion';

/**
 * Retrieves stack Ouputs from AWS.
 *
 * @returns {undefined}
 */
export default async function deploy() {
  this.logger.log('Deploying Application to ElasticBeanstalk...');

  const configPath = `${process.cwd()}/.serverless/stack-config.json`;

  const config = await fsp.readJson(configPath);
  this.config.version = getVersion(this.config.version);

  const applicationName = config[this.config.variables.applicationName];
  const environmentName = config[this.config.variables.environmentName];
  const versionLabel = `${applicationName}-${this.config.version}`;
  const fileName = `bundle-${versionLabel}.zip`;
  const bundlePath = path.resolve(this.artifactTmpDir, fileName);

  process.env.PATH = `/root/.local/bin:${process.env.PATH}`;

  const S3: IS3 = this.getS3Instance(this.serverless, this.options.region);

  this.logger.log('Uploading Application Bundle to S3...');

  await S3.uploadAsync({
    Body: fsp.createReadStream(bundlePath),
    Bucket: this.config.bucket,
    Key: fileName,
  });

  this.logger.log('Application Bundle Uploaded to S3 Successfully');

  const EB: IEB = this.getElasticBeanstalkInstance(this.serverless, this.options.region);

  this.logger.log('Creating New Application Version...');

  await EB.createApplicationVersionAsync({
    ApplicationName: applicationName,
    Process: true,
    SourceBundle: {
      S3Bucket: this.config.bucket,
      S3Key: fileName,
    },
    VersionLabel: versionLabel,
  });

  this.logger.log('New Application Version Created Successfully');
  this.logger.log('Updating Application Environment...');

  await EB.updateEnvironmentAsync({
    ApplicationName: applicationName,
    EnvironmentName: environmentName,
    VersionLabel: versionLabel,
  });

  let updated = false;

  this.logger.log('Waiting for environment...');

  while (!updated) {
    const response = await EB.describeEnvironmentsAsync({
      EnvironmentNames: [environmentName],
    });

    if (response.Environments[0].Status === 'Ready') {
      updated = true;
    } else {
      IPromise.delay(5000);
    }
  }

  this.logger.log('Application Environment Updated Successfully');
  this.logger.log('Application Deployed Successfully');
}
