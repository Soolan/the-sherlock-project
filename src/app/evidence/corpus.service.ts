import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {EvidenceService} from "./evidence.service";
import {Observable} from "rxjs";
import {googleSearchConfig} from "../app.module";

@Injectable()
export class CorpusService {
  private http;
  private corpusSize = 56;
  private corpus: FirebaseListObservable <any>;
  private evidenceService;
  private angularFire;
  private timespans = [
    {"span": "d1", "sort": "date:d"} //,
    // {"span":"w1", "sort":"date:a"},
    // {"span":"m1", "sort":"date:a"},
    // {"span":"m3", "sort":"date:a"},
    // {"span":"y1", "sort":"date:a"},
    // {"span":"y10","sort":"date:a"}
  ];

  constructor(http: Http, af: AngularFire, es: EvidenceService) {
    this.http = http;
    this.angularFire = af;
    this.evidenceService = es;
    this.corpus = af.database.list('Evidence/Corpus/current-tree');
    af.database.object('Evidence/Corpus')
      .set({'summary': {'corpus-size': this.corpusSize}});
  }

  corpusBuilder(mainKeyword, supportKeywords) {
    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation

    var self = this;
    var keywords = this.setKeywordArray(mainKeyword, supportKeywords);
    keywords.forEach( function (keyword) {
        console.log(keyword);
        self.fetchLinks(keyword, this.evidenceService);
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

  fetchLinks(keyword, es) {
    var self = this;
    this.timespans.forEach(function (period) {
      self.getSearchResults(self.getQueryUrl(keyword, period))
        .subscribe(
          data => data.forEach(function (item) {
            var url = es.getQueryUrl(item.link);
            es.wordCounts(url);
          })
        )
    });
    return this.corpus;
  }

  getQueryUrl(keyword, range) {
    return "https://www.googleapis.com/customsearch/v1?" +
      "key=" + googleSearchConfig.apiKey + "&cx=" + googleSearchConfig.cx +
      "&q=" + keyword + "&sort=" + range.sort + "&dateRestrict=" + range.span;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.items)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
