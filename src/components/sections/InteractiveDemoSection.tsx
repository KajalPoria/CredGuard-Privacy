import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Lock,
  Binary,
  Database,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserIdentity {
  encrypted_vector: string;
  zk_proof: string | null;
  behavioral_metrics: {
    repayment_discipline: number;
    spending_stability: number;
    employment_consistency: number;
    income_regularity: number;
  } | null;
}

const steps = [
  {
    id: 1,
    title: "Data Collection",
    description: "Your financial behavior is analyzed locally on your device",
    icon: Database,
    color: "hsl(185, 80%, 50%)",
    details: [
      "Repayment patterns",
      "Spending stability",
      "Income regularity",
      "Employment history",
    ],
  },
  {
    id: 2,
    title: "Behavioral Encoding",
    description: "AI transforms patterns into encrypted behavioral vectors",
    icon: Binary,
    color: "hsl(160, 84%, 45%)",
    details: [
      "ML embeddings generated",
      "Pattern compression",
      "Feature extraction",
      "Vector normalization",
    ],
  },
  {
    id: 3,
    title: "Zero-Knowledge Encryption",
    description: "Vectors are encrypted using ZK proofs—irreversible transformation",
    icon: Lock,
    color: "hsl(45, 90%, 50%)",
    details: [
      "Homomorphic encryption",
      "ZK-SNARK proofs",
      "Privacy preservation",
      "Mathematical verification",
    ],
  },
  {
    id: 4,
    title: "CyborgDB Indexing",
    description: "Encrypted identity is indexed in the global trust fabric",
    icon: Zap,
    color: "hsl(280, 70%, 60%)",
    details: [
      "Encrypted vector search",
      "Global similarity matching",
      "Sub-second queries",
      "Cross-border compatibility",
    ],
  },
  {
    id: 5,
    title: "Verification Ready",
    description: "Your encrypted identity can now be verified by institutions",
    icon: Shield,
    color: "hsl(185, 80%, 50%)",
    details: [
      "Instant verification",
      "Privacy preserved",
      "Global accessibility",
      "User-controlled consent",
    ],
  },
];

const mockData = {
  rawData: `{
  "transactions": 1247,
  "avgBalance": "$4,892",
  "repaymentRate": "98.7%",
  "incomeStability": "High"
}`,
  encryptedVector: "0x7f3a8b2c4d9e1f6a8c2d4e91b6f02a739d851c4ef0283b7d9e2f1a6c8b4d0e3f",
  zkProof: "π = (A, B, C) ∈ G₁ × G₂ × G₁",
};

const InteractiveDemoSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRawData, setShowRawData] = useState(true);
  const [isRealMode, setIsRealMode] = useState(false);
  const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null);
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isRealMode) {
      fetchUserIdentity();
    }
  }, [user, isRealMode]);

  const fetchUserIdentity = async () => {
    if (!user) return;
    
    const [identityRes, profileRes] = await Promise.all([
      supabase
        .from("encrypted_identities")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("profiles")
        .select("trust_score")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (identityRes.data) {
      setUserIdentity({
        encrypted_vector: identityRes.data.encrypted_vector,
        zk_proof: identityRes.data.zk_proof,
        behavioral_metrics: identityRes.data.behavioral_metrics as UserIdentity["behavioral_metrics"],
      });
    }
    if (profileRes.data) {
      setTrustScore(profileRes.data.trust_score);
    }
  };

  const getRawData = () => {
    if (isRealMode && userIdentity?.behavioral_metrics) {
      const metrics = userIdentity.behavioral_metrics;
      return `{
  "repaymentDiscipline": "${metrics.repayment_discipline}%",
  "spendingStability": "${metrics.spending_stability}%",
  "employmentConsistency": "${metrics.employment_consistency}%",
  "incomeRegularity": "${metrics.income_regularity}%",
  "trustScore": ${trustScore || 750}
}`;
    }
    return mockData.rawData;
  };

  const getEncryptedVector = () => {
    if (isRealMode && userIdentity) {
      return userIdentity.encrypted_vector;
    }
    return mockData.encryptedVector;
  };

  const getZkProof = () => {
    if (isRealMode && userIdentity?.zk_proof) {
      return userIdentity.zk_proof;
    }
    return mockData.zkProof;
  };

  const handlePlay = () => {
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
    playNextStep();
  };

  const playNextStep = () => {
    setCurrentStep((prev) => {
      if (prev >= steps.length) {
        setIsPlaying(false);
        return prev;
      }
      setTimeout(() => {
        if (prev + 1 < steps.length) {
          playNextStep();
        } else {
          setIsPlaying(false);
        }
      }, 2000);
      return prev + 1;
    });
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setShowRawData(true);
  };

  const handleModeToggle = () => {
    if (!user && !isRealMode) {
      navigate("/auth");
      return;
    }
    setIsRealMode(!isRealMode);
    handleReset();
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <section id="demo" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 pattern-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Interactive Demo</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            See <span className="text-gradient">Encryption</span> in Action
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            Watch how your financial data transforms into a privacy-preserving encrypted identity
            powered by CyborgDB's encrypted vector search.
          </motion.p>
        </div>

        {/* Demo Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <Card className="bg-gradient-card border-border overflow-hidden">
            <CardContent className="p-0">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Button
                    variant={isPlaying ? "outline" : "hero"}
                    size="sm"
                    onClick={isPlaying ? handlePause : handlePlay}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep === 0 ? "Start Demo" : "Continue"}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mode Toggle */}
                  <div className="flex items-center rounded-lg bg-background/50 border border-border p-1">
                    <button
                      onClick={() => { setIsRealMode(false); handleReset(); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        !isRealMode 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Demo
                    </button>
                    <button
                      onClick={handleModeToggle}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isRealMode 
                          ? "bg-success text-white" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      {user ? "Your Data" : "Sign In"}
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    Step {Math.min(currentStep, steps.length)} of {steps.length}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Main Demo Area */}
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left: Visualization */}
                <div className="p-8 border-r border-border">
                  <div className="relative aspect-square max-w-md mx-auto">
                    {/* Central Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {currentStep === 0 ? (
                          <motion.div
                            key="start"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-center"
                          >
                            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                              <Play className="w-12 h-12 text-primary" />
                            </div>
                            <p className="text-muted-foreground">Click "Start Demo" to begin</p>
                          </motion.div>
                        ) : currentStepData ? (
                          <motion.div
                            key={currentStep}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                          >
                            {/* Animated Icon */}
                            <div className="relative mb-6">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 w-40 h-40 mx-auto rounded-full border-2 border-dashed"
                                style={{ borderColor: currentStepData.color + "40" }}
                              />
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center"
                                style={{ backgroundColor: currentStepData.color + "20" }}
                              >
                                <currentStepData.icon
                                  className="w-16 h-16"
                                  style={{ color: currentStepData.color }}
                                />
                              </motion.div>
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {currentStepData.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4">
                              {currentStepData.description}
                            </p>

                            {/* Detail Pills */}
                            <div className="flex flex-wrap justify-center gap-2">
                              {currentStepData.details.map((detail, i) => (
                                <motion.span
                                  key={detail}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 + i * 0.1 }}
                                  className="px-3 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: currentStepData.color + "20",
                                    color: currentStepData.color,
                                  }}
                                >
                                  {detail}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="complete"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-32 h-32 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"
                            >
                              <CheckCircle2 className="w-16 h-16 text-success" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              Identity Created!
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Your encrypted identity is now ready for global verification
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right: Data Preview */}
                <div className="p-8 bg-secondary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">Data Transformation</h4>
                      {isRealMode && user && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                          Live Data
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRawData(!showRawData)}
                    >
                      {showRawData ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Raw
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Show Raw
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Raw Data */}
                    <AnimatePresence>
                      {showRawData && currentStep >= 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 rounded-xl bg-background/50 border border-border"
                        >
                          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                            <Database className="w-4 h-4" />
                            {isRealMode ? "Your Behavioral Metrics" : "Raw Financial Data"}
                            {currentStep >= 3 && (
                              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                                Never Exposed
                              </span>
                            )}
                          </div>
                          <pre className={`text-xs font-mono overflow-auto ${
                            currentStep >= 3 ? "blur-sm select-none" : ""
                          }`}>
                            {getRawData()}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Arrow */}
                    {currentStep >= 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center"
                      >
                        <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                      </motion.div>
                    )}

                    {/* Encrypted Vector */}
                    {currentStep >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                      >
                        <div className="flex items-center gap-2 mb-2 text-sm text-primary">
                          <Binary className="w-4 h-4" />
                          Encrypted Behavioral Vector
                          {currentStep >= 4 && (
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                              CyborgDB Indexed
                            </span>
                          )}
                        </div>
                        <code className="text-xs font-mono text-muted-foreground break-all">
                          {getEncryptedVector()}
                        </code>
                      </motion.div>
                    )}

                    {/* ZK Proof */}
                    {currentStep >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-success/5 border border-success/20"
                      >
                        <div className="flex items-center gap-2 mb-2 text-sm text-success">
                          <Shield className="w-4 h-4" />
                          Zero-Knowledge Proof
                        </div>
                        <code className="text-xs font-mono text-muted-foreground">
                          {getZkProof()}
                        </code>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="p-4 border-t border-border bg-secondary/30">
                <div className="flex items-center justify-center gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(index + 1);
                        setIsPlaying(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-smooth ${
                        currentStep === index + 1
                          ? "bg-primary/20 text-primary"
                          : currentStep > index + 1
                          ? "bg-success/10 text-success"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline text-sm">{step.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;
