import { useState, useRef, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Camera, User, Phone, MapPin, Award,
  Stethoscope, Building2, Hash, Clock,
  Save, Edit3, Mail, FileText, Loader2,
} from 'lucide-react'
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
  useUploadDoctorPhoto,
} from '../hooks/useDoctorProfile'

const schema = z.object({
  full_name:           z.string().min(2, 'Required'),
  qualification:       z.string().min(1, 'Required'),
  specialization:      z.string().min(1, 'Required'),
  registration_number: z.string().optional(),
  phone:               z.string().optional(),
  email:               z.string().email().optional().or(z.literal('')),
  clinic_name:         z.string().optional(),
  clinic_address:      z.string().optional(),
  clinic_phone:        z.string().optional(),
  experience_years:    z.coerce.number().min(0).optional(),
  about:               z.string().optional(),
})
type FormData = z.infer<typeof schema>

const Field = forwardRef<HTMLInputElement, any>(
  ({ label, icon, error, disabled, ...props }, ref) => (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        {icon && <span className="w-3.5 h-3.5 opacity-70">{icon}</span>}
        {label}
      </label>
      <input
        ref={ref}
        disabled={disabled}
        {...props}
        className="w-full rounded-lg px-3 py-2.5 text-sm
                   bg-slate-700/50 border border-slate-600/50
                   text-slate-200 placeholder-slate-500
                   focus:outline-none focus:border-sky-500
                   focus:ring-1 focus:ring-sky-500/30
                   disabled:opacity-50 disabled:cursor-default
                   transition-colors"
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
)

function Section({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-teal-400/80 uppercase
                     tracking-wider mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-slate-200 mt-0.5 leading-relaxed">{value}</p>
      </div>
    </div>
  )
}

export default function DoctorProfile() {
  const { data: profile, isLoading } = useDoctorProfile()
  const { mutate: saveProfile, isPending: isSaving } = useUpdateDoctorProfile()
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadDoctorPhoto()
  const [editing, setEditing] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: profile as any,
  })

  const onSubmit = (data: FormData) => {
    saveProfile(data as any, { onSuccess: () => setEditing(false) })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadPhoto(file)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 p-4 md:p-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctor Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your professional information &amp; clinic details
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => { setEditing(e => !e); if (editing) reset() }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                     font-medium border border-sky-500/30 bg-sky-500/10
                     text-sky-400 hover:bg-sky-500/20 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          {editing ? 'Cancel' : 'Edit Profile'}
        </motion.button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-slate-700/50
                        bg-slate-800/60 backdrop-blur-sm overflow-hidden">

          {/* Cover */}
          <div className="h-36 relative overflow-hidden
                          bg-gradient-to-r from-sky-900 via-teal-800 to-cyan-900">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&q=60"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute right-6 top-4 opacity-10">
              <Stethoscope className="w-24 h-24 text-white" />
            </div>
            <div className="absolute left-6 bottom-4">
              <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">
                Sri Kavitha Physiotherapy — Clinical Dashboard
              </p>
            </div>
          </div>

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">

              {/* Photo upload */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-slate-800
                                bg-slate-700 overflow-hidden shadow-xl">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="Dr. Karthik"
                         className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <User className="w-9 h-9 text-slate-500" />
                      <span className="text-[10px] text-slate-500">No photo</span>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <label className="absolute inset-0 rounded-2xl flex flex-col items-center
                                  justify-center bg-black/60 opacity-0 group-hover:opacity-100
                                  cursor-pointer transition-opacity duration-200">
                  {isUploading
                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                    : <>
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-[11px] text-white mt-1 font-medium">Upload</span>
                      </>
                  }
                  <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp"
                         className="hidden" onChange={handlePhotoChange} disabled={isUploading} />
                </label>

                {/* Always-visible camera badge (mobile friendly) */}
                <button type="button" onClick={() => photoRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full
                                   bg-sky-500 flex items-center justify-center
                                   border-2 border-slate-800 shadow-md
                                   hover:bg-sky-400 transition-colors disabled:opacity-50">
                  {isUploading
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Camera className="w-3.5 h-3.5 text-white" />
                  }
                </button>
              </div>

              {/* Name block */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">
                  {profile?.full_name ?? 'Dr. Karthik'}
                </h2>
                <p className="text-sky-400 text-sm font-semibold">
                  {profile?.qualification} · {profile?.specialization}
                </p>
                {profile?.registration_number && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    Reg No: {profile.registration_number}
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Thanjavur, Tamil Nadu
                </p>
              </div>
            </div>

            {/* Personal */}
            <Section title="Personal Information" icon={<User className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon={<User />} error={errors.full_name?.message}
                  {...register('full_name')} disabled={!editing} />
                <Field label="Qualification" icon={<Award />}
                  {...register('qualification')} disabled={!editing} />
                <Field label="Specialization" icon={<Stethoscope />}
                  {...register('specialization')} disabled={!editing} />
                <Field label="Registration No." icon={<Hash />} placeholder="e.g. PT/TN/12345"
                  {...register('registration_number')} disabled={!editing} />
                <Field label="Experience (Years)" icon={<Clock />} type="number"
                  {...register('experience_years')} disabled={!editing} />
                <Field label="Mobile Number" icon={<Phone />}
                  {...register('phone')} disabled={!editing} />
                <Field label="Email" icon={<Mail />} type="email"
                  {...register('email')} disabled={!editing} />
              </div>
            </Section>

            {/* Clinic */}
            <Section title="Clinic Details" icon={<Building2 className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Clinic Name" icon={<Building2 />}
                  {...register('clinic_name')} disabled={!editing} />
                <Field label="Clinic Phone" icon={<Phone />}
                  {...register('clinic_phone')} disabled={!editing} />
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Clinic Address
                  </label>
                  <textarea {...register('clinic_address')} disabled={!editing} rows={3}
                    className="w-full rounded-lg px-3 py-2.5 text-sm bg-slate-700/50
                               border border-slate-600/50 text-slate-200 placeholder-slate-500
                               focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30
                               disabled:opacity-50 disabled:cursor-default resize-none transition-colors" />
                </div>
              </div>
            </Section>

            {/* Bio */}
            <Section title="Professional Bio" icon={<FileText className="w-4 h-4" />}>
              <textarea {...register('about')} disabled={!editing} rows={4}
                placeholder="Brief professional bio, areas of expertise..."
                className="w-full rounded-lg px-3 py-2.5 text-sm bg-slate-700/50
                           border border-slate-600/50 text-slate-200 placeholder-slate-500
                           focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30
                           disabled:opacity-50 disabled:cursor-default resize-none transition-colors" />
            </Section>

            {/* Save */}
            <AnimatePresence>
              {editing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }} className="flex justify-end pt-2">
                  <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600
                               text-white font-semibold rounded-xl transition-colors
                               disabled:opacity-50 shadow-lg shadow-sky-500/20">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>

      {/* Clinic info card (always visible) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-400" /> Clinic Information
        </h3>
        <div className="space-y-3">
          <InfoRow icon={<Building2 className="w-4 h-4 text-sky-400" />} label="Clinic"
            value={profile?.clinic_name ?? 'Sri Kavitha Physiotherapy'} />
          <InfoRow icon={<MapPin className="w-4 h-4 text-rose-400" />} label="Address"
            value={profile?.clinic_address ?? 'Rajaji Street, Plot No. 391 & 392, NK Rd, Thanjavur, TN 613006'} />
          <InfoRow icon={<Phone className="w-4 h-4 text-emerald-400" />} label="Clinic Phone"
            value={profile?.clinic_phone ?? 'Not set'} />
        </div>
      </motion.div>
    </motion.div>
  )
}
