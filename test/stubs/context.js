import sinon from 'sinon';

/**
 * Returns a new context.
 *
 * @returns {Object} new test context
 */
function getContext() {
  const sandbox = sinon.sandbox.create();
  const context = sandbox.mock();

  context.logSpy = sandbox.spy();
  context.serverless = {
    cli: {},
    service: { service: 'test-service' },
    provider: {},
    variables: {},
  };
  context.service = { service: 'test-service' };
  context.CF = {
    describeStacksAsync: sandbox.stub(),
  };
  context.S3 = {
    getObjectAsync: sandbox.stub(),
    putObjectAsync: sandbox.stub(),
  };
  context.options = { stage: 'dev', path: '/tmp' };
  context.logger = {
    log: args => context.logSpy(args),
    error: args => context.errorSpy(args),
  };
  context.backup = {
    s3: {
      key: 'serverless-config.json',
      bucket: 'my-test-bucket',
      shallow: true,
    },
  };

  return context;
}

export default getContext;
