    function CustomReceiver() {
        
        this.maxInactivity = 10; // 10 seconds
        this.onLoadOrig = null;
        this.onMetadataLoadedOrig = null;
        this.onPauseOrig = null;
        this.onPlayOrig = null;
        this.onStopOrig = null;
        this.onSeekOrig = null;
        this.onReadyOrig = null;
        this.onGetStatusOrig = null;
        this.onEndedOrig = null;
        this.onErrorOrig = null;
        this.onGetStatusOrig = null;
        this.onLoadMetadataErrorOrig = null;
        this.onMessageOrig = null;

        this.messageBus = null;
        this.autoplay = false;

        //Load application

        this.mediaElement = document.getElementById('receiverVideoElement');
        this.mediaElement.autoplay = this.autoplay;
        
        Toucan.init(this.mediaElement);

        console.log('### Application Loaded. Starting system.');

        if(DEBUG) {
            cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
        }   

        this.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        this.messageBus = this.castReceiverManager.getCastMessageBus('urn:x-cast:com.google.devrel.custom');

        this.initMediaManagement();
        this.initSessionManagement();
        this.injectMediaEvents();
        this.startReceiver();
    }

    CustomReceiver.prototype.initMediaManagement = function() {

        this.mediaManager = new cast.receiver.MediaManager(this.mediaElement);

        Toucan.addEventListeners();
    }

    CustomReceiver.prototype.initSessionManagement = function() {
        console.debug("CustomReceiver.js: initSessionManagement()");
        this.castReceiverManager.onSenderDisconnected = function(event) {
            if(this.castReceiverManager.getSenders().length == 0 && event.reason == 
                cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
                window.close();
            }
        }.bind(this)
    }

    CustomReceiver.prototype.injectMediaEvents = function() {

        this.mediaManager['onLoadOrig']         =   this.mediaManager.onLoad;
        this.mediaManager['onMetadataLoadedOrig']       =   this.mediaManager.onMetadataLoaded;
        this.mediaManager['onLoadMetadataErrorOrig']    =   this.mediaManager.onLoadMetadataError;
        this.mediaManager['onPauseOrig']        =   this.mediaManager.onPause;
        this.mediaManager['onPlayOrig']         =   this.mediaManager.onPlay;
        this.mediaManager['onStopOrig']         =   this.mediaManager.onStop;
        this.mediaManager['onSeekOrig']         =   this.mediaManager.onSeek;
        this.mediaManager['onReadyOrig']        =   this.mediaManager.onReady
        this.mediaManager['onGetStatusOrig']    =   this.mediaManager.onGetStatus;
        this.mediaManager['onEndedOrig']        =   this.mediaManager.onEnded;
        this.mediaManager['onErrorOrig']        =   this.mediaManager.onError;
        this.mediaManager['onGetStatusOrig']    =   this.mediaManager.onGetStatus;

        this.messageBus['onMessageOrig']    =   this.messageBus.onMessage;

        //this.mediaManager.customizedStatusCallback = this.mediaCustomizedStatusCallbackEvent_.bind(this);
        this.mediaManager.onLoad            =   this.mediaOnLoadEvent.bind(this);
        this.mediaManager.onMetadataLoaded  =   this.mediaOnMetadataLoadedEvent.bind(this);
        this.mediaManager.onLoadMetadataError   = this.mediaOnLoadMetadataErrorEvent.bind(this);
        this.mediaManager.onPause           =   this.mediaOnPauseEvent.bind(this);
        this.mediaManager.onPlay            =   this.mediaOnPlayEvent.bind(this);
        this.mediaManager.onStop            =   this.mediaOnStopEvent.bind(this);
        this.mediaManager.onSeek            =   this.mediaOnSeekEvent.bind(this);
        this.mediaManager.onReady               =   this.mediaOnReadyEvent.bind(this);
        this.mediaManager.onGetStatus           =   this.mediaOnGetStatusEvent.bind(this);
        this.mediaManager.onSenderConnected     =   this.mediaOnSenderConnectedEvent.bind(this);
        //this.mediaManager.onSenderDisconnected  =   this.mediaOnSenderDisconnectedEvent.bind(this);
        this.mediaManager.onVisibilityChanged   =   this.mediaOnVisibilityChangedEvent.bind(this);
        this.mediaManager.onEnded               =   this.mediaOnEndedEvent.bind(this);
        this.mediaManager.onError               =   this.mediaOnErrorEvent.bind(this);  

        this.messageBus.onMessage = this.mediaOnMessageEvent.bind(this);
    }

    CustomReceiver.prototype.startReceiver = function() {

        console.debug("CustomReceiver.js: startReceiver()");

        var appConfig = new cast.receiver.CastReceiverManager.Config();
        appConfig.statusText = 'Toucan';
        appConfig.maxInactivity = this.maxInactivity;
        this.castReceiverManager.start(appConfig);
    }

    CustomReceiver.prototype.shutdownReceiver = function() {
        this.castReceiverManager.stop();
    }

