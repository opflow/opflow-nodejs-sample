'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var opflow = require('opflow');
var debugx = require('debug')('opflow:server');

var Server = function(kwargs) {
  kwargs = kwargs || {};

  var configurer = new opflow.PubsubHandler(lodash.defaults({
    autoinit: false
  }, lodash.pick(kwargs, ['uri', 'applicationId']), kwargs.configurer));

  var rpcWorker = new opflow.RpcWorker(lodash.defaults({
    autoinit: false
  }, lodash.pick(kwargs, ['uri', 'applicationId']), kwargs.rpcWorker));

  var subscriber = new opflow.PubsubHandler(lodash.defaults({
    autoinit: false
  }, lodash.pick(kwargs, ['uri', 'applicationId']), kwargs.subscriber));

  this.start = function() {
    return Promise.all([
      configurer.ready(),
      configurer.subscribe(kwargs.configurer.handler),
      rpcWorker.ready(),
      Promise.mapSeries(kwargs.rpcWorker.handlers, function(def) {
        return rpcWorker.process(def.routine, def.handler);
      }),
      subscriber.ready(),
      subscriber.subscribe(kwargs.subscriber.handler)
    ]);
  }

  this.stop = function() {
    return Promise.all([
      configurer.close(), rpcWorker.close(), subscriber.close()
    ]);
  }
}

module.exports = Server;