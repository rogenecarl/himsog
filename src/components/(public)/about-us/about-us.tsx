import React from 'react';
import {
  Code2,
  Target,
  Linkedin,
  Github,
  Twitter,
  Database,
  LayoutTemplate,
  FileCode,
  Cloud,
  Map,
  Mail,
  ShieldCheck,
  Layers,
  Box,
  CheckCircle,
  Globe,
  GitBranch,
  Cpu,
  Palette,
  Puzzle
} from "lucide-react";
import Image from 'next/image';

const team = [
  {
    name: "Rogene Carl L. Rosalijos",
    role: "Fullstack Developer",
    image: "/bajig.jpg",
    color: "bg-blue-100 text-blue-600",
    description: "Designing and developing end-to-end features—from system architecture and database schema to intuitive UI/UX—ensuring a seamless and scalable digital experience for the platform."
  },
  {
    name: "Rovic Constantino",
    role: "Project Manager",
    image: "/bajig.jpg",
    color: "bg-purple-100 text-purple-600",
    description: "Orchestrating product timelines and ensuring the team delivers high-value features to users."
  },
  {
    name: "Dan Jover Peloriana",
    role: "Project Manager",
    image: "/bajig.jpg",
    color: "bg-emerald-100 text-emerald-600",
    description: "Aligning product strategy with user needs and driving the vision of centralized healthcare."
  }
];

const techStack = [
  {
    name: "Next.js 16",
    type: "Framework",
    icon: LayoutTemplate,
    description: "The latest React framework for high-performance web applications."
  },
  {
    name: "TypeScript",
    type: "Language",
    icon: FileCode,
    description: "Strongly typed JavaScript ensuring code reliability and scalability."
  },
  {
    name: "Prisma ORM",
    type: "Database",
    icon: Database,
    description: "Next-generation ORM for type-safe database interactions."
  },
  {
    name: "PostgreSQL",
    type: "Database",
    icon: Database,
    description: "Robust relational database for secure data storage."
  },
  {
    name: "Supabase",
    type: "Backend",
    icon: Cloud,
    description: "Open-source backend service for authentication and real-time data."
  },
  {
    name: "Mapbox",
    type: "Maps",
    icon: Map,
    description: "Interactive, customizable maps for precise geolocation."
  },
  {
    name: "Resend",
    type: "Email",
    icon: Mail,
    description: "Modern email API for reliable transactional messaging."
  },
  {
    name: "Better Auth",
    type: "Security",
    icon: ShieldCheck,
    description: "Advanced authentication library for secure user access."
  },
  {
    name: "TanStack",
    type: "Query",
    icon: Layers,
    description: "Powerful asynchronous state management for data fetching."
  },
  {
    name: "Zustand",
    type: "State",
    icon: Box,
    description: "Small, fast, and scalable state-management solution."
  },
  {
    name: "Zod",
    type: "Validation",
    icon: CheckCircle,
    description: "TypeScript-first schema validation for data integrity."
  },
  {
    name: "React",
    type: "Library",
    icon: Code2,
    description: "The core library for building interactive user interfaces."
  },
  {
    name: "Tailwind CSS",
    type: "Styling",
    icon: Palette,
    description: "Utility-first CSS framework for rapid UI development."
  },
  {
    name: "Shadcn UI",
    type: "UI Components",
    icon: Puzzle,
    description: "Beautifully designed components built with Radix UI and Tailwind."
  },
  {
    name: "Lucide React",
    type: "Icons",
    icon: Cpu,
    description: "Beautiful, consistent, and lightweight icon toolkit."
  },
  {
    name: "Vercel",
    type: "Deployment",
    icon: Globe,
    description: "Cloud platform for static sites and serverless functions."
  },
  {
    name: "GitHub",
    type: "DevOps",
    icon: GitBranch,
    description: "Version control system for efficient code collaboration."
  },
];

export default function AboutUs() {
  return (
    <section className="bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="container mx-auto px-4">

        {/* SECTION 1: THE PROJECT */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-base font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wide mb-3">The Project</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Revolutionizing Healthcare in Digos City
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Digos Health Hub was born from a simple observation: finding healthcare should not be a headache.
            We set out to build a centralized ecosystem that connects patients with hospitals, clinics,
            and veterinarians in real-time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
              <div className="h-10 w-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <Target size={20} />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Our Mission</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">To make healthcare services accessible, transparent, and efficient for every resident.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Our Promise</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reliable data, secure bookings, and a verified network of providers you can trust.</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                <Cpu size={20} />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Innovation</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Leveraging modern web technologies to deliver a fast, seamless experience.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE TEAM */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-base font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wide">Our Team</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              The Minds Behind the Hub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="group relative bg-white dark:bg-[#1E293B] rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-white/10 hover:-translate-y-1">

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Image Container */}
                  <div className="relative h-32 w-32 rounded-full mb-6 shadow-lg border-4 border-white dark:border-slate-700 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{member.name}</h3>
                  <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mt-1 mb-4">{member.role}</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {member.description}
                  </p>

                  <div className="flex gap-4 opacity-60 group-hover:opacity-100 transition-all duration-300">
                    <button className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"><Linkedin size={18} /></button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"><Twitter size={18} /></button>
                    {index === 0 && <button className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"><Github size={18} /></button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: TECH STACK */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Built With</h2>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Modern Technology Stack</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {techStack.map((tech, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-white/10 hover:border-cyan-100 dark:hover:border-cyan-900/50 hover:shadow-md transition-all duration-200 group h-full text-center">
                <div className="mb-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20">
                  <tech.icon size={24} strokeWidth={1.5} />
                </div>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{tech.name}</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mt-1 mb-2 font-medium">{tech.type}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[180px]">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}