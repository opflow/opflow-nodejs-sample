'use strict';

var lodash = require('lodash');
var opflow = require('opflow');
var debugx = require('debug')('fibonacci:setting');

var FibonacciSetting = function(params) {
	var handler = new opflow.PubsubHandler(params);
	var numberMax = 45;

	this.ready = handler.ready.bind(handler);

	this.subscribe = function() {
		return handler.subscribe(function(body, headers, finish) {
			debugx.enabled && debugx('Message: %s', body.toString());
			body = JSON.parse(body.toString());

			if (lodash.isNumber(body.numberMax)) {
				if (body.numberMax <= 0) {
					finish({ msg: 'maximum_should_be_positive_number' });
				} else if (body.numberMax <= 79) {
					numberMax = body.numberMax;
					finish();
				} else {
					finish({ msg: 'maximum_number_exceeding_limit:79' });
				}
			} else {
				finish({ msg: 'invalid_maximum_number' });
			}
		});
	}

	Object.defineProperty(this, 'numberMax', {
		get: function() { return numberMax; },
		set: function(value) {}
	});

	this.close = handler.close.bind(handler);
}

module.exports = FibonacciSetting;