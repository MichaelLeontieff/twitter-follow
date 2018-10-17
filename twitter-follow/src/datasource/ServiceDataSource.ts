import { IDataSource, ITwitterTagSummaryConfig, ITwitterStreamConfig } from "./IDataSource";
import { SentimentProcessor } from "../processing/SentimentProcessor";
import { TwitterServiceAPI, StreamStates } from "../services/TwitterServiceAPI";
import { CacheService } from "../services/CacheService";

/**
 * Calls the respective NewsAPIServices and normalises the data accordingly
 */
export class ServiceDataSource implements IDataSource {

    getTwitterTagSummary(summaryConfig: ITwitterTagSummaryConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            // get (pop) abitrary number of results from cache
            let cacheInstance = CacheService.getInstance();
            let classifierInstance = SentimentProcessor.getInstance();
            let chunkSize = summaryConfig.chunkSize 
                || Number(process.env['cache_pop_per_request'])
                || 25;

            cacheInstance.popResultsFromCache(summaryConfig.tag, chunkSize).then(cacheResults => {
                cacheResults.map(cache => {
                    let parsedResult = JSON.parse(cache);
                    return parsedResult.text;
                });
                // run classification and get results
                // TODO: train the model upon instance start, not on first request
                Promise.all(classifierInstance.getClassifications(cacheResults)).then(results => {
                    cacheInstance.updateSummaryForFilter(summaryConfig.tag, results).then(updatedStateObject => {
                        resolve(updatedStateObject);
                    })
                });              
            });
        })
    }

    initiateStream(streamConfig: ITwitterStreamConfig): Promise<any> {
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
