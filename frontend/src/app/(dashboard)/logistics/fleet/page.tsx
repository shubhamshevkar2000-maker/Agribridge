"use client";

import { Truck, Fuel, User, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fleet = [
  {
    id: 1,
    truck: "MH12AB4567",
    driver: "Rahul Patil",
    capacity: "3 Ton",
    fuel: 78,
    status: "Active",
  },
  {
    id: 2,
    truck: "MH14XY9876",
    driver: "Unassigned",
    capacity: "5 Ton",
    fuel: 96,
    status: "Available",
  },
  {
    id: 3,
    truck: "MH12AB5555",
    driver: "Amit Sharma",
    capacity: "4 Ton",
    fuel: 42,
    status: "Maintenance",
  },
];

export default function FleetStatusPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Fleet Status</h1>
        <p className="text-muted-foreground">
          Monitor vehicles and drivers in real time.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Trucks</p>
            <h2 className="text-3xl font-bold">12</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active</p>
            <h2 className="text-3xl font-bold text-green-600">7</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Available</p>
            <h2 className="text-3xl font-bold text-blue-600">3</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Maintenance</p>
            <h2 className="text-3xl font-bold text-orange-500">2</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {fleet.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Truck className="text-primary" />
                  <div>
                    <h2 className="font-semibold">{vehicle.truck}</h2>
                    <p className="text-sm text-muted-foreground">
                      Capacity: {vehicle.capacity}
                    </p>
                  </div>
                </div>

                <Badge>{vehicle.status}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  {vehicle.driver}
                </div>

                <div className="flex items-center gap-2">
                  <Fuel size={16} />
                  Fuel: {vehicle.fuel}%
                </div>

                <div className="flex items-center gap-2">
                  <Wrench size={16} />
                  {vehicle.status}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">View Details</Button>

                {vehicle.status === "Available" && (
                  <Button variant="outline">Assign</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
