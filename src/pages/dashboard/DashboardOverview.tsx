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

const trustScoreData = [
  { month: "Jan", score: 720 },
  { month: "Feb", score: 735 },
  { month: "Mar", score: 728 },
  { month: "Apr", score: 745 },
  { month: "May", score: 760 },
  { month: "Jun", score: 778 },
  { month: "Jul", score: 785 },
];

const verificationData = [
  { month: "Jan", verified: 12, pending: 3 },
  { month: "Feb", verified: 18, pending: 2 },
  { month: "Mar", verified: 15, pending: 4 },
  { month: "Apr", verified: 22, pending: 1 },
  { month: "May", verified: 28, pending: 2 },
  { month: "Jun", verified: 25, pending: 3 },
  { month: "Jul", verified: 32, pending: 2 },
];

const consentDistribution = [
  { name: "Active", value: 45, color: "hsl(185, 80%, 50%)" },
  { name: "Pending", value: 12, color: "hsl(45, 90%, 50%)" },
  { name: "Revoked", value: 8, color: "hsl(0, 70%, 50%)" },
];

const stats = [
  {
    title: "Trust Score",
    value: "785",
    change: "+12",
    trend: "up",
    icon: Shield,
    description: "Encrypted global score",
  },
  {
    title: "Verifications",
    value: "152",
    change: "+8",
    trend: "up",
    icon: CheckCircle2,
    description: "This month",
  },
  {
    title: "Connected Banks",
    value: "7",
    change: "+2",
    trend: "up",
    icon: Building2,
    description: "Active connections",
  },
  {
    title: "Privacy Score",
    value: "98%",
    change: "+3%",
    trend: "up",
    icon: Lock,
    description: "Data protection level",
  },
];

const recentActivity = [
  { action: "Credit verification", institution: "Global Bank UK", time: "2 hours ago", status: "success" },
  { action: "Consent granted", institution: "FinTech Partners", time: "5 hours ago", status: "success" },
  { action: "Identity refresh", institution: "System", time: "1 day ago", status: "success" },
  { action: "Verification request", institution: "Nordic Credit", time: "2 days ago", status: "pending" },
];

const DashboardOverview = () => {
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
                <AreaChart data={trustScoreData}>
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
                <BarChart data={verificationData}>
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
