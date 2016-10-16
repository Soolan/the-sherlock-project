import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import {AngularFire, FirebaseListObservable} from "angularfire2";

@Injectable()
export class EvidenceService {
  private http;
  private corpes: FirebaseListObservable<any>;
  constructor (http: Http, af:AngularFire) {
    this.http = http;
    this.corpes = af.database.list('/Corpes');
  }

  corpesBuilder(keywords) {
    // extract the 1st 100 link from https://www.google.com/search?q=richard+branson&tbm=nws&num=100
    // get and save the contents for each link
  }
}
