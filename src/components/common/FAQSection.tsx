import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is DentalReach and how does it work?",
    answer: "DentalReach is the world's first all-in-one digital platform exclusively for dental professionals. It connects dentists, hygienists, students, and industry experts worldwide through articles, forums, events, job opportunities, and educational resources."
  },
  {
    question: "How do I get verified on DentalReach?",
    answer: "To get verified, you need to submit a verification application with your professional credentials, business information, and relevant documentation. Our admin team reviews applications within 3-5 business days. Verified users can create events and post job opportunities."
  },
  {
    question: "Can I publish articles on DentalReach?",
    answer: "Yes! All registered users can submit articles for publication. Our editorial team reviews submissions to ensure quality and relevance. Once approved, your articles will be visible to the entire DentalReach community and can help establish your professional authority."
  },
  {
    question: "What types of events can I find on DentalReach?",
    answer: "DentalReach hosts various types of events including conferences, webinars, workshops, seminars, and networking events. Both virtual and in-person events are available, covering topics from clinical techniques to practice management and industry innovations."
  },
  {
    question: "Is DentalReach free to use?",
    answer: "Yes, DentalReach is free to join and use. Basic features like browsing articles, participating in forums, and attending free events are available to all members. Some premium events or specialized content may have associated fees."
  },
  {
    question: "How can I find job opportunities in dentistry?",
    answer: "Our Jobs section features opportunities from dental practices, clinics, laboratories, and organizations worldwide. You can filter by location, job type, experience level, and specialty. Verified employers post positions ranging from clinical roles to administrative and research positions."
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-neutral-50 to-dental-50/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-dental-200/20 to-blue-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-dental-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container-custom relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-dental-200/50 shadow-lg mb-6"
          >
            <HelpCircle className="h-4 w-4 text-dental-600 mr-2" />
            <span className="text-sm font-medium text-dental-700">Frequently Asked Questions</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Got <span className="bg-gradient-to-r from-dental-600 to-dental-700 bg-clip-text text-transparent">Questions?</span>
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
            Find answers to the most common questions about DentalReach and how to make the most of our platform.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-dental-50/50 transition-all duration-300 group"
                >
                  <span className="text-lg font-semibold text-neutral-900 group-hover:text-dental-700 transition-colors duration-300">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 ml-4"
                  >
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-dental-600" />
                    ) : (
                      <Plus className="h-5 w-5 text-dental-600" />
                    )}
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="text-neutral-600 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-neutral-600 mb-6">
            Still have questions? We're here to help!
          </p>
          <motion.a
            href="mailto:support@dentalreach.com"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-dental-600 to-dental-700 text-white font-medium rounded-xl hover:from-dental-700 hover:to-dental-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;