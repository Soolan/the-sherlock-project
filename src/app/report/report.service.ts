import {Injectable} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class ReportService{
  private loaded:boolean = false;
  private articles;
  private IDFs: FirebaseListObservable <any>;
  private angularFire;
  constructor(af: AngularFire) {
    this.angularFire = af;
    // console.log('articles:', this.articles);
    // this.init();
  }

  setCorpus(template) {
    let stats = [];
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
          topIDFs.push({word:d.word, idf: d.IDF.toFixed(7)});
        });
      });
    this.angularFire.database.list('Evidence/Corpus/Articles').subscribe(
      data => {
        let sum = 0;
        data.forEach( d => {
          sum += d.article.length;
          console.log('sum:', sum);
          console.log('article length:', d.article.length);
          console.log('bag length:', d.bag_of_words.length);
        });
        let shortest = data.reduce(function (a, b) {
          return a.article.length > b.article.length ? b : a;
        });
        let longest = data.reduce(function (a, b) {
          return a.article.length > b.article.length ? a : b;
        });
        console.log('shortest:', shortest);
        console.log('longest:', longest);
        stats.push({
          longestArticle: {size: longest.article.length, link: longest.link},
          averageSize: Math.round(sum/data.length),
          shortestArticle:{size: shortest.article.length, link: shortest.link}
        });
        this.loaded = true;
        console.log('loaded:', this.loaded);
      });
    return {
      topFreqs: topFreqs, topIDFs: topIDFs, articleStats: stats
      // {
      //   longestArticle: {size: 4765, link: 'http://www.test.com'},
      //   shortestArticle: {size: 58, link: 'http://www.test.com'},
      //   averageSize: 759
      // }
    };
  }

  setCluster(template) {
    // ToDo: Initialize related values
  }
}
