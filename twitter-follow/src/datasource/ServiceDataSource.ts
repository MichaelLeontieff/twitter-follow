import { IDataSource } from "./IDataSource";

/**
 * Calls the respective NewsAPIServices and normalises the data accordingly
 */
export class ServiceDataSource implements IDataSource {

    getTwitterTagSummary(config: any): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        })
    }
}
