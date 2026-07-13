import { FarmerProfile } from '../models/FarmerProfile';
import { Transaction } from '../models/Transaction';
import { Loan } from '../models/Loan';

export const calculateAgriCreditScore = async (farmerId: string) => {
  const profile = await FarmerProfile.findOne({ userId: farmerId });
  if (!profile) throw new Error('Farmer profile not found');

  // Baseline score
  let score = 500;

  // 1. Transaction History Impact
  const transactions = await Transaction.find({ receiverId: farmerId, status: 'completed' });
  const totalVolume = transactions.reduce((acc, txn) => acc + txn.amount, 0);
  
  // Add points for volume (e.g., +1 point per ₹10,000, capped at 200 points)
  const volumePoints = Math.min(Math.floor(totalVolume / 10000), 200);
  score += volumePoints;

  // 2. Loan Repayment History Impact
  const loans = await Loan.find({ farmerId });
  const repaidLoans = loans.filter(l => l.status === 'repaid').length;
  const defaultedLoans = loans.filter(l => l.status === 'defaulted').length;

  // +50 points per repaid loan, -100 points per defaulted loan
  score += (repaidLoans * 50);
  score -= (defaultedLoans * 100);

  // 3. Platform Verification
  if (profile.kycStatus === 'verified') score += 50;

  // Floor at 300, Cap at 900
  score = Math.max(300, Math.min(900, score));

  // Update profile
  profile.creditScore = score;
  await profile.save();

  return score;
};

export const updateLoanStatus = async (loanId: string, status: 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'defaulted') => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error('Loan not found');

  loan.status = status;
  await loan.save();
  
  // Re-calculate score on loan completion/default
  if (status === 'repaid' || status === 'defaulted') {
    await calculateAgriCreditScore(loan.farmerId.toString());
  }

  return loan;
};
