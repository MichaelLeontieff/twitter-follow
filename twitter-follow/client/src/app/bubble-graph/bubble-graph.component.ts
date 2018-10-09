import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node } from '../d3/models';
import CONFIG from '../app.config';

@Component({
  selector: 'app-bubble-graph',
  templateUrl: './bubble-graph.component.html',
  styleUrls: ['./bubble-graph.component.css']
})
export class BubbleGraphComponent implements OnInit {

  nodes: Node[] = [];

  constructor() {
    const N = CONFIG.N;

    let maxTweets = 0;

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      const totalTweets = Math.floor(Math.random() * 5000);
      this.nodes.push(new Node('search term ' + i.toString(), totalTweets));
      if (totalTweets >= maxTweets) {
        maxTweets = totalTweets;
      }
    }

    this.nodes.forEach((node) => {
      node.maxTweets = maxTweets;
    })
  }

  ngOnInit() {
  }

}
