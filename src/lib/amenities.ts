// Curated real-estate amenity catalogue, grouped by category, each mapped to a
// lucide-react icon. Used by the admin amenity picker and the public project
// page so the same icon + label render everywhere.
//
// Amenities are stored on a project as a list of `id` strings (meta.amenityTags).
import type { LucideIcon } from "lucide-react";
import {
  Waves, Dumbbell, Trees, Baby, ShieldCheck, Cctv, Wifi, Car, Zap, Flame,
  Wind, Droplets, Trophy, Gamepad2, Tv, Sofa, Users, PartyPopper, Dog, Bike,
  Footprints, Leaf, Sprout, Lock, KeyRound, DoorOpen, Bell, ArrowUpDown,
  Utensils, Coffee, ShoppingBag, Store, Stethoscope, HeartPulse, GraduationCap,
  Plane, TrainFront, Bus, Landmark, Clapperboard, BookOpen, Recycle, Snowflake,
  Video, Fingerprint, Flower2, TreePine, TentTree, Table2, Accessibility,
  Music, Film, Bath, ShowerHead, Refrigerator, WashingMachine, Fan, Lightbulb,
  Sparkles, Clock, CalendarCheck, SquareParking, CircleDot, Sun, Droplet,
  Building2, Wrench, Mountain,
} from "lucide-react";

