import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../api.service';
import { ClassifiedTweet } from '../models/ClassifiedTweet';
import { TagResult } from '../models/TagResult';

@Component({
  selector: 'app-detail-result',
  templateUrl: './detail-result.component.html',
  styleUrls: ['./detail-result.component.css']
})
export class DetailResultComponent implements OnInit {

  isFilterSelected = null;
  currentSelectedFilter;
  summaryData: TagResult;
  tweetList: ClassifiedTweet[] = [];

  private streamSubscription: Subscription;
  private selectedFilterSubscription: Subscription;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.streamSubscription = this.apiService.streamResponseBehaviourSubject.subscribe((streamOutput) => {
      if (streamOutput) {
        this.summaryData = streamOutput.find(output => {
          return this.currentSelectedFilter && this.currentSelectedFilter === output.tag;
        });
        if (this.summaryData) {
          this.tweetList.unshift(...this.summaryData.tweets.filter(classifiedTweet => {
            return !this.tweetList.some(loadedClassifiedTweet => {
              return loadedClassifiedTweet.tweet === classifiedTweet.tweet;
            });
          }));
        }
      }
    });
    this.streamSubscription = this.apiService.selectedFilterBehaviourSubject.subscribe((selectedFilter) => {
      if (selectedFilter && selectedFilter === this.currentSelectedFilter) {
        this.isFilterSelected = true;
        this.currentSelectedFilter = selectedFilter;
      } else if (selectedFilter) {
        this.isFilterSelected = true;
        this.currentSelectedFilter = selectedFilter;
        this.summaryData = null;
        this.tweetList = [];
      } else {
        this.isFilterSelected = false;
        this.currentSelectedFilter = null;
        this.summaryData = null;
        this.tweetList = [];
      }
    });
  }

  ngOnDestroy() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    if (this.selectedFilterSubscription) {
      this.selectedFilterSubscription.unsubscribe();
    }
  }

}
