'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Crop {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  status: string;
}

export default function InventoryPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingCropId, setEditingCropId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    isOrganic: false
  });

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCropId 
        ? `/api/crops/${editingCropId}`
        : `/api/crops`;
      const method = editingCropId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          pricePerUnit: Number(formData.pricePerUnit),
          isOrganic: formData.isOrganic
        })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors ? data.errors[0].message : 'Failed to save crop'));
      }
      
      setIsFormOpen(false);
      setEditingCropId(null);
      setFormData({
        name: '',
        category: 'Vegetables',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        isOrganic: false
      });
      fetchCrops();
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
      await fetch(`/api/crops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCrops();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleEdit = (crop: Crop) => {
    setFormData({
      name: crop.name,
      category: crop.category,
      quantity: crop.quantity.toString(),
      unit: crop.unit,
      pricePerUnit: crop.pricePerUnit.toString(),
      isOrganic: crop.isOrganic
    });
    setEditingCropId(crop._id);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your crops, update stock, and list new produce.</p>
        </div>
        <Button onClick={() => {
          if (isFormOpen) {
            setIsFormOpen(false);
            setEditingCropId(null);
            setFormData({ name: '', category: 'Vegetables', quantity: '', unit: 'kg', pricePerUnit: '', isOrganic: false });
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
                <CardTitle>{editingCropId ? 'Edit Crop' : 'List New Crop'}</CardTitle>
                <CardDescription>{editingCropId ? 'Update details about your harvest.' : 'Add details about your harvest to list it in the marketplace.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Crop Name</label>
                      <Input 
                        required 
                        placeholder="e.g., Organic Tomatoes" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select 
                        className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
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
                      <label className="text-sm font-medium">Quantity</label>
                      <div className="flex gap-2">
                        <Input 
                          required 
                          type="number" 
                          min="1"
                          placeholder="e.g., 500" 
                          className="flex-1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        />
                        <select 
                          className="w-24 h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        >
                          <option value="kg">kg</option>
                          <option value="ton">ton</option>
                          <option value="quintal">quintal</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price per Unit (₹)</label>
                      <Input 
                        required 
                        type="number" 
                        min="1"
                        placeholder="e.g., 40"
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 flex items-center gap-2 mt-6">
                      <input 
                        type="checkbox" 
                        id="organic"
                        className="w-4 h-4 text-primary rounded border-border"
                        checked={formData.isOrganic}
                        onChange={(e) => setFormData({...formData, isOrganic: e.target.checked})}
                      />
                      <label htmlFor="organic" className="text-sm font-medium cursor-pointer">Certified Organic</label>
                    </div>
                  </div>
                  
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingCropId ? 'Save Changes' : 'Save & List Crop')}
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
              <h3 className="text-xl font-semibold mb-2">Your inventory is empty</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't added any crops to your inventory yet. Add your harvest to start selling in the marketplace.
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
                        <div className="flex items-center gap-2">
                          {crop.name}
                          {crop.isOrganic && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-500/20">Organic</Badge>
                          )}
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
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent shadow-none">
                          {crop.status === 'listed' ? 'Listed' : crop.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(crop)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(crop._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
