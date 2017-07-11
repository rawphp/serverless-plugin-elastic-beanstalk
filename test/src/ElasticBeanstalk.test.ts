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

  beforeEach(async () => {
    serverless = new Serverless({});
    serverless.config.update({ servicePath: fixturePath });
    serverless.pluginManager.cliOptions = {
      stage: 'dev',
    };

    await serverless.init();

    plugin = new ElasticBeanstalkPlugin(serverless, {});
  });

  it('new ElasticBeanstalk', () => {
    expect(plugin).to.be.an.instanceOf(ElasticBeanstalkPlugin);
    expect(plugin.options).to.deep.equal({});
  });
});
