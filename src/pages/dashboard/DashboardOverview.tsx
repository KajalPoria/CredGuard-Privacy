import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(750);
  const [verificationsCount, setVerificationsCount] = useState(0);
  const [institutionsCount, setInstitutionsCount] = useState(0);
  const [consentsCount, setConsentsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState(demoRecentActivity);
  const [consentDistribution, setConsentDistribution] = useState(demoConsentDistribution);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
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

      // Fetch recent verifications as activity
      const { data: verifications } = await supabase
        .from("verification_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(4);

      if (verifications && verifications.length > 0) {
        const mappedActivity = verifications.map(v => ({
          action: v.verification_type,
          institution: v.institution_name,
          time: formatTimeAgo(new Date(v.created_at)),
          status: v.status === "verified" ? "success" : "pending",
        }));
        setRecentActivity(mappedActivity.length > 0 ? mappedActivity : demoRecentActivity);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
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
      title: "Privacy Score",
      value: "98%",
      change: "+3%",
      trend: "up" as const,
      icon: Lock,
      description: "Data protection level",
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
              <Card className="bg-gradient-card border-border hover:border-primary/50 transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
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
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                  <div className="text-xs text-muted-foreground/70 mt-1">{stat.description}</div>
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
    </div>
  );
};

export default DashboardOverview;
