'use client'

import { Spotlight } from "@/components/ui/Spotlight";
import Previousworks from "./_components/Previousworks";
import BottomToTop from "@/components/animated/bottom-to-top";
import TopToBottom from "@/components/animated/top-to-bottom";

export default function Work() {
  return (
    <div className="relative flex items-center justify-center overflow-y-auto p-4 h-screen">
      <div className="grid lg:gap-4 mx-auto container xl:grid-cols-2">
        {/* Content Section */}
        <div className="space-y-1 flex flex-col justify-start lg:justify-center text-center lg:text-left"> {/* Center text on mobile, align left on larger screens */}
        <TopToBottom>
          <h1 className="font-bold text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-slate-100 to-slate-500">
            What I've Built
          </h1>
          <p className="text-sm md:text-lg text-slate-400">
            This section showcases my diverse portfolio of web applications,
            demonstrating a strong command of front-end and back-end
            technologies to create engaging and functional digital products.
          </p>
        </TopToBottom>
        </div>
        {/* Previous Works Section */}
        <BottomToTop>
        <div className="lg:mt-0"> {/* Add margin on top for mobile, remove on larger screens */}
          <Previousworks />
        </div>
        </BottomToTop>
      </div>
      <Spotlight className="-top-40 -left-10 md:-left-40 md:-top-30 h-[150vh]" fill="white" />
    </div>
  );
}
