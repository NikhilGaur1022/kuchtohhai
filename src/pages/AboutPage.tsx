import { useEffect } from 'react';
import { Users, Target, Award, Globe, Heart, Lightbulb, BookOpen, Network, Trophy, Smartphone, Mail, MapPin, GraduationCap, Calendar, Star } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'About | DentalReach';
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Knowledge & Content",
      description: "Peer-reviewed articles, clinical case studies, journals and research archives",
      items: ["Peer-reviewed articles & clinical case studies", "Journals and research archives", "Newsletter and educational resources"]
    },
    {
      icon: Network,
      title: "Community & Networking",
      description: "Professional forums, events, and business networking opportunities",
      items: ["Professional forums & discussions", "Events, webinars, and conferences", "Business listings and classifieds"]
    },
    {
      icon: Trophy,
      title: "Recognition & Growth",
      description: "Build your professional reputation and showcase your expertise",
      items: ["Leaderboard and awards", "Profile building and digital reputation", "Product showcases and reviews"]
    },
    {
      icon: Smartphone,
      title: "Digital Tools",
      description: "Modern, user-friendly tools designed for dental professionals",
      items: ["Submission and publishing workflow", "Advanced search and filtering", "Mobile-friendly, modern UI"]
    }
  ];

  const objectives = [
    {
      icon: Globe,
      title: "Global Community",
      description: "Foster a worldwide network of dental professionals sharing knowledge and expertise"
    },
    {
      icon: BookOpen,
      title: "Knowledge Sharing",
      description: "Enable seamless sharing of clinical knowledge, research, and best practices"
    },
    {
      icon: Award,
      title: "Professional Growth",
      description: "Promote career advancement through recognition, collaboration, and learning"
    },
    {
      icon: Heart,
      title: "Bridge Education Gaps",
      description: "Improve access to dental education and resources for professionals worldwide"
    },
    {
      icon: Lightbulb,
      title: "Drive Innovation",
      description: "Support digital transformation and innovation in modern dentistry"
    }
  ];

  const adminTeam = [
    {
      name: "Admin Name 1",
      email: "admin1@dentalreach.com",
      role: "Platform Administrator",
      description: "Oversees platform operations and user management"
    },
    {
      name: "Admin Name 2", 
      email: "admin2@dentalreach.com",
      role: "Content Administrator",
      description: "Manages content quality and editorial processes"
    },
    {
      name: "Admin Name 3",
      email: "admin3@dentalreach.com", 
      role: "Community Administrator",
      description: "Facilitates community engagement and support"
    }
  ];

  const technicalTeam = [
    {
      name: "Bhavye",
      email: "bhavye29@gmail.com",
      role: "Technical Lead",
      description: "Leads platform development and architecture"
    },
    {
      name: "Nehan",
      email: "nehanlil06@gmail.com",
      role: "Full Stack Developer", 
      description: "Frontend and backend development specialist"
    },
    {
      name: "Nikhil",
      email: "nikhilgaur@gmail.com",
      role: "UI/UX Developer",
      description: "User interface and experience design expert"
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dental-600 via-dental-700 to-dental-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/images/dental-pattern.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                About <span className="text-dental-200">DentalReach</span>
              </h1>
              <p className="text-xl md:text-2xl text-dental-100 mb-8 leading-relaxed">
                Empowering dental professionals worldwide with a collaborative, innovative, and accessible digital platform for education, networking, and growth.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-medium">Global Community</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  <Target className="h-5 w-5 mr-2" />
                  <span className="font-medium">Professional Growth</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-dental-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-dental-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Our Mission</h3>
                  <p className="text-neutral-600">
                    Advancing dental care through collaboration, innovation, and knowledge sharing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Dr. Rockson Samuel */}
      {/* Founder Section - Dr. Rockson Samuel */}
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Meet Our Founder</h2>
      <div className="w-24 h-1 bg-dental-600 mx-auto mb-8"></div>
    </div>

    <div className="bg-gradient-to-br from-dental-50 to-dental-100 rounded-3xl overflow-hidden shadow-2xl">
      <div className="grid lg:grid-cols-2 items-center gap-8">
        <div className="p-6 lg:p-8">
          {/* Photo Frame */}
          <div className="relative mb-6">
            <div className="w-80 h-80 lg:w-100 lg:h-100 mx-auto relative">
              {/* Decorative frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-dental-600 to-dental-700 rounded-full p-2">
                <div className="w-full h-full bg-white rounded-full p-3">
                  <div className="w-full h-full bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                    {/* Replace this div with your image */}
                    <img 
                      src="src/images/about/dr-rockson-samuel.jpg" 
                      alt="Dr. Rockson Samuel"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    {/* Placeholder when image is not available */}
                    <div className="w-full h-full bg-dental-100 flex items-center justify-center" style={{display: 'none'}}>
                      <Users className="h-20 w-20 text-dental-600" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-dental-600 rounded-full"></div>
              <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-dental-400 rounded-full"></div>
              <div className="absolute top-6 -left-4 w-3 h-3 bg-dental-300 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Dr. Rockson Samuel</h3>
            <p className="text-lg text-dental-600 font-semibold mb-3">Founder & Chief Dental Officer</p>
            <div className="flex items-center text-neutral-600 mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-base font-semibold text-neutral-900 mb-2 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2 text-dental-600" />
                Education & Qualifications
              </h4>
              <ul className="space-y-1 text-sm text-neutral-700">
                <li className="flex items-start">
                  <Star className="h-3 w-3 mr-2 text-dental-600 mt-1 flex-shrink-0" />
                  <span>Bachelor of Dental Surgery (BDS)</span>
                </li>
                <li className="flex items-start">
                  <Star className="h-3 w-3 mr-2 text-dental-600 mt-1 flex-shrink-0" />
                  <span>Master of Dental Surgery (MDS) in Oral and Maxillofacial Surgery</span>
                </li>
                <li className="flex items-start">
                  <Star className="h-3 w-3 mr-2 text-dental-600 mt-1 flex-shrink-0" />
                  <span>Specialized training in Dental Implantology</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-neutral-900 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-2 text-dental-600" />
                Expertise & Specializations
              </h4>
              <ul className="space-y-1 text-sm text-neutral-700">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-dental-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>Dental Implants & Oral Surgery</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-dental-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>Maxillofacial Surgery</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-dental-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>Advanced Dental Procedures</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-dental-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>Digital Dentistry & Innovation</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-neutral-900 mb-2">Vision</h4>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Dr. Rockson Samuel envisions DentalReach as a transformative platform that bridges the gap between dental professionals worldwide, fostering collaboration, knowledge sharing, and continuous learning in the ever-evolving field of dentistry.
              </p>
            </div>

            <div className="flex items-center pt-2">
              <Mail className="h-4 w-4 mr-2 text-dental-600" />
              <a href="mailto:rockson@dentalreach.com" className="text-dental-600 hover:text-dental-700 font-medium text-sm">
                rockson@dentalreach.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Objectives Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Our Objectives</h2>
            <div className="w-24 h-1 bg-dental-600 mx-auto mb-8"></div>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We're committed to transforming the dental profession through these key objectives
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {objectives.map((objective, index) => {
              const Icon = objective.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-neutral-50 rounded-2xl p-8 h-full border border-neutral-200 hover:border-dental-300 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-dental-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-dental-600 transition-colors duration-300">
                      <Icon className="h-8 w-8 text-dental-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-4">{objective.title}</h3>
                    <p className="text-neutral-700 leading-relaxed">{objective.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Core Features</h2>
            <div className="w-24 h-1 bg-dental-600 mx-auto mb-8"></div>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Comprehensive tools and features designed specifically for dental professionals
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-8">
                    <div className="flex items-start mb-6">
                      <div className="w-16 h-16 bg-dental-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                        <Icon className="h-8 w-8 text-dental-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                        <p className="text-neutral-600">{feature.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-dental-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-neutral-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Technical Team</h2>
              <div className="w-24 h-1 bg-dental-600 mx-auto mb-8"></div>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Our skilled developers and engineers who bring DentalReach to life
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {technicalTeam.map((member, index) => (
                <div key={index} className="bg-gradient-to-br from-dental-50 to-dental-100 rounded-2xl p-8 border border-dental-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dental-600 transition-colors duration-300 shadow-md">
                      <Smartphone className="h-10 w-10 text-dental-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{member.name}</h3>
                    <p className="text-dental-600 font-semibold mb-3 text-lg">{member.role}</p>
                    <p className="text-neutral-600 text-sm mb-4 leading-relaxed">{member.description}</p>
                    <div className="flex items-center justify-center">
                      <Mail className="h-3 w-3 mr-2 text-dental-600" />
                      <a href={`mailto:${member.email}`} className="text-dental-600 hover:text-dental-700 text-sm font-medium">
                        {member.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Admin Team */}
          <div >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Administrative Team</h2>
              <div className="w-24 h-1 bg-dental-600 mx-auto mb-8"></div>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Meet our dedicated administrators who ensure smooth platform operations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adminTeam.map((admin, index) => (
                <div key={index} className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-8 border border-neutral-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-dental-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dental-600 transition-colors duration-300">
                      <Users className="h-10 w-10 text-dental-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{admin.name}</h3>
                    <p className="text-dental-600 font-semibold mb-3">{admin.role}</p>
                    <p className="text-neutral-600 text-sm mb-4 leading-relaxed">{admin.description}</p>
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2 text-dental-600" />
                      <a href={`mailto:${admin.email}`} className="text-dental-600 hover:text-dental-700 text-sm font-medium">
                        {admin.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Team */}
        </div>
      </section>

      {/* MVP Phase Section */}
      <section className="py-20 bg-gradient-to-br from-dental-50 to-dental-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">MVP Phase 1 Modules</h2>
            <div className="w-24 h-1 bg-dental-600 mx-auto mb-8"></div>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              The first phase of our platform includes these essential modules
            </p>
          </div>

          {/* First row - 5 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            {[
              "Articles & Journals",
              "Forum & Community",
              "Events & Webinars",
              "Business Listings",
              "Products Showcase"
            ].map((module, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-neutral-200 min-h-[160px] flex flex-col justify-center">
                <div className="w-12 h-12 bg-dental-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm leading-tight px-2">
                  {module}
                </h3>
              </div>
            ))}
          </div>

          {/* Second row - 3 cards centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
            {[
              "Leaderboard & Awards",
              "User Authentication",
              "Newsletter Archive"
            ].map((module, index) => (
              <div key={index + 5} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-neutral-200 min-h-[160px] flex flex-col justify-center">
                <div className="w-12 h-12 bg-dental-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {index + 6}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm leading-tight px-2">
                  {module}
                </h3>
              </div>
            ))}
          </div>

          {/* Third row - 2 cards centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              "Review Workflow",
              "Responsive UI"
            ].map((module, index) => (
              <div key={index + 8} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-neutral-200 min-h-[160px] flex flex-col justify-center">
                <div className="w-12 h-12 bg-dental-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {index + 9}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm leading-tight px-2">
                  {module}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-dental-600 to-dental-700 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 items-center">
              <div className="p-8 lg:p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-xl text-dental-100 leading-relaxed mb-8">
                  Our mission is to empower dental professionals worldwide by providing a collaborative, innovative, and accessible digital platform—enabling them to excel in their practice, advance dental care, and make a meaningful impact on global oral health.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-dental-100 font-medium">Advancing Global Oral Health</span>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">50K+</div>
                      <div className="text-dental-200 text-sm">Professionals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">100+</div>
                      <div className="text-dental-200 text-sm">Countries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">1000+</div>
                      <div className="text-dental-200 text-sm">Articles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">24/7</div>
                      <div className="text-dental-200 text-sm">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
