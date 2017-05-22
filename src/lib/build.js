import path from 'path';
import Yazl from 'yazl';
import fsp from 'fs-promise';
import ModuleBundler from './ModuleBundler';
import SourceBundler from './SourceBundler';
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
  const environmentName = config[this.config.variables.environmentName];
  const versionLabel = `${applicationName}-${this.config.version}`;
  const fileName = `bundle-${versionLabel}.zip`;

  this.logger.log(`Creating ${fileName}`);

  await fsp.ensureDir(this.artifactTmpDir);

  const artifact = new Yazl.ZipFile();
  const moduleIncludes = [];

  await new SourceBundler({
    ...this.config.build,
    servicePath: this.servicePath,
  }, artifact)
    .bundle({
      exclude: [],
      include: this.config.build.include,
    });

  await new ModuleBundler({
    ...this.config,
    servicePath: this.servicePath,
  },
    artifact,
  )
    .bundle({
      include: moduleIncludes,
      ...this.config.modules,
    });

  const zipPath = path.resolve(this.artifactTmpDir, fileName);

  await new Promise((resolve, reject) => {
    artifact.outputStream.pipe(fsp.createWriteStream(zipPath))
      .on('error', reject)
      .on('close', resolve);

    artifact.end();
  });

  this.logger.log('Application Bundle Built Successfully');
}
