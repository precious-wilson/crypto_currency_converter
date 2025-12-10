import  { useState } from 'react'   //must be at the top!!
import axios from 'axios'
import ExchangeRate from './ExchangeRate'



function CurrencyConverter(){
  
  const currencyMap = { //hashmap / dictionary of currencies
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether'
  }

  const currencies = Object.keys(currencyMap)  // creates an array of all the keys in your object. -  ['BTC', 'ETH', 'USDT'] 


  const [option_a, setOption_A] = useState('BTC')
  const [option_b, setOption_B] = useState('BTC')  //i wanted it start at naira as thats my preferred currency to exchange ..easier for me
  const [number_a, setAmount] = useState(0)
  const [exchange, setExchange] = useState(0)
  const [result, setResult] = useState(0)
  const [rate, setRate] = useState('')


  const filter = (key) => { //return the value based on what key was chosen
   return currencyMap[key] 
}

const convert = async () => {
    const options = {
        method: 'GET',
        url: 'https://alpha-vantage.p.rapidapi.com/query',
        params: {
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: option_a,
          to_currency: option_b
        },
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_Rapid_API_Key,
          'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
        }
      }
      try {
          const response = await axios.request(options)
          setExchange(response.data['Realtime Currency Exchange Rate']['5. Exchange Rate'])
          setResult(response.data['Realtime Currency Exchange Rate']['5. Exchange Rate'] * number_a)    
      } 
      catch (error) {
          console.error(error);
      }
      setRate("1 " + filter( document.getElementById("currency_choice").value )  + " = " + exchange + " " + filter(document.getElementById("currency_choice2").value))
    }
    // you go thorugh domething which accesses the information and gives it to you i.e it has the right to 
    // access this information so then it gibves otj toy uoitself i.e you are not directly acessing this infromatio 
    // yourself

    return (
      
        <div className="currency-converter">
                                            {/* create a heading that will be read on this container */}
          <label><h3>Currency Converter</h3></label> 
    
        <div className="currency-A">     

       <div className = "container">
                                            {/*} for structural order so we doiong it as a table insteatd of directly   */}
         <table>    
                                            {/*next to eachother so it will be aliigned*/}
            <tbody>                           {/*in a table there is the heading and a body just to spoecify this is */}
                                             {/*the body as its a generic table for order rather than data cells*/}
             
                 <tr>                         {/*creates a row in the table*/}

                    
                    {/* <td>                      (1st data cell) 
                        <label id="primarylabel"> Primary Currency </label>   {/*add pink and white bubble font to te text*/}
                    {/* </td> */}
                    
                    <td>                        {/*(second data cell)*/}
                                                {/* The name attribute is how you reference the input, once the value from the input gets sent back to the server */}
                         <input type="number"   
                         name="innitialcurrency"  
                        value = {number_a}
                        onChange={(e) => setAmount(e.target.value)}
                         /> 
                         
                         {/*...(brocode handle error if they put a letter by mistake)*/}
                    </td>    
                    <td>

                        <select className= "select_options"  name = "selected_option"  value = {option_a} id = "currency_choice" //value i.e option select result will now show as the va;ue option i.e choice of wanted option/ selected opion and stay there abd update 
                    onChange={(e) => setOption_A(e.target.value)}>   

  
                      {/*currency = ['BTC', 'ETH', 'USDT'] index = position 0,1,2*/}
                       {currencies.map((currency, _index) =>(  
                        <option key = {_index} id = {currency} value = {currency} >  {/*each item in an ooption needs a key*/}
                          {currency} 
                        </option>)) }   
                                                                                          
                        </select>

                        {/*This is an array of your currency codes: ['BTC', 'ETH', 'USDT'].
                        map() = A JavaScript function that goes through every item in the array and creates something for each item.
                        Here, for each currency, it creates an <option> element.
                        currency = The current item in the array ('BTC', 'ETH', 'USDT').
                        _index = The position of the item in the array (0, 1, 2…).
                        Used as the React key, which helps React track elements efficiently */}
                        
       </td>
                    {/* </td>do again with add event listener */}
                    </tr>
            </tbody>
        </table>

        

        <div className="currency-B">
        <table>                                  
            <tbody>   

                 <tr>                         
                    {/* <td>                       
                         <label id="primarylabel">Secondary Currency</label>   add pink and white bubble font to te text */}
                                {/*try to add where the label changes to whatever currency is picked*/}
                    {/* </td> */}
                    <td>                       
                        <input type="number"
                         name="second_input"  
                         value = {result}      //the value of the input text box.. right now it is null
                         />
                    </td>

                    <td>
                        < select className="select_options2" name = "option2" id = "currency_choice2" value = {option_b} onChange={(e) => setOption_B(e.target.value)}>
                        { currencies.map ((currency, _index) => (
                          <option key = {_index} value={currency}> 
                            {currency} 
                          </option>) ) }  
                        </select>                        
                    </td>          
                     </tr> 
                       </tbody>
        </table>
        </div>
        </div>
        <button id = "converter" onClick = {convert}  > Convert  </button>

        </div>

        <div id = "exchange">
        {/* exchange rate component */}
            <ExchangeRate
            rate = {rate}
            />
            {/* passed in the rate variable to be used in the exchange component */}
            
        </div>

       </div>
    )
  }
  
  export default CurrencyConverter 

  {/*Event (e)

First you have e which is short for event. To understand what it does change onChange={(e)
 => setName(e.target.value)} to onChange={(e) => console.log(e)}. 
 Inspect the log and you'll find a list of events in which one of them is target.
  Open target (if not already opened) and within target, you'll find value. In short, 
  this is the target value that's being typed in your input, it's what the user is typing.

useState

Your using state to track the value in your input. 
So [name] is the getter and [setName] is the setter. 
If you notice in your alert you have alert(The name you entered was: ${name}). 
The variable name is the getter which means it holds the current value of the state. 
On the other hand setName will set that value. It's able to do so because you're setting and 
tracking the value here on change onChange={(e) => setName(e.target.value)}

means e is the event that is happening which here is change, 
target is the element that triggered the event, which here is the input, 
and value is the value of the input element Onchange is as the name suggests 
and setState is used to change the state you defined eariler 
you should read the documentation as well it would clear stuff up maybe an 
online explanation on youtube anyways all the best for your React journey
*/}