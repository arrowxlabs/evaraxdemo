import hotelEvaraAsset from "@/assets/hotel-evara-hero.png.asset.json";
const hotelEvara = hotelEvaraAsset.url;
import hotelDallan from "@/assets/dalaan-resort-new.jpg";
import hotelExotica from "@/assets/hotel-exotica.jpg";
import galleryVideoAsset from "@/assets/gallery-hotel-loop.mp4.asset.json";
export const galleryLoopVideo = galleryVideoAsset.url;

import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import hotelSpa from "@/assets/hotel-spa.jpg";
import hotelDining from "@/assets/hotel-dining.jpg";
import hotelRestaurant from "@/assets/hotel-restaurant.jpg";
import hotelBanquet from "@/assets/hotel-banquet.jpg";
import hotelRooftop from "@/assets/hotel-rooftop.jpg";
import roomDeluxePremium from "@/assets/room-deluxe-premium.jpg";
import twinDeluxeRoom from "@/assets/twin-deluxe-room.jpg";
import suiteRoom from "@/assets/suite-room.jpg";
import deluxeRoom from "@/assets/deluxe-room.jpg";
import mandapBanquet from "@/assets/mandap-banquet.jpg";

export interface HotelRoom {
  key: string;
  name: string;
  description: string;
  price: string;
  singlePrice?: string;
  doublePrice?: string;
  image: string;
  features: string[];
  amenities?: string[];
  gallery?: string[];
}

export interface HotelHighlight {
  key: string;
  title: string;
  description: string;
  image: string;
  gallery?: string[];
}

export interface HotelData {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  description: string;
  heroImage: string;
  cardImage: string;
  rating: number;
  rooms: HotelRoom[];
  amenities: string[];
  gallery: string[];
  highlights: HotelHighlight[];
}

const defaultRoomAmenities = [
  "King-Size Bed",
  "Air Conditioning",
  "Complimentary Wi-Fi",
  "Smart LED TV",
  "Tea & Coffee Maker",
  "24/7 Room Service",
  "Premium Linens",
  "Daily Housekeeping",
];

