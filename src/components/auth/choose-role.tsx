import React from 'react';
import { User, Stethoscope, MapPin, Calendar, MessageSquare, Search, ShieldCheck, Activity } from 'lucide-react';
// import { Header } from '../components/Header';
import { RoleCard } from './role-card';
import { RoleOption, UserRole } from './types';
import Link from 'next/link';

const ChooseRole: React.FC = () => {
  const roles: RoleOption[] = [
    {
      id: UserRole.PATIENT,
      title: "Create User Account",
      description: "Discover healthcare providers on the map, book appointments, and connect with your care team.",
      href: "/auth/sign-up",
      visualIcon: <User size={32} strokeWidth={2} />,
      primaryColor: "from-blue-500 to-cyan-500",
      buttonText: "Create User Account",
      features: [
        { icon: <MapPin />, text: "Find Providers on the Map" },
        { icon: <Calendar />, text: "Book Appointments Online" },
        { icon: <MessageSquare />, text: "Message Your Providers" },
        { icon: <Search />, text: "AI-Powered Health Assistant" },
      ]
    },
    {
      id: UserRole.PROVIDER,
      title: "Create Provider Account",
      description: "Get discovered on the map, manage your services and schedule, and grow your practice.",
      href: "/auth/sign-up-provider",
      visualIcon: <Stethoscope size={32} strokeWidth={2} />,
      primaryColor: "from-teal-500 to-emerald-500",
      buttonText: "Create Provider Account",
      features: [
        { icon: <MapPin />, text: "Map Visibility & Discovery" },
        { icon: <ShieldCheck />, text: "Manage Services & Hours" },
        { icon: <Calendar />, text: "Appointment Management" },
        { icon: <Activity />, text: "Analytics Dashboard" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900 transition-colors duration-300">
      {/* <Header /> */}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-100/40 dark:bg-cyan-900/20 rounded-full blur-3xl -z-10 opacity-50" />
        
        <div className="w-full max-w-5xl space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Choose your <span className="text-brand-600 dark:text-cyan-400">Role</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Find healthcare providers or grow your practice with Himsog.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>

          <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8">
            Already have an account? <Link href="/auth/sign-in" className="text-brand-600 dark:text-cyan-400 hover:underline font-medium">Log in here</Link>
          </p>

        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-sm">
        © {new Date().getFullYear()} Himsog. All rights reserved.
      </footer>
    </div>
  );
};

export default ChooseRole;