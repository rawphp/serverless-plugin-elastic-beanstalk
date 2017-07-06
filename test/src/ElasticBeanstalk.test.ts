import { expect } from 'chai';
import * as sinon from 'sinon';
import ElasticBeanstalk from './../../src';

describe('ElasticBeanstalk', () => {
  let eb;
  const sandbox = sinon.sandbox.create();
  const serverless = {
    cli: {},
    config: {
      servicePath: '',
    },
    getProvider: sandbox.stub(),
    service: {},
  };

  beforeEach(() => {
    eb = new ElasticBeanstalk(serverless, {});
  });

  it('new ElasticBeanstalk', () => {
    expect(eb).to.be.an.instanceOf(ElasticBeanstalk);
    expect(eb.serverless.getProvider.called).to.equal(true);
    expect(eb.options).to.deep.equal({});
  });
});
