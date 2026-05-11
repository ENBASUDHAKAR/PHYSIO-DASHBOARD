import React from 'react';
import { motion } from 'framer-motion';
import { StatsCards } from '../components/dashboard/StatsCards';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { PatientTypeDonut } from '../components/dashboard/PatientTypeDonut';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DashboardHero } from '../components/dashboard/DashboardHero';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const sectionVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* Hero Section */}
      <motion.div variants={sectionVariants}>
        <DashboardHero />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <StatsCards />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PhysioImageStrip />
      </motion.div>

      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySchedule />
        <RecentActivity />
      </motion.div>

      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <PatientTypeDonut />
      </motion.div>
    </motion.div>
  );
};

function PhysioImageStrip() {
  const images = [
    { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75', label: 'Exercise Therapy' },
    { url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=75', label: 'Manual Therapy' },
    { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=75', label: 'Recovery & Rehab' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {images.map(({ url, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="relative rounded-xl overflow-hidden h-28 border border-slate-700/40 group"
        >
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <span className="absolute bottom-2 left-3 text-xs font-semibold text-white/90 tracking-wide">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

export default Dashboard;
