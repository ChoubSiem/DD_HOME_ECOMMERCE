import React from 'react';
import { motion } from "framer-motion";
import SellerItem from "../saller_item/SellerItem";

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

const ProductPerformance = ({ title, products }) => {
  return (
    <motion.div 
      className="seller-section"
      variants={cardVariants}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="seller-header">
        <h3 className="seller-title">{title}</h3>
        <span className="view-all">View All</span>
      </div>
      {products.map((product, index) => (
        <SellerItem 
          key={index}
          name={product.name} 
          value={product.value} 
          percentage={product.percentage} 
          progress={product.progress}
          color={product.color}
        />
      ))}
    </motion.div>
  );
};

export default ProductPerformance;