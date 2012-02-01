(function($){
  // http://jqueryui.com/demos/effect/easing.html

  var timer;

  function scroll(el, top){
    // TODO do not animate if the element is already in place
    // if(Math.floor(top) == el.css(top);

    // TODO detect if CSS transitions are supported, if not
    // animate via jquery
    // el.stop().animate({
      // top      : top,
      // easing   : "easeInQuint",
      // duration : 500
    // });

    el.css({top: top})

    return el;
  }

  $.fn.scrollTo = function(top, options){
    var self = this;
    clearTimeout(timer);
    timer = setTimeout(function(){scroll(self,top)}, 10);

    return this;
  };

}(jQuery));

(function(){ //ScrollLock

  var timer,
      selector;

  function init($selector){
    selector   = $selector;
    $(window).resize(deferResize);
    return set($(collection()[0]));
  }

  function refresh(){
    return set(find());
  }

  // TODO next & prev should just scroll to those elements
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
    el.addClass("active");
    sn.collection().parent().find(".active").not(el).removeClass("active");
    return el;
  }

  function scroll(el){
    el.parent().scrollTo(offBy(el))
    return el;
  }

  function offBy(el){
    var elTop = $(el).offset().top - $(el).parent().offset().top,
        elH   = $(el).outerHeight(),
        top   = $(window).scrollTop();
        cen   = top + $(window).height()/2;

    return cen - elTop - (elH/2);
  }

  function inCenter(el){
    var elTop = $(el).offset().top,
        elH   = $(el).outerHeight(),
        top   = $(window).scrollTop();
        cen   = top + $(window).height()/2;

    return elTop <= cen && (elTop + elH) > cen;
  }

  // FIXME find nearest not collection[0]
  function find(){
    return select($(_.find(collection(), inCenter) || collection()[0]));
  }

  function deferResize(){
    clearTimeout(timer);
    timer = setTimeout(refresh, 25);
  }

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

(function($){ // MouseWheel events

  var events = [],
      timer;

  function endCapture(){
    var sum = 0;
    for(var n = 0; n < events.length; n++){
      sum += events[n];
    }

    var x = sum < 0 ? sn.next() : sn.prev();
  }

  var doCapture = true;
  var doTimer;

  function captureWheel(event,delta,deltaX, deltaY){
    if(doCapture){
      events.push(deltaY);
      event.preventDefault();
      clearTimeout(doTimer);
      doTimer = setTimeout(endCapture, 100);
    }
    if(events.length > 3){
      doCapture = false;
      clearTimeout(timer);
      timer = setTimeout(function(){
        events = [];
        doCapture = true;
      },70);
    }
    return false;
  }

  // $('html').mousewheel(captureWheel);

  var t;
  $(document).on("scroll",function(e){
    sn.set(sn.find());
    return true;
    // if($("body").hasClass("-scrolling")){
      // return true;
    // } else {
      // return true;// FIXME
      // clearTimeout(t);
      // t = setTimeout(sn.refresh,500);
      // return true;
    // }
  })

  // document.addEventListener("touchstart", function(e){
    // tt = [];
    // push(e)
    // return true;
    // e.preventDefault();
    // return false;
  // });
  // document.addEventListener("touchmove", function(e){
    // push(e)
    // return true;
    // e.preventDefault();
    // return false;
  // });
  // document.addEventListener("touchend", function(e){
    // calc(tt)
    // _.defer(function(){
    // sn.set(sn.find());
    // })
    // e.preventDefault();
    // return false;
  // });
  // document.addEventListener("touchcancel", function(e){
    // e.preventDefault()
    // $("body").css("background","#FF0");
    // return true;
  // });


}(jQuery));

$(function(){ sn.init("section");});
