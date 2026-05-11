import {
  Plug, Shield, Wifi, Watch, Sun, Smartphone, Package, Lightbulb,
  Camera, Headphones, Battery, Cable, Cpu, Speaker, Tv, Zap,
  type LucideIcon,
} from 'lucide-react'

// Map category slug → icon. Falls back to Package for unmapped slugs.
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  chargers: Plug,
  cables: Cable,
  cctv: Shield,
  security: Shield,
  routers: Wifi,
  networking: Wifi,
  smartwatches: Watch,
  watches: Watch,
  solar: Sun,
  lighting: Lightbulb,
  accessories: Smartphone,
  phones: Smartphone,
  cameras: Camera,
  audio: Headphones,
  headphones: Headphones,
  speakers: Speaker,
  batteries: Battery,
  'power-banks': Battery,
  computing: Cpu,
  tvs: Tv,
  electronics: Zap,
}

export function getCategoryIcon(slug: string): LucideIcon {
  return ICON_BY_SLUG[slug] ?? Package
}
