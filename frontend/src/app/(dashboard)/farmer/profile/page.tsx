'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, Landmark, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-destructive">Failed to load profile. Please log in again.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
          {profile.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">{profile.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="uppercase text-xs">{profile.role}</Badge>
            <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> KYC Verified
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Personal information associated with your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Email Address</div>
                <div className="text-sm font-medium">{profile.email || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Phone Number</div>
                <div className="text-sm font-medium">{profile.phone || 'N/A'}</div>
              </div>
            </div>
            {profile.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Location Coordinates</div>
                  <div className="text-sm font-medium">
                    {profile.location.coordinates?.join(', ') || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(profile.role === 'farmer' || profile.role === 'buyer') && (
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Financial & Trust Scoring</CardTitle>
              <CardDescription>Metrics powered by AgriBridge ledger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Global Trust Score</div>
                  <div className="text-lg font-bold text-primary">{profile.trustScore || 300} / 1000</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-xs text-muted-foreground">AgriCredit Score</div>
                  <div className="text-lg font-bold text-purple-500">{profile.creditScore || 300} / 900</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
