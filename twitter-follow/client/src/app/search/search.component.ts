import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  currentSearches: String[] = [];

  constructor() { }

  ngOnInit() {
  }

  addToCurrentSearches(search: String) {
    if (search && search.length > 0 && search.trim().length > 0) {
      this.currentSearches.push(search);
    }
  }

}
