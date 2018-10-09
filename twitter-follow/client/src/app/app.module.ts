import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BubbleGraphComponent } from './bubble-graph/bubble-graph.component';
import { DetailResultComponent } from './detail-result/detail-result.component';
import { SearchComponent } from './search/search.component';
import { GraphComponent } from './visuals/graph/graph.component';
import { NodeVisualComponent } from './visuals/shared/node-visual/node-visual.component';
import { LinkVisualComponent } from './visuals/shared/link-visual/link-visual.component';

@NgModule({
  declarations: [
    AppComponent,
    BubbleGraphComponent,
    DetailResultComponent,
    SearchComponent,
    GraphComponent,
    NodeVisualComponent,
    LinkVisualComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
