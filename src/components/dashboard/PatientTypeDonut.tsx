import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const COLORS = ['#0ea5e9', '#f59e0b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-elevated px-4 py-2 shadow-xl">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-xs text-text-muted">{payload[0].value} patients</p>
      </div>
    );
  }
  return null;
};

export const PatientTypeDonut: React.FC = () => {
  const { data: chartData } = useQuery({
    queryKey: ['dashboard', 'patient-type-chart'],
    queryFn: async () => {
      const [clinicRes, homeRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('patient_type', 'clinic').eq('is_active', true),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('patient_type', 'home_visit').eq('is_active', true),
      ]);

      return [
        { name: 'Clinic', value: clinicRes.count || 0 },
        { name: 'Home Visit', value: homeRes.count || 0 },
      ];
    },
  });

  const total = chartData?.reduce((sum, d) => sum + d.value, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-6"
    >
      <h3 className="font-display font-bold text-lg mb-4">Patient Distribution</h3>
      <div className="h-[280px] flex items-center justify-center">
        {total === 0 ? (
          <p className="text-text-muted text-sm">No patient data yet</p>
        ) : (
          <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-display font-bold">{total}</p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        {chartData?.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-xs text-text-muted">{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
