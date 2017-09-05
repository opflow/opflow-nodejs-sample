'use strict';

var Promise = require('bluebird');
var debugx = require('debug')('fibonacci:server');

var FibonacciConfigurer = require('./lib/configurer');
var FibonacciRpcWorker = require('./lib/rpc_worker');
var FibonacciSubscriber = require('./lib/subscriber');

var configurer = new FibonacciConfigurer({
	uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
	exchangeName: 'opflow-fibonacci-publisher',
	routingKey: 'opflow-fibonacci-configurer',
	subscriberName: 'opflow-fibonacci-configurer'
});

var rpcWorker = new FibonacciRpcWorker({
	uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
	exchangeName: 'opflow-fibonacci-exchange',
	routingKey: 'opflow-fibonacci-rpc',
	operatorName: 'opflow-fibonacci-operator',
	responseName: 'opflow-fibonacci-response',
	applicationId: 'FibonacciGenerator'
}, configurer);

var subscriber = new FibonacciSubscriber({
	uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
	exchangeName: 'opflow-fibonacci-publisher',
	routingKey: 'opflow-fibonacci-pubsub-public',
	subscriberName: 'opflow-fibonacci-subscriber'
}, configurer);

var start = function() {
	return Promise.all([
		configurer.subscribe(), subscriber.subscribe(), rpcWorker.process()
	]);
}

var stop = function() {
	return Promise.all([
		configurer.close(), subscriber.close(), rpcWorker.close()
	]);
}

start().then(function(results) {
	console.log('Server is running. CTRL+C to exit!');
});
