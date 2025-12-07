# 💰 MultiAgent Finance Manager

A smart, AI-driven personal finance assistant that helps users manage monthly savings, analyze asset purchases, and receive safe, data-backed stock market trading suggestions.

## 🚀 Features

The application consists of three intelligent agents working together:

### 1. 📊 Savings Agent

Tracks monthly income, expenses, and savings (SIP, FD, Gold).

Analyzes your financial health.

Output: projects future wealth over 5, 10, and 20 years and provides actionable saving advice (e.g., "Shift FD to SIP for better returns").

### 2. 📈 Trading Agent

Scans real-time market data to suggest safe, affordable investment opportunities.

Filters stocks based on your actual "Free Cash" (Money left after expenses and savings).

Core Logic: Prioritizes "Bluechip" stability and Defensive sectors over risky gains.

See Stock Selection Strategy for the detailed algorithm.

### 3. 🏠 Asset Analysis Agent

A calculator to evaluate big financial decisions (e.g., "Buying a House vs. Renting" or "Buying a Car").

Output: Determines if a purchase is a "Wealth Creator" or a "Liability" based on EMI, tenure, and depreciation/appreciation rates.

## ⚡ Quick Start (Demo Access)

Want to see the app in action without entering months of data?

We have pre-loaded a **Demo User** with 6 months of realistic financial history—including income patterns, expense spikes, and active goals—so you can visualize the AI's full capabilities immediately.

### 🔐 Guest Credentials:
* **Email:** `harshita@gmail.com`
* **Password:** `123456`

> **Note:** You can also click **Sign Up** to create your own private account and start tracking your personal financial journey from scratch.

## 🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

Financial Data: yahoo-finance2 API (Real-time stock data)

Architecture: Controller-Service pattern with Fallback mechanisms.

## ⚙️ Installation & Setup

### 1. Prerequisites

Node.js (v18 or higher)

MongoDB (Local or Atlas connection string)

### 2. Clone the Repository

git clone [https://github.com/yourusername/multiagent-finance-manager.git](https://github.com/yourusername/multiagent-finance-manager.git)
cd multiagent-finance-manager


### 3. Install Dependencies

npm install


### 4. Configure Environment

Create a .env file in the root directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ALPHA_VANTAGE_KEY=optional_backup_key


### 5. Run the Server

#### For development (with auto-restart)
npm run dev

#### For production
npm start


## 🛡️ Robustness & Safety

API Fallback: If the external stock market API (Yahoo Finance) is down or rate-limited, the system automatically switches to a Hardcoded Fallback Mode. This ensures the app never crashes and continues to provide educational value with estimated data.

Safety-First Algorithms: The trading engine is hard-coded to prioritize ETF and Bluechip safety over volatility.

## 📚 Documentation

[**Stock Selection Strategy**](docs/STOCK_SELECTION_STRATEGY.md): Read how the AI selects safe stocks and calculates affordability.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. The "Trading Agent" provides suggestions based on algorithmic logic and does not constitute certified financial advice. Always do your own research before investing.