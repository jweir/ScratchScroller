(function($){
  // http://jqueryui.com/demos/effect/easing.html
  $.fn.scrollTo = function(options){
    var top = this.offset().top,
        h   = this.outerHeight(),
        wh  = $(window).height(),
        ct  = top-(wh/2)+(h/2);    // calculated top

    options        = options        || {};
    options.easing = options.easing || "easeOutQuart";
    options.time   = options.time   || 800;

    $("body").animate({scrollTop:ct},
                      {queue: true, duration: options.time, easing: options.easing});
    return this;
  }

}(jQuery));

(function(){

  var collection = null,
      focused = null;

  function init(selector){
    collection = $(selector);
    focused    = $(collection[0]);
    focused.scrollTo();
    return collection;
  }

  function refresh(){
    return focused.scrollTo();
  }

  function next(){
    return set(focused.next());
  }

  function prev(){
    return set(focused.prev());
  }

  function set(o){
    if(o.length){
      focused = o;
      return refresh()
    } else {
      return focused;
    }
  }

  window.sn         = {};
  window.sn.get     = function(){ return focused};
  window.sn.init    = init;
  window.sn.refresh = refresh;
  window.sn.next    = next;
  window.sn.prev    = prev;

}());


(function($){

  var capture = [],
      captureTimer;

  function endCapture(){
    var sum = 0;
    for(var n = 0; n < capture.length; n++){
      sum += capture[n];
    }

    console.log(sum)
    var x = sum < 0 ? sn.next() : sn.prev();
    capture = [];
  }

  function scroll(event,delta,deltaX, deltaY){
    if(captureTimer){clearTimeout(captureTimer)}
    captureTimer = setTimeout(endCapture,100)

    capture.push(deltaY);
    // event.preventDefault();
    // return false;
  }

  function swipe(event){
  }

  $(function(){
    $('html').mousewheel(scroll);
    $('body').bind("touchmove", scroll);
  })

}(jQuery));

$(function(){ sn.init("section")});
$(function(){

  console.log("ok!")
})
