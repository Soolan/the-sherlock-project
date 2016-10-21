import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {EvidenceService} from "./evidence.service";

@Injectable()
export class CorpusService {
  private http;
  private corpus: FirebaseListObservable<any>;
  private evidenceService;
  constructor (http: Http, af: AngularFire, es: EvidenceService) {
    this.http = http;
    this.corpus = af.database.list('Evidence/Corpus');
    this.evidenceService = es;
  }

  corpusBuilder(keywords) {
    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation
  }

}
