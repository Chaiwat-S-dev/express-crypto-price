const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const { Level } = require('level')

const app = express();
const db = new Level('./price-cache', { valueEncoding: 'json' });

async function setCache(key, value, ttl) {
  const expiration = Date.now() + ttl * 1000;
  await db.put(key, { value, expiration });
}

async function getCache(key) {
  try {
    const cachedData = await db.get(key);
    if (Date.now() < cachedData.expiration) {
      return cachedData.value;
    } else {
      // if time exceeded, then remove key from DB.
      await db.del(key);
      return null;
    }
  } catch (error) {
    if (error.notFound)
      return null;
    throw error;
  }
}

app.get('/price', async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol query parameter is required' });
  }

  try {
    const cachedPrice = await getCache(symbol);
    if (cachedPrice !== null) {
      return res.json({ symbol, price: cachedPrice, source: 'cache' });
    }

    const quote = await yahooFinance.quote(symbol);
    const price = quote?.regularMarketPrice;

    if (price === undefined) {
      return res.status(404).json({ error: `No price found for symbol ${symbol}` });
    }
    
    // Set result in levelDB for 5 mins.
    await setCache(symbol, price, 300);

    return res.json({ symbol, price, source: 'yahoo' });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching stock price', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
