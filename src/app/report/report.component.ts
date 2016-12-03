import {Component, OnInit} from '@angular/core';
import {ReportTemplateComponent} from './report-template.component';
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
  private newsItems;
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

  newReport() {
    this.templates.push( new ReportConfig('untitled333', false,
        false, false, 0, 0, false, false, false, false, false,
        {show:true, size:false, distance:false, url:false}, 0, 0)
    );
  }

  // onNewReport( report: ReportConfig) {
  //   console.log(report);
  //   this.templates.push(report);
  // }

  // 1. read templates from db
  // 2. save them in an array
  // 3. loop through the array and render them
  // use @Input and @Output
}
