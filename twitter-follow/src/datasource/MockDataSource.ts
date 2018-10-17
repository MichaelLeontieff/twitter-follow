import { IDataSource, ITwitterTagSummaryConfig, ITwitterStreamConfig } from "./IDataSource";

export class MockDataSource implements IDataSource {

    getTwitterTagSummary(summaryConfig: ITwitterTagSummaryConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        })
    }

    initiateStream(streamConfig: ITwitterStreamConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        })
    }

    setRunningStreamForTermination(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        })
    }
}