import {Component, Input, EventEmitter, Output} from '@angular/core';
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report-template',
  templateUrl: './report-template.html'
})
export class ReportTemplateComponent {
  @Input('template') model: ReportConfig;
  @Output() onSaveReportTemplate = new EventEmitter<any>();
  @Output() onDeleteReportTemplate = new EventEmitter<any>();

  constructor () {}

  saveReportTemplate(model) {
    this.onSaveReportTemplate.emit(model);
  }

  deleteReportTemplate(model) {
    this.onDeleteReportTemplate.emit(model);
  }
}
