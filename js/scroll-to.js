// scroll-n (sn)
// copyright 2012 John Weir & Fame Driver LLC
// requires jquery & underscore
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(){
  var timer;

  // compensate for the scollabr and pane getting out of alignment
  function compensate(){
    setTimeout(function(){sn.toggle(true)},10);

    return false;
    var x = parseInt($(this).css("top"),10),
        y = $(window).scrollTop(),
        self = this;

    // Do not comp unless necessary
    if(x >= 0){ return true; }

    sn.halt(function(){
      $(self).css({top:0});
      $(window).scrollTop(y -x);
    });

    return this;
  }

  // iOS generates an awful jitter since the elements by off by a fraction and never sync
  function veryNear(el,top){
    var elT = parseInt(el.css("top"),10);
    if(! isNaN(elT) && Math.abs(Math.abs(elT) - Math.abs(top)) < 2){
      return true;
    } else {
      return false;
    }
  }

  function scroll(el, top){
    if(veryNear(el,top)){ return el; }

    console.log(top)
    sn.toggle(false)
    $(window).scrollTop(top);
    compensate()
    return el;
    $("html, body").stop().animate(
      { scrollTop      : -1*top},
      { easing   : "easeOutExpo", // http://jqueryui.com/demos/effect/easing.html
        duration : 500,
        complete : compensate
      });

    return el;
  }

  $.fn.scrollTo = function(top, options){
    var self = this;
    clearTimeout(timer);
    timer = setTimeout(function(){scroll(self,top);}, 10);

    return this;
  };

}());

(function(){

  var timer,
  selector;

  // FIXME browser refresh does not always go to the correct item
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
    el.parent().scrollTo(offBy(el));
    return el;
  }

  function offBy(el){
    var elTop = $(el).offset().top,// - $(el).parent().offset().top,
        elH   = $(el).outerHeight(),
        top   = $(window).scrollTop(),
        cen   = $(window).height()/2;

        debugger
    return parseInt(elTop - cen + (elH/2));// + cen - elH);
    return parseInt(cen - elTop - (elH/2), 10);
  }

  function inCenter(el){
    var elTop = $(el).offset().top,
        elH   = $(el).outerHeight(),
        top   = $(window).scrollTop(),
        cen   = top + $(window).height()/2;

    return elTop <= cen && (elTop + elH) > cen;
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

  // Block the default scrolling so the script
  // does not go into a loop
  function halt(fn){
    sn.toggle(false);
    fn();
    setTimeout(function(){sn.toggle(true);},50);

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
    offset     : offBy,
    halt       : halt
  };

}());

(function(){
  // Scroll event handling

  var timer,
      enabled = true;

  window.sn.toggle = function(state){
    enabled = state;
    return enabled;
  };

  function scrollEnd(){
    return sn.set(sn.find());
  }

  function onScroll(e){
    if(enabled){
      sn.find();
      clearTimeout(timer);
      timer = setTimeout(scrollEnd,100);
      return true;
    } else {
      e.preventDefault();
      return false;
    }
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

  function init(){
    $("#pane").delegate(".section", "sn:exit", exit);
    $("#pane").delegate(".section", "sn:enter", enter);
  }

  sn.initObservers = init;

}());

$(function(){
  sn.init("#pane .section");
  sn.initEvents();
  // sn.initObservers();
});
