// scroll-n (sn)
// copyright 2012 John Weir & Fame Driver LLC
// requires jquery & underscore
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(){

  // iOS generates an awful jitter since the elements can be off by a fraction
  // TODO this might not be needed anymore
  function veryNear(top){
    var elT = $(window).scrollTop();
    if(! isNaN(elT) && Math.abs(Math.abs(elT) - Math.abs(top)) < 2){
      return true;
    } else {
      return false;
    }
  }

  function scroll(el, top){
    if(veryNear(top)){ return el; }

    $("html, body").stop().animate(
      { scrollTop : top},
      { easing    : "easeOutExpo", // http://jqueryui.com/demos/effect/easing.html
        duration  : 550,
        complete  : function(){el.trigger("sn:locked");}
      });

    return el;
  }

  $.fn.scrollTo = function(top){
    return scroll(this,top);
  };

}());

(function(){

  var timer, selector;

  function init($selector){
    selector   = $selector;
    $(window).resize(deferResize);
    return set(find());
  }

  function refresh(){
    return set(find());
  }

  // TODO (minor) next & prev should just scroll to those elements
  function next(){
    return set(select(find().next()));
  }

  function prev(){
    return set(select(find().prev()));
  }

  function collection(){
    return $(selector);
  }

  function set(o){
    return scroll(o[0] ? o : find());
  }

  function select(el){
    if(el.hasClass("active")){ return el;}

    el.addClass("active").trigger("sn:enter");
    sn.collection().parent().find(".active").not(el).
      removeClass("active").
      trigger("sn:exit");

    return el;
  }

  function scroll(el){
    return el.scrollTo(offBy(el));
  }

  function dim(el){
    return {
      elTop : $(el).offset().top,
      elH   : $(el).outerHeight(),
      top   : $(window).scrollTop(),
      mid   : $(window).height()/2
    };
  }

  function offBy(el){
    var d = dim(el);
    return parseInt(d.elTop - d.mid + (d.elH/2),10);
  }

  function inCenter(el){
    var d = dim(el);
    d.cen = d.top + d.mid;
    return d.elTop <= d.cen && (d.elTop + d.elH) > d.cen;
  }

  function headsOrTails(){
    var top   = $(window).scrollTop(),
        col   = collection().toArray(),
        head  = $(col.shift()),
        tail  = $(col.pop());

    if(top < head.offset().top){ return head; }
    if(top > tail.offset().top){ return tail; }
    throw "Could not find element";
  }

  function find(){
    return select($(_.find(collection(), inCenter) || headsOrTails()));
  }

  function deferResize(){
    clearTimeout(timer);
    timer = setTimeout(refresh, 25);
  }

  // public functions
  window.sn = {
    init       : init,
    collection : collection,
    set        : set,
    prev       : prev,
    next       : next,
    find       : find,
    refresh    : refresh,
    offset     : offBy
  };

}());

(function(){
  // Scroll event handling

  var timer;

  function scrollEnd(){
    return sn.set(sn.find());
  }

  function onScroll(e){
    sn.find();
    clearTimeout(timer);
    timer = setTimeout(scrollEnd,300);
    return true;
  }

  function onKey(e){
    switch(e.keyCode){
      case 38: sn.prev(); break; // up arrow
      case 40: sn.next(); break; // down arrow
      default: break;
    }
    return true;
  }

  function initEvents(){
    $(window).on("scroll",onScroll);
    $(document).on("keyup", onKey);
  }

  sn.initEvents = initEvents;

}());

(function(){

  function enter(){}
  function exit(){}
  function locked(){}

  function init(){
    $("#pane").delegate(".section", "sn:exit", exit);
    $("#pane").delegate(".section", "sn:enter", enter);
    $("#pane").delegate(".section", "sn:locked", locked);
  }

  sn.initObservers = init;

}());

$(function(){
  sn.init("#pane .section");
  sn.initEvents();
  // sn.initObservers();
});
