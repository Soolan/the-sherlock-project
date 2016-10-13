import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html'
})
export class EvidenceComponent {
  private words;
  private evidenceService:EvidenceService;
  private article:string =
    "England captain Wayne Rooney says he is in a difficult period after he was dropped for Tuesday\'s World Cup qualifier against Slovenia."+
    "Washington (CNN)House Speaker Paul Ryan dealt his own party\'s presidential nominee a withering blow Monday, telling fellow Republicans he will no longer defend Donald Trump and will instead use the next 29 days to focus on preserving his party\'s hold on Congress."+
    "The speaker is going to spend the next month focused entirely on protecting our congressional majorities,\" Ryan\'s spokeswoman, AshLee Strong, said in a statement.";
  private url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http://edition.cnn.com/2016/10/12/politics/florida-election-hack/index.html%22%20and%20xpath%3D%22//*[contains(@class,%27paragraph%27)]|//p%22&format=json&diagnostics=true&callback=";
  constructor (es:EvidenceService) {
    this.evidenceService = es;
    this.evidenceService.wordCounts(this.url);
    this.words = this.evidenceService.getWords();
    console.log(this.evidenceService);
  }
}

