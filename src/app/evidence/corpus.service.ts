import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2";
import {EvidenceService} from "./evidence.service";
import {Observable} from "rxjs";
import {googleSearchConfig} from "../app.module";

@Injectable()
export class CorpusService {
  private http;
  private angularFire;
  private evidenceService;
  private timespans = [
    {"span": "d1", "sort": "date:d"}
    /*  {"span":"w1", "sort":"date:a"},
     {"span":"m1", "sort":"date:a"},
     {"span":"m3", "sort":"date:a"},
     {"span":"y1", "sort":"date:a"},
     {"span":"y10","sort":"date:a"}*/
  ];

  constructor(http: Http, af: AngularFire, es: EvidenceService) {
    this.http = http;
    this.angularFire = af;
    this.evidenceService = es;
  }

  corpusBuilder(mainKeyword, supportKeywords) {
    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation
    var self = this;
    var keywords = this.setKeywordArray(mainKeyword, supportKeywords);
    keywords.forEach(
      function (keyword) {
        console.log(keyword);
        self.fetchLinks(keyword);
      }
    );
    // this.addArticlesToCorpus(this.evidenceService);
  }

  setKeywordArray(mainKeyword, supportKeywords) {
    var keywords = supportKeywords.split(",");
    // keywords.push(mainKeyword);
    // use unshift to add an element to the beginning of an array
    keywords.unshift(mainKeyword);
    return keywords;
  }

  fetchLinks (keyword) {
    var self = this;
    // remove previous corpus
    this.angularFire.database.object('Evidence/Corpus/').remove();
    var links = this.angularFire.database.list('Evidence/Corpus/links');
    var articles = this.angularFire.database.list('Evidence/Corpus/articles');
    var evidence = this.angularFire.database.list('Evidence/Corpus/current-tree');

    this.timespans.forEach( function (period) {
      self.getSearchResults(self.getQueryUrl(keyword, period))
        .subscribe(
          data => data.forEach( function (item) {
            console.log("link: ", item.link);
            // links.push({'link':item.link});
            var url = self.evidenceService.getQueryUrl(item.link);
            self.evidenceService
              .getArticle(url)
              .subscribe(
                data => {
                  self.evidenceService.findInKey(data, 'content');
                  evidence.push({
                    'link':item.link,
                    'article': self.evidenceService.article
                  })
                });
          })
        );
    })
  }

  // addArticlesToCorpus(evidenceService) {
  //   var links = this.angularFire.database.list('Evidence/Corpus/links');
  //   var articles = this.angularFire.database.list('Evidence/Corpus/articles');
  //
  //   links._ref.once("value")
  //   // then loop through each news item
  //     .then(snapshots => { snapshots.forEach(
  //       function(snapshot) {
  //         var url = evidenceService.getQueryUrl(snapshot.child("link").val());
  //         evidenceService
  //           .getArticle(url)
  //           .subscribe(
  //             data => {
  //               evidenceService.findInKey(data, 'content');
  //               articles.push({'article': evidenceService.article})
  //             });
  //       })});
  // }

  getQueryUrl (keyword, range) {
    var url= "https://www.googleapis.com/customsearch/v1?key="+googleSearchConfig.apiKey+
      "&q="+keyword+"&cx="+googleSearchConfig.cx+"&num=2"+
      "&sort="+range.sort+"&dateRestrict="+range.span;
    // console.log("url:", url);
    return url;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res:Response) => res.json())
      .map(data => data.items)
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }
}
