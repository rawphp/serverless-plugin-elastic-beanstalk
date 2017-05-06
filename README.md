# Elastic Beanstalk Deployment Plugin

A serverless plugin to deploy applications to AWS ElasticBeanstalk.

## Dependencies

* This plugin is dependent on the output of [Stack Config Plugin for Serverless](https://www.npmjs.com/package/serverless-plugin-stack-config)
* This plugin is also dependent on [AWS EB Cli](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html) being installed on the system

## Features

* `elastic-beanstalk` - This downloads this service's outputs to a file in */PROJECT_ROOT/.serverless/stack-outputs.json* and updates the config file in S3.

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
      applicationEnvironmentName: CartApplicationEvironmentName
    configure:
      key: ${opt:key}
      custom: scripts/configure.js

functions:
...
resources:
...
```

### shell command:
```shell
serverless elastic-beanstalk --stage dev --region eu-west-1 --key ec2-key
```

## License

MIT
