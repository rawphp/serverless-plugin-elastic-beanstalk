import * as BPromise from 'bluebird';
import * as path from 'path';
import * as IServerless from 'serverless';
import CLI from 'serverless/lib/classes/CLI';
import { getElasticBeanstalkInstance, getS3Instance } from './lib/AWS';
import build from './lib/build';
import configure from './lib/configure';
import deploy from './lib/deploy';
import validate from './lib/validate';
import {
  IElasticBeanstalk,
  IElasticBeanstalkCommands,
  IElasticBeanstalkHooks,
  IElasticBeanstalkOptions,
  IPluginConfig,
} from './types';

export default class ElasticBeanstalkPlugin implements IElasticBeanstalk {
  private serverless: IServerless;
  private servicePath: string;
  private options: IElasticBeanstalkOptions;
  private config: IPluginConfig;
  private logger: CLI;
  private service: any;
  private tmpDir: string;
  private artifactTmpDir: string;
  private commands: IElasticBeanstalkCommands;
  private hooks: IElasticBeanstalkHooks;
  private getS3Instance;
  private getElasticBeanstalkInstance;

  /**
   * Create a new instance.
   *
   * @param {IServerless}              serverless the Serverless instance
   * @param {IElasticBeanstalkOptions} options    passed in options
   */
  constructor(serverless: IServerless, options: IElasticBeanstalkOptions) {
    this.serverless = serverless;
    this.options = options;
    this.servicePath = this.serverless.config.servicePath;
    this.logger = this.serverless.cli;
    this.service = this.serverless.service;

    this.tmpDir = path.join(this.servicePath, '/.serverless');
    this.artifactTmpDir = path.join(this.tmpDir, './artifacts');

    if (this.service.custom) {
      this.config = this.service.custom['elastic-beanstalk'];
    }

    this.commands = this.defineCommands();
    this.hooks = this.defineHooks();

    this.getS3Instance = getS3Instance;
    this.getElasticBeanstalkInstance = getElasticBeanstalkInstance;
  }

  /**
   * Define plugin commands.
   *
   * @returns {IElasticBeanstalkCommands} the commands
   */
  public defineCommands(): IElasticBeanstalkCommands {
    const commonOptions = {
      region: {
        shortcut: 'r',
        usage: 'Region of the service',
      },
      stage: {
        shortcut: 's',
        usage: 'Stage of the service',
      },
      verbose: {
        shortcut: 'v',
        usage: 'Show all stack events during deployment',
      },
    };

    return {
      'elastic-beanstalk': {
        lifecycleEvents: [
          'validate',
          'configure',
          'deploy',
        ],
        options: commonOptions,
        usage: 'Deploys the application to AWS ElasticBeanstalk',
      },
    };
  }

  /**
   * Define plugin hooks.
   *
   * @returns {IElasticBeanstalkHooks} the hooks
   */
  public defineHooks(): IElasticBeanstalkHooks {
    return {
      'elastic-beanstalk:deploy': () => BPromise.bind(this)
        .then(validate)
        .then(configure)
        .then(build)
        .then(deploy),
    };
  }
}
