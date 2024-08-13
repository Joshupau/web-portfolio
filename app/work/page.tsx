import { Spotlight } from "@/components/ui/Spotlight";
import Previousworks from "./_components/Previousworks";


export default function work() {
    return (
        <div className="relative flex items-center justify-center overflow-y-auto p-4 h-screen">
            <div className="flex flex-col gap-6">
                <div className="container mx-auto">
                <div className="max-w-prose">
                    <h1 className="font-bold text-5xl bg-clip-text text-transparent  bg-gradient-to-b from-slate-100 to-slate-500 from-50%">
                     What I've Built
                    </h1>
                    <p className="text-sm items-center md:items-start md:text-lg text-slate-400">
                    This section showcases my diverse portfolio of web applications, 
                    demonstrating a strong command of front-end and back-end 
                    technologies to create engaging and functional digital products.                        
                    </p>
                </div>
                <div className="">
                    <Previousworks/>
                </div>
                </div>
            </div>
            <Spotlight className=" -top-40 -left-10 md:-left-40 md:-top-30 h-[150vh]" fill="white"/> 
        </div>
    )
}