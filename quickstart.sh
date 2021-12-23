#!/bin/bash
set -euo pipefail
mkdir -p data
read -p "Enter your alphavantage key: " key
for symbol in AAPL AMZN GE IBM
do
  echo "Download latest time series data for ${symbol}"
  curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}" > "./data/${symbol}.json"
done
echo "You are set up!"