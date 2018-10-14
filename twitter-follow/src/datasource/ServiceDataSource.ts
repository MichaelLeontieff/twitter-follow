import { IDataSource, ITwitterTagSummaryConfig } from "./IDataSource";
import Twitter = require('twitter');
import {SentimentProcessor} from "../processing/SentimentProcessor";
import { start } from "repl";

/**
 * Calls the respective NewsAPIServices and normalises the data accordingly
 */
export class ServiceDataSource implements IDataSource {

    getTwitterTagSummary(config: ITwitterTagSummaryConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            cache = [];
            let instance = TwitterServiceAPI.getInstance();
            instance.createStream(config.tags);
            setTimeout(() => {
                resolve(cache);
                instance.destoryStream();
            }, 100000);
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
                = TwitterServiceAPI.twitterClient.stream('statuses/filter', {
                    track: filters.join(","),
                    language: "en"
                });

            TwitterServiceAPI.twitterStream.on('data', TwitterServiceAPI.dataCallback);
            TwitterServiceAPI.twitterStream.on('error', TwitterServiceAPI.errorCallback);

        }
    }

    public destoryStream() {
        TwitterServiceAPI.twitterStream.destroy();
    }

    private static dataCallback(event) {
        let startTime = Date.now();
        let instance = SentimentProcessor.getInstance();
        let classification = instance.getClassification(event.text).then(classification => {
            let endTime = Date.now();
            console.log("classification calc time", endTime - startTime);
            cache.push({text: event.text, classification});
        });
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