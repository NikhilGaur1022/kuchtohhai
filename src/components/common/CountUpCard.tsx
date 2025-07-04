import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CountUpCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  delay?: number;
}

const CountUpCard: React.FC<CountUpCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  delay = 0 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Extract number from value string
  const targetNumber = parseInt(value.replace(/[^\d]/g, '')) || 0;
  const suffix = value.replace(/[\d,]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = targetNumber / steps;
        let current = 0;

        const counter = setInterval(() => {
          current += increment;
          if (current >= targetNumber) {
            setCount(targetNumber);
            clearInterval(counter);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(counter);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, targetNumber, delay]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden"
      whileHover={{ scale: 1.05 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-dental-400 rounded-full opacity-0 group-hover:opacity-60"
            initial={{ x: -10, y: 50 }}
            animate={{
              x: [0, 100, 200],
              y: [50, 20, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <motion.div 
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
          whileHover={{ 
            scale: 1.2, 
            rotate: 360,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
        
        <motion.p 
          className="text-3xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-2"
          key={count}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatNumber(count)}{suffix}
        </motion.p>
        
        <p className="text-neutral-600 text-sm group-hover:text-dental-600 transition-colors duration-300">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

export default CountUpCard;