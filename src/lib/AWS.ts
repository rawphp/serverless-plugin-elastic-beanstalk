"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BPromise = require("bluebird");
/**
 * Get S3 instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IS3} S3 instance
 */
function getS3Instance(serverless, region) {
    const provider = serverless.getProvider(serverless.service.provider.name);
    return BPromise.promisifyAll(new provider.sdk.S3({ region, apiVersion: '2006-03-01' }), {
      filter: name => ['upload'].includes(name),
    });
}
exports.getS3Instance = getS3Instance;
/**
 * Get ElasticBeanstalk instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IEB} elastic beanstalk instance
 */
function getElasticBeanstalkInstance(serverless, region) {
    const provider = serverless.getProvider(serverless.service.provider.name);
    return BPromise.promisifyAll(new provider.sdk.ElasticBeanstalk({ region, apiVersion: '2010-12-01' }), {
      filter: name => ['createApplicationVersion', 'describeApplicationVersions', 'updateEnvironment', 'describeEnvironments'].includes(name),
  });
}
exports.getElasticBeanstalkInstance = getElasticBeanstalkInstance;
