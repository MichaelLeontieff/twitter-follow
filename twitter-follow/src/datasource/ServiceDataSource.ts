import { IDataSource, ITwitterTagSummaryConfig } from "./IDataSource";
import Twitter = require('twitter');

/**
 * Calls the respective NewsAPIServices and normalises the data accordingly
 */
export class ServiceDataSource implements IDataSource {

    getTwitterTagSummary(config: ITwitterTagSummaryConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            let instance = TwitterServiceAPI.getInstance();
            instance.createStream(config.tags);
            setTimeout(() => {
                resolve(cache);
            }, 10000);
        })
    }
}

let cache = [];

export class TwitterServiceAPI {
    private static instance: TwitterServiceAPI;

    private static keyConfiguration: ITwitterServiceConfig;
    private static twitterClient: Twitter;
    private static twitterStream;

    constructor() {
        TwitterServiceAPI.twitterClient = new Twitter(TwitterServiceAPI.getKeyConfiguration());
    }

    static getInstance() {
        if (!TwitterServiceAPI.instance) {
            TwitterServiceAPI.instance = new TwitterServiceAPI();
            // ... any one time initialization goes here ...
        }
        return TwitterServiceAPI.instance;
    }

    private static getKeyConfiguration() {
        return {
            consumer_key: process.env.twitter_consumer_key,
            consumer_secret: process.env.twitter_consumer_secret,
            access_token_key: process.env.twitter_access_token_key,
            access_token_secret: process.env.twitter_access_token_secret
        }
    }

    public createStream(filters: string[]) {
        if (!TwitterServiceAPI.twitterStream) {
            TwitterServiceAPI.twitterStream 
                = TwitterServiceAPI.twitterClient.stream('statuses/filter', {track: filters.join(",")});

            TwitterServiceAPI.twitterStream.on('data', TwitterServiceAPI.dataCallback);
            TwitterServiceAPI.twitterStream.on('error', TwitterServiceAPI.errorCallback);

        }
    }

    private static dataCallback(event) {
        cache.push(event);
    }

    private static errorCallback = (event) => cache.push(event);

    private static cleanTweetResponse(tweet) {
        
    }
}

export interface ITwitterServiceConfig {
    consumer_key: string;
    consumer_secret: string;
    access_token_key: string;
    access_token_secret: string;
}