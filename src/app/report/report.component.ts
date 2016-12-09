import {Component, OnInit} from '@angular/core';
import {FirebaseListObservable, AngularFire, FirebaseObjectObservable} from "angularfire2";
import {ReportConfig} from "./report.config";
import {ReportService} from "./report.service";

@Component({
  selector: 'sh-report',
  templateUrl: './report.html'
})
export class ReportComponent implements OnInit {
  private reportService: ReportService;
  private templates: FirebaseListObservable<any>;
  private stats: FirebaseObjectObservable <any>;
  private items = [];
  private angularFire;
  private reports = [];
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

  constructor(rs:ReportService, af: AngularFire) {
    this.reportService = rs;
    this.templates = af.database.list('/Report/templates');
    this.stats = af.database.object('Evidence/Corpus/Stats', {preserveSnapshot: true});
  }

  ngOnInit() {
    this.templates.subscribe(data => {
      this.items = data;
      // empty the reports array otherwise any changes in the template page
      // adds new entries to the array and you will end up with duplicates.
      this.reports = [];
      this.items.forEach(item => this.setReport(item));
    });
  }

  setReport(template) {
    // this.setGeneral(template);
    this.reports.push({
      general: this.setGeneral(template),
      corpus:  this.setCorpus(template),
      cluster: this.setCluster(template)
    });
  }

  setGeneral(template) {
    let general = {};
    this.stats.subscribe(snapshot => {
      if (snapshot.exists()) {
        //object exists
        general['mainKeyword'] = snapshot.val().mainKeyword;
        general['corpusSize'] =  template.corpusSize?snapshot.val().corpusSize:null;
        general['vocabularySize'] = template.vocabularySize?snapshot.val().vocabularySize:null;
      }
    });
    return general;
  }

  setCorpus(template) {
    // ToDo: Initialize related values via service
    return this.reportService.setCorpus(template);
  }

  setCluster(template) {
    // ToDo: Initialize related values via service
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
