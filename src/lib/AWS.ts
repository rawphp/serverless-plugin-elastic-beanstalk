import * as BPromise from 'bluebird';
import { IEB, IS3, IServerless } from "../index.d";

/**
 * Get S3 instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IS3} S3 instance
 */
export function getS3Instance(serverless: IServerless, region: string): IS3 {
  const provider = serverless.getProvider(serverless.service.provider.name);

  return BPromise.promisifyAll(
    new provider.sdk.S3({ region, apiVersion: '2006-03-01' }),
  ) as IS3;
}

/**
 * Get ElasticBeanstalk instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IEB} elastic beanstalk instance
 */
export function getElasticBeanstalkInstance(serverless: IServerless, region: string): IEB {
  const provider = serverless.getProvider(serverless.service.provider.name);

  return BPromise.promisifyAll(
    new provider.sdk.ElasticBeanstalk({ region, apiVersion: '2010-12-01' }),
  ) as IEB;
}
