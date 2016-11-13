import {Injectable, OnInit} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {googleSearchConfig, timeSpans} from "../app.module";

@Injectable()
export class EvidenceService implements OnInit {
  private http;
  private article = '';
  private words = [];
  private corpusSize;
  private vocabularySize;
  private angularFire;
  // private IDFs = [];
  private corpus: FirebaseListObservable <any>;
  private IDFs: FirebaseListObservable <any>;
  private clusters;//: FirebaseListObservable <any>;

  constructor(http: Http, af: AngularFire) {
    this.http = http;
    this.angularFire = af;
    this.corpus = af.database.list('Evidence/Corpus/Articles');
    this.IDFs = af.database.list('Evidence/Corpus/IDFs');
    // this.clusters = af.database.list('Evidence/Clusters');
  }

  ngOnInit() {
    // Observable.timer(100,5000).subscribe(this.wordAnalyzer);
    // Observable.timer(100,3000).subscribe(this.getArticle);
    // Observable.timer(100,2000).subscribe(this.evaluateWords);
    // Observable.timer(800,2000).subscribe(this.calculateIDF);
    // Observable.timer(800,9000).subscribe(this.countDocsWith);
    // Observable.timer(800,500).subscribe(this.sortWords);
    // Observable.timer(100,1000).subscribe(this.countInstances);
  }

  wordAnalyzer(url) {
    return this.getArticle(this.getYahooQueryUrl(url))
      .subscribe(
        data => {
          this.resetCounters();
          this.findKey(data, 'content');
          if (this.article) {
            this.evaluateWords( // normalizeWords
              this.countInstances(
                this.extractWords(this.article)
              )
            ).then(data => {
              this.corpus.push({article: this.article, link: url, bag_of_words: data});
            });
            ;
          }
        });
  }

  // instances are array of {word, count} objects
  evaluateWords(instances) {
    var self = this;
    var normFactor = this.calculateNorm(instances);
    return Promise.all(instances.map(function (w) {
      if (w.word.length < 20) {
        var normalized = w.count / normFactor;
        w['normalized'] = normalized.toFixed(4);
        self.words.push(w);
      }
      return w;
    }));
  }

  resetCounters() {
    this.article = null;
    this.words = [];
  }

