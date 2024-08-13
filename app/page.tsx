'use client'

import LeftToRight from "@/components/animated/left-to-right";
import MyImage from "@/components/my-image";
import { Spotlight } from "@/components/ui/Spotlight";

import { TypeAnimation } from 'react-type-animation';


export default function Home() {
  return (
    <div className="relative mx-auto px-5 sm:px-10 h-screen overflow-hidden">
      {/* Grid Container */}
      <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Side (Content) */}
        <div className="md:ml-[8rem] flex flex-col justify-center items-center text-left text-white max-w-full">
          <div className="w-full max-w-prose">
          <h1 className="font-bold">
            <span className="text-4xl mb-2 block">
              Hello, I'm <br/>
            </span>
            <span className="text-6xl mb-4 block">
              Joshua  <span className="bg-clip-text text-transparent bg-yellow-200">
              De Guzman <br/>
            </span>
            </span>

            <span className="text-4xl block">
              <TypeAnimation
                sequence={[
                  'A Web Developer',
                  2000,
                  'A Back-end Developer',
                  2000
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </span>
          </h1>

            <LeftToRight>
              <div>
                <button className="px-6 mt-4 py-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                  <span>
                    Download CV
                  </span>
                </button>
              </div>
            </LeftToRight>
          </div>
        </div>

        {/* Right Side (Image) */}
        <div className="hidden xl:flex flex-col justify-end items-center">
          <MyImage />
        </div>
      </div>
      <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white"/>
          <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="purple"/>
          <Spotlight className="top-28 rotate-45 left-80 h-[80vh] w-[100vw]" fill="blue"/>
    </div>
  );
}
