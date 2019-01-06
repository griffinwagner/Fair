var widthOfScreen = $(document).width()
if (widthOfScreen <=1200) {
  $('.whenSmallInfo').hide();
  $('.infoLabelClass').removeClass('labelInfo');
  $(".infoLabelClass").addClass('labelInfoForSmallScreens');
  $('#map').removeClass('mapWidth80');
  $('#map').addClass('widthForSmallScreens')
}

if (widthOfScreen <= 1200) {
  $(document).ready(function(){
    $('.glyphicon-chevron-right').hide()
    $('.expandedLabelInfo').hide()
    $('.glyphicon-chevron-left').append("<br> <br><p style= 'font-size: 2vw'>Click On Any Site To Interact</p>")
    $('#map').addClass('mapHeightiPad')
  })

  $('.clickHere').click(function(){
    $('.whenSmallInfo').hide()
    $('.glyphicon-chevron-right').show()
    $('.glyphicon-chevron-left').hide()
    $('.infoLabelClass').removeClass('labelInfo')
    $('.infoLabelClass').addClass('labelInfoExpandedForSmallScreens')
    $('#map').removeClass('mapWidth80')
    $('#map').addClass('mapShrunkForSmallScreens')
    $('.expandedLabelInfo').show()
  });

  $('.goBack').click(function(){
    $('.whenSmallInfo').hide();
    $('.infoLabelClass').removeClass('labelInfoExpandedForSmallScreens');
    $('.infoLabelClass').addClass('labelInfoAnimationForSmallScreens');
    $('.map').removeClass('mapShrunkForSmallScreens');
    $('.map').addClass('widthForSmallScreensAnimations');
    $('.glyphicon-chevron-right').hide();
    $('.glyphicon-chevron-left').show();
    $('.expandedLabelInfo').hide();
    $('.map').delay(3000).removeClassClass('widthForSmallScreensAnimations');
    $('.map').delay(3000).addClass('widthOfScreen');
    $('.infoLabelClass').delay(3000).addClass('labelInfoForSmallScreens');
    $('.infoLabelClass').delay(3000).removeClassClass('labelInfoAnimationForSmallScreens');


  });

} else {
  $(document).ready(function(){
    $('.glyphicon-chevron-right').hide()
    $('.expandedLabelInfo').hide()
    $('#map').addClass('mapHeightComputer')
  })

  $('.clickHere').click(function(){
    $('.whenSmallInfo').hide()
    $('.glyphicon-chevron-right').show()
    $('.glyphicon-chevron-left').hide()
    $('.infoLabelClass').removeClass('labelInfo')
    $('.infoLabelClass').addClass('labelInfoExpanded')
    $('#map').removeClass('mapWidth80')
    $('#map').addClass('mapShrunk')
    $('.expandedLabelInfo').show()

  });

  $('.goBack').click(function(){
    $('.whenSmallInfo').show();
    $('.infoLabelClass').removeClass('labelInfoExpanded');
    $('.infoLabelClass').addClass('labelInfoAnimation');
    $('.map').removeClass('mapShrunk');
    $('.map').addClass('mapWidth80Animation');
    $('.glyphicon-chevron-right').hide();
    $('.glyphicon-chevron-left').show();
    $('.expandedLabelInfo').hide();
    $('.map').delay(3000).removeClassClass('mapWidth80Animation');
    $('.map').delay(3000).addClass('mapWidth80');
    $('.infoLabelClass').delay(3000).addClass('labelInfo');
    $('.infoLabelClass').delay(3000).removeClassClass('labelInfoAnimation');
  });
}



$('.glyphicon-dashboard').click(function(){
  window.location.replace("/overlays");

})

$('.glyphicon-search').click(function () {
  window.location.replace("/metaSearch");
})

$('.glyphicon-circle-arrow-down').click(function () {
  window.location.replace("/download");

})



//
