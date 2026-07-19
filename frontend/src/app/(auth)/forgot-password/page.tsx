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
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Something went wrong');
      }

      setSuccessMessage(resData.message || 'If an account with this email exists, a password reset link has been sent.');
    } catch (error: any) {
      setServerError(error.message || 'Failed to submit request. Please try again.');
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
            <CardTitle className="text-3xl font-heading">Forgot Password</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your email address to receive a secure link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage ? (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-heading font-bold text-xl">Check your email</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full h-12 bg-secondary/80 text-foreground hover:bg-secondary border border-border/50 text-base font-medium rounded-xl">
                    Back to Log In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Email Address"
                    className="h-12 bg-input/30 focus-visible:ring-primary/50"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 inline" /> {errors.email.message}
                    </p>
                  )}
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
                    <>Send Reset Link <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-sm text-primary hover:underline font-semibold">
                    Back to Log In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
