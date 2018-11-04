import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, mergeMap } from 'rxjs/operators';
import { BehaviorSubject, of, forkJoin } from 'rxjs';
import { TagResult } from './models/TagResult';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  HOST = window.location.host;

  tagsInSearch: String[] = [];
  dataOutput: Map<string, TagResult> = new Map;

  streamResponseBehaviourSubject: BehaviorSubject<TagResult[]> = new BehaviorSubject(null);
  selectedFilterBehaviourSubject: BehaviorSubject<string> = new BehaviorSubject(null);

  queryStringConfiguration;

  constructor(
    private http: HttpClient,
  ) { }

  updateStream(tagList) {
    return this.killRunningStreams()
      .pipe(
        mergeMap(() => {
          this.tagsInSearch = tagList;
          return this.http.post(`http://${this.HOST}/api/initiateStream`,
            { tags: tagList });
        })
      );
  }

  killRunningStreams() {
    this.tagsInSearch = [];
    this.dataOutput.clear();
    return this.http.post(`http://${this.HOST}/api/setRunningStreamForTermination`, {});
  }

  getAllData() {
    if (this.tagsInSearch.length === 0) {
      this.streamResponseBehaviourSubject.next(Array.from(this.dataOutput.values()));
      return of(null);
    }
    const getDataObservables = this.tagsInSearch.map(tag => this.getData(tag));
    return forkJoin(getDataObservables);
  }

  getData(tag) {
    let config = this.getQueryStringConfiguration();
    let requestBody: {tag: string, chunkSize?: string} = { tag };
    Object.assign(requestBody, config)

    return this.http.post(`http://${this.HOST}/api/twitterTagSummary`,
      requestBody)
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
          if (this.tagsInSearch.includes(tag)) {
            this.dataOutput.set(tag, data as TagResult);
            this.streamResponseBehaviourSubject.next(Array.from(this.dataOutput.values()));
          }
        })
      );
  }

  getQueryStringConfiguration() {
    if (this.queryStringConfiguration) return this.queryStringConfiguration; 
    
    this.queryStringConfiguration = getParams();

    return this.queryStringConfiguration;
  }

  setSelectedFilter(filter: string) {
    this.selectedFilterBehaviourSubject.next(filter);
  }

}

export const getParams = () => {
  let match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = (s) => { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

  let urlParams = {};
  while (match = search.exec(query)) {
     urlParams[decode(match[1])] = decode(match[2]);
  }

  return urlParams;
}
