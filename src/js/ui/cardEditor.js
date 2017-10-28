import $ from 'jquery';
import _ from 'lodash';
import SVG from 'svg.js';

/// Fetch svg content from remote file, returns promise.
function fetchSVG(url){
  return new Promise((resolve, reject)=>{
    fetch(url).then(response => {
      if(response.status !== 200){
        console.error('Unable to fetch svg', url);
        reject();
      }
      resolve(response.text());
    });
  });
}

class CardEditor {
  constructor(ctrl){
    this.model = ctrl.model;
    this.inputsvg = SVG('card-svg');
    this.inputsvg.size(220,320);
    $('button.cards-back').click(() => {
      this.edit('back');
    });
    $('button.cards-front').click(() => {
      this.edit('front');
    });
    $('button.add-question').click(() => {
      this.addQuestion();
    });
    // Back
    $('#card-main-color').val(this.model.color);
    $('#card-main-title').val(this.model.title);
    $('#card-main-color').keyup(_.debounce(() => {
      this.colorChanged();
    }, 200));
    $('#card-main-title').keyup(_.debounce(() => {
      this.titleChanged();
    }, 200));
  }

  addQuestion(){
    var idx = this.model.questions.length;
    this.model.addQuestion();
    $('.questions').append(`<textarea class="card-question form-control" index="${idx}" tabindex="${2*idx}"></textarea>`);
    $('.answers').append(`<textarea class="card-answer form-control" index="${idx}" tabindex="${2*idx+1}"></textarea>`);
  }

  colorChanged(){
    var colorInput = $('#card-main-color');
    var elts = this.inputsvg.select('.game-color');
    this.model.color = colorInput.val();
    elts.style('fill', this.model.color);
  }

  titleChanged(){
    var titleInput = $('#card-main-title');
    var lines;
    var elt = this.inputsvg.select('text#text-title').get(0);
    this.model.title = titleInput.val();
    lines = this.model.title.split('\n');
    // slightly move up text for each new line
    elt.y(128 - (4*(lines.length-1)));
    // set text line by line
    elt.text(add => {
      var first = true;
      lines.forEach(line => {
        var tspan = add.tspan(line);
        if(first){ first = false; }
        else { tspan.newLine(); }
      });
    });
  }

  questionChanged(index){
    var titleInput = $('.card-question:eq('+index+')');
    var val = titleInput.val();
    this.model.setQuestion(index, val);
    this.updateQuestion(index);
  }

  answerChanged(index){
    var titleInput = $('.card-answer:eq('+index+')');
    var val = titleInput.val();
    this.model.setAnswer(index, val);
    this.updateAnswer(index);
  }

  updateFrontColor(){
    var elts = this.inputsvg.select('.game-color');
    elts.style('fill', this.model.color);
    elts = this.inputsvg.select('.game-color-stroke');
    elts.style('stroke', this.model.color);
  }

  updateFrontTitle(){
    var elt = this.inputsvg.select('text#front-title').get(0);
    elt.text(add => {
      var span = add.tspan(this.model.title);
      // Multi-line : each line must be 160 length max
      if(span.length() > 160){
        var first = true;
        let lines = this.model.title.split('\n');
        add.clear();
        elt.leading(1.0);     // linespacing
        elt.y(-10);           // move up text to handle 2 lines
        if(lines.length < 3){
          elt.style('font-size', '18px');
          lines.forEach(line => {
            var tspan = add.tspan(line);
            if(first){ first = false; }
            else { tspan.newLine(); }
          });
        } else {
          let length = [];
          // compute all sizes at with font-size: 20px
          lines.forEach(line => {
            var tspan = add.tspan(line);
            length.push(tspan.length());
          });
          console.info(length);
        }
      }
    });
  }

  updateQuestion(index){
    var elt = this.inputsvg.select('text#text-question').get(0);
    var lines = this.model.questions[index].split('\n');
    // set text line by line
    elt.text(add => {
      var first = true;
      lines.forEach(line => {
        var tspan = add.tspan(line);
        if(first){ first = false; }
        else { tspan.newLine(); }
      });
    });
  }

  updateAnswer(index){
    var elt = this.inputsvg.select('text#text-answer').get(0);
    var lines = this.model.answers[index].split('\n');
    elt.leading(1.1);     // linespacing
    // set text line by line
    elt.text(add => {
      var first = true;
      lines.forEach(line => {
        var tspan = add.tspan(line);
        if(first){ first = false; }
        else { tspan.newLine(); }
      });
    });
  }

  updateQuestions(){
    var answers = this.model.answers;
    $('.questions textarea').remove();
    $('.answers textarea').remove();
    this.model.questions.forEach((question, idx) => {
      let answer = answers[idx];
      $('.questions').append(`<textarea class="card-question form-control" index="${idx}" tabindex="${2*idx+1}">${question}</textarea>`);
      $('.answers').append(`<textarea class="card-answer form-control" index="${idx}" tabindex="${2*idx+2}">${answer}</textarea>`);
    });
    $('.card-question').keyup(_.debounce(e => {
      var index = parseInt($(e.target).attr('index'));
      this.questionChanged(index);
    }, 200));
    $('.card-answer').keyup(_.debounce(e => {
      var index = parseInt($(e.target).attr('index'));
      this.answerChanged(index);
    }, 200));
    $('.card-question, .card-answer').focus(e => {
      var index = parseInt($(e.target).attr('index'));
      this.updateQuestion(index);
      this.updateAnswer(index);
    });
  }

  edit(type){
    this.inputsvg.clear();
    if(type === 'back'){
      fetchSVG('data/card-back.svg').then(src => {
        this.inputsvg.svg(src);
        this.colorChanged();
        this.titleChanged();
        $('.card-editor .card-attr-front').hide();
        $('.card-editor .card-attr-back').show();
      });
    } else if(type === 'front'){
      fetchSVG('data/card-front.svg').then(src => {
        this.inputsvg.svg(src);
        this.updateFrontColor();
        this.updateFrontTitle();
        this.updateQuestions();
        $('.card-editor .card-attr-back').hide();
        $('.card-editor .card-attr-front').show();
      });
    }
  }
}

export default CardEditor;