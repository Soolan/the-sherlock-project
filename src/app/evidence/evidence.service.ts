import {Injectable, OnInit} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {googleSearchConfig, timeSpans} from "../app.module";

@Injectable()
export class EvidenceService implements OnInit{
  private http;
  private article='';
  private words =[];
  private corpusSize;
  private angularFire;
  private IDFs = [];
  private corpus: FirebaseListObservable <any>;
  // private IDFs: FirebaseListObservable <any>;

  constructor (http: Http, af:AngularFire) {
    console.log(this.IDFs);
    this.http = http;
    this.angularFire = af;
    this.corpus = af.database.list('Evidence/Corpus/Articles');
    // this.IDFs   = af.database.list('Evidence/Corpus/IDFs');
  }

  ngOnInit(){
    // Observable.timer(100,5000).subscribe(this.wordAnalyzer);
    // Observable.timer(100,3000).subscribe(this.getArticle);
    // Observable.timer(100,2000).subscribe(this.evaluateWords);
    // Observable.timer(800,2000).subscribe(this.calculateIDF);
    // Observable.timer(800,9000).subscribe(this.countDocsWith);
    // // Observable.timer(800,500).subscribe(this.sortWords);
    // Observable.timer(100,1000).subscribe(this.countInstances);
  }

  wordAnalyzer(url) {
    return this.getArticle(this.getYahooQueryUrl(url))
      .subscribe(
        data => {
          this.resetCounters();
          this.findKey(data, 'content');
          if(this.article) {
            this.evaluateWords( // normalizeWords
              this.countInstances(
                this.extractWords(this.article)
              )
            );
          }
        });
  }

  // instances are array of {word, count} objects
  evaluateWords(instances) {
    var self = this;
    var words = [];
    var normFactor = this.calculateNorm(instances);
    Promise.all(
      instances.map( function (w) {
        if (w.word.length < 30) {
          var normalized = w.count/normFactor;
          w['normalized']=normalized.toFixed(5);
          self.calculateIDF(w)
            .then(data => {
              self.words.push({
                word: w.word,
                count: w.count,
                normalized: w.normalized,
                idf: parseFloat(data).toFixed(5),
                tfidf_C: (w.count * data).toFixed(5),
                tfidf_N: (normalized * data).toFixed(5)
              });
            });
        }
        return w;
      })
    ).then(
      data => {
        console.log('pushing');
        this.corpus.push({article:this.article, bag_of_words:data});
      }
    );
  }

  resetCounters() {
    this.article = null;
    this.words = [];
  }

  calculateNorm (rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      total += w.count * w.count;
    });
    return Math.sqrt(total);
  }

  findKey(object, string) {
    for (var key in object) {
      if (object[key] && typeof(object[key])=="object") {
        this.findKey(object[key], string );
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
    // // =============== convert the loop here
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

  // {word, count}
  calculateIDF (word) {
    var idf;
    var exists = false;
    return this.countDocsWith(word)
      .then(data => {
        idf = Math.abs(Math.log2(
          (this.corpusSize == 0)? 1:this.corpusSize/(data+1)
        ));
        console.log(
          'idf:',idf,
          '/ corpus size:', this.corpusSize,
          '/ docs with word \"'+word.word+'\": ', data
        );

        this.IDFs.some((item: any) => {
          if (item.name === word.word) {
            exists = true;
            console.log(item,'it was:',idf);
            item.idf = idf;  // increase by one to cover the current document
            return exists;
          }
        });
        if(!exists) {
          this.IDFs.push({name:word.word, idf:idf});
        }
        return idf;
      });
  }

  getIDF(word, IDFs) {
    // use some to break the loop, otherwise it continues to
    // iterate meaninglessly even when a match found
    var idf = 0;
    IDFs.some((item: any) => {
      if (item.name === word.word) {
        idf = item.idf ++;  // increase by one to cover the current document
        // console.log(item,'it was:',idf-1);
        return true;
      }
    });
    return idf;
  }

  // with db
  /*
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
  */
  // end with db

  countDocsWith(word) {
    var count = 0;
    return this.corpus._ref.once("value")
      .then(snapshot => {
        this.corpusSize = snapshot.numChildren();
        if (this.corpusSize > 1) {
          snapshot.forEach((item: any) => {
            // console.log('inside countDocs');
            if (item.child('article').val().indexOf(word.word) > 0)
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

    var links = [
      'http://edition.cnn.com/2016/11/05/politics/trump-rushed-off-stage-at-campaign-rally/index.html',
      'http://edition.cnn.com/2016/11/05/politics/next-us-president-global-challenges/index.html',
      'http://edition.cnn.com/2016/11/04/politics/rudy-giuliani-hillary-clinton-email-fbi/index.html',
      'http://edition.cnn.com/2016/11/04/politics/fox-news-weekend-poll-clinton-trump/index.html',
      'http://edition.cnn.com/videos/tv/2016/11/05/poll-expert-i-will-eat-a-bug-if-trump-exceeds-240.cnn',
      // 'http://edition.cnn.com/2016/11/04/opinions/trumps-1-to-10-scale-is-nothing-new-for-women-prusher/index.html',
      // 'http://edition.cnn.com/2016/11/04/opinions/what-happens-if-election-contested-douglas/index.html',
      // 'http://edition.cnn.com/2016/11/05/middleeast/iraq-mosul-offensive/index.html',
      // 'http://edition.cnn.com/2016/11/06/asia/afghanistan-australian-kidnapping/index.html',
      // 'http://edition.cnn.com/2016/11/06/americas/nicaragua-presidential-election/index.html',
      // 'http://edition.cnn.com/2016/11/05/europe/brexit-gina-miller-threats/index.html',
      // 'http://edition.cnn.com/2016/11/06/sport/breeders-cup-classic-california-chrome/index.html',
      // 'http://edition.cnn.com/2016/11/02/architecture/obama-living-quarters-white-house/index.html'
    ];
    links.forEach( function (item) {
      self.wordAnalyzer(item);
    });

    // timeSpans.forEach(function (period) {
    //   self.getSearchResults(self.getGoogleQueryUrl(keyword, period))
    //     .subscribe(data => data.forEach(function (item) {
    //         self.wordAnalyzer(item.link);
    //    //     console.log('links:', data);
    //     }))
    // });
  }

  getGoogleQueryUrl(keyword, range) {
    return "https://www.googleapis.com/customsearch/v1?" +
      "key=" + googleSearchConfig.apiKey + "&cx=" + googleSearchConfig.cx +
      "&q=" + keyword + "&sort=" + range.sort + "&num=3&dateRestrict=" + range.span ;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.items)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
