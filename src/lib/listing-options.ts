// Shared option arrays for the property-listing wizard. Kept in one place so the
// form inputs and the read-only detail views stay in sync.

export const FACING = [
  "East", "West", "North", "South",
  "North East", "North West", "South East", "South West",
];

export const FURNISHING = ["Furnished", "Semi-Furnished", "Unfurnished"];

export const CONSTRUCTION_TYPE = ["Red Brick", "Ash Brick", "Mivan"];

export const FLOORING = [
  "Vitrified", "Italian Marble", "Wooden Flooring",
  "Laminated Wooden Flooring", "Ceramic Tiles",
];

export const KITCHEN = ["Semi-Modular", "Premium"];

export const BATHROOM = ["Standard", "Premium", "Ultra Premium"];

export const VAASTU = ["Fully", "Partially", "Non", "Vaastu Certified", "NA"];

export const PARKING = ["Open", "Covered"];

export const DOOR_MAIN = [
  "Hard Wood Door", "Engineered Wooden Door", "Veneer Finished", "Teak Wood Door",
];

export const DOOR_INTERNAL = ["Flush Door", "Laminated Flush Door", "Engineered Door"];

export const WINDOW_MATERIAL = [
  "UPVC", "Aluminium", "Powder Coated Aluminium", "Double Glazed Aluminium",
];

// Open-area-percentage buckets.
export const OAP_PERCENT = [
  "Up to 10%", "10–25%", "25–50%", "50–75%", "75–100%",
];

export const YES_NO = ["Yes", "No"];

export const PRICE_MODE = [
  { value: "expected", label: "Expected price" },
  { value: "persqft", label: "Price per sq.ft." },
];

// Helper: build {value,label} option lists for the <Select> helper.
export const opt = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));
