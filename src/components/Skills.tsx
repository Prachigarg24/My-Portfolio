import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FaHtml5, 
  FaCss3Alt, 
  FaJs, 
  FaReact, 
  FaNodeJs, 
  FaGithub,
  FaDatabase
} from 'react-icons/fa';
import { 
  SiTailwindcss, 
  SiExpress, 
  SiMongodb, 
  SiFirebase, 
  SiPostman,
  SiRedux,
  SiVercel,
  SiDocker,
  
} from 'react-icons/si';

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        { name: 'HTML5', icon: FaHtml5, color: 'text-orange-500' },
        { name: 'CSS3', icon: FaCss3Alt, color: 'text-blue-500' },
        { name: 'JavaScript', icon: FaJs, color: 'text-yellow-500' },
        { name: 'React', icon: FaReact, color: 'text-cyan-500' },
        { name: 'Redux', icon: SiRedux, color: 'text-purple-600' },
        { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'text-teal-500' },
      
      ]
    },
    {
      title: 'Backend',
      skills: [
        { name: 'Node.js', icon: FaNodeJs, color: 'text-green-600' },
        { name: 'Express.js', icon: SiExpress, color: 'text-gray-700' },
        { name: 'MongoDB', icon: SiMongodb, color: 'text-green-500' },
        { name: 'Firebase', icon: SiFirebase, color: 'text-yellow-600' },
      ]
    },
    {
      title: 'Tools & Others',
      skills: [
        { name: 'GitHub', icon: FaGithub, color: 'text-gray-800' },
        { name: 'Postman', icon: SiPostman, color: 'text-orange-600' },
        { name: 'Vercel', icon: SiVercel, color: 'text-black' },
        { name: 'Docker', icon: SiDocker, color: 'text-blue-500' },
        { name: 'DSA', icon: FaDatabase, color: 'text-blue-600' },
      ]
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="skills" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My <span className="text-blue-600">Skills</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Here are the technologies and tools I work with to bring ideas to life
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={itemVariants}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {category.title}
              </h3>
              <div className="space-y-4">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: (categoryIndex * 0.2) + (skillIndex * 0.1) }}
                    className="flex items-center space-x-4"
                  >
                    <div className={`text-3xl ${skill.color} flex-shrink-0`}>
                      <skill.icon />
                    </div>
                    <div className="flex-grow">
                      <span className="font-medium text-gray-900 text-lg">{skill.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Technologies I Work With
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-6">
            {[
              { icon: FaHtml5, color: 'text-orange-500', name: 'HTML5' },
              { icon: FaCss3Alt, color: 'text-blue-500', name: 'CSS3' },
              { icon: FaJs, color: 'text-yellow-500', name: 'JavaScript' },
              { icon: FaReact, color: 'text-cyan-500', name: 'React' },
              { icon: FaNodeJs, color: 'text-green-600', name: 'Node.js' },
              { icon: SiMongodb, color: 'text-green-500', name: 'MongoDB' },
              { icon: SiTailwindcss, color: 'text-teal-500', name: 'Tailwind' },
              { icon: FaGithub, color: 'text-gray-800', name: 'GitHub' },
              { icon: SiVercel, color: 'text-black', name: 'Vercel' },
              { icon: SiDocker, color: 'text-blue-500', name: 'Docker' },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <tech.icon className={`text-4xl ${tech.color} mb-2`} />
                <span className="text-sm font-medium text-gray-700">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
