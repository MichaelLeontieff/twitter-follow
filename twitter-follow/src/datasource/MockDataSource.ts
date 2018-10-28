import { TagSummary } from "../interfaces/TagSummary";
import { TwitterTagSummaryConfig } from "../interfaces/configuration/TwitterTagSummaryConfig";
import { TwitterStreamConfig } from "../interfaces/configuration/TwitterStreamConfig";
import { DataSource } from "../interfaces/DataSource";

export class MockDataSource implements DataSource {

    getTwitterTagSummary(summaryConfig: TwitterTagSummaryConfig): Promise<TagSummary> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        })
    }

    initiateStream(streamConfig: TwitterStreamConfig): Promise<any> {
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