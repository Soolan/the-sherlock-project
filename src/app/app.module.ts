import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core'
import {RouterModule} from "@angular/router";
import {rootRouterConfig} from "./app.routes";
import {AppComponent} from "./app";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {NavigationComponent} from "./navigation/navigation.component";
import {CollectorComponent} from "./collector/collector.component";
import {RatingComponent} from "./rating/rating.component";
import {NotifierComponent} from "./notifier/notifier.component";
import {AngularFireModule} from 'angularfire2';
import {OrderByPipe} from "./pipes/orderby.pipe";
import {NotifierService} from "./notifier/notifier.service";
// import {O_RDONLY} from "constants";
// import {OrderByPipe} from "./pipes/orderby.pipe";

export const firebaseConfig = {
  apiKey: "AIzaSyA8C9a7wZ9r-5BsMXJbP3-6_raliTVkHpk",
  authDomain: "the-sherlock-project.firebaseapp.com",
  databaseURL: "https://the-sherlock-project.firebaseio.com",
  storageBucket: "the-sherlock-project.appspot.com"
}

@NgModule({
  declarations: [
    AppComponent, NavigationComponent, CollectorComponent,
    RatingComponent, NotifierComponent, OrderByPipe

  ],
  schemas     : [CUSTOM_ELEMENTS_SCHEMA],
  imports     : [
    BrowserModule, FormsModule, HttpModule,
    RouterModule.forRoot(rootRouterConfig),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers   : [
    {provide: LocationStrategy, useClass: HashLocationStrategy}
    ],
  // pipes       : [],
  bootstrap   : [AppComponent]
})
export class AppModule {

}