export const hotels: HotelData[] = [
  {
    id: "evara",
    name: "Hotel Evara",
    tagline: "Stay • Dine • Celebrate",
    address: "Shastri Chowk, Digghi North, Bhathiarisarai, Darbhanga, Bihar – 846004",
    city: "India",
    description:
      "Hotel Evara offers a complete hospitality experience with comfortable rooms, a well-designed restaurant, rooftop dining, and event-ready banquet spaces. Established in October 2024, we combine modern elegance with warm hospitality.",
    heroImage: hotelEvara,
    cardImage: hotelEvara,
    rating: 5,
    rooms: [
      {
        key: "premium",
        name: "Premium Room",
        description:
          "Our signature accommodation — spacious interiors, hand-finished textiles, and curated artwork. A serene retreat with city views and bespoke turn-down service.",
        price: "₹4,499",
        singlePrice: "₹4,499",
        doublePrice: "₹4,999",
        image: roomDeluxePremium,
        features: ["King Bed", "City View", "Mini Bar", "Bathtub"],
        amenities: defaultRoomAmenities.concat(["Marble Bathroom", "Bathtub", "Mini Bar", "City View"]),
        gallery: [roomDeluxePremium, suiteRoom, deluxeRoom],
      },
      {
        key: "deluxe",
        name: "Deluxe Room",
        description:
          "Our most popular category — refined comfort with all modern essentials. Thirteen rooms thoughtfully composed for an unhurried stay.",
        price: "₹2,999",
        singlePrice: "₹2,999",
        doublePrice: "₹3,799",
        image: deluxeRoom,
        features: ["King Bed", "AC", "Free Wi-Fi", "Smart TV"],
        amenities: defaultRoomAmenities,
        gallery: [deluxeRoom, roomDeluxePremium, twinDeluxeRoom],
      },
      {
        key: "executive",
        name: "Executive Room",
        description:
          "Designed for the business traveller — a dedicated workspace, ergonomic seating, and quiet ambient lighting paired with our signature comfort.",
        price: "₹3,499",
        singlePrice: "₹3,499",
        doublePrice: "₹3,999",
        image: roomDeluxePremium,
        features: ["Work Desk", "King Bed", "Premium Wi-Fi", "Coffee Station"],
        amenities: defaultRoomAmenities.concat(["Executive Work Desk", "Premium Wi-Fi", "Express Laundry"]),
        gallery: [roomDeluxePremium, deluxeRoom, suiteRoom],
      },
      {
        key: "twin-deluxe",
        name: "Twin Deluxe Room",
        description:
          "Elegantly composed twin-bedded room — ideal for friends, family, or colleagues travelling together. Five rooms available.",
        price: "₹2,999",
        singlePrice: "₹2,999",
        doublePrice: "₹3,799",
        image: twinDeluxeRoom,
        features: ["Twin Beds", "AC", "Free Wi-Fi", "Smart TV"],
        amenities: defaultRoomAmenities,
        gallery: [twinDeluxeRoom, deluxeRoom, roomDeluxe],
      },
      {
        key: "suite",
        name: "Suite Room",
        description:
          "Our most luxurious accommodation — a generous suite with a separate sitting area, premium fixtures, and unrivalled comfort. Four exclusive rooms.",
        price: "₹3,999",
        singlePrice: "₹3,999",
        doublePrice: "₹4,499",
        image: suiteRoom,
        features: ["Suite Lounge", "King Bed", "Mini Bar", "Premium Bath"],
        amenities: defaultRoomAmenities.concat(["Separate Sitting Area", "Mini Bar", "Bathtub", "Premium Bath Amenities"]),
        gallery: [suiteRoom, roomDeluxePremium, mandapBanquet],
      },
    ],
    amenities: [
      "CHAUKAA Restaurant",
      "Mandap Banquet Hall",
      "Conference Hall",
      "Free Wi-Fi",
      "Free Parking",
      "UPI & Card Payment",
      "Room Service",
      "Concierge",
    ],
    gallery: [hotelEvara, twinDeluxeRoom, suiteRoom, deluxeRoom, mandapBanquet, hotelRestaurant],
    highlights: [
      {
        key: "chaukaa-restaurant",
        title: "CHAUKAA Restaurant",
        description:
          "Perfect for family dining, casual meetups & small celebrations. Our multi-cuisine restaurant seats 50 guests in a warm, inviting atmosphere with carefully crafted dishes.",
        image: hotelRestaurant,
        gallery: [hotelRestaurant, hotelDining, hotelEvara, mandapBanquet],
      },
      {
        key: "mandap-banquet-hall",
        title: "Mandap Banquet Hall",
        description:
          "Host your dream events — weddings, engagements, birthday parties, and corporate events in our spacious and elegantly designed banquet hall.",
        image: mandapBanquet,
        gallery: [mandapBanquet, hotelBanquet, hotelRestaurant, hotelEvara],
      },
      {
        key: "rooms-suites",
        title: "Comfortable Rooms & Suites",
        description:
          "Choose from Premium, Deluxe, Executive, Twin Deluxe, and Suite rooms — each designed for a restful stay with modern amenities. Check-in at 12:00 Noon, Check-out at 11:00 AM.",
        image: suiteRoom,
        gallery: [suiteRoom, deluxeRoom, twinDeluxeRoom, roomDeluxePremium],
      },
    ],
  },
  {
    id: "dallan-resort",
    name: "Dalaan Resort",
    tagline: "Nature • Luxury • Peace",
    address: "Shukla Nagar, Sonki Chikni, Darbhanga, Bihar",
    city: "India",
    description: "Opening Soon",
    heroImage: hotelDallan,
    cardImage: hotelDallan,
    rating: 5,
    rooms: [],
    amenities: [],
    gallery: [],
    highlights: [],
  },
  {
    id: "evara-exotica",
    name: "Evara Exotica",
    tagline: "Opening Soon",
    address: "Coming Soon",
    city: "India",
    description: "Opening Soon",
    heroImage: hotelExotica,
    cardImage: hotelExotica,
    rating: 5,
    rooms: [],
    amenities: [],
    gallery: [],
    highlights: [],
  },
];
