import { Component, OnInit } from '@angular/core';
import { Track } from 'src/app/models/Track';
import { ActivatedRoute } from "@angular/router"
import { SpotifyService } from "../../services/spotify.service"

@Component({
  selector: 'app-spotify-player',
  templateUrl: './spotify-player.component.html',
  styleUrls: ['./spotify-player.component.css']
})
export class SpotifyPlayerComponent implements OnInit {

  constructor(private activatedRoute:ActivatedRoute, private spotifyService:SpotifyService) { }
  track:Track;
  trackUri:string;

  ngOnInit(): void {
    let id = this.activatedRoute.snapshot.paramMap.get("id");
    this.trackUri = id;
    this.spotifyService.getTrackByUri(id).subscribe(t => {
      let track:Track = {
        id: t.id,
        title: t.name,
        album: t.album.name,
        albumcover: t.album.images[1].url,
        artist: t.artists[0].name
      }
      this.track = track;
    })
  }

}
