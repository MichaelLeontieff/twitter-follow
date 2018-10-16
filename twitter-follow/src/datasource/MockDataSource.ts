import { IDataSource, ITwitterTagSummaryConfig, ITwitterStreamConfig } from "./IDataSource";

export class MockDataSource implements IDataSource {

    getTwitterTagSummary(summaryConfig: ITwitterTagSummaryConfig): Promise<any> {
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

    initiateStream(streamConfig: ITwitterStreamConfig): Promise<any> {
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