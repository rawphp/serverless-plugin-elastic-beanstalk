import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';
import { expect } from 'chai';
import * as fsp from 'fs-promise';
import * as path from 'path';
import * as Serverless from 'serverless';
import * as zipper from 'zip-unzip-promise';
import getContext from '../../stubs/context';
import { getElasticBeanstalkInstance, getS3Instance } from './../../../src/lib/AWS';

describe('AWS', () => {
  const fixturePath = path.resolve(`${process.cwd()}/test/fixture`);

  describe('getElasticBeanstalkInstance', () => {
    let serverless;

    beforeEach(async () => {
      serverless = new Serverless({});
      serverless.config.update({ servicePath: fixturePath });
      serverless.pluginManager.cliOptions = {
        stage: 'dev',
      };

      await serverless.init();
    });

    it('correctly returns an ElasticBeanstalk instance', () => {
      const eb = getElasticBeanstalkInstance(serverless, 'eu-west-1');

      expect(eb instanceof AWS.ElasticBeanstalk);
    }).timeout(5000);
  });

  describe('S3', () => {
    let serverless;

    beforeEach(async () => {
      serverless = new Serverless({});
      serverless.config.update({ servicePath: fixturePath });
      serverless.pluginManager.cliOptions = {
        stage: 'dev',
      };

      await serverless.init();
    });

    it('correctly returns an S3 instance', () => {
      const eb = getS3Instance(serverless, 'eu-west-1');

      expect(eb instanceof AWS.S3);
    }).timeout(5000);
  });
});
