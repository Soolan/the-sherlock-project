import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {AccuracyService} from "./accuracy.service";

@Component({
  selector: 'sh-accuracy',
  templateUrl: './accuracy.html',
  styleUrls: ['./accuracy.css']
})
export class AccuracyComponent implements OnInit {
  private prevents = [];
  private cures: FirebaseListObservable<any>;
  private items;
  constructor(af: AngularFire, as: AccuracyService) {
    this.cures = af.database.list('/Accuracy/cures');
    this.prevents = as.getPrevents();
  }

  ngOnInit() {
    this.cures
      .subscribe(data => {
        this.items = data
      })
  }

  newCure() {
    this.cures.push({description:'new cure', implemented:'false'})
  }

  editCure(id, event=null, implemented=false) {
    (event)?
      this.cures.update(id, {description: event.target.outerText}):
      this.cures.update(id, {implemented:implemented})
  }

  deleteCure(id) {
    this.cures.remove(id);
  }
}
