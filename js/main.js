window.onload = function() {
	
	DEBUG = true;
	MEDIA_TIMEOUT = 10; // Media load timeout - 10 seconds
	VIDEO_TIMEOUT = 15; // 5 * 10 seconds times

	// Logging turned off while not in debugging state
	if(!DEBUG) {
		console.log = function() {}
		console.debug = function() {}
		console.info = function() {}
	}

	console.log('### main.js: onload()');

	imageURL = '';
    title = '';
    subtitle = '';

	player = null;
    bookmark = false;
    seek = false;
    paused = false;
    loadingState = false;
    playerReadyState = false;
    dimensionValue = '###URL###';
    drmCheck = false;
    bookMrkInt = false;
    connectedCastSenders = [];
	
	window.customReceiver = new CustomReceiver();
}