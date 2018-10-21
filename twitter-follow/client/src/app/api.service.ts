import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { tap, map, catchError, mergeMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TagResult } from './models/TagResult';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  tagsInSearch: String[] = [];
  dataOutput: Map<String, TagResult> = new Map;

  streamResponseBehaviourSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  selectedBubbleBehaviourSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
  ) { }

  addToSearch(tagList) {
    this.tagsInSearch = tagList;
    return this.killRunningStreams()
      .pipe(
        mergeMap(() => {
          return this.http.post('http://localhost:8000/api/initiateStream',
            { tags: tagList });
        })
      );
  }

  killRunningStreams() {
    return this.http.post('http://localhost:8000/api/setRunningStreamForTermination', {});
  }

  getAllData() {
    this.tagsInSearch.forEach((tag) => {
      this.getData(tag).subscribe();
    });
    return of(true);
  }

  getData(tag) {
    return this.http.post('http://localhost:8000/api/twitterTagSummary',
      { tag })
      .pipe(
        tap((result) => {
          result['tag'] = tag;
          const data = Object.keys(result).reduce((finalResult, key) => {
            finalResult[key.replace(`${ tag }_`, '')] = result[key];
            return finalResult;
          }, {});
          this.dataOutput.set(tag, data as TagResult);
          this.streamResponseBehaviourSubject.next(Array.from(this.dataOutput.values()));
          this.selectedBubbleBehaviourSubject.next(null);
        })
      );
  }

  setSelectedBubble(bubbleId) {
    this.selectedBubbleBehaviourSubject.next(bubbleId);
  }

}
