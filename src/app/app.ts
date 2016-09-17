import {Component} from '@angular/core';
import {NavigationComponent} from "./navigation/navigation.component";
import {CollectorComponent} from "./collector/collector.component";

@Component({
  selector   : 'app',
  templateUrl: './app.html',
  directives: [NavigationComponent, CollectorComponent]
})
export class AppComponent {
}
