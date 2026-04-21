# 💰 MultiAgent Finance Manager

A smart, AI-driven personal finance assistant that helps users manage monthly savings, analyze asset purchases, and receive safe, data-backed stock market trading suggestions.
---

## 🚀 Features

**FinSync** is a smart financial assistant built using a **Multi-Agent Architecture**, where multiple specialized agents collaborate to provide a complete view of a user's financial health.

Unlike traditional finance apps that focus on single features, FinSync integrates:
- Expense tracking
- Budgeting
- Savings analysis
- Investment planning
- Market intelligence

All within a unified, intelligent system.

### 1. 🤖 Advisory Agent (The Brain)
The central intelligence hub that synthesizes data from all other agents to create your **"Fiscal Efficiency Profile"**.
* **Financial DNA:** Analyzes 6 months of history to calculate your efficiency score (e.g., "+4.1% Potential").
* **"Can I Afford It?" Simulator:** A real-time decision engine that checks your liquid cash against potential purchases.
* **Goal Celebration:** Tracks goal progress (e.g., "Thailand Trip") and triggers confetti/alerts upon completion.

### 2. 🛡️ Expense Agent (The Guardian)
Focuses on monthly discipline and categorization (Needs vs. Wants).
* **Smart Categorization:** Automatically sorts transactions into "Fixed Needs" (Rent, EMI) and "Lifestyle Wants" (Party, Dining).
* **Limit Tracker:** Visualizes your spending against the 50/30/20 rule.
* **Spending Feedback:** Awards badges like "Star Saver" if you stay within your monthly budget.

### 3. 👛 Wallet Manager (The Velocity Tracker)
*A dedicated tool to manage daily cash flow intensity.*
* **Burn Rate Monitor:** Calculates your "Daily Spend" (e.g., ₹800/day) to keep you from running out of cash before month-end.
* **7-Day Trend:** Visualizes your immediate spending velocity to spot "heavy" spending days instantly.
* **Quick Add:** Rapid entry point for daily manual transactions.

### 4. 🐷 Saving Agent (The Wealth Builder)
A comprehensive module that handles both **Long-term Security** and **Active Investing**.

#### 📉 Wealth & Security
* **Wealth Projection:** Forecasts net worth over 5, 10, and 20 years based on current SIP/FD/Gold allocations.
* **Runway Calculator:** Calculates exactly how many months you can survive without income based on liquid assets.
* **Asset Allocation:** Suggests optimal splits between safe assets (FD/Gold) and growth assets (Mutual Funds).

#### 📈 Smart Trading Plans (Integrated Feature)
* **Real-Time Market Data:** Scans live stock market data (via Yahoo Finance) to identify "Buy" opportunities.
* **Safety-First Engine:** Suggests investments **only** if you have unallocated "Free Cash" (Money left after Needs + Savings).
* **Defensive Strategy:** Filters for stable Bluechip stocks and ETFs (e.g., Nifty 50, Gold BeES) rather than risky speculative stocks.

### 5. 📰 Market Intelligence Agent
- Fetches real-time financial news (News API)
- Uses **BART NLP model (Hugging Face)** for:
  - News summarization
  - Sentiment analysis
- Provides context-aware financial insights

### 6. 🎯  Goal Management System (NEW)
- Categorizes goals into:
  - 🟢 **Short-Term Goals** (0–1 year)
  - 🔵 **Long-Term Goals** (1–5 years)
  - 🟣 **Retirement Goals** (5+ years)
- Tracks progress and milestones
- Triggers reward system on completion

### 7. 🧓 Retirement Planning Agent
- Creates structured retirement plans
- Estimates:
  - Required corpus
  - Monthly investment needed
- Integrates with savings & investment strategy

### 8. 🔔 Notification Agent (The Watchdog)
A proactive alert system ensuring you never miss a financial beat.
* **Instant Alerts:** Triggers real-time notifications for "Goal Achieved," "Spending Spikes," or "Investment Opportunities."
* **Mid-Month Check-ins:** Warns you if your savings rate is lagging behind schedule (e.g., "It's the 15th and you've saved <10%").

### 9. ⚙️ Dynamic Profile Engine
* **Live Recalibration:** Update your income, fixed costs (Rent/EMI), or lifestyle budget at any time via Settings.
* **Instant Context Switch:** When you update your profile, all Agents immediately recalculate their advice, forecasts, and daily limits based on the new data.

## ⚡ Quick Start (Demo Access)

Want to see the app in action without entering months of data?

We have pre-loaded a **Demo User** with 6 months of realistic financial history—including income patterns, expense spikes, and active goals—so you can visualize the AI's full capabilities immediately.

### 🔐 Guest Credentials:
* **Email:** `harshita@gmail.com`
* **Password:** `123456`

> **Note:** You can also click **Sign Up** to create your own private account and start tracking your personal financial journey from scratch.
---

## 🛠️ Tech Stack

### Frontend
- React.js

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose (ODM)

### AI & APIs
- yahoo-finance2 (Stock Data)
- News API (Market News)
- Hugging Face (BART NLP Model)

### Other
- REST API Architecture
- JSON Data Format
- Git & GitHub

---

## 📂 Project Structure

The project is divided into a **Client** (React Frontend) and **Server** (Node.js Backend), following a modular architecture where each "Agent" has its own dedicated Controller, Route, and Component.

