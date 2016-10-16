import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";

@Injectable()
export class EvidenceService {
  private http;
  private article='';
  private words;
  private normFactor;
  constructor (http: Http) {
    this.http = http;
  }

  wordCounts(url) {
    this.getArticle(url)
      .subscribe(
        data => {
          this.findKey(data, 'content');
          this.words= this.countInstances(this.extractWords(this.article));
          this.normFactor = this.calculateNorm(this.words);
        });
  }

  calculateNorm (rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      total += w.value * w.value;
    });
    return Math.sqrt(total);
  }

  findKey(object, myKey) {
    for (var key in object) {
      if (!!object[key] && typeof(object[key])=="object") {
        this.findKey(object[key], myKey );
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
    var words = [];
    var sortedWords = Object.keys(instances).sort(
      function(a,b){
        return instances[b]-instances[a]
      });
    sortedWords.forEach(function (word) {
      words.push({key:word, value:instances[word]});
    });
    return words;
  }
}
