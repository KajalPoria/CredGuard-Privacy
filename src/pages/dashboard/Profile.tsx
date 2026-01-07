import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Save,
  Loader2,
  CheckCircle2,
  Fingerprint,
  Building2,
  History,
  Bell,
  Wallet,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NotificationPreferences {
  loans: boolean;
  verifications: boolean;
  institutions: boolean;
}

interface EmailNotificationPreferences {
  emailEnabled: boolean;
  emailLoans: boolean;
  emailVerifications: boolean;
  emailInstitutions: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    trust_score: 750,
    created_at: "",
  });
  const [editedName, setEditedName] = useState("");
  const [stats, setStats] = useState({
    verifications: 0,
    institutions: 0,
    consents: 0,
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    loans: true,
    verifications: true,
    institutions: true,
  });
  const [emailPrefs, setEmailPrefs] = useState<EmailNotificationPreferences>({
    emailEnabled: false,
    emailLoans: true,
    emailVerifications: true,
    emailInstitutions: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      loadNotificationPrefs();
      loadEmailPrefs();
    }
  }, [user]);

  const loadNotificationPrefs = () => {
    const saved = localStorage.getItem(`notification_prefs_${user?.id}`);
    if (saved) {
      try {
        setNotificationPrefs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notification preferences');
      }
    }
  };

  const loadEmailPrefs = () => {
    const saved = localStorage.getItem(`email_prefs_${user?.id}`);
    if (saved) {
      try {
        setEmailPrefs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse email preferences');
      }
    }
  };

  const saveNotificationPrefs = (prefs: NotificationPreferences) => {
    localStorage.setItem(`notification_prefs_${user?.id}`, JSON.stringify(prefs));
    setNotificationPrefs(prefs);
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const saveEmailPrefs = (prefs: EmailNotificationPreferences) => {
    localStorage.setItem(`email_prefs_${user?.id}`, JSON.stringify(prefs));
    setEmailPrefs(prefs);
    toast({
      title: "Email Preferences Saved",
      description: "Your email notification preferences have been updated.",
    });
  };

  const handlePrefChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...notificationPrefs, [key]: value };
    saveNotificationPrefs(newPrefs);
  };

  const handleEmailPrefChange = (key: keyof EmailNotificationPreferences, value: boolean) => {
    const newPrefs = { ...emailPrefs, [key]: value };
    saveEmailPrefs(newPrefs);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (data) {
      setProfile({
        display_name: data.display_name || user?.email?.split("@")[0] || "",
        email: data.email || user?.email || "",
        trust_score: data.trust_score || 750,
        created_at: data.created_at,
      });
      setEditedName(data.display_name || user?.email?.split("@")[0] || "");
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    const [verifications, institutions, consents] = await Promise.all([
      supabase.from("verification_history").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
      supabase.from("connected_institutions").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
      supabase.from("consents").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
    ]);

    setStats({
      verifications: verifications.count || 0,
      institutions: institutions.count || 0,
      consents: consents.count || 0,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: editedName })
        .eq("user_id", user?.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, display_name: editedName }));
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTrustLevel = (score: number) => {
    if (score >= 800) return { label: "Excellent", color: "text-success" };
    if (score >= 700) return { label: "Good", color: "text-primary" };
    if (score >= 600) return { label: "Fair", color: "text-yellow-400" };
    return { label: "Building", color: "text-muted-foreground" };
  };

  const trustLevel = getTrustLevel(profile.trust_score);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-card border-border overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
                  <User className="w-16 h-16 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-success">
                  <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                ) : (
                  <h3 className="text-3xl font-bold text-foreground">{profile.display_name}</h3>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Verified Identity
                  </Badge>
                  <Badge variant="outline" className="border-success/50 text-success">
                    ZK-Proof Enabled
                  </Badge>
                </div>
              </div>

              {/* Trust Score */}
              <div className="text-center p-6 rounded-2xl bg-secondary/50">
                <div className="text-5xl font-bold text-gradient mb-2">{profile.trust_score}</div>
                <div className={`font-medium ${trustLevel.color}`}>{trustLevel.label}</div>
                <div className="text-sm text-muted-foreground">Trust Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: History, title: "Verifications", value: stats.verifications, description: "Total verifications" },
          { icon: Building2, title: "Institutions", value: stats.institutions, description: "Connected banks" },
          { icon: Shield, title: "Consents", value: stats.consents, description: "Active consents" },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              In-App Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Loan Notifications</div>
                  <div className="text-sm text-muted-foreground">Get notified about loan approvals and updates</div>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.loans}
                onCheckedChange={(checked) => handlePrefChange('loans', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Verification Notifications</div>
                  <div className="text-sm text-muted-foreground">Get notified when verifications complete</div>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.verifications}
                onCheckedChange={(checked) => handlePrefChange('verifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Institution Notifications</div>
                  <div className="text-sm text-muted-foreground">Get notified when institutions are connected</div>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.institutions}
                onCheckedChange={(checked) => handlePrefChange('institutions', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Email Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Email Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Enable Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive important updates via email</div>
                </div>
              </div>
              <Switch
                checked={emailPrefs.emailEnabled}
                onCheckedChange={(checked) => handleEmailPrefChange('emailEnabled', checked)}
              />
            </div>
            
            <div className={`space-y-4 transition-opacity ${emailPrefs.emailEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Email Loan Updates</div>
                    <div className="text-sm text-muted-foreground">Receive emails about loan approvals and status changes</div>
                  </div>
                </div>
                <Switch
                  checked={emailPrefs.emailLoans}
                  onCheckedChange={(checked) => handleEmailPrefChange('emailLoans', checked)}
                  disabled={!emailPrefs.emailEnabled}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Email Verification Alerts</div>
                    <div className="text-sm text-muted-foreground">Receive emails when verifications are completed</div>
                  </div>
                </div>
                <Switch
                  checked={emailPrefs.emailVerifications}
                  onCheckedChange={(checked) => handleEmailPrefChange('emailVerifications', checked)}
                  disabled={!emailPrefs.emailEnabled}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Email Institution Updates</div>
                    <div className="text-sm text-muted-foreground">Receive emails when institutions connect or disconnect</div>
                  </div>
                </div>
                <Switch
                  checked={emailPrefs.emailInstitutions}
                  onCheckedChange={(checked) => handleEmailPrefChange('emailInstitutions', checked)}
                  disabled={!emailPrefs.emailEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-foreground">Encrypted Identity</div>
                <div className="text-sm text-muted-foreground">Zero-knowledge proof enabled</div>
              </div>
            </div>
            <Badge className="bg-success/20 text-success">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-foreground">Fraud Detection</div>
                <div className="text-sm text-muted-foreground">Real-time monitoring enabled</div>
              </div>
            </div>
            <Badge className="bg-success/20 text-success">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
