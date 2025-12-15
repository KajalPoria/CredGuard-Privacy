import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Check,
  X,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Consent {
  id: string;
  institution: string;
  purpose: string;
  grantedDate: string;
  expiryDate: string;
  status: "active" | "expired" | "revoked";
  dataTypes: string[];
}

const initialConsents: Consent[] = [
  {
    id: "CON-001",
    institution: "Global Bank UK",
    purpose: "Credit verification for loan application",
    grantedDate: "2024-01-10",
    expiryDate: "2025-01-10",
    status: "active",
    dataTypes: ["Trust Score", "Behavioral Pattern", "Verification History"],
  },
  {
    id: "CON-002",
    institution: "FinTech Partners AG",
    purpose: "Ongoing credit monitoring",
    grantedDate: "2023-11-15",
    expiryDate: "2024-11-15",
    status: "active",
    dataTypes: ["Trust Score", "Behavioral Pattern"],
  },
  {
    id: "CON-003",
    institution: "Nordic Credit Union",
    purpose: "One-time credit check",
    grantedDate: "2023-08-20",
    expiryDate: "2024-02-20",
    status: "expired",
    dataTypes: ["Trust Score"],
  },
  {
    id: "CON-004",
    institution: "Asia Pacific Finance",
    purpose: "Credit card application",
    grantedDate: "2024-01-05",
    expiryDate: "2024-07-05",
    status: "active",
    dataTypes: ["Trust Score", "Behavioral Pattern", "Employment Data"],
  },
  {
    id: "CON-005",
    institution: "Euro Finance Group",
    purpose: "Mortgage pre-approval",
    grantedDate: "2023-06-01",
    expiryDate: "2023-12-01",
    status: "revoked",
    dataTypes: ["Trust Score", "Behavioral Pattern", "Income Data"],
  },
];

const statusConfig = {
  active: { icon: Check, color: "text-success", bg: "bg-success/10", label: "Active" },
  expired: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Expired" },
  revoked: { icon: X, color: "text-destructive", bg: "bg-destructive/10", label: "Revoked" },
};

const ConsentManagement = () => {
  const [consents, setConsents] = useState<Consent[]>(initialConsents);
  const [globalAutoRevoke, setGlobalAutoRevoke] = useState(true);
  const [notifyOnAccess, setNotifyOnAccess] = useState(true);

  const handleRevokeConsent = (consentId: string) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === consentId ? { ...c, status: "revoked" as const } : c))
    );
    toast({
      title: "Consent revoked",
      description: "The institution can no longer access your encrypted identity.",
    });
  };

  const handleRenewConsent = (consentId: string) => {
    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    
    setConsents((prev) =>
      prev.map((c) =>
        c.id === consentId
          ? { ...c, status: "active" as const, expiryDate: newExpiry.toISOString().split("T")[0] }
          : c
      )
    );
    toast({
      title: "Consent renewed",
      description: "Access has been extended for another year.",
    });
  };

  const activeCount = consents.filter((c) => c.status === "active").length;
  const expiredCount = consents.filter((c) => c.status === "expired").length;
  const revokedCount = consents.filter((c) => c.status === "revoked").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Consent Management</h2>
        <p className="text-muted-foreground">Control who can access your encrypted credit identity</p>
      </div>

      {/* Global Settings */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Auto-revoke expired consents</div>
                <div className="text-sm text-muted-foreground">
                  Automatically revoke access when consent period expires
                </div>
              </div>
            </div>
            <Switch
              checked={globalAutoRevoke}
              onCheckedChange={(checked) => {
                setGlobalAutoRevoke(checked);
                toast({
                  title: checked ? "Auto-revoke enabled" : "Auto-revoke disabled",
                  description: checked
                    ? "Expired consents will be automatically revoked."
                    : "You'll need to manually revoke expired consents.",
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Notify on data access</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications when institutions access your identity
                </div>
              </div>
            </div>
            <Switch
              checked={notifyOnAccess}
              onCheckedChange={(checked) => {
                setNotifyOnAccess(checked);
                toast({
                  title: checked ? "Notifications enabled" : "Notifications disabled",
                  description: checked
                    ? "You'll be notified when your data is accessed."
                    : "Access notifications have been turned off.",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <Check className="w-8 h-8 text-success" />
            <div>
              <div className="text-2xl font-bold text-success">{activeCount}</div>
              <div className="text-sm text-success/80">Active Consents</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-500">{expiredCount}</div>
              <div className="text-sm text-yellow-500/80">Expired</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <X className="w-8 h-8 text-destructive" />
            <div>
              <div className="text-2xl font-bold text-destructive">{revokedCount}</div>
              <div className="text-sm text-destructive/80">Revoked</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Active Consents</h3>
        
        {consents.map((consent, index) => {
          const StatusIcon = statusConfig[consent.status].icon;
          const statusColor = statusConfig[consent.status].color;
          const statusBg = statusConfig[consent.status].bg;

          return (
            <motion.div
              key={consent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gradient-card border-border hover:border-primary/50 transition-smooth">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Institution Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">{consent.institution}</span>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusBg}`}>
                          <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                          <span className={`text-xs font-medium ${statusColor}`}>
                            {statusConfig[consent.status].label}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{consent.purpose}</p>
                      
                      {/* Data Types */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {consent.dataTypes.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Granted: {consent.grantedDate}</span>
                        </div>
                        <span>•</span>
                        <span>Expires: {consent.expiryDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {consent.status === "expired" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRenewConsent(consent.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renew
                        </Button>
                      )}
                      {consent.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke consent?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will immediately prevent {consent.institution} from accessing 
                                your encrypted credit identity. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeConsent(consent.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ConsentManagement;
