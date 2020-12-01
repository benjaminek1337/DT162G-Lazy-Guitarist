import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Track } from 'src/app/models/Track';

@Component({
  selector: 'app-track-item',
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.css']
})
export class TrackItemComponent implements OnInit {

  @Input() track:Track;
  @Output() sendTrack: EventEmitter<Track> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  getTrack(track){
    this.sendTrack.emit(track);
  }

}
