import hotelEvara from "@/assets/hotel-evara-new.jpg";
import hotelDallan from "@/assets/dalaan-resort-new.jpg";
import hotelExotica from "@/assets/hotel-exotica.jpg";

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
  name: string;
  description: string;
  price: string;
  image: string;
  features: string[];
}

export interface HotelHighlight {
  title: string;
  description: string;
  image: string;
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
        name: "Twin Deluxe Room",
        description: "Elegant twin deluxe room designed for comfort and style. Available in 5 rooms.",
        price: "₹2,999",
        image: twinDeluxeRoom,
        features: ["Twin Beds", "AC", "Free Wi-Fi", "Single: ₹2999 / Double: ₹3799"],
      },
      {
        name: "Deluxe Room",
        description: "Our most popular room category with 13 rooms, offering premium comfort and amenities.",
        price: "₹2,999",
        image: deluxeRoom,
        features: ["King Bed", "AC", "Free Wi-Fi", "Single: ₹2999 / Double: ₹3799"],
      },
      {
        name: "Suite Room",
        description: "Luxurious suite rooms for an elevated stay experience. Available in 4 exclusive rooms.",
        price: "₹3,999",
        image: suiteRoom,
        features: ["Premium Suite", "AC", "Free Wi-Fi", "Single: ₹3999 / Double: ₹4499"],
      },
    ],
    amenities: ["CHAUKAA Restaurant", "Open Rooftop Dining", "Mandap Banquet Hall", "Conference Hall", "Free Wi-Fi", "Free Parking", "UPI & Card Payment", "Room Service"],
    gallery: [hotelEvara, twinDeluxeRoom, suiteRoom, deluxeRoom, mandapBanquet, hotelRestaurant],
    highlights: [
      {
        title: "CHAUKAA Restaurant",
        description: "Perfect for family dining, casual meetups & small celebrations. Our multi-cuisine restaurant seats 50 guests in a warm, inviting atmosphere with carefully crafted dishes.",
        image: hotelRestaurant,
      },
      {
        title: "Mandap Banquet Hall",
        description: "Host your dream events — weddings, engagements, birthday parties, and corporate events in our spacious and elegantly designed banquet hall.",
        image: mandapBanquet,
      },
      {
        title: "Open Rooftop Dining",
        description: "Experience dining under the stars at our open rooftop space. Ideal for evening dining, private gatherings, and small celebrations with a stunning ambiance.",
        image: hotelRooftop,
      },
      {
        title: "Comfortable Rooms & Suites",
        description: "Choose from Twin Deluxe, Deluxe, and Suite rooms — each designed for a restful stay with modern amenities. Check-in at 12:00 Noon, Check-out at 11:00 AM.",
        image: suiteRoom,
      },
    ],
  },
  {
    id: "dallan-resort",
    name: "Dalaan Resort",
    tagline: "Nature • Luxury • Peace",
    address: "Shukla Nagar, Sonki Chikni, Darbhanga, Bihar",
    city: "India",
    description:
      "Dalaan Resort offers a premium and peaceful environment designed for luxury stays, weddings, and large-scale social or corporate events. The property blends nature with modern amenities, making it an ideal destination for celebrations and relaxation.",
    heroImage: hotelDallan,
    cardImage: hotelDallan,
    rating: 5,
    rooms: [
      {
        name: "Luxury Room",
        description: "Premium luxury rooms designed with modern comforts and elegant interiors for an unforgettable stay.",
        price: "Contact",
        image: roomDeluxePremium,
        features: ["AC", "Free Wi-Fi", "Room Service", "Premium Amenities"],
      },
      {
        name: "Villa Room",
        description: "Exclusive villa rooms located in the Mithila Lawn area, surrounded by nature and tranquility.",
        price: "Contact",
        image: roomSuite,
        features: ["Private Space", "Lawn View", "AC", "Premium Interiors"],
      },
      {
        name: "Bridal & Groom Suite",
        description: "Specially designed preparation rooms for brides and grooms, ensuring your special day begins perfectly.",
        price: "Contact",
        image: roomDeluxe,
        features: ["Preparation Room", "Private Space", "Premium Décor", "AC"],
      },
    ],
    amenities: ["Multi-Cuisine Restaurant", "Coffee Shop", "Swimming Pool", "Spa & Salon", "Banquet Halls", "Open Lawns (4 Spaces)", "Club House", "Rain Dance Area", "Kids Zone", "Table Tennis / Snooker", "Car Parking", "Free Wi-Fi"],
    gallery: [hotelDallan, roomSuite, hotelDining, hotelSpa, hotelRooftop, hotelRestaurant],
    highlights: [
      {
        title: "Multi-Cuisine Restaurant",
        description: "Savor a wide variety of cuisines at our in-house restaurant. From traditional dishes to contemporary flavors, every meal is a delightful experience.",
        image: hotelRestaurant,
      },
      {
        title: "Banquet Halls & Open Lawns",
        description: "Host destination weddings, corporate events, family functions, and grand celebrations across our elegant banquet halls and 4 beautiful open lawn spaces with fountain areas.",
        image: hotelBanquet,
      },
      {
        title: "Club House & Leisure",
        description: "Enjoy our swimming pool, rain dance area, spa & salon, kids zone, and indoor games including table tennis and snooker — perfect for relaxation and fun.",
        image: hotelRooftop,
      },
      {
        title: "Luxury Stays & Villas",
        description: "Experience premium comfort in our luxury rooms and exclusive villa rooms nestled in the Mithila Lawn area. Each room blends nature with modern elegance for an extraordinary stay.",
        image: roomDeluxePremium,
      },
    ],
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
