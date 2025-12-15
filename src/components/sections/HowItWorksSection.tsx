import { motion } from "framer-motion";
import { 
  UserCircle2, 
  Binary, 
  Search, 
  CheckCircle2,
  ArrowRight,
  Lock,
  Layers
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserCircle2,
    title: "Connect Your Data",
    description: "Securely link your financial accounts. Your raw data never leaves your device—only encrypted behavioral patterns are generated.",
    highlight: "100% Local Processing",
  },
  {
    number: "02",
    icon: Binary,
    title: "Generate Encrypted Identity",
    description: "AI transforms your financial behavior into a mathematically irreversible encrypted vector using zero-knowledge proofs.",
    highlight: "ZK-Proof Protected",
  },
  {
    number: "03",
    icon: Search,
    title: "Global Trust Matching",
    description: "Your encrypted identity is matched against our global trust fabric for instant creditworthiness verification.",
    highlight: "Sub-Second Results",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Receive Fair Credit",
    description: "Lenders receive a verified trust score without ever accessing your personal financial data. Fair credit, anywhere.",
    highlight: "Privacy Preserved",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Simple Process</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            How <span className="text-gradient">CREDGUARD</span> Works
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            From data encryption to credit approval—your privacy is protected at every step.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className={`relative flex items-center gap-8 mb-16 last:mb-0 ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className={`inline-block p-8 rounded-2xl bg-gradient-card border border-border hover:border-primary/50 transition-smooth ${
                    isEven ? 'lg:ml-auto' : 'lg:mr-auto'
                  }`}>
                    <div className={`flex items-center gap-4 mb-4 ${isEven ? 'lg:justify-end' : ''}`}>
                      <span className="text-4xl font-bold text-primary/30">{step.number}</span>
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      {step.description}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                      <Lock className="w-3 h-3" />
                      {step.highlight}
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="hidden lg:flex relative z-10 w-16 h-16 items-center justify-center rounded-full bg-card border-2 border-primary shadow-glow">
                  <span className="text-lg font-bold text-primary">{index + 1}</span>
                </div>

                {/* Spacer for layout */}
                <div className="hidden lg:block flex-1" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
