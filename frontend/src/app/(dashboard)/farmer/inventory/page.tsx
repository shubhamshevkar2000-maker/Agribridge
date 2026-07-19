'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mutate } from 'swr';
import { Plus, Edit2, Trash2, Loader2, Package, Globe, Globe2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCropImageUrl, getValidImageUrl } from '@/utils/cropImages';

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
  harvestDate?: string;
  description?: string;
  status: string;
  location?: {
    address?: string;
    city?: string;
    district?: string;
    state?: string;
    zipCode?: string;
  };
}

export default function InventoryPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingCropId, setEditingCropId] = useState<string | null>(null);

  // Profile default location prefill
  const [profileLocation, setProfileLocation] = useState<any>(null);

  // Form State
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
    address: '',
    city: '',
    district: '',
    state: '',
    zipCode: '',
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchCrops = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/crops/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();

    // Fetch user profile default location details
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
        console.error('Error fetching profile location details:', err);
      }
    };
    fetchProfile();
  }, []);

  // Update form fields when editing crop changes or form opens
  useEffect(() => {
    if (isFormOpen) {
      if (editingCropId) {
        const crop = crops.find(c => c._id === editingCropId);
        if (crop) {
          setFormData({
            name: crop.name,
            category: crop.category,
            variety: crop.variety || '',
            quantity: crop.quantity.toString(),
            unit: crop.unit,
            pricePerUnit: crop.pricePerUnit.toString(),
            isOrganic: crop.isOrganic,
            harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '',
            description: crop.description || '',
            address: crop.location?.address || '',
            city: crop.location?.city || '',
            district: crop.location?.district || '',
            state: crop.location?.state || '',
            zipCode: crop.location?.zipCode || '',
          });
          setImagePreview(crop.images?.[0] || null);
          setUploadedImage(null);
        }
      } else {
        // Reset form for creation and prefill from profile
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
  }, [isFormOpen, editingCropId, crops, profileLocation]);

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

  const handleSubmit = async (e: React.FormEvent, forceSubmit = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCropId 
        ? `/api/crops/${editingCropId}`
        : `/api/crops`;
      const method = editingCropId ? 'PUT' : 'POST';

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
            handleSubmit(e, true);
            return;
          } else {
            throw new Error('Cancelled duplicate creation.');
          }
        }
        throw new Error(data.message || (data.errors ? data.errors[0].message : 'Failed to save crop'));
      }
      
      setIsFormOpen(false);
      setEditingCropId(null);
      fetchCrops();
      mutate('/api/dashboard/farmer');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/crops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to delete crop');
      } else {
        fetchCrops();
        mutate('/api/dashboard/farmer');
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleEdit = (crop: Crop) => {
    setEditingCropId(crop._id);
    setIsFormOpen(true);
  };

  const handleTogglePublish = async (crop: Crop) => {
    const isPublished = crop.status === 'listed';
    const action = isPublished ? 'unpublish' : 'publish';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/crops/${crop._id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchCrops();
        mutate('/api/dashboard/farmer');
      } else {
        alert(data.message || `Failed to ${action} crop`);
      }
    } catch (err) {
      console.error(`${action} failed`, err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your crops, update stock, and publish listings to the marketplace.</p>
        </div>
        <Button onClick={() => {
          if (isFormOpen) {
            setIsFormOpen(false);
            setEditingCropId(null);
          } else {
            setIsFormOpen(true);
          }
        }} className="bg-primary hover:bg-primary/90 text-white gap-2">
          {isFormOpen ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New Crop</>}
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="glass-card border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>{editingCropId ? 'Edit Crop' : 'Add New Crop (Draft)'}</CardTitle>
                <CardDescription>
                  {editingCropId 
                    ? 'Update details about your harvest.' 
                    : 'Crops are added as draft. You can publish them immediately or keep them in drafts.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Crop Name *</label>
                      <Input 
                        required 
                        placeholder="e.g., Organic Tomatoes" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <select 
                        className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option>Vegetables</option>
                        <option>Fruits</option>
                        <option>Grains</option>
                        <option>Spices</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Variety (Optional)</label>
                      <Input 
                        placeholder="e.g., Pusa 1121" 
                        value={formData.variety}
                        onChange={(e) => setFormData({...formData, variety: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity *</label>
                      <div className="flex gap-2">
                        <Input 
                          required 
                          type="number" 
                          min="0.01" 
                          step="any"
                          placeholder="e.g., 500" 
                          className="flex-1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        />
                        <select 
                          className="w-28 h-10 px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        >
                          <option value="kg">kg</option>
                          <option value="quintal">quintal</option>
                          <option value="ton">ton</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price per Unit (₹) *</label>
                      <Input 
                        required 
                        type="number" 
                        min="0.01" 
                        step="any"
                        placeholder="e.g., 40"
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Harvest Date (Optional)</label>
                      <Input 
                        type="date"
                        value={formData.harvestDate}
                        onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <textarea 
                      placeholder="Add details about quality, texture, harvesting process..." 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Crop Image {editingCropId ? '(Optional to replace)' : '*'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 items-center border border-dashed border-border/80 rounded-2xl p-4 bg-secondary/10">
                      {imagePreview && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border bg-muted">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-1">
                        <Input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp" 
                          required={!editingCropId}
                          onChange={handleFileChange}
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Supported types: JPEG, PNG, WebP. Max size: 5 MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Location editable sub-section */}
                  <div className="border-t border-border/30 pt-4 space-y-3">
                    <h3 className="text-sm font-semibold">Location Details (Autofilled but editable)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                        <label className="text-xs text-muted-foreground">Street Address</label>
                        <Input 
                          placeholder="Street Address" 
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">City</label>
                        <Input 
                          placeholder="City" 
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">District</label>
                        <Input 
                          placeholder="District" 
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">State</label>
                        <Input 
                          placeholder="State" 
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Zip Code</label>
                        <Input 
                          placeholder="Zip Code" 
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input 
                      type="checkbox" 
                      id="organic"
                      className="w-4 h-4 text-primary rounded border-border"
                      checked={formData.isOrganic}
                      onChange={(e) => setFormData({...formData, isOrganic: e.target.checked})}
                    />
                    <label htmlFor="organic" className="text-sm font-medium cursor-pointer">Certified Organic Harvest</label>
                  </div>
                  
                  {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => { setIsFormOpen(false); setEditingCropId(null); }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/95 text-white">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                        </>
                      ) : (
                        editingCropId ? 'Save Changes' : 'Save as Draft'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : crops.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No crops added.</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't added any crops to your inventory yet. Add your harvest to get started.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>Add Your First Crop</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Crop Name</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop) => (
                    <tr key={crop._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getValidImageUrl(crop.images?.[0], crop.name)} 
                            alt={crop.name} 
                            className="w-10 h-10 object-cover rounded-lg bg-muted shrink-0 border border-border/30" 
                            loading="lazy" 
                          />
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                              {crop.name}
                              {crop.isOrganic && (
                                <Badge variant="outline" className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-500/20">Organic</Badge>
                              )}
                            </span>
                            {crop.variety && (
                              <span className="text-[10px] text-muted-foreground font-normal">Variety: {crop.variety}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{crop.category}</td>
                      <td className="px-6 py-4 font-medium">
                        {crop.quantity} <span className="text-muted-foreground text-xs">{crop.unit}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ₹{crop.pricePerUnit} <span className="text-muted-foreground text-xs">/{crop.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={
                          crop.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-none' :
                          crop.status === 'listed' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-none animate-pulse' :
                          crop.status === 'in_auction' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-none' :
                          crop.status === 'sold' ? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 shadow-none' :
                          'bg-primary/10 text-primary border-transparent shadow-none'
                        }>
                          {crop.status === 'listed' ? 'Listed' : crop.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {crop.status !== 'in_auction' && crop.status !== 'sold' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 text-xs px-2.5 rounded-lg font-semibold flex items-center gap-1 ${
                                  crop.status === 'listed'
                                    ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
                                    : 'border-primary text-primary hover:bg-primary/10'
                                }`}
                                onClick={() => handleTogglePublish(crop)}
                              >
                                {crop.status === 'listed' ? (
                                  <>
                                    <Globe className="w-3.5 h-3.5" /> Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Globe2 className="w-3.5 h-3.5" /> Publish
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit(crop)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(crop._id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                              Locked ({crop.status.replace('_', ' ')})
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
