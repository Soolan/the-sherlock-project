import {Injectable} from '@angular/core';
import {CollectorService} from '../collector/collector.service';
import {RatingService} from '../rating/rating.service';
import {FirebaseListObservable, AngularFire} from 'angularfire2';

@Injectable()
export class NotifierService {
  private cron = require('node-cron');
  private collectorService;
  private ratingService;
  private angularFire;
  private task;
  private threshold = [1, 5, 10];
  private items: FirebaseListObservable<any>;
  private maintenance: FirebaseListObservable<any>;
  private eraseFactor = 72; // 3 days (72 hours)

  constructor(cs: CollectorService, rs: RatingService,
              af: AngularFire) {
    this.collectorService = cs;
    this.ratingService = rs;
    this.angularFire = af;
  }

  scheduler(notifier: string, threshold: string) {
    // stop previous tasks first, otherwise you will have
    // multiple notifiers with different settings running
    if(this.task != null)
      this.task.stop();
    var self = this;
    this.task = this.cron.schedule('*/15 * * * * *', function () {
        self.removeOldNews();
        self.collectRateNotify(notifier, threshold);
      });
  }

  collectRateNotify(notifier, threshold) {
    var self = this;
    var thresholdRank = this.thresholdToRank(threshold);
    this.items = this.angularFire.database
      .list('/Notifier/rated-news');
    this.collectorService.getHeadlines().subscribe(
      data => { data.forEach((item: any) => {
        var trendRank =  self.ratingService.rl
          .rateTrends(  item.title + item.description);
        var dateRank=self.ratingService.rl.rateDate(item.PubDate);
        var newsRank = trendRank + dateRank;
        if (newsRank > thresholdRank)
          self.items.push({
            'title': item.title,
            'description': item.description,
            'rank': newsRank,
            'date': item.pubDate,
            'link': item.link
          });
      });
      if (notifier == 'email'){}
        //this.emailNotification();
    })
  }

  thresholdToRank(threshold) {
    var rank = this.threshold[0];
    if (threshold == 'high rated')
      rank = this.threshold[2];
    else if (threshold == 'medium rated')
      rank = this.threshold[1];
    return rank;
  }

  removeOldNews() {
    var self = this;
    this.maintenance = this.angularFire.database
      .list('/Notifier/rated-news', {preserveSnapshot: true});
    this.maintenance.subscribe(snapshots => {
      snapshots.forEach(
        function (snapshot) {
          var date = snapshot.val().date;
          if (self.isOldNews(date) == true)
            self.maintenance.remove(snapshot.key);
        })
    });
  }

  isOldNews(newsDate) {
    var eraseFactor = this.eraseFactor *60 * 60 * 1000;
    var now = new Date().getTime();
    var then= new Date(newsDate).getTime();
    if((now - then) > eraseFactor) {
      console.log(now - then);
      return true;
    }
    return false;
  }
}
