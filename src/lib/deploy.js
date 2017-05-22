import Promise from 'bluebird';
import fsp from 'fs-promise';
import path from 'path';
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
  this.config.version = getVersion(this.config);

  const applicationName = config[this.config.variables.applicationName];
  const environmentName = config[this.config.variables.environmentName];
  const versionLabel = `${applicationName}-${this.config.version}`;
  const fileName = `bundle-${versionLabel}.zip`;
  const bundlePath = path.resolve(this.artifactTmpDir, fileName);

  process.env.PATH = `/root/.local/bin:${process.env.PATH}`;

  this.S3 = Promise.promisifyAll(
    new this.provider.sdk.S3({
      apiVersion: '2006-03-01',
      region: this.options.region,
    }),
  );

  this.logger.log('Uploading Application Bundle to S3...');

  await this.S3.uploadAsync({
    Bucket: this.config.bucket,
    Key: fileName,
    Body: fsp.createReadStream(bundlePath),
  });

  this.logger.log('Application Bundle Uploaded to S3 Successfully');

  this.EB = Promise.promisifyAll(
    new this.provider.sdk.ElasticBeanstalk({ apiVersion: '2010-12-01', region: this.options.region }),
  );

  this.logger.log('Creating New Application Version...');

  await this.EB.createApplicationVersionAsync({
    ApplicationName: applicationName,
    VersionLabel: versionLabel,
    Process: true,
    SourceBundle: {
      S3Bucket: this.config.bucket,
      S3Key: fileName,
    },
  });

  this.logger.log('New Application Version Created Successfully');
  this.logger.log('Updating Application Environment...');

  await this.EB.updateEnvironmentAsync({
    ApplicationName: applicationName,
    EnvironmentName: environmentName,
    VersionLabel: versionLabel,
  });

  let updated = false;

  this.logger.log('Waiting for environment...');

  while (!updated) {
    const response = await this.EB.describeEnvironmentsAsync({ // eslint-disable-line
      EnvironmentNames: [environmentName],
    });

    if (response.Environments[0].Status === 'Ready') {
      updated = true;
    } else {
      Promise.delay(5000);
    }
  }

  this.logger.log('Application Environment Updated Successfully');
  this.logger.log('Application Deployed Successfully');
}
