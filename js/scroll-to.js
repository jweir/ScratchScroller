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

    $("body").stop().animate(
      { scrollTop:ct},
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
    console.log("refresh")
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
    console.log(o);
    collection().removeClass("active");
    if(o[0]){
      return o.scrollTo().addClass("active");
    } else {
      return find().addClass("active");
    }
  }

  function inCenter(el){
    var elTop = $(el).position().top,
        elH   = $(el).outerHeight(),
        top   = $(window).scrollTop();
        cen   = top + $(window).height()/2;

    return elTop <= cen && (elTop + elH) > cen;
  }

  function find(){
    return $(_.find(collection(), inCenter) || collection()[0]);
  }

  // FIXME being called after a scroll
  function deferResize(){
    return true;
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
    refresh    : refresh
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

  $('body').mousedown(function(){alert('d'); $("body").css("background","#FF0")});
  $('html').mousewheel(captureWheel);

  var t;
  $(document).on("scroll",function(e){
    if($("body").hasClass("-scrolling")){
      return true;
    } else {
      return true;// FIXME
      clearTimeout(t);
      t = setTimeout(sn.refresh,500);
      return true;
    }
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
