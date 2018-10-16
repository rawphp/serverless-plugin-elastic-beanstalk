import CLI from 'serverless/lib/classes/CLI';

export interface IServerless {
  config: any;
  cli: CLI;
  service: any;
  getProvider(type: string): any;
}

export interface IBuildConfig {
  babel?: boolean;
  sourceMaps?: boolean;
  include?: string[];
}

export interface IProjectVariables {
  applicationName: string;
  environmentName: string;
}

export interface IPluginConfig {
  variables: IProjectVariables;
  key: string;
  platform: string;
  bucket: string;
  file?: {
    prefix: string;
    name: string;
  };
  version: string;
  build: IBuildConfig;
}

export interface IElasticBeanstalkCommands {
  'elastic-beanstalk';
}

export interface IElasticBeanstalkHooks {
  'elastic-beanstalk:deploy';
}

export interface IElasticBeanstalk {
  /**
   * Define plugin commands.
   *
   * @returns {IElasticBeanstalkCommands} the commands
   */
  defineCommands(): IElasticBeanstalkCommands;
  /**
   * Define plugin hooks.
   *
   * @returns {IElasticBeanstalkHooks} the hooks
   */
  defineHooks(): IElasticBeanstalkHooks;
}

export interface IElasticBeanstalkOptions {
  env: string;
  key: string;
  region: string;
}
