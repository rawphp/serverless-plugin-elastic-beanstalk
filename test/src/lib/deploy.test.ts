import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';
import { expect } from 'chai';
import * as fsp from 'fs-promise';
import * as path from 'path';
import * as Serverless from 'serverless';
import * as sinon from 'sinon';
import * as YAML from 'yamljs';
import deploy from './../../../src/lib/deploy';

const logger = console;

describe('deploy', () => {
  const sandbox = sinon.sandbox.create();
  const fixturePath = path.resolve(`${process.cwd()}/test/fixture`);

  const rootDir = `${process.cwd()}/test/fixture/.serverless`;
  const ebDir = `${process.cwd()}/.elasticbeanstalk`;
  let serverless;

  const S3 = BPromise.promisifyAll(
    new AWS.S3({ region: 'eu-west-1', apiVersion: '2006-03-01' }),
  );

  const EB = BPromise.promisifyAll(
    new AWS.ElasticBeanstalk({ region: 'eu-west-1' }),
  );

  const context: any = {
    artifactTmpDir: `${rootDir}/.artifacts`,
    config: {
      bucket: 'test-bucket',
      build: {
        babel: true,
        include: [
          'test/fixture/es6-sample-project/src/js/**',
        ],
        sourceMaps: true,
      },
      platform: 'nodejs',
      variables: {
        applicationName: 'testAppApplicationName',
        environmentName: 'testAppEnvironmentName',
      },
      version: '1.0.0',
    },
    deploy,
    getElasticBeanstalkInstance: sandbox.stub(),
    getS3Instance: sandbox.stub(),
    logger: { log: (message) => logger.log(message) },
    options: {
      env: 'dev',
      key: 'ec2-key',
      region: 'eu-west-1',
    },
  };

  const uploadStub = sandbox.stub(S3, 'uploadAsync');
  const createApplicationVersionStub = sandbox.stub(EB, 'createApplicationVersionAsync');
  const updateEnvironmentStub = sandbox.stub(EB, 'updateEnvironmentAsync');
  const describeEnvironmentsStub = sandbox.stub(EB, 'describeEnvironmentsAsync');

  beforeEach(async () => {
    serverless = new Serverless({});
    serverless.config.update({ servicePath: fixturePath });
    serverless.pluginManager.cliOptions = {
      stage: 'dev',
    };

    context.serverless = serverless;

    await serverless.init();

    context.getS3Instance.returns(S3);
    context.getElasticBeanstalkInstance.returns(EB);

    await fsp.ensureDir(rootDir);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('is function', () => {
    expect(typeof deploy).to.equal('function');
  });

  it('deploys the application successfully', async () => {
    uploadStub.returns(await fsp.readJson(`${fixturePath}/upload-app-s3-response.json`));
    createApplicationVersionStub.returns(await fsp.readJson(`${fixturePath}/create-eb-app-version-response.json`));
    updateEnvironmentStub.returns(await fsp.readJson(`${fixturePath}/update-env-response.json`));
    describeEnvironmentsStub.returns(await fsp.readJson(`${fixturePath}/describe-envs-response.json`));

    await context.deploy();

    expect(uploadStub.calledOnce).to.equal(true);
    expect(createApplicationVersionStub.calledOnce).to.equal(true);
    expect(updateEnvironmentStub.calledOnce).to.equal(true);
    expect(describeEnvironmentsStub.calledOnce).to.equal(true);
  });
});
