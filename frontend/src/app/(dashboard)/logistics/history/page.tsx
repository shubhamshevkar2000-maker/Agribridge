"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Calendar, CheckCircle2, Clock, Truck } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Delivery History</h1>

        <p className="text-muted-foreground">
          View all completed and previous deliveries.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />

            <h2 className="text-2xl font-semibold">No Delivery History</h2>

            <p className="text-muted-foreground mt-2 max-w-md">
              Completed deliveries will appear here along with trip details,
              distance travelled and earnings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Truck className="mx-auto mb-3 text-primary" />

            <h3 className="font-semibold">Completed Trips</h3>

            <p className="text-muted-foreground text-sm">
              View all completed deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="mx-auto mb-3 text-blue-500" />

            <h3 className="font-semibold">Delivery Date</h3>

            <p className="text-muted-foreground text-sm">
              Search by date or month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-3 text-orange-500" />

            <h3 className="font-semibold">Delivery Duration</h3>

            <p className="text-muted-foreground text-sm">
              Track delivery performance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
