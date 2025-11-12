"use client"
import { motion } from "framer-motion"

const PageLoader = ({ onLoadingComplete }: { onLoadingComplete: () => void }) => {
  const columns = 8 // Number of equal-width columns

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 1.5 }}
      onAnimationComplete={onLoadingComplete}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-[#64FFDA]"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
    </motion.div>
  )
}

export default PageLoader
