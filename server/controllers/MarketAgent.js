const axios = require('axios');

// Using a specialized Financial Summarization model
const HF_MODEL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

const analyzeMarket = async () => {
  try {
    // 1. Fetch Raw Finance News
    const newsResponse = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: 'business',
        language: 'en',
        apiKey: process.env.NEWS_API_KEY // Store this in your .env
      }
    });

    // Take top 3 to stay within free tier limits
    const articles = newsResponse.data.articles.slice(0, 3);

    // 2. Process with Hugging Face AI
    const insights = await Promise.all(articles.map(async (article) => {
      const inputContent = article.description || article.title;
      
      const aiResponse = await axios.post(
        HF_MODEL,
        { inputs: inputContent },
        { headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` } }
      );

      return {
        headline: article.title,
        aiInsight: aiResponse.data[0].summary_text,
        sourceUrl: article.url,
        sourceName: article.source.name,
        timestamp: article.publishedAt
      };
    }));

    return insights;
  } catch (error) {
    console.error("Agent Error:", error.response?.data || error.message);
    return [];
  }
};

module.exports = { analyzeMarket };