import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire} from "angularfire2";
import {CorpusService} from "./corpus.service";
import {supportsState} from "@angular/platform-browser/src/browser/location/history";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html',
  styleUrls  : ['./app/evidence/evidence.css']
})
export class EvidenceComponent {
  private evidenceService;
  private corpusService;
  private newsItems;
  private supportKeywords;
  private mainKeyword;

  constructor (es:EvidenceService, af: AngularFire, private cs: CorpusService) {
    this.evidenceService = es;
    this.corpusService   = cs;
    af.database.list('/Notifier/rated-news', {
      query: {
        orderByChild: 'rank',
        limitToFirst: 5 // lets fetch 5 items
      }})
      .subscribe(data => {
          this.newsItems = data;
        }
      );
  }

  onSelect(item){
    this.evidenceService.resetCounters();
    this.evidenceService.wordCounts(item.link);
  }

  buildCorpus() {
    // ToDo: build the corpus
    // Fetch news for the main
    this.corpusService.corpusBuilder(this.mainKeyword, this.supportKeywords);
  }


}
