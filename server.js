'use strict';

var Promise = require('bluebird');
var debugx = require('debug')('fibonacci:server');

var FibonacciConfigurer = require('./lib/configurer');
var FibonacciRpcWorker = require('./lib/rpc_worker');
var FibonacciSubscriber = require('./lib/subscriber');

var Server = function() {
	var configurer = new FibonacciConfigurer({
		uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-publisher',
		routingKey: 'opflow-fibonacci-configurer',
		subscriberName: 'opflow-fibonacci-configurer',
		autoinit: false
	});

	var rpcWorker = new FibonacciRpcWorker({
		uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-exchange',
		routingKey: 'opflow-fibonacci-rpc',
		operatorName: 'opflow-fibonacci-operator',
		responseName: 'opflow-fibonacci-response',
		applicationId: 'FibonacciGenerator',
		autoinit: false
	}, configurer);

	var subscriber = new FibonacciSubscriber({
		uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-publisher',
		routingKey: 'opflow-fibonacci-pubsub-public',
		subscriberName: 'opflow-fibonacci-subscriber',
		autoinit: false
	}, configurer);

	this.start = function() {
		return Promise.all([
			configurer.ready(), configurer.subscribe(),
			subscriber.ready(), subscriber.subscribe(),
			rpcWorker.ready(), rpcWorker.process()
		]);
	}

	this.stop = function() {
		return Promise.all([
			configurer.close(), subscriber.close(), rpcWorker.close()
		]);
	}
}

module.exports = Server;

if (require.main === module) {

	console.log('[+] FibonacciServer example');

	var server = new Server();
	server.start().then(function(results) {
		console.log('Server is running. CTRL+C to exit!');
	});
}