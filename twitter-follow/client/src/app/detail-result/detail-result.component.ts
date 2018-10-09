import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-result',
  templateUrl: './detail-result.component.html',
  styleUrls: ['./detail-result.component.css']
})
export class DetailResultComponent implements OnInit {

  selectedQuery = null;

  constructor() { }

  ngOnInit() {
  }

}
