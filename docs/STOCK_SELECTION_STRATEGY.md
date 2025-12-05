# 📈 Stock Selection & Recommendation Strategy

## Overview

This document outlines the logic used by the Trading Agent to suggest stocks to users. Unlike full-market scanners, our system uses a **Curated Bluechip Watchlist** approach. This ensures that users—specifically those with limited capital—are only recommended high-stability, low-volatility assets ("Safe" investments) rather than risky penny stocks.

---

## 1. The Core Philosophy

The recommendation engine is built on three financial principles:

1. **"Too Big to Fail" (Bluechips)**: Focus on companies with the largest market capitalization in India. If these fail, the economy fails.  
2. **Defensive Sectors**: Prioritize sectors that perform well even in recessions (FMCG, Power, Utilities).  
3. **Budget Accessibility**: Ensure the watchlist includes high-quality stocks trading at lower nominal prices (₹100 - ₹500) so users with small savings (e.g., ₹2,000) can still afford to buy quantities > 1.

---

## 2. The Curated Watchlist

The system monitors a fixed list of **10 assets**, selected based on their role in a portfolio:

| Symbol        | Company           | Type     | Role & Justification |
|---------------|-----------------|----------|--------------------|
| NIFTYBEES.NS  | Nifty 50 ETF     | Safe     | Market Average: Buys the top 50 companies at once. Removes single-company risk. |
| GOLDBEES.NS   | Gold ETF         | Safe     | Hedge: Gold prices often rise when the stock market falls. Acts as portfolio insurance. |
| ITC.NS        | ITC Ltd          | Safe     | Defensive (FMCG): Low volatility, high dividend yield. People buy household goods regardless of economy. |
| SBIN.NS       | SBI Bank         | Safe     | Sovereign Backing: India's largest public sector bank. Implicit government guarantee. |
| TATAPOWER.NS  | Tata Power       | Safe     | Infrastructure: Essential utility service. Stable revenue model. |
| ONGC.NS       | ONGC             | Safe     | Energy Giant: Gov-backed oil & gas major. Undervalued with high safety margin. |
| BEL.NS        | Bharat Electronics | Safe   | Defense: Strategic defense PSU. Order book secured by the government. |
| RELIANCE.NS   | Reliance Ind.    | Moderate | Market Leader: Largest company in India. Diversified across Oil, Telecom (Jio), and Retail. |
| TCS.NS        | TCS              | Moderate | IT Sector Leader: Global scale, but higher stock price makes it harder for small investors to buy. |
| INFY.NS       | Infosys          | Moderate | IT Sector Runner-up: High growth potential but subject to global tech volatility. |

---

## 3. The Algorithm Logic

The `getTradingSuggestions` function processes the watchlist dynamically:

**Step 1: Real-Time Pricing**  
- Fetch Live Price and Daily Change % for all 10 assets using the `yahoo-finance2` API.

**Step 2: Affordability Filter**  
- Compare stock price against the user's Free Cash.  
- Example: If user has ₹3,000 and TCS is ₹4,200, TCS is removed from recommendations.

**Step 3: "Safety First" Sorting**  
- Remaining stocks are sorted based on priority:  
  1. Assets marked as **Type: 'Safe'** (ETFs, PSUs).  
  2. Assets marked as **Type: 'Moderate'**.  
  3. Within the same type, sort by **Momentum** (Highest % Gain today).

**Step 4: Final Selection**  
- Slice the **Top 6 results** from the sorted list to present a concise, actionable plan to the user.

---

## 4. Failure Handling

- If the external API fails (Yahoo Finance is down or rate-limited):  
  - The system switches to **Hardcoded Fallback Mode**.  
  - It assigns a dummy safe price (e.g., ₹250) to all stocks.  
- This ensures the UI never crashes and the user still receives valid educational recommendations, even if prices are estimates.
