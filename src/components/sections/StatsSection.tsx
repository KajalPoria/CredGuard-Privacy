import { motion } from "framer-motion";

const stats = [
  {
    value: "180+",
    label: "Countries Supported",
    description: "Global coverage",
  },
  {
    value: "50M+",
    label: "Credit Profiles",
    description: "Encrypted identities",
  },
  {
    value: "2,500+",
    label: "Partner Institutions",
    description: "Banks worldwide",
  },
  {
    value: "0",
    label: "Data Breaches",
    description: "Privacy by design",
  },
];

const StatsSection = () => {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="container px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
