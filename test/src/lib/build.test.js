import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import fsp from 'fs-promise';
import build from './../../../src/lib/build';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('build', () => {
  const rootDir = `${process.cwd()}/.serverless`;
  const configPath = `${rootDir}/stack-config.json`;

  const context = {
    logger: { log: () => { } },
    build,
    config: {
      variables: {
        applicationName: 'testAppApplicationName',
        environmentName: 'testAppEnvironmentName',
      },
      build: {
        babel: true,
        sourceMaps: true,
        include: [
          'src/**',
        ],
      },
      version: '1.0.0',
    },
    artifactTmpDir: `${rootDir}/.artifacts`,
  };

  const config = {
    testAppApplicationName: 'app-name',
    testAppEnvironmentName: 'app-environment-name',
  };

  beforeEach(async () => {
    await fsp.ensureDir(rootDir);
    await fsp.writeJson(configPath, config);
  });

  it('is function', () => {
    expect(typeof build).to.equal('function');
  });

  it('builds the application bundle successfully', async () => {
    await context.build();
  }).timeout(100000);
});
