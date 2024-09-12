'use client'

import LeftToRight from "@/components/animated/left-to-right";
import MyImage from "@/components/my-image";
import { Spotlight } from "@/components/ui/Spotlight";

import { TypeAnimation } from 'react-type-animation';
import MagicButton from "@/components/ui/MagicButton";
import { IoMdDownload } from "react-icons/io";
import HeroBanner from "@/components/hero";
import Work from "@/components/work";
import About from "@/components/about";
import Contact from "@/components/contact";


export default function Home() {

  return (
    <div className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
          <HeroBanner/>
          <About/>
          <Work/>
          <Contact/>
      </div>
    </div>
  );
}
