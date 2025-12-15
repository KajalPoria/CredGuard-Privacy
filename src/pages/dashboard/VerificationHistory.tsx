import { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Download,
  Building2,
  Globe,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const verifications = [
  {
    id: "VER-2024-001",
    institution: "Global Bank UK",
    country: "United Kingdom",
    type: "Credit Check",
    status: "approved",
    score: 785,
    date: "2024-01-15T10:30:00Z",
    zkProof: "0x8f2a...b3c1",
  },
  {
    id: "VER-2024-002",
    institution: "FinTech Partners AG",
    country: "Switzerland",
    type: "Loan Application",
    status: "approved",
    score: 778,
    date: "2024-01-12T14:22:00Z",
    zkProof: "0x9d4e...a2f8",
  },
  {
    id: "VER-2024-003",
    institution: "Nordic Credit Union",
    country: "Sweden",
    type: "Credit Check",
    status: "pending",
    score: null,
    date: "2024-01-10T09:15:00Z",
    zkProof: null,
  },
  {
    id: "VER-2024-004",
    institution: "Asia Pacific Finance",
    country: "Singapore",
    type: "Credit Check",
    status: "approved",
    score: 792,
    date: "2024-01-08T16:45:00Z",
    zkProof: "0x7c1b...d9e2",
  },
  {
    id: "VER-2024-005",
    institution: "Canadian Trust Bank",
    country: "Canada",
    type: "Mortgage Pre-approval",
    status: "declined",
    score: 685,
    date: "2024-01-05T11:00:00Z",
    zkProof: "0x5e3f...c7a4",
  },
  {
    id: "VER-2024-006",
    institution: "Euro Finance Group",
    country: "Germany",
    type: "Credit Check",
    status: "approved",
    score: 768,
    date: "2024-01-03T13:30:00Z",
    zkProof: "0x2b8c...f1d6",
  },
];

const statusConfig = {
  approved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  declined: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

const VerificationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportHistory = () => {
    const data = JSON.stringify(filteredVerifications, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verification-history.json";
    a.click();
    toast({
      title: "History exported",
      description: "Your verification history has been downloaded.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verification History</h2>
          <p className="text-muted-foreground">Track all credit verification requests</p>
        </div>
        <Button variant="outline" onClick={handleExportHistory}>
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by institution, country, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
            <div>
              <div className="text-2xl font-bold text-success">
                {verifications.filter((v) => v.status === "approved").length}
              </div>
              <div className="text-sm text-success/80">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {verifications.filter((v) => v.status === "pending").length}
              </div>
              <div className="text-sm text-yellow-500/80">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-destructive" />
            <div>
              <div className="text-2xl font-bold text-destructive">
                {verifications.filter((v) => v.status === "declined").length}
              </div>
              <div className="text-sm text-destructive/80">Declined</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification List */}
      <div className="space-y-4">
        {filteredVerifications.map((verification, index) => {
          const StatusIcon = statusConfig[verification.status as keyof typeof statusConfig].icon;
          const statusColor = statusConfig[verification.status as keyof typeof statusConfig].color;
          const statusBg = statusConfig[verification.status as keyof typeof statusConfig].bg;

          return (
            <motion.div
              key={verification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gradient-card border-border hover:border-primary/50 transition-smooth">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Institution Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {verification.institution}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {verification.country}
                        </div>
                        <span>•</span>
                        <span>{verification.type}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">{verification.id}</span>
                      </div>
                    </div>

                    {/* Score */}
                    {verification.score && (
                      <div className="text-center px-4">
                        <div className="text-2xl font-bold text-gradient">{verification.score}</div>
                        <div className="text-xs text-muted-foreground">Trust Score</div>
                      </div>
                    )}

                    {/* Status & Date */}
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                        <span className={`text-sm font-medium capitalize ${statusColor}`}>
                          {verification.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(verification.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    {/* ZK Proof */}
                    {verification.zkProof && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono text-muted-foreground">
                          {verification.zkProof}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredVerifications.length === 0 && (
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No verifications found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerificationHistory;
