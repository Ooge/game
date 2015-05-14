window.Ooge = {};
window.Ooge.global = {
	sWidth: window.innerWidth,
	sHeight: window.innerHeight,

	handlers: {},
	init: function() {
		$('canvas#world').attr({
			width: Ooge.global.sWidth,
			height: Ooge.global.sHeight
		});
	}
};
Ooge.global.init();