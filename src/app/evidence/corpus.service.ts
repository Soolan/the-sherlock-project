import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {EvidenceService} from "./evidence.service";
import {Observable} from "rxjs";
import {googleSearchConfig} from "../app.module";

@Injectable()
export class CorpusService {
  private http;
  private corpus: FirebaseListObservable<any>;
  private evidenceService;
  private timespans = [
    {"span":"d1", "sort":"date:d"},
    {"span":"w1", "sort":"date:a"},
    {"span":"m1", "sort":"date:a"},
    {"span":"m3", "sort":"date:a"},
    {"span":"y1", "sort":"date:a"},
    {"span":"y10","sort":"date:a"}
  ];
  constructor (http: Http, af: AngularFire, es: EvidenceService) {
    this.http = http;
    this.corpus = af.database.list('Evidence/Corpus');
    this.evidenceService = es;
  }

  corpusBuilder(mainKeyword, supportKeywords) {
    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation
    var keywords = this.setKeywordArray(mainKeyword, supportKeywords);
    this.addArticlesToCorpus(keywords);
  }

  setKeywordArray(mainKeyword, supportKeywords) {
    var keywords = supportKeywords.split(",");
    // keywords.push(mainKeyword);
    keywords.unshift(mainKeyword);
    return keywords;
  }

  addArticlesToCorpus (keyword) {
    var self = this;
    this.timespans.forEach( function (period) {
      self.getSearchResults(self.getQueryUrl(keyword, period))
        .subscribe(
          data => data.forEach( function (item) {
            self.evidenceService
              .getArticle(item.link)
              .subscribe(
                data => {
                  self.evidenceService.findInKey(data, 'content');
                  this.corpus.push(
                    {'link':item.link, 'content':self.evidenceService.article}
                  )
                }
              )
          })
        );
      ;
    })
  }

  getQueryUrl (keyword, range) {
    return "https://www.googleapis.com/customsearch/v1?key="+googleSearchConfig.apiKey+
      "&q="+keyword+"&cx="+googleSearchConfig.cx+
      "&sort="+range.sort+"&dateRestrict="+range.span;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res:Response) => res.json())
      .map(data => data.items)
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }
}
