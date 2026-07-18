'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, Landmark, CheckCircle2, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', locationX: '', locationY: '' });
  useEffect(() => {
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
          setEditForm({
            name: json.data.name || '',
            phone: json.data.phone || '',
            locationX: json.data.location?.coordinates?.[0] || '',
            locationY: json.data.location?.coordinates?.[1] || ''
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          location: { coordinates: [Number(editForm.locationX), Number(editForm.locationY)] }
        })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <Card className="glass-card border-border/50 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </Button>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Personal information associated with your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                  <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                  <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                    <Input type="number" value={editForm.locationX} onChange={e => setEditForm({...editForm, locationX: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                    <Input type="number" value={editForm.locationY} onChange={e => setEditForm({...editForm, locationY: e.target.value})} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSave}><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
              </div>
            ) : (
              <>
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
              </>
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
