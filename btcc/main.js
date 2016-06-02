require('dotenv').config({silent: true});

var socket = require('socket.io-client')('https://websocket.btcchina.com/');
       aws = require('aws-sdk'),
    moment = require('moment'),
         _ = require('underscore');

aws.config.region = 'us-east-1';
var firehose = new aws.Firehose({apiVersion: '2015-08-04'});

function processMessage(args) {
  var data = {
    source: "btcc",
    timestamp: args.date * 1000,
    pair: "BTC/CNY",
    size: args.amount.toString(),
    price: args.price.toString(),
    side: args.type == "buy" ? "sell" : "buy" // BTCC has the opposite definition of what a sell is
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

socket.emit('subscribe', 'marketdata_cnybtc');

socket.on('trade', processMessage);

socket.on('reconnect_failed', function() {
  console.log("Websocket connection failed");
  process.exit(1);
});
