import {Component, Input} from '@angular/core';
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report-template',
  templateUrl: './report-template.html'
})
export class ReportTemplateComponent {
  @Input('templates') model: ReportConfig;

}
