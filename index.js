const yahooFinance = require('yahoo-finance2').default;
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

async function getStockSummary(ticker) {
  try {
    const result = await yahooFinance.quoteSummary(ticker, { modules: ['price'] });
    const { regularMarketOpen, regularMarketPreviousClose, regularMarketDayLow, regularMarketDayHigh } = result.price;
    return {
      open: regularMarketOpen,
      close: regularMarketPreviousClose,
      low: regularMarketDayLow,
      high: regularMarketDayHigh
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
}

async function sendStockSummary(summary, phoneNumber) {
    const params = {
      Message: summary,
      PhoneNumber: phoneNumber
    };
  
    try {
      const result = await sns.publish(params).promise();
      console.log(`Message sent to ${params.PhoneNumber}:`, result);
    } catch (error) {
      console.error(`Failed to send message:`, error);
    }
}

exports.handler = async (event) => {
  const sp500 = await getStockSummary('^GSPC');
  const nasdaq = await getStockSummary('^IXIC');
  const nikkei = await getStockSummary('^N225');
  const phoneNumber = '+8201039326193';

  const summaries = {
    sp500: `S&P 500\n\n시가: ${sp500.open}\n종가: ${sp500.close}\n최저가: ${sp500.low}\n최고가: ${sp500.high}`,
    nasdaq: `나스닥\n\n시가: ${nasdaq.open}\n종가: ${nasdaq.close}\n최저가: ${nasdaq.low}\n최고가: ${nasdaq.high}`,
    nikkei: `닛케이 255\n\n시가: ${nikkei.open}\n종가: ${nikkei.close}\n최저가: ${nikkei.low}\n최고가: ${nikkei.high}`
  };

  console.log(summaries.sp500);
  console.log("\n" + summaries.nasdaq);
  console.log("\n" + summaries.nikkei);

  await sendStockSummary(summaries.sp500, phoneNumber);
  await sendStockSummary(summaries.nasdaq, phoneNumber);
  await sendStockSummary(summaries.nikkei, phoneNumber);

  return {
    statusCode: 200,
    body: JSON.stringify(summaries),
  };
};
