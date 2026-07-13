'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ShieldCheck, Smartphone, CreditCard, Building2, Loader2, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock Order Details
  const order = {
    id: params.id,
    amount: 117500,
    crop: 'Premium Tomatoes',
    qty: '50 Qtl',
    farmer: 'Ramesh Kumar'
  };

  const handleProceed = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Simulate Razorpay order creation
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 1000));
      setIsProcessing(false);
      setIsOtpOpen(true);
    }
  };

  const handleVerifyOtp = async () => {
    setIsProcessing(true);
    // Simulate payment verification & ledger entry
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessing(false);
    setIsOtpOpen(false);
    setStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {step < 3 && (
        <Link href={`/buyer/marketplace`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      )}

      <AnimatePresence mode="wait">
        
        {/* Step 1: Summary */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <h1 className="text-3xl font-heading font-bold mb-6">Checkout Summary</h1>
            
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <div>
                    <h3 className="font-semibold text-lg">{order.crop}</h3>
                    <p className="text-sm text-muted-foreground">Qty: {order.qty} • Seller: {order.farmer}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono">₹{order.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (1%)</span>
                    <span>₹{(order.amount * 0.01).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Logistics (Est.)</span>
                    <span>₹3,500</span>
                  </div>
                  <div className="h-px bg-border/50 my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total to Pay</span>
                    <span className="text-primary">₹{(order.amount * 1.01 + 3500).toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full h-14 text-lg bg-primary-gradient" onClick={handleProceed}>
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-heading font-bold">Payment Method</h1>
              <div className="text-xl font-bold font-mono text-primary">Total: ₹{(order.amount * 1.01 + 3500).toLocaleString()}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Select Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: Smartphone },
                    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === method.id ? 'border-primary bg-primary/10' : 'border-border/50 hover:bg-secondary/50'
                      }`}
                    >
                      <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`font-medium ${selectedMethod === method.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {method.label}
                      </span>
                      {selectedMethod === method.id && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-primary">
                    <ShieldCheck className="w-4 h-4" /> Secure via Razorpay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedMethod === 'upi' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter your UPI ID</label>
                      <Input 
                        placeholder="example@upi" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)} 
                        className="h-12 bg-input/30"
                      />
                    </div>
                  )}
                  {selectedMethod !== 'upi' && (
                    <div className="p-4 bg-secondary/50 rounded-xl text-center text-sm text-muted-foreground border border-border/50">
                      Mock environment: Please use UPI for demonstration.
                    </div>
                  )}

                  <Button 
                    className="w-full h-14 text-lg bg-primary-gradient mt-4" 
                    onClick={handleProceed}
                    disabled={isProcessing || (selectedMethod === 'upi' && !upiId)}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${(order.amount * 1.01 + 3500).toLocaleString()}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[60vh]">
            <Card className="glass-card border-primary/20 bg-primary/5 max-w-md w-full text-center p-8">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/30">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-heading font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment of ₹{(order.amount * 1.01 + 3500).toLocaleString()} has been processed and logged to the AgriBridge Ledger.
              </p>
              
              <div className="p-4 bg-background rounded-xl border border-border/50 text-left space-y-2 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono font-medium">txn_89x2f1A</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono font-medium">{order.id}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-primary-gradient" onClick={() => router.push('/buyer/orders')}>Track Logistics</Button>
                <Button variant="outline" className="w-full glass" onClick={() => router.push('/buyer')}>Return to Dashboard</Button>
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* UPI OTP Mock Modal */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" /> Verify UPI Payment
            </DialogTitle>
            <DialogDescription>
              Enter the UPI PIN for {upiId} to authorize the payment of ₹{(order.amount * 1.01 + 3500).toLocaleString()} to AgriBridge Escrow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              type="password" 
              placeholder="Enter 4 or 6 digit UPI PIN" 
              className="text-center text-2xl tracking-[1em] h-14 bg-input/30"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button 
              className="w-full h-12 bg-primary-gradient"
              onClick={handleVerifyOtp}
              disabled={otp.length < 4 || isProcessing}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
