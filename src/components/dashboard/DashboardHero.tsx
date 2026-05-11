// src/components/dashboard/DashboardHero.tsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserPlus, CalendarPlus, ClipboardList,
         Package, Home, Building2, Clock,
         Sun, Sunset, Moon, Activity, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { format, startOfDay, endOfDay, startOfMonth } from 'date-fns'

// ── hooks ──────────────────────────────────────────────
function useGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Good Morning', Icon: Sun }
  if (h < 17) return { text: 'Good Afternoon', Icon: Sunset }
  return { text: 'Good Evening', Icon: Moon }
}

function useTodaySessions() {
  return useQuery({
    queryKey: ['hero-today-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, visit_type, scheduled_at, status')
        .gte('scheduled_at', startOfDay(new Date()).toISOString())
        .lte('scheduled_at', endOfDay(new Date()).toISOString())
        .order('scheduled_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 30_000,
  })
}

function useHeroStats() {
  return useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const [patients, sessions] = await Promise.all([
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .gte('scheduled_at', startOfMonth(new Date()).toISOString())
          .eq('status', 'completed'),
      ])
      return {
        activePatients: patients.count ?? 0,
        monthSessions: sessions.count ?? 0,
      }
    },
  })
}

// ── component ───────────────────────────────────────────
interface DashboardHeroProps {
  onAddPatient?: () => void
  onAddSession?: () => void
}

export function DashboardHero({
  onAddPatient,
  onAddSession,
}: DashboardHeroProps) {
  const navigate = useNavigate()
  const { text: greet, Icon: GreetIcon } = useGreeting()
  const { data: todaySessions = [] } = useTodaySessions()
  const { data: stats } = useHeroStats()

  const clinicCount = todaySessions.filter((s: any) => s.visit_type === 'clinic').length
  const homeCount   = todaySessions.filter((s: any) => s.visit_type === 'home_visit').length
  const nextSession = todaySessions.find((s: any) => s.status === 'scheduled') as any

  const quickActions = [
    { label: 'Add Patient',      Icon: UserPlus,      action: onAddPatient ?? (() => navigate('/patients')) },
    { label: 'Schedule Session', Icon: CalendarPlus,  action: onAddSession ?? (() => navigate('/schedule')) },
    { label: "Today's List",     Icon: ClipboardList, action: () => navigate('/schedule') },
    { label: 'Add Package',      Icon: Package,       action: () => navigate('/packages') },
  ]

  return (
    <div className="space-y-4 mb-6">
      {/* ── HERO GRID ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — Welcome */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 rounded-2xl border border-slate-700/50
                     bg-slate-800/60 backdrop-blur-sm p-6 flex flex-col gap-4"
        >
          {/* Greeting row */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 6 }}
            >
              <GreetIcon className="w-7 h-7 text-amber-400 flex-shrink-0" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {greet}, Dr.&nbsp;Karthik 👋
              </h2>
              <p className="text-slate-400 text-sm">
                {format(new Date(), 'EEEE, dd MMMM yyyy')}
              </p>
            </div>
          </div>

          {/* Today pills */}
          <div className="flex flex-wrap gap-2">
            <Pill color="sky" Icon={Building2} value={clinicCount} label="Clinic" />
            <Pill color="amber" Icon={Home} value={homeCount} label="Home Visits" />
            {nextSession ? (
              <Pill
                color="emerald"
                Icon={Clock}
                value={format(new Date(nextSession.scheduled_at), 'hh:mm a')}
                label="Next"
              />
            ) : (
              <span className="text-slate-500 text-sm italic self-center">
                No sessions scheduled today
              </span>
            )}
          </div>

          {/* Mini stats */}
          <div className="flex gap-6 pt-2 border-t border-slate-700/50">
            <MiniStat Icon={Users}    value={stats?.activePatients ?? '—'} label="Active Patients" color="sky" />
            <MiniStat Icon={Activity} value={stats?.monthSessions ?? '—'}  label="Sessions This Month" color="teal" />
          </div>
        </motion.div>

        {/* RIGHT — Physio image card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 relative rounded-2xl overflow-hidden
                     border border-slate-700/50 min-h-[200px]"
        >
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-teal-800 to-cyan-900" />
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80"
            alt="Physiotherapy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t
                          from-slate-900 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r
                          from-teal-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
            <p className="text-white text-sm font-medium italic leading-snug">
              "Every session is a step toward recovery"
            </p>
            <p className="text-teal-400 text-xs font-semibold tracking-wide uppercase">
              Sri Kavitha Physiotherapy
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {quickActions.map(({ label, Icon, action }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.07 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={action}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full
                       flex-shrink-0 whitespace-nowrap text-sm font-medium
                       border border-sky-500/30 bg-sky-500/10 text-sky-300
                       hover:bg-sky-500/20 transition-all duration-200"
          >
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

// ── small helpers ────────────────────────────────────────
function Pill({
  color, Icon, value, label,
}: { color: string; Icon: any; value: number | string; label: string }) {
  const cls: Record<string, string> = {
    sky:     'bg-sky-500/10 border-sky-500/20 text-sky-300',
    amber:   'bg-amber-500/10 border-amber-500/20 text-amber-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cls[color]}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">{value} {label}</span>
    </div>
  )
}

function MiniStat({
  Icon, value, label, color,
}: { Icon: any; value: number | string; label: string; color: string }) {
  const tc: Record<string, string> = {
    sky: 'text-sky-400', teal: 'text-teal-400',
  }
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${tc[color]}`} />
      <div>
        <p className={`text-lg font-bold ${tc[color]}`}>{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}
