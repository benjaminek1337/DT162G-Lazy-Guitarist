import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { SpotifyService } from "../../services/spotify.service"
import { Track } from "../../models/Track"
import { Router } from "@angular/router"

@Component({
  selector: 'app-spotify-search',
  templateUrl: './spotify-search.component.html',
  styleUrls: ['./spotify-search.component.css']
})
export class SpotifySearchComponent implements OnInit {

  constructor(private spotifyService:SpotifyService, private router:Router) { }
  
  
  timeout;
  tracks:Track[] = [];
  @Output() sendTrack: EventEmitter<Track> = new EventEmitter();

  ngOnInit(): void {
  }

  
  searchTrack(input: any){ 
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.tracks.length = 0;
      if(input.length > 2){
        this.spotifyService.getTracks(input).subscribe(t => {
          for (let i = 0; i < t.tracks.items.length; i++) {
            const element = t.tracks.items[i];
            let track:Track = {
              id: element.id,
              artist: element.artists[0].name,
              album: element.album.name,
              title: element.name,
              albumcover: element.album.images[1].url
            }
            this.tracks.push(track);
          }
        });
      }
    }, 300) 
  }

  getTrack(track:Track){
    //this.sendTrack.emit(track);
    this.tracks.length = 0;
    this.router.navigateByUrl("/", {skipLocationChange:true}).then(() => {
      this.router.navigate(["/song", track.id])
    });
  }

}
