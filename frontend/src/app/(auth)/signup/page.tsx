'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Tractor, ShoppingCart, CheckCircle2, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

const roles = [
  { id: 'farmer', title: 'Farmer', icon: Tractor, desc: 'Sell crops, run auctions, and access loans.' },
  { id: 'buyer', title: 'Buyer', icon: ShoppingCart, desc: 'Bid on live auctions and buy fresh produce.' },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [locationForm, setLocationForm] = useState({
    zipCode: '',
    address: '',
    city: '',
    district: '',
    state: ''
  });

  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePincodeChange = async (val: string) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 6);
    setLocationForm(prev => ({ ...prev, zipCode: numericVal }));

    if (numericVal.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${numericVal}`);
        const json = await res.json();
        if (json[0]?.Status === 'Success') {
          const postOffices = json[0].PostOffice;
          if (postOffices && postOffices.length > 0) {
            const details = postOffices[0];
            setLocationForm(prev => ({
              ...prev,
              city: details.Division || details.Block || details.Name || '',
              district: details.District || '',
              state: details.State || ''
            }));
            // Clear location validation errors if resolved
            setErrors(prev => ({ ...prev, zipCode: '', city: '', district: '', state: '' }));
          }
        }
      } catch (e) {
        console.error('Pincode lookup failed', e);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full Name is required.';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters.';
      }

      if (!formData.email && !formData.phone) {
        newErrors.email = 'Either email or mobile number is required.';
        newErrors.phone = 'Either email or mobile number is required.';
      } else {
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address.';
        }
        if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
          newErrors.phone = 'Please enter a valid mobile number (10-15 digits).';
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (step === 3) {
      if (!locationForm.zipCode) {
        newErrors.zipCode = 'Pincode is required.';
      } else if (locationForm.zipCode.length !== 6) {
        newErrors.zipCode = 'Pincode must be exactly 6 digits.';
      }

      if (!locationForm.address.trim()) {
        newErrors.address = 'Village / Area is required.';
      }
      if (!locationForm.city.trim()) {
        newErrors.city = 'City is required.';
      }
      if (!locationForm.district.trim()) {
        newErrors.district = 'District is required.';
      }
      if (!locationForm.state.trim()) {
        newErrors.state = 'State is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setErrors({});
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    try {
      const payload: any = {
        name: formData.name,
        password: formData.password,
        role: selectedRole,
        location: {
          coordinates: [0, 0],
          address: locationForm.address,
          city: locationForm.city,
          district: locationForm.district,
          state: locationForm.state,
          zipCode: locationForm.zipCode
        }
      };

      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;

      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        if (resData.errors && resData.errors.length > 0) {
          const msgs = resData.errors.map((err: any) => {
            const pathName = err.path && err.path.length > 0 
              ? err.path[0].charAt(0).toUpperCase() + err.path[0].slice(1) 
              : '';
            return `${pathName ? pathName + ': ' : ''}${err.message || 'Validation failed'}`;
          });
          throw new Error(msgs.join('\n'));
        }
        throw new Error(resData.message || 'Registration failed');
      }

      localStorage.setItem('token', resData.data.token);
      localStorage.setItem('user_role', resData.data.role);
      localStorage.setItem('user_name', resData.data.name);

      const roleRedirects: Record<string, string> = {
        farmer: '/farmer',
        buyer: '/buyer',
      };

      window.location.href = roleRedirects[resData.data.role] || '/farmer';
    } catch (error: any) {
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
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
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-heading font-bold">
              {step === 1 ? 'Personal Details' : step === 2 ? 'Choose your role' : step === 3 ? 'Add Location' : 'Review & Create Account'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Step {step} of 4
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
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Input 
                      placeholder="Full Name" 
                      className={`h-11 bg-input/30 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                      value={formData.name} 
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive font-medium pl-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      placeholder="Email Address (Optional)" 
                      type="email" 
                      className={`h-11 bg-input/30 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                      value={formData.email} 
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors(prev => ({ ...prev, email: '', phone: '' }));
                      }}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive font-medium pl-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      placeholder="Mobile Number" 
                      type="tel" 
                      className={`h-11 bg-input/30 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                      value={formData.phone} 
                      onChange={e => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '', email: '' }));
                      }}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive font-medium pl-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      placeholder="Password" 
                      type="password" 
                      className={`h-11 bg-input/30 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                      value={formData.password} 
                      onChange={e => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive font-medium pl-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      placeholder="Confirm Password" 
                      type="password" 
                      className={`h-11 bg-input/30 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                      value={formData.confirmPassword} 
                      onChange={e => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive font-medium pl-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button onClick={nextStep} className="w-full h-11 bg-primary-gradient text-base font-medium rounded-xl hover:scale-[1.01] transition-transform mt-2">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {roles.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`text-left p-5 rounded-xl border-2 transition-all ${
                          selectedRole === role.id 
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                            : 'border-border/50 hover:border-primary/50 glass hover:bg-primary/5'
                        }`}
                      >
                        <role.icon className={`w-8 h-8 mb-3 ${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="font-heading font-bold text-lg mb-1 text-foreground">{role.title}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{role.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={prevStep} className="flex-1 h-11 rounded-xl">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      disabled={!selectedRole}
                      className="flex-1 h-11 bg-primary-gradient text-base font-medium rounded-xl disabled:opacity-50"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1 relative">
                      <Input 
                        placeholder="Pincode" 
                        maxLength={6}
                        className={`h-11 bg-input/30 ${errors.zipCode ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={locationForm.zipCode}
                        onChange={e => handlePincodeChange(e.target.value)}
                      />
                      {pincodeLoading && (
                        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3.5 text-muted-foreground" />
                      )}
                      {errors.zipCode && (
                        <p className="text-xs text-destructive font-medium pl-1">{errors.zipCode}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Input 
                        placeholder="Village / Area Name" 
                        className={`h-11 bg-input/30 ${errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={locationForm.address}
                        onChange={e => {
                          setLocationForm({ ...locationForm, address: e.target.value });
                          if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                        }}
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive font-medium pl-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Input 
                        placeholder="City" 
                        className={`h-11 bg-input/30 ${errors.city ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={locationForm.city}
                        onChange={e => {
                          setLocationForm({ ...locationForm, city: e.target.value });
                          if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                        }}
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive font-medium pl-1">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Input 
                        placeholder="District" 
                        className={`h-11 bg-input/30 ${errors.district ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={locationForm.district}
                        onChange={e => {
                          setLocationForm({ ...locationForm, district: e.target.value });
                          if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                        }}
                      />
                      {errors.district && (
                        <p className="text-xs text-destructive font-medium pl-1">{errors.district}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Input 
                        placeholder="State" 
                        className={`h-11 bg-input/30 ${errors.state ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={locationForm.state}
                        onChange={e => {
                          setLocationForm({ ...locationForm, state: e.target.value });
                          if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
                        }}
                      />
                      {errors.state && (
                        <p className="text-xs text-destructive font-medium pl-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={prevStep} className="flex-1 h-11 rounded-xl">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button onClick={nextStep} className="flex-1 h-11 bg-primary-gradient text-base font-medium rounded-xl">
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.form
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Account Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground">{formData.name}</span>

                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium text-foreground">{formData.phone || formData.email}</span>

                      <span className="text-muted-foreground">Selected Role:</span>
                      <span className="font-semibold text-primary capitalize">{selectedRole}</span>

                      <span className="text-muted-foreground flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" /> Location:</span>
                      <span className="font-medium text-foreground leading-snug">
                        {locationForm.address}, {locationForm.city}, {locationForm.state} - {locationForm.zipCode}
                      </span>
                    </div>
                  </div>

                  {serverError && (
                    <div className="text-xs text-destructive font-medium p-2.5 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                      {serverError}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-11 rounded-xl" disabled={isLoading}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1 h-11 bg-primary-gradient text-base font-medium rounded-xl">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {step === 1 && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
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
