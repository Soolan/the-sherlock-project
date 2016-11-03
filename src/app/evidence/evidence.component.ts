import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire} from "angularfire2";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html',
  styleUrls  : ['./app/evidence/evidence.css']
})
export class EvidenceComponent {
  private evidenceService;
  private newsItems;
  private supportKeywords;
  private mainKeyword;
  private clusterKeywords;

  constructor (es:EvidenceService, af: AngularFire) {
    this.evidenceService   = es;
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

  onSelect(item, isRadio){
    var url = isRadio?item.link:item;
    this.evidenceService.wordAnalyzer(url);
  }

  buildCorpus() {
    // ToDo: build the corpus
    // Fetch news for the main

    this.evidenceService.corpusBuilder(this.mainKeyword, this.supportKeywords);
  }

  buildClusters() {
  //   // ToDo: build the corpus
  //   // Fetch news for the main
  //   this.evidenceService.clusterBuilder(this.clusterKeywords);
  }
}
