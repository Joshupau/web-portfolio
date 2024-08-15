'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUser, FaBriefcase, FaEnvelope } from 'react-icons/fa';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const links = [
  {
    name: "Home",
    path: "/",
    icon: <FaHome size={22} />
  },
  {
    name: "About",
    path: "/about",
    icon: <FaUser size={20} />
  },
  {
    name: "Work",
    path: "/work",
    icon: <FaBriefcase size={20} />
  },
  {
    name: "Contact",
    path: "/contact",
    icon: <FaEnvelope size={20} />
  },
];

function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Navbar for Small Devices */}
      <div className="fixed bottom-0 left-1/2 z-200 transform -translate-x-1/2 flex justify-center w-full bg-gray-800 bg-opacity-75 xl:hidden">
        <nav className="flex flex-row justify-between items-center w-full">
          {links.map((link, index) => (
            <Link href={link.path} key={index} className={`p-4 ${link.path === pathname ? "text-yellow-300" : "text-white"} hover:text-lightyellow transition-colors duration-300`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {link.icon}
                  </TooltipTrigger>
                  <TooltipContent>
                    {link.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          ))}
        </nav>
      </div>

      {/* Navbar for Medium and Larger Devices */}
      <div className="fixed ml-8 left-0 top-1/2 transform -translate-y-1/2 flex-col gap-6 p-2 bg-gray-800 bg-opacity-75 rounded-full shadow-lg z-50 hidden xl:flex">
        <nav className="flex flex-col items-center">
          {links.map((link, index) => (
            <Link href={link.path} key={index} className={`p-4 ${link.path === pathname ? "text-yellow-300" : "text-white"} py-8 hover:text-lightyellow transition-colors duration-300`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {link.icon}
                  </TooltipTrigger>
                  <TooltipContent>
                    {link.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Navbar;
