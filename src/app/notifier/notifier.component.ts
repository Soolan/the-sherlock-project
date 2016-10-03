import {Component} from '@angular/core';
import {NotifierConfig} from './notifier.config';
import {
  AngularFire,
  FirebaseObjectObservable,
  FirebaseListObservable
} from 'angularfire2';
import {NotifierService} from "./notifier.service";
import {CollectorService} from "../collector/collector.service";
import {RatingService} from "../rating/rating.service";
import {RatingLogic} from "../rating/rating.logic";

@Component({
  selector: 'sh-notifier',
  templateUrl: './notifier.html',
  providers: [NotifierService, CollectorService, RatingService, RatingLogic]
})
export class NotifierComponent {
  private notify   = [true, false];
  private notifier = ['app', 'email'];
  private threshold= ['high rated', 'medium rated', 'low rated'];
  private model    = new NotifierConfig(false,'app','low rated');

  private config: FirebaseObjectObservable<any>;
  private ratedNews: FirebaseListObservable<any>;
  constructor(af: AngularFire, ns: NotifierService) {
    this.ratedNews = af.database.list('Notifier/rated-news');
    this.config = af.database.object('/Notifier/config', {preserveSnapshot: true});
    this.updateUI();
  }

  updateUI() {
    this.config.subscribe(snapshot => {
      if(snapshot.exists()) {
        //object exists
        this.model = {
          'notify':   snapshot.val().notify,
          'notifier': snapshot.val().notifier,
          'threshold': snapshot.val().threshold
        };
      } else {
        //object doesn't exist save the initialized model to db
        this.config.set(this.model);
      }
      // ToDo: Schedule a cron job based on the values of UI
    });
  }

  // Todo: Listen to element's change event and persist any
  // change to the Firebase Database
  updateDB(value) {
    switch(value) {
      case true || false:
        this.model.notify = value;
        break;
      case 'email' || 'app':
        this.model.notifier = value;
        break;
      case 'high rated' || 'medium rated' || 'low rated':
        this.model.threshold = value;
        break;
    }
    this.config.update(this.model);
  }
}
