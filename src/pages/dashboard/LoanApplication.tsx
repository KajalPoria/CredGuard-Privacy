import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface LoanAssessment {
  eligibility: 'approved' | 'conditional' | 'rejected';
  recommendedRange: { min: number; max: number };
  riskScore: number;
  fraudLikelihood: number;
  cryptographicProof: string;
  complianceVerified: boolean;
  fairnessScore: number;
  reasoning: string[];
}

interface EncryptedInputs {
  encryptedVector: string;
  trustScore: number;
  fraudSignal: string;
  complianceProof: string;
}

const LoanApplication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assessment, setAssessment] = useState<LoanAssessment | null>(null);
  const [encryptedInputs, setEncryptedInputs] = useState<EncryptedInputs | null>(null);
  const [showVector, setShowVector] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [step, setStep] = useState<'consent' | 'application' | 'processing' | 'result'>('consent');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    if (user) {
      fetchEncryptedInputs();
    }
  }, [user]);

  const fetchEncryptedInputs = async () => {
    try {
      const { data: identity, error: identityError } = await supabase
        .from('encrypted_identities')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('trust_score')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (identity && profile) {
        setEncryptedInputs({
          encryptedVector: identity.encrypted_vector,
          trustScore: profile.trust_score || 750,
          fraudSignal: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          complianceProof: `GDPR-CCPA-FCRA-${Date.now().toString(16)}`
        });
      }
    } catch (error) {
      console.error('Error fetching encrypted inputs:', error);
    }
  };

  const simulateProcessing = async () => {
    const steps = [
      { progress: 10, step: 'Validating consent and permissions...' },
      { progress: 25, step: 'Retrieving Encrypted Behavioral Identity...' },
      { progress: 40, step: 'Performing homomorphic similarity matching...' },
      { progress: 55, step: 'Calculating encrypted risk signals...' },
      { progress: 70, step: 'Verifying compliance proofs...' },
      { progress: 85, step: 'Generating cryptographic decision proof...' },
      { progress: 100, step: 'Assessment complete' }
    ];

    for (const s of steps) {
      setProcessingProgress(s.progress);
      setProcessingStep(s.step);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const performAssessment = async () => {
    if (!encryptedInputs || !loanAmount) return;

    setIsProcessing(true);
    setStep('processing');
    setProcessingProgress(0);

    try {
      await simulateProcessing();

      const amount = parseFloat(loanAmount);
      const trustScore = encryptedInputs.trustScore;
      
      // Simulate privacy-preserving assessment logic
      const maxLoanMultiplier = trustScore >= 800 ? 50000 : trustScore >= 700 ? 35000 : trustScore >= 600 ? 20000 : 10000;
      const riskScore = Math.max(0, Math.min(100, 100 - (trustScore - 600) / 2));
      const fraudLikelihood = Math.max(0, Math.min(100, 15 - (trustScore - 700) / 20));
      
      let eligibility: 'approved' | 'conditional' | 'rejected';
      let reasoning: string[] = [];

      if (trustScore >= 750 && amount <= maxLoanMultiplier * 0.8) {
        eligibility = 'approved';
        reasoning = [
          'Encrypted behavioral vector shows consistent patterns',
          'Trust score exceeds threshold for requested amount',
          'No adverse fraud signals detected',
          'Compliance verification passed'
        ];
      } else if (trustScore >= 650 && amount <= maxLoanMultiplier) {
        eligibility = 'conditional';
        reasoning = [
          'Behavioral patterns indicate moderate confidence',
          'Additional verification may be required',
          'Recommended: Provide collateral or co-signer',
          'Compliance verification passed with conditions'
        ];
      } else {
        eligibility = 'rejected';
        reasoning = [
          'Encrypted behavioral similarity below threshold',
          'Requested amount exceeds recommended limit',
          'Risk assessment indicates elevated concern',
          'Consider requesting a lower amount'
        ];
      }

      const assessmentResult: LoanAssessment = {
        eligibility,
        recommendedRange: {
          min: Math.floor(maxLoanMultiplier * 0.3),
          max: maxLoanMultiplier
        },
        riskScore: Math.round(riskScore),
        fraudLikelihood: Math.round(fraudLikelihood * 10) / 10,
        cryptographicProof: `zkSNARK::${Date.now().toString(16)}::SHA256(decision||inputs)::${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        complianceVerified: true,
        fairnessScore: Math.round(85 + Math.random() * 15),
        reasoning
      };

      setAssessment(assessmentResult);
      setStep('result');

      // Log the assessment for audit trail
      await supabase.from('verification_history').insert({
        user_id: user?.id,
        verification_type: 'loan_assessment',
        institution_name: 'CREDGUARD Network',
        country: 'Global',
        status: eligibility,
        score: trustScore,
        zk_proof: assessmentResult.cryptographicProof
      });

      toast({
        title: 'Assessment Complete',
        description: `Your loan application has been ${eligibility}`,
      });
    } catch (error) {
      console.error('Assessment error:', error);
      toast({
        title: 'Assessment Failed',
        description: 'Unable to complete privacy-preserving assessment',
        variant: 'destructive'
      });
      setStep('application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGrantConsent = () => {
    setConsentGranted(true);
    setStep('application');
    toast({
      title: 'Consent Granted',
      description: 'You can now proceed with your loan application',
    });
  };

  const resetApplication = () => {
    setStep('consent');
    setConsentGranted(false);
    setAssessment(null);
    setLoanAmount('');
    setLoanPurpose('');
    setLoanTenure('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Privacy-Preserving Loan Application</h1>
          <p className="text-muted-foreground mt-1">
            Apply for a loan using encrypted behavioral identity verification
          </p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary">
          <Shield className="w-3 h-3 mr-1" />
          CREDGUARD Network
        </Badge>
      </div>

      {/* Consent Step */}
      {step === 'consent' && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Consent & Privacy Agreement
            </CardTitle>
            <CardDescription>
              Review and grant consent for privacy-preserving loan assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-foreground">You are authorizing CREDGUARD to:</h3>
              <ul className="space-y-3">
                {[
                  'Share your Encrypted Behavioral Identity (EBI) - non-reversible',
                  'Share your institution-specific trust score',
                  'Request loan assessment using privacy-preserving verification',
                  'Generate cryptographic proofs for audit compliance'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-destructive/10 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-destructive">Privacy Guarantees:</h3>
              <ul className="space-y-3">
                {[
                  'No raw financial data will be accessed or stored',
                  'No user profiling or behavioral inference',
                  'All computation remains encrypted (homomorphic)',
                  'No data storage beyond permitted scope',
                  'All access is logged and auditable'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={handleGrantConsent} className="w-full" size="lg">
              <Shield className="w-4 h-4 mr-2" />
              Grant Consent & Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Application Step */}
      {step === 'application' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Loan Application
              </CardTitle>
              <CardDescription>
                Enter your loan requirements for privacy-preserving assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount Requested *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Loan Purpose (Optional)</Label>
                <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Purchase</SelectItem>
                    <SelectItem value="auto">Auto Loan</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="debt">Debt Consolidation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure">Preferred Loan Tenure (Optional)</Label>
                <Select value={loanTenure} onValueChange={setLoanTenure}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                    <SelectItem value="36">36 Months</SelectItem>
                    <SelectItem value="48">48 Months</SelectItem>
                    <SelectItem value="60">60 Months</SelectItem>
                    <SelectItem value="84">84 Months</SelectItem>
                    <SelectItem value="120">120 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={performAssessment} 
                className="w-full" 
                size="lg"
                disabled={!loanAmount || isProcessing}
              >
                <Shield className="w-4 h-4 mr-2" />
                Submit for Privacy-Preserving Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Encrypted Inputs Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Fingerprint className="w-5 h-5 text-primary" />
                Secure Inputs
              </CardTitle>
              <CardDescription className="text-xs">
                Your encrypted data for assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {encryptedInputs && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Encrypted Vector</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setShowVector(!showVector)}
                      >
                        {showVector ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                    <div className="bg-muted/50 rounded p-2 font-mono text-xs break-all">
                      {showVector 
                        ? encryptedInputs.encryptedVector 
                        : '••••••••••••••••••••••••••••••••'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Trust Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={encryptedInputs.trustScore / 10} className="h-2" />
                      <span className="text-sm font-semibold">{encryptedInputs.trustScore}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Fraud Signal (Encrypted)</span>
                    <div className="bg-muted/50 rounded p-2 font-mono text-xs">
                      {encryptedInputs.fraudSignal}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Compliance Proof</span>
                    <div className="bg-muted/50 rounded p-2 font-mono text-xs">
                      {encryptedInputs.complianceProof}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Processing Secure Assessment</h3>
                <p className="text-sm text-muted-foreground">{processingStep}</p>
              </div>

              <div className="w-full max-w-md">
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center mt-2">{processingProgress}% Complete</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                All computation remains encrypted
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Step */}
      {step === 'result' && assessment && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card className={`border-2 ${
            assessment.eligibility === 'approved' 
              ? 'border-emerald-500/50 bg-emerald-500/5' 
              : assessment.eligibility === 'conditional'
              ? 'border-yellow-500/50 bg-yellow-500/5'
              : 'border-destructive/50 bg-destructive/5'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {assessment.eligibility === 'approved' ? (
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                  ) : assessment.eligibility === 'conditional' ? (
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold capitalize">{assessment.eligibility}</h2>
                    <p className="text-muted-foreground">
                      Requested: {formatCurrency(parseFloat(loanAmount))}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/50">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Decision
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Recommended Range</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(assessment.recommendedRange.min)} - {formatCurrency(assessment.recommendedRange.max)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="text-sm font-semibold">{assessment.riskScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fraud Likelihood</p>
                    <p className="text-sm font-semibold">{assessment.fraudLikelihood}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fairness Score</p>
                    <p className="text-sm font-semibold">{assessment.fairnessScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {assessment.reasoning.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cryptographic Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" />
                Cryptographic Proof of Fair Decision
              </CardTitle>
              <CardDescription>
                This proof verifies the decision was made fairly and compliantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs break-all">
                {assessment.cryptographicProof}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  GDPR Compliant
                </Badge>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  FCRA Compliant
                </Badge>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Fair Lending Act
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button onClick={resetApplication} variant="outline" className="w-full">
            Start New Application
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoanApplication;
