const { Requester, Validator } = require('@chainlink/external-adapter')
const { PriceOracle } = require('@kava-labs/kava-tools')

const customParams = {
  market: ['market']
}

const createRequest = async (input, callback) => {
  // Load environment variables
  const lcdURL = process.env.LCD_URL
  const mnemonic = process.env.MNEMONIC
  const expiry = process.env.EXPIRY
  const expiryThreshold = process.env.EXPIRY_THRESHOLD
  const deviation = process.env.DEVIATION
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id

  // Initiate price oracle
  const oracle = new PriceOracle(
    validator.validated.data.market.split(','),
    expiry,
    expiryThreshold,
    deviation
  )
  try {
    await oracle.initClient(lcdURL, mnemonic)
  } catch (error) {
    callback(500, Requester.errored(jobRunID, error))
    return
  }
  const accountData = await oracle.client.getAccountData()
  const fetchedPrice = await oracle.fetchPrice(oracle.marketIDs[0])
  if (!fetchedPrice.success) {
    callback(500, Requester.errored(jobRunID, 'no price could be fetched'))
    return
  }
  const shouldPost = await oracle.validatePricePosting(
    oracle.marketIDs[0],
    fetchedPrice.price
  )
  if (!shouldPost) {
    const response = {
      data: {
        market: oracle.marketIDs[0],
        price: undefined,
        tx_hash: undefined,
        result: 'price update not required'
      },
      status: 200
    }
    callback(response.status, Requester.success(jobRunID, response))
    return
  }
  try {
    const txHash = await oracle.postNewPrice(
      fetchedPrice.price,
      oracle.marketIDs[0],
      accountData,
      0
    )
    const response = {
      data: {
        market: oracle.marketIDs[0],
        price: fetchedPrice.price,
        tx_hash: txHash,
        result: 'price updated'
      },
      status: 200
    }
    callback(response.status, Requester.success(jobRunID, response))
    return
  } catch (error) {
    callback(500, Requester.errored(jobRunID, error))
  }
}

module.exports.createRequest = createRequest
