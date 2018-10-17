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

/**
 * Stub AWS function response, that returns an object with promise function
 * Promise function return the file, read with fsp.readJson
 * @param  {string} filePath -
 * @return {object} - { promise() }
 */
function stubAWSFunc(filePath){
  return {
    promise: async () => {
      return await fsp.readJson(filePath);
    }
  }
}

describe('deploy', function() {
  this.timeout(5000);
   const sandbox = sinon.sandbox.create();
   const fixturePath = path.resolve(`${process.cwd()}/test/fixture`);

   const rootDir = `${process.cwd()}/test/fixture/.serverless`;
   const ebDir = `${process.cwd()}/.elasticbeanstalk`;
   let serverless;

   const S3 = BPromise.promisifyAll(new AWS.S3({ region: 'eu-west-1', apiVersion: '2006-03-01' }));

   const EB = BPromise.promisifyAll(new AWS.ElasticBeanstalk({ region: 'eu-west-1' }));

   const context: any = {
     artifactTmpDir: `${rootDir}/.artifacts`,
     config: {
       bucket: 'test-bucket',
       file: {
         prefix: 'bundles',
         file: 'bundle-latest.zip',
       },
       build: {
         babel: true,
         include: ['test/fixture/es6-sample-project/src/js/**'],
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

  const uploadStub = sandbox.stub(S3, 'upload');
  const createApplicationVersionStub = sandbox.stub(EB, 'createApplicationVersion');
  const updateEnvironmentStub = sandbox.stub(EB, 'updateEnvironment');
  const describeApplicationVersionsStub = sandbox.stub(EB, 'describeApplicationVersions');
  const describeEnvironmentsStub = sandbox.stub(EB, 'describeEnvironments');

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
    uploadStub.returns(stubAWSFunc(`${fixturePath}/upload-app-s3-response.json`));
    createApplicationVersionStub.returns(
      stubAWSFunc(`${fixturePath}/create-eb-app-version-response.json`)
    );
    updateEnvironmentStub.returns(stubAWSFunc(`${fixturePath}/update-env-response.json`));
    describeApplicationVersionsStub.returns(
      stubAWSFunc(`${fixturePath}/describe-app-versions-response.json`)
    );
    describeEnvironmentsStub.returns(stubAWSFunc(`${fixturePath}/describe-envs-response.json`));

    await context.deploy();

    expect(uploadStub.calledOnce).to.equal(true);
    expect(createApplicationVersionStub.calledOnce).to.equal(true);
    expect(updateEnvironmentStub.calledOnce).to.equal(true);
    expect(describeEnvironmentsStub.calledOnce).to.equal(true);
  }).timeout(10000);

  it('fails to deploy the application', async () => {
    uploadStub.returns(stubAWSFunc(`${fixturePath}/upload-app-s3-response.json`));
    createApplicationVersionStub.returns(
      stubAWSFunc(`${fixturePath}/create-eb-app-version-response.json`)
    );
    describeApplicationVersionsStub.returns(
      stubAWSFunc(`${fixturePath}/describe-app-versions-failed-response.json`),
    );

    try {
      await context.deploy();
    } catch (error) {
      // console.log(error);
    }

    expect(uploadStub.calledOnce).to.equal(true);
    expect(createApplicationVersionStub.calledOnce).to.equal(true);
    expect(updateEnvironmentStub.called).to.equal(false);
    expect(describeEnvironmentsStub.called).to.equal(false);
  }).timeout(10000);
});
