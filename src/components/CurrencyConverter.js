import { useState, useEffect } from 'react'; // import useEffect
import axios from 'axios'
import ExchangeRate from './ExchangeRate'
import CryptoLinks from "./CryptoLinks";


function CurrencyConverter(){
  
  const currencyMap = { //hashmap / dictionary of ALL currencies
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    USD: 'US Dollar',
    EUR: 'Euro',
    NGN: 'Naira'
  }

const [coins, setCoins] = useState([]); // store top 30 coins

useEffect(() => {
  const fetchTopCoins = async () => {
    try {
      const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 30,
          page: 1,
          sparkline: false
        }
      });
      setCoins(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchTopCoins();
}, []);


  const fiatCurrencies = ['USD', 'EUR', 'NGN'];  //hashmap / dictionary of fiat currencies


  const currencies = Object.keys(currencyMap)  // creates an array of all the keys in your object. -  ['BTC', 'ETH', 'USDT'] 

  const [option_a, setOption_A] = useState('bitcoin')
  const [option_b, setOption_B] = useState('bitcoin')  //i wanted it start at naira as thats my preferred currency to exchange ..easier for me
  const [number_a, setAmount] = useState(1)
  const [result, setResult] = useState(1)
  const [rate, setRate] = useState('')
  const [showNews, setShowNews] = useState(false);
  const [rateCache, setRateCache] = useState({}); // set cache results

  const filter = (key) => { //return the value based on what key was chosen
   return currencyMap[key] 
  }
const convert = async (
  amount = number_a,
  from = option_a,
  to = option_b
) => {
  let exchangeRate;

  // Same currency
  if (from === to) {
    if (!amount || isNaN(amount)) {
      setResult('');
      setRate('');
      return;
    }

    setResult(amount);
    setRate(
      `1 ${currencyMap[from] || from.toUpperCase()} = 1 ${
        currencyMap[to] || to.toUpperCase()
      }`
    );

    return;
  }

  const cacheKey = `${from}_${to}`;

  // Check cache
  if (rateCache[cacheKey]) {
    const cachedRate = rateCache[cacheKey];

    setResult(cachedRate * amount);

    const fromName =
      currencyMap[from] ||
      coins.find(c => c.id === from)?.name ||
      from.toUpperCase();

    const toName =
      currencyMap[to] ||
      coins.find(c => c.id === to)?.name ||
      to.toUpperCase();

    setRate(`1 ${fromName} = ${cachedRate} ${toName}`);

    return;
  }

  try {
    const isFromCrypto = !!coins.find(c => c.id === from);
    const isToCrypto = !!coins.find(c => c.id === to);

    // =========================
    // CRYPTO → FIAT
    // =========================
    if (isFromCrypto && !isToCrypto) {

      const coin = coins.find(c => c.id === from);

      if (!coin) {
        throw new Error("Crypto not found");
      }

      const response = await axios.get(
        `https://api.coinpaprika.com/v1/tickers/${coin.symbol.toLowerCase()}-${coin.name
          .toLowerCase()
          .replace(/\s+/g, "-")}?quotes=USD`
      );

      const cryptoUsd =
        response.data?.quotes?.USD?.price;

      if (!cryptoUsd) {
        throw new Error("Crypto price unavailable");
      }

      // USD → fiat
      if (to === "USD") {
        exchangeRate = cryptoUsd;
      } else {
        const fiatResponse = await axios.get(
          `https://api.frankfurter.dev/v2/rate/USD/${to}`
        );

        const usdToFiat = fiatResponse.data?.rate;

        if (!usdToFiat) {
          throw new Error("Fiat rate unavailable");
        }

        exchangeRate = cryptoUsd * usdToFiat;
      }
    }

    // =========================
    // FIAT → FIAT
    // =========================
    else if (!isFromCrypto && !isToCrypto) {

      if (from === to) {
        exchangeRate = 1;
      } else {
        const response = await axios.get(
          `https://api.frankfurter.dev/v2/rate/${from}/${to}`
        );

        exchangeRate = response.data?.rate;
      }
    }

    // =========================
    // CRYPTO → CRYPTO
    // =========================
    else if (isFromCrypto && isToCrypto) {

      const fromCoin = coins.find(c => c.id === from);
      const toCoin = coins.find(c => c.id === to);

      if (!fromCoin || !toCoin) {
        throw new Error("Crypto not found");
      }

      const fromResponse = await axios.get(
        `https://api.coinpaprika.com/v1/tickers/${fromCoin.symbol.toLowerCase()}-${fromCoin.name
          .toLowerCase()
          .replace(/\s+/g, "-")}?quotes=USD`
      );

      const toResponse = await axios.get(
        `https://api.coinpaprika.com/v1/tickers/${toCoin.symbol.toLowerCase()}-${toCoin.name
          .toLowerCase()
          .replace(/\s+/g, "-")}?quotes=USD`
      );

      const fromUsd =
        fromResponse.data?.quotes?.USD?.price;

      const toUsd =
        toResponse.data?.quotes?.USD?.price;

      if (!fromUsd || !toUsd) {
        throw new Error("Crypto price unavailable");
      }

      exchangeRate = fromUsd / toUsd;
    }

    // =========================
    // FIAT → CRYPTO
    // =========================
    else if (!isFromCrypto && isToCrypto) {

      const coin = coins.find(c => c.id === to);

      if (!coin) {
        throw new Error("Crypto not found");
      }

      const cryptoResponse = await axios.get(
        `https://api.coinpaprika.com/v1/tickers/${coin.symbol.toLowerCase()}-${coin.name
          .toLowerCase()
          .replace(/\s+/g, "-")}?quotes=USD`
      );

      const cryptoUsd =
        cryptoResponse.data?.quotes?.USD?.price;

      if (!cryptoUsd) {
        throw new Error("Crypto price unavailable");
      }

      let fiatToUsd;

      if (from === "USD") {
        fiatToUsd = 1;
      } else {
        const fiatResponse = await axios.get(
          `https://api.frankfurter.dev/v2/rate/${from}/USD`
        );

        fiatToUsd = fiatResponse.data?.rate;
      }

      if (!fiatToUsd) {
        throw new Error("Fiat rate unavailable");
      }

      exchangeRate = fiatToUsd / cryptoUsd;
    }

    if (
      exchangeRate == null ||
      isNaN(exchangeRate)
    ) {
      setResult('');
      setRate('Exchange rate unavailable');
      return;
    }

    // Save rate
    setRateCache(prev => ({
      ...prev,
      [cacheKey]: exchangeRate
    }));

    // Calculate result to 2 decimal places
    setResult(Number((exchangeRate * amount).toFixed(2)));

    const fromName =
      currencyMap[from] ||
      coins.find(c => c.id === from)?.name ||
      from.toUpperCase();

    const toName =
      currencyMap[to] ||
      coins.find(c => c.id === to)?.name ||
      to.toUpperCase();

    setRate(
      `1 ${fromName} = ${exchangeRate} ${toName}`
    );

  } catch (error) {
    console.error("Conversion failed:", error);

    setResult('');
    setRate('Exchange rate unavailable');
  }
};
    // useEffect -- on load of component, and when dependencies change
  useEffect(() => {
  const timeoutId = setTimeout(() => {
    convert(number_a, option_a, option_b); // call convert after user stops typing
  }, 100); // 500ms delay (half a second)

  return () => clearTimeout(timeoutId); // cleanup if user types again
}, [number_a, option_a, option_b]);


  return(   

    <div className="currency-converter">  {/* className is used instead of class in React*/}
    <nav><li onClick={() => setShowNews(prev => !prev)}>Latest Crypto News</li></nav>
      <CryptoLinks showNews={showNews} />
   
      <label className="heading" style={{ color: 'white'  }}>Crypto Currency Converter</label>
      <label className="title" style={{ color: 'white' }}>
        Check live foreign currency exchange rates</label>

      <div className="currency-A">  {/* contains all. elements */}

        <div className="holder_container"> {/* contains the 2 holders */}
          <div className='holder_group'>
            <label htmlFor="from">From</label>
              <div className="holder">
              <input type="number" id="from" name="innitialcurrency" value={number_a} onChange={(e) => setAmount(Number(e.target.value))} />
              
              <select className= "select_options"  name="selected_option"  value={option_a} id="currency_choice" 
              //value i.e option select result will now show as the va;ue option i.e choice of wanted option/ selected opion and stay there abd update 
              onChange={(e) => {setOption_A(e.target.value);}}>   {/* currency = ['BTC', 'ETH', 'USDT'] index = position 0,1,2 */}
                        
              {fiatCurrencies.map(fiat => ( <option key={fiat} value={fiat}>{fiat}</option>))}
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol.toUpperCase()} - {coin.name}
                  </option>))}                                                                                           
              </select>
          </div> {/* end of holder */}

          </div> {/* end of holder group */}
          <div className='holder_group'>
              <label htmlFor="to">To</label> 
               <div className="holder">
              
                  <input type="number" id = "to" name="second_input"   value={Number.isFinite(result) ? result : ''}  readOnly/> 
                    <select className="select_options2" name="option2"  id="currency_choice2" value={option_b} onChange={(e) => {setOption_B(e.target.value); }}>
                      {fiatCurrencies.map(fiat => ( 
                        <option key={fiat} value={fiat}>{fiat}</option>))}
                        {coins.map((coin) => ( 
                          <option key={coin.id} value={coin.id}>
                            {coin.symbol.toUpperCase()} - {coin.name}
                          </option>))}
                    </select>                        
              </div>{/* end of holder */}
          </div>  {/* end of holder group */}

        
         <div className= "exchange" id="exchange">             {/* exchange rate component */}
            <ExchangeRate rate={rate}/>     {/* passed in the rate variable to be used in the exchange component */}
          </div>
          </div> {/* end of holder container */}
          </div>

      <div className='bluebox'>
        <a href="https://www.livecoinwatch.com/">Click To See The Live Exchange Rates</a>
      </div>
    </div>
  )
}

export default CurrencyConverter
