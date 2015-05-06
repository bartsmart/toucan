(function($) {
	$.fn.gVideo = function(options) {		

		var defaults = {
			theme: 'toucan',
			title: '',
			image: ''
		};
		var options = $.extend(defaults, options);

		return this.each(function() {
			var $gVideo = $(this);
			
			var $video_wrap = $('<div></div>').addClass('toucan-video-player').addClass(options.theme);

			if(options.subtitle != '') {
				options.subtitle += ' - ';
			}
			var $video_controls = $('<div class="toucan-video-controls"><div class="movie-cover"><img src="' + options.image + '" width="80" /></div><div class="controls-wrapper"><div class="toucan-title">' + options.subtitle + options.title + '</div><a class="toucan-video-play" title="Play/Pause"></a><div class="video-seek-wrapper"><div class="toucan-video-timer">00:00:00</div><div class="toucan-video-seek"></div><div class="toucan-video-timer-final">-00:00:00</div></div></div></div>');					
			$gVideo.wrap($video_wrap);
			$gVideo.after($video_controls);
			
			var $video_container = $gVideo.parent('.toucan-video-player');
			var $video_controls = $('.toucan-video-controls', $video_container);
			var $toucan_play_btn = $('.toucan-video-play', $video_container);
			var $toucan_video_seek = $('.toucan-video-seek', $video_container);
            var $toucan_video_timer_final = $('.toucan-video-timer-final', $video_container);
			var $toucan_video_timer = $('.toucan-video-timer', $video_container);
			
			$video_controls.hide();
						
			var gPlay = function() {
				seek = false;
				if($gVideo.attr('paused') == false) {
					$gVideo[0].pause();					
				} else {					
					$gVideo[0].play();				
				}
			};
			
			$toucan_play_btn.click(gPlay);
			$gVideo.click(gPlay);
			
			$gVideo.bind('play', function() {
				seek = false;
				$toucan_play_btn.addClass('toucan-paused-button');
			});
			
			$gVideo.bind('pause', function(event) {
				$toucan_play_btn.removeClass('toucan-paused-button');
                $('#pause, #play').hide();

				if(paused == false && loadingState == false) {
					$('#buffer').show();
				} else {
					$('#pause').show();
				}
			});
			
			$gVideo.bind('ended', function() {
				$toucan_play_btn.removeClass('toucan-paused-button'); 
			});
			
			var seeksliding = false;			
			var createSeek = function() {
				if($gVideo.attr('readyState')) {
                    
					var video_duration = $gVideo.attr('duration');
					$toucan_video_seek.slider({
						value: 0,
						step: 0.01,
						orientation: "horizontal",
						range: "min",
						max: video_duration,
						animate: true,					
						slide: function(){							
							seeksliding = true;
						},
						stop:function(e,ui){
							seeksliding = false;						
							$gVideo.attr("currentTime",ui.value);
                            $gVideo.attr("duration",Math.round(ui.max - ui.value));
						}
					});
					//$video_controls.show();				
				} else {
					setTimeout(createSeek, 150);
				}
			};

			createSeek();
		
			var gTimeFormat=function(seconds){
				var h=Math.floor(seconds / 3600);
				var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
				var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
                
                if (h < 10) {h = "0" + h;}
                
				return h + ":" + m + ":" + s;
			};
			
			var seekUpdate = function() {

				seek = true;

				var currenttime = $gVideo.attr('currentTime');
                var finaltime = $gVideo.attr('duration');
                var res = finaltime - currenttime;
                
				if(!seeksliding) $toucan_video_seek.slider('value', currenttime);

                $toucan_video_timer.text(gTimeFormat(currenttime));	
                $toucan_video_timer_final.text('-' + gTimeFormat(res));	
			};
			
			$gVideo.bind('timeupdate', seekUpdate);	
			
			$gVideo.removeAttr('controls');
		});
	};

	$.fn.gVideo.defaults = {		
	};
})(jQuery);