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
  constructor (http: Http, af:AngularFire) {
    this.http = http;
    this.corpus = af.database.list('Evidence/Corpus/current-tree');
  }

  wordCounts(url) {
    //this.resetCounters();
    this.getArticle(this.getQueryUrl(url))
      .subscribe(
        data => {
          this.findInKey(data, 'content');
          this.words= this.countInstances(this.extractWords(this.article));
          this.normFactor = this.calculateNorm(this.words);
        });
  }

  resetCounters() {
    this.article = null;
    this.words = null;
    this.normFactor = null;
  }

  calculateTFIDF (word) {
    // log((# of docs in the corpus)/(1+# of docs contain a specific word))
    var corpusSize   = this.getCorpusSize(this.corpus);
    var docsWithWord = this.countDocsWith(word);
    console.log('calculations:', corpusSize, docsWithWord);
    return 10;// Math.log2(corpusSize/(1+docsWithWord));
  }

  calculateNorm (rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      total += w.value * w.value;
    });
    return Math.sqrt(total);
  }

  findInKey(object, myKey) {
    for (var key in object) {
      // console.log(!!object[key])
      if (object[key] && typeof(object[key])=="object") {
        this.findInKey(object[key], myKey );
      } else if (key == myKey || typeof (key) == "string" && key != 'class' && key != 'id' && key != 'href') {
        // console.log(object[key]);
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
    return this.sortWords(instances);
  }

  // sort the words and save them as an array of objects
  sortWords (instances) {
    var self = this;
    var words = [];
    // console.log(words);
    var sortedWords = Object.keys(instances).sort(
      function(a,b){
        return instances[b]-instances[a]
      });
    sortedWords.forEach(function (word) {
      words.push({key:word, value:instances[word], tfidf:self.calculateTFIDF(word)});
    });
    // console.log(words);

    return words;
  }

  getQueryUrl (link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
      "q=select * from html where url=\""+ link +"\" and "+
      "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
      "&format=json&diagnostics=true&callback=";
  }

  countDocsWith(word) {
    var count = 0;
      this.corpus.subscribe(
        data => { data.forEach((item: any) => {
          if (item.article.indexOf(word) >= 0)
            count++;
        })}
      );
    return count;
  }

  getCorpusSize(corpus) {
    corpus._ref.once("value")
      .then(snapshots => {
        return snapshots.numChildren();
      });
  }
}
