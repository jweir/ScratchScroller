(function(){

  // IMPORTANT
  // when elements are added, removed or dimensions change
  // an 'sn:refresh' event must be trigger
  // $('body').trigger('sn:refresh') will work

  var main = "#content", // the parent id of the element holding the posts
      item = ".post"; // the selector for individual blocks

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

  // Stop videos (Vimeo only)
  // ensure http://a.vimeocdn.com/js/froogaloop2.min.js
  function exit(){
    var video = $(this).find("iframe")[0];
    if(video){ $f(video).api("pause"); }
  }

  // TODO add the correct text selection logic
  function enter(){
    $("#legend").hide().html($(this).find("p").html()).fadeIn();
  }

  // Turn off the scroll event
  function locked(){
    sn.toggle(false)
    setTimeout(function(){ sn.toggle(true);}, 500);
  }

  var mouseIn = true;
  $("body").on("mouseleave", function(){ mouseIn = false})
  $("body").on("mouseenter", function(){ mouseIn = false})

  function init(){
    $(main+" "+item).scrollLock({
      easing: "easeOutQuad",
      scrollDuration : 700,
      scrollEndDelay : false
    });

    $(main).on("sn:exit", item, exit);
    $(main).on("sn:enter", item, enter);
    $(main).on("sn:enter", item, locked);

    bindMouseWheel();
  }

  $(init);
}());
