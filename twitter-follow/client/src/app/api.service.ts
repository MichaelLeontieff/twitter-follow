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
  selectedFilterBehaviourSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
  ) { }

  updateStream(tagList) {
    return this.killRunningStreams()
      .pipe(
        mergeMap(() => {
          this.tagsInSearch = tagList;
          return this.http.post('http://localhost:8000/api/initiateStream',
            { tags: tagList });
        })
      );
  }

  killRunningStreams() {
    this.tagsInSearch = [];
    this.dataOutput.clear();
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
          const summary = result['summary'];
          const tweets = result['tweets'];
          summary['tag'] = tag;
          const data = Object.keys(summary).reduce((finalResult, key) => {
            finalResult[key.replace(`${ tag }_`, '')] = summary[key] || 0;
            finalResult['tweets'] = tweets;
            return finalResult;
          }, {});
          this.dataOutput.set(tag, data as TagResult);
          this.streamResponseBehaviourSubject.next(Array.from(this.dataOutput.values()));
        })
      );
  }

  setSelectedFilter(filter) {
    this.selectedFilterBehaviourSubject.next(filter);
  }

}
