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
    // Set the post title
    $("#aux-inner").find('div#aux-title').hide().html($(this).find("div.aux-title").html()).fadeIn();
    // Set the description
    $("#aux-inner").find('p#aux-desc').hide().html($(this).find("p").not('.raw-text').html()).fadeIn();

    // Set share link
    var permalink = $(this).find("div.aux-permalink").html();
    $("#aux-inner").find('div#aux-share a').hide().attr('href',permalink).fadeIn();
  }

  function init(){
    // Define the events before initializing the plugin
    $("body").on("sn:exit", ".post", exit);
    $("body").on("sn:enter",".post", enter);

    $(".post").on("click", function(e){sn.set(sn.select($(this))); return true;})

    $(".post").scrollLock({
      easing         : "easeOutQuint",
      scrollDuration : 800,
      scrollEndDelay : false,
      mousewheel     : true,
      locking        : true
    });
  }

  $(init);

}());
