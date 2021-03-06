import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { ApiService } from '../api.service';
import { Subscription } from 'rxjs';
import { TagResult } from '../models/TagResult';

@Component({
  selector: 'app-bubble-graph',
  templateUrl: './bubble-graph.component.html',
  styleUrls: ['./bubble-graph.component.css']
})
export class BubbleGraphComponent implements OnInit, OnDestroy {

  @ViewChild('graph')
  graphElement: ElementRef;

  tagResults: TagResult[] = [];

  private chartProps: any;

  private streamSubscription: Subscription;
  private streamCreationSubscription: Subscription;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.resetIntervalSubscription();
    this.streamSubscription = this.apiService.streamResponseBehaviourSubject.subscribe((streamOutput) => {
      if (streamOutput) {
        this.tagResults = streamOutput;
        if (this.tagResults && this.chartProps) {
          this.updateGraph();
        } else {
          this.buildGraph();
          this.updateGraph();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    if (this.streamCreationSubscription) {
      this.streamCreationSubscription.unsubscribe();
    }
  }

  resetIntervalSubscription() {
    if (this.streamCreationSubscription) {
      this.streamCreationSubscription.unsubscribe();
    }
    this.streamCreationSubscription = this.apiService.getAllData().subscribe(null,null,() => {
      setTimeout(() => this.resetIntervalSubscription(), 1000);
    });
  }

  buildGraph() {
    this.chartProps = {};
    const svg = d3.select(this.graphElement.nativeElement)
      .append('svg')
      .style('width', '100%')
      .style('height', 'calc(100vh - 115px)')
      .attr('font-size', '10')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle');
    this.chartProps.svg = svg;
  }

  color(group) {
    return d3.scaleOrdinal().range(d3.schemeCategory10)[group];
  }

  updateGraph() {
    const root = this.pack();

    const t = d3.transition().duration(10);

    const circle = this.chartProps.svg.selectAll('circle')
      .data(root.leaves(), (d) => { return d.data['tag']; });

    const text = this.chartProps.svg.selectAll('text')
      .data(root.leaves(), (d) => { return d.data['tag']; });

    circle.exit()
      .style('fill', '#b26745')
      .transition(t)
      .attr('r', 1e-6)
      .remove();

    text.exit()
      .transition(t)
      .attr('opacity', 1e-6)
      .style('z-index', 1200)
      .remove();

    circle.transition(t)
      .style('fill', d => this.getColor(d))
      .attr('r', d => d.r || 0)
      .attr('cx', d => d.x || 0)
      .attr('cy', d => d.y || 0);

    text.transition(t)
      .attr('x', d => d.x || 0)
      .attr('y', d => d.y || 0)
      .style('z-index', 1200);

    circle.enter().append('circle')
      .attr('r', 1e-6)
      .attr('cx', d => d.x || 0)
      .attr('cy', d => d.y || 0)
      .style('fill', '#fff')
      .transition(t)
      .style('fill', d => this.getColor(d))
      .attr('r', d => d.r || 0);

    text.enter().append('text')
      .attr('opacity', 1e-6)
      .attr('x', d => d.x || 0)
      .attr('y', d => d.y || 0)
      .text(d => d.data['tag'])
      .transition(t)
      .style('z-index', 1200)
      .attr('opacity', 1);
  }

  pack() {
    return d3.pack()
      .size([this.graphElement.nativeElement.offsetWidth - 5,
        this.graphElement.nativeElement.offsetHeight - 5])
      .padding(5)
      (d3.hierarchy({ children: this.tagResults }).sum((d) => {
        if (d['children']) {
          return 0;
        }
        return d['processedCount'] || 0;
      }));
  }

  getColor(d) {
    let num = (0.5 * (d.data['positiveCount'] - d.data['negativeCount']) / d.data['processedCount']) + 0.5;
    if (num <= 0.35) {
      return 'red';
    } else if (num >= 0.65) {
      return 'green';
    }
    const colors = ['orange', 'yellow', 'yellowgreen'];
    const range = 0.65 - 0.35;
    num = (num - 0.35) / range;
    return colors[Math.floor(num * colors.length)];
  }

  isFilterSelected() {
    return this.apiService.selectedFilterBehaviourSubject.value;
  }

}
