'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var opflow = require('opflow');
var program = require('commander');
var util = require('util');
var debugx = require('debug')('fibonacci:cmdline');

var Client = function() {

  var publisher = new opflow.PubsubHandler({
    uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
    exchangeName: 'opflow-fibonacci-publisher',
    routingKey: 'opflow-fibonacci-pubsub-public',
    applicationId: 'FibonacciGenerator',
    autoinit: false
  });

  var rpcMaster = new opflow.RpcMaster({
    uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
    exchangeName: 'opflow-fibonacci-exchange',
    routingKey: 'opflow-fibonacci-rpc',
    applicationId: 'FibonacciGenerator',
    autoinit: false
  });

  this.ready = function() {
    return Promise.all([ publisher.ready(), rpcMaster.ready() ]);
  }

  this.request = function(number, timeout) {
    return rpcMaster.request('fibonacci', {
      number: number
    }, {
      timeout: timeout
    });
  }

  this.publish = function(number) {
    return publisher.publish({ number: number });
  }

  this.setting = function(numberMax) {
    return publisher.publish({ numberMax: numberMax }, {}, 
      'opflow-fibonacci-configurer');
  }

  this.close = function() {
    return Promise.all([ publisher.close(), rpcMaster.close() ]);
  }
}

var client = new Client();

var interactCommands = function(commands) {
  return new Promise(function(onResolved, onRejected) {
    try {
      for(var i=0; i<commands.length; i++) {
        var command = commands[i];

        var cmddef = program.command(command.name).description(command.description);

        if (lodash.isString(command.alias) && !lodash.isEmpty(command.alias)) {
          cmddef = cmddef.alias(command.alias);
        }

        var options = command.options || [];
        for(var k=0; k<options.length; k++) {
          var option = options[k];
          cmddef = cmddef.option(util.format('-%s --%s %s',
              option.abbr, option.name, option.required?'<value>':'[value]'),
              option.description, option.parser || function(val) { return val });
        }

        var optionNames = lodash.map(options, function(option) {
          return option.name;
        });

        cmddef = cmddef.action((function(command, optionNames) {
          return function(values) {
            onResolved({
              name: command.name,
              options: lodash.pick(values, optionNames)
            });
          };
        })(command, optionNames));
      }

      program.parse(process.argv);

      if (process.argv.length <= 2) {
        program.outputHelp(function(helptext) {
          process.stdout.write(helptext);
          onResolved();
        });
      }
    } catch (error) {
      onRejected(error);
    }
  });
}

var commands = [{
  name: 'request',
  description: 'RPC request to calculate fibonacci',
  options: [{
    name: 'number',
    abbr: 'n',
    description: 'Number that needs to calculate',
    required: true,
    parser: function(val) {
      return parseInt(val);
    }
  }]
}, {
  name: 'setting',
  description: 'Set new numberMax value.',
  options: [{
    name: 'numberMax',
    abbr: 'm',
    description: 'Maximum value of Number',
    required: true,
    parser: function(val) {
      return parseInt(val);
    }
  }]
}];

interactCommands(commands).then(function(input) {
  console.log('INPUT: %s', JSON.stringify(input));
  switch(input.name) {
    case 'setting':
      if (input.options && input.options['numberMax']) {
        client.ready().then(function() {
          return client.setting(input.options['numberMax']);
        }).then(function() {
          return client.close();
        });
      }
      break;
    case 'request':
      if (!input.options || !input.options['number']) break;
      client.ready().then(function() {
        return client.request(input.options['number'], 5000);
      }).then(function(task) {
        return task.extractResult();
      }).then(function(result) {
        lodash.forEach(result.process, function(step) {
          console.log(JSON.stringify(step));
        });
        if (result.timeout) {
          console.log('Timeout !');
        }
        if (result.failed) {
          console.log('Failed: %s', JSON.stringify(result.error));
        }
        if (result.completed) {
          console.log('Result: %s', JSON.stringify(result.value));
        }
        return true;
      }).then(function() {
        return client.close();
      })
      break;
  }
}).catch(function(error) {
  console.log('ERROR: ', error);
});
