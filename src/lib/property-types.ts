// Single source of truth for the two top-level property types and their
// sub-types. Used by the admin Project Wizard and the public "List Property"
// form so they always stay in sync (mirrors the design in the brief).

export type PropertyType = "Residential" | "Commercial";

export const PROPERTY_TYPES: PropertyType[] = ["Residential", "Commercial"];

export const SUBTYPES: Record<PropertyType, string[]> = {
  Residential: [
    "Apartment",
    "Builder Floor",
    "Independent House / Villa",
    "1 RK / Studio",
    "Farm House",
    "Residential Plot",
  ],
  Commercial: [
    "Ready to Move Offices",
    "Bare Shell Office Space",
    "Commercial / Institutional Land",
    "Shop / Retail",
    "Agricultural & Farm Land",
    "Industrial Plots",
    "Warehouse",
    "Cold Storage",
  ],
};

export function subtypesFor(type: string): string[] {
  return SUBTYPES[(type as PropertyType)] ?? SUBTYPES.Residential;
}
