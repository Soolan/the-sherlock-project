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
  constructor (es:EvidenceService) {
    this.evidenceService = es;
    this.words = this.evidenceService.wordcounts(this.article);
    // console.log(this.words);
  }
}

