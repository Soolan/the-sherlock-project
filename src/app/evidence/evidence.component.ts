import {Component} from '@angular/core';
import {EvidenceService} from "./evidence.service";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html'
})
export class EvidenceComponent {
  private evidenceService:EvidenceService;

  constructor (es:EvidenceService) {
    this.evidenceService = es;
  }
}
