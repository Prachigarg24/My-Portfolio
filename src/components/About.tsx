
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaGraduationCap, FaCode, FaLightbulb } from 'react-icons/fa';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const timelineData = [
    {
      year: '2024-2027',
      title: 'BCA - Amity University',
      description: 'Currently pursuing Bachelor of Computer Applications',
      icon: FaGraduationCap,
    },
    {
      year: '2025',
      title: 'Full Stack Web Development - Masai School',
      description: 'Intensive full-stack development program specializing in MERN stack',
      icon: FaCode,
    },
    {
      year: '2024',
      title: 'Yuvashakti Model School',
      description: 'Completed secondary education with focus on mathematics and science',
      icon: FaLightbulb,
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-blue-600">Me</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - About Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Hi there! I'm Prachi Garg
            </h3>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                I'm a passionate <span className="text-blue-600 font-semibold">Full Stack MERN Developer</span> with 
                a deep love for creating innovative web applications. My journey in web development started with a 
                curiosity about how websites work, and it has evolved into a passion for building seamless digital experiences.
              </p>
              <p>
                Currently pursuing my BCA at Amity University while simultaneously enhancing my skills through 
                intensive training at Masai School. I believe in the power of continuous learning and staying 
                updated with the latest technologies.
              </p>
              <p>
                My approach to development focuses on writing clean, efficient code and creating user-centric 
                applications that solve real-world problems. I'm particularly interested in the intersection of 
                <span className="text-blue-600 font-semibold"> frontend aesthetics and backend functionality</span>.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 grid grid-cols-2 gap-6"
            >
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-gray-600">Projects Completed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">2+</div>
                <div className="text-gray-600">Years Learning</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Education Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Education & Learning Journey</h3>
            <div className="space-y-6">
              {timelineData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <item.icon size={20} />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm text-blue-600 font-medium mb-1">{item.year}</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
