import * as redis from 'redis';
import { TwitterAPIHelpers } from './TwitterServiceAPI';
import { Classifications } from '../processing/SentimentProcessor';

export class CacheService {
    private static instance: CacheService;
    private static client: redis.RedisClient;

    constructor() {
        CacheService.client = redis.createClient();
        CacheService.client.on('error', CacheService.errorCallback);
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

    public updateSummaryForFilter(filter: string, classificationResults: string[]): Promise<ISummaryObject> {
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
    private static getUpdatedStateObject(filter: string, stateObject: ISummaryObject, classificationResults: string[]) {
        let clone = Object.assign({}, stateObject);
        classificationResults.forEach(classification => {
            // update classifications
            let value = Number(clone[
                AppCacheKeyHelpers
                .getClassificationKeyForFilter(filter, <Classifications>classification)
            ]);

            clone[
                AppCacheKeyHelpers
                .getClassificationKeyForFilter(filter, <Classifications>classification)
            ] = String(++value);
        });

        // update total processed before returning
        let totalProcessed = Number(clone[
            AppCacheKeyHelpers
            .getSummaryCountKeyForFilter(filter)
        ]) + classificationResults.length;

        clone[
            AppCacheKeyHelpers
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
    public getSummaryValuesForFilter(filter: string): Promise<IKeyValue>[] {
        return AppCacheKeyHelpers.getCacheKeysForFilterSummary(filter).map(key => {
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

    private static getKeyValueMapFromArray(results: IKeyValue[]): ISummaryObject {
        let retData: ISummaryObject = {};
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
    public setSummaryValuesForFilter(filter: string, values: ISummaryObject): Promise<IKeyValue>[] {
        return AppCacheKeyHelpers.getCacheKeysForFilterSummary(filter).map(key => {
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
        let cleanedTweet = TwitterAPIHelpers.getCleanedTweet(tweet);
        console.log(`Caching tweet: ${JSON.stringify(cleanedTweet)}`);
        CacheService.client.sadd(filter, JSON.stringify(cleanedTweet));
    }

    private static getSummaryCountKeyForFilter(filter: string) {
        return `${filter}_processedCount`;
    }
}

export class AppCacheKeyHelpers {

    public static getSummaryCountKeyForFilter(filter: string): string {
        return `${filter}_processedCount`;
    }

    public static getClassificationKeyForFilter(filter: string, classification: Classifications): string {
        return `${filter}_${classification}Count`;
    }

    public static getCacheKeysForFilterSummary(filter: string): string[] {
        return [
            AppCacheKeyHelpers.getSummaryCountKeyForFilter(filter),
            AppCacheKeyHelpers.getClassificationKeyForFilter(filter, Classifications.POSITIVE),
            AppCacheKeyHelpers.getClassificationKeyForFilter(filter, Classifications.NEGATIVE),
            AppCacheKeyHelpers.getClassificationKeyForFilter(filter, Classifications.NEUTRAL)
        ]
    }
}

export interface IKeyValue {
    key: string;
    value: string;
}

export interface ISummaryObject {
    [redisCacheKey: string]: string;
}
