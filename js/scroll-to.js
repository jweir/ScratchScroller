(function($){
  // http://jqueryui.com/demos/effect/easing.html

  var timer;

  var v = 0;

  function compensate(){
    // Compensate for the scoll getting out of alignment
    var x = parseInt($(this).css("top"),10),
    y = $(window).scrollTop()
    self = this;

    $("#console").text(v++);
    sn.halt(function(){
      $(self).css({top:0});
      $(window).scrollTop(y -x);
    })
  }

  function scroll(el, top){
    // TODO do not animate if the element is already in place
    // if(Math.floor(top) == parseInt(el.css(top),10)){
    // alert("k");
    // return true;
    // }

    el.stop().animate({
      top      : top},
      {
        easing   : "easeOutExpo",
        duration : 500,
        complete : compensate
      });

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
    return set(select($(collection()[0])));
  }

  function refresh(){
    console.log("refresh");
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
    console.log("set");
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

    return parseInt(cen - elTop - (elH/2), 10);
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

  function halt(fn){
    $("body").addClass("halt");
    sn.toggle(false);
    fn();
    setTimeout(function(){sn.toggle(true); $("body").removeClass("halt");},1000);

  }

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

(function($){ // MouseWheel events

  var timer,
      enabled = true;

  window.sn.toggle = function(state){
    enabled = state;
    return enabled;
  }

  $(document).on("scroll",function(e){
    if(enabled){
      sn.find();
      clearTimeout(timer);
      timer = setTimeout(function(){
        console.log("scroll call");
        sn.set(sn.find()) }, 200);
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  })

}(jQuery));

$(function(){ sn.init("section");});
