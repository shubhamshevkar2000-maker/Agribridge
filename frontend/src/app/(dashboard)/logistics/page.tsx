"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";

// Mock Stops fallback, now handled via state
// const stops = [];

export default function LogisticsDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [assignedDeliveries, setAssignedDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("agribridge_token");
        const res = await fetch(
          `/api/deliveries/pool`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const resAssigned = await fetch(
          `/api/deliveries/assigned`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const json = await res.json();
        const jsonAssigned = await resAssigned.json();
        
        if (json.success) {
          setDashboardData(json.data);
        }
        if (jsonAssigned.success) {
          setAssignedDeliveries(jsonAssigned.data);
        }
      } catch (err) {
        console.error("Error fetching pools:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPools();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("agribridge_token");
      const res = await fetch(`/api/deliveries/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the assigned list
        setAssignedDeliveries(prev => prev.map(d => d._id === id ? { ...d, status } : d));
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptPool = async (orderIds: string[]) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/deliveries/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIds })
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.message || "Failed to accept deliveries");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pools = dashboardData || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
      {/* Left Column: Itinerary */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-8">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading">
              {pools.length > 0
                ? `${pools.length} Suggested Pools`
                : "No Active Routes"}
            </CardTitle>
            <CardDescription>
              {pools.length > 0
                ? "Cost-sharing pooled routes"
                : "No pending deliveries to pool"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {pools.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl border border-border/50">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    Vehicle:{" "}
                    {pools[0]?.vehicleId?.registrationNumber || "Unassigned"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Driver: {pools[0]?.driverId?.name || "Unassigned"}
                  </div>
                </div>
              </div>
            )}

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading pools...
                </div>
              ) : pools.length > 0 ? (
                pools.map((pool: any, index: number) => (
                  <div
                    key={pool.poolId}
                    className="relative z-10 flex flex-col gap-2 mb-6"
                  >
                    <div className="flex items-center gap-2 font-bold text-lg mb-2">
                      <Truck className="text-primary w-5 h-5" /> Pool #
                      {index + 1}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Total Vol: {pool.totalQuantity} units</span>
                      <span>
                        Est. Cost: ₹{pool.estimatedTotalCost.toFixed(2)}
                      </span>
                    </div>
                    {pool.orders.map((o: any) => (
                      <div
                        key={o.orderId}
                        className={`flex flex-col flex-1 p-4 rounded-xl border bg-background border-border/50`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className={`font-semibold text-foreground`}>
                            {o.crop?.name} (Farmer: {o.farmer?.name})
                          </div>
                          <Badge
                            variant="outline"
                            className="text-orange-500 border-orange-500/30"
                          >
                            PICKUP
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Qty: {o.quantity}
                          </span>
                          <span className="font-bold text-primary">
                            Split Cost: ₹{o.costShare.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button 
                      onClick={() => handleAcceptPool(pool.orders.map((o: any) => o.orderId))}
                      className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      Accept Pool Delivery
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/50 bg-secondary/20">
                  <Navigation className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-1">
                    No Active Deliveries
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have no upcoming stops in your itinerary.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Interactive Map Mock */}
      <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-[500px] overflow-hidden rounded-3xl border border-border/50 bg-secondary/20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 dark:opacity-5 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 p-6 flex flex-col h-full overflow-y-auto">
          <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-primary w-6 h-6" /> Assigned Deliveries
          </h2>
          
          {assignedDeliveries.length > 0 ? (
            <div className="space-y-4">
              {assignedDeliveries.map((delivery) => (
                <Card key={delivery._id} className="glass-card border-border/50">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Delivery #{delivery._id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Crop: {delivery.orderId?.cropId?.name || "Unknown"} ({delivery.orderId?.cropId?.quantity} {delivery.orderId?.cropId?.unit})
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="uppercase">
                      {delivery.status.replace('_', ' ')}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1 mb-4">
                      <p><strong>From:</strong> {delivery.orderId?.farmerId?.name || "Unknown Farmer"} ({delivery.orderId?.farmerId?.location?.coordinates?.join(", ") || "N/A"})</p>
                      <p><strong>To:</strong> {delivery.orderId?.buyerId?.name || "Unknown Buyer"} ({delivery.orderId?.buyerId?.location?.coordinates?.join(", ") || "N/A"})</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant={delivery.status === 'pending' ? 'default' : 'outline'} onClick={() => handleStatusUpdate(delivery._id, 'pending')}>Pending</Button>
                      <Button size="sm" variant={delivery.status === 'in_transit' ? 'default' : 'outline'} onClick={() => handleStatusUpdate(delivery._id, 'in_transit')}>In Transit</Button>
                      <Button size="sm" variant={delivery.status === 'delivered' ? 'default' : 'outline'} onClick={() => handleStatusUpdate(delivery._id, 'delivered')}>Delivered</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-heading font-bold mb-2">
                No Deliveries Assigned
              </h3>
              <p className="text-muted-foreground max-w-sm">
                You currently have no active deliveries assigned to your fleet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
