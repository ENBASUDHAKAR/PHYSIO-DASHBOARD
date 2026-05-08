import React from 'react';
import { motion } from 'framer-motion';
import { StatsCards } from '../components/dashboard/StatsCards';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { PatientTypeDonut } from '../components/dashboard/PatientTypeDonut';
import { RecentActivity } from '../components/dashboard/RecentActivity';

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
      <motion.div variants={sectionVariants}>
        <h1 className="text-2xl font-display font-bold text-gradient">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Real-time overview of Sri Kavitha Physiotherapy</p>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <StatsCards />
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

export default Dashboard;
