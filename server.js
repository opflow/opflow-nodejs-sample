'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var debugx = require('debug')('fibonacci:server');

var FibonacciRpcWorker = require('./lib/rpc_worker');
var FibonacciSetting = require('./lib/setting');
var FibonacciSubscriber = require('./lib/subscriber');

var rpcWorker = new FibonacciRpcWorker({
	uri: process.env.OPFLOW_TDD_URI || 'amqp://localhost',
	exchangeName: 'opflow-fibonacci-exchange',
	routingKey: 'opflow-fibonacci-rpc',
	operatorName: 'opflow-fibonacci-operator',
	responseName: 'opflow-fibonacci-response',
	applicationId: 'FibonacciGenerator'
});

var setting = new FibonacciSetting({
	uri: process.env.OPFLOW_TDD_URI || 'amqp://localhost',
	exchangeName: 'opflow-fibonacci-publisher',
	routingKey: 'opflow-fibonacci-setting',
	subscriberName: 'opflow-fibonacci-setting'
});

var subscriber = new FibonacciSubscriber({
	uri: process.env.OPFLOW_TDD_URI || 'amqp://localhost',
	exchangeName: 'opflow-fibonacci-publisher',
	routingKey: 'opflow-fibonacci-pubsub-public',
	subscriberName: 'opflow-fibonacci-subscriber'
});

rpcWorker.setting = setting;
subscriber.setting = setting;

Promise.all([
	setting.subscribe(), subscriber.subscribe(), rpcWorker.process()
]).then(function() {
	
})