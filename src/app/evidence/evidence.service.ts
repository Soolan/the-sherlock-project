import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {googleSearchConfig, timeSpans} from "../app.module";

@Injectable()
export class EvidenceService {
  private http;
  private article='';
  private words;
  private corpusSize;
  private angularFire;
  // private IDFs = [];
  private corpus: FirebaseListObservable <any>;
  private IDFs: FirebaseListObservable <any>;

  constructor (http: Http, af:AngularFire) {
    this.http = http;
    this.angularFire = af;
    this.corpus = af.database.list('Evidence/Corpus/Articles');
    this.IDFs   = af.database.list('Evidence/Corpus/IDFs');
  }

  wordAnalyzer(url) {
    return this.getArticle(this.getYahooQueryUrl(url))
      .subscribe(
        data => {
          this.resetCounters();
          this.findInKey(data, 'content');
          if(this.article)
            this.words = this.evaluateWords(
              this.countInstances(this.extractWords(this.article))
            );
        });
  }

  evaluateWords(instances) {
    var self = this;
    var words = [];
    var normFactor = this.calculateNorm(instances);
    instances.forEach(function (w) {
      var normalized = w.count/normFactor;
      self.calculateIDF(w).then(data => {
        words.push({
          word:w.word,
          count:w.count,
          idf:parseFloat(data).toFixed(5),
          normalized:normalized.toFixed(5),
          tfidf_C:(w.count*data).toFixed(5),
          tfidf_N:(normalized*data).toFixed(5)
        });
        if(words.length == instances.length)
          self.corpus.push({article: self.article, summary: words})
      });
    });

    // new Promise(function(resolve, reject) {
    //   resolve(words)
    // }).then( words => {
    //   this.corpus.push({article: this.article, summary: words})
    // });
    return words;
  }

  resetCounters() {
    this.article = null;
    this.words = null;
  }

  calculateNorm (rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      total += w.count * w.count;
    });
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
    return this.sortWords(instances);
  }

  // sort the words and save them as an array of objects
  sortWords (instances) {
    var words = [];
    var sortedWords = Object.keys(instances).sort(function(a,b) {
        return instances[a]-instances[b]
    });
    sortedWords.forEach(function (word) {
      words.push({word:word, count:instances[word]});
    });
    return words;
  }

  getYahooQueryUrl (link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
      "q=select * from html where url=\""+ link +"\" and "+
      "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
      "&format=json&diagnostics=true&callback=";
  }

  // calculateIDF (word) {
  //   var idf = this.isIDFExist (word, this.IDFs);
  //   if(idf){
  //     return new Promise(function(resolve, reject) {
  //       resolve(idf);
  //     });
  //   } else {
  //     return this.countDocsWith(word)
  //       .then(data => {
  //         idf = Math.log2(
  //           (this.corpusSize == 0)?1:this.corpusSize / (1 + data)
  //         );
  //         this.IDFs.push({name:word.word, idf:idf});
  //         return idf;
  //       });
  //   }
  // }

  // isIDFExist(word, IDFs) {
  //   return IDFs.forEach((idf: any) => {
  //     if (idf.name === word) {
  //       console.log(idf);
  //       idf.idf ++;  // increase by one to cover the current document
  //       console.log(idf);
  //       return idf.idf;
  //     }
  //     else
  //       return null;
  //   });
  // }

  calculateIDF (word) {
    return this.isIDFExist (word, this.IDFs)
      .then(data => {
        console.log('isIDFExist',data);
        if(data!=0){
          return new Promise(function(resolve, reject) {
            resolve(data);
          });
        } else {
          return this.countDocsWith(word)
            .then(data => {
              var idf = Math.log2(
                (this.corpusSize == 0)?1:this.corpusSize / (1 + data)
              );
              this.IDFs.push({name:word.word, idf:idf});
              return idf;
            });
        }
      });
  }

  isIDFExist(word, IDFs) {
    console.log("in duplicate check");
    return IDFs._ref.once("value")
      .then(snapshot => {
      if (snapshot.exists()) {

        snapshot.forEach((item: any) => {
          if (item.child('name').val() == word.word) {
            var newIdf = item.child('idf').val() + 1;
            IDFs.update(item, {name: word.word, idf: newIdf});
            console.log('idf : ', newIdf);
            return newIdf;
          }
          else {
            console.log('returns zero ');
            return 0;
          }
        });
      } else {
        return 0;
      }
    });
  }

  countDocsWith(word) {
    var count = 0;
    return this.corpus._ref.once("value")
      .then(snapshot => {
        this.corpusSize = snapshot.numChildren();
        if (this.corpusSize > 1) {
          snapshot.forEach((item: any) => {
            if (item.child('article').val().indexOf(word) > 0)
              count++;
          });
        }
        return count;
      });
  }

  corpusBuilder(mainKeyword, supportKeywords) {
    this.resetCounters();

    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation
    var keywords = this.setKeywordArray(mainKeyword, supportKeywords);
    keywords.forEach( (keyword: any) => {
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
       //     console.log('links:', data);
          })
        )
    });
  }

  getGoogleQueryUrl(keyword, range) {
    return "https://www.googleapis.com/customsearch/v1?" +
      "key=" + googleSearchConfig.apiKey + "&cx=" + googleSearchConfig.cx +
      "&q=" + keyword + "&sort=" + range.sort + "&dateRestrict=" + range.span ;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.items)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
