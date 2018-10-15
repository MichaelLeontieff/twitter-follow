import Twitter = require('twitter');

export class TwitterServiceAPI {
    private static instance: TwitterServiceAPI;

    private static keyConfiguration: ITwitterServiceConfig;
    private static twitterClient: Twitter;
    private static twitterStream;

    private static tester;

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

    public createStream(filters: string[], onStreamResultCallback) {
        if (!TwitterServiceAPI.twitterStream) {
            TwitterServiceAPI.twitterStream 
                = TwitterServiceAPI.twitterClient.stream('statuses/filter', {
                    track: filters.join(","),
                    language: "en"
                });

            // on stream response
            TwitterServiceAPI.twitterStream.on('data', (event) => {
                let matchedFilter = TwitterAPIHelpers.getMatchedFilterForTweet(filters, event);
                let tweetText = TwitterAPIHelpers.getTextFromTweet(event);

                if (matchedFilter && tweetText) {
                    onStreamResultCallback(matchedFilter, TwitterAPIHelpers.getCleanedTweet(event));
                } else {
                    console.error(`Failed to correlate tweet to filter`);
                }
            });

            // on stream error
            TwitterServiceAPI.twitterStream.on('error', TwitterServiceAPI.errorCallback);
        }
    }

    public destoryStream() {
        TwitterServiceAPI.twitterStream.destroy();
    }

    private static errorCallback(event) {
        console.error("stream error", event);   
    }

    private static cleanTweetResponse(tweet) {

    }

    private static saveTweetToStore() {

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

export interface ITwitterServiceConfig {
    consumer_key: string;
    consumer_secret: string;
    access_token_key: string;
    access_token_secret: string;
}
