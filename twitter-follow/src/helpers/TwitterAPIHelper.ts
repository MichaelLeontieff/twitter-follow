export class TwitterAPIHelper {

    public static getMatchedFiltersForTweet(filters: string[], tweet) {
        let tweetText = TwitterAPIHelper.getTextFromTweet(tweet);
        let quotedTweetText = TwitterAPIHelper.getQuotedTweetText(tweet);

        return filters.filter((filter) => {
            if (tweetText.toUpperCase().includes(filter.toUpperCase())) {
                return true;
            }

            // check quoted tweet if applicable
            if (quotedTweetText) {
                if (quotedTweetText.toUpperCase().includes(filter.toUpperCase())) {
                    return true;
                }
            }
        });
    }

    public static getCleanedTweet(tweet): any {
        let text = TwitterAPIHelper.getTextFromTweet(tweet);
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
        } else if (tweet.text) {
            tweetText = tweet.text;
        }

        return tweetText;
    }

    public static getQuotedTweetText(tweet) {
        if (tweet.quoted_status) {
            return TwitterAPIHelper.getTextFromTweet(tweet.quoted_status)
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