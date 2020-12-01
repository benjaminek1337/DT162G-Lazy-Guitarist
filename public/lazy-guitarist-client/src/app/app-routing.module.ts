import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpotifyPlayerComponent } from "./components/spotify-player/spotify-player.component"

const routes: Routes = [
  { path: "song/:id", component: SpotifyPlayerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
