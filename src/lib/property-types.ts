// Single source of truth for the two top-level property types and their
// sub-types. Used by the admin Project Wizard and the public "List Property"
// form so they always stay in sync (mirrors the design in the brief).

export type PropertyType = "Residential" | "Commercial";

export const PROPERTY_TYPES: PropertyType[] = ["Residential", "Commercial"];

export const SUBTYPES: Record<PropertyType, string[]> = {
  Residential: [
    "Flat / Apartment",
    "Independent House / Villa",
    "Independent / Builder Floor",
    "Plot / Land",
    "1 RK / Studio Apartment",
    "Serviced Apartment",
    "Farmhouse",
    "Other",
  ],
  Commercial: [
    "Office",
    "Retail",
    "Plot / Land",
    "Storage",
    "Industry",
    "Hospitality",
    "Other",
  ],
};

export function subtypesFor(type: string): string[] {
  return SUBTYPES[(type as PropertyType)] ?? SUBTYPES.Residential;
}
