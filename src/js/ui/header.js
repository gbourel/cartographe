
class Header {
  constructor(ctrl){
    this._ctrl = ctrl;
    this._elt = $('header');

    this._elt.find('.actions .export').click(() => {
      this._ctrl.export();
    });

    this._elt.find('.actions .save').click(() => {
      this._ctrl.save();
    });
  }

  showDropMenu(){
    this._elt.find('.drop-menu ul').toggle();
  }
}

export default Header;