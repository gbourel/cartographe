import $ from 'jquery';
import _ from 'lodash';

import {constants} from './constants.js';
// import {googleAuth} from './core/googleAuth.js';
import CardsController from './core/cardsController.js';

import CardEditor from './ui/cardEditor.js';
import Header from './ui/header.js';

var ctrl = new CardsController();
ctrl.init()
.then(() => {
  var header = new Header(ctrl);
  var editor = new CardEditor(ctrl);
  editor.edit('back');

  $('#loading-status').hide();
  $('main').show();
});


