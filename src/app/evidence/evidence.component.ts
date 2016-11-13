import {Component, OnInit, ViewChild} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire} from "angularfire2";
import {ModalComponent} from "./modal.component";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html',
  styleUrls  : ['./app/evidence/evidence.css']
})
export class EvidenceComponent {
  @ViewChild(ModalComponent) modal: ModalComponent;
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

  onIDFs() {
    this.evidenceService.saveIDFs();
  }

  buildCorpus() {
    // ToDo: build the corpus
    this.evidenceService.corpusBuilder(this.mainKeyword, this.supportKeywords);
  }

  buildClusters() {
  //  ToDo: build the clusters
    var self = this;
    this.evidenceService.clusterBuilder(this.clusterKeywords)
      .then(data => {
        // = data[0];
        self.modal.showModal();
        self.modal.visNetworkData = data[0];
      });
    var test = {
      nodes: [
        { id: '1', label: 'Node 1' },
        { id: '2', label: 'Node 2' },
        { id: '3', label: 'Node 3' },
        { id: '4', label: 'Node 4' },
        { id: '5', label: 'Node 5' }
      ],
      edges: [
        { from: '1', to: '3' },
        { from: '1', to: '2' },
        { from: '2', to: '4' },
        { from: '2', to: '5' }
      ]
    };
    // console.log('in the component test: ', {
    //   nodes: [
    //     { id: '1', label: 'Node 1' },
    //     { id: '2', label: 'Node 2' },
    //     { id: '3', label: 'Node 3' },
    //     { id: '4', label: 'Node 4' },
    //     { id: '5', label: 'Node 5' }
    //   ],
    //   edges: [
    //     { from: '1', to: '3' },
    //     { from: '1', to: '2' },
    //     { from: '2', to: '4' },
    //     { from: '2', to: '5' }
    //   ]
    // });
    // self.modal.showModal(test);

  }

  m() {
    // this.modal.showModal();
  }
}
