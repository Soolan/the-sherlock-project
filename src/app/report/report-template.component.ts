import {Component, Input, EventEmitter, Output} from '@angular/core';
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report-template',
  templateUrl: './report-template.html'
})
export class ReportTemplateComponent {
  @Input('template') model: ReportConfig;
  private headingId = 'myId';
  constructor () {
    // console.log(this.ids);
    // console.log(template);
  }
  // private headingId = this.model.$key;
  // private collapseId;
  // @Output() onNewReport = new EventEmitter<ReportConfig>();

  // newReport() {
  //   this.onNewReport.emit( new ReportConfig('untitled', false,
  //     false, false, 0, 0, false, false, false, false, false,
  //     {show:true, size:false, distance:false, url:false}, 0, 0));
  // }
}
