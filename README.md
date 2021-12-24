# QuackRock API &middot; [![Docker Image CI](https://github.com/attadanta/quack-rock-api/actions/workflows/cicd.yaml/badge.svg)](https://github.com/attadanta/quack-rock-api/actions/workflows/cicd.yaml)

The API for a totally legitimate fintech company.

## Getting started

This repository does not contain time series data. You can use the `quickstart.sh` script to obtain a sample or do so manually. For `IBM`, the request looks like this:

```bash
curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=api-key" > IBM.json
```

## Code organization

This service is implemented in TypeScript and contains the following packages.

- `core`: contains the domain model. Ideally, the code here should be reusable to implement the same service on different frontends.
- `alphavantage`: provides a very basic service implementation using price data from [Alpha Vantage][1].
- `express`: implements an [Express][2] app.

## Running

First, download sample ticker data. By default, the app expects to find a `./data/${ticker}.json` for every symbol configured in the `SYMBOLS` environment variable. Build and run the server by doing:

```bash
yarn build
yarn serve
```

Alternatively, use the Docker image:

```bash
mkdir -p logs
docker run -d --rm \
  -v "$(pwd)/data":/data:ro \
  -v "$(pwd)/logs":/logs \
  -e "NODE_ENV=production" \
  -e "DATA_DIRECTORY=/data" \
  -e "LOG_DIRECTORY=/logs" \
  -e "SYMBOLS=GE,AMZN,AAPL,IBM" \
  -p 3000:3000 \
  ghcr.io/attadanta/quack-rock-api:main
```

To ensure it runs as expected, do:

```bash
curl -s localhost:3000/price/AAPL | jq .
```

[1]: https://www.alphavantage.co
[2]: http://expressjs.com/
