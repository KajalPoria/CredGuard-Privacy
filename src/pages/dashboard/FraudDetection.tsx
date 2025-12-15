import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  Eye,
  X,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FraudAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  timestamp: string;
  status: "pending" | "resolved" | "investigating";
}

const demoAlerts: FraudAlert[] = [
  {
    id: "1",
    type: "Unusual Login Location",
    severity: "medium",
    description: "Login detected from a new geographic location",
    location: "Mumbai, India",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "2",
    type: "Multiple Failed Verifications",
    severity: "high",
    description: "3 failed verification attempts in the last hour",
    location: "System",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: "investigating",
  },
  {
    id: "3",
    type: "Unusual Transaction Pattern",
    severity: "low",
    description: "Transaction amount differs from typical behavior",
    location: "London, UK",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "resolved",
  },
];

const FraudDetection = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<FraudAlert[]>(demoAlerts);
  const [riskScore, setRiskScore] = useState(15);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [stats, setStats] = useState({
    totalScans: 127,
    threatsBlocked: 3,
    lastScanTime: new Date().toISOString(),
    protectionLevel: 98,
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    
    // Simulate AI-powered fraud scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStats(prev => ({
      ...prev,
      totalScans: prev.totalScans + 1,
      lastScanTime: new Date().toISOString(),
    }));
    
    setRiskScore(Math.max(5, riskScore - Math.floor(Math.random() * 5)));
    
    toast({
      title: "Scan Complete",
      description: "No new threats detected. Your identity is secure.",
    });
    
    setIsScanning(false);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, status: "resolved" as const } : alert
      )
    );
    toast({
      title: "Alert Resolved",
      description: "The security alert has been marked as resolved.",
    });
    setSelectedAlert(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "investigating": return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading fraud detection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fraud Detection</h2>
          <p className="text-muted-foreground">AI-powered identity protection</p>
        </div>
        <Button onClick={handleRunScan} disabled={isScanning}>
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Security Scan
            </>
          )}
        </Button>
      </div>

      {/* Risk Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-card border-border overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Risk Gauge */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={riskScore < 30 ? "hsl(160, 84%, 45%)" : riskScore < 60 ? "hsl(45, 90%, 50%)" : "hsl(0, 70%, 50%)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${riskScore * 2.51} 251`}
                    initial={{ strokeDasharray: "0 251" }}
                    animate={{ strokeDasharray: `${riskScore * 2.51} 251` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{riskScore}%</span>
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stats.protectionLevel}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Protection Level</p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <Activity className="w-5 h-5 text-success" />
                    <span className="text-2xl font-bold text-foreground">{stats.totalScans}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                    <span className="text-2xl font-bold text-foreground">{stats.threatsBlocked}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Threats Blocked</p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{formatTimeAgo(stats.lastScanTime)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Last Scan</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts Section */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Security Alerts
            {alerts.filter(a => a.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(a => a.status === "pending").length} Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  alert.status === "resolved" 
                    ? "bg-secondary/30 border-border opacity-60" 
                    : "bg-secondary/50 border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{alert.type}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(alert.status)}
                    <span className="text-xs capitalize text-muted-foreground">{alert.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protection Features */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: "Real-time Monitoring", description: "24/7 AI-powered surveillance of your identity", status: "Active" },
          { icon: Activity, title: "Behavioral Analysis", description: "Machine learning detection of anomalies", status: "Active" },
          { icon: MapPin, title: "Geo-fencing", description: "Location-based access controls", status: "Active" },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="bg-gradient-card border-border h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <feature.icon className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    <Badge variant="outline" className="text-success border-success/50">
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(selectedAlert.severity)}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedAlert.type}</h2>
                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAlert(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p className="text-foreground">{selectedAlert.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                    <p className="text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedAlert.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Time</h4>
                    <p className="text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedAlert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedAlert.status)}
                    <span className="capitalize">{selectedAlert.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                {selectedAlert.status !== "resolved" && (
                  <Button onClick={() => handleResolveAlert(selectedAlert.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FraudDetection;
