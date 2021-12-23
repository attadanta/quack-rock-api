## Getting started

This repository does not contain time series data. You can use the `quickstart.sh` script to obtain a sample or do so manually. For IBM, the request looks like this:

    curl https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=api-key > ./data/IBM.json
