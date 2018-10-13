import { IDataSource } from "./IDataSource";
import * as data from './mockdata/summaryDataTags';

export class MockDataSource implements IDataSource {

    getTwitterTagSummary(config: any): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(data.MOCK_RESPONSE);
        })
    }
}