'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          // Trigger browser print dialog after render
          setTimeout(() => {
            window.print();
          }, 800);
        } else {
          setError(data.message || 'Invoice details not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load invoice.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground font-semibold">Generating invoice layout...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 text-center space-y-4">
        <h3 className="text-lg font-bold text-rose-500">Invoice Error</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => router.back()} className="rounded-xl">Go Back</Button>
      </div>
    );
  }

  const crop = order.cropId || {};
  const buyer = order.buyerId || {};
  const farmer = order.farmerId || {};
  const dateStr = new Date(order.createdAt).toLocaleDateString();
  const gstAmount = Math.round(order.totalAmount * 0.05); // 5% GST example
  const subtotal = order.totalAmount - gstAmount;
  const invoiceNumber = `AB-${order._id.substring(order._id.length - 8).toUpperCase()}`;

  return (
    <div className="max-w-[800px] mx-auto p-4 md:p-6 space-y-6">
      {/* Action header (Hidden during print) */}
      <div className="flex justify-between items-center bg-secondary/20 p-4 border border-border/50 rounded-2xl print:hidden">
        <Button variant="ghost" className="gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* CSS Styling to hide navigation during print */}
      <style jsx global>{`
        @media print {
          /* Hide all Next.js dashboard elements, sidebar, topbar */
          body * {
            visibility: hidden;
          }
          /* Show only the invoice container */
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            color: #000 !important;
            background: #fff !important;
          }
          /* Hide print preview control buttons */
          .print-hidden-element {
            display: none !important;
          }
        }
      `}</style>

      {/* Printable Invoice Container */}
      <div 
        id="printable-invoice" 
        className="bg-white text-black p-8 md:p-12 border border-slate-200 rounded-3xl shadow-sm space-y-8 font-sans"
      >
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">AgriBridge</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Direct Farm-to-Buyer Marketplace</p>
          </div>
          <div className="text-right">
            <h1 className="font-extrabold text-2xl text-slate-800 uppercase tracking-wide">TAX INVOICE</h1>
            <p className="text-xs text-slate-500 mt-1">Invoice No: <span className="font-bold text-slate-700">{invoiceNumber}</span></p>
          </div>
        </div>

        {/* Meta / Addresses */}
        <div className="grid grid-cols-3 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice To</h4>
            <div className="space-y-0.5 text-slate-800">
              <p className="font-bold text-sm">{buyer.name || 'Buyer Name'}</p>
              <p>{buyer.email || 'N/A'}</p>
              <p>Ph: {buyer.phone || 'N/A'}</p>
              {buyer.location?.district && <p>{buyer.location.district}, {buyer.location.state}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Sourced From</h4>
            <div className="space-y-0.5 text-slate-800">
              <p className="font-bold text-sm">{farmer.name || 'Farmer Name'}</p>
              <p>{farmer.email || 'N/A'}</p>
              <p>Ph: {farmer.phone || 'N/A'}</p>
              {farmer.location?.district && <p>{farmer.location.district}, {farmer.location.state}</p>}
            </div>
          </div>

          <div className="text-right">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Details</h4>
            <div className="space-y-1 text-slate-800">
              <p>Date: <span className="font-semibold">{dateStr}</span></p>
              <p>Order ID: <span className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded">{order._id}</span></p>
              <p>Payment: <span className="font-semibold capitalize">{order.paymentStatus === 'completed' ? 'Cash Confirmed' : 'COD (Pending)'}</span></p>
            </div>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">Crop Item / Variety</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-right">Quantity</th>
                <th className="p-4 text-right">Unit Price</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-bold text-slate-800">
                  {crop.name || 'Crop'} {crop.variety ? `(${crop.variety})` : ''}
                </td>
                <td className="p-4 text-center capitalize">{crop.category || 'N/A'}</td>
                <td className="p-4 text-right font-semibold">{order.quantity} {crop.unit || 'units'}</td>
                <td className="p-4 text-right">₹{crop.pricePerUnit || 0}</td>
                <td className="p-4 text-right font-bold">₹{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-between items-start pt-4">
          <div className="text-[10px] text-slate-400 max-w-[300px]">
            <p className="font-bold uppercase tracking-wider mb-1">Notes</p>
            <p>This invoice is issued on behalf of the registered farmer. Sourcing transactions on AgriBridge comply with standard agricultural marketing protocols.</p>
          </div>
          <div className="w-64 space-y-2 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST / SGST (5%)</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between text-sm font-extrabold text-slate-800">
              <span>Grand Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="border-t border-slate-100 pt-8 text-center text-[10px] text-slate-400 font-medium">
          <p>Thank you for choosing AgriBridge to support local farmers!</p>
          <p className="mt-1 font-bold">Computer Generated Invoice - No Signature Required</p>
        </div>
      </div>
    </div>
  );
}
