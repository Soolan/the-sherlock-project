import {Injectable, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class ReportService{
  private articles=[];
  private IDFs: FirebaseListObservable <any>;
  private angularFire;
  constructor(af: AngularFire) {
    this.angularFire = af;
    // console.log('articles:', this.articles);
    this.init();
  }

  init() {
    this.angularFire.database.list('Evidence/Corpus/Articles', {
      query: {
        // orderByChild: 'bag_of_words',
        // limitToFirst: 5 // 5 shortest articles
        limitToLast: 5 // 5 longest articles
      }}).subscribe(data => {
          this.articles = data;
          console.log('articles:', this.articles);
        }
      );

  }
  setCorpus(template) {
    console.log('setCorpus:',this.articles);
    return {
      topFreqs: [{word: 'w1', count: 10}, {word: 'w2', count: 9}],
      topIDFs: [{word: 'w1', idf: 0.4}, {word: 'w2', idf: 0.3}],
      longestArticle: {size: 4765, link: 'http://www.test.com'},
      shortestArticle: {size: 58, link: 'http://www.test.com'},
      averageSize: 759
    };
    // ToDo: Initialize related values
  }

  setCluster(template) {
    // ToDo: Initialize related values
  }
}
