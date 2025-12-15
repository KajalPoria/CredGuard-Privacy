import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Lock, 
  Eye, 
  Server, 
  KeyRound,
  Shield,
  ChevronRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  {
    id: "encryption",
    icon: Lock,
    title: "Homomorphic Encryption",
    description: "Computations run on encrypted data. Even we can't see your information.",
    details: [
      "Data remains encrypted during processing",
      "No decryption keys stored on servers",
      "Mathematical guarantees of privacy"
    ]
  },
  {
    id: "zkp",
    icon: Eye,
    title: "Zero-Knowledge Proofs",
    description: "Prove creditworthiness without revealing any underlying data.",
    details: [
      "Verify claims without exposing details",
      "Cryptographic proof of attributes",
      "Privacy-preserving attestations"
    ]
  },
  {
    id: "mpc",
    icon: Server,
    title: "Secure Multi-Party Computation",
    description: "Distributed processing ensures no single point of data exposure.",
    details: [
      "Computation split across nodes",
      "No single party sees full data",
      "Byzantine fault tolerant"
    ]
  },
  {
    id: "keys",
    icon: KeyRound,
    title: "User-Controlled Keys",
    description: "Only you hold the keys to your encrypted identity.",
    details: [
      "Self-sovereign key management",
      "Hardware security module support",
      "Recovery without exposure"
    ]
  },
];

const SecuritySection = () => {
  const [activeFeature, setActiveFeature] = useState(securityFeatures[0].id);
  
  const selectedFeature = securityFeatures.find(f => f.id === activeFeature) || securityFeatures[0];
  const SelectedIcon = selectedFeature.icon;

  return (
    <section id="security" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Enterprise Security</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground"
          >
            Privacy by <span className="text-primary">Mathematics</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            Built on cutting-edge cryptographic techniques to ensure your 
            financial data remains private. Secured by mathematical proofs, not promises.
          </motion.p>
        </div>

        {/* Interactive Feature Display */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${
                      isActive ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${isActive ? "text-foreground" : "text-foreground"}`}>
                          {feature.title}
                        </h4>
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isActive ? "rotate-90 text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Feature Details Panel */}
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:sticky lg:top-32"
          >
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10">
                  <SelectedIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedFeature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Advanced cryptographic protection
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                {selectedFeature.description}
              </p>
              
              <div className="space-y-3 mb-8">
                {selectedFeature.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{detail}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              >
                See It In Action
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
