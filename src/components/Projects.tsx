
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ProjectCard from './ProjectCard';

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const projects = [
    {
      title: 'Voting App - Vote Now',
      description: 'A comprehensive online election management system with secure voter authentication and real-time vote tracking. This frontend React application showcases modern development skills with TypeScript and advanced UI components.',
      features: [
        'Digital Voting Platform with secure voter authentication and real-time vote tracking',
        'Multi-language Support with internationalization features for better accessibility',
        'Biometric Integration with camera capture for voter verification and profile management',
        'Real-time Election Dashboard displaying live results and voter statistics',
        'Responsive Design with mobile-first approach and dark/light theme support'
      ],
      githubUrl: 'https://github.com/Prachigarg24/Voting-App_Vote-Now.git',
      liveUrl: 'https://voting-app-vote-now.vercel.app',
      technologies: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Shadcn/ui', 'React Router DOM', 'React Context API', 'Radix UI', 'Lucide React', 'React Hook Form', 'Zod'],
      imageUrl: '/lovable-uploads/c983a7a6-8865-4092-bc42-99c6b75d4f62.png'
    },
    {
      title: 'StudyGenie – AI-Powered Study Companion',
      description: 'An intelligent study assistant that helps students create personalized study plans. Students can input syllabus topics and deadlines to receive AI-generated daily schedules, flashcards, and custom quizzes.',
      features: [
        'AI-powered personalized study plans',
        'OpenAI API integration for content generation',
        'Daily study schedules and flashcards',
        'Custom quiz generation based on topics',
        'Automated cron jobs for reminders'
      ],
      githubUrl: 'https://github.com/Prachigarg24/smart-study-genie-app.git',
      liveUrl: 'https://smart-study-genie-app.vercel.app',
      technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB', 'OpenAI API', 'Cron Jobs'],
      imageUrl: '/lovable-uploads/b01878ae-ea1e-4606-b13b-3d6ad04ef4de.png'
    },
    {
      title: 'BestBuy Clone',
      description: 'A comprehensive e-commerce platform replicating BestBuy\'s functionality with modern web technologies. Features include user authentication, product catalog, shopping cart, and responsive design.',
      features: [
        'Firebase Authentication system',
        'Advanced product filtering and search',
        'Responsive shopping cart functionality',
        'Mobile-first responsive design',
        'Real-time inventory management'
      ],
      githubUrl: 'https://github.com/Prachigarg24/BestBuy-Clone.git',
      liveUrl: 'https://best-buy-clone-two.vercel.app/',
      technologies: ['React', 'Firebase', 'CSS3', 'JavaScript', 'Responsive Design'],
      imageUrl: '/lovable-uploads/94c637d3-229f-4202-8598-eeb370299c79.png'
    },
    {
      title: 'SocialSynced',
      description: 'A full-stack social media platform that enables users to connect, share posts, and interact in real-time. Built with modern web technologies for optimal performance and user experience.',
      features: [
        'Real-time post creation and sharing',
        'User authentication and profiles',
        'Interactive social features',
        'Responsive design for all devices',
        'Modern UI/UX design patterns'
      ],
      githubUrl: 'https://github.com/syedamaan7733/4436.git',
      liveUrl: 'https://4436-euiu.vercel.app/index.html',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express.js'],
      imageUrl: '/lovable-uploads/704be81b-5195-420f-bb77-8f0f806817ff.png'
    }
  ];

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My <span className="text-blue-600">Projects</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Here are some of my recent projects that showcase my skills and passion for web development
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              {...project}
              index={index}
            />
          ))}
        </div>

        {/* Additional Projects Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">More Projects Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              I'm constantly working on new projects and expanding my portfolio. 
              Stay tuned for more exciting web applications and innovative solutions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://github.com/Prachigarg24', '_blank')}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors duration-300"
            >
              View All on GitHub
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
