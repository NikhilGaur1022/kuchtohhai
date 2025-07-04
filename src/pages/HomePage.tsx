import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Globe, Award, Calendar, Link, Users, ShoppingBag, Building2, Sparkles, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CountUpCard from '../components/common/CountUpCard';
import FAQSection from '../components/common/FAQSection';

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    document.title = 'DentalReach – Home';
  }, []);

  return (
    <>
      {/* Enhanced Hero Section with Advanced Effects */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dental-50 via-white to-blue-50">
          {/* Floating Orbs */}
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-dental-200/30 to-dental-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-dental-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 15, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }} />
          </div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-dental-200/50 shadow-lg mb-6"
              >
                <Sparkles className="h-4 w-4 text-dental-600 mr-2" />
                <span className="text-sm font-medium text-dental-700">World's First All-in-One Platform</span>
              </motion.div>

              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-dental-600 via-dental-700 to-dental-800 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  Build Authority.
                </motion.span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-dental-700 via-dental-600 to-dental-500 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['100%', '0%', '100%'] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  Gain Recognition.
                </motion.span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-dental-800 via-dental-700 to-dental-600 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                >
                  Share Knowledge.
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-lg text-neutral-700 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Join the world's first all-in-one digital platform exclusively for dental professionals. Connect, learn, and grow with peers around the globe.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <RouterLink 
                  to="/register" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-dental-600 via-dental-700 to-dental-800 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-dental-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-dental-700 via-dental-800 to-dental-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center">
                    Join DentalReach
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </RouterLink>
                
                <RouterLink 
                  to="/articles" 
                  className="group flex items-center text-dental-700 font-medium px-6 py-4 rounded-2xl hover:bg-white/50 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-dental-200/50"
                >
                  Explore Articles
                  <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1 duration-300" />
                </RouterLink>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
              }}
            >
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-dental-500/20 to-blue-500/20 z-10" />
                <img 
                  src="https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Dental professionals collaborating" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Elements */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-neutral-700">75k+ Active Users</span>
                </div>
              </motion.div>

              <motion.div
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: '2s' }}
                className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-neutral-700">4.9/5 Rating</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Enhanced Stats with Count-up Animation */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            <CountUpCard
              icon={Users}
              label="Dental Professionals"
              value="75,000+"
              color="from-blue-500 to-dental-600"
              delay={0}
            />
            <CountUpCard
              icon={BookOpen}
              label="Published Articles"
              value="12,500+"
              color="from-green-500 to-emerald-600"
              delay={200}
            />
            <CountUpCard
              icon={Globe}
              label="Countries Reached"
              value="140+"
              color="from-purple-500 to-violet-600"
              delay={400}
            />
            <CountUpCard
              icon={TrendingUp}
              label="Years of Excellence"
              value="7+"
              color="from-orange-500 to-red-600"
              delay={600}
            />
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Featured Sections */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)`,
            backgroundSize: '60px 60px'
          }} />
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
              className="inline-flex items-center px-4 py-2 bg-dental-50 rounded-full border border-dental-200 mb-6"
            >
              <Sparkles className="h-4 w-4 text-dental-600 mr-2" />
              <span className="text-sm font-medium text-dental-700">Comprehensive Platform</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Discover Our <span className="bg-gradient-to-r from-dental-600 to-dental-700 bg-clip-text text-transparent">Featured Sections</span>
            </h2>
            <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
              DentalReach offers a comprehensive ecosystem of resources, connections, and opportunities for dental professionals.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { 
                icon: BookOpen,
                title: 'Articles & Journals',
                description: 'Stay updated with the latest research, case studies, and clinical techniques.',
                link: '/articles',
                color: 'from-blue-500 to-dental-600',
                bgColor: 'from-blue-50 to-dental-50'
              },
              { 
                icon: Users,
                title: 'Community Forum',
                description: 'Connect with peers, ask questions, and share your expertise with professionals worldwide.',
                link: '/forum',
                color: 'from-green-500 to-emerald-600',
                bgColor: 'from-green-50 to-emerald-50'
              },
              { 
                icon: Calendar,
                title: 'Events & Webinars',
                description: 'Attend virtual and in-person events to expand your knowledge and network.',
                link: '/events',
                color: 'from-purple-500 to-violet-600',
                bgColor: 'from-purple-50 to-violet-50'
              },
              { 
                icon: Building2,
                title: 'Business Listings',
                description: 'Discover dental clinics, laboratories, and service providers around the world.',
                link: '/business-listings',
                color: 'from-orange-500 to-red-600',
                bgColor: 'from-orange-50 to-red-50'
              },
              { 
                icon: ShoppingBag,
                title: 'Products Showcase',
                description: 'Explore the latest dental products, equipment, and materials in the market.',
                link: '/products',
                color: 'from-pink-500 to-rose-600',
                bgColor: 'from-pink-50 to-rose-50'
              },
              { 
                icon: Award,
                title: 'Digital Awards',
                description: 'Recognizing innovation and excellence in digital dentistry.',
                link: '/awards',
                color: 'from-yellow-500 to-amber-600',
                bgColor: 'from-yellow-50 to-amber-50'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 text-neutral-900 group-hover:text-dental-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-neutral-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <RouterLink 
                      to={feature.link} 
                      className="inline-flex items-center text-dental-600 font-medium group-hover:text-dental-700 transition-all duration-300"
                    >
                      Explore 
                      <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </RouterLink>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Vision Section with More Effects */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-neutral-50 via-dental-50/30 to-blue-50/20 relative overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-dental-200/30 to-dental-300/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-dental-200/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 0.8, 1],
              opacity: [0.4, 0.8, 0.4],
              x: [0, -15, 0],
              y: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating Particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-dental-400/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="container-custom relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                {/* Enhanced Image Container with Blur Effects */}
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-dental-500/10 to-blue-500/10 backdrop-blur-[1px] z-10" />
                  <img 
                    src="https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="Dr. Rockson Samuel" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Overlay Blur Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                {/* Enhanced Floating Achievement Card */}
                <motion.div 
                  className="absolute -right-8 -bottom-8 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-xs border border-white/30"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.div 
                      className="h-12 w-12 bg-gradient-to-br from-dental-100 to-dental-200 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Award className="h-6 w-6 text-dental-700" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-neutral-900">Digital Innovation Award</p>
                      <p className="text-xs text-neutral-500">2024</p>
                    </div>
                  </div>
                  <p className="text-neutral-600 text-sm">Recognized for transforming dental education through digital platforms.</p>
                  
                  {/* Floating Sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-dental-400 rounded-full"
                      style={{
                        top: `${20 + i * 20}%`,
                        right: `${10 + i * 15}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <motion.span 
                  className="text-sm uppercase tracking-wider text-dental-600 font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  Our Vision
                </motion.span>
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Vision by Dr. Rockson Samuel
                </motion.h2>
              </div>
              
              <motion.div 
                className="prose prose-lg max-w-none text-neutral-700 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.p 
                  className="leading-relaxed"
                  whileInView={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.5 }}
                >
                  "DentalReach was founded with a vision to create a global community where dental professionals can connect, learn, and grow together. In today's rapidly evolving landscape, we believe that collaboration and knowledge sharing are essential for advancing dental care worldwide."
                </motion.p>
                <motion.p 
                  className="leading-relaxed"
                  whileInView={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  "Our platform is designed to break down geographical barriers, bridge knowledge gaps, and create opportunities for dental professionals at every stage of their career. From students to seasoned practitioners, from academicians to industry leaders—DentalReach is built for everyone who is passionate about dentistry."
                </motion.p>
                <motion.p 
                  className="leading-relaxed"
                  whileInView={{ opacity: 1 }}
                  initial={{ opacity: 0.7 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  "Together, we are building a future where quality dental education is accessible to all, where innovation is celebrated, and where every dental professional has the resources they need to excel in their practice and make a meaningful impact on patient care."
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="flex items-center pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="relative">
                  <motion.img 
                    src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&h=120" 
                    alt="Dr. Rockson Samuel" 
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-neutral-900">Dr. Rockson Samuel</p>
                  <p className="text-neutral-600">Founder & CEO, DentalReach</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
      
      {/* Enhanced CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-dental-700 via-dental-600 to-dental-800 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 50%, white 2px, transparent 2px)',
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        <div className="container-custom text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the DentalReach Community?
            </h2>
            <p className="text-lg text-dental-100 max-w-2xl mx-auto mb-8 leading-relaxed">
              Connect with thousands of dental professionals, access exclusive content, and stay at the forefront of dental innovation.
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <RouterLink 
                to="/register" 
                className="group relative overflow-hidden px-8 py-4 bg-white text-dental-700 font-semibold rounded-2xl hover:bg-dental-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-dental-50/0 via-dental-50/50 to-dental-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center">
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </RouterLink>
              
              <RouterLink 
                to="/articles" 
                className="group relative overflow-hidden px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center">
                  Explore Content
                  <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </RouterLink>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;