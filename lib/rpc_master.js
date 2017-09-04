'use strict';

var opflow = require('opflow');
var debugx = require('debug')('fibonacci:rpc:master');

var FibonacciRpcMaster = function(params) {
	var rpcMaster = new opflow.RpcMaster(params);

	this.request = function(number, timeout) {
		return rpcMaster.request('fibonacci', {
			number: number
		}, {
			timeout: timeout
		});
	}

	this.ready = rpcMaster.ready.bind(rpcMaster);

	this.close = rpcMaster.close.bind(rpcMaster);
}

module.exports = FibonacciRpcMaster;

if (require.main === module) {

	console.log('[+] FibonacciRpcMaster example');

	var master = new FibonacciRpcMaster({
		uri: process.env.OPFLOW_TDD_URI || 'amqp://localhost',
		exchangeName: 'opflow-fibonacci-exchange',
		routingKey: 'opflow-fibonacci-rpc',
		responseName: 'opflow-fibonacci-response'
	});

	master.ready().then(function() {
		return master.request(40, 5000);
	}).then(function(task) {
		return processTask(task);
	}).then(function(tracer) {
		console.log(JSON.stringify(tracer, null, 2));
		return master.close();
	});

	var processTask = function(job) {
		var requestID = job.requestId;
		return new Promise(function(onResolved, onRejected) {
			var stepTracer = [];
			job.on('started', function(info) {
				stepTracer.push({ event: 'started', data: info});
				debugx.enabled && debugx('Request[%s] started', requestID);
			}).on('progress', function(percent, data) {
				stepTracer.push({ event: 'progress', data: {percent: percent}});
				debugx.enabled && debugx('Request[%s] progress: %s', requestID, percent);
			}).on('failed', function(error) {
				stepTracer.push({ event: 'failed', data: error});
				debugx.enabled && debugx('Request[%s] failed, error: %s', requestID, JSON.stringify(error));
				onRejected(error);
			}).on('completed', function(result) {
				stepTracer.push({ event: 'completed', data: result});
				debugx.enabled && debugx('Request[%s] done, result: %s', requestID, JSON.stringify(result));
				onResolved(stepTracer);
			});
		});
	}
}