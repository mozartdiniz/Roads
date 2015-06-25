var Ro = Ro || {};

/**
 * Ro.Environment is used to check in what platform your app is running, Roads check these values when
 * need to decide if a back-button will be showed, or something like that
 */

Ro.Environment = {
	isTouchDevice: !!('ontouchstart' in window),
	platform: {
		androidVersion: (function (){
			var isAndroid = navigator.userAgent.match(/Android([^;]*)/);
			if (isAndroid && isAndroid.length > 1) {
				return parseInt(isAndroid[1], 10);
			}
			return false;
		}()),
		isAndroid: navigator.userAgent.match('Android') !== null,
		isIPhone: navigator.userAgent.match('iPhone') !== null,
		isIPad: navigator.userAgent.match('iPad') !== null,
		isWPhone: navigator.userAgent.match(/Trident/) ? true : false,
		isIOS: (navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPad')) ? true : false,
		isFxOS: (navigator.userAgent.match(/Mozilla\/5.0 \(Mobile;/) || navigator.userAgent.match('iPad')) ? true : false
	}
};