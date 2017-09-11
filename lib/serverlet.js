'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var opflow = require('opflow');
var debugx = require('debug')('opflow:server');

var AUTOINIT = { autoinit: false }

var Server = function(kwargs) {
  kwargs = kwargs || {};

  var configurer = new opflow.PubsubHandler(lodash.defaults(AUTOINIT,
    lodash.pick(kwargs, ['uri', 'applicationId']),
    lodash.omit(kwargs.configurer, ['handler'])));

  var rpcWorker = new opflow.RpcWorker(lodash.defaults(AUTOINIT,
    lodash.pick(kwargs, ['uri', 'applicationId']),
    lodash.omit(kwargs.rpcWorker, ['mappings'])));

  var subscriber = new opflow.PubsubHandler(lodash.defaults(AUTOINIT,
    lodash.pick(kwargs, ['uri', 'applicationId']),
    lodash.omit(kwargs.subscriber, ['handler'])));

  this.start = function() {
    var actions = [];

    actions.push(configurer.ready());
    if (lodash.isFunction(kwargs.configurer.handler)) {
      actions.push(configurer.subscribe(kwargs.configurer.handler));
    }

    actions.push(rpcWorker.ready());
    var mappings = lodash.filter(kwargs.rpcWorker.mappings, function(mapping) {
      return lodash.isString(mapping.routineId) && lodash.isFunction(mapping.handler);
    });
    actions.push(Promise.mapSeries(mappings, function(mapping) {
      return rpcWorker.process(mapping.routineId, mapping.handler);
    }));

    actions.push(subscriber.ready());
    if (lodash.isFunction(kwargs.subscriber.handler)) {
      var consumerTotal = kwargs.subscriber.consumerTotal;
      if (!lodash.isInteger(consumerTotal) || consumerTotal <= 0) consumerTotal = 1;
      var consumers = Promise.all(lodash.range(consumerTotal).map(function(item) {
        return subscriber.subscribe(kwargs.subscriber.handler);
      }));
      actions.push(consumers);
    }

    return Promise.all(actions);
  }

  this.stop = function() {
    return Promise.all([
      configurer.close(), rpcWorker.close(), subscriber.close()
    ]);
  }
}

module.exports = Server;