import fsp from 'fs-promise';
import Bundler from 'bundle-bundler';
import getVersion from './getVersion';

/**
 * Builds the application.
 *
 * @returns {undefined}
 */
export default async function build() {
  this.logger.log('Building Application Bundle...');

  const configPath = `${process.cwd()}/.serverless/stack-config.json`;

  const config = await fsp.readJson(configPath);
  this.config.version = getVersion(this.config);

  const applicationName = config[this.config.variables.applicationName];
  const versionLabel = `${applicationName}-${this.config.version}`;
  const fileName = `bundle-${versionLabel}.zip`;

  this.logger.log(`Creating ${fileName}`);

  await fsp.ensureDir(this.artifactTmpDir);

  const buildConfig = this.config.build;

  const bundler = new Bundler({
    rootDir: process.cwd(),
    logger: this.logger,
    babel: buildConfig.babel || false,
    sourceMaps: buildConfig.sourceMaps || false,
  });

  await bundler.bundle({
    output: `${this.artifactTmpDir}/${fileName}`,
    include: this.config.build.include,
  });
}
