import React from 'react';
import { motion } from "framer-motion";
import DashboardCard from "../cards/DashboardCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const DashboardCards = ({ displayedCards }) => {
  return (
    <motion.div 
      className="metrics-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {displayedCards.map(card => (
        <motion.div 
          key={card.id} 
          variants={cardVariants}
          whileHover={{ y: -5 }}
        >
          <DashboardCard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardCards;