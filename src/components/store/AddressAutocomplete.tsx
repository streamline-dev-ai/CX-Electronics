import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

// Minimal subset of the google.maps.places.Autocomplete API we touch.
// Declared locally so we don't need @types/google.maps.
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: {
              componentRestrictions?: { country: string | string[] }
              fields?: string[]
              types?: string[]
            },
          ) => {
            addListener: (event: string, handler: () => void) => void
            getPlace: () => {
              address_components?: Array<{
                long_name: string
                short_name: string
                types: string[]
              }>
              formatted_address?: string
            }
          }
        }
      }
    }
    __cwGoogleMapsLoading?: Promise<void>
  }
}

export interface ParsedAddress {
  address_line1: string
  city: string
  province: string
  postal_code: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (parsed: ParsedAddress) => void
  className?: string
  placeholder?: string
  required?: boolean
}

const GOOGLE_API_KEY =
  (import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined) ||
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.maps?.places) return Promise.resolve()
  if (window.__cwGoogleMapsLoading) return window.__cwGoogleMapsLoading
  if (!GOOGLE_API_KEY) return Promise.reject(new Error('No Google Places API key'))

  window.__cwGoogleMapsLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&loading=async&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
  return window.__cwGoogleMapsLoading
}

// Map Google's componentized address into our flat shape.
function parseComponents(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
): ParsedAddress {
  const get = (type: string, short = false) => {
    const c = components.find((c) => c.types.includes(type))
    if (!c) return ''
    return short ? c.short_name : c.long_name
  }

  const streetNumber = get('street_number')
  const route = get('route')
  const line1 = [streetNumber, route].filter(Boolean).join(' ').trim()
  const city =
    get('locality') ||
    get('postal_town') ||
    get('sublocality_level_1') ||
    get('sublocality') ||
    get('administrative_area_level_2')
  const province = get('administrative_area_level_1') || ''
  const postal = get('postal_code') || ''

  return {
    address_line1: line1,
    city,
    province,
    postal_code: postal,
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  className,
  placeholder = 'Start typing your address...',
  required = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    GOOGLE_API_KEY ? 'loading' : 'error',
  )

  useEffect(() => {
    if (!GOOGLE_API_KEY) return
    let cancelled = false

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'za' },
          fields: ['address_components', 'formatted_address'],
          types: ['address'],
        })
        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          if (!place.address_components) return
          const parsed = parseComponents(place.address_components)
          onSelect(parsed)
          if (parsed.address_line1) onChange(parsed.address_line1)
        })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="street-address"
        className={(className ?? '') + ' pl-9'}
      />
      {status === 'loading' && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 animate-spin" />
      )}
    </div>
  )
}
