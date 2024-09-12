'use client'

import LeftToRight from "@/components/animated/left-to-right";
import MyImage from "@/components/my-image";
import { Spotlight } from "@/components/ui/Spotlight";

import { TypeAnimation } from 'react-type-animation';
import MagicButton from "@/components/ui/MagicButton";
import { IoMdDownload } from "react-icons/io";
import { useSectionInView } from "@/lib/hooks";

function HeroBanner() {
  const { ref } = useSectionInView("Home");
  return (
    <div
    ref={ref} 
    className="pb-20 pt-36">
    <div className="h-full grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center text-left text-white max-w-full">
        <div className="w-full max-w-prose">
        <h1 className="font-bold">
          <span className="text-4xl mb-2 block">
            Hello, I&apos;m <br/>
          </span>
          <span className="text-6xl mb-4 block">
            Joshua  <span className="bg-clip-text text-transparent bg-yellow-200">
            De Guzman <br/>
          </span>
          </span>

          <span className="text-4xl block">
            <TypeAnimation
              sequence={[
                'A Full-Stack Developer',
                2000,
                'A UI/UX Designer',
                2000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </span>
        </h1>

          <LeftToRight>
            <div className="flex items-center gap-2">
              <a href="/resume.pdf" download="cv">
              <MagicButton 
               title="Download CV"
               icon={<IoMdDownload className="w-5 h-5"/>}
               position='right'
              />
              </a>
            </div>
          </LeftToRight>
        </div>
      </div>

      {/* Right Side (Image) */}
      <div className="hidden lg:flex flex-col justify-end items-center">
        <MyImage />
      </div>
    </div>
    <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white"/>
        <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="purple"/>
        <Spotlight className="top-28 rotate-45 left-80 h-[80vh] w-[100vw]" fill="blue"/>
  </div>
  )
}

export default HeroBanner