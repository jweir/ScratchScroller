(function($){
  // http://jqueryui.com/demos/effect/easing.html

  $.fn.scrollTo = function(options){
    var top = this.offset().top,
        h   = this.outerHeight(),
        wh  = $(window).height(),
        ct  = top - options.offset;    // calculated top

    options        = options        || {};
    options.easing = options.easing || "easeInQuint";
    options.time   = options.time   || 800;

    $("body").animate(
      {scrollTop:ct},
      {queue: true, duration: options.time, easing: options.easing});

    return this;
  }

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
      o.scrollTo(options)
    } else {
      return find();
    }
  }

  function inView(el,top){
    var elTop = $(el).position().top,
        elH   = $(el).outerHeight();

    return elTop <= top && (elTop + elH) > top;
  }

  function find(){
    var t  = $(window).scrollTop() + options.offset,
        fn = function(el){ return inView(el, t)};

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
    find       : find
  }

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

  function capture(event,delta,deltaX, deltaY){
    clearTimeout(timer)
    timer = setTimeout(endCapture,100)

    events.push(deltaY);
    event.preventDefault();
    return false;
  }

  $('html').mousewheel(capture);

}(jQuery));

$(function(){ sn.init("section", {offset: 50})});
