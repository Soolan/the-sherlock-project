import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2";

@Component({
  selector: 'sh-accuracy',
  templateUrl: './accuracy.html',
  styleUrls: ['./accuracy.css']
})
export class AccuracyComponent implements OnInit {
  private prevents = [];
  private cures: FirebaseListObservable<any>;
  private angularFire;
  constructor(af: AngularFire) {
    this.angularFire = af;
  }

  ngOnInit() {
    this.angularFire.database
      .list('/Accuracy/cures')
      .subscribe(data => {
        this.cures = data
      })
  }

  newCure() {
    this.cures.push({description:'new cure'})
  }

  editCure(event, id) {
    this.cures.update(id, {description:event.target.outerText});
  }

  deleteCure(id) {
    this.cures.remove(id);
  }
}
