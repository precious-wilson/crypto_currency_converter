
import axios from "axios";
import { useEffect, useState } from "react";

const API_KEY = process.env.REACT_APP_FINNHUB_KEY;

function CryptoLinks({ showNews }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        "https://finnhub.io/api/v1/news",
        {
          params: {
            category: "general",
            token: API_KEY,
          },
        }
      );

      const keywords = [
        "stock",
        "stock market",
         "stocks",
        "etf",
        "nasdaq",
        "s&p",
        "ai",
        "artificial intelligence",
        "nvidia",
        "tesla",
        "bitcoin",
        "crypto",
        "earnings",
        "crash",
        "interest rate",
        "inflation",
        "bond"
       
      ];

  const blockedKeywords = [
  "senate",
  "watch collection",
  "senator",
  "congress",
  "supreme court",
  "president",
  "presidential",
  "democrat",
  "republican",
  "trump",
  "election",
  "midterm",
  "white house",
  "politician",
  "politics",
  "iran",
  "iraq",
  "yemen",
  "political",
  "justice",
  "war",
  "iran",
  "protest",
  "arrested",
  "bail",
  "israel",
  "fly",
  "sales"

];

      const articles = response.data
        .filter(article => {
          const text = (
            article.headline +
            " " +
            article.summary
          ).toLowerCase();

          const isFinance = keywords.some(keyword =>
  text.includes(keyword)
);

const isBlocked = blockedKeywords.some(keyword =>
  text.includes(keyword)
);

return isFinance && !isBlocked;
        })
        .filter(article => article.headline && article.url)
        .slice(0, 20);

      setFeed(articles);
    } catch (error) {
      console.error("Finnhub news error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (showNews) fetchNews();
  }, [showNews]);

  if (!showNews) return null;

  return (
    <div className="newsfeed">

      {loading && <p>Loading latest market news...</p>}

      <div className="newslinks">

        {feed.map(article => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none",  Height: "25%", borderBottom: ".5px solid #8e939e"}}
>
            <div className="news-article">

              <div className="news-content">

                <h4 className="news-title">
                  {article.headline}
                </h4>

                {article.summary && (
                  <p className="news-description">
                    {article.summary}
                  </p>
                )}

              </div>

              {article.image && (
                <img
                  src={article.image}
                  alt={article.headline}
                  className="news-image"
                />
              )}

            </div>
          </a>
        ))}

      </div>
    </div>
  );
}

export default CryptoLinks;