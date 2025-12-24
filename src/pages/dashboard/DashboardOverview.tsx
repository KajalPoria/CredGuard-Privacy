import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Lock,
  Loader2,
  X,
  Eye,
  EyeOff,
  Copy,
  Save,
  Fingerprint,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Demo data fallback
const demoTrustScoreData = [
  { month: "Jan", score: 720 },
  { month: "Feb", score: 735 },
  { month: "Mar", score: 728 },
  { month: "Apr", score: 745 },
  { month: "May", score: 760 },
  { month: "Jun", score: 778 },
  { month: "Jul", score: 785 },
];

const demoVerificationData = [
  { month: "Jan", verified: 12, pending: 3 },
  { month: "Feb", verified: 18, pending: 2 },
  { month: "Mar", verified: 15, pending: 4 },
  { month: "Apr", verified: 22, pending: 1 },
  { month: "May", verified: 28, pending: 2 },
  { month: "Jun", verified: 25, pending: 3 },
  { month: "Jul", verified: 32, pending: 2 },
];

const demoConsentDistribution = [
  { name: "Active", value: 45, color: "hsl(185, 80%, 50%)" },
  { name: "Pending", value: 12, color: "hsl(45, 90%, 50%)" },
  { name: "Revoked", value: 8, color: "hsl(0, 70%, 50%)" },
];

