import {Injectable} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class ReportService{
  private IDFs: FirebaseListObservable <any>;
  private angularFire;
  constructor(af: AngularFire) {
    this.angularFire = af;
  }

  setCorpus(template) {
    let topFreqs = [];
    let topIDFs = [];
    let stats = [];
    let limitTopFreq = parseInt(template.maxFreqWords);
    let limitTopIDFs = parseInt(template.maxIDFs);
    // calculating topFreqs
    if (limitTopFreq>0) {
      this.angularFire.database.list('Evidence/Corpus/IDFs', {
        query: {
          orderByChild: "doc_with_word",
          limitToLast: limitTopFreq // highest occurrence
        }})
        .subscribe(data => {
          data.forEach( d => {
            topFreqs.push({word:d.word, count: d.doc_with_word})
          });
          topFreqs.sort(function (a, b) { return b['count'] - a['count']});
        });
    } else {
      topFreqs.push({word:"value is not set", count: "..."});
    }

    // calculating topIDFs
    if (limitTopIDFs>0) {
      this.angularFire.database.list('Evidence/Corpus/IDFs', {
        query: {
          orderByChild: "IDF",
          limitToFirst:  limitTopIDFs// highest occurrence
        }})
        .subscribe(data => {
          data.forEach( d => {
            topIDFs.push({word:d.word, idf: d.IDF.toFixed(7)});
          });
        });
    } else {
      topIDFs.push({word:"value is not set", count: "..."})
    }

    // calculating articleStats
    if ( template.shortestArticle ||
         template.avgArticleSize  ||
         template.longestArticle  )
    this.angularFire.database.list('Evidence/Corpus/Articles')
      .subscribe(data => {
        let sum = 0;
        data.forEach( d => {
          sum += d.article.length;
        });
        let shortest = (template.shortestArticle)?
          (data.reduce(function (a, b) {
          return a.article.length > b.article.length ? b : a;
          })):{article:{length:0}, link:'check the box in the config tab'};
        let longest = (template.longestArticle)?
          (data.reduce(function (a, b) {
          return a.article.length > b.article.length ? a : b;
        })):{article:{length:0}, link:'check the box in the config tab'};
        stats.push({
          longestArticle: {
            size: longest.article.length, link: longest.link
          },
          averageSize: template.avgArticleSize?
            Math.round(sum/data.length): 0,
          shortestArticle: {
            size: shortest.article.length, link: shortest.link
          }
        });
      });
    return {
      topFreqs: topFreqs, topIDFs: topIDFs, articleStats: stats
    };
  }

  setCluster(template) {
    // ToDo: Initialize related values
  }
}
