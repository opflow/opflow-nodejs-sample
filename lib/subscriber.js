'use strict';

var lodash = require('lodash');
var opflow = require('opflow');
var debugx = require('debug')('fibonacci:subscriber');
var Fibonacci = require('./fibonacci');

var FibonacciSubscriber = function(params) {
	var handler = new opflow.PubsubHandler(params);
	var counter = 0;

	this.ready = handler.ready.bind(handler);

	this.subscribe = function(consumerTotal) {
		consumerTotal = consumerTotal || 1;
		if (consumerTotal > 0) {
			return Promise.all(lodash.range(consumerTotal).map(function(item) {
				return handler.subscribe(function(body, headers, finish) {
					debugx.enabled && debugx('Message: %s', body.toString());
					body = JSON.parse(body.toString());

					if (lodash.isNumber(body.number)) {
						counter++;
						var fibonacci = new Fibonacci(body);
						var r = fibonacci.finish();
						debugx.enabled && debugx('Fibonacci(%s) -> %s', r.number, r.value);
					}

					finish();
				});
			})).then(function(results) {
				if (consumerTotal == 1) return results[0];
				return results;
			});
		}
		return Promise.reject();
	}

	this.close = handler.close.bind(handler);
}

module.exports = FibonacciSubscriber;

if (require.main === module) {

	console.log('[+] FibonacciSubscriber example');

	var subscriber = new FibonacciSubscriber({
		uri: process.env.OPFLOW_TDD_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-publisher',
		routingKey: 'opflow-fibonacci-pubsub-public',
		otherKeys: ['opflow-fibonacci-pubsub-private'],
		subscriberName: 'opflow-fibonacci-subscriber',
		recyclebinName: 'opflow-fibonacci-recyclebin'
	});

	subscriber.ready().then(function() {
		return subscriber.subscribe();
	});
}