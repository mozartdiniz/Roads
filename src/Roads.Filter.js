var Ro = Ro || {};

/**
 * Filters are functions that will be used to evaluate the value when templateEngine() is replacing data in a
 * template string. Roads come with some basic filters but is also easy create and use new ones.
 *
 */

Ro.Filter = {
	filters: {

		date: function (dateValue, key, dateFormat) {

			if (!dateValue) {
				throw 'Roads.Filter.date: dateValue is mandatory';
			}

			var format = dateFormat || Ro.i18n.defaults.date;
			var date   = new Date (dateValue);
			var year   = date.getUTCFullYear();
			var day    = date.getUTCDate();
			var month  = date.getUTCMonth()+1;

			format = format.replace(/yyyy/g, year);
			format = format.replace(/yy/g, String(year).substr(2,2));
			format = format.replace(/MM/g, (month < 10) ? '0' + month : month);
			format = format.replace(/M/g, month);
			format = format.replace(/dd/g, (day < 10) ? '0' + day : day);
			format = format.replace(/d/g, day);

			return format;

		},

		toDate: function (stringDate, stringFormat) {

			var defaultI18nFormat =  Ro.i18n.defaults.date + ' ' + Ro.i18n.defaults.time;
			var format = (stringFormat) ? stringFormat : defaultI18nFormat;
			var getByChar = function (char) {
				return parseInt(stringDate.substring(format.indexOf(char), format.lastIndexOf(char) + 1));
			};

			var year = getByChar('y');
			var month =  getByChar('M');
			var day = getByChar('d');
			var hour = getByChar('H') || getByChar('h') || 0;
			var minute = getByChar('m') || 0;
			var second = getByChar('s') || 0;
			var is12Hours = format.match(/h/);
			var isUTC = format.match(/T|\+0000|Z/);

			if (year.toString().length === 2) {
				year += (year > 68) ? 1900 : 2000;
			}

			if (is12Hours) {
				hour = hour * 2;
			}

			if (isUTC) {
				return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
			} else {
				return new Date(year, month - 1, day, hour, minute, second);
			}

		},

		time: function (timeValue, key, timeFormat) {

			if (!timeValue) {
				throw 'Roads.Filter.date: timeValue is mandatory';
			}

			if ((Ro.Environment.platform.isWPhone || Ro.Environment.platform.isIOS) && typeof timeValue === 'string') {
				timeValue = Ro.dateToIEandSafari (timeValue);
			}

			var format  = timeFormat || Ro.i18n.defaults.time;
			var time    = new Date (timeValue);
			var hours24 = time.getHours();
			var hours12 = (hours24 + 11) % 12 + 1;
			var minutes = time.getMinutes();
			var seconds = time.getSeconds();
			var a       = (hours24 >= 12) ? 'pm' : 'am';

			format = format.replace(/HH/g, (hours24 < 10) ? "0" + hours24 : hours24);
			format = format.replace(/H/g, hours24);
			format = format.replace(/hh/g, (hours12 < 10) ? "0" + hours12 : hours12);
			format = format.replace(/h/g, hours12);
			format = format.replace(/mm/g, (minutes < 10) ? "0" + minutes : minutes);
			format = format.replace(/ss/g, seconds);
			format = format.replace(/a/g, a);

			return format;
		},

		float: function (value, decimalPlaces) {
			if (value) {

				if (decimalPlaces) {
					if (typeof value === 'string') {
						value = parseFloat (value);
					}
					value = value.toFixed (decimalPlaces);
				}

				return (value + '').replace('.', Ro.i18n.defaults.decimalSymbol) || '';
			}

			return '0';
		},

		i18n: function (i18nKey) {
			return Ro.i18n.translations[i18nKey] || i18nKey;
		}
	},

	// Used to add a new filter
	register: function (filterName, filterImplementation) {

		if (!filterName) {
			throw 'Roads.Filter.register: filterName is mandatory';
		}

		this.filters[filterName] = filterImplementation;
	}
};