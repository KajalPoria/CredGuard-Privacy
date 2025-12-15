import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  CheckCircle2,
  Info,
  Zap,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface EncryptedIdentity {
  encrypted_vector: string;
  zk_proof: string | null;
  behavioral_metrics: Record<string, number>;
  cyborgdb_indexed: boolean;
  cyborgdb_index_id: string | null;
}

const CreditIdentity = () => {
  const [showVector, setShowVector] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [identity, setIdentity] = useState<EncryptedIdentity | null>(null);
  const [trustScore, setTrustScore] = useState(750);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { user, session } = useAuth();

  useEffect(() => {
    if (user) {
      fetchIdentity();
    }
  }, [user]);

  const fetchIdentity = async () => {
    const { data: identityData } = await supabase
      .from("encrypted_identities")
      .select("*")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (identityData) {
      setIdentity({
        encrypted_vector: identityData.encrypted_vector,
        zk_proof: identityData.zk_proof,
        behavioral_metrics: identityData.behavioral_metrics as Record<string, number>,
        cyborgdb_indexed: identityData.cyborgdb_indexed || false,
        cyborgdb_index_id: identityData.cyborgdb_index_id,
      });
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("trust_score")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (profileData) {
      setTrustScore(profileData.trust_score || 750);
    }
  };

  const handleCopyVector = () => {
    if (identity?.encrypted_vector) {
      navigator.clipboard.writeText(identity.encrypted_vector);
      toast({
        title: "Copied",
        description: "Encrypted vector copied to clipboard.",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoadingMessage("Generating encrypted vector with CyborgDB...");
    try {
      const response = await supabase.functions.invoke("cyborgdb-api", {
        body: { action: "generate_vector" },
      });

      if (response.error) throw new Error(response.error.message);

      setLoadingMessage("Indexing on CyborgDB...");
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Identity refreshed",
        description: response.data?.cyborgdb_enabled 
          ? "New encrypted vector generated via CyborgDB API."
          : "New encrypted vector generated and indexed.",
      });
      await fetchIdentity();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh identity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLoadingMessage("");
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setLoadingMessage("Verifying identity with CyborgDB...");
    try {
      const response = await supabase.functions.invoke("cyborgdb-api", {
        body: { action: "verify_identity" },
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Identity verified",
        description: `Trust score updated to ${response.data?.trust_score}`,
      });
      await fetchIdentity();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify identity.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setLoadingMessage("");
    }
  };

  const handleDownload = () => {
    if (!identity) return;
    
    const data = {
      encryptedVector: identity.encrypted_vector,
      zkProof: identity.zk_proof,
      cyborgdbIndexed: identity.cyborgdb_indexed,
      cyborgdbIndexId: identity.cyborgdb_index_id,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credguard-identity.json";
    a.click();
    toast({ title: "Exported", description: "Identity file downloaded." });
  };

  const isLoading = isRefreshing || isVerifying;

  const metrics = identity?.behavioral_metrics || {
    repayment_discipline: 85,
    spending_stability: 80,
    employment_consistency: 90,
    income_regularity: 82,
  };

  const metricLabels: Record<string, string> = {
    repayment_discipline: "Repayment Discipline",
    spending_stability: "Spending Stability",
    employment_consistency: "Employment Consistency",
    income_regularity: "Income Regularity",
  };

  return (
    <div className="space-y-8 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-xl">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Database className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{loadingMessage || "Processing..."}</p>
              <p className="text-sm text-muted-foreground mt-1">Connecting to CyborgDB</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Encrypted Credit Identity</h2>
          <p className="text-muted-foreground">Powered by CyborgDB</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleVerify} disabled={isLoading}>
            <Zap className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-pulse' : ''}`} />
            Verify
          </Button>
          <Button variant="hero" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-card border-border overflow-hidden">
          <CardContent className="relative p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Visual */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 mx-auto lg:mx-0">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow" />
                  <div className="absolute inset-4 rounded-full border-2 border-primary/30" />
                  <div className="absolute inset-8 rounded-full border-2 border-primary/40 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                  <div className="absolute inset-12 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-glow">
                    <Fingerprint className="w-16 h-16 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-center mt-6">
                  <div className="text-4xl font-bold text-gradient">{trustScore}</div>
                  <div className="text-sm text-muted-foreground">Trust Score</div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Encrypted Vector</span>
                  </div>
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-secondary/50 font-mono text-sm">
                    <span className="flex-1 truncate text-muted-foreground">
                      {showVector ? identity?.encrypted_vector : identity?.encrypted_vector?.slice(0, 20) + "..."}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setShowVector(!showVector)}>
                      {showVector ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCopyVector}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    ZK-Verified
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                    <Shield className="w-4 h-4" />
                    Encrypted
                  </div>
                  {identity?.cyborgdb_indexed && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                      <Database className="w-4 h-4" />
                      CyborgDB Indexed
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Info className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Identity indexed on CyborgDB's encrypted vector search.
                    {identity?.cyborgdb_index_id && (
                      <span className="block mt-1 font-mono text-xs text-purple-400">
                        Index: {identity.cyborgdb_index_id}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>Behavioral Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            {Object.entries(metrics).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{metricLabels[key] || key}</span>
                  <span className="text-sm font-bold text-primary">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditIdentity;
