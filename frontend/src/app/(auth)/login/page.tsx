'use client';

import { useState } from 'react';
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

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

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
      </motion.div>
    </div>
  );
}
