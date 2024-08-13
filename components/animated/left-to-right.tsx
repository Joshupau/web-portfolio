"use client"

import { motion } from "framer-motion"
import React from "react"

export default function LeftToRight({
    children
}: Readonly<{children: React.ReactNode}>){
    return (
        <motion.div
         initial={{ x: -100, opacity: 0}}
         animate={{ x: 0, opacity: 1}}
         transition={{ ease: "easeInOut", duration: 1}}
        >
            {children}
        </motion.div>
    )
}