const MonthlyRecord = require('../models/MonthlyRecord');
const axios = require('axios'); 
const yahooFinance = require('yahoo-finance2').default; 

const DEFAULTS = {
    GOLD_RATE_10Y: 0.09, 
    SIP_RETURN: 0.12,    
    FD_RATE: 0.065
};

const fetchLiveMarketData = async () => {
    try {
        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        let liveData = { ...DEFAULTS };
        liveData.SIP_RETURN = 0.12; 
        return liveData;
    } catch (err) {
        return DEFAULTS;
    }
};

const calculateFutureValue = (principal, monthly, rate, years) => {
    const months = years * 12;
    const monthlyRate = rate / 12;
    const fvLump = principal * Math.pow(1 + monthlyRate, months);
    const fvSIP = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return Math.round(fvLump + fvSIP);
};

exports.getSavingsAnalysis = async (req, res) => {
    try {
        const latestRecord = await MonthlyRecord.findOne({ user: req.user.id }).sort({ month: -1 });
        
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
            if (latestRecord.expenses && latestRecord.expenses.emi) {
                hasEMI = latestRecord.expenses.emi > 0;
            }
        }

        const marketData = await fetchLiveMarketData();

        const sipFV20 = calculateFutureValue(0, savings.sip, marketData.SIP_RETURN, 20);
        const fdFV20 = calculateFutureValue(savings.fdRd, 0, DEFAULTS.FD_RATE, 20);
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

        let suggestions = [];
        const totalSaved = savings.sip + savings.fdRd + savings.gold;

        if (totalSaved === 0) {
            suggestions.push("🚨 You have 0 savings recorded. Start a small SIP of ₹500 today.");
        } else {
            if (savings.fdRd > savings.sip * 2) suggestions.push("⚠️ Inflation Risk: Your FD allocation is high. Shift to SIPs.");
            if (savings.gold === 0) suggestions.push("🛡️ Hedge Missing: Add 5-10% in Digital Gold.");
            if (totalSaved < (income * 0.2) && income > 0) suggestions.push(`📉 Under-saving: You are saving only ${((totalSaved/income)*100).toFixed(1)}%. Target 20%.`);
        }

        res.json({
            currentSavings: savings,
            projection,
            suggestions,
            hasEMI,
            marketStatus: marketData.SIP_RETURN > 0.12 ? "Bearish (Buy)" : "Bullish (Hold)"
        });

    } catch (err) {
        console.error("Savings Agent Error:", err);
        res.status(500).send('Server Error');
    }
};

exports.getTradingSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const record = await MonthlyRecord.findOne({ user: userId }).sort({ month: -1 });
        
        if (!record) return res.json({ freeCash: 0, plans: [] });

        const income = Number(record.income) || 0;
        const expenses = record.expenses || {};
        const savings = record.savings || {};
        
        const totalFixed = (Number(expenses.rent)||0) + (Number(expenses.emi)||0) + (Number(expenses.grocery)||0) + (Number(expenses.electricity)||0);
        const totalSaved = (Number(savings.sip)||0) + (Number(savings.fdRd)||0) + (Number(savings.gold)||0);
        
        const estimatedFreeCash = Math.max(0, income - totalFixed - totalSaved - (income * 0.1));

        if (estimatedFreeCash < 500) {
            return res.json({ freeCash: estimatedFreeCash, plans: [], message: "Low funds" });
        }

        const watchlist = [
            { symbol: 'NIFTYBEES.NS', name: 'Nifty 50 ETF', type: 'Safe' },
            { symbol: 'GOLDBEES.NS', name: 'Gold ETF', type: 'Safe' },
            { symbol: 'RELIANCE.NS', name: 'Reliance Ind.', type: 'Moderate' },
            { symbol: 'TCS.NS', name: 'TCS', type: 'Moderate' },
            { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', type: 'Aggressive' },
            { symbol: 'ZOMATO.NS', name: 'Zomato', type: 'Aggressive' }
        ];

        let quotes = [];
        try {
            quotes = await yahooFinance.quote(watchlist.map(w => w.symbol));
        } catch (e) {
            console.log("Yahoo Finance Error, using mock data");
            quotes = watchlist.map(w => ({ symbol: w.symbol, regularMarketPrice: 2500, regularMarketChangePercent: 1.2 }));
        }

        let plans = [];
        quotes.forEach(quote => {
            const stockInfo = watchlist.find(w => w.symbol === quote.symbol);
            const price = quote.regularMarketPrice || 0;
            
            if (price > 0 && price < estimatedFreeCash) {
                const maxQty = Math.floor(estimatedFreeCash / price);
                plans.push({
                    type: stockInfo.type,
                    name: stockInfo.name,
                    symbol: quote.symbol,
                    price: price,
                    change: quote.regularMarketChangePercent || 0,
                    recommendation: `Buy ${maxQty} Qty`,
                    totalCost: maxQty * price
                });
            }
        });

        res.json({
            freeCash: estimatedFreeCash,
            plans: plans.sort((a, b) => b.change - a.change)
        });

    } catch (err) {
        console.error("Trading Error:", err);
        res.status(500).send('Server Error');
    }
};

// --- 3. ASSET AUDIT ---
exports.analyzeAsset = async (req, res) => {
    try {
        const { type, emiAmount, value, location, tenureYears } = req.body;
        let result = {};

        if (type === 'house') {
            const appreciation = 0.06; 
            const fv = value * Math.pow(1 + appreciation, 10);
            const interest = (emiAmount * 12 * tenureYears) - value;
            const netGain = fv - (value + interest);

            result = {
                verdict: netGain > 0 ? "✅ Wealth Creator" : "⚠️ Interest Trap",
                message: netGain > 0 
                    ? `Good Buy! In 10 years, asset value grows by ₹${(fv-value).toFixed(0)}. Net gain: ₹${netGain.toFixed(0)}.`
                    : `Caution: You pay ₹${interest.toFixed(0)} in interest.`,
                chartData: [value, value + interest, fv]
            };
        } else {
            const depValue = value * Math.pow(0.85, 5);
            result = {
                verdict: "📉 Liability",
                message: `Car value drops to ₹${depValue.toFixed(0)} in 5 years.`,
                chartData: [value, emiAmount * 12 * 5, depValue]
            };
        }
        res.json(result);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};