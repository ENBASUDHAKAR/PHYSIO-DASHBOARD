import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export interface DoctorProfile {
  id: string
  user_id: string
  full_name: string
  qualification: string
  specialization: string
  registration_number?: string
  phone?: string
  email?: string
  clinic_name?: string
  clinic_address?: string
  clinic_phone?: string
  experience_years?: number
  about?: string
  photo_url?: string
  photo_storage_path?: string
}

export function useDoctorProfile() {
  return useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async (): Promise<DoctorProfile> => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('doctor_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        const { data: created, error: ce } = await supabase
          .from('doctor_profile')
          .insert({
            user_id: user.id,
            email: user.email,
            clinic_address: 'Rajaji Street, Plot No. 391 & 392, NK Rd, Kalyanasundaram Nagar, Annai Sathya Nagar, Thanjavur, Tamil Nadu 613006',
          })
          .select()
          .single()
        if (ce) throw ce
        return created
      }
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateDoctorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<DoctorProfile>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('doctor_profile')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-profile'] })
      toast.success('Profile saved successfully ✓')
    },
    onError: (e: any) => toast.error(`Save failed: ${e.message}`),
  })
}

export function useUploadDoctorPhoto() {
  const qc = useQueryClient()
  const { mutateAsync: updateProfile } = useUpdateDoctorProfile()

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop()
      const path = `photos/${user.id}/profile.${ext}`

      const { error: upErr } = await supabase.storage
        .from('doctor-assets')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { data: signed, error: signErr } = await supabase.storage
        .from('doctor-assets')
        .createSignedUrl(path, 60 * 60 * 24 * 365)
      if (signErr) throw signErr

      await updateProfile({
        photo_url: signed.signedUrl,
        photo_storage_path: path,
      })
    },
    onSuccess: () => toast.success('Photo updated! 📸'),
    onError: (e: any) => toast.error(`Photo upload failed: ${e.message}`),
  })
}
