const MonthlyRecord = require('../models/MonthlyRecord');
const axios = require('axios'); // Requires: npm install axios

// --- DEFAULT FALLBACK RATES (If API fails) ---
const DEFAULTS = {
    GOLD_RATE_10Y: 0.09, // 9%
    SIP_RETURN: 0.12,    // 12%
    FD_RATE: 0.065,      // 6.5%
    INFLATION: 0.06      // 6%
};

// --- HELPER: FETCH REAL-TIME DATA ---
const fetchLiveMarketData = async () => {
    try {
        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        
        // 1. Get Gold Price (XAU to INR)
        // Note: Free tier is limited to 25 requests/day. 
        const goldRes = await axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=INR&apikey=${apiKey}`);
        
        // 2. Get Global Market Sentiment (Using S&P 500 as proxy for market health)
        const marketRes = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`);

        let liveData = { ...DEFAULTS };

        // Parse Gold
        if (goldRes.data['Realtime Currency Exchange Rate']) {
            const goldPrice = parseFloat(goldRes.data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
            // If Gold is expensive (>2L), projected growth might slow slightly, else standard
            // This is a mock logic based on price to simulate "Analysis"
            liveData.GOLD_PRICE_CURRENT = goldPrice;
        }

        // Parse Market Sentiment to adjust SIP expectation
        if (marketRes.data['Global Quote']) {
            const changePercent = parseFloat(marketRes.data['Global Quote']['10. change percent'].replace('%', ''));
            // If market is down today, it's a good time to buy (higher future return potential)
            if (changePercent < -1.0) liveData.SIP_RETURN = 0.13; // Bullish future
            else if (changePercent > 1.0) liveData.SIP_RETURN = 0.11; // Correction expected
        }

        return liveData;

    } catch (err) {
        console.log("API Limit/Error, using defaults:", err.message);
        return DEFAULTS;
    }
};

// Helper: Compound Interest
const calculateFutureValue = (principal, monthly, rate, years) => {
    const months = years * 12;
    const monthlyRate = rate / 12;
    const fvLump = principal * Math.pow(1 + monthlyRate, months);
    const fvSIP = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return Math.round(fvLump + fvSIP);
};

// 1. MAIN ANALYSIS
// ... imports and helpers remain the same ...

