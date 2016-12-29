import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";

@Component({
  selector: 'sh-accuracy',
  templateUrl: './accuracy.html'
})
export class AccuracyComponent implements OnInit {
  private prevents = [];
  private angularFire;
  constructor(af: AngularFire) {
    this.angularFire = af;
  }
  ngOnInit() {
    this.angularFire.database
      .list('/Accuracy/prevents')
      .subscribe(data => {
        this.prevents = data
      })
  }
}
