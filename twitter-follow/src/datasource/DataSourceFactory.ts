import { MockDataSource } from "./MockDataSource";
import { ServiceDataSource } from "./ServiceDataSource";
import { DataSourceTypes } from "../enums/DataSourceTypes";
import { DataSource } from "../interfaces/DataSource";

/**
 * Manages interaction with the application data sources
 */
export class DataSourceFactory {
    static getDataSource(type: DataSourceTypes): DataSource {
        switch (type) {
            case DataSourceTypes.REAL_DATA_SOURCE:
                return new ServiceDataSource();
            default:
                return new MockDataSource();
        }
    }
}