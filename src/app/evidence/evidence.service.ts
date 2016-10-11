import {Injectable} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");

@Injectable()
export class EvidenceService {
  wordcounts(article:string) {
    var allWords = this.extractWords(article);
    return this.wordInstances(allWords);
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
    return this.sortWords(instances);
  }

  // sort the words and save them as an array of objects
  sortWords (instances) {
    var words = [];
    var sortedWords = Object.keys(instances).sort(
      function(a,b){
        return instances[b]-instances[a]
      });
    sortedWords.forEach(function (word) {
      words.push({key:word, value:instances[word]});
    });
    return words;
  }
}
