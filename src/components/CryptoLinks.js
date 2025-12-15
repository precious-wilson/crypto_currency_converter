
import axios from 'axios'
import  {useEffect, useState } from 'react' 
const API_KEY = process.env.REACT_APP_MARKETAUX_KEY;



function CryptoLinks({ showNews })
{
  const [feed, setFeed] = useState([]);
  /*Added these 2 new state variables here below:*/
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => 
  {
    if (loading) return; // if already fetched, skip API call
    setLoading(true);
    setError(null);

    try 
    {
      const response = await axios.get(`https://api.marketaux.com/v1/news/all?api_token=${API_KEY}&search=crypto&limit=20&language=en`
);
      setFeed(response.data.data || []);
    } 
    catch (error) {
      console.error("Error fetching Marketaux news:", error);
      setError("Failed to load news. Try again later.");
    }
    finally {
        setLoading(false);
      }
  };


  useEffect(() => {
    if (showNews) fetchNews();
  }, [showNews]);

  if (!showNews) return null;


  const feed_set = feed?.slice(0,20)
  console.log(feed_set)
  console.log("Feed:", feed);
  return( <div className="newsfeed">
            <div className="newslinks">
              {feed_set?.map(article => (
                <a key={article.url} href={article.url}  style = {{textDecoration:'none'}}>
                  <div className="news-article">
                    <div className="news-content">
                      <h4  style = {{color:'rgba(61, 61, 61, 1)'}}className="news-title"> {article.title} </h4>
                      {article.description && (<p  style = {{color:'rgba(61, 61, 61, 1)', fontWeight:'500'}} className="news-description">{article.description}</p>)}
                      {article.published_at && ( <p style = {{color:'grey'}}className="news-date">{new Date(article.published_at).toLocaleString()}</p>)}
                    </div>
                    {article.image_url && (<img src={article.image_url} alt={article.title} className="news-image" />)}
                  </div>
                </a>
              ))}
       
            </div>
          </div>
        );
      };
  export default CryptoLinks 