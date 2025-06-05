import { Venue } from "@/types";

// Common districts in India
export const popularDistricts = [
  "Coimbatore",
  "Pune",
  "Jaipur",
  "Udaipur",
  "Shimla",
  "Manali",
  "Dehradun",
  "Mysore",
  "Ooty",
  "Darjeeling",
  "Goa",
  "Agra",
  "Varanasi",
  "Rishikesh",
  "Amritsar",
];

// Common venue types in rural areas
export const ruralVenueTypes = [
  "Farm House",
  "Resort",
  "Heritage Property",
  "Garden",
  "Riverside Venue",
  "Mountainside Retreat",
  "Village Homestay",
  "Plantation Estate",
  "Lakeside Venue",
  "Temple Grounds",
];

// Format price to Indian Rupees
export const formatIndianPrice = (price: number): string => {
  return `₹${price.toLocaleString("en-IN")}`;
};

// Get venue by capacity range
export const filterVenuesByCapacity = (
  venues: Venue[],
  minCapacity: number = 0,
  maxCapacity: number = Infinity,
): Venue[] => {
  return venues.filter(
    (venue) =>
      venue.capacity.max >= minCapacity && venue.capacity.max <= maxCapacity,
  );
};

// Get a descriptive text for venue capacity
export const getCapacityDescription = (min: number, max: number): string => {
  if (min === max) {
    return `${max} guests`;
  }

  return `${min}-${max} guests`;
};

// Calculate distance between venue and wedding date
export const getDaysUntilWedding = (weddingDate: string): number => {
  const today = new Date();
  const wedding = new Date(weddingDate);
  const timeInMillis = wedding.getTime() - today.getTime();
  return Math.ceil(timeInMillis / (1000 * 60 * 60 * 24));
};

// Generate a festive description for the venue
export const generateFestiveDescription = (venue: Venue): string => {
  const adjectives = [
    "picturesque",
    "serene",
    "enchanting",
    "beautiful",
    "rustic",
    "traditional",
    "charming",
    "elegant",
    "magnificent",
    "breathtaking",
  ];

  const settings = [
    "countryside",
    "rural setting",
    "natural surroundings",
    "verdant landscape",
    "idyllic location",
    "pastoral setting",
    "tranquil environment",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const setting = settings[Math.floor(Math.random() * settings.length)];

  return `This ${adj} venue is nestled in a ${setting} and can comfortably accommodate up to ${venue.capacity.max} guests. Perfect for creating memories that will last a lifetime.`;
};
