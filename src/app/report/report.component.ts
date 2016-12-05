import {Component, OnInit} from '@angular/core';
import {FirebaseListObservable, AngularFire} from "angularfire2";
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report',
  templateUrl: './report.html'
})
export class ReportComponent implements OnInit {
  // private templates;//: FirebaseListObservable<any>;
  private templates: FirebaseListObservable<any>;
  private items = [];
  private angularFire;
  private reports = [];
  private general = ['MARS','540', '15000'];
  private reportService;

  constructor(/*rs:ReportService, */af: AngularFire) {
    // this.reportService= rs;
    // this.angularFire = af;
    this.templates = af.database.list('/Report/templates');

      // .subscribe(data => this.templates);
  }

  ngOnInit() {
    // this.templates  = new ReportConfig('test', true, true, false, 5, 6, true, true, false, true, true,
    //     {show: true, size: true, distance: true, url: true}, 11, 22);
    this.templates.subscribe(data => {
        this.items = data;
        console.log('templates:', this.templates);
        console.log('items:', this.items);
      });
  }

  newReportTemplate() {
    this.templates.push( new ReportConfig('untitled333', false,
        false, false, 0, 0, false, false, false, false, false,
        {show:true, size:false, distance:false, url:false}, 0, 0)
    );
  }

  onSaveReportTemplate(report) {
    // console.log(report);
    var key = report.$key;
    delete report.$key;
    delete report.$exists;
    this.templates.update(key, report);
  }

  onDeleteReportTemplate(report) {
    this.templates.remove(report.$key);
  }

  // 1. read templates from db
  // 2. save them in an array
  // 3. loop through the array and render them
  // use @Input and @Output
}
