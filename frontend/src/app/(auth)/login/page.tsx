'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [farmerEmail, setFarmerEmail] = useState(process.env.NEXT_PUBLIC_DEMO_FARMER_EMAIL || 'demo.farmer@agribridge.com');
  const [buyerEmail, setBuyerEmail] = useState(process.env.NEXT_PUBLIC_DEMO_BUYER_EMAIL || 'demo.buyer@agribridge.com');
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Demo@123';

  useEffect(() => {
    fetch('/api/auth/demo-config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.farmerEmail) setFarmerEmail(data.farmerEmail);
          if (data.buyerEmail) setBuyerEmail(data.buyerEmail);
        }
      })
      .catch(err => console.error('Failed to fetch demo configuration:', err));
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const handleDemoLogin = (email: string) => {
    setValue('emailOrPhone', email);
    setValue('password', demoPassword);
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setServerError('');
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Invalid credentials');
      }

      // Store auth details
      localStorage.setItem('token', resData.data.token);
      localStorage.setItem('user_role', resData.data.role);
      localStorage.setItem('user_name', resData.data.name);

      // Redirect to correct dashboard
      const roleRedirects: Record<string, string> = {
        farmer: '/farmer',
        buyer: '/buyer',
        logistics: '/logistics',
        bank: '/bank',
        admin: '/admin',
      };

      window.location.href = roleRedirects[resData.data.role] || '/farmer';
    } catch (error: any) {
      setServerError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-screen opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-screen opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white font-heading font-bold text-xl">
            A
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
            AgriBridge
          </span>
        </Link>

        <Card className="glass-card border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-heading">Welcome back</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Log in to your AgriBridge account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Input
                  {...register('emailOrPhone')}
                  placeholder="Email or Phone Number"
                  className="h-12 bg-input/30 focus-visible:ring-primary/50"
                  disabled={isLoading}
                />
                {errors.emailOrPhone && (
                  <p className="text-sm text-destructive font-medium">{errors.emailOrPhone.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  className="h-12 bg-input/30 focus-visible:ring-primary/50"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
                )}
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {serverError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full h-12 bg-primary-gradient text-base font-medium rounded-xl hover:scale-[1.02] transition-transform" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Log In <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts Section */}
        <div className="mt-6 text-center space-y-4">
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm text-muted-foreground max-w-sm">
              Want to explore AgriBridge without creating an account? Use one of our demo accounts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {/* Farmer Demo Card */}
            <div className="p-4 rounded-xl border border-border/50 glass-card bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col justify-between h-40">
              <div>
                <div className="text-2xl mb-1">🌾</div>
                <h4 className="font-semibold text-sm text-foreground">Farmer Demo</h4>
                <p className="text-xs text-muted-foreground mt-1">Explore the platform as a Farmer.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(farmerEmail)}
                className="w-full text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                disabled={isLoading}
              >
                Login as Demo
              </Button>
            </div>

            {/* Buyer Demo Card */}
            <div className="p-4 rounded-xl border border-border/50 glass-card bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col justify-between h-40">
              <div>
                <div className="text-2xl mb-1">🛒</div>
                <h4 className="font-semibold text-sm text-foreground">Buyer Demo</h4>
                <p className="text-xs text-muted-foreground mt-1">Explore the platform as a Buyer.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(buyerEmail)}
                className="w-full text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                disabled={isLoading}
              >
                Login as Demo
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
