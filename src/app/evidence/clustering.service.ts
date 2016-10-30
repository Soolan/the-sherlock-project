import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {EvidenceService} from "./evidence.service";
import {FirebaseListObservable, AngularFire} from "angularfire2";

@Injectable()
export class ClusteringService {
  private evidenceService;
  private clusters: FirebaseListObservable <any>;

  constructor(es: EvidenceService, af: AngularFire) {
    this.evidenceService = es;
    this.clusters = af.database.list('Evidence/Clusters');
  }

  clusterBuilder (keywords) {
    var self  = this;
    var items = keywords.split(",");
    items.forEach ( function (keyword) {
      self.setClusterCenter(keyword)
        .then(
          data => {
            self.buildClusterAround(data.child('article').val());
          }
        );
    })
  }

  setClusterCenter(keyword) {
    // ToDo: Loop through the corpus and find the article
    // with the highest repetition of the given keyword
    var max = 0;
    var maxKey = '';
    return this.evidenceService.corpusTree._ref.once("value")
      .then(function (snapshot) {
        snapshot.forEach((item: any) => {
          if (item.child('article').val().indexOf(keyword) > max) {
            max = item.child('article').val().indexOf(keyword);
            maxKey = item.key;
          }
        });
        // return maxKey;
        return snapshot.child(maxKey);
      });
  }

  buildClusterAround(article) {
    // ToDo: calculate the similarity based on tfidf
    // and select top 10 articles
    // create idf for cluster center
    console.log(article);
    // get a word from cluster center nominated article
    // check if it is in the dictionary under Evidence/Corpus/IDFs {word:'',idf:''}
    // if it is pull the idf factor
    // if it is not calculate idf factor
    // calculate the tf-idf
    // save {word:'', tfidf:''} under Evidence/Clusters/centerName
    return this.evidenceService.corpusTree._ref.once("value")
      .then(function (snapshot) {
        snapshot.forEach((item: any) => {
          // 1. Calculate and save tfidf for each word under the article:
          // {article, link, [{word, instances, tfidf}, ...]
          // 2. Calculate the distance between cluster center and the article
        })
      })
  }
}
