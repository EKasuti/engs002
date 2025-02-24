// Images
import pontDuGard from "../images/buildings/pont_du_gard.png"
import greatPyramidOfGiza from "../images/buildings/pyramid_of_giza.png"
import parthenon from "../images/buildings/parthenon.png"
import stonehenge from "../images/buildings/stonehenge.png"
import pantheon from "../images/buildings/pantheon.png"

import { StaticImageData } from 'next/image';

// Building type
export interface Building {
  id: number
  name: string
  lat: number
  lon: number
  category: string
  image: StaticImageData
  details: string
}


// Builing data
export const buildings = [
  {
    id: 1,
    name: "Pont du Gard",
    lat: 43.9476,
    lon: 4.5350,
    category: "Roman Architecture",
    image: pontDuGard,
    details: "Pont du Gard details",
  },
  {
    id: 2,
    name: "Great Pyramid of Giza",
    lat: 29.9792,
    lon: 31.1342,
    category: "Ancient Egyptian Architecture",
    image: greatPyramidOfGiza,
    details: "Constructed around 2552 BC.",
  },
  {
    id: 3,
    name: "Parthenon",
    lat: 37.9715,
    lon: 23.7267,
    category: "Ancient Greek Architecture",
    image: parthenon, 
    details: "Constructed around 432 BC.",
  },
  {
    id: 4,
    name: "Stonehenge",
    lat: 51.1789,
    lon: -1.8262,
    category: "Prehistoric Monument",
    image: stonehenge,
    details: "Constructed around 2500 BC.",
  },
  {
    id: 5,
    name: "Pantheon",
    lat: 41.8986,
    lon: 12.4769,
    category: "Ancient Roman Architecture",
    image: pantheon,
    details: "Constructed around 126 CE.",
  }
];
