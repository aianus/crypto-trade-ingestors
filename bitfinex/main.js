require('dotenv').config({silent: true});

var     bf = require('bitfinex-api-node'),
       aws = require('aws-sdk'),
         _ = require('underscore');

aws.config.region = 'us-east-1';
var firehose = new aws.Firehose({apiVersion: '2015-08-04'});

var rest_client = new bf.APIRest();

// Map from product ID to canonical notation Base/Quote
var products = null;

// Websocket
var ws = null;

function processMessage(pair, trade) {
  // Transform pair into canonical form Base/Quote
  var pairUpper = pair.toUpperCase();
  var base      = pair.slice(0, 3);
  var quote     = pair.slice(3);
  var pair      = base + "/" + quote;

  var data = {
    source: "bitfinex",
    timestamp: trade.timestamp * 1000,
    pair: pair,
    size: Math.abs(trade.amount).toString(),
    price: trade.price.toString(),
    side: trade.amount > 0 ? "sell" : "buy"
  }

  var params = {
    DeliveryStreamName: process.env.STREAM_NAME,
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

rest_client.get_symbols(function(err, data) {
  if (err) {
    console.log("Could not load symbols");
    process.exit(1);
  }

  var symbols = data;

  ws = new bf.WS();
  ws.on('open', function () {
    for (var i = 0; i < symbols.length; i++) {
      ws.subscribeTrades(symbols[i].toUpperCase());
    }
  });
  ws.on('trade', processMessage);
  ws.on('error', function(err) {
    console.log("Error received on websocket:", err);
    process.exit(1);
  });
  ws.on('close', function() {
    console.log("Websocket closed");
    process.exit(1);
  });
});
