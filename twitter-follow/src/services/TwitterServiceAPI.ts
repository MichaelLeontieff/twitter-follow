import Twitter = require('twitter');
import { CacheService } from '../services/CacheService';
import { TwitterServiceConfig } from '../interfaces/configuration/TwitterServiceConfig';
import { TwitterAPIHelper } from '../helpers/TwitterAPIHelper';
import { StreamStates } from '../enums/StreamStates';

export class TwitterServiceAPI {
    private static instance: TwitterServiceAPI;

    private static twitterClient: Twitter;
    private static twitterStream;
    private static twitterStreamId;

    constructor() {
        TwitterServiceAPI.twitterClient = new Twitter(TwitterServiceAPI.getKeyConfiguration());
    }

    static getInstance() {
        if (!TwitterServiceAPI.instance) {
            TwitterServiceAPI.instance = new TwitterServiceAPI();
        }
        return TwitterServiceAPI.instance;
    }

    private static getKeyConfiguration(): TwitterServiceConfig {
        return {
            consumer_key: process.env.twitter_consumer_key,
            consumer_secret: process.env.twitter_consumer_secret,
            access_token_key: process.env.twitter_access_token_key,
            access_token_secret: process.env.twitter_access_token_secret
        }
    }

    public getTwitterStreamId() {
        return TwitterServiceAPI.twitterStreamId();
    }

    public createStream(filters: string[], cacheInstance: CacheService) {
        if (!TwitterServiceAPI.twitterStream) {
            TwitterServiceAPI.twitterStream 
                = TwitterServiceAPI.twitterClient.stream('statuses/filter', {
                    track: filters.join(","),
                    language: "en"
                });
            
            // not actually coupled to the stream, signifies presence rather than link of/to a stream
            TwitterServiceAPI.twitterStreamId = this.createTwitterStreamId();
            // it's a promise but we don't care - as long as it's set
            cacheInstance.setStreamStatus(StreamStates.RUNNING);

            // Interval poll for termination flag
            let interval = setInterval(() => {
                cacheInstance.getStreamStatus().then(streamStatus => {
                    if (streamStatus === StreamStates.TERMINATED) {
                        console.info("Twitter stream terminated");
                        if (TwitterServiceAPI.twitterStream) {
                            TwitterServiceAPI.twitterStream.destroy();
                            TwitterServiceAPI.twitterStream = null;
                        }
                        clearInterval(interval);
                    }
                });
            }, 1000);

            // on stream response
            TwitterServiceAPI.twitterStream.on('data', (event) => {

                let matchedFilters = TwitterAPIHelper.getMatchedFiltersForTweet(filters, event);
                let tweetText = TwitterAPIHelper.getTextFromTweet(event);

                if (matchedFilters && matchedFilters.length > 0 && tweetText) {
                    matchedFilters.forEach((filter) => {
                        cacheInstance.insertTweetIntoCache(filter, TwitterAPIHelper.getCleanedTweet(event));
                    });
                } else {
                    console.error(`Failed to correlate tweet to filter`);
                }
            });

            // on stream error
            TwitterServiceAPI.twitterStream.on('error', TwitterServiceAPI.errorCallback);
        } else {
            cacheInstance.getStreamStatus().then(streamStatus => {
                if (streamStatus === StreamStates.TERMINATED) {
                    console.info("Twitter stream terminated");
                    if (TwitterServiceAPI.twitterStream) {
                        TwitterServiceAPI.twitterStream.destroy();
                        TwitterServiceAPI.twitterStream = null;
                    }
                    this.createStream(filters, cacheInstance);
                }
            });
        }
    }

    public destoryStream() {
        TwitterServiceAPI.twitterStream.destroy();
    }

    private static errorCallback(event) {
        console.error("stream error", event);   
    }

    private createTwitterStreamId() {
        return `twitter_stream_id_${Date.now()}`;
    }
}
