import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CommunityNetworkHeroVisual } from '../components/CommunityNetworkHeroVisual';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { PartnerMarquee } from '../components/PartnerMarquee';
import { HeroCircuitBackground } from '../components/HeroCircuitBackground';
import { IMAGES } from '../constants/images';
import {
  Zap,
  Sun,
  Home,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  BatteryCharging,
} from 'lucide-react';

interface Props {
  onEnterAs: (role: 'consumer' | 'prosumer' | 'admin') => void;
  onTriggerRebalanceDemo: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnterAs, onTriggerRebalanceDemo }) => {
  const [activeAccordion, setActiveAccordion] = useState<number>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const accordionItems = [
    {
      title: 'Solar 101 & Community Basics',
      desc: 'How rooftop photovoltaic panels capture sunlight and generate surplus kilowatt-hours that your immediate neighbors can use in real-time.',
      image: IMAGES.solarPanelsClose,
      stat: '98.6% efficiency',
    },
    {
      title: 'Financial benefits for households',
      desc: 'Prosumers earn up to 2.5x more than traditional utility feed-in credits, while consumers cut their electricity bills by 20–30%.',
      image: IMAGES.modernSolarHome,
      stat: '₹4,200 avg. annual savings',
    },
    {
      title: 'Zero transmission line waste',
      desc: 'Local peer-to-peer distribution keeps energy within the neighborhood feeder, eliminating long-distance high voltage grid losses.',
      image: IMAGES.windHillsSunset,
      stat: '<0.8% microgrid loss',
    },
    {
      title: 'Intelligent shortfall protection',
      desc: 'If cloud cover temporarily reduces generation, our autonomous rebalancing instantly routes backup solar without power dips.',
      image: IMAGES.batteryStorage,
      stat: '100% supply continuity',
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F5] dark:bg-[#0F100E] text-[#1A1B19] dark:text-[#EDEDE8] transition-colors overflow-hidden">
      {/* ====================================================
          1. HERO SECTION (Real Photography + Strong Typography)
          ==================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Piclo-Inspired Circuit Board Grid Motif Background */}
        <HeroCircuitBackground />

        {/* Ambient background glow mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/8 to-blue-500/10 rounded-full blur-3xl pointer-events-none animate-ambient-blob-1" />
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[300px] bg-gradient-to-br from-emerald-500/10 to-amber-500/5 rounded-full blur-3xl pointer-events-none animate-ambient-blob-2" />

        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 relative z-10">
          {/* Subtle Category Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#EFECE4] dark:bg-[#1E201B] text-[#1A1B19] dark:text-[#EDEDE8] border border-[#E6E2D8] dark:border-[#2C2D29] mb-8 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse" />
            <span>Renewable Energy Marketplace</span>
          </motion.div>

          {/* Exact Hero Title with Smooth Fade/Slide */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#1A1B19] dark:text-[#EDEDE8] leading-[1.06]"
          >
            Trade Renewable Energy. <br />
            <span className="text-[#B45309] dark:text-[#E5A93C]">Intelligently.</span>
          </motion.h1>

          {/* Exact Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-[#686B63] dark:text-[#9EA299] max-w-2xl mx-auto leading-relaxed font-light"
          >
            Connect renewable energy producers with people who need clean energy.
          </motion.p>

          {/* Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => onEnterAs('consumer')}
              className="px-8 py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer btn-interactive"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-8 py-4 rounded-full bg-[#FFFFFF] dark:bg-[#171816] hover:bg-[#F3EFE8] dark:hover:bg-[#20211D] text-[#1A1B19] dark:text-[#EDEDE8] border border-[#E6E2D8] dark:border-[#2C2D29] font-semibold text-sm sm:text-base transition-all shadow-xs cursor-pointer btn-interactive"
            >
              <span>How It Works</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Visual Area with Community Network Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <CommunityNetworkHeroVisual />
        </motion.div>
      </section>

      {/* ====================================================
          1B. INFINITE PROTOCOL & PARTNER MARQUEE STRIP
          ==================================================== */}
      <PartnerMarquee />

      {/* ====================================================
          2. STORYTELLING & SUPPORTING STATISTICS
          ==================================================== */}
      <section className="py-20 border-b border-[#E6E2D8] dark:border-[#262723] bg-[#F3EFE8]/50 dark:bg-[#141513]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-3">
                Why GridXchange
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] leading-tight">
                A modern energy grid built around people.
              </h2>
              <p className="mt-4 text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                Traditional utilities purchase excess rooftop solar for pennies and resell fossil electricity at peak rates. GridXchange creates a direct bridge between neighbors, making clean power equitable, transparent, and completely decentralized.
              </p>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs card-interactive"
              >
                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] block mb-2">
                  <AnimatedCounter target={25} suffix="%" />
                </div>
                <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                  Average Bill Savings
                </div>
                <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                  Consumers pay lower rates than legacy utility grid retail tariffs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs card-interactive"
              >
                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#B45309] dark:text-[#E5A93C] block mb-2">
                  <AnimatedCounter target={2.5} decimals={1} suffix="x" />
                </div>
                <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                  Higher Solar Returns
                </div>
                <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                  Prosumers earn fair market value for surplus kilowatt-hours.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs card-interactive"
              >
                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#2D6A4F] dark:text-[#52B788] block mb-2">
                  <AnimatedCounter target={100} suffix="%" />
                </div>
                <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                  Clean Verified Solar
                </div>
                <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                  Direct telemetry from nearby rooftop installations.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          3. HOW IT WORKS (3 Simple Steps with Visuals)
          ==================================================== */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-3">
            Simple 3-Step Journey
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
            How GridXchange Works
          </h2>
          <p className="mt-4 text-base text-[#686B63] dark:text-[#9EA299]">
            Clean local electricity, traded seamlessly without utility bureaucracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] flex flex-col justify-between shadow-sm card-interactive group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#B45309] dark:text-[#E5A93C]">
                  01
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sun className="w-6 h-6 fill-current" />
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] mb-3">
                Generate or Need Energy
              </h3>
              <p className="text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                Rooftop solar owners generate surplus clean power. Nearby consumers specify how many kilowatt-hours they need and their delivery window.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EFECE4] dark:border-[#262723] text-xs font-mono text-[#8D9188]">
              Automatic smart meter sync
            </div>
          </motion.div>

          {/* Step 02 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] flex flex-col justify-between shadow-sm card-interactive group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#2D6A4F] dark:text-[#52B788]">
                  02
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F2EC] dark:bg-[#1A281E] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] mb-3">
                Get Matched
              </h3>
              <p className="text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                The marketplace pairs buyers and sellers based on geographical proximity, competitive pricing, and grid health—instantly and automatically.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EFECE4] dark:border-[#262723] text-xs font-mono text-[#8D9188]">
              Proximity-first clearing
            </div>
          </motion.div>

          {/* Step 03 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] flex flex-col justify-between shadow-sm card-interactive group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                  03
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] mb-3">
                Trade & Track
              </h3>
              <p className="text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                Electricity flows through the neighborhood network. You track delivery with simple real-time updates, protected by automatic backup guarantees.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EFECE4] dark:border-[#262723] text-xs font-mono text-[#8D9188]">
              100% reliable delivery guarantee
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====================================================
          4. SPLIT USER JOURNEYS (For Consumers vs For Prosumers)
             Editorial photography cards matching Solfi reference
          ==================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-3">
            Choose Your Journey
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
            Designed for Consumers & Prosumers Alike
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Consumers */}
          <motion.div
            id="for-consumers"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl overflow-hidden border border-[#E6E2D8] dark:border-[#2A2B27] bg-[#FFFFFF] dark:bg-[#171816] shadow-sm flex flex-col justify-between card-interactive group"
          >
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <img
                src={IMAGES.communityHomes}
                alt="Modern neighborhood homes powered by clean solar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B19]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#FAF8F5]/90 dark:bg-[#1A1B18]/90 text-[#1A1B19] dark:text-[#EDEDE8] mb-2 backdrop-blur-md">
                  <Home className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>FOR CONSUMERS</span>
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  Buy clean local energy at fair rates.
                </h3>
              </div>
            </div>

            <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                  Purchase verified solar power directly from neighboring rooftop owners without investing in your own solar installation.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                    <span>Save 20–30% compared to legacy utility tariffs</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                    <span>100% verified local renewable electricity</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                    <span>Automatic backup ensures uninterrupted supply</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EFECE4] dark:border-[#262723]">
                <button
                  onClick={() => onEnterAs('consumer')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer btn-interactive"
                >
                  <span>Find Energy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: For Prosumers */}
          <motion.div
            id="for-prosumers"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl overflow-hidden border border-[#E6E2D8] dark:border-[#2A2B27] bg-[#FFFFFF] dark:bg-[#171816] shadow-sm flex flex-col justify-between card-interactive group"
          >
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <img
                src={IMAGES.solarTechnician}
                alt="Solar prosumer inspecting energy storage equipment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B19]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#FAF8F5]/90 dark:bg-[#1A1B18]/90 text-[#1A1B19] dark:text-[#EDEDE8] mb-2 backdrop-blur-md">
                  <Sun className="w-3.5 h-3.5 text-[#B45309] fill-current" />
                  <span>FOR PROSUMERS</span>
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  Monetize your midday solar surplus.
                </h3>
              </div>
            </div>

            <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                  Turn excess solar generation and battery storage into revenue by selling directly to neighbors at transparent market value.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    <CheckCircle2 className="w-4 h-4 text-[#B45309] dark:text-[#E5A93C] shrink-0" />
                    <span>Earn up to 2.5x more than traditional net metering credits</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    <CheckCircle2 className="w-4 h-4 text-[#B45309] dark:text-[#E5A93C] shrink-0" />
                    <span>Automated dispatch matching your generation profile</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    <CheckCircle2 className="w-4 h-4 text-[#B45309] dark:text-[#E5A93C] shrink-0" />
                    <span>Instant, transparent settlement with zero admin friction</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EFECE4] dark:border-[#262723]">
                <button
                  onClick={() => onEnterAs('prosumer')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#B45309] dark:bg-[#E5A93C] hover:bg-[#92400E] dark:hover:bg-[#F59E0B] text-white dark:text-[#1A1B19] font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer btn-interactive"
                >
                  <span>Sell Energy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====================================================
          5. AUTONOMOUS REBALANCING SPOTLIGHT (Major Differentiator)
          ==================================================== */}
      <section id="rebalance-section" className="py-20 border-y border-[#E6E2D8] dark:border-[#262723] bg-[#F3EFE8]/40 dark:bg-[#141513]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2D6A4F] dark:text-[#52B788] block mb-3">
                Autonomous Resilience
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] leading-tight">
                Zero disruptions. <br />
                Automatic rebalancing.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                If passing clouds or maintenance suddenly lower a seller's solar generation mid-trade, GridXchange instantly routes secondary solar reserves from another neighbor.
              </p>
              <div className="mt-6">
                <button
                  onClick={onTriggerRebalanceDemo}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFFFFF] dark:bg-[#1D1E1B] border border-[#E6E2D8] dark:border-[#2A2B27] text-xs font-semibold text-[#1A1B19] dark:text-[#EDEDE8] hover:bg-[#FAF8F5] transition-all shadow-xs cursor-pointer btn-interactive"
                >
                  <Zap className="w-4 h-4 text-[#B45309] dark:text-[#E5A93C] fill-current" />
                  <span>Launch Live Rebalance Simulation</span>
                </button>
              </div>
            </motion.div>

            {/* Visual Rebalancing Demonstration Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-lg card-interactive">
                <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4] dark:border-[#262723] mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D9188] block">
                      Trade Requirement
                    </span>
                    <span className="font-heading text-lg font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                      5.0 kWh Needed
                    </span>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] font-bold">
                    100% Fulfilled
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Primary Seller */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1F1C] border border-[#E6E2D8] dark:border-[#2C2D29] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Seller A (Rajesh's Solar Roof)</div>
                      <div className="text-[11px] text-[#8D9188]">Original listing — cloud shadow reduced output</div>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                      3.5 kWh
                    </span>
                  </div>

                  {/* Auto Added Backup */}
                  <div className="p-4 rounded-2xl bg-[#E8F2EC]/60 dark:bg-[#19271E] border border-[#2D6A4F]/30 dark:border-[#52B788]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                      <div>
                        <div className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                          Seller B (SolarReserve Beta)
                        </div>
                        <div className="text-[11px] text-[#2D6A4F]/80 dark:text-[#52B788]/80">
                          Automatically dispatched shortfall backup
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
                      + 1.5 kWh
                    </span>
                  </div>

                  {/* Summary Confirmation */}
                  <div className="p-4 rounded-2xl bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#52B788] dark:text-[#2D6A4F]" />
                      <div className="text-xs font-semibold">
                        Your energy requirement was automatically fulfilled.
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-base">5.0 kWh</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================
          6. KNOWLEDGE & EDITORIAL ACCORDION (Solfi-style Inspiration)
          ==================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-3">
              Knowledge & Clarity
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] leading-tight">
              Bright choices begin with clean design.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
              We believe understanding your energy should be effortless. No black-box utility formulas—just straightforward peer-to-peer electricity.
            </p>
          </motion.div>

          <div className="lg:col-span-7 space-y-4">
            {accordionItems.map((item, index) => {
              const isOpen = activeAccordion === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveAccordion(index)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-[#FFFFFF] dark:bg-[#171816] border-[#1A1B19] dark:border-[#EDEDE8] shadow-md'
                      : 'bg-[#FFFFFF]/60 dark:bg-[#141513] border-[#E6E2D8] dark:border-[#262723] hover:border-[#D1CCC0] card-interactive'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-[#8D9188]">
                        00{index + 1}
                      </span>
                      <h4 className="font-heading font-bold text-base sm:text-lg text-[#1A1B19] dark:text-[#EDEDE8]">
                        {item.title}
                      </h4>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-[#8D9188] transition-transform duration-300 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-4 pt-4 border-t border-[#EFECE4] dark:border-[#262723] grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                    >
                      <div className="sm:col-span-7">
                        <p className="text-xs sm:text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#2D6A4F] dark:text-[#52B788]">
                          <span>{item.stat}</span>
                        </div>
                      </div>
                      <div className="sm:col-span-5 h-28 rounded-2xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          7. IMPACT & SUSTAINABILITY (Real Metric Dividends)
          ==================================================== */}
      <section id="impact" className="py-20 border-t border-[#E6E2D8] dark:border-[#262723] bg-[#F3EFE8]/50 dark:bg-[#141513]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2D6A4F] dark:text-[#52B788] block mb-3">
              Measurable Progress
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
              Real environmental and economic impact.
            </h2>
            <p className="mt-4 text-base text-[#686B63] dark:text-[#9EA299]">
              Every trade removes carbon from the air and keeps value within your neighborhood.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] card-interactive"
            >
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2D6A4F] dark:text-[#52B788] block mb-2">
                <AnimatedCounter target={116.8} decimals={1} suffix=" kg" />
              </div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                CO2 Avoided
              </div>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                Equivalent to 5.2 mature trees planted this cycle.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] card-interactive"
            >
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#B45309] dark:text-[#E5A93C] block mb-2">
                <AnimatedCounter target={18.4} decimals={1} prefix="-" suffix="%" />
              </div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                Peak Substation Relief
              </div>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                Reduces thermal strain on community transformers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] card-interactive"
            >
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] block mb-2">
                <AnimatedCounter target={3420} prefix="₹" />
              </div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                Community Wealth Kept
              </div>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                Retained in the local microgrid economy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] card-interactive"
            >
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2D6A4F] dark:text-[#52B788] block mb-2">
                <AnimatedCounter target={100} suffix="%" />
              </div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] uppercase tracking-wider font-heading">
                Shortfall Resilience
              </div>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-2">
                Zero trade disruptions via automated secondary rebalancing.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================
          8. ABOUT & GET STARTED CTA
          ==================================================== */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl p-10 sm:p-16 bg-[#1A1B19] dark:bg-[#171816] border border-[#2C2D29] text-white relative overflow-hidden shadow-xl"
        >
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#E5A93C] block mb-3">
              Join the Movement
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to trade renewable energy in your community?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#D1CCC0] leading-relaxed">
              Start buying clean solar power or turn your rooftop surplus into recurring revenue today.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => onEnterAs('consumer')}
                className="px-8 py-4 rounded-full bg-[#EDEDE8] hover:bg-white text-[#1A1B19] font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer btn-interactive"
              >
                <span>Find Energy as Consumer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEnterAs('prosumer')}
                className="px-8 py-4 rounded-full bg-[#2C2D29] hover:bg-[#3E403B] text-white border border-[#4D5049] font-semibold text-sm transition-all cursor-pointer btn-interactive"
              >
                <span>Sell Energy as Prosumer</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

