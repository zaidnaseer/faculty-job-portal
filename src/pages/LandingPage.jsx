import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaUniversity, FaChalkboardTeacher } from "react-icons/fa";

const LandingPage = () => {
  const [visibleSection, setVisibleSection] = useState(0);
  const sectionsRef = useRef([]);

  // Observer for section animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSection(parseInt(entry.target.dataset.index));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sectionsRef.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-800">
        <div className="container mx-auto px-4 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Upaadhyay</h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100">
              Connecting exceptional faculty talent with leading academic institutions
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-blue-800 hover:bg-blue-50 px-8 py-3 rounded-full font-medium text-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn border-2 border-white text-white hover:bg-white hover:text-blue-800 px-8 py-3 rounded-full font-medium text-lg">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500 bg-opacity-20"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: Math.random() * 10 + 10,
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={el => sectionsRef.current[0] = el} 
        data-index={0}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={visibleSection >= 0 ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Why Choose Upaadhyay?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The premier platform designed specifically for academic careers and recruitment
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <FaSearch size={40} />,
                title: "Tailored Job Matching",
                description: "Our intelligent algorithm matches faculty with positions that align with their expertise and career goals."
              },
              {
                icon: <FaUniversity size={40} />,
                title: "Premier Institutions",
                description: "Connect with top universities and research organizations seeking exceptional academic talent."
              },
              {
                icon: <FaChalkboardTeacher size={40} />,
                title: "Showcase Your Expertise",
                description: "Create a comprehensive academic profile highlighting your research, teaching, and professional achievements."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={visibleSection >= 0 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-blue-50 p-8 rounded-xl text-center"
              >
                <div className="inline-block p-4 bg-blue-100 rounded-full text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={el => sectionsRef.current[1] = el} 
        data-index={1}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={visibleSection >= 1 ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to find your perfect academic position
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Your Academic Profile",
                description: "Build a comprehensive profile showcasing your education, research, teaching experience and publications."
              },
              {
                step: "2",
                title: "Discover Opportunities",
                description: "Browse open positions filtered by discipline, location, and institution type."
              },
              {
                step: "3",
                title: "Apply With Ease",
                description: "Submit applications directly through our platform with your prepared materials."
              },
              {
                step: "4",
                title: "Connect With Institutions",
                description: "Engage with hiring committees and receive updates on your application status."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={visibleSection >= 1 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="flex items-start mb-10"
              >
                <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-5">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={el => sectionsRef.current[2] = el} 
        data-index={2}
        className="py-20 bg-gradient-to-r from-blue-700 to-indigo-800 text-white"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={visibleSection >= 2 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Advance Your Academic Career?
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-full font-medium text-lg">
                Create Your Profile
              </Link>
              <Link to="/vacancies" className="btn border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 rounded-full font-medium text-lg">
                Browse Positions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;