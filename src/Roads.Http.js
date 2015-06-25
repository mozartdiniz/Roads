var Ro = Ro || {};

/**
 * Ro.i18n is a helper to make your life easier when you need to make XMLHttpRequests
 */

Ro.Http = function () {

	// set defaults
	this.url         = '';
	this.method      = 'get';
	this.async       = true;
	this.data        = null;
	this.contentType = 'application/json';
	this.customHeader = null;

	//callback for success
	this.success     = null;
	this.timeout     = 30000;
	this.ontimeout   = null;
	this.roSuccess   = null;
	this.multipart   = null;

	//callback for error
	this.error       = null;

	// do request
	this.send = function() {

		var request = new XMLHttpRequest();

		request.open(this.method, this.url, this.async);
		if (!this.multipart) {
			request.setRequestHeader('Content-Type', this.contentType);
		}
		request.setRequestHeader("Cache-Control", "no-cache");
		request.setRequestHeader("Pragma", "no-cache");

		if (this.customHeader) {
			request.setRequestHeader(this.customHeader.key, this.customHeader.value);
		}

		request.withCredentials = true;

		//closure
		request.onreadystatechange = this.sendCallback.bind(this);

		request.ontimeout = (function (scope) {
			return function () {
				if (scope.ontimeout) {
					scope.ontimeout (this, scope);
				}
			};
		})(this);

		request.send(this.data);

		this.dropConnection = setTimeout((function(request){
			return function () {
				request.abort();
			}
		})(request), this.timeout);

	};

	this.sendCallback = function (e) {

		var xhr = e.target;
		var parsedResponse = '';

		if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201 || xhr.status === 204)) {

			clearInterval (this.dropConnection);

			if (this.success) {

				if (xhr.responseText && this.contentType === 'application/json') {
					parsedResponse = JSON.parse (xhr.responseText);
				} else {
					parsedResponse = xhr.responseText;
				}

				this.success (parsedResponse, xhr);
			}

		} else if (xhr.readyState === 4) {

			if (this.error) {
				this.error (xhr);
			}

		}

	};

};