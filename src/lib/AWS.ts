import * as AWS from "aws-sdk";
import * as IServerless from 'serverless';

/**
 * Get S3 instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IS3} S3 instance
 */
export function getS3Instance(serverless: IServerless, region: string): AWS.S3 {
  const provider = serverless.getProvider(serverless.service.provider.name);

  return new provider.sdk.S3({ region, apiVersion: '2006-03-01' });
}

/**
 * Get ElasticBeanstalk instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IEB} elastic beanstalk instance
 */
export function getElasticBeanstalkInstance(serverless: IServerless, region: string): AWS.ElasticBeanstalk {
  const provider = serverless.getProvider(serverless.service.provider.name);

  return new provider.sdk.ElasticBeanstalk({ region, apiVersion: '2010-12-01' });
}
