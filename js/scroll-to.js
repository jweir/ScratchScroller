// scroll-n (sn)
// copyright 2012 John Weir & Fame Driver LLC
// requires jquery & underscore
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(){
  // TODO remove this code and have these defaults elsewhere
  window.sn = {
    easing : "easeOutExpo", // http://jqueryui.com/demos/effect/easing.html
    scrollDuration : 350,
    scrollEndDelay : 10
  };
}());

(function(){

  // iOS generates an awful jitter since the elements can be off by a fraction
  // TODO this might not be needed anymore
  function veryNear(top){
    var elT = $(window).scrollTop();
    if(Math.abs(Math.abs(elT) - Math.abs(top)) < 2){
      return true;
    } else {
      return false;
    }
  }

  function scroll(el, top){
    if(veryNear(top)){ return el; }

    $(el).parent().stop().animate(
      { top : -1 * top},
      { easing    : sn.easing,
        duration  : sn.scrollDuration,
        complete  : function(){el.trigger("sn:locked");}
      });

    return el;
  }

  $.fn.scrollTo = function(top){
    return scroll(this,top);
  };

}());
(function(){

  var pillar;

  function init(el){
    pillar = $("<div>&nbsp;</div>");
    pillar.css({
      height   : el.outerHeight(true),
      position : 'absolute',
      zIndex   : 1,
      top      : '0px',
      width    : '20px',
      visibility: 'none'
    });

    el.css({
      position : "fixed",
      left     : el.offset().left,
      top      : el.offset().top
    });

    el.parent().append(pillar);
    return pillar;
  }

  window.sn.proto = {
    init : init
  }

})();

(function(){
  $.fn.scrollLock = function(options){
    _.extend(sn, options || {});
    return init(this);
  }
  //Scroll controller
  var timer, selector;

  function init($selector){
    selector = $selector;
    sn.proto.init(collection().parent());
    $(window).resize(deferResize);
    sn.initEvents();
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
      elTop : $(el).position().top,
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

    if(top < head.position().top){ return head; }
    if(top > tail.position().top){ return tail; }
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
  _.extend(window.sn, {
    init       : init,
    collection : collection,
    set        : set,
    prev       : prev,
    next       : next,
    find       : find,
    refresh    : refresh,
    offset     : offBy
  });

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
    timer = setTimeout(scrollEnd,sn.scrollEndDelay);
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

(function(){
  // Diagnostics for timing scroll events
  var timer, now, log = [];

  function scrollEnd(){
    console.log(log.length, _.max(log), _.min(log));
    now = null;
    log = [];
  }

  function onScroll(e){
    var n = new Date();
    if(now !== null) log.push(n - now);
    now = n;
    clearTimeout(timer);
    timer = setTimeout(scrollEnd,sn.scrollEndDelay);
    return true;
  }

  function initDiagnostics(){
    return $(window).on("scroll",onScroll);
  }

  sn.initDiagnostics = initDiagnostics;

}());

$(function(){
  // sn.init("#pane .post");
  // sn.initEvents();
  // sn.initObservers();
  // sn.initDiagnostics();
});
