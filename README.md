# opflow-nodejs-sample

> Opflow for Nodejs sample application

## Installation

Clone source code from github:

```shell
git clone https://github.com/opflow/opflow-nodejs-sample.git
```

Change current working directory to this project:

```shell
cd opflow-nodejs-sample
```

Install `npm` dependencies:

```shell
npm install
```

## Individual examples

RPC worker (server):

```shell
DEBUG=fibonacci* node lib/rpc_worker.js
```

RPC master (client):

```shell
DEBUG=fibonacci* node lib/rpc_master.js
```

Subscriber (Pub/sub server):

```shell
DEBUG=fibonacci* node lib/subscriber.js
```

Publisher (Pub/sub client):

```shell
DEBUG=fibonacci* node lib/publisher.js
```

## Launch Server

```shell
DEBUG=fibonacci* node server.js
```

## Execute client

```shell
DEBUG=fibonacci* node client.js request -n 40
```
