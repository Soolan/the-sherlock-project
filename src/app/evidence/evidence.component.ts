import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire} from "angularfire2";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html'
})
export class EvidenceComponent {
  private evidenceService;

  constructor (es:EvidenceService, af: AngularFire) {
    this.evidenceService = es;
    af.database.list('/Notifier/rated-news', {
      query: {
        orderByChild: 'rank',
        limitToFirst: 1
      }})
      .subscribe(item => {
        console.log("URL: "+item[0].link);
        this.evidenceService.wordCounts(this.getQueryUrl(item[0].link));
      });
  }

  getQueryUrl (link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
        "q=select * from html where url=\""+ link +"\" and "+
        "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
        "&format=json&diagnostics=true&callback=";
  }
}