/* ############## Event Processing ############### */

    CustomReceiver.prototype.mediaOnLoadEvent = function(event) {

        var initialTimeIndexSeconds, 
            assetID,
            userId,
            sessionId,
            url,
            protocol = null,
            parser,
            ext,
            video,
            mediaHost;

        console.log("### Media Manager - LOAD: " + JSON.stringify(event));

        if(this.mediaPlayer !== null && this.mediaPlayer !== undefined) {
            this.mediaPlayer.unload();
        }

        if (event.data['media'] && event.data['media']['contentId']) {
            url = event.data['media']['contentId'];
            dimensionValue = url;
            imageURL = event.data['media']['customData']['coverURL'];
            title = event.data['media']['customData']['name'];
            subtitle = event.data['media']['customData']['subTitle'];

            if(subtitle == undefined) {
                subtitle = '';
            }
            
            mediaHost = new cast.player.api.Host({
                'mediaElement': this.mediaElement,
                'url': url
            });

            mediaHost.onError = function (errorCode) {

                console.error('### HOST ERROR - Fatal Error: code = ' + errorCode);
                if (this.mediaPlayer !== null) {
                    this.mediaPlayer.unload();
                }
            }

            initialTimeIndexSeconds = event.data['media']['currentTime'] || 0;
            parser = document.createElement('a');
            parser.href = url;

            ext = parser.pathname.split('.').pop();
            if (ext === 'm3u8') {
                protocol =  cast.player.api.CreateHlsStreamingProtocol(mediaHost);
            } else if (ext === 'mpd') {
                protocol = cast.player.api.CreateDashStreamingProtocol(mediaHost);
            } else if (ext === 'ism/') {
                protocol = cast.player.api.CreateSmoothStreamingProtocol(mediaHost);
            }

            console.log('### Media Protocol Identified as ' + ext);

            if (protocol === null) {
                this.mediaManager['onLoadOrig'](event); 
            } else {
                this.mediaPlayer = new cast.player.api.Player(mediaHost);
                this.mediaPlayer.load(protocol, initialTimeIndexSeconds);
            }
        } 
    }

    CustomReceiver.prototype.mediaOnReadyEvent = function(event) {

        console.log("### Cast Receiver Manager is READY: " + JSON.stringify(event));
    }

    CustomReceiver.prototype.mediaOnSenderConnectedEvent = function(event) {

        console.log("### Cast Receiver Manager - Sender Connected : " + JSON.stringify(event));

        var senders = this.castReceiverManager.getSenders();
    }

    CustomReceiver.prototype.mediaOnVisibilityChangedEvent = function(event) {

        console.log("### Cast Receiver Manager - Visibility Changed : " + JSON.stringify(event));

        if (event.data) { 
            this.mediaElement.play(); 
            window.clearTimeout(window.timeout); 
            window.timeout = null;
        } else {
            this.mediaElement.pause(); 
            window.timeout = window.setTimeout(function(){window.close();}, MEDIA_TIMEOUT);
        }
    }

    CustomReceiver.prototype.mediaOnMessageEvent = function(event) {

        console.log("### Message Bus - Media Message: " + JSON.stringify(event));

        console.log("### CUSTOM MESSAGE: " + JSON.stringify(event));
        
        console.log(event['data']);
    }
   
    CustomReceiver.prototype.mediaOnEndedEvent = function() {

        console.log("### Media Manager - ENDED");

        Toucan.enterDefaultState();

        this.mediaManager['onEndedOrig']();
    }
    
    CustomReceiver.prototype.mediaOnErrorEvent = function(obj) {

        console.log("### Media Manager - error: " + JSON.stringify(obj));

        this.mediaManager['onErrorOrig'](obj);
    }
    
    CustomReceiver.prototype.mediaOnGetStatusEvent = function(event) {

        console.log("### Media Manager - GET STATUS: " + JSON.stringify(event));

        this.mediaManager['onGetStatusOrig'](event);
    }
  
    CustomReceiver.prototype.mediaOnLoadMetadataErrorEvent = function(event) {

        console.log("### Media Manager - LOAD METADATA ERROR: " + JSON.stringify(event));

        this.mediaManager['onLoadMetadataErrorOrig'](event);
    }
    
    CustomReceiver.prototype.mediaOnMetadataLoadedEvent = function(event) {

        console.log("### Media Manager - LOADED METADATA: " + JSON.stringify(event));

        this.mediaManager['onMetadataLoadedOrig'](event);
    }
    
    CustomReceiver.prototype.mediaOnPauseEvent = function(event) {

        console.log("### Media Manager - PAUSE: " + JSON.stringify(event));
        
        paused = true;

        Toucan.enterPauseState();

        this.mediaManager['onPauseOrig'](event);
    }
   
    CustomReceiver.prototype.mediaOnPlayEvent = function(event) {

        console.log("### Media Manager - PLAY: " + JSON.stringify(event));

        paused = false;

        Toucan.enterPlayState();

        this.mediaManager['onPlayOrig'](event);
    }
    
    CustomReceiver.prototype.mediaOnSeekEvent = function(event) {

        console.log("### Media Manager - SEEK: " + JSON.stringify(event));

        $('#play, #pause').hide('fast');
        seek = true;

        this.mediaManager['onSeekOrig'](event);
    }
    
    CustomReceiver.prototype.mediaOnStopEvent = function(event) {

        console.log("### Media Manager - STOP: " + JSON.stringify(event));
        
        Toucan.enterDefaultState();

        this.mediaPlayer.unload();

        this.mediaPlayer = null;

        this.mediaManager['onStopOrig'](event);
    }