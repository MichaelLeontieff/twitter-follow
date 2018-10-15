import { IDataSource, ITwitterTagSummaryConfig } from "./IDataSource";
import {SentimentProcessor} from "../processing/SentimentProcessor";
import { TwitterServiceAPI } from "../services/TwitterServiceAPI";
import { CacheService } from "../services/CacheService";

/**
 * Calls the respective NewsAPIServices and normalises the data accordingly
 */
export class ServiceDataSource implements IDataSource {

    getTwitterTagSummary(tag: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // get (pop) abitrary number of results from cache
            let cacheInstance = CacheService.getInstance();
            let classifierInstance = SentimentProcessor.getInstance();
            cacheInstance.popResultsFromCache(tag, Number(process.env['cache_pop_per_request'])).then(cacheResults => {
                // run classification and get results
                cacheResults.map(cache => {
                    let parsedResult = JSON.parse(cache);
                    return parsedResult.text;
                });

                Promise.all(classifierInstance.getClassifications(cacheResults)).then(results => {
                    // update summary object with results
                    cacheInstance.updateProcessedCount(tag, results.length).then(totalCount => {
                        resolve(totalCount);
                    });
                });              
            });
        })
    }

    initiateStream(streamConfig: ITwitterTagSummaryConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            let twitterStreamInstance = TwitterServiceAPI.getInstance();
            let cacheInstance = CacheService.getInstance();
            twitterStreamInstance.createStream(streamConfig.tags, cacheInstance.insertTweetIntoCache);
            resolve(`Created stream with tags: ${JSON.stringify(streamConfig.tags)}`)
        });
    }

}
