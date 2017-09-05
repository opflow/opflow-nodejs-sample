'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var opflow = require('opflow');
var debugx = require('debug')('fibonacci:publisher');

var FibonacciPublisher = function(params) {
	var handler = new opflow.PubsubHandler(params);

	this.ready = handler.ready.bind(handler);

	this.perform = function(action) {
		action = action || 'stats';
		return handler.publish({ action: action });
	}

	this.publish = function(number) {
		return handler.publish({ number: number });
	}

	this.close = handler.close.bind(handler);
}

module.exports = FibonacciPublisher;

if (require.main === module) {

	console.log('[+] FibonacciPublisher example');

	var publisher = new FibonacciPublisher({
		uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-publisher',
		routingKey: 'opflow-fibonacci-pubsub-public'
	});

	publisher.ready().then(function() {
		return Promise.mapSeries(lodash.range(20, 40), function(number) {
			return publisher.publish(number);
		});
	}).then(function() {
		return publisher.close();
	});
}