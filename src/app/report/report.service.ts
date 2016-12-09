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
    // this.init();
  }

  setCorpus(template) {
    let topFreqs = [];
    let topIDFs = [];
    // calculating topFreqs
    this.angularFire.database.list('Evidence/Corpus/IDFs', {
      query: {
        orderByChild: "doc_with_word",
        limitToLast: parseInt(template.maxFreqWords) // highest occurrence
      }})
      .subscribe(data => {
        data.forEach( d => {
          topFreqs.push({word:d.word, count: d.doc_with_word})
        });
        topFreqs.sort(function (a, b) { return b['count'] - a['count']});
      });
    // calculating topIDFs
    this.angularFire.database.list('Evidence/Corpus/IDFs', {
      query: {
        orderByChild: "IDF",
        limitToFirst: parseInt(template.maxIDFs) // highest occurrence
      }})
      .subscribe(data => {
        data.forEach( d => {
          topIDFs.push({word:d.word, idf: d.IDF.toFixed(7);})
        });
      });
    return {
      topFreqs: topFreqs, topIDFs: topIDFs,
      longestArticle: {size: 4765, link: 'http://www.test.com'},
      shortestArticle: {size: 58, link: 'http://www.test.com'},
      averageSize: 759
    };
  }

  setCluster(template) {
    // ToDo: Initialize related values
  }
}
