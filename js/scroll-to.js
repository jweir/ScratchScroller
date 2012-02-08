// scroll-n (sn)
// copyright 2012 John Weir & Fame Driver LLC
// requires jquery & underscore
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(){
  // TODO make options and collections local vars
  // TODO allow multiple scroll lock elements on a page at once

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
    return scrollT(this,top);
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

  function scrollT(el, top){
    if(veryNear(top)){ return el; }

    $(el).parent().stop().animate(
      { top : -1 * top},
      { easing    : sn.easing,
        duration  : sn.scrollDuration,
        complete  : function(){el.trigger("sn:locked");}
      });

    return el;
  }

  var anchors = [], pillar;

  // FIXME multiple instances are created
  function Pillar(el){
    var anchor = el;
    anchors.push(el);
    pillar = pillar || $("<div>&nbsp;</div>");
    pillar.css({
      height   : el.outerHeight(true),
      position : 'absolute',
      zIndex   : 1,
      top      : '0px',
      width    : '20px',
      background : "#0F0"
      // visibility: 'none'
    });

    el.css({
      position : "fixed",
      left     : el.offset().left,
      top      : el.offset().top
    });

    el.parent().append(pillar);
  }

  function tallestAnchor(){
    var hh = _.invoke(anchors,"height");
    return _.max(hh);
  }

  Pillar.prototype.refresh = function(){
    pillar.css({
      height   : tallestAnchor()
    });
  };

  $.fn.scrollLock = function(options){
    _.extend(sn, options || {});
    return new ScrollLock(this.selector, options);
  };

  function ScrollLock($selector, options){
    this.options = options;
    this.selector = $selector;
    this.pillar = new Pillar(this.collection().parent());
    this.initEvents();
    if(options.mousewheel){ bindMouseWheel(this);}
    $(window).resize(_.bind(this.deferResize, this));
    $(window).bind("sn:refresh", _.bind(this.refresh, this));
    return this.set(this.find());
  }

  function bindMouseWheel(sl){
    $('body').bind('mousewheel', function(event, delta) {
      if(Math.abs(delta) % 1 > 0){ // Probably a trackpad
        return true;
      }
      // disable, then renable the mousehweel in 1/2 a second
      $('body').off('mousewheel');
      setTimeout(_.bind(bindMouseWheel,sl), 500);

      var x = ( delta < 0  ) ? sl.next() : sl.prev();
      event.preventDefault();
      return false;
    });
  }


  ScrollLock.prototype = {
    initEvents : function(){
      $(window).on("scroll", _.bind(this.onScroll, this));
      $(document).on("keyup", _.bind(onKey, this));
    },

    toggle : function(s){
      if(s){
        $(window).scrollTop(scrollTop);
        $(window).on("scroll",onScroll);
      } else {
        scrollTop = $(window).scrollTop();
        $(window).off("scroll");
      }
      return sn;
    },

    scrollEnd: function(){
      return this.set(this.find());
    },

    dir :function(el, n){
      if(el){
        var t = $(window).scrollTop();
        $(window).scrollTop(t + (n * el.height()));
        return el;
      } else {
        return find();
      }
    },

    next: function(){
      return this.dir(this.find().next(), 1);
    },

    prev: function(){
      return this.dir(this.find().prev(), -1);
    },

    onScroll: function(e){
      this.find();
      if(this.options.scrollEndDelay){
        clearTimeout(this.timer);
        this.timer = setTimeout(scrollEnd,this.options.scrollEndDelay);
      } else {
        this.scrollEnd();
      }

      return true;
    },

    refresh: function(){
      this.pillar.refresh();
      return this.set(this.find());
    },

    set: function(o){
      return scroll(o[0] ? o : this.find());
    },

    deferResize: function(){
      clearTimeout(this.timer);
      this.timer = setTimeout(_.bind(this.refresh,this), 25);
    },

    // Turn off the scroll event
    locked: function(){
      this.toggle(false);
      setTimeout(function(){ this.toggle(true);}, 500);
    },

    select: function(el){
      if(el.hasClass("active")){ return el;}

      if(this.locking){ locked(); }
      el.addClass("active").trigger("sn:enter");
      this.collection().parent().find(".active").not(el).
        removeClass("active").
        trigger("sn:exit");

      return el;
    },

    collection : function(){
      return $(this.selector);
    },

    find: function(){
      return this.select($(_.find(this.collection(), inCenter) || this.headsOrTails()));
    },

    headsOrTails: function(){
      var top   = $(window).scrollTop(),
      col   = this.collection().toArray(),
      head  = $(col.shift()),
      tail  = $(col.pop());

      if(top < head.position().top){ return head; }
      if(top > tail.position().top){ return tail; }
      throw "Could not find element";
    }
  };

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


  // TODO trigger events here
  function onKey(e){
    switch(e.keyCode){
      case 38: sn.prev(); break; // up arrow
      case 40: sn.next(); break; // down arrow
      default: break;
    }
    return true;
  }


}());

