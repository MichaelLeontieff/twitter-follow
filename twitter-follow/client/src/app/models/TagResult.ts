import { ClassifiedTweet } from "./ClassifiedTweet";

export interface TagResult {
    tag: string;
    processedCount: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    tweets: ClassifiedTweet[];
}