const demoRecentActivity = [
  { action: "Credit verification", institution: "Global Bank UK", time: "2 hours ago", status: "success" },
  { action: "Consent granted", institution: "FinTech Partners", time: "5 hours ago", status: "success" },
  { action: "Identity refresh", institution: "System", time: "1 day ago", status: "success" },
  { action: "Verification request", institution: "Nordic Credit", time: "2 days ago", status: "pending" },
];

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(750);
  const [verificationsCount, setVerificationsCount] = useState(0);
  const [institutionsCount, setInstitutionsCount] = useState(0);
  const [consentsCount, setConsentsCount] = useState(0);
  const [loanApplicationsCount, setLoanApplicationsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState(demoRecentActivity);
  const [consentDistribution, setConsentDistribution] = useState(demoConsentDistribution);
  
  // Modal states
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [encryptedVector, setEncryptedVector] = useState("");
  const [showVector, setShowVector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [behavioralMetrics, setBehavioralMetrics] = useState({
    repayment_discipline: 85,
    spending_stability: 80,
    employment_consistency: 90,
    income_regularity: 82,
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Refetch data when page becomes visible (returning from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchUserData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Real-time subscriptions for instant updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to verification_history changes
    const verificationsChannel = supabase
      .channel('verifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_history',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Verification history changed, refreshing...');
          fetchUserData();
        }
      )
      .subscribe();

    // Subscribe to connected_institutions changes
    const institutionsChannel = supabase
      .channel('institutions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connected_institutions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Connected institutions changed, refreshing...');
          fetchUserData();
        }
      )
      .subscribe();

    // Subscribe to loan_applications changes
    const loansChannel = supabase
      .channel('loans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_applications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Loan applications changed, refreshing...');
          fetchUserData();
        }
      )
      .subscribe();

    // Subscribe to profiles changes (for trust score)
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Profile changed, refreshing...');
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(verificationsChannel);
      supabase.removeChannel(institutionsChannel);
      supabase.removeChannel(loansChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile trust score
      const { data: profile } = await supabase
        .from("profiles")
        .select("trust_score")
        .eq("user_id", user?.id)
        .maybeSingle();
      
      if (profile?.trust_score) {
        setTrustScore(profile.trust_score);
      }

      // Fetch encrypted identity
      const { data: identity } = await supabase
        .from("encrypted_identities")
        .select("encrypted_vector, behavioral_metrics")
        .eq("user_id", user?.id)
        .maybeSingle();
      
      if (identity) {
        setEncryptedVector(identity.encrypted_vector || "");
        if (identity.behavioral_metrics) {
          setBehavioralMetrics(identity.behavioral_metrics as typeof behavioralMetrics);
        }
      }

      // Fetch verifications count
      const { count: verCount } = await supabase
        .from("verification_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      setVerificationsCount(verCount || 0);

      // Fetch institutions count
      const { count: instCount } = await supabase
        .from("connected_institutions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      setInstitutionsCount(instCount || 0);

      // Fetch consents
      const { data: consents } = await supabase
        .from("consents")
        .select("status")
        .eq("user_id", user?.id);

      if (consents && consents.length > 0) {
        const active = consents.filter(c => c.status === "active").length;
        const pending = consents.filter(c => c.status === "pending").length;
        const revoked = consents.filter(c => c.status === "revoked").length;
        setConsentsCount(active + pending);
        setConsentDistribution([
          { name: "Active", value: active || 1, color: "hsl(185, 80%, 50%)" },
          { name: "Pending", value: pending || 0, color: "hsl(45, 90%, 50%)" },
          { name: "Revoked", value: revoked || 0, color: "hsl(0, 70%, 50%)" },
        ]);
      }

      // Fetch loan applications count
      const { count: loanCount } = await supabase
        .from("loan_applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      setLoanApplicationsCount(loanCount || 0);

      // Fetch recent verifications and loan applications as activity
      const { data: verifications } = await supabase
        .from("verification_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(4);

      const { data: loanApps } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(4);

      const allActivity: typeof demoRecentActivity = [];
      
      if (verifications) {
        verifications.forEach(v => {
          allActivity.push({
            action: v.verification_type,
            institution: v.institution_name,
            time: formatTimeAgo(new Date(v.created_at)),
            status: v.status === "verified" || v.status === "approved" ? "success" : "pending",
          });
        });
      }

      if (loanApps) {
        loanApps.forEach(l => {
          allActivity.push({
            action: `Loan Application (${l.eligibility || 'pending'})`,
            institution: "CREDGUARD Network",
            time: formatTimeAgo(new Date(l.created_at)),
            status: l.decision_status === "accepted" ? "success" : l.decision_status === "rejected" ? "pending" : "pending",
          });
        });
      }

      // Sort by time and take latest 4
      if (allActivity.length > 0) {
        setRecentActivity(allActivity.slice(0, 4));
      } else {
        setRecentActivity(demoRecentActivity);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMetrics = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("encrypted_identities")
        .update({ behavioral_metrics: behavioralMetrics })
        .eq("user_id", user?.id);

      if (error) throw error;

      // Recalculate trust score
      const avgScore = Math.round(
        (behavioralMetrics.repayment_discipline + 
         behavioralMetrics.spending_stability + 
         behavioralMetrics.employment_consistency + 
         behavioralMetrics.income_regularity) / 4
      );
      const newTrustScore = 600 + Math.round(avgScore * 2);
      
      await supabase
        .from("profiles")
        .update({ trust_score: newTrustScore })
        .eq("user_id", user?.id);

      setTrustScore(newTrustScore);
      toast({
        title: "Metrics Updated",
        description: `Your behavioral metrics have been saved. New trust score: ${newTrustScore}`,
      });
      setShowIdentityModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyVector = () => {
    navigator.clipboard.writeText(encryptedVector);
    toast({ title: "Copied", description: "Encrypted vector copied to clipboard." });
  };

  const handleStatClick = (statTitle: string) => {
    switch (statTitle) {
      case "Trust Score":
        setShowIdentityModal(true);
        break;
      case "Verifications":
        navigate("/dashboard/history");
        break;
      case "Connected Banks":
        navigate("/dashboard/institutions");
        break;
      case "Loan Applications":
        navigate("/dashboard/loan");
        break;
      case "Privacy Score":
        setShowPrivacyModal(true);
        break;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const stats = [
    {
      title: "Trust Score",
      value: trustScore.toString(),
      change: "+12",
      trend: "up" as const,
      icon: Shield,
      description: "Encrypted global score",
    },
    {
      title: "Verifications",
      value: verificationsCount > 0 ? verificationsCount.toString() : "0",
      change: verificationsCount > 0 ? `+${Math.min(verificationsCount, 8)}` : "New",
      trend: "up" as const,
      icon: CheckCircle2,
      description: verificationsCount > 0 ? "Total verifications" : "Start verifying",
    },
    {
      title: "Connected Banks",
      value: institutionsCount > 0 ? institutionsCount.toString() : "0",
      change: institutionsCount > 0 ? `+${institutionsCount}` : "Add banks",
      trend: "up" as const,
      icon: Building2,
      description: institutionsCount > 0 ? "Active connections" : "Connect institutions",
    },
    {
      title: "Loan Applications",
      value: loanApplicationsCount > 0 ? loanApplicationsCount.toString() : "0",
      change: loanApplicationsCount > 0 ? `${loanApplicationsCount} total` : "Apply now",
      trend: "up" as const,
      icon: Wallet,
      description: loanApplicationsCount > 0 ? "Applications submitted" : "Start your application",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-gradient-card border-border hover:border-primary/50 transition-smooth cursor-pointer group"
                onClick={() => handleStatClick(stat.title)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                  <div className="text-xs text-muted-foreground/70 mt-1">{stat.description}</div>
                  <div className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view details →
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trust Score Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trust Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={demoTrustScoreData}>
                  <defs>
                    <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(185, 80%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(185, 80%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[700, 800]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(185, 80%, 50%)"
                    strokeWidth={2}
                    fill="url(#trustGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Verification Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demoVerificationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="verified" fill="hsl(160, 84%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="hsl(45, 90%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Consent Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Consent Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={consentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {consentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {consentDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-success' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-foreground">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.institution}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Identity & Behavioral Metrics Modal */}
      <AnimatePresence>
        {showIdentityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowIdentityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Fingerprint className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Encrypted Identity</h2>
                    <p className="text-sm text-muted-foreground">View and update your behavioral metrics</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowIdentityModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Encrypted Vector Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Encrypted Vector</Label>
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-secondary/50 font-mono text-sm">
                    <span className="flex-1 truncate text-muted-foreground">
                      {showVector ? encryptedVector : (encryptedVector?.slice(0, 30) + "...")}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setShowVector(!showVector)}>
                      {showVector ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCopyVector}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is your unique encrypted identity vector stored on CyborgDB
                  </p>
                </div>

                {/* Trust Score Display */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Trust Score</span>
                    <span className="text-3xl font-bold text-primary">{trustScore}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on your behavioral metrics (range: 600-800)
                  </p>
                </div>

                {/* Behavioral Metrics Sliders */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-foreground">Behavioral Metrics</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Repayment Discipline</Label>
                        <span className="text-sm font-medium text-primary">{behavioralMetrics.repayment_discipline}%</span>
                      </div>
                      <Slider
                        value={[behavioralMetrics.repayment_discipline]}
                        onValueChange={([value]) => setBehavioralMetrics(m => ({ ...m, repayment_discipline: value }))}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Spending Stability</Label>
                        <span className="text-sm font-medium text-primary">{behavioralMetrics.spending_stability}%</span>
                      </div>
                      <Slider
                        value={[behavioralMetrics.spending_stability]}
                        onValueChange={([value]) => setBehavioralMetrics(m => ({ ...m, spending_stability: value }))}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Employment Consistency</Label>
                        <span className="text-sm font-medium text-primary">{behavioralMetrics.employment_consistency}%</span>
                      </div>
                      <Slider
                        value={[behavioralMetrics.employment_consistency]}
                        onValueChange={([value]) => setBehavioralMetrics(m => ({ ...m, employment_consistency: value }))}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Income Regularity</Label>
                        <span className="text-sm font-medium text-primary">{behavioralMetrics.income_regularity}%</span>
                      </div>
                      <Slider
                        value={[behavioralMetrics.income_regularity]}
                        onValueChange={([value]) => setBehavioralMetrics(m => ({ ...m, income_regularity: value }))}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowIdentityModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMetrics} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Score Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Lock className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Privacy Score</h2>
                    <p className="text-sm text-muted-foreground">Your data protection level</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPrivacyModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-6xl font-bold text-success mb-2">98%</div>
                  <p className="text-muted-foreground">Excellent Protection</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm">Zero-Knowledge Proofs</span>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm">End-to-End Encryption</span>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm">GDPR Compliant</span>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm">Decentralized Storage</span>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border">
                <Button className="w-full" onClick={() => setShowPrivacyModal(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardOverview;
