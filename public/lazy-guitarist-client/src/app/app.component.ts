import { Component } from '@angular/core';
import { Track } from './models/Track';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lazy-guitarist-client';
  track:Track;

  sendTrack(track){
    this.track = track;
    console.log(this.track)
  }
}
