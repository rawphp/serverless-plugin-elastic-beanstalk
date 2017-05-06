import Promise from 'bluebird';
import validate from './lib/validate';
import configure from './lib/configure';
import deploy from './lib/deploy';

class ElasticBeanstalk {
  /**
   * Create a new instance.
   *
   * @param {Object} serverless the Serverless instance
   * @param {Object} options    passed in options
   */
  constructor(serverless, options) {
    this.serverless = serverless;
    this.logger = this.serverless.cli;
    this.options = options;
    this.service = this.serverless.service;
    this.provider = serverless.getProvider('aws');

    if (this.service.custom) {
      this.config = this.service.custom['elastic-beanstalk'];
    }

    const commonOptions = {
      stage: {
        usage: 'Stage of the service',
        shortcut: 's',
      },
      region: {
        usage: 'Region of the service',
        shortcut: 'r',
      },
      verbose: {
        usage: 'Show all stack events during deployment',
        shortcut: 'v',
      },
    };

    this.commands = {
      'elastic-beanstalk': {
        usage: 'Deploys the application to AWS ElasticBeanstalk',
        lifecycleEvents: [
          'validate',
          'configure',
          'deploy',
        ],
        options: commonOptions,
      },
    };

    this.hooks = {
      'elastic-beanstalk:deploy': () => Promise.bind(this)
        .then(validate)
        .then(configure)
        .then(deploy),

      // TODO: figure out how to cancel a hook if not required to run
      // 'after:outputs:download:download': () => Promise.bind(this)
      //   .then(validate)
      //   .then(configure)
      //   .then(deploy),
    };
  }
}

module.exports = ElasticBeanstalk;
