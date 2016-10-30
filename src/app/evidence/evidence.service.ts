import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import {AngularFire} from "angularfire2";

@Injectable()
export class EvidenceService {
  private http;
  private article='';
  private words;
  private normFactor;
  private corpus;
  private corpusTree;
  private corpusSize = 100;

  constructor (http: Http, af:AngularFire) {
    this.http = http;
    this.corpus = af.database.object('Evidence/Corpus/summary');
    this.corpusTree = af.database.list('Evidence/Corpus/current-tree');
  }

  wordCounts(url) {
    this.getArticle(this.getQueryUrl(url))
      .subscribe(
        data => {
          this.findInKey(data, 'content');
          this.words= this.evaluateWords(
            this.countInstances(
              this.extractWords(this.article)
            )
          );
        });
  }

  evaluateWords(instances) {
    var self = this;
    var words = [];
    var normFactor = this.calculateNorm(instances);
    instances.forEach(function (word) {
      var normalized = instances[word]/normFactor;
      // console.log(normalized, instances[word], normFactor);

      self.calculateIDF(word).then(data => {
        words.push({
          key:word, value:instances[word],
          idf:parseFloat(data).toFixed(5),
          normalized:normalized,
          tfidf_N:(normalized*data).toFixed(5),
          tfidf_C:(instances[word]*data).toFixed(5)
        })
      })
    });
    return words;
  }

  resetCounters() {
    this.article = null;
    this.words = null;
    this.normFactor = null;
  }

  calculateNorm (rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      console.log('total, word count:', total, w.value );

      total += w.value * w.value;
    });
    console.log(total);
    return Math.sqrt(total);
  }

  findInKey(object, string) {
    for (var key in object) {
      if (object[key] && typeof(object[key])=="object") {
        this.findInKey(object[key], string );
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
      .map((res:Response) => res.json())
      .map(data => data.query.results)
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }

  extractWords(article) {
    // remove all symbols from the article
    var cleanse = article.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    // extract all words available between white spaces. (tabs, spaces, etc)
    // and return the result as an array of words,
    return cleanse.split(/\s+/);
  }

  countInstances (allWords) {
    // create an object for word instances and their counts
    var instances = {};
    allWords.forEach(function (word) {
      if (instances.hasOwnProperty(word)) {
        instances[word]++;
      } else {
        instances[word] = 1;
      }
    });
    // console.log('instances:', instances);
    return this.sortWords(instances);
  }

  // sort the words and save them as an array of objects
  sortWords (instances) {
    var sorted = Object.keys(instances).sort(function(a,b) {
        return instances[b]-instances[a]
    });
    return sorted;
  }

  getQueryUrl (link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
      "q=select * from html where url=\""+ link +"\" and "+
      "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
      "&format=json&diagnostics=true&callback=";
  }

  calculateIDF (word) {
    // ToDo: before calculation check if it is done before
    // look into Evidence/Corpus/IDFs and look for {word:'', idf:''} if it exists return
    // else
    return this.countDocsWith(word)
      .then(
        data => {
          console.log('#docs, size, idf:',
            data, this.corpusSize, Math.log2(this.corpusSize / (1 + data))
          );
          // console.log('calculateIDF:', Math.log2(this.corpusSize / (1 + data)));
          return Math.log2(this.corpusSize / (1 + data));
        }
      );
  }

  countDocsWith(word) {
    var self = this;
    var count = 0;
    return this.corpusTree._ref.once("value")
        .then(
          function (snapshot) {
            snapshot.forEach((item: any) => {
              if (item.child('article').val().indexOf(word) > 0) {
                count ++;
              }
            });
            // console.log('docs with word: '+word, self.docsWithWord);
            return 65;//count;
        }
      );
  }

  getCorpusSize(corpus) {
    var self = this;
    corpus._ref.once("value")
      .then(
        function (snapshot) {
          self.corpusSize = snapshot.child('corpus-size').val();
        }
      );
  }
}
