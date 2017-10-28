
import db from './localdb.js';

class Cards {
  constructor(val){
    this._id = (typeof(val) === 'string') ? val : val._id;
    this._color = val._color || '#0084ff';
    this._title = val._title || 'TITRE';
    this._questions = val._questions || ['Q ?'];
    this._answers = val._answers || ['R'];
  }

  get color(){ return this._color; }
  set color(val){
    this._color = val;
    this.save();
  }
  get title(){ return this._title; }
  set title(val){
    this._title = val;
    this.save();
  }
  get questions(){ return this._questions; }
  setQuestion(idx, val){
    console.info('set question', idx, val);
    this._questions[idx] = val;
    this.save();
  }
  get answers(){ return this._answers; }
  setAnswer(idx, val){
    this._answers[idx] = val;
    this.save();
  }
  addQuestion(){
    this._questions.push('Question');
    this._answers.push('Réponse');
    // this.save();
  }

  /// Saves to DB and returns promise.
  save() {
    return db.save(this);
  }

  /// Loads from DB and return promise.
  static load(id){
    return new Promise((resolve) => {
      db.get(id).then(val => {
        resolve(val ? new Cards(val) : null);
      });
    });
  }
}

export default Cards;
