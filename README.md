# Elastic Beanstalk Deployment Plugin

[![Build Status](https://travis-ci.org/rawphp/serverless-plugin-elastic-beanstalk.svg?branch=master)](https://travis-ci.org/rawphp/serverless-plugin-elastic-beanstalk)

A serverless plugin to deploy applications to AWS ElasticBeanstalk.

## Dependencies

* This plugin is dependent on the output of [Stack Config Plugin for Serverless](https://www.npmjs.com/package/serverless-plugin-stack-config)

## Features

* `elastic-beanstalk` - This uploads an ElasticBeanstalk application.

## Install

```shell
npm install --save serverless-plugin-elastic-beanstalk
```

## Usage

Add the plugin to your `serverless.yml` like the following:

### serverless.yml:

```yaml
provider:
...

plugins:
  - serverless-plugin-elastic-beanstalk

custom:
  elastic-beanstalk:
    variables:
      applicationName: CartApplicationName
      environmentName: CartApplicationEvironmentName
    key: ${opt:key}
    file:
      prefix: bundles
      name: bundle-latest.zip
    platform: nodejs
    script: scripts/configure.js
    build:
      babel: true
      sourceMaps: true
      include:
        - .ebextensions/**
        - src/**
        - resources/schema/**
        - package.json

functions:
...
resources:
  Resources:
    CartApplication:
      Type: AWS::ElasticBeanstalk::Application
      Properties:
        ApplicationName: ${self:service}
        Description: Cart application
    CartEnvironment:
      Type: AWS::ElasticBeanstalk::Environment
      Properties:
        ApplicationName:
          Ref: CartApplication
        Description: Cart environment
        SolutionStackName: '64bit Amazon Linux 2017.03 v4.4.5 running Node.js'
        OptionSettings:
        - Namespace: aws:elasticbeanstalk:container:nodejs
          OptionName: NodeVersion
          Value: '7.6.0'
        - Namespace: aws:elasticbeanstalk:environment
          OptionName: EnvironmentType
          Value: SingleInstance
    ...
  Outputs:
    CartApplicationName:
      Description: Cart application name
      Value:
        Ref: CartApplication
    CartApplicationEvironmentName:
      Description: Cart environment name
      Value:
        Ref: CartEnvironment
...
```

**NOTE:** If providing a custom script, that script must be exported from the module using `module.exports`.

### shell command:

```shell
serverless elastic-beanstalk --stage dev --region eu-west-1 --key ec2-key
```

## License

MIT
