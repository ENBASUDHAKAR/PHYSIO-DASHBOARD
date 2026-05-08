import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Table } from 'lucide-react';
import { SessionTable } from '../components/sessions/SessionTable';
import { SessionCalendar } from '../components/sessions/SessionCalendar';

const Schedule: React.FC = () => {
  const [view, setView] = useState<'table' | 'calendar'>('table');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Schedule</h1>
          <p className="text-sm text-text-muted mt-1">Manage appointments & sessions</p>
        </div>
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          <button onClick={() => setView('table')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'table' ? 'bg-accent-teal/10 text-accent-teal' : 'text-text-muted hover:text-text-primary'}`}>
            <Table className="w-4 h-4" /> Table
          </button>
          <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-accent-teal/10 text-accent-teal' : 'text-text-muted hover:text-text-primary'}`}>
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {view === 'table' ? <SessionTable /> : <SessionCalendar />}
    </motion.div>
  );
};

export default Schedule;
