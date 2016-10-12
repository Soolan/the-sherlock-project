import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import search = require("core-js/fn/symbol/search");

@Injectable()
export class EvidenceService {
  private http;
  private article='';
  private words;
  constructor (http: Http) {
    this.http = http;
  }

  getWords() {
    return this.words;
  }

  wordCounts(url) {
    this.getArticle(url)
      .subscribe(
        // data => this.article = data.forEach(this.findContentKeys('content')));
        // data => console.log(data));
        data => this.findKey(data, 'content')
      )

    ;
    // var allWords = this.extractWords(this.article);
    // return this.wordInstances(allWords);
    // console.log(this.words)
  }

  findKey(object, myKey) {
    for (var key in object) {
      if (!!object[key] && typeof(object[key])=="object") {
        this.findKey(object[key], myKey );
      } else if (key == myKey) {
        // console.log(object[key]);
        this.article += object[key];
        // console.log(this.article);
      }
    }
    this.words=this.wordInstances(this.extractWords(this.article));
  }

  getArticle(url) {
    return this.http.get(url)
      .map((res:Response) => res.json())
      .map(data => data.query.results.p)
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }

  extractWords(article) {
    // remove all symbols from the article
    var cleanse = article.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    // extract all words available between white spaces. (tabs, spaces, etc)
    // and return the result as an array of words,
    return cleanse.split(/\s+/);
  }

  wordInstances (allWords) {
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
    // console.log(words);
    return words;
  }
}
