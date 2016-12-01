import {Component, OnInit} from '@angular/core';
import {ReportTemplateComponent} from './report-template.component';
import {FirebaseListObservable, AngularFire} from "angularfire2";
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report',
  templateUrl: './report.html'
})
export class ReportComponent implements OnInit {
  private templates;//: FirebaseListObservable<any>;
  private angularFire;
  private newsItems;
  private reportService;

  constructor(/*rs:ReportService, */af: AngularFire) {
    // this.reportService= rs;
    this.angularFire = af;
  }

  ngOnInit() {
    this.templates  = new ReportConfig('test', true, true, false, 5, 6, true, true, false, true, true,
        {show: true, size: true, distance: true, url: true}, 11, 22);
  //   this.angularFire.database.list('/Report/templates')
  //     .subscribe(data => {
  //       this.templates = data;
  //     });
  }

  // 1. read templates from db
  // 2. save them in an array
  // 3. loop through the array and render them
  // use @Input and @Output
}
