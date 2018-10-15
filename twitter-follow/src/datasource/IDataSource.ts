/**
 * Contract for the data sources of the application, handling interfaces with the API Services
 * 
 * TODO: define types
 */
export interface IDataSource {

    initiateStream(streamConfig: ITwitterTagSummaryConfig): Promise<any>;

    getTwitterTagSummary(tag: string): Promise<any>;

    // TODO: add terminate stream endpoint
}


export enum DataSourceTypes {
    MOCK_DATA_SOURCE = "MOCK_DATA_SOURCE",
    REAL_DATA_SOURCE = "REAL_DATA_SOURCE"
}

// ##### Input interfaces ##### //
export interface ITwitterTagSummaryConfig {
    tags: string[];
}

// ##### Response interfaces ##### //
