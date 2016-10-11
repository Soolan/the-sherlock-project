import {Injectable} from "@angular/core";

@Injectable()
export class EvidenceService {
  wordcounts(article:string) {
    var allWords = this.extractWords(article);
    var instances = this.wordInstances(allWords);
  }

  extractWords(article:string) {
    // remove all symbols from the article
    var cleanse = article.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    // extract all words available between white spaces. (tabs, spaces, etc)
    // and return the result as an array of words,
    return cleanse.split(/\s+/);
  }

  wordInstances (allWords) {
    // create an object for word instances and their counts
    var instances = {};
    allWords.forEach(function (word) {
      if (instances.hasOwnProperty(word)) {
        instances[word]++;
      } else {
        instances[word] = 1;
      }
    });
    // sort the instances descending based on occurrence
    instances = Object.keys(instances).sort(
      function(a,b){
        return instances[b]-instances[a]
      });
    return instances;
  }
}
