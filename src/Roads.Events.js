var Ro = Ro || {};

Ro.Events = {
	click: function () {
		return (Ro.Environment.isTouchDevice) ? 'touchstart' : 'click'
	}
};