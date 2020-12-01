import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { Track } from "../models/Track";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  url:string = "http://localhost:3000/api/spotify/"
  constructor(private http:HttpClient) { }

  getTracks(query) {
    return this.http.get<any>(this.url + "track=" + query);
  }

  getTrackByUri(query){
    return this.http.get<any>(this.url + "trackUri=" + query);
  }
}
