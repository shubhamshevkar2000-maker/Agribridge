"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, Navigation } from "lucide-react";

export default function ActiveRoutesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Active Routes</h1>
        <p className="text-muted-foreground">
          Monitor all deliveries currently in transit.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Truck className="w-16 h-16 text-primary mb-4" />

            <h2 className="text-2xl font-semibold">No Active Routes</h2>

            <p className="text-muted-foreground mt-2 max-w-md">
              Once delivery pools are accepted, active delivery routes will
              appear here with live tracking, ETA and driver details.
            </p>
          </div>
        </CardContent>
      </Card>

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
