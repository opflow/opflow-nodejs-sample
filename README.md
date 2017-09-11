# opflow-nodejs-sample

> Opflow for Nodejs sample application

## Prerequisites

### Install Rabbitmq on Ubuntu

Add the APT repository to your `/etc/apt/sources.list.d`:

```shell
echo 'deb http://www.rabbitmq.com/debian/ testing main' |
     sudo tee /etc/apt/sources.list.d/rabbitmq.list
```

Add Rabbitmq public key to our trusted key list using `apt-key`:

```shell
wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc |
     sudo apt-key add -
```

Update the package list:

```shell
sudo apt-get update
```

Install rabbitmq-server package:

```shell
sudo apt-get install rabbitmq-server


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
