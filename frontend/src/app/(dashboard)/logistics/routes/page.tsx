"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, Navigation, CheckCircle } from "lucide-react";

export default function ActiveRoutesPage() {
  const [assignedDeliveries, setAssignedDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/deliveries/assigned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setAssignedDeliveries(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Active Routes</h1>
        <p className="text-muted-foreground mt-1">
          Monitor all deliveries currently in transit.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : assignedDeliveries.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Truck className="w-16 h-16 text-primary mb-4" />
              <h2 className="text-2xl font-heading font-semibold">No Active Routes</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Once delivery pools are accepted from the dashboard, active delivery routes will
                appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" /> <strong>From:</strong> {delivery.orderId?.farmerId?.name} ({delivery.orderId?.farmerId?.location?.city || 'Nashik'})</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> <strong>To:</strong> {delivery.orderId?.buyerId?.name} ({delivery.orderId?.buyerId?.location?.city || 'Mumbai'})</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Navigation className="mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold">Live Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Real-time vehicle location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-3 text-orange-500" />
            <h3 className="font-semibold">ETA</h3>
            <p className="text-sm text-muted-foreground">
              Estimated arrival time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold">Delivery Stops</h3>
            <p className="text-sm text-muted-foreground">
              Pickup & destination points
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
