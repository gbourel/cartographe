
import Cards from '../model/cards.js';

class CardsController {
  constructor(){
    this._model = null;
  }

  init(){
    const localDBKey = 'tmp-local-default';
    return new Promise(resolve => {
      Cards.load(localDBKey).then(def => {
        this._model = def || new Cards(localDBKey);
        resolve(this._model);
      });
    });
  }

  get model(){
    return this._model;
  }

  export(){
    console.info('Export');
  }

  save(){
    console.info('Enregistrer');
  }
}

export default CardsController;
