(function($){
  // http://jqueryui.com/demos/effect/easing.html

  $.fn.scrollTo = function(options){
    var top = this.offset().top,
        h   = this.outerHeight(),
        wh  = $(window).height(),
        ct  = top - (wh/2) + (h/2);    // calculated top

    options        = options        || {};
    options.easing = options.easing || "easeInQuint";
    options.time   = options.time   || 800;

    if(Math.floor(ct) == $("body").scrollTop()){ return this; }

    $("#pane").stop().animate(
      { top:ct},
      { queue: false,
        duration: options.time,
        easing: options.easing,
        complete: function(){ $("body").removeClass("-scrolling");}
      }).addClass("-scrolling");

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

  function next(){
    console.log("next")
    return set(find().next());
  }

  function prev(){
    console.log("prev")
    return set(find().prev());
  }

  function collection(){
    return $(selector);
  }

  function set(o){
    if(o[0]){
      return o;
    } else {
      return find();
    }
  }

  function offBy(el){
    var elTop = $(el).offset().top,
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

  function find(){
    return select($(_.find(collection(), inCenter) || collection()[0]));
  }

  function select(el){
    el.addClass("active");
    sn.collection().parent().find(".active").not(el).removeClass("active");
    return el;
  }

  // FIXME being called after a scroll
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
