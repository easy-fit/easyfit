'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface GenderSection {
  id: string;
  label: string;
  category: string;
  image: string;
  hoverImage?: string;
}

const GENDER_SECTIONS: GenderSection[] = [
  {
    id: 'men',
    label: 'HOMBRE',
    category: 'hombre',
    image: '/men.jpeg',
  },
  {
    id: 'women',
    label: 'MUJER',
    category: 'mujer',
    image: '/woman.jpeg',
  },
  {
    id: 'kids',
    label: 'NIÑOS',
    category: 'ninos',
    image: '/kids.jpeg',
  },
];

export function GenderHeroSelection() {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full flex-col md:flex-row bg-gray-900">
      {GENDER_SECTIONS.map((section, index) => (
        <Link
          key={section.id}
          href={`/?gender=${section.category}&view=products`}
          className="group relative flex-1 overflow-hidden"
          onMouseEnter={() => setHoveredSection(section.id)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-[#2F4858]">
            <motion.div
              className="h-full w-full bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${section.image})`,
                backgroundSize: 'cover',
                // Position kids image lower to hide the light sky, center others
                backgroundPosition: section.id === 'kids' ? 'center 60%' : 'center',
              }}
              animate={{
                scale: hoveredSection === section.id ? 1.1 : 1,
              }}
              transition={{
                duration: 0.6,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
            />
          </div>

          {/* Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"
            animate={{
              opacity: hoveredSection === section.id ? 0.5 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center">
            <motion.div
              animate={{
                y: hoveredSection === section.id ? -10 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="mb-2 md:mb-4 text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider text-white">
                {section.label}
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: hoveredSection === section.id ? 1 : 0,
                  y: hoveredSection === section.id ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 border-b-2 border-white pb-1 text-sm md:text-lg font-medium text-white">
                  <span className="hidden md:inline">EXPLORAR COLECCIÓN</span>
                  <span className="md:hidden">VER MÁS</span>
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Animated Border on Hover */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white"
            initial={{ width: '0%' }}
            animate={{
              width: hoveredSection === section.id ? '100%' : '0%',
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Divider Line (not on last item) */}
          {index < GENDER_SECTIONS.length - 1 && (
            <div className="absolute bottom-0 right-0 top-0 hidden w-px bg-white/20 md:block" />
          )}
        </Link>
      ))}
    </div>
  );
}
