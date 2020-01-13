import { Classifications } from "../enums/Classifications";

export class AppCacheKeyHelper {

    public static getSummaryCountKeyForFilter(filter: string): string {
        return `${filter}_processedCount`;
    }

    public static getClassificationKeyForFilter(filter: string, classification: Classifications): string {
        return `${filter}_${classification}Count`;
    }

    public static getCacheKeysForFilterSummary(filter: string): string[] {
        return [
            AppCacheKeyHelper.getSummaryCountKeyForFilter(filter),
            AppCacheKeyHelper.getClassificationKeyForFilter(filter, Classifications.POSITIVE),
            AppCacheKeyHelper.getClassificationKeyForFilter(filter, Classifications.NEGATIVE),
            AppCacheKeyHelper.getClassificationKeyForFilter(filter, Classifications.NEUTRAL)
        ]
    }
}