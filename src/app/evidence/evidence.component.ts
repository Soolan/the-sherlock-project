import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire} from "angularfire2";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html'
})
export class EvidenceComponent {
  private evidenceService;
  private newsItems;

  constructor (es:EvidenceService, af: AngularFire) {
    this.evidenceService = es;
    af.database.list('/Notifier/rated-news', {
      query: {
        orderByChild: 'rank',
        limitToFirst: 5 // lets fetch 5 items
      }})
      .subscribe(data => {
          this.newsItems = data;
        // console.log(this.newsItems);
        }
      );
  }

  onSelect(item){
    this.evidenceService.resetCounters();
    this.evidenceService.wordCounts(this.getQueryUrl(item.link));
    // if(isChecked) {
    //   this.evidenceService.wordCounts(this.getQueryUrl(item.link));
    // } else {
    //   this.evidenceService.resetCounters();
    // }
    // console.log(this.evidenceService);
  }

  getQueryUrl (link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
        "q=select * from html where url=\""+ link +"\" and "+
        "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
        "&format=json&diagnostics=true&callback=";
  }
}
