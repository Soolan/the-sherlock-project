import {Component} from '@angular/core';
import {CollectorService} from './collector.service';
@Component({
  selector: 'sh-collector',
  templateUrl: './collector.html',
  providers: [CollectorService]
})
export class CollectorComponent {
  caption = "Some news worth investigating";
  headlines;

  constructor(collectorService: CollectorService) {
    this.headlines = collectorService.getHeadlines();
  }

  onChange(item, status){
    console.log(item, status);
  }
}
