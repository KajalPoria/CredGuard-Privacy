import { motion } from "framer-motion";
import { 
  Fingerprint, 
  Globe2, 
  ShieldCheck, 
  Scale, 
  FileCheck, 
  Wallet
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Encrypted Behavioral Identity",
    description: "Convert your financial behavior into a mathematically irreversible encrypted vector.",
  },
  {
    icon: Globe2,
    title: "Global Trust Fabric",
    description: "Worldwide index enabling instant similarity matching and sub-second verification.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-Preserving Inference",
    description: "Banks query encrypted identities using homomorphic encryption.",
  },
  {
    icon: Scale,
    title: "AI Fairness Layer",
    description: "Detects and removes bias related to migration status, nationality, or geography.",
  },
  {
    icon: FileCheck,
    title: "Zero-Knowledge Explainability",
    description: "Regulators verify decisions with cryptographic proofs—without accessing data.",
  },
  {
    icon: Wallet,
    title: "Self-Sovereign Credit Wallet",
    description: "Store your encrypted credit identity on your device. Full consent control.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32 bg-card/50">
      <div className="container px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground"
          >
            Redefining Global Credit Trust
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            A privacy-first infrastructure that enables fair credit access worldwide 
            while keeping your financial data completely private.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="h-full p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
