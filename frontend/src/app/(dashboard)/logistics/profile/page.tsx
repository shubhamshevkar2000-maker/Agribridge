"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, Truck } from "lucide-react";

export default function LogisticsProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics Profile</h1>
        <p className="text-muted-foreground">
          View and manage your logistics partner information.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-3xl bg-primary text-white">
                ET
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">Express Transit Pvt Ltd</h2>

              <Badge className="mt-2">Verified Logistics Partner</Badge>

              <p className="text-muted-foreground mt-3">
                Delivering agricultural produce efficiently across Maharashtra.
              </p>
            </div>

            <Button>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>

            <div className="flex items-center gap-3">
              <Mail size={18} />
              support@expresstransit.com
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} />
              +91 9876543210
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} />
              Pune, Maharashtra
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Fleet Information</h3>

            <div className="flex items-center gap-3">
              <Truck size={18} />
              Total Vehicles : 12
            </div>

            <div className="flex items-center gap-3">
              <Building2 size={18} />
              Company ID : LOG12345
            </div>

            <div className="flex items-center gap-3">
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
