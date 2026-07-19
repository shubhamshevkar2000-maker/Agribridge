'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, Landmark, CheckCircle2, 
  Edit2, Save, X, Tractor, Briefcase, FileText, Upload, Sparkles, Bell, AlertTriangle, Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { Language, languageNames } from '@/lib/translations';

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState<any>({
    name: '',
    phone: '',
    email: '',
    location: {
      address: '',
      city: '',
      district: '',
      state: '',
      zipCode: '',
    },
    farmSize: '',
    experience: '',
    crops: '',
    kyc: {
      aadhaarNumber: '',
      aadhaarFront: '',
      aadhaarBack: '',
      status: 'not_submitted'
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: ''
    },
    notificationSettings: {
      email: true,
      sms: true,
      whatsapp: true
    }
  });

  // Local files for upload
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [frontBase64, setFrontBase64] = useState('');
  const [backBase64, setBackBase64] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        const data = json.data;
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          location: {
            address: data.location?.address || '',
            city: data.location?.city || '',
            district: data.location?.district || '',
            state: data.location?.state || '',
            zipCode: data.location?.zipCode || '',
          },
          farmSize: data.farmSize || '',
          experience: data.experience || '',
          crops: data.crops?.join(', ') || '',
          kyc: {
            aadhaarNumber: data.kyc?.aadhaarNumber || '',
            aadhaarFront: data.kyc?.aadhaarFront || '',
            aadhaarBack: data.kyc?.aadhaarBack || '',
            status: data.kyc?.status || 'not_submitted'
          },
          bankDetails: {
            accountNumber: data.bankDetails?.accountNumber || '',
            ifscCode: data.bankDetails?.ifscCode || '',
            bankName: data.bankDetails?.bankName || '',
            accountHolderName: data.bankDetails?.accountHolderName || ''
          },
          notificationSettings: {
            email: data.notificationSettings?.email !== false,
            sms: data.notificationSettings?.sms !== false,
            whatsapp: data.notificationSettings?.whatsapp !== false
          }
        });
        setFrontPreview(data.kyc?.aadhaarFront || '');
        setBackPreview(data.kyc?.aadhaarBack || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (side === 'front') {
        setFrontBase64(base64String);
        setFrontPreview(base64String);
      } else {
        setBackBase64(base64String);
        setBackPreview(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    
    // 1. Basic details (20%)
    if (formData.name && (formData.phone || formData.email)) score += 20;
    
    // 2. Address Details (20%)
    if (formData.location.zipCode && formData.location.address && formData.location.city) score += 20;

    // 3. Farm business Details (20%)
    if (formData.farmSize && formData.experience && formData.crops) score += 20;

    // 4. KYC details (20%)
    if (formData.kyc.aadhaarNumber && (frontPreview || backPreview)) score += 20;

    // 5. Bank Account Details (20%)
    if (formData.bankDetails.accountNumber && formData.bankDetails.ifscCode) score += 20;

    return score;
  };

  const handleSave = async () => {
    setIsLoading(true);
    setServerError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: {
          address: formData.location.address,
          city: formData.location.city,
          district: formData.location.district,
          state: formData.location.state,
          zipCode: formData.location.zipCode
        },
        farmSize: formData.farmSize ? Number(formData.farmSize) : undefined,
        experience: formData.experience ? Number(formData.experience) : undefined,
        crops: formData.crops ? formData.crops.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
        notificationSettings: formData.notificationSettings,
        kyc: {
          aadhaarNumber: formData.kyc.aadhaarNumber,
          aadhaarFront: frontBase64 || undefined,
          aadhaarBack: backBase64 || undefined
        },
        bankDetails: formData.bankDetails
      };

      const res = await fetch(`/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setSuccessMsg('Profile settings updated successfully!');
        setIsEditing(false);
        setFrontBase64('');
        setBackBase64('');
        fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to update profile settings.');
      }
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-destructive">Failed to load profile. Please log in again.</div>;
  }

  const completion = calculateCompletion();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Completion Header */}
      <Card className="glass-card border-border/50 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  {profile.name} <Badge className="uppercase tracking-wider text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/20">{profile.role}</Badge>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{profile.email || profile.phone}</p>
              </div>
            </div>

            <div className="flex-1 max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" /> Profile Completion:
                </span>
                <span className="font-bold text-primary">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2 bg-secondary" />
              {completion < 100 && (
                <p className="text-xs text-muted-foreground italic">Complete optional details to unlock loans and payouts.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'account', title: 'Account & Location', icon: User },
            { id: 'kyc', title: 'Identity (KYC)', icon: ShieldCheck },
            { id: 'farm', title: 'Farm Details', icon: Tractor },
            { id: 'bank', title: 'Bank Settings', icon: Landmark },
            { id: 'notifications', title: 'Notifications', icon: Bell },
            { id: 'language', title: t('langSettings'), icon: Globe }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4.5 h-4.5" />
              <span>{tab.title}</span>
            </button>
          ))}
          
          <div className="pt-6">
            {isEditing ? (
              <div className="space-y-2">
                <Button className="w-full h-10 bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1.5" /> Save Changes
                </Button>
                <Button variant="outline" className="w-full h-10" onClick={() => { setIsEditing(false); fetchProfile(); }}>
                  <X className="w-4 h-4 mr-1.5" /> Cancel
                </Button>
              </div>
            ) : (
              <Button className="w-full h-10 bg-primary-gradient text-white" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1.5" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          <Card className="glass-card border-border/50 shadow-md min-h-[350px]">
            <CardHeader>
              <CardTitle className="capitalize text-xl font-heading font-bold">{activeTab} Details</CardTitle>
              <CardDescription>
                {activeTab === 'account' && 'Update your basic account info and residential address.'}
                {activeTab === 'kyc' && 'Submit or update your Aadhaar card documents for KYC verification.'}
                {activeTab === 'farm' && 'Configure details of your farm lands, primary crops and experience.'}
                {activeTab === 'bank' && 'Provide accounts for directly receiving payments and credits.'}
                {activeTab === 'notifications' && 'Select how you want to be kept up-to-date with order alerts.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.isDemoAccount && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Demo account settings (Account, KYC, and Bank Details) cannot be modified.
                </div>
              )}
              
              {serverError && (
                <Badge variant="destructive" className="w-full py-2.5 rounded-lg justify-center border-destructive/20 text-xs">
                  {serverError}
                </Badge>
              )}

              {successMsg && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-semibold p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {successMsg}
                </div>
              )}

              <AnimatePresence mode="wait">
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">Full Name</label>
                        <Input disabled={!isEditing || profile?.isDemoAccount} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Email Address</label>
                        <Input type="email" disabled={!isEditing || profile?.isDemoAccount} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Mobile Number</label>
                        <Input disabled={!isEditing || profile?.isDemoAccount} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Address</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-muted-foreground">Village / Area Name</label>
                          <Input disabled={!isEditing} value={formData.location.address} onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">City</label>
                          <Input disabled={!isEditing} value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">District</label>
                          <Input disabled={!isEditing} value={formData.location.district} onChange={e => setFormData({ ...formData, location: { ...formData.location, district: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">State</label>
                          <Input disabled={!isEditing} value={formData.location.state} onChange={e => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Pincode</label>
                          <Input disabled={!isEditing} value={formData.location.zipCode} onChange={e => setFormData({ ...formData, location: { ...formData.location, zipCode: e.target.value } })} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'kyc' && (
                  <motion.div
                    key="kyc"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Verification Status:</span>
                      <Badge className={`uppercase text-xs font-semibold ${
                        formData.kyc.status === 'verified' ? 'bg-green-600 text-white' : 
                        formData.kyc.status === 'pending' ? 'bg-yellow-600 text-white' : 
                        'bg-red-600/20 text-red-500 border border-red-500/20'
                      }`}>
                        {formData.kyc.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Aadhaar Card Number</label>
                      <Input disabled={!isEditing || profile?.isDemoAccount} maxLength={12} placeholder="Enter 12-digit Aadhaar" value={formData.kyc.aadhaarNumber} onChange={e => setFormData({ ...formData, kyc: { ...formData.kyc, aadhaarNumber: e.target.value } })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground block">Aadhaar Front Side</label>
                        {frontPreview ? (
                          <div className="relative rounded-lg overflow-hidden border border-border h-36">
                            <img src={frontPreview} alt="Aadhaar Front" className="w-full h-full object-cover" />
                            {isEditing && !profile?.isDemoAccount && (
                              <button onClick={() => { setFrontPreview(''); setFrontBase64(''); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <label className={`border-2 border-dashed rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer transition-colors ${isEditing && !profile?.isDemoAccount ? 'border-border hover:bg-secondary/20' : 'border-border/40 opacity-50 cursor-not-allowed'}`}>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Upload Front</span>
                            <input disabled={!isEditing || profile?.isDemoAccount} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'front')} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground block">Aadhaar Back Side</label>
                        {backPreview ? (
                          <div className="relative rounded-lg overflow-hidden border border-border h-36">
                            <img src={backPreview} alt="Aadhaar Back" className="w-full h-full object-cover" />
                            {isEditing && !profile?.isDemoAccount && (
                              <button onClick={() => { setBackPreview(''); setBackBase64(''); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <label className={`border-2 border-dashed rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer transition-colors ${isEditing && !profile?.isDemoAccount ? 'border-border hover:bg-secondary/20' : 'border-border/40 opacity-50 cursor-not-allowed'}`}>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Upload Back</span>
                            <input disabled={!isEditing || profile?.isDemoAccount} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'back')} />
                          </label>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'farm' && (
                  <motion.div
                    key="farm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1"><Tractor className="w-3.5 h-3.5" /> Farm Size (in Acres)</label>
                        <Input type="number" disabled={!isEditing} value={formData.farmSize} onChange={e => setFormData({ ...formData, farmSize: e.target.value })} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Farming Experience (Years)</label>
                        <Input type="number" disabled={!isEditing} value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Primary Crops (comma-separated)</label>
                        <Input placeholder="e.g. Rice, Wheat, Sugarcane" disabled={!isEditing} value={formData.crops} onChange={e => setFormData({ ...formData, crops: e.target.value })} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bank' && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">Account Holder Name</label>
                        <Input disabled={!isEditing || profile?.isDemoAccount} value={formData.bankDetails.accountHolderName} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Bank Name</label>
                        <Input disabled={!isEditing || profile?.isDemoAccount} value={formData.bankDetails.bankName} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Account Number</label>
                        <Input disabled={!isEditing || profile?.isDemoAccount} value={formData.bankDetails.accountNumber} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })} />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">IFSC Code</label>
                        <Input disabled={!isEditing || profile?.isDemoAccount} placeholder="e.g. SBIN0001234" value={formData.bankDetails.ifscCode} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      {[
                        { key: 'email', label: 'Receive Email updates for sales and transactions' },
                        { key: 'sms', label: 'Receive SMS alerts for order updates' },
                        { key: 'whatsapp', label: 'Receive Whatsapp notifications' }
                      ].map(setting => (
                        <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20">
                          <span className="text-sm font-medium text-foreground">{setting.label}</span>
                          <input 
                            type="checkbox" 
                            disabled={!isEditing}
                            checked={formData.notificationSettings[setting.key]}
                            onChange={e => setFormData({
                              ...formData,
                              notificationSettings: {
                                ...formData.notificationSettings,
                                [setting.key]: e.target.checked
                              }
                            })}
                            className="w-4 h-4 rounded text-primary border-border focus:ring-primary disabled:opacity-50"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'language' && (
                  <motion.div
                    key="language"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{t('langSettingsDesc')}</p>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium">{t('langLabel')}</label>
                        <div className="grid grid-cols-1 gap-2">
                          {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                                language === lang
                                  ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                                  : 'border-border/50 bg-secondary/10 text-muted-foreground hover:bg-secondary/20 hover:text-foreground'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                language === lang ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                              }`}>
                                {lang.toUpperCase()}
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-semibold">{languageNames[lang]}</div>
                                <div className="text-xs text-muted-foreground">
                                  {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'}
                                </div>
                              </div>
                              {language === lang && (
                                <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
