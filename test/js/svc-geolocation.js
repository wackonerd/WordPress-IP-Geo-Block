/*jslint white: true */
/**
 * Service: Generate random IP and get geolocation
 *
 */
angular.module('geolocation', []);
angular.module('geolocation').service('GeolocationSvc', ['$http', function ($http) {
	'use strict';

	/**
	 * Geolocation API
	 * These APIs need to respond `Access-Control-Allow-Origin` in header.
	 */
	this.apis = [
		/*{
			api: 'freegeoip.net',
			url: 'http://freegeoip.net/%API_FMT%/%API_IP%',
			fmt: 'json',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name':  return data.country_name || null;
					case 'code':  return data.country_code || null;
					case 'error': return this.error('not found');
				}
				return null;
			}
		},*/
		{
			api: 'ipinfo.io',
			url: 'http://ipinfo.io/%API_IP%/%API_FMT%',
			fmt: 'json',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name':  return data.country || null;
					case 'code':  return data.country || null;
					case 'error': return this.error('not found');
				}
				return null;
			}
		},
		{
			api: 'ip-api',
			url: 'http://ip-api.com/%API_FMT%/%API_IP%',
			fmt: 'json',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name':  return data.country || null;
					case 'code':  return data.countryCode || null;
					case 'error': return this.error(data.message || null);
				}
				return null;
			}
		},
		/**
		 * APIs that doesn't support CORS.
		 * These are accessed through https://developer.yahoo.com/yql/
		 */
		{
			api: 'geoPlugin',
			url: 'https://query.yahooapis.com/v1/public/yql?q=select * from %API_FMT% where url="http://www.geoplugin.net/%API_FMT%.gp?ip=%API_IP%"&format=%API_FMT%&jsonCompat=new',
			fmt: 'json',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name':
						if (typeof data.query.results.json !== 'undefined') {
							return data.query.results.json.geoplugin_countryName;
						}
						break;
					case 'code':
						if (typeof data.query.results.json !== 'undefined') {
							return data.query.results.json.geoplugin_countryCode;
						}
						break;
					case 'error':
						return this.error('not found');
				}
				return null;
			}
		},
		/**
		 * APIs that doesn't support CORS.
		 * These are accessed through https://developer.yahoo.com/yql/
		 */
		/*{
			api: 'Pycox',
			url: 'https://query.yahooapis.com/v1/public/yql?q=select * from %API_FMT% where url="http://ip.pycox.com/%API_FMT%/%API_IP%"&format=%API_FMT%&jsonCompat=new',
			fmt: 'json',
			type: 'IPv4',
			get: function (data, type) {
				switch (type) {
					case 'name':
						if (typeof data.query.results.json !== 'undefined') {
							return data.query.results.json.country_name;
						}
						break;
					case 'code':
						if (typeof data.query.results.json !== 'undefined') {
							return data.query.results.json.country_code;
						}
						break;
					case 'error':
						return this.error(data.query.results.error);
				}
				return null;
			}
		},*/
		{
			api: 'Nekudo',
			url: 'https://query.yahooapis.com/v1/public/yql?q=select * from %API_FMT% where url="http://geoip.nekudo.com/api/%API_IP%"&format=%API_FMT%&jsonCompat=new',
			fmt: 'json',
			type: 'IPv4, IPv6',
			get: function (data, type) {
				switch (type) {
					case 'name' :
						if (data.query.results &&
							typeof data.query.results.json.msg === 'undefined') {
							return data.query.results.json.country.name;
						}
						break;
					case 'code' :
						if (data.query.results &&
							typeof data.query.results.json.msg === 'undefined') {
							return data.query.results.json.country.code;
						}
						break;
					case 'error':
						if (data.query.results) {
							return data.query.results.json.msg;
						} else {
							return this.error('error');
						}
				}
				return null;
			}
		}
	];

	this.error = function (errmsg) {
		return errmsg;
	};

	this.get_geolocation = function (ip, callback) {
		var api = this.apis[get_random_int(0, this.apis.length-1)],
		    url = api.url
			.replace('%API_IP%', ip)
			.replace(/%API_FMT%/g, api.fmt);

		return $http({
			url: url,
			method: 'GET'
		})

		// Properties of the response object
		// data       – {string|Object} The response body.
		// status     – {number} HTTP status code of the response.
		// headers    – {function([headerName])} Header getter function.
		// config     – {Object} The configuration object used for the request.
		// statusText – {string} HTTP status text of the response.
		/*.then(
			// success
			function (res) {
				var geo = api.get(res.data, 'name');
				if (geo)
					geo += ' (' + api.get(res.data, 'code') + ')';
				else
					geo = api.get(res.data, 'error') + ' (' + api.api + ')';

				return combine_ip(ip, geo);
			},

			// error
			function (res) {
				var msg = res.data ? ' ' + strip_tags(res.data) : '';
				return res.status + ' ' + res.statusText + msg;
			}
		);*/

		// callback version (just `return` makes no effects) 
		.success(function (data, status, headers, config) {
			var geo = api.get(data, 'name');
			if (geo) {
				geo += ' (' + api.get(data, 'code') + ')';
			} else {
				geo = api.get(data, 'error') + ' (' + api.api + ')';
			}

			callback(combine_ip(ip, geo));
		})

		.error(function (data, status, headers, config) {
			var msg = data ? ' ' + strip_tags(data) : '';
			callback(combine_ip(ip, api.api + ': ' + status + msg));
		});
	};
}]);