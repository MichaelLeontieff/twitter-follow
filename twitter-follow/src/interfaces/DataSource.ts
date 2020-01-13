import { TagSummary } from "./TagSummary";
import { TwitterStreamConfig } from "./configuration/TwitterStreamConfig";
import { TwitterTagSummaryConfig } from "./configuration/TwitterTagSummaryConfig";

/**
 * Contract for the data sources of the application, handling interfaces with the API Services
 * 
 * TODO: define types
 */
export interface DataSource {

    /**
     * given a list of filters in the POST body, initiate a stream with these values
     * @param streamConfig 
     */
    initiateStream(streamConfig: TwitterStreamConfig): Promise<any>;

    /**
     * given a tag, process a chunk of cache results pertaining to the tag and return the total processed count
     * @param tag 
     */
    getTwitterTagSummary(summaryConfig: TwitterTagSummaryConfig): Promise<TagSummary>;

    // TODO: add terminate stream endpoint
    setRunningStreamForTermination(): Promise<any>;
}
