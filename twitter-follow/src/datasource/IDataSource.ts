/**
 * Contract for the data sources of the application, handling interfaces with the API Services
 * 
 * TODO: define types
 */
export interface IDataSource {

    /**
     * given a list of filters in the POST body, initiate a stream with these values
     * @param streamConfig 
     */
    initiateStream(streamConfig: ITwitterStreamConfig): Promise<any>;

    /**
     * given a tag, process a chunk of cache results pertaining to the tag and return the total processed count
     * @param tag 
     */
    getTwitterTagSummary(summaryConfig: ITwitterTagSummaryConfig): Promise<any>;

    // TODO: add terminate stream endpoint
}


export enum DataSourceTypes {
    MOCK_DATA_SOURCE = "MOCK_DATA_SOURCE",
    REAL_DATA_SOURCE = "REAL_DATA_SOURCE"
}

// ##### Input interfaces ##### //
export interface ITwitterStreamConfig {
    tags: string[];
}

export interface ITwitterTagSummaryConfig {
    tag: string;
    chunkSize: number;
}

// ##### Response interfaces ##### //
