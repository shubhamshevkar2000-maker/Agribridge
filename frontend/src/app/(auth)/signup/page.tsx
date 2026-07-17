'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Tractor, ShoppingCart, Truck, Landmark, CheckCircle2, FileText, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [base64Data, setBase64Data] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      setSelectedFile(null);
      setFilePreview('');
      setBase64Data('');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      setFilePreview('');
      setBase64Data('');
      return;
    }

    setSelectedFile(file);

    // Create local preview URL
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview('');
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Data(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const nextStep = () => {
    if (step === 1) {
      const newErrors: Record<string, string> = {};
      
      if (!formData.name || !formData.name.trim()) {
        newErrors.name = 'Name is required.';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters.';
      }

      if (!formData.email && !formData.phone) {
        newErrors.email = 'Either email or phone number is required.';
        newErrors.phone = 'Either email or phone number is required.';
      } else {
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address.';
        }
        if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number (10-15 digits).';
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setErrors({});
    setStep(step + 1);
  };
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');
    try {
      const payload: any = {
        name: formData.name,
        password: formData.password,
        role: selectedRole
      };
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;
      if (base64Data) payload.kycDocument = base64Data;
      if (coordinates) payload.location = { coordinates: [coordinates[1], coordinates[0]] }; // Longitude, Latitude for GeoJSON

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/signup`, {
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
            const prefix = pathName ? `${pathName}: ` : '';
            return `${prefix}${err.message || 'Validation failed'}`;
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
        logistics: '/logistics',
        bank: '/bank',
        admin: '/admin',
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
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-3xl font-heading">
              {step === 1 ? 'Create an account' : step === 2 ? 'Choose your role' : step === 3 ? 'Complete your profile' : 'Set your location'}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-2">
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
                  className="space-y-4 max-w-md mx-auto"
                >
                  <div className="space-y-1">
                    <Input 
                      placeholder="Full Name" 
                      className={`h-12 bg-input/30 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
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
                      placeholder="Email Address" 
                      type="email" 
                      className={`h-12 bg-input/30 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
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
                      placeholder="Phone Number" 
                      type="tel" 
                      className={`h-12 bg-input/30 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
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
                      className={`h-12 bg-input/30 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
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

                  {serverError && (
                    <div className="text-sm text-destructive font-medium text-center space-y-1">
                      {serverError.split('\n').map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
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
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 max-w-md mx-auto"
                >
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 text-center mb-6 text-sm text-muted-foreground">
                    Upload your KYC documents to verify your identity. You can also skip this and do it later from your dashboard.
                  </div>
                  
                  <div className="relative">
                    {selectedFile ? (
                      <div className="border-2 border-dashed border-primary bg-primary/5 rounded-xl p-6 text-center relative">
                        <button 
                          type="button" 
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreview('');
                            setBase64Data('');
                            setFileError('');
                          }} 
                          className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex flex-col items-center gap-3">
                          {filePreview ? (
                            <img src={filePreview} alt="KYC Preview" className="w-24 h-24 object-cover rounded-lg border border-border" />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-secondary/80 flex items-center justify-center border border-border">
                              <FileText className="w-10 h-10 text-primary" />
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Document Captured</span>
                          </div>
                          
                          <div className="text-sm font-medium text-foreground truncate max-w-[250px]">
                            {selectedFile.name}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/20 transition-colors cursor-pointer block">
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                        <User className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                        <div className="font-semibold text-foreground mb-1">Click to upload Aadhaar / PAN</div>
                        <div className="text-xs text-muted-foreground">PDF, JPG or PNG (Max 5MB)</div>
                      </label>
                    )}
                  </div>

                  {fileError && (
                    <p className="text-sm text-destructive font-medium text-center">{fileError}</p>
                  )}

                  {serverError && (
                    <div className="text-sm text-destructive font-medium text-center mt-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20 space-y-1">
                      {serverError.split('\n').map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}

                  <Button type="button" onClick={nextStep} className="w-full h-12 bg-primary-gradient text-base font-medium rounded-xl hover:scale-[1.02] transition-transform mt-4">
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 4 && (
                <motion.form
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 max-w-md mx-auto"
                >
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 text-center mb-6 text-sm text-muted-foreground">
                    Pin your location on the map. This helps us connect you with nearby logistics partners and farmers.
                  </div>
                  
                  <div className="relative">
                    <LocationPicker onLocationSelect={(loc) => setCoordinates(loc)} />
                  </div>
                  {coordinates && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Location selected: {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                    </div>
                  )}

                  {serverError && (
                    <div className="text-sm text-destructive font-medium text-center mt-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20 space-y-1">
                      {serverError.split('\n').map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}

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
