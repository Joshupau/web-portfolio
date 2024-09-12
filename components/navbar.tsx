'use client'

import React from 'react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { links } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useActiveSectionContext } from '@/context/active-section-context';
import { motion } from 'framer-motion';


function Navbar() {
  const { activeSection, setActiveSection} = useActiveSectionContext();
  console.log(activeSection);
 
  return (
    <>
      <div className="fixed ml-8 left-0 top-1/2 transform -translate-y-1/2 flex-col gap-6 p-2 bg-gray-800 bg-opacity-75 rounded-full shadow-lg z-50 hidden lg:flex">
        <nav className="flex flex-col items-center">
          {links.map((link, index) => (
            <Link 
            href={link.path} 
            key={index} 
            onClick={() => setActiveSection(link.name)}
            className="p-4 py-8 flex relative items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className={cn(' w-6 h-6', {
                        'text-yellow-500': activeSection === link.name, 
                        'text-white': activeSection !== link.name,
                      })}
                    >
                      {link.icon}
                    </span>                  
                  </TooltipTrigger>
                  <TooltipContent>
                    {link.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {link.name === activeSection && (
                <motion.span
                  className="bg-gray-900 rounded-full absolute w-full h-full inset-0 -z-10"
                  layoutId="activeSection"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Navbar;
