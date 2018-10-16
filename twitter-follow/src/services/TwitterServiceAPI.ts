import Twitter = require('twitter');
import { CacheService } from '../services/CacheService';

export class TwitterServiceAPI {
    private static instance: TwitterServiceAPI;

    private static keyConfiguration: ITwitterServiceConfig;
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

    private static getKeyConfiguration() {
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

    // TODO: clean up
    public createStream(filters: string[], cacheInstance: CacheService) {
        //if (!TwitterServiceAPI.twitterStream) {
            TwitterServiceAPI.twitterStream 
                = TwitterServiceAPI.twitterClient.stream('statuses/filter', {
                    track: filters.join(","),
                    language: "en"
                });
            
            // not actually coupled to the stream, signifies presence rather than link of/to a stream
            TwitterServiceAPI.twitterStreamId = this.createTwitterStreamId();
            // it's a promise but we don't care
            cacheInstance.setStreamStatus(StreamStates.RUNNING);

            // Interval poll for termination flag
            let interval = setInterval(() => {
                cacheInstance.getStreamStatus().then(streamStatus => {
                    if (streamStatus === StreamStates.TERMINATED) {
                        console.info("Twitter stream terminated");
                        TwitterServiceAPI.twitterStream.destroy();
                        TwitterServiceAPI.twitterStream = null;
                        clearInterval(interval);
                    }
                });
            }, 10000);

            // on stream response
            TwitterServiceAPI.twitterStream.on('data', (event) => {

                let matchedFilter = TwitterAPIHelpers.getMatchedFilterForTweet(filters, event);
                let tweetText = TwitterAPIHelpers.getTextFromTweet(event);

                if (matchedFilter && tweetText) {
                    cacheInstance.insertTweetIntoCache(matchedFilter, TwitterAPIHelpers.getCleanedTweet(event));
                } else {
                    console.error(`Failed to correlate tweet to filter`);
                }
            });

            // on stream error
            TwitterServiceAPI.twitterStream.on('error', TwitterServiceAPI.errorCallback);
        //}
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


export class TwitterAPIHelpers {

    public static getMatchedFilterForTweet(filters: string[], tweet) {
        let tweetText = TwitterAPIHelpers.getTextFromTweet(tweet);
        let quotedTweetText = TwitterAPIHelpers.getQuotedTweetText(tweet);
        let matchedFilter;

        for (let key in filters) {
            let filter = filters[key];

            // check tweet
            if (tweetText.toUpperCase().includes(filter.toUpperCase())) {
                matchedFilter = filter;
                break;
            }

            // check quoted tweet if applicable
            if (quotedTweetText) {
                if (quotedTweetText.toUpperCase().includes(filter.toUpperCase())) {
                    matchedFilter = filter;
                    break;
                }
            }
        }

        return matchedFilter;
    }

    public static getCleanedTweet(tweet): any {
        let text = TwitterAPIHelpers.getTextFromTweet(tweet);
        return {
            text,
            id: String(tweet.id)
        }
    }

    public static getTextFromTweet(tweet) {
        let tweetText = "";

        if (tweet.retweeted_status
            && tweet.retweeted_status.extended_tweet
            && tweet.retweeted_status.extended_tweet.full_text) {
                tweetText = tweet.retweeted_status.extended_tweet.full_text;
        } else {
            tweetText = tweet.text;
        }

        return tweetText;
    }

    public static getQuotedTweetText(tweet) {
        if (tweet.quoted_status) {
            return TwitterAPIHelpers.getTextFromTweet(tweet.quoted_status)
        }
        return undefined;
    }

    public static compareFiltersToHashtags(filters: string[], hashTags) {
        if (hashTags.length > 0) {
            // find all matches and grab the first
            let matchingFilters: any[] = hashTags.filter(hashtag => {
                filters.some((filter) => filter.toUpperCase() === hashtag.text.toUpperCase())
            });
        }

        return hashTags;
    }
}

export enum StreamStates {
    TERMINATED = "TERMINATED",
    RUNNING = "RUNNING"
}

export interface ITwitterServiceConfig {
    consumer_key: string;
    consumer_secret: string;
    access_token_key: string;
    access_token_secret: string;
}
