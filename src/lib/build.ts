import Bundler from 'bundle-bundler';
import * as fsp from 'fs-promise';
import { IBuildConfig, IPluginConfig } from "../index.d";
import getVersion from './getVersion';

/**
 * Builds the application.
 *
 * @returns {undefined}
 */
export default async function build(): Promise<void> {
  this.logger.log('Building Application Bundle...');

  const configPath: string = `${process.cwd()}/.serverless/stack-config.json`;

  const config: IPluginConfig = await fsp.readJson(configPath);
  this.config.version = getVersion(this.config.version);

  const applicationName: string = config[this.config.variables.applicationName];
  const versionLabel: string = `${applicationName}-${this.config.version}`;
  const fileName: string = `bundle-${versionLabel}.zip`;

  this.logger.log(`Creating ${fileName}`);

  // make sure artifact directory exists
  await fsp.ensureDir(this.artifactTmpDir);

  // get build configuration -- required
  const buildConfig: IBuildConfig = this.config.build;

  const bundler = new Bundler({
    babel: buildConfig.babel || false,
    logger: this.logger,
    rootDir: process.cwd(),
    sourceMaps: buildConfig.sourceMaps || false,
  });

  await bundler.bundle({
    include: this.config.build.include,
    output: `${this.artifactTmpDir}/${fileName}`,
  });
}
