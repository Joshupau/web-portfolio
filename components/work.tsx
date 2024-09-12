'use client'


import Previousworks from "./Previousworks";
import BottomToTop from "@/components/animated/bottom-to-top";
import TopToBottom from "@/components/animated/top-to-bottom";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
export default function Work() {
  const { ref } = useSectionInView("Work");

  return (
    <section 
    ref={ref}
    id="work"
    >
    <div className="w-full py-20 relative flex items-center justify-center">
      <div className="grid lg:gap-6 mx-auto container xl:grid-cols-2">
        <motion.div 
        className="space-y-1 flex flex-col justify-start lg:justify-center text-center lg:text-left"
        initial={{ x: -100, opacity: 0}}
        whileInView={{ x: 0, opacity: 1}}
        transition={{ ease: "easeInOut", duration: 1}}
        viewport={{
          once: true,
        }}
        > 
          <h1 className="font-bold text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-slate-100 to-slate-500">
            What I&apos;ve Built
          </h1>
          <p className="text-sm md:text-lg text-slate-400">
            This section showcases my diverse portfolio of web applications,
            demonstrating a strong command of front-end and back-end
            technologies to create engaging and functional digital products.
          </p>
        </motion.div>
        <div className="lg:mt-0"> 
          <Previousworks />
        </div>
      </div>
    </div>
    </section>
  );
}