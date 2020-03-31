$(function player_pages_autorun(){
	console.log('player_pages_autorun');
	// Init audio player
	AudioPlayerHTML5.init();
	AudioPlayerHTML5.bind_onplaying(LongPlayerControl.onplaying);
	AudioPlayerHTML5.bind_onplaying(SmallPlayerControl.onplaying);
	AudioPlayerSWF.init();
	AudioPlayerSWF.bind_onplaying(LongPlayerControl.onplaying);
	AudioPlayerSWF.bind_onplaying(SmallPlayerControl.onplaying);
	LongPlayerControl.init();
	SmallPlayerControl.init();
	//console.profileEnd('lessons_autorun');
});
