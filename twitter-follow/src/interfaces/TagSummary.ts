import { ClassifiedTweet } from "./ClassifiedTweet";
import { SummaryObject } from "./SummaryObject";

export interface TagSummary {
    summary: SummaryObject;
    tweets: ClassifiedTweet[];
}