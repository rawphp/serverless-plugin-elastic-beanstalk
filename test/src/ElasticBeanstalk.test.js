import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import ElasticBeanstalk from './../../src';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('ElasticBeanstalk', () => {
  let eb;
  const sandbox = sinon.sandbox.create();
  const serverless = {
    cli: {},
    service: {},
    getProvider: sandbox.stub(),
  };

  beforeEach(() => {
    eb = new ElasticBeanstalk(serverless, {});
  });

  it('new ElasticBeanstalk', () => {
    expect(eb).to.be.an.instanceOf(ElasticBeanstalk);
    expect(eb.serverless.getProvider).to.have.been.called();
    expect(eb.options).to.deep.equal({});
  });
});
