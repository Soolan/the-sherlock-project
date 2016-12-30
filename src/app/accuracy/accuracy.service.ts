import {Injectable} from '@angular/core';
import {preventions} from '../app.module'

@Injectable()
export class AccuracyService {
  private prevents = preventions;
  constructor() {
    preventions.push({"id":"888", "description":"oh yah", "file":"fdty", "line":"76", "hits":"3"})
  }
  takeSnapshot(id, file, line, variables, description) {}
  
  getPrevents() {
    return this.prevents;
  }
}
