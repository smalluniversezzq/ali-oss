/* eslint-disable require-atomic-updates */
const assert = require('assert');
const utils = require('./utils');
const OSS = require('../../lib/node');
const config = require('../config').oss;
const ms = require('humanize-ms');
describe('test/bucket.test.js', () => {
  const { prefix, includesConf } = utils;
  let store;
  const bucket = 'wzc1';
  let bucketRegion;
  const defaultRegion = config.region;
  before(async () => {
    config.bucket = 'wzc1';
    utils.sleep(1000);
    console.log(22123);
    store = new OSS(config);
  });

  describe('putBucketInventory()', () => {
    const inventory = {
      id: 'default',
      isEnabled: false,
      prefix: 'ttt',
      OSSBucketDestination: {
        format: 'CSV',
        accountId: '1817184078010220',
        rolename: 'AliyunOSSRole',
        bucket,
        prefix: 'test',
      },
      frequency: 'Daily',
      includedObjectVersions: 'All',
      optionalFields: {
        Field: ['Size', 'LastModifiedDate'],
      },
    };
    it('should put bucket inventory', async () => {
      try {
        await store.putBucketInventory(bucket, inventory);
      } catch (err) {
        assert(false, err);
      }
    });
    it('should put bucket inventory when no optionalFields or no field', async () => {
      try {
        inventory.id = 'test_optionalFields';
        delete inventory.optionalFields;
        await store.putBucketInventory(bucket, inventory);

        inventory.id = 'test_field';
        inventory.optionalFields = {};
        await store.putBucketInventory(bucket, inventory);
        assert(true);
      } catch (err) {
        assert(false, err);
      }
    });
    it('should put bucket inventory when no prefix', async () => {
      try {
        inventory.id = 'test_prefix';
        delete inventory.prefix;
        await store.putBucketInventory(bucket, inventory);
        assert(true);
      } catch (err) {
        assert(false, err);
      }
    });
    it('should put bucket inventory when no OSSBucketDestination prefix', async () => {
      try {
        inventory.id = 'test_OSSBucketDestination_prefix';
        delete inventory.OSSBucketDestination.prefix;
        await store.putBucketInventory(bucket, inventory);
        assert(true);
      } catch (err) {
        assert(false, err);
      }
    });
    it('should put bucket inventory when has encryption', async () => {
      try {
        inventory.id = 'test_encryption_SSE-OSS';
        inventory.OSSBucketDestination.encryption = 'SSE-OSS';
        await store.putBucketInventory(bucket, inventory);
        assert(true);
      } catch (err) {
        assert(false, err);
      }
    });
    it('should get bucket inventory by inventoryId', async () => {
      try {
        const result = await store.getBucketInventory(bucket, inventory.id);
        includesConf(result.inventory, inventory);
        console.log(result);
      } catch (err) {
        assert(false);
      }
    });
    it('should delete bukcet inventory', async () => {
      let inventoryList = [];
      let isTruncated;
      let continuationToken;
      do {
        // eslint-disable-next-line no-await-in-loop
        const inventoryRes = await store.listBucketInventory(bucket, { continuationToken });
        inventoryList = [...inventoryList, ...inventoryRes.inventoryList];
        isTruncated = inventoryRes.isTruncated;
        continuationToken = inventoryRes.nextContinuationToken;
      } while (isTruncated);
      try {
        const result = await Promise.all(inventoryList.map(_ => store.deleteBucketInventory(bucket, _.id)));
        assert(true);
      } catch (err) {
        assert(false, err);
      }
    });
  });
});
