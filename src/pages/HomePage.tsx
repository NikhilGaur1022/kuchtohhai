import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Globe, Award, Calendar, Link, Users, ShoppingBag, Building2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect } from 'react';

const HomePage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  useEffect(() => {
    document.title = 'DentalReach – Home';
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden bg-gradient-to-br from-dental-50 to-white">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-dental-500 rounded-bl-full"></div>
          <div className="absolute left-0 bottom-0 w-1/3 h-2/3 opacity-5 bg-dental-700 rounded-tr-full"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
                <span className="text-dental-600">Build Authority.</span><br />
                <span className="text-dental-700">Gain Recognition.</span><br />
                <span className="text-dental-800">Share Knowledge.</span>
              </h1>
              <p className="text-lg text-neutral-700 mb-8 max-w-xl mx-auto lg:mx-0">
                Join the world's first all-in-one digital platform exclusively for dental professionals. Connect, learn, and grow with peers around the globe.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <RouterLink to="/register" className="btn-primary px-8 py-3 text-base text-white hover:bg-dental-700 hover:text-white transition-colors duration-200 ease-in-out">
                  Join DentalReach
                </RouterLink>
                <RouterLink to="/articles" className="group flex items-center text-dental-700 font-medium">
                  Explore Articles
                  <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                </RouterLink>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="rounded-3xl overflow-hidden shadow-xl"
            >
              <img 
                src="https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Dental professionals collaborating" 
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
          
          {/* Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center"
          >
            {[
              { label: 'Dental Professionals', value: '75,000+' },
              { label: 'Published Articles', value: '12,500+' },
              { label: 'Countries Reached', value: '140+' },
              { label: 'Years of Excellence', value: '7+' }
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-md">
                <p className="text-3xl font-bold text-dental-700 mb-2">{stat.value}</p>
                <p className="text-neutral-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Featured Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Discover Our <span className="text-dental-600">Featured Sections</span>
            </h2>
            <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
              DentalReach offers a comprehensive ecosystem of resources, connections, and opportunities for dental professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <BookOpen className="h-8 w-8 text-dental-600" />,
                title: 'Articles & Journals',
                description: 'Stay updated with the latest research, case studies, and clinical techniques.',
                link: '/articles'
              },
              { 
                icon: <Users className="h-8 w-8 text-dental-600" />,
                title: 'Community Forum',
                description: 'Connect with peers, ask questions, and share your expertise with professionals worldwide.',
                link: '/forum'
              },
              { 
                icon: <Calendar className="h-8 w-8 text-dental-600" />,
                title: 'Events & Webinars',
                description: 'Attend virtual and in-person events to expand your knowledge and network.',
                link: '/events'
              },
              { 
                icon: <Building2 className="h-8 w-8 text-dental-600" />,
                title: 'Business Listings',
                description: 'Discover dental clinics, laboratories, and service providers around the world.',
                link: '/business-listings'
              },
              { 
                icon: <ShoppingBag className="h-8 w-8 text-dental-600" />,
                title: 'Products Showcase',
                description: 'Explore the latest dental products, equipment, and materials in the market.',
                link: '/products'
              },
              { 
                icon: <Award className="h-8 w-8 text-dental-600" />,
                title: 'Digital Awards',
                description: 'Recognizing innovation and excellence in digital dentistry.',
                link: '/awards'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-dental-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-900">{feature.title}</h3>
                <p className="text-neutral-600 mb-4">{feature.description}</p>
                <RouterLink to={feature.link} className="text-dental-600 font-medium flex items-center hover:text-dental-700 transition-colors">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </RouterLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Vision Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Dr. Rockson Samuel" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -right-8 -bottom-8 bg-white rounded-2xl p-6 shadow-lg max-w-xs">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 bg-dental-100 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-dental-700" />
                  </div>
                  <p className="font-semibold text-neutral-900">Digital Innovation Award</p>
                </div>
                <p className="text-neutral-600 text-sm">Recognized for transforming dental education through digital platforms.</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <span className="text-sm uppercase tracking-wider text-dental-600 font-semibold">Our Vision</span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">Vision by Dr. Rockson Samuel</h2>
              </div>
              <div className="prose prose-lg max-w-none text-neutral-700">
                <p>
                  "DentalReach was founded with a vision to create a global community where dental professionals can connect, learn, and grow together. In today's rapidly evolving landscape, we believe that collaboration and knowledge sharing are essential for advancing dental care worldwide."
                </p>
                <p>
                  "Our platform is designed to break down geographical barriers, bridge knowledge gaps, and create opportunities for dental professionals at every stage of their career. From students to seasoned practitioners, from academicians to industry leaders—DentalReach is built for everyone who is passionate about dentistry."
                </p>
                <p>
                  "Together, we are building a future where quality dental education is accessible to all, where innovation is celebrated, and where every dental professional has the resources they need to excel in their practice and make a meaningful impact on patient care."
                </p>
              </div>
              <div className="mt-6 flex items-center">
                <img 
                  src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&h=120" 
                  alt="Dr. Rockson Samuel" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" 
                />
                <div className="ml-4">
                  <p className="font-semibold text-neutral-900">Dr. Rockson Samuel</p>
                  <p className="text-neutral-600">Founder & CEO, DentalReach</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-dental-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the DentalReach Community?</h2>
          <p className="text-lg text-dental-100 max-w-2xl mx-auto mb-8">
            Connect with thousands of dental professionals, access exclusive content, and stay at the forefront of dental innovation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <RouterLink to="/register" className="btn-primary px-8 py-3 text-base text-white hover:bg-dental-700 hover:text-white transition-colors duration-200 ease-in-out">
              Join Now
            </RouterLink>
            <RouterLink to="/articles" className="btn-primary px-8 py-3 text-base text-white hover:bg-dental-700 hover:text-white transition-colors duration-200 ease-in-out">
              Explore Content
            </RouterLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;