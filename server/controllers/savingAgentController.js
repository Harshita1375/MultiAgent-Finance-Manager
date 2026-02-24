const MonthlyRecord = require('../models/MonthlyRecord');
const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const DEFAULTS = {
    GOLD_RATE_10Y: 0.09, 
    SIP_RETURN: 0.12,    
    FD_RATE: 0.065
};

const fetchLiveMarketData = async () => {
    try {
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
        const { month, year } = req.query;
        const latestRecord = await MonthlyRecord.findOne({ user: req.user.id }).sort({ month: -1 });

        let analysisRecord;
        if (month && year) {
            const targetMonth = `${year}-${month}`;
            analysisRecord = await MonthlyRecord.findOne({ user: req.user.id, month: targetMonth });
        } else {
            analysisRecord = latestRecord;
        }
        
        let savings = { sip: 0, fdRd: 0, gold: 0 };
        let income = 0;
        let hasEMI = false;

        if (analysisRecord) {
            savings = {
                sip: Number(analysisRecord.savings?.sip) || 0,
                fdRd: Number(analysisRecord.savings?.fdRd) || 0,
                gold: Number(analysisRecord.savings?.gold) || 0
            };
            income = Number(analysisRecord.income) || 0;
            if (analysisRecord.expenses && analysisRecord.expenses.emi) {
                hasEMI = analysisRecord.expenses.emi > 0;
            }
        }

        let presentSavings = { sip: 0, fdRd: 0, gold: 0 };
        if (latestRecord) {
            presentSavings = {
                sip: Number(latestRecord.savings?.sip) || 0,
                fdRd: Number(latestRecord.savings?.fdRd) || 0,
                gold: Number(latestRecord.savings?.gold) || 0
            };
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
            suggestions.push("🚨 No savings data found for this period.");
        } else {
            if (savings.fdRd > savings.sip * 2) suggestions.push("⚠️ Inflation Risk: Your FD allocation is high. Shift to SIPs.");
            if (savings.gold === 0) suggestions.push("🛡️ Hedge Missing: Add 5-10% in Digital Gold.");
            if (totalSaved < (income * 0.2) && income > 0) suggestions.push(`📉 Under-saving: You are saving only ${((totalSaved/income)*100).toFixed(1)}%. Target 20%.`);
        }

        res.json({
            currentSavings: savings,      
            presentSavings: presentSavings, 
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
        const { type, month, year } = req.query;

        let totalInvestableCash = 0;
        let totalIncome = 0;
        let totalSavedAmount = 0;
        let recordsToProcess = [];

        // ===== FETCH RECORDS =====
        if (type === 'month' && month && year) {
            const targetMonth = `${year}-${month}`;
            const singleRecord = await MonthlyRecord.findOne({ user: userId, month: targetMonth });
            if (singleRecord) recordsToProcess.push(singleRecord);
        } else {
            recordsToProcess = await MonthlyRecord.find({ user: userId });
        }

        // ===== CALCULATE CASH + SAVING % =====
        recordsToProcess.forEach(record => {

            const income = Number(record.income) || 0;
            const expenses = record.expenses || {};
            const savings = record.savings || {};

            totalIncome += income;

            const saved =
                (Number(savings.sip) || 0) +
                (Number(savings.fdRd) || 0) +
                (Number(savings.gold) || 0);

            totalSavedAmount += saved;

            const totalFixed =
                (Number(expenses.rent) || 0) +
                (Number(expenses.emi) || 0) +
                (Number(expenses.grocery) || 0) +
                (Number(expenses.electricity) || 0) +
                (Number(expenses.otherBills) || 0) +
                (Number(expenses.subscriptions) || 0) +
                (Number(expenses.petrol) || 0) +
                (Number(expenses.otherExpense) || 0);

            const monthlyFreeCash = Math.max(
                0,
                income - totalFixed - saved - (income * 0.1) // 10% emergency buffer
            );

            totalInvestableCash += monthlyFreeCash;
        });

        if (totalInvestableCash < 500) {
            return res.json({
                freeCash: totalInvestableCash,
                plans: [],
                message: "Low funds available for trading."
            });
        }

        // ===== SAVING PERCENTAGE =====
        const savingPercent = totalIncome > 0
            ? (totalSavedAmount / totalIncome) * 100
            : 0;

        let savingStatus = "Weak";
        if (savingPercent >= 30) savingStatus = "Excellent";
        else if (savingPercent >= 20) savingStatus = "Good";
        else if (savingPercent >= 10) savingStatus = "Average";

        // ===== ALLOCATION BASED ON SAVING DISCIPLINE =====
        let allocationRatio = 0.10; // default

        if (savingPercent >= 30) allocationRatio = 0.40;
        else if (savingPercent >= 20) allocationRatio = 0.30;
        else if (savingPercent >= 10) allocationRatio = 0.20;

        // ===== WATCHLIST =====
        const watchlist = [
            { symbol: 'NIFTYBEES.NS', name: 'Nifty 50 ETF', type: 'Safe' },
            { symbol: 'GOLDBEES.NS', name: 'Gold ETF', type: 'Safe' },
            { symbol: 'ITC.NS', name: 'ITC Ltd', type: 'Safe' },
            { symbol: 'SBIN.NS', name: 'SBI Bank', type: 'Safe' },
            { symbol: 'TATAPOWER.NS', name: 'Tata Power', type: 'Safe' },
            { symbol: 'ONGC.NS', name: 'ONGC', type: 'Safe' },
            { symbol: 'BEL.NS', name: 'Bharat Electronics', type: 'Safe' },
            { symbol: 'RELIANCE.NS', name: 'Reliance Ind.', type: 'Moderate' },
            { symbol: 'INFY.NS', name: 'Infosys', type: 'Moderate' },
            { symbol: 'TCS.NS', name: 'TCS', type: 'Moderate' }
        ];

        // ===== FETCH MARKET DATA =====
        let quotes = [];
        let isFallback = false;

        try {
            const results = await Promise.all(
                watchlist.map(stock => yahooFinance.quote(stock.symbol))
            );

            quotes = results
                .filter(q => q && q.symbol)
                .map(q => ({
                    symbol: q.symbol,
                    regularMarketPrice: q.regularMarketPrice || 0,
                    regularMarketChangePercent: q.regularMarketChangePercent || 0
                }));

        } catch (e) {
    console.error("Yahoo API failed:", e.message);
    isFallback = true;

    // ===== Realistic Base Prices (Approx NSE) =====
    const fallbackPrices = {
        'NIFTYBEES.NS': 245,
        'GOLDBEES.NS': 52,
        'ITC.NS': 445,
        'SBIN.NS': 620,
        'TATAPOWER.NS': 380,
        'ONGC.NS': 275,
        'BEL.NS': 210,
        'RELIANCE.NS': 2950,
        'INFY.NS': 1650,
        'TCS.NS': 3900
    };

    quotes = watchlist.map(w => {

        const basePrice = fallbackPrices[w.symbol] || 300;

        // ===== Volatility Logic =====
        let volatility = 2; // default ±2%

        if (w.type === 'Safe') volatility = 1.5;
        if (w.symbol === 'NIFTYBEES.NS' || w.symbol === 'GOLDBEES.NS') {
            volatility = 1; // ETFs move less
        }

        // Random % movement
        const randomChange = (Math.random() * (volatility * 2) - volatility);
        const adjustedPrice = basePrice * (1 + randomChange / 100);

        // ===== Dynamic Risk Classification =====
        let dynamicType = "Safe";

        if (randomChange < -2) {
            dynamicType = "Risk";
        } else if (randomChange < 0) {
            dynamicType = "Moderate";
        }

        return {
            symbol: w.symbol,
            regularMarketPrice: Math.round(adjustedPrice),
            regularMarketChangePercent: Number(randomChange.toFixed(2)),
            dynamicType   // this can be used later if needed
        };
    });

    // Conservative fallback allocation
    allocationRatio = 0.10;
}

        // Total smart investment pool
    const smartInvestAmount = totalInvestableCash * allocationRatio;

    // Portfolio split (must total 1.0)
    const allocationMap = {
        'NIFTYBEES.NS': 0.25,
        'GOLDBEES.NS': 0.13,
        'ITC.NS': 0.12,
        'SBIN.NS': 0.18,
        'TATAPOWER.NS': 0.15,
        'ONGC.NS': 0.17
    };

    let plans = [];

    quotes.forEach(quote => {

        const stockInfo = watchlist.find(w => w.symbol === quote.symbol);
        if (!stockInfo) return;

        const price = quote.regularMarketPrice;
        if (!price || price <= 0) return;

        const stockAllocation = allocationMap[quote.symbol] || 0.10;

        const stockInvestAmount = smartInvestAmount * stockAllocation;

        const quantity = Math.floor(stockInvestAmount / price);
        if (quantity <= 0) return;

        const totalCost = quantity * price;

        let expectedReturn = stockInfo.type === 'Safe' ? 0.08 : 0.14;

        plans.push({
            type: quote.dynamicType || stockInfo.type,
            name: stockInfo.name,
            symbol: quote.symbol,
            price,
            change: quote.regularMarketChangePercent,
            quantity,
            totalCost,
            allocationPercent: (stockAllocation * 100).toFixed(0),
            expectedReturn: `${expectedReturn * 100}%`,
            recommendation: `Buy ${quantity} shares`
        });

    });

        // ===== SORTING =====
        plans.sort((a, b) => {
            if (a.type === 'Safe' && b.type !== 'Safe') return -1;
            if (b.type === 'Safe' && a.type !== 'Safe') return 1;
            return b.change - a.change;
        });

        // ===== RESPONSE =====
        res.json({
            freeCash: totalInvestableCash,
            smartInvestment: smartInvestAmount,
            savingPercent: savingPercent.toFixed(1),
            savingStatus,
            allocationPercent: (allocationRatio * 100).toFixed(0),
            fallbackMode: isFallback,
            plans: plans.slice(0, 6)
        });

    } catch (err) {
        console.error("SmartAgent Trading Error:", err);
        res.status(500).send("Server Error");
    }
};
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