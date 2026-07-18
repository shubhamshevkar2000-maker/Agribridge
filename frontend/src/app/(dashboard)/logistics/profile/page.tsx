import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Truck, Building2 } from "lucide-react";

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="p-8 glass-card border-border/50 rounded-2xl max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-heading font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          This feature is currently under development. Please check back later in the next phase!
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-3xl bg-primary text-white">
                
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
