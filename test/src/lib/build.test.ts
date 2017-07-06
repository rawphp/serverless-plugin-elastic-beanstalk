import * as BPromise from 'bluebird';
import { expect } from 'chai';
import * as fsp from 'fs-promise';
import * as zipper from 'zip-unzip-promise';
import build from './../../../src/lib/build';

describe('build', () => {
  const rootDir = `${process.cwd()}/.serverless`;
  const configPath = `${rootDir}/stack-config.json`;

  const context = {
    artifactTmpDir: `${rootDir}/.artifacts`,
    build,
    config: {
      build: {
        babel: true,
        include: [
          'test/fixture/es6-sample-project/src/js/**',
        ],
        sourceMaps: true,
      },
      variables: {
        applicationName: 'testAppApplicationName',
        environmentName: 'testAppEnvironmentName',
      },
      version: '1.0.0',
    },
    logger: { log: () => this },
  };

  const config = {
    testAppApplicationName: 'app-name',
    testAppEnvironmentName: 'app-environment-name',
  };

  beforeEach(async () => {
    await fsp.ensureDir(rootDir);
    await fsp.writeJson(configPath, config);
  });

  afterEach(async () => {
    await fsp.remove(context.artifactTmpDir);
  });

  it('is function', () => {
    expect(typeof build).to.equal('function');
  });

  it('builds the application bundle successfully', async () => {
    // tslint:disable-next-line:max-line-length
    const artifactPath = `${context.artifactTmpDir}/bundle-${config.testAppApplicationName}-${context.config.version}.zip`;
    const extractPath = `${context.artifactTmpDir}/${config.testAppApplicationName}`;

    await context.build();

    expect(await fsp.exists(artifactPath)).to.equal(true);

    await zipper.unzip(artifactPath, extractPath);

    expect(await fsp.exists(`${extractPath}/node_modules`));
    expect(await fsp.exists(`${extractPath}/test`));
    expect(await fsp.exists(`${extractPath}/test/fixture`));
    expect(await fsp.exists(`${extractPath}/test/fixture/es6-sample-project`));
    expect(await fsp.exists(`${extractPath}/test/fixture/es6-sample-project/src`));
    expect(await fsp.exists(`${extractPath}/test/fixture/es6-sample-project/src/js`));
    expect(await fsp.exists(`${extractPath}/test/fixture/es6-sample-project/src/js/drag.js`));
    expect(await fsp.exists(`${extractPath}/test/fixture/es6-sample-project/src/js/drag.js.map`));
  }).timeout(100000);
});
