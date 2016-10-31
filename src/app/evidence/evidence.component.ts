import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire} from "angularfire2";
import {CorpusService} from "./corpus.service";
import {ClusteringService} from "./clustering.service";

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
  private clusterKeywords;
  private clusteringService;

  constructor (
    es:EvidenceService, af: AngularFire, cs: CorpusService,
    cls: ClusteringService
  ) {
    this.evidenceService   = es;
    this.corpusService     = cs;
    this.clusteringService = cls;
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
    this.evidenceService.resetCounters();
    var url = isRadio?item.link:item;
    console.log(item, item.link, url);
    this.evidenceService.wordAnalyzer(url);
  }

  buildCorpus() {
    // ToDo: build the corpus
    // Fetch news for the main
    this.corpusService.corpusBuilder(this.mainKeyword, this.supportKeywords);
  }

  buildClusters() {
    // ToDo: build the corpus
    // Fetch news for the main
    this.clusteringService.clusterBuilder(this.clusterKeywords);
  }
}
