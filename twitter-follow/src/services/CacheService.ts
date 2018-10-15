import * as redis from 'redis';
import { TwitterAPIHelpers } from './TwitterServiceAPI';

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

    public getSummaryForTag() {

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

    public insertTweetIntoCache(filter: string, tweet: any) {
        let cleanedTweet = TwitterAPIHelpers.getCleanedTweet(tweet);
        console.log(`Caching tweet: ${JSON.stringify(cleanedTweet)}`);
        CacheService.client.sadd(filter, JSON.stringify(cleanedTweet));
    }

    private static getSummaryCountKeyForFilter(filter: string) {
        return `${filter}_processedCount`;
    }
}