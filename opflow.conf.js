module.exports = {
  opflow: {
    serverlet: {
      uri: process.env.OPFLOW_LAB_URI || 'amqp://localhost',
      applicationId: 'FibonacciGenerator',
      configurer: {
        exchangeName: 'opflow-fibonacci-publisher',
        routingKey: 'opflow-fibonacci-configurer'
      },
      rpcWorker: {
        exchangeName: 'opflow-fibonacci-exchange',
        routingKey: 'opflow-fibonacci-rpc',
        operatorName: 'opflow-fibonacci-operator',
        responseName: 'opflow-fibonacci-response'
      },
      subscriber: {
        exchangeName: 'opflow-fibonacci-publisher',
        routingKey: 'opflow-fibonacci-pubsub-public',
        subscriberName: 'opflow-fibonacci-subscriber',
        recyclebinName: 'opflow-fibonacci-recyclebin',
        consumerTotal: 1,
        enabled: false
      }
    }
  }
}