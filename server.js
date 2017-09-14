'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var opflow = require('opflow');
var Fibonacci = require('./lib/fibonacci');
var debugx = require('debug')('fibonacci:server');

var numberMax = 50;

console.log('[+] FibonacciServer example');

var promise = opflow.Loader.instance.createServerlet({
  configurer: function(body, headers, finish) {
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
  },
  rpcWorker: [{
    routineId: 'fibonacci',
    handler: function(body, headers, response) {
      var requestId = headers.requestId;

      debugx.enabled && debugx('Request[%s] has body: %s', requestId, body);
      response.emitStarted();

      body = JSON.parse(body);

      debugx.enabled && debugx('Request[%s] - numberMax: %s', requestId, numberMax);
      if (numberMax < body.number) {
        response.emitFailed({
          message: 'Number exceeding limit',
          numberMax: numberMax
        });
        return;
      }

      var fibonacci = new Fibonacci(body);
      while(fibonacci.next()) {
        var r = fibonacci.result();
        debugx.enabled && debugx('Request[%s] step[%s]', requestId, r.step);
        response.emitProgress(r.step, r.number);
      };

      debugx.enabled && debugx('Request[%s] has been finished: %s', requestId,
        JSON.stringify(fibonacci.result()));
      response.emitCompleted(fibonacci.result());
    }
  }],
  subscriber: function(body, headers, finish) {
    debugx.enabled && debugx('Message: %s', body.toString());
    body = JSON.parse(body.toString());

    if (lodash.isNumber(body.number)) {
      var fibonacci = new Fibonacci(body);
      var r = fibonacci.finish();
      debugx.enabled && debugx('Fibonacci(%s) -> %s', r.number, r.value);
    }

    finish();
  }
});

promise.then(function(server) {
  console.log('Server is running. CTRL+C to exit!');
});
