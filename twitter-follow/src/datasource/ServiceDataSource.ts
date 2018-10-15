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
        //     cache = [];
        //     let instance = TwitterServiceAPI.getInstance();
        //     instance.createStream(config.tags);
        //     setTimeout(() => {
        //         resolve(cache);
        //         instance.destoryStream();
        //     }, 100000);
            resolve(undefined);
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
