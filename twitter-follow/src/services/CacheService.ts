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

    public popTweetFromCache() {

    }

    public insertTweetIntoCache(filter: string, tweet: any) {
        let cleanedTweet = TwitterAPIHelpers.getCleanedTweet(tweet);
        console.log(`Caching tweet: ${JSON.stringify(cleanedTweet)}`);
        CacheService.client.sadd(filter, JSON.stringify(cleanedTweet));
    }
}