require('dotenv').config();

var   gdax = require('coinbase-exchange'),
       aws = require('aws-sdk'),
    moment = require('moment-timezone'),
         _ = require('underscore');

STREAM_NAME = "crypto-trades"

aws.config.region = 'us-east-1';
var firehose = new aws.Firehose({apiVersion: '2015-08-04'});

var gdax_client = new gdax.PublicClient();

// Map from product ID to canonical notation Base/Quote
var products = null;

// Websockets (one for each product)
var websockets = [];

function processMessage(msg) {
  if (msg.type !== "match") {
    return;
  }

  var data = {
    source: "gdax",
    timestamp: moment(msg.time).valueOf(),
    pair: products[msg.product_id],
    size: msg.size,
    price: msg.price,
    side: msg.side
  }

  var params = {
    DeliveryStreamName: STREAM_NAME,
    Record: {
      Data: JSON.stringify(data) + "\n"
    }
  };

  firehose.putRecord(params, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

gdax_client.getProducts(function(err, resp, data) {
  if (err) {
    console.log("Could not load product list");
    process.exit(1);
  }

  products = _.object(_.map(data, function(product) {
    return [product.id, product.base_currency + "/" + product.quote_currency];
  }));

  for (var product in products) {
    var ws = new gdax.WebsocketClient(product);
    ws.on('message', processMessage);
    websockets.push(ws);
  }
});