  calculateNorm(rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      total += w.count * w.count;
    });
    return Math.sqrt(total);
  }

  findKey(object, string) {
    for (var key in object) {
      if (object[key] && typeof(object[key]) == "object") {
        this.findKey(object[key], string);
      } else if (
        key == string ||
        typeof (key) == "string" &&
        key != 'class' &&
        key != 'id' &&
        key != 'href'
      ) {
        this.article += object[key];
      }
    }
  }

  getArticle(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.query.results)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  extractWords(article) {
    // remove all symbols from the article
    var cleanse = article.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    // extract all words available between white spaces. (tabs, spaces, etc)
    // and return the result as an array of words,
    return cleanse.split(/\s+/);
  }

  countInstances(allWords) {
    // create an object for word instances and their counts
    var instances = {};
    allWords.forEach(function (word) {
      if (instances.hasOwnProperty(word)) {
        instances[word]++;
      } else {
        instances[word] = 1;
      }
    });
    return this.sortWords(instances);
  }

  // sort the words and save them as an array of objects
  sortWords(instances) {
    var words = [];
    var sortedWords = Object.keys(instances).sort(function (a, b) {
      return instances[b] - instances[a]
    });
    // // =============== convert the loop here
    sortedWords.forEach(function (word) {
      words.push({word: word, count: instances[word]});
    });

    return words;
  }

  getYahooQueryUrl(link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
      "q=select * from html where url=\"" + link + "\" and " +
      "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
      "&format=json&diagnostics=true&callback=";
  }

  // 1. loop through articles
  // 2. gather all unique words by looking into bag_of_words
  // 3. loop through unique words
  // 4. find number of articles that each unique word exist in them
  // 5. calculate idf
  // 6. save IDFs as array of {word:'', number_of_docs:'', idf:''}
  saveIDFs() {
    var uniqueBagOfWords = {};
    this.IDFs.remove();
    this.corpus._ref.once("value")
      .then(snapshot => {
        this.corpusSize = snapshot.numChildren();

        snapshot.forEach(item => {
          item.child('bag_of_words').val().forEach(w => {
            uniqueBagOfWords.hasOwnProperty(w.word) ?
              uniqueBagOfWords[w.word]++ :
              uniqueBagOfWords[w.word] = 1;
          });
        });
        var words = Object.keys(uniqueBagOfWords);
        this.vocabularySize = words.length;
        words.forEach(word => {
          var idf = Math.abs(Math.log2(
            (this.corpusSize == 0) ?
              1 : this.corpusSize / (uniqueBagOfWords[word] + 1)
          ));
          this.IDFs.push({
            'word': word, 'doc_with_word': uniqueBagOfWords[word], 'IDF': idf
          })
          // this.words[this.words.indexOf(word)]['idf'] = idf;
          this.words.some(function (item) {
            if (item.word === word) {
              item['idf'] = idf.toFixed(4);
              item['tfidf_C'] = (idf * item.count).toFixed(4);
              item['tfidf_N'] = (idf * item.normalized).toFixed(4);
              return true;
            }
          })

        });
      });
  }

  getIDF(word, IDFs) {
    var idf = 0;
    IDFs.some((item: any) => {
      if (item.name === word.word) {
        idf = item.idf;
        return true;
      }
    });
    return idf;
  }

  corpusBuilder(mainKeyword, supportKeywords) {
    this.resetCounters();
    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation
    var keywords = this.setKeywordArray(mainKeyword, supportKeywords);
    keywords.forEach((keyword: any) => {
      this.fetchLinks(keyword);
    })
  }

  setKeywordArray(mainKeyword, supportKeywords) {
    var keywords = [];
    if (supportKeywords)
      keywords = supportKeywords.split(",");
    // keywords.push(mainKeyword);
    // use unshift to add an element to the beginning of an array
    keywords.unshift(mainKeyword);
    return keywords;
  }

  fetchLinks(keyword) {
    var self = this;
    timeSpans.forEach(function (period) {
      self.getSearchResults(self.getGoogleQueryUrl(keyword, period))
        .subscribe(data => data.forEach(function (item) {
          self.wordAnalyzer(item.link);
        }))
    });
  }

  getGoogleQueryUrl(keyword, range) {
    return "https://www.googleapis.com/customsearch/v1?" +
      "key=" + googleSearchConfig.apiKey + "&cx=" + googleSearchConfig.cx +
      "&q=" + keyword + "&sort=" + range.sort + "&num=3&dateRestrict=" + range.span;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.items)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  clusterBuilder(centers) {
    var self = this;
    var count;
    var max;
    var clusterCenters = {};
    var observations = {};
    var network = {};
    var nodes = []; //{id, label}
    var edges = []; //{from, to}
    var currentCenterId; // id
    var flag;
    var keywords = centers.split(",");
    var records = this.corpus._ref.once("value");
    var id = 1;
    // return Promise.all([1, 2, 3, 4, 5].map(fn)).then();
    return Promise.all(keywords.map(function (word) {
        // keywords.forEach(function (word) {
        observations[word] = [];
        records
          .then(snapshot => {
            max = 0;
            snapshot.forEach(article => {
              count = 0;
              flag = false;
              article.child('bag_of_words').val().forEach(w => {
                if (w.word == word) count += w.count;
                if (w.word == "Trump") flag = true;
              });
              if (flag && count > max) {
                max = count;
                clusterCenters[word] = {
                  id: article.key,
                  bag_of_words: article.child('bag_of_words').val()
                }
              }
            })
            currentCenterId = id++; //clusterCenters[word].id;
            nodes.push({id: currentCenterId, label: word});
            return clusterCenters;
          })// find article with max value for Trump+word return {word:{id,bag_of_words}}
          .then(centers => {
            // console.log('=centers=>', centers);
            var i = 1;
            return records
              .then(snapshot => {
                snapshot.forEach(article => {
                  var sum = 0;
                  var d = 0;
                  centers[word].bag_of_words.forEach(k => {
                    article.child('bag_of_words').val().forEach(w => {
                      if (k.word == w.word) {
                        sum += isNaN(k.normalized * w.normalized) ?
                          0 : (k.normalized * w.normalized);
                      }
                    })
                  })
                  d = 1 - sum;
                  observations[word].push({id: article.key, distance: d.toFixed(4)});
                  // console.log(word, d, i++);
                })
                observations[word].sort(function (a, b) {
                  return a['distance'] - b['distance'];
                });
                // console.log(observations);
                return observations;
              })
          })// calculate distance to the centers for all articles in the corpus
          // {word: [{id,distance}]}
          .then(data => {
            // console.log('--------' + data[word]);
            data[word].forEach(item => {
              nodes.push({id: id/*item.id*/, label: item.distance});
              edges.push({from: currentCenterId, to: id /*item.id*/});
              id++;
            })
          }) //network: {nodes:[{id,label}] , edges:[{from,to}]}
        network = {nodes: nodes, edges: edges};
        console.log('network:',network);
        return network;
      })
    );
  }
}

