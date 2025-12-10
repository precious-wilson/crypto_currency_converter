
import axios from 'axios'
import  {useEffect, useState } from 'react' 


function CryptoLinks (){

    const [feed, setFeed] = useState([]);
const news = async() => {

const options = {
  method: 'GET',
  url: 'https://h-crypto-news.p.rapidapi.com/cryptonews',
  headers: {
    
    'X-RapidAPI-Host': 'h-crypto-news.p.rapidapi.com',
    'X-RapidAPI-Key': process.env.REACT_APP_Rapid_API_Key
  }
}; 

try {
	const response = await axios.request(options);
    setFeed(response.data)
} catch (error) {
  console.log("error with responses..")
	console.error(error) }
}      
    
useEffect (() => { news() }, [] )

const feed_set = feed?.slice(0,7)
console.log(feed_set)

    return ( 
    
        <div className="newsfeed">
        <h3>NewsFeed</h3>
        <div className = "newslinks">

        {feed_set?.map((articles) => ( <a href = {articles.url} > <p> {articles.title} </p> </a>))}
        
        </div>
        </div>  
    )
    }
    export default CryptoLinks 