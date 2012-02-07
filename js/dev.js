(function(){

  // IMPORTANT
  // when elements are added, removed or dimensions change
  // an 'sn:refresh' event must be trigger
  // $('body').trigger('sn:refresh') will work

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

  function init(){
    // Define the events before initializing the plugin
    $("body").on("sn:exit", ".post", exit);
    $("body").on("sn:enter",".post", enter);

    $(".post").scrollLock({
      easing         : "easeOutQuad",
      scrollDuration : 700,
      scrollEndDelay : false,
      mousewheel     : true,
      locking        : true
    });
  }

  $(init);

}());
