(function($){
  // http://jqueryui.com/demos/effect/easing.html

  $.fn.scrollTo = function(options){
    var top = this.offset().top,
        h   = this.outerHeight(true),
        wh  = $(window).height(),
        ct  = top - (wh/2) + (h/2);    // calculated top

        console.log(this, ct);
    options        = options        || {};
    options.easing = options.easing || "easeInQuint";
    options.time   = options.time   || 800;

    $("body").animate(
      {scrollTop:ct},
      {queue: true, duration: options.time, easing: options.easing});

    return this;
  };

}(jQuery));

(function(){ //ScrollLock

  var timer,
      options,
      selector;

  function init($selector, $options){
    options    = $options;
    selector   = $selector;
    $(window).resize(deferResize);
    return set($(collection()[0]));
  }

  function refresh(){
    return find().scrollTo(options);
  }

  function next(){
    return set(find().next());
  }

  function prev(){
    return set(find().prev());
  }

  function collection(){
    return $(selector);
  }

  function set(o){
    if(o[0]){
      return o.scrollTo(options);
    } else {
      return find();
    }
  }

  function inCenter(el){
    var elTop = $(el).position().top,
        elH   = $(el).outerHeight(true),
        top   = $(window).scrollTop();
        cen   = top + $(window).height()/2;
        console.log(top, cen);

    return elTop <= cen && (elTop + elH) > cen;
  }

  function find(){
    var fn = function(el){ return inCenter(el);};

    return $(_.find(collection(), fn) || collection()[0]);
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
    events = [];
  }

  function captureWheel(event,delta,deltaX, deltaY){
    clearTimeout(timer);
    timer = setTimeout(endCapture,50);

    events.push(deltaY);
    event.preventDefault();
    return false;
  }

  $('html').mousewheel(captureWheel);
  // $(document).on("scroll",function(){
    // $("body").css("background","#EEE");
    // clearTimeout(t)
    // t = setTimeout(function(){ $("body").css("background","#FFF"); },50)
    // return true;
  // })

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

$(function(){ sn.init("section", {});});
