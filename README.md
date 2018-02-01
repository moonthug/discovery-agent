# Disco Agent

![alt text](https://vignette.wikia.nocookie.net/simpsons/images/4/47/Tapped_Out_Unlock_Disco_Stu.png/revision/latest?cb=20150814211254 "Disco Agent")

Currently a proof of concept/work in progress/jumble of ideas/messy shit.

_Don't use this module... yet..._


## Install

Not in the NPM registry yet. Link or install from github.

```bash
$ npm install git+https://git@github.com/moonthug/discovery-agent
```

## Usage

### Import

```javascript 1.7
const discoveryAgent = require('discovery-agent');
```

### Constructor

The constructor sets up the connection configuration for the service. Below, we configure the `DiscoveryAgent` to use
a [Eureka](https://github.com/Netflix/eureka) server, accepting values from the server environment with fall backs
in place.

```javascript 1.7
const agent = new discoveryAgent.DiscoveryAgent(
  discoveryAgent.ADAPTER_TYPES.EUREKA,
  {
    host: process.env.SERVICE_DISCOVERY_HOST || '127.0.0.1',
    port: process.env.SERVICE_DISCOVERY_PORT || null, // default provided by adapter
    advertiseHost: process.env.SERVICE_DISCOVERY_ADVERTISE_HOST || os.hostname(),
    advertisePort: process.env.SERVICE_DISCOVERY_ADVERTISE_PORT || process.env.PORT || 3000,
  }
);
```

### Registration

Here we register the service, specifying a group that we will query for later, and the details of the service.

```javascript 1.7
const registrationDetails = await agent.register(
  'twitter-consumer',
  '172.0.0.10',
  3000
);
```

Registration is optional for services that will perform the consumption. Consumers are quired to register... otherwise
they wont be found!

### Health checks

Once registered, we can create a health check on our service discovery server.

```javascript 1.7
// Defaults
const checkOptions = {
  method: 'GET',
  interval: 30000,  // ms
  timeout: 10000,   // ms
}

const check = await agent.createCheck('db-connectivity-check', '/health/db?auth=1234', 5000);
```

* Currently only works in the [consul](https://www.consul.io/) adapter
* Only supports basic HTTP(s) checks


### Listing services

Services can be queried by `type` returning an array of available services.

```javascript 1.7
const services = await agent.list('twitter-consumer');
```
* At present, [Eureka](https://github.com/Netflix/eureka) requires the consuming client to register first (see above method)

### Retrieving a service from a pool

The agent comes with a mechanism to allow all parts of an application to `import`/`require` the library and use the
static `pool` method to return the next available service.

It also provides a very basic round-robin load balancing.

Set up the pool:

```javascript 1.7
agent.createPool('twitter-consumer');
```

Access the pool from other area's in our application.

```javascript 1.7
const DiscoveryAgent = require('discovery-agent').DiscoveryAgent;
const request = require('request');

DiscoveryAgent.pool()
  .then(service => {
    request(service.toURI('/users'), (error, response, body) => {
      console.log(body);
    });
  })
```

The returned service methods provide a convenient `toURI` method to build a complete URL.

```javascript 1.7
const url = service.toURI('/users');

// http://172.0.0.10:3000/users
````


## Example

Here is an example using the [consul](https://www.consul.io/) adapter.

### Consumed

```javascript 1.7
const discoveryAgent = require('discovery-agent');
const express = require('express');

// Express
const app = express();
app.get('/', (req, res) => res.json({ hello: 'world' }));
app.get('/tweets', (req, res) => res.json([{ id: 1234, tweet: '@moonthug stop using twitter in your examples' }]));
app.get('/health', (req, res) => res.send('OK'));
app.listen(3000, () => console.log('Ready on port 3000'));

// Discovery agent
const agent = new discoveryAgent.DiscoveryAgent(
  discoveryAgent.ADAPTER_TYPES.CONSUL, { host: '172.0.0.2'}
);
const registrationDetails = await agent.register(
  'twitter-consumer',
  '172.0.0.50',
  3000
);
const check = await agent.createCheck('db-connectivity-check', '/health', 10000);
```

### Consumer

```javascript 1.7
const discoveryAgent = require('discovery-agent');
const express = require('express');

// Express
const app = express();
app.get('/', (req, res) => {
  DiscoveryAgent.pool()
    .then(service => {
      request(service.toURI('/tweets'), (error, response, body) => {
        res.json(body) 
      });
    })
}));
app.get('/health', (req, res) => res.send('OK'));
app.listen(3000, () => console.log('Ready on port 3000'));

// Discovery agent
const agent = new discoveryAgent.DiscoveryAgent(
  discoveryAgent.ADAPTER_TYPES.CONSUL, { host: '172.0.0.2'}
);

agent.createPool('twitter-consumer');
```

## @TODO

- Lots
