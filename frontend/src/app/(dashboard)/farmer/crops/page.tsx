'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Store, Tag, Sparkles, AlertCircle, Edit2, Trash2, Globe, Globe2, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { CropImage } from '@/components/ui/crop-image';

interface Crop {
  _id: string;
  name: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  images: string[];
  qualityGrade?: string;
  harvestDate?: string;
  description?: string;
  status: 'draft' | 'listed' | 'in_auction' | 'sold' | 'expired';
  location?: {
    address?: string;
    city?: string;
    district?: string;
    state?: string;
    zipCode?: string;
    coordinates?: number[];
  };
}

export default function MyCropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Profile location data
  const [profileLocation, setProfileLocation] = useState<any>(null);

  // Form State
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    variety: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    isOrganic: false,
    harvestDate: '',
    description: '',
    publish: 'No',
    address: '',
    city: '',
    district: '',
    state: '',
    zipCode: '',
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/crops/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();

    // Fetch user profile for default location prefill
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data?.location) {
          setProfileLocation(data.data.location);
        }
      } catch (err) {
        console.error('Error fetching profile location:', err);
      }
    };
    fetchProfile();
  }, []);

  // Set form fields on modal open (for edit or add)
  useEffect(() => {
    if (isAddModalOpen) {
      if (editingCrop) {
        setFormData({
          name: editingCrop.name,
          category: editingCrop.category,
          variety: editingCrop.variety || '',
          quantity: editingCrop.quantity.toString(),
          unit: editingCrop.unit,
          pricePerUnit: editingCrop.pricePerUnit.toString(),
          isOrganic: editingCrop.isOrganic,
          harvestDate: editingCrop.harvestDate ? new Date(editingCrop.harvestDate).toISOString().split('T')[0] : '',
          description: editingCrop.description || '',
          publish: editingCrop.status === 'listed' ? 'Yes' : 'No',
          address: editingCrop.location?.address || '',
          city: editingCrop.location?.city || '',
          district: editingCrop.location?.district || '',
          state: editingCrop.location?.state || '',
          zipCode: editingCrop.location?.zipCode || '',
        });
        setImagePreview(editingCrop.images?.[0] || null);
        setUploadedImage(null);
      } else {
        // Reset form for new crop and prefill location from profile
        setFormData({
          name: '',
          category: 'Vegetables',
          variety: '',
          quantity: '',
          unit: 'kg',
          pricePerUnit: '',
          isOrganic: false,
          harvestDate: '',
          description: '',
          publish: 'No',
          address: profileLocation?.address || '',
          city: profileLocation?.city || '',
          district: profileLocation?.district || '',
          state: profileLocation?.state || '',
          zipCode: profileLocation?.zipCode || '',
        });
        setImagePreview(null);
        setUploadedImage(null);
      }
      setError('');
    }
  }, [isAddModalOpen, editingCrop, profileLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5 MB limit.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setUploadedImage(base64Str);
        setImagePreview(base64Str);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, forceSubmit = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = editingCrop ? `/api/crops/${editingCrop._id}` : '/api/crops';
      const method = editingCrop ? 'PUT' : 'POST';

      const payload: any = {
        name: formData.name,
        category: formData.category,
        variety: formData.variety || undefined,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        pricePerUnit: Number(formData.pricePerUnit),
        isOrganic: formData.isOrganic,
        harvestDate: formData.harvestDate || undefined,
        description: formData.description || undefined,
        image: uploadedImage || undefined,
        status: formData.publish === 'Yes' ? 'listed' : 'draft',
        location: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          zipCode: formData.zipCode,
          coordinates: profileLocation?.coordinates || [0, 0]
        },
        force: forceSubmit
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.duplicate) {
          const confirmForce = window.confirm(
            'A crop with the same name, variety, and harvest date already exists in your inventory. Do you want to add this duplicate entry anyway?'
          );
          if (confirmForce) {
            setIsSubmitting(false);
            handleFormSubmit(e, true);
            return;
          } else {
            throw new Error('Cancelled duplicate creation.');
          }
        }
        throw new Error(data.message || 'Failed to save crop');
      }

      setIsAddModalOpen(false);
      setEditingCrop(null);
      fetchCrops();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/crops/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCrops();
      } else {
        alert(data.message || 'Failed to delete crop');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleTogglePublish = async (crop: Crop) => {
    const isPublished = crop.status === 'listed';
    const action = isPublished ? 'unpublish' : 'publish';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/crops/${crop._id}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCrops();
      } else {
        alert(data.message || `Failed to ${action} crop`);
      }
    } catch (err) {
      console.error(`${action} failed:`, err);
    }
  };

  const getStatusBadge = (status: Crop['status']) => {
    const config = {
      draft: { label: 'Draft', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      listed: { label: 'Listed', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      in_auction: { label: 'In Auction', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      sold: { label: 'Sold', color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' },
      expired: { label: 'Expired', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const item = config[status] || { label: status, color: 'bg-secondary text-secondary-foreground' };
    return <Badge variant="outline" className={`font-semibold ${item.color}`}>{item.label}</Badge>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2 text-foreground">
            <Store className="w-8 h-8 text-primary" /> My Crops
          </h1>
          <p className="text-muted-foreground">Manage your harvest, list items to marketplace or start live auctions.</p>
        </div>
        <Button onClick={() => { setEditingCrop(null); setIsAddModalOpen(true); }} className="bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl">
          <Plus className="w-5 h-5" /> Add Crop
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-secondary/20 h-80 border-border/50 rounded-2xl" />
          ))}
        </div>
      ) : crops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/10"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-foreground">No crops added yet.</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">Start by adding your first crop.</p>
          <Button onClick={() => { setEditingCrop(null); setIsAddModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-xl mt-6">
            <Plus className="w-4 h-4 mr-2" /> Add Crop
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop, index) => (
            <motion.div
              key={crop._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-border/50 rounded-2xl hover:border-primary/30 transition-all group overflow-hidden flex flex-col h-full">
                {/* Crop Image container */}
                <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  <CropImage 
                    images={crop.images} 
                    alt={crop.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {crop.isOrganic && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-600 hover:bg-green-600 text-white font-semibold shadow-md">Organic</Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-heading font-bold group-hover:text-primary transition-colors text-foreground">
                        {crop.name}
                      </CardTitle>
                      {crop.variety && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Variety: {crop.variety}</p>
                      )}
                      <CardDescription className="flex items-center gap-1.5 mt-1 font-medium">
                        <Tag className="w-3.5 h-3.5 text-primary" /> {crop.category}
                      </CardDescription>
                    </div>
                    {getStatusBadge(crop.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Quantity</span>
                        <span className="text-base font-semibold text-foreground">
                          {crop.quantity} {crop.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Price</span>
                        <span className="text-base font-bold text-primary">
                          ₹{crop.pricePerUnit} <span className="text-xs font-normal text-muted-foreground">/{crop.unit}</span>
                        </span>
                      </div>
                    </div>

                    {crop.harvestDate && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                        Harvest Date: {new Date(crop.harvestDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    )}
                  </div>

                  {/* Actions footer for management */}
                  <div className="pt-4 border-t border-border/30 flex justify-between gap-2 mt-4 shrink-0">
                    {crop.status !== 'in_auction' && crop.status !== 'sold' ? (
                      <>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setEditingCrop(crop); setIsAddModalOpen(true); }}
                            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-xl"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(crop._id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-secondary/50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(crop)}
                          className={`h-9 px-3 rounded-xl font-semibold flex items-center gap-1.5 ${
                            crop.status === 'listed' 
                              ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10' 
                              : 'border-primary/30 text-primary hover:bg-primary/10'
                          }`}
                        >
                          {crop.status === 'listed' ? (
                            <>
                              <Globe className="w-4 h-4" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Globe2 className="w-4 h-4" /> Publish
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> No actions available (crop {crop.status.replace('_', ' ')})
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal overlays */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
              onClick={() => { setIsAddModalOpen(false); setEditingCrop(null); }}
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white border border-border/50 rounded-2xl w-full max-h-[85vh] shadow-2xl relative flex flex-col overflow-hidden z-10 mx-auto"
              style={{ 
                maxWidth: '880px', 
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)', 
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                opacity: 1
              }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-border/30 px-6 py-5 shrink-0 bg-white relative">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {editingCrop ? 'Edit Crop Details' : 'Add New Crop'}
                  </h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setIsAddModalOpen(false); setEditingCrop(null); }}
                  className="rounded-full h-8 w-8 hover:bg-secondary absolute right-6 top-5"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Form Content */}
              <form onSubmit={(e) => handleFormSubmit(e)} className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">Crop Name *</label>
                      <Input 
                        required 
                        placeholder="e.g., Basmati Rice" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">Category *</label>
                      <select 
                        className="w-full h-12 px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option>Vegetables</option>
                        <option>Fruits</option>
                        <option>Grains</option>
                        <option>Spices</option>
                        <option>Fiber</option>
                        <option>Pulses/Oilseeds</option>
                        <option>Cash Crop</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">Variety (Optional)</label>
                      <Input 
                        placeholder="e.g., Pusa 1121" 
                        value={formData.variety}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">Quantity *</label>
                      <div className="flex gap-2">
                        <Input 
                          required 
                          type="number" 
                          min="0.01" 
                          step="any"
                          placeholder="e.g., 50" 
                          className="flex-1 h-12 rounded-xl"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                        <select 
                          className="w-28 h-12 px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                          <option value="kg">kg</option>
                          <option value="quintal">quintal</option>
                          <option value="ton">ton</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">Price per Unit (₹) *</label>
                      <Input 
                        required 
                        type="number" 
                        min="0.01" 
                        step="any"
                        placeholder="e.g., 85" 
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">Harvest Date (Optional)</label>
                      <Input 
                        type="date" 
                        value={formData.harvestDate}
                        onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground block">Description (Optional)</label>
                    <textarea 
                      placeholder="Provide details about quality, texture, production methods..." 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground block">
                      Crop Image {editingCrop ? '(Optional to replace)' : '*'}
                    </label>
                    <div className="flex flex-row gap-4 items-center border border-dashed border-border rounded-xl p-4 bg-secondary/5">
                      {imagePreview && (
                        <div 
                          className="rounded-lg overflow-hidden shrink-0 border bg-muted"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-1.5">
                        <Input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp" 
                          required={!editingCrop}
                          onChange={handleFileChange}
                          className="bg-background h-12 rounded-xl flex items-center"
                        />
                        <p className="text-xs text-muted-foreground">Supported types: JPEG, PNG, WebP. Max size: 5 MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Location editable sub-form */}
                  <div className="border-t border-border/30 pt-6 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">Location Details (Autofilled but editable)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                        <label className="text-xs text-muted-foreground font-semibold">Street Address</label>
                        <Input 
                          placeholder="Street or Farm address" 
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-semibold">City</label>
                        <Input 
                          placeholder="City" 
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-semibold">District</label>
                        <Input 
                          placeholder="District" 
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-semibold">State</label>
                        <Input 
                          placeholder="State" 
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-semibold">Zip / Pin Code</label>
                        <Input 
                          placeholder="Pin code" 
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/30 pt-6">
                    <div className="flex items-center gap-2.5 h-12">
                      <input 
                        type="checkbox" 
                        id="isOrganic"
                        className="w-5 h-5 text-primary rounded-lg border-border focus:ring-primary cursor-pointer"
                        checked={formData.isOrganic}
                        onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                      />
                      <label htmlFor="isOrganic" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                        Certified Organic Harvest
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Publish to Marketplace Immediately?</label>
                      <select 
                        className="w-full h-12 px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none"
                        value={formData.publish}
                        onChange={(e) => setFormData({ ...formData, publish: e.target.value })}
                      >
                        <option value="No">No (Keep as Draft)</option>
                        <option value="Yes">Yes (Publish Immediately)</option>
                      </select>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive font-bold">{error}</p>}
                </div>

                {/* Sticky Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-border/30 bg-white shrink-0 sticky bottom-0 z-20">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => { setIsAddModalOpen(false); setEditingCrop(null); }}
                    className="rounded-xl h-12 px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl gap-2 h-12 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      editingCrop ? 'Save Changes' : 'Create Crop'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
