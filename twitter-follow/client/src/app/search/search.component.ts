import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  currentSearches: String[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.killRunningStreams().subscribe();
  }

  addToCurrentSearches(search: String) {
    if (search && search.length > 0 && search.trim().length > 0) {
      this.currentSearches.push(search);
    }
  }

  removeFromCurrentSearches(search: String) {
    if (search && this.currentSearches.length > 0) {
      this.currentSearches = this.currentSearches.filter(searchTerm => {
        return searchTerm !== search;
      });
      if (this.isSelectedFilter(search)) {
        this.apiService.setSelectedFilter(null);
      }
    } 
  }

  toggleSelected(filter: String) {
    if (filter && this.apiService.selectedFilterBehaviourSubject.value !== filter) {
      this.apiService.setSelectedFilter(filter);
    } else if (filter) {
      this.apiService.setSelectedFilter(null);
    }
  }

  isSelectedFilter(filter: String) {
    return filter === this.apiService.selectedFilterBehaviourSubject.value;
  }

  updateStream() {
    if (this.currentSearches.length > 0) {
      this.apiService.updateStream(this.currentSearches).subscribe();
      this.apiService.setSelectedFilter(null);
    } else {
      this.apiService.killRunningStreams().subscribe();
    }
  }

}
