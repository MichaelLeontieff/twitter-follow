import * as d3 from 'd3';
import APP_CONFIG from '../../app.config';

export class Node implements d3.SimulationNodeDatum {
    // optional - defining optional implementation properties - required for relevant typing assistance
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  
    searchTerm: String;
    totalTweets: Number = 0;
    maxTweets: Number = 0;
  
    constructor(searchTerm: String, totalTweets: Number) {
      this.searchTerm = searchTerm;
      this.totalTweets = totalTweets;
    }
  
    normal = () => {
      return Math.sqrt(this.totalTweets.valueOf() / this.maxTweets.valueOf());
    }
  
    get r() {
      return 50 * this.normal() + 10;
    }
  
    get fontSize() {
      return (10 * this.normal() + 10) + 'px';
    }
  
    get color() {
      let index = Math.floor((APP_CONFIG.SPECTRUM.length - 1) * this.normal());
      return APP_CONFIG.SPECTRUM[index];
    }
  }