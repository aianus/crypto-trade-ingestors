#!/usr/bin/env ruby
require 'bundler/setup'
require 'dotenv'
Dotenv.load
require 'oanda_bank'
require 'pry'
require 'aws-sdk'

firehose = Aws::Firehose::Client.new(
  region: 'us-east-1'
)

cnh = {
  "priority": 100,
  "iso_code": "CNH",
  "name": "Chinese Renminbi Yuan (Offshore)",
  "symbol": "¥",
  "alternate_symbols": ["CN¥", "元", "CN元"],
  "subunit": "Fen",
  "subunit_to_unit": 100,
  "symbol_first": true,
  "html_entity": "￥",
  "decimal_mark": ".",
  "thousands_separator": ",",
  "iso_numeric": "156",
  "smallest_denomination": 1
}
Money::Currency.register(cnh)

oanda_bank = Money::Bank::OANDA.new(ENV['FXTRADE_ACCOUNT_ID'], ENV['FXTRADE_ACCESS_TOKEN'])

loop do
  oanda_bank.update_rates!

  records = %w(EUR CAD CNH JPY GBP AUD CHF INR).map do |quote|
    {
      data: {
        timestamp: (Time.now.to_f * 1000).round,
        pair: "USD/#{quote}",
        price: oanda_bank.get_rate('USD', quote).truncate(5).to_s('F')
      }.to_json + "\n"
    }
  end

  firehose.put_record_batch({
    delivery_stream_name: ENV['STREAM_NAME'],
    records: records
  })

  sleep 60
end
