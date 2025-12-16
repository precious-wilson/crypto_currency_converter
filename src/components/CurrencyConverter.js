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

  const coinGeckoMap = { //hashmap / dictionary of crypto-currencies
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether'
};


  const fiatCurrencies = ['USD', 'EUR', 'NGN'];  //hashmap / dictionary of fiat currencies


  const currencies = Object.keys(currencyMap)  // creates an array of all the keys in your object. -  ['BTC', 'ETH', 'USDT'] 

  const [option_a, setOption_A] = useState('BTC')
  const [option_b, setOption_B] = useState('ETH')  //i wanted it start at naira as thats my preferred currency to exchange ..easier for me
  const [number_a, setAmount] = useState(1)
  const [result, setResult] = useState(1)
  const [rate, setRate] = useState('')
  const [showNews, setShowNews] = useState(false);
  const [rateCache, setRateCache] = useState({}); // set cache results

  const filter = (key) => { //return the value based on what key was chosen
   return currencyMap[key] 
  }

  const convert = async (amount = number_a, from = option_a, to = option_b) => {
    // when from currency Same as to currency return and set rate to 1:1
   if (from === to) {
    if (!amount || isNaN(amount)) {
      setResult('');
      setRate('');
      return;
    }
    setResult(amount);
    setRate(`1 ${currencyMap[from]} = 1 ${currencyMap[to]}`);
    return;
}

    const cacheKey = `${from}_${to}`;

    // 2️⃣ Check cache first
    if (rateCache[cacheKey]) 
    {
      const cachedRate = rateCache[cacheKey];
      setResult(cachedRate * amount);
      setRate(`1 ${currencyMap[from]} = ${cachedRate} ${currencyMap[to]}`);
      return;
    }
    
    try 
    {
      let exchangeRate;
      const isFromCrypto = coinGeckoMap[from];
      const isToCrypto = coinGeckoMap[to];

 //Crypto → Anything (CoinGecko)
      if (isFromCrypto && !isToCrypto) 
      {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: coinGeckoMap[from],
              vs_currencies: to.toLowerCase()
            }
          }
        );

      exchangeRate =
        response.data[coinGeckoMap[from]][to.toLowerCase()];
    }

      // 4️⃣ Fiat → Fiat (exchangerate.host - latest endpoint)
    else if (!isFromCrypto && !isToCrypto) {
      const response = await axios.get( 'https://api.exchangerate.host/latest', {params: {base: from, symbols: to}});
      exchangeRate = response.data?.rates?.[to];
    }

     // 5️⃣ Crypto → Crypto
    else if (isFromCrypto && isToCrypto) {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: coinGeckoMap[from],
            vs_currencies: to.toLowerCase()
          }
        }
      );

      exchangeRate =
        response.data[coinGeckoMap[from]][to.toLowerCase()];
    }

    // 6️⃣ Fiat → Crypto
    else if (!isFromCrypto && isToCrypto) {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: coinGeckoMap[to],
            vs_currencies: from.toLowerCase()
          }
        }
      );

      const priceInFiat =
        response.data[coinGeckoMap[to]][from.toLowerCase()];

      exchangeRate = 1 / priceInFiat;
    }

    // Save to cache
    setRateCache(prev => ({
      ...prev,
      [cacheKey]: exchangeRate
    }));

    if (exchangeRate == null || isNaN(exchangeRate)) {
      setResult('');
      setRate('Exchange rate unavailable');
      return;
}

    setResult(exchangeRate * amount);
    setRate(`1 ${currencyMap[from]} = ${exchangeRate} ${currencyMap[to]}`);

    } 
    catch (error) {
      console.error("Conversion failed:", error);
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
            <label>From</label>
            <div className="holder">
            
              
              <input type="number" name="innitialcurrency" value={number_a} onChange={(e) => setAmount(Number(e.target.value))} />
              
              <select className= "select_options"  name="selected_option"  value={option_a} id="currency_choice" 
              //value i.e option select result will now show as the va;ue option i.e choice of wanted option/ selected opion and stay there abd update 
              onChange={(e) => {setOption_A(e.target.value);}}>   {/* currency = ['BTC', 'ETH', 'USDT'] index = position 0,1,2 */}
                        
                {currencies.map((currency, _index) =>( 
                <option key={_index}   id={currency}   value={currency}>
                <span style = {{fontSize:'13px'}}>
                  {currency}</span> - {currencyMap[currency] }  {/* Display the full name */}
                </option>  
                ))}  {/* each item in an option needs a key */}  
                                                                                                                        
              </select>
                    
            </div>

          </div>
          <div className='holder_group'>
             <label >To</label>
              <div className="holder">   
                  <input type="number" name="second_input"   value={Number.isFinite(result) ? result : ''}  readOnly/> 
                    <select className="select_options2" 
                            name="option2"  id="currency_choice2" value={option_b} onChange={(e) => {setOption_B(e.target.value); }}>
                            {currencies.map((currency, _index) => (
                              <option key={_index} value={currency}> 
                                 <span style = {{fontSize:'13px'}}>
                                  {currency}</span> - {currencyMap[currency]}  {/* Display the full name */}
                              </option>
                            ))}  
                    </select>                        
              </div>{/* end of holder */}
            </div>

        </div> {/* end of input container */}

    
          <div className= "exchange" id="exchange">             {/* exchange rate component */}
            <ExchangeRate rate={rate}/>     {/* passed in the rate variable to be used in the exchange component */}
            <button id="converter"  onClick={() => convert(number_a, option_a, option_b)}>Convert</button>
          </div>
      
      </div>{/* end of currency A */}

      <div className='bluebox'>
        <a href="https://www.livecoinwatch.com/">Click To See The Live Exchange Rates</a>
      </div>
    </div>
  )
}

export default CurrencyConverter
