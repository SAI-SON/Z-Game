import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
function HomePageContent() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column */}
          <div>
            <motion.div variants={itemVariants} className="mb-6">
              <div className="text-6xl font-black">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink">
                  Z GAME
                </span>
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-2xl text-neon-cyan/80 mb-8">
              The fastest card buzzer game
            </motion.p>

            <motion.div variants={itemVariants} className="flex gap-4 flex-wrap">
              <NeonButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/create-room')}
              >
                Create Room
              </NeonButton>
              <NeonButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/join-room')}
              >
                Join Room
              </NeonButton>
            </motion.div>

            <motion.p variants={itemVariants} className="text-neon-cyan/60 text-sm mt-8">
              ✨ {Math.floor(Math.random() * 1000)} players online
            </motion.p>
          </div>

          {/* Right Column - Floating Cards */}
          <motion.div
            variants={itemVariants}
            className="hidden md:flex items-center justify-center relative h-96"
          >
            {['🐉', '🐯', '💀', '🔥', '⭐'].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{
                  y: Math.sin(i) * 20,
                  x: Math.cos(i) * 20,
                  rotate: 360,
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="absolute"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                }}
              >
                <GlassCard glowColor="cyan" className="p-4">
                  <div className="text-4xl">{emoji}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-4xl font-bold text-neon-cyan glow-cyan text-center mb-12">
          Why Play Z Game?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'Real-Time', description: 'Live multiplayer sync' },
            { icon: '🎯', title: 'Z Buzzer', description: 'First to match wins' },
            { icon: '🏆', title: 'Ranked', description: 'Climb to Legend tier' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <GlassCard glowColor="cyan">
                <div className="p-6 text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-neon-cyan/60">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return <HomePageContent />;
}
