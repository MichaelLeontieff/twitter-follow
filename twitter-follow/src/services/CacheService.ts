import * as redis from 'redis';
import { KeyValue } from '../interfaces/KeyValue';
import { SummaryObject } from '../interfaces/SummaryObject';
import { AppCacheKeyHelper } from '../helpers/AppCacheKeyHelper';
import { TwitterAPIHelper } from '../helpers/TwitterAPIHelper';
import { Classifications } from '../enums/Classifications';

export const TWITTER_STREAM_ID = "twitter_stream";
export const TWITTER_STREAM_STATE = "twitter_stream_state";

export class CacheService {
    private static instance: CacheService;
    private static client: redis.RedisClient;
    private static resourceCount;

    constructor() {
        CacheService.client = redis.createClient({
            host: process.env['redis_host'], 
            port: Number(process.env['redis_port'])
        });
        CacheService.client.on('error', CacheService.errorCallback);
        CacheService.resourceCount = 0;

        CacheService.resourceLogger();
    }

    static resourceLogger() {
        let interval = setInterval(() => {
            console.log(`Cached ${CacheService.resourceCount} tweets`);
        }, 5000);
    }

    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    static errorCallback(error) {
        console.error("cache error", error);
    }

    public popResultsFromCache(filter: string, count: number): Promise<string[]> {
        return new Promise((resolve, reject) => {
            CacheService.client.spop(filter, count, (err, results) => {
                err ? reject(err) : resolve(results);
            });
        })
    }

    public registerStreamInState(id: string) {
        return new Promise((resolve, reject) => {
            CacheService.client.set(TWITTER_STREAM_ID, id, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        })
    }

    public deRegisterStreamInState() {
        return new Promise((resolve, reject) => {
            CacheService.client.del(TWITTER_STREAM_ID, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        })
    }

    public getStreamStatus(): Promise<string> {
        return this.getValueCache(TWITTER_STREAM_STATE);
        
    }

    public setStreamStatus(value: string) {
        return this.setValueCache(TWITTER_STREAM_STATE, value);
        
    }

    private getValueCache(key): Promise<string> {
        return new Promise((resolve, reject) => {
            CacheService.client.get(key, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    private setValueCache(key, value) {
        return new Promise((resolve, reject) => {
            CacheService.client.set(key, value, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    public updateProcessedCount(filter: string, additions: number): Promise<number> {
        return new Promise((resolve, reject) => {
            let key = CacheService.getSummaryCountKeyForFilter(filter);
            CacheService.client.get(key, (err, result) => {
                let resultNum = Number(result);
                let count = Number(resultNum ? resultNum + additions : additions);
                CacheService.client.set(key, String(count), (err, result) => {
                    if (result === "OK") {
                        CacheService.client.get(key, (err, result) => {
                            resolve(Number(result));
                        });
                    } else {
                        reject("update processed count error")
                    }
                });
            });
        })
    }

    public updateSummaryForFilter(filter: string, classificationResults: string[]): Promise<SummaryObject> {
        return new Promise((resolve, reject) => {
            // get all values
            Promise.all(this.getSummaryValuesForFilter(filter)).then(cacheContents => {
                let stateObject = CacheService.getKeyValueMapFromArray(cacheContents);
                // compute new values
                let updatedStateObject = CacheService.getUpdatedStateObject(filter, stateObject, classificationResults);
                // set new values
                Promise.all(this.setSummaryValuesForFilter(filter, updatedStateObject)).then(setResults => {
                    resolve(updatedStateObject);
                });
            });
        });
    }

    /**
     * TODO: Please don't look at this code it's terrible - will refactor
     * @param stateObject 
     * @param classificationResults 
     */
    private static getUpdatedStateObject(filter: string, stateObject: SummaryObject, classificationResults: string[]) {
        let clone = Object.assign({}, stateObject);
        classificationResults.forEach(classification => {
            // update classifications
            let value = Number(clone[
                AppCacheKeyHelper
                .getClassificationKeyForFilter(filter, <Classifications>classification)
            ]);

            clone[
                AppCacheKeyHelper
                .getClassificationKeyForFilter(filter, <Classifications>classification)
            ] = String(++value);
        });

        // update total processed before returning
        let totalProcessed = Number(clone[
            AppCacheKeyHelper
            .getSummaryCountKeyForFilter(filter)
        ]) + classificationResults.length;

        clone[
            AppCacheKeyHelper
            .getSummaryCountKeyForFilter(filter)
        ] = String(totalProcessed);

        return clone;
    }

    /**
     * For the given filter and classified chunk, get the respective counts
     * in the redis state:
     * 
     * - total processed count
     * - total negative tweets
     * - total positive tweets
     * - total neutral tweets
     */
    public getSummaryValuesForFilter(filter: string): Promise<KeyValue>[] {
        return AppCacheKeyHelper.getCacheKeysForFilterSummary(filter).map(key => {
            return new Promise((resolve, reject) => {
                CacheService.client.get(key, (err, result) => {
                    (result === "OK") 
                        ? reject("failed to get redis cache values")
                        // falsy if new key, return 0 instead
                        : resolve({key, value: result || "0"})
                });
            });
        });
    }

    private static getKeyValueMapFromArray(results: KeyValue[]): SummaryObject {
        let retData: SummaryObject = {};
        results.forEach(result => {
            retData[result.key] = result.value;
        });
        return retData;
    }

    /**
     * For the given filter and classified chunk, set the respective counts
     * in the redis state:
     * 
     * - total processed count
     * - total negative tweets
     * - total positive tweets
     * - total neutral tweets
     */
    public setSummaryValuesForFilter(filter: string, values: SummaryObject): Promise<KeyValue>[] {
        return AppCacheKeyHelper.getCacheKeysForFilterSummary(filter).map(key => {
            return new Promise((resolve, reject) => {
                CacheService.client.set(key, values[key], (err, result) => {
                    (err)
                        ? reject(err)
                        : resolve({key, value: values[key]})
                });
            });
        });
    }

    public insertTweetIntoCache(filter: string, tweet: any) {
        let cleanedTweet = TwitterAPIHelper.getCleanedTweet(tweet);
        CacheService.client.sadd(filter, JSON.stringify(cleanedTweet));
        CacheService.resourceCount++;
    }

    private static getSummaryCountKeyForFilter(filter: string) {
        return `${filter}_processedCount`;
    }
}
