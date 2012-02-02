(function(){

  function load(){
    var url = "inspiration.html #content .post";
    $("#pane").load(url, function(){
      sn.init("#pane .post");
      sn.initEvents();
    });
  }

  $(load);
})();
