'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Tractor, ShoppingCart, Truck, Landmark } from 'lucide-react';

const roles = [
  { id: 'farmer', title: 'Farmer', icon: Tractor, desc: 'Sell crops, run auctions, and access loans.' },
  { id: 'buyer', title: 'Buyer', icon: ShoppingCart, desc: 'Bid on live auctions and buy fresh produce.' },
  { id: 'logistics', title: 'Logistics Partner', icon: Truck, desc: 'Deliver produce and earn by route.' },
  { id: 'bank', title: 'Bank / NBFC', icon: Landmark, desc: 'Provide credit using AgriCredit scores.' },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nextStep = () => setStep(step + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white font-heading font-bold text-xl">A</div>
          <span className="font-heading font-bold text-2xl tracking-tight text-foreground">AgriBridge</span>
        </Link>

        <Card className="glass-card shadow-lg border-border/50">
          <div className="h-1 w-full bg-secondary overflow-hidden rounded-t-xl">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-3xl font-heading">
              {step === 1 ? 'Create an account' : step === 2 ? 'Choose your role' : 'Complete your profile'}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-2">
              Step {step} of 3
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 max-w-md mx-auto"
                >
                  <Input placeholder="Full Name" className="h-12 bg-input/30" />
                  <Input placeholder="Email Address" type="email" className="h-12 bg-input/30" />
                  <Input placeholder="Phone Number" type="tel" className="h-12 bg-input/30" />
                  <Input placeholder="Password" type="password" className="h-12 bg-input/30" />
                  <Button onClick={nextStep} className="w-full h-12 bg-primary-gradient text-base font-medium rounded-xl hover:scale-[1.02] transition-transform">
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedRole === role.id 
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                          : 'border-border/50 hover:border-primary/50 glass hover:bg-primary/5'
                      }`}
                    >
                      <role.icon className={`w-8 h-8 mb-3 ${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="font-heading font-bold text-lg mb-1 text-foreground">{role.title}</div>
                      <div className="text-sm text-muted-foreground">{role.desc}</div>
                    </button>
                  ))}
                  
                  <div className="col-span-full mt-6">
                    <Button 
                      onClick={nextStep} 
                      disabled={!selectedRole}
                      className="w-full h-12 bg-primary-gradient text-base font-medium rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 max-w-md mx-auto"
                >
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 text-center mb-6 text-sm text-muted-foreground">
                    Upload your KYC documents to verify your identity. You can also skip this and do it later from your dashboard.
                  </div>
                  
                  <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/20 transition-colors cursor-pointer block">
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    <User className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                    <div className="font-semibold text-foreground mb-1">Click to upload Aadhaar / PAN</div>
                    <div className="text-xs text-muted-foreground">PDF, JPG or PNG (Max 5MB)</div>
                  </label>

                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary-gradient text-base font-medium rounded-xl hover:scale-[1.02] transition-transform mt-4">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Sign Up'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {step === 1 && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
