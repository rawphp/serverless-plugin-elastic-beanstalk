import * as BPromise from 'bluebird';
import { expect } from 'chai';
import * as fsp from 'fs-promise';
import * as YAML from 'yamljs';
import configure from './../../../src/lib/configure';

describe('configure', () => {
  const ebDir = `${process.cwd()}/.elasticbeanstalk`;

  const context = {
    config: {
      build: {
        babel: true,
        include: [
          'test/fixture/es6-sample-project/src/js/**',
        ],
        sourceMaps: true,
      },
      platform: 'nodejs',
      variables: {
        applicationName: 'testAppApplicationName',
        environmentName: 'testAppEnvironmentName',
      },
      version: '1.0.0',
    },
    configure,
    logger: { log: () => this },
    options: {
      env: 'dev',
      key: 'ec2-key',
      region: 'eu-west-1',
    },
  };

  it('is function', () => {
    expect(typeof configure).to.equal('function');
  });

  it('configures the application for deployment correctly', async () => {
    await context.configure();

    const yaml = (await fsp.readFile(`${ebDir}/config.yml`)).toString();

    const obj = YAML.parse(yaml);

    expect(obj['branch-defaults'].master.environment).to.equal('app-environment-name');
    expect(obj['environment-defaults']['app-environment-name'].branch).to.equal('master');
    expect(obj['environment-defaults']['app-environment-name'].repository).to.equal(null);
    expect(obj.global.application_name).to.equal('app-name');
    expect(obj.global.branch).to.equal(null);
    expect(obj.global.default_ec2_keyname).to.equal('ec2-key');
    expect(obj.global.default_platform).to.equal('64bit Amazon Linux 2017.03 v4.2.1 running Node.js');
    expect(obj.global.default_region).to.equal('eu-west-1');
    expect(obj.global.instance_profile).to.equal(null);
    expect(obj.global.platform_name).to.equal(null);
    expect(obj.global.platform_version).to.equal(null);
    expect(obj.global.profile).to.equal('dev');
    expect(obj.global.repository).to.equal(null);
    expect(obj.global.sc).to.equal('git');
    expect(obj.global.workspace_type).to.equal('Application');
  });

  describe('docker', () => {
    it('is not tested', () => {
      // tslint:disable-next-line:no-console
      console.log('NOTE:: DOCKER NOT TESTED');
    });
  });
});
