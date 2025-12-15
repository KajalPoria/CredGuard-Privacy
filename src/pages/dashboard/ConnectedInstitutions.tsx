import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  CheckCircle2,
  Clock,
  Link,
  Unlink,
  Plus,
  Search,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Institution {
  id: string;
  name: string;
  country: string;
  type: string;
  connectedDate: string;
  status: "connected" | "pending" | "disconnected";
  verifications: number;
  lastAccess: string;
  trustLevel: "platinum" | "gold" | "silver";
}

const initialInstitutions: Institution[] = [
  {
    id: "INST-001",
    name: "Global Bank UK",
    country: "United Kingdom",
    type: "Commercial Bank",
    connectedDate: "2023-06-15",
    status: "connected",
    verifications: 45,
    lastAccess: "2 hours ago",
    trustLevel: "platinum",
  },
  {
    id: "INST-002",
    name: "FinTech Partners AG",
    country: "Switzerland",
    type: "Digital Bank",
    connectedDate: "2023-09-20",
    status: "connected",
    verifications: 28,
    lastAccess: "1 day ago",
    trustLevel: "gold",
  },
  {
    id: "INST-003",
    name: "Nordic Credit Union",
    country: "Sweden",
    type: "Credit Union",
    connectedDate: "2024-01-10",
    status: "pending",
    verifications: 0,
    lastAccess: "Never",
    trustLevel: "silver",
  },
  {
    id: "INST-004",
    name: "Asia Pacific Finance",
    country: "Singapore",
    type: "Investment Bank",
    connectedDate: "2023-11-05",
    status: "connected",
    verifications: 62,
    lastAccess: "5 hours ago",
    trustLevel: "platinum",
  },
  {
    id: "INST-005",
    name: "Euro Finance Group",
    country: "Germany",
    type: "Commercial Bank",
    connectedDate: "2023-08-12",
    status: "connected",
    verifications: 34,
    lastAccess: "3 days ago",
    trustLevel: "gold",
  },
];

const availableInstitutions = [
  { name: "Canadian Trust Bank", country: "Canada", type: "Commercial Bank" },
  { name: "Australian Credit Corp", country: "Australia", type: "Credit Provider" },
  { name: "Tokyo Finance Group", country: "Japan", type: "Investment Bank" },
  { name: "Mumbai Central Bank", country: "India", type: "Commercial Bank" },
];

const trustLevelConfig = {
  platinum: { color: "text-purple-400", bg: "bg-purple-400/10" },
  gold: { color: "text-yellow-400", bg: "bg-yellow-400/10" },
  silver: { color: "text-gray-400", bg: "bg-gray-400/10" },
};

const ConnectedInstitutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDisconnect = (institutionId: string) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === institutionId ? { ...i, status: "disconnected" as const } : i))
    );
    toast({
      title: "Institution disconnected",
      description: "The connection has been terminated.",
    });
  };

  const handleConnect = (name: string, country: string, type: string) => {
    const newInstitution: Institution = {
      id: `INST-${Date.now()}`,
      name,
      country,
      type,
      connectedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      verifications: 0,
      lastAccess: "Never",
      trustLevel: "silver",
    };
    setInstitutions((prev) => [...prev, newInstitution]);
    setIsDialogOpen(false);
    toast({
      title: "Connection initiated",
      description: `${name} will be connected once they verify your identity.`,
    });
  };

  const filteredInstitutions = institutions.filter(
    (i) =>
      i.status !== "disconnected" &&
      (i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const connectedCount = institutions.filter((i) => i.status === "connected").length;
  const totalVerifications = institutions.reduce((sum, i) => sum + i.verifications, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Connected Institutions</h2>
          <p className="text-muted-foreground">Manage your bank and lender connections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect New Institution</DialogTitle>
              <DialogDescription>
                Select an institution to connect with your encrypted credit identity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {availableInstitutions.map((inst) => (
                <button
                  key={inst.name}
                  onClick={() => handleConnect(inst.name, inst.country, inst.type)}
                  className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">{inst.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {inst.country} • {inst.type}
                      </div>
                    </div>
                  </div>
                  <Link className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{connectedCount}</div>
              <div className="text-sm text-muted-foreground">Connected</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-success/10">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalVerifications}</div>
              <div className="text-sm text-muted-foreground">Total Verifications</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">5</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search institutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Institution Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredInstitutions.map((institution, index) => {
          const trustConfig = trustLevelConfig[institution.trustLevel];

          return (
            <motion.div
              key={institution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gradient-card border-border hover:border-primary/50 transition-smooth h-full">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{institution.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {institution.country}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${trustConfig.bg} ${trustConfig.color}`}>
                      {institution.trustLevel}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground">{institution.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Connected</span>
                      <span className="text-foreground">{institution.connectedDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Verifications</span>
                      <span className="text-foreground font-medium">{institution.verifications}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Access</span>
                      <span className="text-foreground">{institution.lastAccess}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className={`flex items-center gap-2 ${
                      institution.status === "connected" ? "text-success" : "text-yellow-500"
                    }`}>
                      {institution.status === "connected" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium capitalize">{institution.status}</span>
                    </div>
                    {institution.status === "connected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(institution.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredInstitutions.length === 0 && (
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No institutions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or add a new institution.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConnectedInstitutions;
