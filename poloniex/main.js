require('dotenv').config();

var autobahn = require('autobahn');
         aws = require('aws-sdk'),
      moment = require('moment'),
           _ = require('underscore');

aws.config.region = 'us-east-1';
var firehose = new aws.Firehose({apiVersion: '2015-08-04'});

function processMessage(args) {
  if (args.type !== "newTrade") {
    return;
  }

  args = args.data;

  var data = {
    source: "poloniex",
    timestamp: moment.utc(args.date).valueOf(),
    pair: "ETH/BTC",
    size: args.amount,
    price: args.rate,
    side: args.type == "buy" ? "sell" : "buy" // Poloniex has the opposite definition of what a sell is
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

var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

connection.onopen = function (session) {
  console.log("Connection opened");
  session.subscribe('BTC_ETH', function(args) {
    for (var i = 0; i < args.length; ++i) {
      processMessage(args[i]);
    }
  });
}

connection.onclose = function () {
  console.log("Websocket connection closed");
  process.exit(1);
}

connection.open();
