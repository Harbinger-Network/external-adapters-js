# Chainlink External Adapter for kava

## Installing

At the top level repo:

```
yarn
```

To create a docker container:

```
make docker adapter=kava
```

Setup a `.env` file in the `kava` adapter folder (see [example](example-env)). Note that docker `.env` files do not require quotes.

To run the adapter from a docker container on a docker network shared by the chainlink node (note the use of the `--ip` flag so that the container will always have the same ip)

```
cd kava
docker run --net <your-docker-network> --env-file .env --ip 172.20.0.2 -it kava-adapter:latest
```

To add the adapter as a bridge, go to your chainlink node's dashboard and select 'New Bridge'

<p align="left">
  <img src="./assets/bridge.png" width="300">
</p>

Create a bidge with the ip of your container and port `8080`

<p align="left">
  <img src="./assets/bridge-config.png" width="300">
</p>

Create a cron initiated job that runs the kava adapter and specifies the market you are posting prices for:

```json
{
  "initiators": [
    {
      "type": "cron",
      "params": {
        "schedule": "CRON_TZ=UTC */30 * * * * *"
      }
    }
  ],
  "tasks": [
    {
      "type": "kava-adapter",
      "params": {
        "post": "http://172.20.0.2:8080",
        "market": "bnb:usd",
        "headers": { "Content-Type": ["application/json"] }
      }
    }
  ]
}
```

## Input Params

- `market`: The marketID of the market on kava you are posting prices for

## Output

```json
{
  "jobRunID": "563e0f2c7a9944a0aeefee00b3706573",
  "data": {
    "market": "bnb:usd",
    "price": "16.612400000000000944",
    "tx_hash": "2816494D0EA89068FA9F1314568CA17E3DD79651ED54168414E4CBD1D664B7EF",
    "result": "posted price"
  },
  "result": "posted price",
  "statusCode": 200
}
```

Or (when the price deviation is too small to require posting a new price)

```json
{
  "jobRunID": "59c03a1d8f3c4f9fade480376b9cbe48",
  "data": {
    "market": "bnb:usd",
    "price": undefined,
    "tx_hash": undefined,
    "result": "price update not required"
  },
  "result": "price update not required",
  "statusCode": 200
}
```
