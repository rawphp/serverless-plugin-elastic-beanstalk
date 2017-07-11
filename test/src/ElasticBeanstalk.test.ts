import { expect } from 'chai';
import * as path from 'path';
import * as Serverless from 'serverless';
import * as sinon from 'sinon';
import ElasticBeanstalkPlugin from './../../src/ElasticBeanstalkPlugin';

const fixturePath = path.resolve(`${process.cwd()}/test/fixture`);

describe('ElasticBeanstalkPlugin', () => {
  let plugin;
  const sandbox = sinon.sandbox.create();
  let serverless;

  const options = {
    env: 'dev',
    key: 'ec2-key',
    region: 'eu-west-1',
  };

  beforeEach(async () => {
    serverless = new Serverless({});
    serverless.config.update({ servicePath: fixturePath });
    serverless.pluginManager.cliOptions = {
      stage: 'dev',
    };

    await serverless.init();

    plugin = new ElasticBeanstalkPlugin(serverless, options);
  });

  it('new ElasticBeanstalk', () => {
    expect(plugin).to.be.an.instanceOf(ElasticBeanstalkPlugin);
    expect(plugin.options).to.deep.equal(options);
  }).timeout(5000);
});
