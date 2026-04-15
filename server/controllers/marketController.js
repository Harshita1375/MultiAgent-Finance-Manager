const axios = require('axios');

const HF_MODEL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

const analyzeMarket = async () => {
    try {
        const newsRes = await axios.get(
            `https://newsapi.org/v2/everything?domains=economictimes.indiatimes.com,business-standard.com,livemint.com&q=(Nifty OR Sensex OR "Stock Market" OR "RBI")&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
        );

        const articles = newsRes.data.articles
            .filter(art => art.title && !art.title.includes("WSJ") && !art.title.includes("Bloomberg"))
            .slice(0, 3);

        return await Promise.all(articles.map(async (art) => {
            try {
                const aiRes = await axios.post(
                    HF_MODEL,
                    {
                        inputs: `Summarize the impact of this news on the Indian economy: ${art.description || art.title}`,
                        parameters: { wait_for_model: true }
                    },
                    { headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` } }
                );

                return {
                    title: art.title,
                    insight: aiRes.data[0]?.summary_text || "Analyzing Indian market shift...",
                    url: art.url,
                    source: art.source.name
                };
            } catch (err) {
                return {
                    title: art.title,
                    insight: art.description || "Local market update. Visit source for details.",
                    url: art.url,
                    source: art.source.name
                };
            }
        }));
    } catch (err) {
        console.error("Indian Market Agent Error:", err);
        return [];
    }
};
module.exports = { analyzeMarket };