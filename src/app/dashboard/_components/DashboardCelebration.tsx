"use client";

import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion, AnimatePresence } from "framer-motion";
import { Book, CheckCircle2, GraduationCap, Users } from "lucide-react";

export default function DashboardCelebration() {
  const { width, height } = useWindowSize();

  return (
    <AnimatePresence>
      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.15}
        colors={["#FF5733", "#33FF57", "#5733FF", "#FFFF33"]}
        tweenDuration={5000}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative p-8 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-950/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/20 shadow-2xl" />
          <div className="relative space-y-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                Welcome to Athenium!
              </h2>
              <p className="text-lg text-muted-foreground">
                Your learning journey begins here
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="w-24 h-24 relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10"
                />
                <motion.div
                  animate={{ scale: [1.1, 1.3, 1.1], rotate: [180, 540] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center space-x-8"
            >
              {[
                { icon: Book, label: "Learn" },
                { icon: Users, label: "Connect" },
                { icon: CheckCircle2, label: "Achieve" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
