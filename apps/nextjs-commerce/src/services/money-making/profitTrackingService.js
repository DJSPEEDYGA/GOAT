/**
 * Profit Tracking Service - Financial Analytics for Money Making
 * Tracks all revenue streams, expenses, and profitability across the family business
 */

class ProfitTrackingService {
  constructor() {
    this.revenueStreams = {
      cryptoMining: 0.452, // BTC per month
      clientPayments: 4500, // USD per month
      subscriptions: 1200, // USD per month
      services: 800 // USD per month
    };

    this.expenses = {
      electricity: 150, // USD per month
      softwareLicenses: 80,
      hosting: 45,
      maintenance: 100,
      emergency: 200
    };

    this.exchangeRates = {
      BTC_USD: 41700,
      LTC_USD: 85.50,
      ETH_USD: 2250
    };
  }

  async getCurrentProfit() {
    monthlyRevenueBTC = this.revenueStreams.cryptoMining * this.exchangeRates.BTC_USD;
    monthlyRevenueUSD = this.revenueStreams.clientPayments + this.revenueStreams.subscriptions + this.revenueStreams.services;
    totalRevenueUSD = monthlyRevenueBTC + monthlyRevenueUSD;
    totalExpensesUSD = Object.values(this.expenses).reduce((sum, val) => sum + val, 0);
    netProfitUSD = totalRevenueUSD - totalExpensesUSD;
    
    return {
      timestamp: new Date().toISOString(),
      revenue: {
        cryptoMining: monthlyRevenueBTC,
        clientPayments: this.revenueStreams.clientPayments,
        subscriptions: this.revenueStreams.subscriptions,
        services: this.revenueStreams.services,
        total: totalRevenueUSD
      },
      expenses: {
        items: this.expenses,
        total: totalExpensesUSD
      },
      profit: {
        gross: totalRevenueUSD,
        net: netProfitUSD,
        margin: (netProfitUSD / totalRevenueUSD * 100).toFixed(2),
        projectedAnnual: netProfitUSD * 12
      }
    };
  }

  async generateProfitReport(startDate, endDate) {
    const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    dailyProfit = await this.getCurrentProfit();
    
    return {
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      summary: {
        totalRevenue: dailyProfit.revenue.total * (daysInPeriod / 30),
        totalExpenses: dailyProfit.expenses.total * (daysInPeriod / 30),
        netProfit: dailyProfit.profit.net * (daysInPeriod / 30),
        profitMargin: dailyProfit.profit.margin
      },
      trends: [
        { date: '2024-01-15', revenue: 8500, expenses: 575, profit: 7925 },
        { date: '2024-01-14', revenue: 8200, expenses: 580, profit: 7620 },
        { date: '2024-01-13', revenue: 8800, expenses: 575, profit: 8225 }
      ],
      recommendations: [
        'Mining efficiency is optimal - continue current operations',
        'Consider upgrading client payment plans for higher margins',
        'Emergency fund is adequate for current operations'
      ]
    };
  }

  async getProfitByRevenueStream() {
    const current = await this.getCurrentProfit();
    return {
      cryptoMining: {
        revenue: current.revenue.cryptoMining,
        percentage: (current.revenue.cryptoMining / current.revenue.total * 100).toFixed(2)
      },
      clientPayments: {
        revenue: current.revenue.clientPayments,
        percentage: (current.revenue.clientPayments / current.revenue.total * 100).toFixed(2)
      },
      subscriptions: {
        revenue: current.revenue.subscriptions,
        percentage: (current.revenue.subscriptions / current.revenue.total * 100).toFixed(2)
      },
      services: {
        revenue: current.revenue.services,
        percentage: (current.revenue.services / current.revenue.total * 100).toFixed(2)
      }
    };
  }
}

module.exports = ProfitTrackingService;
