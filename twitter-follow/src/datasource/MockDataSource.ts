import { IDataSource } from "./IDataSource";
import * as data from './mockdata/summaryDataTags';

export class MockDataSource implements IDataSource {

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

    initiateStream(streamConfig: any): Promise<any> {
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
}