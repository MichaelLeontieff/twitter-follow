/**
 * Contract for the data sources of the application, handling interfaces with the API Services
 * 
 * TODO: define types
 */
export interface IDataSource {

    getTwitterTagSummary(config: any): Promise<any>;
}


export enum DataSourceTypes {
    MOCK_DATA_SOURCE = "MOCK_DATA_SOURCE",
    REAL_DATA_SOURCE = "REAL_DATA_SOURCE"
}