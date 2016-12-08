import {Component, OnInit} from '@angular/core';
import {FirebaseListObservable, AngularFire, FirebaseObjectObservable} from "angularfire2";
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report',
  templateUrl: './report.html'
})
export class ReportComponent implements OnInit {
  private network: FirebaseObjectObservable <any>;
  private templates: FirebaseListObservable<any>;
  private items = [];
  private angularFire;
  private reports = [];
  private general = {mainKeyword: 'MARS', corpusSize: '540', vocabularySize: '15000'};
  private corpus = {
    topFreqs: [{word: 'w1', count: 10}, {word: 'w2', count: 9}],
    topIDFs: [{word: 'w1', idf: 0.4}, {word: 'w2', idf: 0.3}],
    longestArticle: {size: 4765, link: 'http://www.test.com'},
    shortestArticle: {size: 58, link: 'http://www.test.com'},
    averageSize: 759
  };
  private cluster = {
    // network: this.network,
    root: 'MARS',
    clusters: [{
      name: 'radiation',
      nodes: [{
        word_count: 234, distance: 0.2, link: 'http:www.test.com',
        main_phrases: ['mph1','mph2','mph3','mph4'],
        keyword_phrases: ['kph1','kph2','kph3','kph4']
      },{
        word_count: 434, distance: 0.1, link: 'http:www.test.com',
        main_phrases: ['mph1','mph2','mph3','mph4'],
        keyword_phrases: ['kph1','kph2','kph3','kph4']
      }]
    },{
      name: 'water',
      nodes: [{
        word_count: 657, distance: 0.3, link: 'http:www.test.com',
        main_phrases: ['mph1','mph2','mph3','mph4'],
        keyword_phrases: ['kph1','kph2','kph3','kph4']
      },{
        word_count: 879, distance: 0.2, link: 'http:www.test.com',
        main_phrases: ['mph1','mph2','mph3','mph4'],
        keyword_phrases: ['kph1','kph2','kph3','kph4']
      }]
    }]};

  private reportService;

  constructor(/*rs:ReportService, */af: AngularFire) {
    // this.reportService= rs;
    // this.angularFire = af;
    this.templates = af.database.list('/Report/templates');
    this.network = af.database.object('Evidence2/Corpus/network-graph');
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
    this.templates.push(new ReportConfig('untitled333', false,
      false, false, 0, 0, false, false, false, false, false,
      {show: true, size: false, distance: false, url: false}, 0, 0)
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
