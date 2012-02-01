(function($){
  // http://jqueryui.com/demos/effect/easing.html

  var timer;

  function scroll(el, top){
    // TODO do not animate if the element is already in place
    // if(Math.floor(top) == el.css(top);

    // TODO detect if CSS transitions are supported, if not
    // animate via jquery
    el.stop().animate({
      top      : top,
      easing   : "easeInQuint",
      duration : 500
    });

    // el.css({top: top})

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

  $(document).on("scroll",function(e){
    sn.set(sn.find());
    return true;
  })

}(jQuery));

$(function(){ sn.init("section");});
