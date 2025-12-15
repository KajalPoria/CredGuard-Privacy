import { motion } from "framer-motion";
import { Scale, FileCheck2, Globe2, ShieldCheck } from "lucide-react";

const regulations = [
  { name: "GDPR", region: "European Union" },
  { name: "CCPA", region: "California, USA" },
  { name: "PDPA", region: "Southeast Asia" },
  { name: "EU AI Act", region: "European Union" },
  { name: "RBI Guidelines", region: "India" },
  { name: "PCI DSS", region: "Global" },
];

const complianceFeatures = [
  {
    icon: Scale,
    title: "Algorithmic Fairness",
    description: "Continuous monitoring and auditing for bias in credit decisions.",
  },
  {
    icon: FileCheck2,
    title: "Regulatory Reporting",
    description: "Automated compliance reports for regulators across jurisdictions.",
  },
  {
    icon: Globe2,
    title: "Cross-Border Compatibility",
    description: "Designed to work within varying international privacy frameworks.",
  },
  {
    icon: ShieldCheck,
    title: "Audit Trails",
    description: "Cryptographic proofs of every decision for accountability.",
  },
];

const ComplianceSection = () => {
  return (
    <section id="compliance" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 pattern-grid opacity-20" />
      
      <div className="container relative z-10 px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <Scale className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Global Compliance</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            Built for <span className="text-gradient">Regulatory Excellence</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            CREDGUARD is designed from the ground up to meet the strictest 
            international privacy and AI regulations.
          </motion.p>
        </div>

        {/* Regulations Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {regulations.map((reg, index) => (
            <motion.div
              key={reg.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group px-5 py-3 rounded-full bg-card border border-border hover:border-primary/50 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <div>
                  <span className="font-semibold text-foreground">{reg.name}</span>
                  <span className="text-muted-foreground text-sm ml-2">• {reg.region}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Compliance Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-gradient-card border border-border hover:border-primary/50 transition-smooth text-center"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
