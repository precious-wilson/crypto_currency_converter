import CurrencyConverter from "./components/CurrencyConverter"
import CryptoLinks from "./components/CryptoLinks"
{/*make containers*/}
{/*label everything*/}


//API endpoint outside the component
const API_URL = "https://m7vkfdn39b.execute-api.eu-west-1.amazonaws.com/prod/convert";

//Helper function to log conversions to your AWS backend
const convertCurrency = async (from, to, amount, result) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount, result })
    });
    const data = await response.json();
    console.log("Logged to cloud database:", data);
  } catch (err) {
    console.error("Conversion logging failed:", err);
  }
};


function App() {
  return (
    <div className="app">
      {/* Pass the cloud logger down as a prop so your converter can use it */}
      <CurrencyConverter onLogToCloud={convertCurrency} /> 
      <CryptoLinks />
    </div>
  );
}



export default App
