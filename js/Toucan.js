var Toucan = {

  mediaElement: null,
  timeoutCounter: 0,
  IDLE_PAUSE_TIMEOUT: 1000 * 60 * 30, // 30 minutes for timeout PAUSED -> STOP
  INFO_TIMEOUT: 1000 * 5, // 5 seconds meta-info about timeout
  IDLE_STOP_TIMEOUT: 1000 * 60 * 5, // 5 minutes for timeout DEFAULT-SCREEN -> STOP

  init: function(mediaElement) {

    Toucan.mediaElement = mediaElement;

    Toucan.startInitAnimations();
    Toucan.initReceiver();
  },

  startInitAnimations: function() {

  	$('#logo').addClass('animated pulse infinite');

    setTimeout(function() 
    {
        $('#loading-small').hide('fast');
        $('#message').fadeIn();
    }, 2000);
  },

  initReceiver: function() {

    console.debug(" ++++ Toucan.js: initReceiver()");

    clearTimeout(Toucan.idlePauseTimeoutFunction);
    Toucan.idlePauseTimeoutFunction = setTimeout(function() {
      console.debug(" ++++ Toucan.js: enterPauseState() - 5 minutes pause-timeout started...");
      window.customReceiver.shutdownReceiver();
    }.bind(Toucan), Toucan.IDLE_STOP_TIMEOUT);
  },

  enterDefaultState: function() {     

    console.debug(" ++++ Toucan.js: enterDefaultState()");

    Toucan.initReceiver();

    $('#buffer').hide();
    $('#message, #logo').show();
    
    $('#receiverVideoElement').hide();
    $('.toucan-video-player').hide(); 
    $('body').addClass('default');  
    $('#pause, #play').fadeOut('fast');
  },

  skinPlayer: function() {

      console.debug(" ++++ Toucan.js: skinPlayer()");

      $('#receiverVideoElement').unbind();
      $('#receiverVideoElement').unwrap();
      $('.toucan-video-controls').remove();

      $('#receiverVideoElement').gVideo({'title': title,'subtitle': subtitle, 'image': imageURL});
  },

  enterPauseState: function() {

    console.debug(" ++++ Toucan.js: enterPauseState()");

    //if(seek == false) {
      $('.toucan-video-controls').css('visibility', 'visible');
      $('.toucan-video-controls, #pause, #pause-logo').fadeIn();  
      $('#play').fadeOut('fast');
    //}
    setTimeout(function() {
        $('.toucan-video-controls').fadeOut();  
        $('#pause-logo').fadeOut();
    }, 5000);

    clearTimeout(Toucan.idleStopTimeoutFunction);

    Toucan.idleStopTimeoutFunction = setTimeout(function() {
      console.debug(" ++++ Toucan.js: enterPauseState() - 30 minutes pause-timeout started...");
      window.customReceiver.shutdownReceiver();
    }.bind(Toucan), Toucan.IDLE_PAUSE_TIMEOUT);
  },

  enterLoadingState: function() {

    console.debug(" ++++ Toucan.js: enterLoadingState()");

    $('#pause, #message, #logo, #intro-logo, #buffer, #play').hide();

    $('#loading-small').show('fast');
    $('#media-loading').show();
    $('body').addClass('default');
    
    //TODO: Make image show-up smoother
    $('.movie-cover-big').html('<img src="' + imageURL + '" style="visibility:hidden" onload="this.style.visibility=\'visible\'" width="200" height="300" />');
    $('.toucan-subtitle-big').text(subtitle);
    $('.toucan-title-big').text(title);

    loadingState = true;
  },

  enterPlayerReadyState: function() {

    console.debug(" ++++ Toucan.js: enterPlayerReadyState()");

    //TODO: neccessary?
    if(drmCheck == true) {
        player.resume();
    }

    $('body').css('background', 'black');

    $('#media-loading, #loading-small, #pause, #message').hide();
    $('#buffer').fadeOut('fast');

    $('#receiverVideoElement, .toucan-video-player').show();

    seek = false;
    loadingState = false;
    playerReadyState = true;
  },

  enterPlayState: function() {

    console.debug(" ++++ Toucan.js: enterPlayState()");

    clearTimeout(Toucan.idlePauseTimeoutFunction);
    clearTimeout(Toucan.idleStopTimeoutFunction);

    if(seek == false) {
      $('#play').fadeIn('fast');
    } 

    $('#buffer, #message').hide();
    $('#pause, #pause-logo').fadeOut('fast');
      
    setTimeout(function() {
        $('#play').fadeOut('fast');
    }, 1000);


    setTimeout(function() {
        $('.toucan-video-controls').fadeOut();
    }, 7000);
  },

  addEventListeners: function() {

    Toucan.mediaElement.addEventListener('loadstart', function(e){
        console.log("######### MEDIA ELEMENT LOAD START");

        Toucan.enterLoadingState(title, subtitle, imageURL);

        Toucan.skinPlayer(title, subtitle, imageURL);
    });
    Toucan.mediaElement.addEventListener('loadeddata', function(e){
      console.log("######### MEDIA ELEMENT DATA LOADED");  
    });
    Toucan.mediaElement.addEventListener('canplay', function(e){
        console.log("######### MEDIA ELEMENT CAN PLAY");
        
        $('#buffer').hide();

        Toucan.enterPlayerReadyState();

        setTimeout(function() {
          $('#receiverVideoElement')[0].play();
        }, 4000);
        $('.toucan-video-controls').show();
    });
    Toucan.mediaElement.addEventListener('ended', function(e){
        console.log("######### MEDIA ELEMENT ENDED");

        $('#pause').hide();
    });
    Toucan.mediaElement.addEventListener('playing', function(e){
        console.log("######### MEDIA ELEMENT PLAYING");

        Toucan.enterPlayState();
    });
    Toucan.mediaElement.addEventListener('waiting', function(e){
        console.log("######### MEDIA ELEMENT WAITING");
    });
    Toucan.mediaElement.addEventListener('stalled', function(e){
        console.log("######### MEDIA ELEMENT STALLED");
    });
    Toucan.mediaElement.addEventListener('error', function(e){
        console.log("######### MEDIA ELEMENT ERROR ");
        console.log(e);
    });
    Toucan.mediaElement.addEventListener('abort', function(e){
        console.log("######### MEDIA ELEMENT ABORT ");
        console.log(e);
    });
    Toucan.mediaElement.addEventListener('suspend', function(e){
        console.log("######### MEDIA ELEMENT SUSPEND ");
        console.log(e);
    });
    Toucan.mediaElement.addEventListener('progress', function(e){
        console.log("######### MEDIA ELEMENT PROGRESS ");
        console.log(e);
    });
    Toucan.mediaElement.addEventListener('seeking', function(e){
        console.log("######### MEDIA ELEMENT SEEKING ");
        console.log(e);
    });
    Toucan.mediaElement.addEventListener('seeked', function(e){
        console.log("######### MEDIA ELEMENT SEEKED ");
        console.log(e);
    });
  }
};