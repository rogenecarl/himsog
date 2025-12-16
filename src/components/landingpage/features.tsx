"use client";
import { Map, Calendar, ShieldCheck, MessageCircle, Bot, Sparkles, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  return (
    <section className="py-32 bg-slate-50 dark:bg-[#0B0F19] relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-700 dark:text-cyan-300 font-bold text-xs tracking-widest uppercase mb-6 border border-cyan-200 dark:border-cyan-800"
            >
                Features Overview
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight"
            >
                Find the right care, <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">right where you are.</span>
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
            >
                Discover verified hospitals, clinics, and specialists on our interactive map.
                Book appointments instantly, message providers directly, and take control of your healthcare journey.
            </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
            
            {/* Card 1: Map (Large Span) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 row-span-2 bg-white dark:bg-[#111827] rounded-4xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group"
            >
                <div className="relative z-10 max-w-md">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        <Map className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Smart Geolocation Map</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Find open clinics in real-time. Filter by Hospitals, Dental, Vet, or Derma services across Digos City with live navigation data.
                    </p>
                </div>
                
                {/* Map Visual Background */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 dark:opacity-20 mask-gradient-to-l pointer-events-none">
                     <div className="h-full w-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] bg-size[20px_20px]"></div>
                </div>
                
                <div className="absolute bottom-6 right-6 flex gap-3">
                     <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-white/5"
                     >
                         <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                 <ShieldCheck className="w-4 h-4" />
                             </div>
                             <div>
                                 <div className="text-xs font-bold text-slate-900 dark:text-white">Verified</div>
                                 <div className="text-[10px] text-slate-500">100% Trust</div>
                             </div>
                         </div>
                     </motion.div>
                </div>
            </motion.div>

            {/* Card 2: Booking */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-1 row-span-1 bg-white dark:bg-[#111827] rounded-4xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-purple-500/30 transition-colors"
            >
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform">
                    <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Instant Booking</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Book instantly. No phone tag required.
                </p>
            </motion.div>

            {/* Card 3: Messaging */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-1 row-span-1 bg-linear-to-br from-cyan-500 to-blue-600 rounded-4xl p-8 shadow-xl text-white relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
                <MessageCircle className="w-10 h-10 text-white mb-4 relative z-10" />
                <h3 className="text-xl font-bold mb-2 relative z-10">Real-time Messaging</h3>
                <p className="text-sm text-white/80 relative z-10">
                    Connect directly with providers through secure messaging.
                </p>
            </motion.div>

             {/* Card 4: AI Assistant Static Demo */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="md:col-span-3 bg-white dark:bg-[#111827] rounded-4xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col md:flex-row gap-8 relative overflow-hidden transition-colors duration-300"
            >
                {/* Decorative Glow */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Left Info Side */}
                <div className="flex-1 flex flex-col justify-center relative z-10">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                        <Bot className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Himsog AI Assistant</h3>
                        <span className="bg-linear-to-r from-indigo-500 to-purple-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg shadow-indigo-500/30">BETA</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                        Your personal guide to Himsog. Ask how to book appointments, find healthcare providers, navigate the platform, or learn about our services. Available 24/7.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Find Providers', 'Booking Guidance', 'Platform Navigation', 'Service Information'].map((tag) => (
                            <div key={tag} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Interface Mockup - Static */}
                <div className="flex-1 bg-slate-50 dark:bg-[#0f141f] border border-slate-200 dark:border-white/5 rounded-2xl p-1 flex flex-col relative z-20 shadow-inner h-[400px]">
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl h-full flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E293B]">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">AI Assistant</div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Static Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide bg-slate-50/50 dark:bg-black/20">
                            {/* User Message */}
                            <div className="flex flex-col items-end">
                                <div className="max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-indigo-600 text-white rounded-br-none">
                                    How do I book an appointment?
                                </div>
                            </div>

                            {/* AI Message with Steps */}
                            <div className="flex flex-col items-start">
                                <div className="max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-600">
                                    To book an appointment, browse services or use the map to find a provider. Then select a service, choose your preferred date and time, and confirm your booking!
                                </div>
                                <div className="mt-2 space-y-2 w-full max-w-[85%]">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:border-indigo-500 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Browse Services</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Find providers near you</div>
                                        </div>
                                        <button className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">Go</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Static Input Area */}
                        <div className="p-4 bg-white dark:bg-[#1E293B] border-t border-slate-100 dark:border-white/5">
                            <div className="relative">
                                <div className="w-full bg-slate-50 dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 text-slate-400 text-sm rounded-xl pl-4 pr-12 py-3.5 select-none">
                                    Ask about booking, providers...
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600/50 rounded-lg flex items-center justify-center cursor-not-allowed">
                                    <Send className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Features;