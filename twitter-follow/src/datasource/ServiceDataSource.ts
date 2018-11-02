import { SentimentProcessor } from "../processing/SentimentProcessor";
import { TwitterServiceAPI } from "../services/TwitterServiceAPI";
import { CacheService } from "../services/CacheService";
import { TagSummary } from "../interfaces/TagSummary";
import { StreamStates } from "../enums/StreamStates";
import { TwitterTagSummaryConfig } from "../interfaces/configuration/TwitterTagSummaryConfig";
import { TwitterStreamConfig } from "../interfaces/configuration/TwitterStreamConfig";
import { DataSource } from "../interfaces/DataSource";

/**
 * Calls the respective NewsAPIServices and normalises the data accordingly
 */
export class ServiceDataSource implements DataSource {

    getTwitterTagSummary(summaryConfig: TwitterTagSummaryConfig): Promise<TagSummary> {
        return new Promise((resolve, reject) => {
            // get (pop) abitrary number of results from cache
            const cacheInstance = CacheService.getInstance();
            const classifierInstance = SentimentProcessor.getInstance();
            const chunkSize = summaryConfig.chunkSize 
                || Number(process.env['cache_pop_per_request'])
                || 25;
            const returnChunkSize = summaryConfig.returnChunkSize
                || Number(process.env['summary_return_tweet_count'])
                || 5;

            cacheInstance.popResultsFromCache(summaryConfig.tag, chunkSize).then(cacheResults => {
                const extractedResults = cacheResults.map(cache => {
                    const parsedResult = JSON.parse(cache);
                    return parsedResult.text;
                });
                // run classification and get results
                // TODO: train the model upon instance start, not on first request
                Promise.all(classifierInstance.getClassifications(extractedResults)).then(results => {
                    const classificationResults = results.map(result => result.classification);
                    const subsetOfResults = results.slice(0,returnChunkSize);
                    cacheInstance.updateSummaryForFilter(summaryConfig.tag, classificationResults).then(updatedStateObject => {
                        resolve({summary: updatedStateObject, tweets: subsetOfResults});
                    });
                });              
            });
        })
    }

    initiateStream(streamConfig: TwitterStreamConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            let twitterStreamInstance = TwitterServiceAPI.getInstance();
            let cacheInstance = CacheService.getInstance();
            twitterStreamInstance.createStream(streamConfig.tags, cacheInstance);
            resolve(`Created stream with tags: ${JSON.stringify(streamConfig.tags)}`)
        });
    }

    setRunningStreamForTermination(): Promise<any> {
        return new Promise((resolve, reject) => {
            let cacheInstance = CacheService.getInstance();

            cacheInstance.setStreamStatus(StreamStates.TERMINATED).then(result => {
                console.info("Twitter stream marked for termination");
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

}
