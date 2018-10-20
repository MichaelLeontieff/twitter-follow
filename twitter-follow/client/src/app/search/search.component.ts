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
      this.apiService.addToSearch(this.currentSearches).subscribe();
    }
  }

}
