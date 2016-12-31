import {Injectable} from '@angular/core';
import {preventions} from '../app.module'

@Injectable()
export class AccuracyService {
  private prevents = preventions;
  private hits = [];
  constructor() {
    preventions.push(
      {id:"888", description:"oh yah", file:"fdty", line:"76", hits:"3",
        variables:[{key:"helo", val:"blo"}]
      })
  }

  takeSnapshot(id, file, line, variables, description) {
    // if id exists increment the hit count and push vars to the var array
    // else add the new id with its properties
  }

  getPrevents() {
    return this.prevents;
  }
}
