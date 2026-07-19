"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLoanStatus = exports.calculateAgriCreditScore = void 0;
const Transaction_1 = require("../models/Transaction");
const Loan_1 = require("../models/Loan");
const User_1 = require("../models/User");
const CreditLedger_1 = require("../models/CreditLedger");
const calculateAgriCreditScore = async (farmerId) => {
    const user = await User_1.User.findById(farmerId);
    if (!user)
        throw new Error('User not found');
    // Baseline score
    let score = 500;
    // 1. Transaction History Impact
    const transactions = await Transaction_1.Transaction.find({ payeeId: farmerId, status: 'success' });
    const totalVolume = transactions.reduce((acc, txn) => acc + txn.amount, 0);
    // Add points for volume (e.g., +1 point per ₹10,000, capped at 200 points)
    const volumePoints = Math.min(Math.floor(totalVolume / 10000), 200);
    score += volumePoints;
    // 2. Loan Repayment History Impact
    const loans = await Loan_1.Loan.find({ farmerId });
    const repaidLoans = loans.filter(l => l.status === 'repaid').length;
    const defaultedLoans = loans.filter(l => l.status === 'defaulted').length;
    // +50 points per repaid loan, -100 points per defaulted loan
    score += (repaidLoans * 50);
    score -= (defaultedLoans * 100);
    // 3. Platform Verification
    if (user.kycStatus === 'verified')
        score += 50;
    // Floor at 300, Cap at 900
    score = Math.max(300, Math.min(900, score));
    // Update user model
    user.creditScore = score;
    await user.save();
    // Update CreditLedger
    let ledger = await CreditLedger_1.CreditLedger.findOne({ farmerId });
    if (!ledger) {
        ledger = new CreditLedger_1.CreditLedger({
            farmerId,
            trustScore: user.trustScore || 0,
            creditScore: score,
            factors: {
                repaymentHistory: Math.min(repaidLoans * 20, 100),
                transactionConsistency: Math.min(transactions.length * 10, 100),
                disputeRate: 0,
                incomeStability: Math.min(Math.floor(totalVolume / 50000) * 15, 100),
            },
            history: []
        });
    }
    else {
        ledger.creditScore = score;
        ledger.factors.repaymentHistory = Math.min(repaidLoans * 20, 100);
        ledger.factors.transactionConsistency = Math.min(transactions.length * 10, 100);
        ledger.factors.incomeStability = Math.min(Math.floor(totalVolume / 50000) * 15, 100);
    }
    ledger.history.push({ date: new Date(), score });
    await ledger.save();
    return score;
};
exports.calculateAgriCreditScore = calculateAgriCreditScore;
const updateLoanStatus = async (loanId, status) => {
    const loan = await Loan_1.Loan.findById(loanId);
    if (!loan)
        throw new Error('Loan not found');
    loan.status = status;
    await loan.save();
    // Re-calculate score on loan completion/default
    if (status === 'repaid' || status === 'defaulted') {
        await (0, exports.calculateAgriCreditScore)(loan.farmerId.toString());
    }
    return loan;
};
exports.updateLoanStatus = updateLoanStatus;
