// scroll-n (sn)
// copyright 2012 John Weir & Fame Driver LLC
// requires jquery & underscore
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(){
  // Events
  // sn:refresh trigger when contents are added/removed or resized
  // sn:enter when an element comes into the center
  // sn:exit when an element leaves the center
  // sn:locked when an element is in the center and stopped

  // Options
  window.sn = {
    easing : "easeOutExpo", // http://jqueryui.com/demos/effect/easing.html
    scrollDuration : 350,
    scrollEndDelay : 10,    // timeout before the scroll animation starts, set to false to fire instantly
    mousewheel     : false,
    locking        : false
  }

}());

(function(){

  $.fn.scrollTo = function(top){
    return scroll(this,top);
  };

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

}());

(function(){

  var pillar, anchor;

  function init(el){
    anchor = el;
    pillar = pillar || $("<div>&nbsp;</div>");
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

  function refresh(){
    pillar.css({
      height   : anchor.outerHeight(true)
    });
  }

  window.sn.proto = {
    init    : init,
    refresh : refresh
  }


}());

(function(){
  $.fn.scrollLock = function(options){
    _.extend(sn, options || {});
    return init(this.selector);
  }

  //Scroll controller
  var timer, selector;

  function init($selector){
    selector = $selector;
    sn.proto.init(collection().parent());
    $(window).resize(deferResize);
    sn.initEvents();
    if(sn.mousewheel){ bindMouseWheel();}
    return set(find());
  }

  function bindMouseWheel(){
    $('body').bind('mousewheel', function(event, delta) {
      if(Math.abs(delta) % 1 > 0){ // Probably a trackpad
        console.log("trackpad")
        return true
      }
      // disable, then renable the mousehweel in 1/2 a second
      $('body').off('mousewheel');
      setTimeout(bindMouseWheel, 500);

      var x = ( delta < 0  ) ? sn.next() : sn.prev();
      event.preventDefault();
      return false;
    });
  }

  function refresh(){
    sn.proto.refresh();
    return set(find());
  }

  $(window).bind("sn:refresh", refresh);

  // TODO (minor) next & prev should just scroll to those elements
  function next(){
    var el = find().next();
    if(el){
      var t = $(window).scrollTop();
      $(window).scrollTop(t + el.height());
      return el;
    } else {
      return find();
    }
  }

  function prev(){
    var el = find().prev();
    if(el){
      var t = $(window).scrollTop();
      $(window).scrollTop(t - el.height());
      return el;
    } else {
      return find();
    }
  }

  function collection(){
    return $(selector);
  }

  function set(o){
    return scroll(o[0] ? o : find());
  }

  function select(el){
    if(el.hasClass("active")){ return el;}

    if(sn.locking){ locked(); }
    el.addClass("active").trigger("sn:enter");
    sn.collection().parent().find(".active").not(el).
      removeClass("active").
      trigger("sn:exit");

    return el;
  }

  // Turn off the scroll event
  function locked(){
    sn.toggle(false)
    setTimeout(function(){ sn.toggle(true);}, 500);
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
  var timer, scrollTop;

  function scrollEnd(){
    return sn.set(sn.find());
  }

  sn.toggle = function(s){
    if(s){
      $(window).scrollTop(scrollTop);
      $(window).on("scroll",onScroll);
    } else {
      scrollTop = $(window).scrollTop();
      $(window).off("scroll");
    }
    return sn;
  }

  function onScroll(e){
    sn.find();
    if(sn.scrollEndDelay){
      clearTimeout(timer);
      timer = setTimeout(scrollEnd,sn.scrollEndDelay);
    } else {
      scrollEnd();
    }

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

