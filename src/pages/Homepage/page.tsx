import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  FileText,
  Users,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
    },
  },
};

export default function Homepage() {
  return (
    <div className="bg-[#f5f3ff] min-h-screen">
      {/* Welcome Banner */}
      <section className="min-h-screen flex flex-col justify-center items-center py-0 px-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl w-full h-full mx-auto flex-1 flex flex-col justify-center"
        >
          <div className="flex flex-col-reverse md:flex-row items-center bg-white rounded-2xl shadow-lg p-4 md:p-12 gap-8 md:gap-12 min-h-screen md:min-h-[500px] w-full h-full justify-center">
            <motion.div
              variants={itemVariants}
              className="flex-1 min-w-[200px] w-full flex flex-col justify-center items-center md:items-start"
            >
              <motion.h1
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-3xl md:text-5xl font-extrabold mb-4 text-center md:text-left"
              >
                Welcome
              </motion.h1>
              <motion.p
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="text-lg md:text-2xl mb-8 text-center md:text-left"
              >
                A central forum for 100-level university students
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-8 md:mb-10 w-full justify-center md:justify-start">
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="flex-1 bg-violet-50 rounded-xl p-4 md:p-6 flex flex-col items-center shadow min-w-[140px] w-full"
                >
                  <GraduationCapIcon className="w-10 h-10 md:w-12 md:h-12" />
                  <h3 className="font-semibold mt-3 text-base md:text-lg">
                    Orientation
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Get Started on guides
                  </p>
                </motion.div>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="flex-1 bg-violet-50 rounded-xl p-4 md:p-6 flex flex-col items-center shadow min-w-[140px] w-full"
                >
                  <FileText className="w-10 h-10 md:w-12 md:h-12 text-violet-600" />
                  <h3 className="font-semibold mt-3 text-base md:text-lg">
                    Resources
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Study materials; and printable PDFs
                  </p>
                </motion.div>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="flex-1 bg-violet-50 rounded-xl p-4 md:p-6 flex flex-col items-center shadow border-2 border-violet-400 min-w-[140px] w-full"
                >
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-violet-600" />
                  <h3 className="font-semibold mt-3 text-base md:text-lg">
                    Chat Forum
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Communities and peer discussions
                  </p>
                </motion.div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full justify-center md:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#7c3aed" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-violet-700 transition w-full md:w-auto"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#ede9fe" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="bg-violet-100 text-violet-700 px-6 py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-violet-200 transition w-full md:w-auto"
                >
                  Watch intro Video
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              className="hidden md:flex flex-1 justify-center items-center"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
            >
              <motion.img
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                src="src/images/college-students-amico-1.svg"
                alt="Students"
                className="w-3/4 max-w-xs md:max-w-md mx-auto"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Resources Section */}
      <section className="min-h-screen flex flex-col justify-center items-center py-0 px-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl w-full h-full mx-auto flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left"
        >
          <motion.div
            variants={itemVariants}
            className="bg-violet-100 rounded-2xl p-4 md:p-12 shadow-lg min-h-screen flex flex-col justify-center items-center md:items-start w-full"
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-2xl md:text-3xl font-bold mb-8 text-center md:text-left"
            >
              Resources
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full justify-center md:justify-start">
              <ResourceCard
                icon={<BookOpen className="w-12 h-12" />}
                title="Lecture notes"
                desc="Downloadable PDFs"
              />
              <ResourceCard
                icon={<ClipboardList className="w-12 h-12" />}
                title="Assignment help"
                desc="Printable study guide"
              />
              <ResourceCard
                icon={<Calendar className="w-12 h-12" />}
                title="Study timetable"
                desc="Weekly planner"
              />
              <ResourceCard
                icon={<FileText className="w-12 h-12" />}
                title="Practice questions"
                desc="Exam preparation"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Top Picks Section */}
      <section className="min-h-screen flex flex-col justify-center items-center py-0 px-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl w-full h-full mx-auto flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left"
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-2xl md:text-3xl font-bold mb-8 text-center md:text-left"
          >
            Top Picks
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full justify-center md:justify-start">
            <TopPickCard
              icon={<PlayIcon />}
              title="From Orientation Videos"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incid."
            />
            <TopPickCard
              icon={<BookOpen className="w-16 h-16" />}
              title="From Resources"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incid."
            />
            <TopPickCard
              icon={<Calendar className="w-16 h-16" />}
              title="Study Plans"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incid."
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// Resource Card Component
function ResourceCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="text-violet-600 mb-2"
      >
        {icon}
      </motion.div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-500">{desc}</div>
    </motion.div>
  );
}

// Top Pick Card Component
function TopPickCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-violet-50 rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition"
    >
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="mb-2"
      >
        {icon}
      </motion.div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-500">{desc}</div>
    </motion.div>
  );
}

// Graduation Cap SVG Icon
function GraduationCapIcon({
  className = "w-8 h-8 text-violet-600",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
    </svg>
  );
}

// Play Icon SVG
function PlayIcon() {
  return (
    <svg
      className="w-10 h-10 text-violet-400"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" fill="#ede9fe" />
      <polygon points="10,8 16,12 10,16" fill="#7c3aed" />
    </svg>
  );
}
