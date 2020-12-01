import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http"

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpotifySearchComponent } from './components/spotify-search/spotify-search.component';
import { SpotifyPlayerComponent } from './components/spotify-player/spotify-player.component';
import { TrackItemComponent } from './components/track-item/track-item.component';

@NgModule({
  declarations: [
    AppComponent,
    SpotifySearchComponent,
    SpotifyPlayerComponent,
    TrackItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
