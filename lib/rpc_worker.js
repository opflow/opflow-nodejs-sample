'use strict';

var opflow = require('opflow');
var debugx = require('debug')('fibonacci:rpc:worker');
var Fibonacci = require('./fibonacci');

var FibonacciRpcWorker = function(params) {
	var rpcWorker = new opflow.RpcWorker(params);

	this.process = function() {
		return rpcWorker.process('fibonacci', function(body, headers, response) {
			var requestId = headers.requestId;

			debugx.enabled && debugx('Request[%s] is a "%s", with body: %s', requestId, 
				headers.routineId, body);
			response.emitStarted();
			
			var fibonacci = new Fibonacci(JSON.parse(body));
			while(fibonacci.next()) {
				var r = fibonacci.result();
				debugx.enabled && debugx('Request[%s] step[%s]', requestId, r.step);
				response.emitProgress(r.step, r.number);
			};

			debugx.enabled && debugx('Request[%s] has been finished: %s', requestId,
				JSON.stringify(fibonacci.result()));
			response.emitCompleted(fibonacci.result());
		})
	}

	this.close = rpcWorker.close.bind(rpcWorker);
}

module.exports = FibonacciRpcWorker;

if (require.main === module) {
	console.log('[+] FibonacciRpcWorker example');

	var worker = new FibonacciRpcWorker({
		uri: process.env.OPFLOW_TDD_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-exchange',
		routingKey: 'opflow-fibonacci-rpc',
		operatorName: 'opflow-fibonacci-operator',
		responseName: 'opflow-fibonacci-response'
	});

	worker.process();
}