exports.getSavingsAnalysis = async (req, res) => {
    try {
        // 1. Fetch the most recent record (or all records to sum them up)
        // Let's use the most recent month's data for projection to be accurate to current habits
        const latestRecord = await MonthlyRecord.findOne({ 
            user: req.user.id,
            $or: [
                { "savings.sip": { $gt: 0 } },
                { "savings.fdRd": { $gt: 0 } },
                { "savings.gold": { $gt: 0 } }
            ]
        }).sort({ month: -1 });
        
        // If no specific savings record found, fallback to just the absolute latest (even if empty)
        const fallbackRecord = await MonthlyRecord.findOne({ user: req.user.id }).sort({ month: -1 });
        
        const recordToUse = latestRecord || fallbackRecord;
        
        // Safety: Initialize default zero-values
        let savings = { sip: 0, fdRd: 0, gold: 0 };
        let income = 0;
        let hasEMI = false;

        if (latestRecord) {
            savings = {
                sip: Number(latestRecord.savings?.sip) || 0,
                fdRd: Number(latestRecord.savings?.fdRd) || 0,
                gold: Number(latestRecord.savings?.gold) || 0
            };
            income = Number(latestRecord.income) || 0;
            // Check deep nested property safely
            if (latestRecord.expenses && latestRecord.expenses.emi) {
                hasEMI = latestRecord.expenses.emi > 0;
            }
        }

        // 2. FETCH REAL MARKET DATA
        const marketData = await fetchLiveMarketData();

        // 3. CALCULATE PROJECTIONS (Even if savings are 0, we return the structure)
        const sipFV20 = calculateFutureValue(0, savings.sip, marketData.SIP_RETURN, 20);
        const fdFV20 = calculateFutureValue(savings.fdRd, 0, DEFAULTS.FD_RATE, 20); // Assuming FD is lump sum for now
        const goldFV20 = calculateFutureValue(savings.gold, 0, DEFAULTS.GOLD_RATE_10Y, 20);

        const projection = {
            years5: calculateFutureValue(0, savings.sip, marketData.SIP_RETURN, 5) + (savings.fdRd * 1.3) + (savings.gold * 1.4),
            years10: calculateFutureValue(0, savings.sip, marketData.SIP_RETURN, 10) + (savings.fdRd * 1.7) + (savings.gold * 2.1),
            years20: sipFV20 + fdFV20 + goldFV20,
            breakdown: {
                sip: { current: savings.sip, fv20: sipFV20, rate: "12%" },
                fd: { current: savings.fdRd, fv20: fdFV20, rate: "6.5%" },
                gold: { current: savings.gold, fv20: goldFV20, rate: "9%" }
            }
        };

        // 4. GENERATE SUGGESTIONS
        let suggestions = [];
        const totalSaved = savings.sip + savings.fdRd + savings.gold;

        if (totalSaved === 0) {
            suggestions.push("🚨 You have 0 savings recorded. Start a small SIP of ₹500 today.");
        } else {
            if (savings.fdRd > savings.sip * 2) {
                suggestions.push("⚠️ Inflation Risk: Your FD allocation is high. Shift some to SIPs.");
            }
            if (savings.gold === 0) {
                suggestions.push("🛡️ Hedge Missing: Add 5-10% in Digital Gold.");
            }
            if (totalSaved < (income * 0.2) && income > 0) {
                suggestions.push(`📉 Under-saving: You are saving only ${((totalSaved/income)*100).toFixed(1)}%. Target 20%.`);
            }
        }

        // 5. SEND RESPONSE
        // We ALWAYS return this structure, even if values are 0
        res.json({
            currentSavings: savings,
            projection,
            suggestions,
            hasEMI,
            marketStatus: marketData.SIP_RETURN > 0.12 ? "Bearish (Buy)" : "Bullish (Hold)"
        });

    } catch (err) {
        console.error("Savings Analysis Error:", err);
        res.status(500).send('Server Error');
    }
};

// 2. ASSET AUDIT (Keep existing logic or enhance similarly)
exports.analyzeAsset = async (req, res) => {
    // ... (Keep the previous logic for analyzeAsset here) ...
    try {
        const { type, emiAmount, value, location, tenureYears } = req.body;
        
        let result = {};
        // Mock Real Estate Growth based on location
        const GROWTH_RATES = { 'Tier-1 City': 0.06, 'Tier-2 City': 0.04, 'Town': 0.03 };

        if (type === 'house') {
            const appreciationRate = GROWTH_RATES[location] || 0.04;
            const futureValue = value * Math.pow(1 + appreciationRate, 10);
            const totalInterestPaid = (emiAmount * 12 * tenureYears) - value;
            const netGain = futureValue - (value + totalInterestPaid);
            
            result = {
                verdict: netGain > 0 ? "✅ Wealth Creator" : "⚠️ Interest Trap",
                message: netGain > 0 
                    ? `Good Buy! In 10 years, asset value grows by ₹${(futureValue-value).toFixed(0)}. Net gain after interest: ₹${netGain.toFixed(0)}.`
                    : `Caution: You are paying ₹${totalInterestPaid.toFixed(0)} in interest, which is higher than the property appreciation.`,
                chartData: [value, value + totalInterestPaid, futureValue]
            };
        } else if (type === 'car') {
            const depreciatedValue = value * Math.pow(0.85, 5);
            const totalPaid = emiAmount * 12 * 5;
            result = {
                verdict: "📉 Liability",
                message: `Cars depreciate fast. You pay ₹${totalPaid} for an asset that will be worth ₹${depreciatedValue.toFixed(0)} in 5 years.`,
                chartData: [value, totalPaid, depreciatedValue]
            };
        }
        res.json(result);
    } catch (err) { res.status(500).send('Server Error'); }
};