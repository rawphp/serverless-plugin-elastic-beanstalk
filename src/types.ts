import CLI from 'serverless/lib/classes/CLI';

export interface IServerless {
  config: any;
  cli: CLI;
  service: any;
  getProvider(type: string): any;
}

export interface IS3 {
  uploadAsync(params: any): Promise<any>;
}

export interface IEB {
  createApplicationVersionAsync(params: any): Promise<any>;
  updateEnvironmentAsync(params: any): Promise<any>;
  describeEnvironmentsAsync(params: any): Promise<any>;
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

export interface IElasticBeanstalkOptions { }