export interface Amenity {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface AmenityGroup {
  category: string;
  items: Amenity[];
}

export const AMENITY_GROUPS: AmenityGroup[] = [
  {
    category: "Sports & Fitness",
    items: [
      { id: "swimming_pool", label: "Swimming Pool", icon: Waves },
      { id: "kids_pool", label: "Kids' Pool", icon: Droplets },
      { id: "gymnasium", label: "Gymnasium", icon: Dumbbell },
      { id: "yoga_zone", label: "Yoga / Meditation", icon: Sparkles },
      { id: "jogging_track", label: "Jogging Track", icon: Footprints },
      { id: "cycling_track", label: "Cycling Track", icon: Bike },
      { id: "tennis_court", label: "Tennis Court", icon: Trophy },
      { id: "basketball_court", label: "Basketball Court", icon: CircleDot },
      { id: "badminton_court", label: "Badminton Court", icon: CircleDot },
      { id: "cricket_net", label: "Cricket Net", icon: Trophy },
      { id: "squash_court", label: "Squash Court", icon: Trophy },
      { id: "table_tennis", label: "Table Tennis", icon: Table2 },
      { id: "skating_rink", label: "Skating Rink", icon: CircleDot },
      { id: "spa_sauna", label: "Spa / Sauna", icon: ShowerHead },
    ],
  },
  {
    category: "Community & Leisure",
    items: [
      { id: "clubhouse", label: "Clubhouse", icon: Building2 },
      { id: "banquet_hall", label: "Banquet / Party Hall", icon: PartyPopper },
      { id: "amphitheatre", label: "Amphitheatre", icon: Music },
      { id: "mini_theatre", label: "Mini Theatre", icon: Film },
      { id: "indoor_games", label: "Indoor Games", icon: Gamepad2 },
      { id: "kids_play_area", label: "Kids' Play Area", icon: Baby },
      { id: "senior_citizen", label: "Senior Citizen Zone", icon: Users },
      { id: "cafe_lounge", label: "Café / Lounge", icon: Coffee },
      { id: "guest_rooms", label: "Guest Rooms", icon: Sofa },
      { id: "library", label: "Library / Reading Room", icon: BookOpen },
      { id: "multipurpose_hall", label: "Multipurpose Hall", icon: Clapperboard },
      { id: "pet_zone", label: "Pet Park", icon: Dog },
    ],
  },
  {
    category: "Green & Open Spaces",
    items: [
      { id: "landscaped_gardens", label: "Landscaped Gardens", icon: Trees },
      { id: "central_green", label: "Central Green", icon: Leaf },
      { id: "terrace_garden", label: "Terrace Garden", icon: Flower2 },
      { id: "open_lawn", label: "Open Lawn", icon: Sprout },
      { id: "tree_lined_avenue", label: "Tree-lined Avenue", icon: TreePine },
      { id: "outdoor_seating", label: "Outdoor Seating", icon: TentTree },
      { id: "water_feature", label: "Water Feature / Fountain", icon: Droplet },
      { id: "hilltop_view", label: "Scenic / Hill View", icon: Mountain },
    ],
  },
  {
    category: "Safety & Security",
    items: [
      { id: "gated_community", label: "Gated Community", icon: DoorOpen },
      { id: "cctv", label: "CCTV Surveillance", icon: Cctv },
      { id: "security_24x7", label: "24x7 Security", icon: ShieldCheck },
      { id: "video_door_phone", label: "Video Door Phone", icon: Video },
      { id: "intercom", label: "Intercom", icon: Bell },
      { id: "biometric_access", label: "Biometric Access", icon: Fingerprint },
      { id: "rfid_boom", label: "RFID Boom Barrier", icon: KeyRound },
      { id: "fire_safety", label: "Fire Safety", icon: Flame },
      { id: "smart_locks", label: "Smart Door Locks", icon: Lock },
    ],
  },
  {
    category: "Convenience & Utilities",
    items: [
      { id: "power_backup", label: "Power Backup", icon: Zap },
      { id: "lifts", label: "High-speed Lifts", icon: ArrowUpDown },
      { id: "covered_parking", label: "Covered Parking", icon: SquareParking },
      { id: "visitor_parking", label: "Visitor Parking", icon: Car },
      { id: "ev_charging", label: "EV Charging", icon: Zap },
      { id: "wifi", label: "Wi-Fi / Internet", icon: Wifi },
      { id: "water_supply_24x7", label: "24x7 Water Supply", icon: Droplets },
      { id: "rainwater_harvesting", label: "Rainwater Harvesting", icon: Droplet },
      { id: "sewage_treatment", label: "Sewage Treatment Plant", icon: Recycle },
      { id: "waste_management", label: "Waste Management", icon: Recycle },
      { id: "maintenance_staff", label: "Maintenance Staff", icon: Wrench },
      { id: "wheelchair_access", label: "Wheelchair Access", icon: Accessibility },
    ],
  },
  {
    category: "Lifestyle & Smart",
    items: [
      { id: "smart_home", label: "Smart Home Automation", icon: Lightbulb },
      { id: "air_conditioning", label: "Air Conditioning", icon: Snowflake },
      { id: "central_ac", label: "Central AC", icon: Wind },
      { id: "modular_kitchen", label: "Modular Kitchen", icon: Utensils },
      { id: "piped_gas", label: "Piped Gas", icon: Flame },
      { id: "solar_power", label: "Solar Power", icon: Sun },
      { id: "geyser", label: "Geyser / Hot Water", icon: Bath },
      { id: "ventilation", label: "Cross Ventilation", icon: Fan },
      { id: "concierge", label: "Concierge Service", icon: Bell },
      { id: "home_appliances", label: "Home Appliances", icon: Refrigerator },
      { id: "laundry", label: "Laundry Service", icon: WashingMachine },
    ],
  },
  {
    category: "Nearby & Connectivity",
    items: [
      { id: "near_metro", label: "Near Metro", icon: TrainFront },
      { id: "near_bus", label: "Bus Connectivity", icon: Bus },
      { id: "near_airport", label: "Near Airport", icon: Plane },
      { id: "near_school", label: "Schools Nearby", icon: GraduationCap },
      { id: "near_hospital", label: "Hospitals Nearby", icon: HeartPulse },
      { id: "near_mall", label: "Malls Nearby", icon: ShoppingBag },
      { id: "near_market", label: "Market Nearby", icon: Store },
      { id: "near_clinic", label: "Clinic Nearby", icon: Stethoscope },
      { id: "near_landmark", label: "Landmarks Nearby", icon: Landmark },
      { id: "school_in_campus", label: "School in Campus", icon: GraduationCap },
      { id: "shopping_in_campus", label: "Retail in Campus", icon: ShoppingBag },
      { id: "available_24x7", label: "24x7 Access", icon: Clock },
      { id: "ready_possession", label: "Ready Possession", icon: CalendarCheck },
    ],
  },
];

// Flat lookup by id → amenity (icon + label).
export const AMENITY_BY_ID: Record<string, Amenity> = Object.fromEntries(
  AMENITY_GROUPS.flatMap((g) => g.items).map((a) => [a.id, a]),
);

export function amenitiesFromIds(ids: string[]): Amenity[] {
  return ids.map((id) => AMENITY_BY_ID[id]).filter(Boolean);
}