MultiAgent-Finance-Manager/
│
├── client/                         # Frontend (React.js)
│   ├── public/
│   │
│   └── src/
│       ├── Assest/                 # Static images (Growth, Secure, etc.)
│       │
│       ├── Components/             # UI Modules (Agents & Features)
│       │   ├── AdvisoryAgent.jsx       # Fiscal Profile & Insights
│       │   ├── Analytics.jsx           # Data Visualization & Trends
│       │   ├── Auth.jsx                # Login / Signup
│       │   ├── Dashboard.jsx           # Main Control Center
│       │   ├── ExpenseAgent.jsx        # Expense Tracking & Categorization
│       │   ├── GoalHistory.jsx         # Goal Tracking (Short/Long/Retirement)
│       │   ├── MarketAgent.jsx         # Market News & Insights
│       │   ├── Notification.jsx        # Alerts System
│       │   ├── Profile.jsx             # User Profile Management
│       │   ├── RetirementAgent.jsx     # Retirement Planning Module
│       │   ├── SavingAgent.jsx         # Wealth & Investment Planning
│       │   ├── Settings.jsx            # Dynamic Profile Engine
│       │   ├── TransactionHistory.jsx # Financial Records Viewer
│       │   └── WalletWidget.jsx        # Daily Burn Rate Tracker
│       │
│       ├── App.js                  # Main Router
│       └── index.js               # Entry Point
│
├── server/                         # Backend (Node.js / Express)
│   ├── config/
│   │   ├── db.js                  # MongoDB Connection
│   │   └── passport.js            # Authentication Strategy
│   │
│   ├── controllers/               # 🧠 Multi-Agent Logic
│   │   ├── advisoryController.js      # Financial Analysis & Efficiency
│   │   ├── analyticsController.js     # Data Insights & Trends
│   │   ├── authController.js          # Authentication Logic
│   │   ├── expenseAgentController.js  # Expense Categorization
│   │   ├── expenseController.js       # CRUD for Expenses
│   │   ├── marketController.js        # Market News & NLP Insights
│   │   ├── notificationController.js  # Alerts & Events
│   │   ├── recordController.js        # Monthly Records Handling
│   │   ├── retirementController.js    # Retirement Planning Logic
│   │   ├── savingAgentController.js   # Savings & Investment Logic
│   │   └── walletController.js        # Daily Burn Rate
│   │
│   ├── middleware/
│   │   └── auth.js                # JWT Authentication Middleware
│   │
│   ├── models/                   # Database Schemas (Mongoose)
│   │   ├── Expense.js            # Transactions
│   │   ├── Goal.js               # Goals (Short/Long/Retirement)
│   │   ├── MonthlyRecord.js      # Historical Data
│   │   ├── Notification.js       # Alerts
│   │   ├── RetirementPlan.js     # Retirement Planning
│   │   └── User.js               # User Profile
│   │
│   ├── routes/                   # API Endpoints
│   │   ├── advisoryRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── expenseAgentRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── marketRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── recordRoutes.js
│   │   ├── retirementRoutes.js
│   │   ├── savingAgentRoutes.js
│   │   └── walletRoutes.js
│   │
│   ├── GuestUser.js              # 🌱 Demo Data Seeder
│   ├── index.js                  # Server Entry Point
│   └── .env                      # Environment Variables
│
├── docs/                         # Documentation
│   └── STOCK_SELECTION_STRATEGY.md 
│   └── FinSync_Litrature Review.pdf
│   └── FinSync_Case Study.pdf  
│
├── .gitignore
├── LICENSE                       # MIT License
├── package.json
└── README.md
```

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
HF_TOKEN = hugging_face_token
NEWS_API_KEY=News_org_api_key


### 5. Run the Server

#### For development (with auto-restart)
npm run dev

#### For production
npm start


## 🛡️ Robustness & Safety

API Fallback: If the external stock market API (Yahoo Finance) is down or rate-limited, the system automatically switches to a Hardcoded Fallback Mode. This ensures the app never crashes and continues to provide educational value with estimated data.

Safety-First Algorithms: The trading engine is hard-coded to prioritize ETF and Bluechip safety over volatility.

## 📚 Documentation

## 📚 Documentation & Reports

### ✅ Validation & Testing

- 🧪 Validation Report (Google Docs)  
  👉 [View Report](https://docs.google.com/document/d/1GTXhFwGlKxpYBLG0-xIsPrlCtT-2CXe41OKrWTjMhC0/edit?usp=sharing)

---

### 📈 Investment Strategy

- 📄 [Stock Selection Strategy](docs/STOCK_SELECTION_STRATEGY.md)  
  Understand how the AI selects safe stocks and evaluates affordability.

---

### 📄 Research Documents

- 📘 [Literature Review](docs/FinSync_Literature_Review.pdf)  
  Covers methodologies, existing systems, and research foundation of FinSync.

- 📊 [Case Study](docs/FinSync_Case_Study.pdf)  
  Explores real-world financial behavior and user understanding of financial planning.

---

## 🤝 Contributing

Contributions are welcome!

If you'd like to improve this project:
1. Fork the repository
2. Create a new branch (`feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

---

## 🛠️ Support

If you encounter any issues or bugs:
- Open an issue on GitHub
- Provide a clear description
- Attach screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License**.

You are free to:
- Use
- Modify
- Distribute

With proper attribution.

See the `LICENSE` file for full details.

---

## ⚠️ Disclaimer

This project is for **educational purposes only**.  
The financial insights and investment suggestions provided are algorithm-based and do **not constitute professional financial advice**.  
Always do your own research before making financial decisions.

---

## 🌟 Support the Project

If you found this project helpful:
- ⭐ Star this repository
- 🍴 Fork it
- 📢 Share it

---