# Changelog

## [Unreleased][]

### Updated

* Changed the S3 methods to not use async methods as AWS-SDK provides promisified returns.

## [1.4.0][] - 2018-03-01

### Added

* Added a handler for `FAILED` application creation. Previous behaviour would wait indefinitely if the creation failed. Now it throws an error.

### Updated

* Updated AWS ElasticBeanstalk platform versions to latest versions

## [1.3.0][] - 2017-08-27

### Updated

* Updated dependencies

## [1.2.2][] - 2017-08-26

### Fixed

* Fixed default bundle name

## [1.2.1][] - 2017-08-26

### Fixed

* Bundle source path

## [1.2.0][] - 2017-08-26

### Feature

* Added optional `file` config property to `IPluginConfig` to allow custom names and/or adding a prefix

### Updated

* Updated dependencies
* Updated AWS ElasticBeanstalk platform versions

[Unreleased]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/rawphp/serverless-plugin-elastic-beanstalk/tree/v1.1.0
