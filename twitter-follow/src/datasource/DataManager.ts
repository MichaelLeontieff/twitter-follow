import { IDataSource, DataSourceTypes } from "./IDataSource";
import { MockDataSource } from "./MockDataSource";
import { ServiceDataSource } from "./ServiceDataSource";

/**
 * Manages interaction with the application data sources
 */
export class DataManager {
    public dataSource: IDataSource;

    constructor(type: DataSourceTypes) {
        let dataSource: IDataSource;
        switch (type) {
            case DataSourceTypes.REAL_DATA_SOURCE:
                this.dataSource = new ServiceDataSource();
                break;
            default:
                this.dataSource = new MockDataSource();
        }
    }
}