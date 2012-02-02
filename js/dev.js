(function(){

  var main = "#pane", // the parent id of the element holding the posts
      item = ".post"; // the selector for individual blocks

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
    $(main+" "+item).scrollLock({
      easing: "easeInOutQuint",
      scrollDuration : 700,
      scrollEndDelay : 100
    });

    $(main).on("sn:exit", item, exit);
    $(main).on("sn:enter", item, enter);
    // $(main).on("sn:locked", item, locked);
  }

  // Just used for development
  function load(){
    var url = "inspiration.html #content .post";
    $(main).load(url, init);
  }

  $(load);
})();
