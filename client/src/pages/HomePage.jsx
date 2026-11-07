import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileClock,
  FlaskConical,
  Gauge,
  Layers3,
  Menu,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  GraduationCap,
} from "lucide-react";

import "../styles/LandingPage.css";

const features = [
  {
    icon: Layers3,
    title: "Centralized Equipment Inventory",
    description:
      "Maintain organized records of laboratory instruments, serial numbers, locations, operational conditions, and equipment history.",
    color: "blue",
  },
  {
    icon: QrCode,
    title: "Smart QR Identification",
    description:
      "Generate a unique QR code for every instrument. Scan it using Google Lens or a mobile camera to instantly open its equipment profile.",
    color: "cyan",
  },
  {
    icon: CalendarClock,
    title: "Calibration Management",
    description:
      "Monitor last calibration dates, upcoming due dates, overdue equipment, and preserve every completed calibration record.",
    color: "violet",
  },
  {
    icon: ClipboardCheck,
    title: "Digital Fault Tracking",
    description:
      "Allow students to report damaged instruments with photographs and help assistants manage the complete repair lifecycle.",
    color: "emerald",
  },
];

const workflow = [
  {
    number: "01",
    icon: Wrench,
    title: "Register Equipment",
    description:
      "The Lab Assistant adds equipment details and assigns it to the appropriate laboratory.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate & Scan QR",
    description:
      "A unique QR label is generated. Students scan it to access the instrument's public information page.",
  },
  {
    number: "03",
    icon: FileClock,
    title: "Report a Fault",
    description:
      "Students submit a fault description and photograph. The system creates a traceable ticket.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Resolve & Maintain",
    description:
      "The Lab Assistant reviews the ticket, manages repairs, and updates the resolution status.",
  },
];

const portals = [
  {
    title: "Administrator",
    subtitle: "System Management",
    description:
      "Manage laboratories, create Lab Assistant accounts, assign laboratory access, and monitor global read-only reports.",
    icon: ShieldCheck,
    accent: "blue",
    action: "Access Admin Portal",
    to: "/login?role=Admin",
    points: [
      "Create and manage laboratories",
      "Assign Lab Assistants",
      "View calibrated equipment reports",
      "Monitor damaged equipment reports",
    ],
  },
  {
    title: "Lab Assistant",
    subtitle: "Laboratory Operations",
    description:
      "Manage assigned laboratory equipment, generate QR labels, maintain calibration records, and resolve fault tickets.",
    icon: Wrench,
    accent: "emerald",
    action: "Access Assistant Portal",
    to: "/login?role=Assistant",
    points: [
      "Manage assigned lab inventory",
      "Generate and print QR codes",
      "Maintain calibration history",
      "Manage equipment fault tickets",
    ],
  },
  {
    title: "Student",
    subtitle: "Equipment Access & Reporting",
    description:
      "Scan equipment QR codes to view instrument information, report faults with photographs, and track submitted tickets.",
    icon: GraduationCap,
    accent: "violet",
    action: "Track Your Ticket",
    to: "/track-ticket",
    points: [
      "View equipment information",
      "Report equipment damage",
      "Upload damage photographs",
      "Track ticket resolution",
    ],
  },
];

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lp-root min-h-screen bg-[#080F20] text-white">

      {/* Background Effects */}
      <div className="lp-background" aria-hidden="true">
        <div className="lp-grid-bg" />
        <div className="lp-orb lp-orb-one" />
        <div className="lp-orb lp-orb-two" />
      </div>

      {/* Header */}
      <header className="lp-header sticky top-0 z-50 border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="h-[76px] flex items-center justify-between">

            {/* Logo */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="lp-logo flex items-center justify-center">
                <FlaskConical size={23} />
              </div>

              <div>
                <h1 className="text-[15px] sm:text-base font-bold tracking-tight">
                  Lab<span className="text-cyan-400">Track</span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-wide">
                  EQUIPMENT MANAGEMENT SYSTEM
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a className="lp-nav-link" href="#overview">
                Overview
              </a>
              <a className="lp-nav-link" href="#features">
                Features
              </a>
              <a className="lp-nav-link" href="#workflow">
                How It Works
              </a>
              <a className="lp-nav-link" href="#portals">
                Portals
              </a>
            </nav>

            {/* Header Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-2"
              >
                Staff Login
              </Link>

              <Link
                to="/track-ticket"
                className="lp-header-button"
              >
                Track Ticket
                <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg border border-white/10 hover:bg-white/5"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav
              id="mobile-navigation"
              className="lg:hidden lp-mobile-nav pb-5 flex flex-col gap-4"
            >
              <a href="#overview" onClick={closeMenu}>Overview</a>
              <a href="#features" onClick={closeMenu}>Features</a>
              <a href="#workflow" onClick={closeMenu}>How It Works</a>
              <a href="#portals" onClick={closeMenu}>Portals</a>

              <Link to="/login" onClick={closeMenu}>
                Staff Login
              </Link>

              <Link to="/track-ticket" onClick={closeMenu}>
                Track Ticket <ArrowUpRight size={15} />
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section
          id="overview"
          className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-24"
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-14">

            {/* Hero Content */}
            <div className="lp-reveal">
              <div className="lp-eyebrow">
                <span className="lp-live-dot" />
                UNIVERSITY LABORATORY MANAGEMENT
                <Sparkles size={13} className="text-cyan-400" />
              </div>

              <h2 className="mt-7 text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-[1.12] tracking-tight">
                Smarter Labs.
                <br />
                <span className="lp-gradient-text">
                  Better Equipment
                  <br className="hidden sm:block" />
                  Management.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-[15px] sm:text-base text-slate-400 leading-8">
                A centralized digital platform to manage laboratory
                equipment, monitor calibration schedules, identify
                damaged instruments, and streamline maintenance
                through QR-powered fault reporting.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <a
                  href="#portals"
                  className="lp-primary-button"
                >
                  Explore Portals
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#workflow"
                  className="lp-secondary-button"
                >
                  <ScanLine size={17} />
                  Explore Workflow
                </a>
              </div>

              {/* Highlights */}
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4">
                {[
                  "QR-Based Identification",
                  "Calibration Visibility",
                  "Digital Fault Reporting",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-cyan-400 shrink-0"
                    />
                    <span className="text-xs text-slate-400">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lp-reveal lp-delay-2 relative">
              <div className="lp-dashboard-glow" />

              <div className="lp-preview-card relative rounded-3xl border border-white/10 p-5 sm:p-7 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs text-slate-400">
                      SYSTEM PREVIEW
                    </p>
                    <h3 className="font-semibold text-lg mt-1">
                      Equipment Overview
                    </h3>
                  </div>

                  <div className="lp-preview-badge">
                    <Activity size={14} />
                    Interface Preview
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="lp-preview-tile">
                    <div className="flex items-center justify-between">
                      <Layers3 className="text-cyan-400" size={20} />
                      <span className="text-[10px] text-slate-500">
                        INVENTORY
                      </span>
                    </div>
                    <p className="text-xl font-bold mt-4">Equipment</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Centralized records
                    </p>
                  </div>

                  <div className="lp-preview-tile">
                    <div className="flex items-center justify-between">
                      <CalendarClock className="text-violet-400" size={20} />
                      <span className="text-[10px] text-slate-500">
                        SCHEDULES
                      </span>
                    </div>
                    <p className="text-xl font-bold mt-4">Calibration</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Due date tracking
                    </p>
                  </div>
                </div>

                {/* Equipment Preview */}
                <div className="lp-equipment-panel mt-5 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="lp-equipment-icon">
                        <Gauge size={23} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          Oscilloscope
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Illustrative equipment profile
                        </p>
                      </div>
                    </div>
                    <BadgeCheck className="text-emerald-400" size={22} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="lp-status-box">
                      <p className="text-[10px] text-slate-500 uppercase">
                        Operational
                      </p>
                      <p className="text-sm text-emerald-400 font-semibold mt-2">
                        Ready to Use
                      </p>
                    </div>

                    <div className="lp-status-box">
                      <p className="text-[10px] text-slate-500 uppercase">
                        Calibration
                      </p>
                      <p className="text-sm text-cyan-400 font-semibold mt-2">
                        Valid
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Workflow */}
                <div className="mt-5 flex items-center gap-4 rounded-2xl bg-blue-500/[0.08] border border-blue-400/20 p-4">
                  <div className="lp-qr-box">
                    <QrCode size={35} className="text-cyan-400" />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">
                      QR-Powered Access
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-5">
                      Scan an equipment label to open its digital
                      information page.
                    </p>
                  </div>

                  <ArrowUpRight className="text-cyan-400" size={19} />
                </div>

                {/* Floating Decoration */}
                <div className="lp-floating-chip">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Traceable Records</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hero Strip */}
          <div className="mt-24 lp-info-strip grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-semibold">Equipment Visibility</p>
              <p className="text-xs text-slate-400 mt-2">
                Know where instruments are and how they are performing.
              </p>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-7">
              <p className="text-sm font-semibold">Maintenance Traceability</p>
              <p className="text-xs text-slate-400 mt-2">
                Keep calibration and fault resolution history organized.
              </p>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-7">
              <p className="text-sm font-semibold">Role-Based Access</p>
              <p className="text-xs text-slate-400 mt-2">
                Provide separate workspaces with controlled permissions.
              </p>
            </div>
          </div>
        </section>

        {/* Project Introduction */}
        <section className="lp-section border-y border-white/[0.06] bg-white/[0.018]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
            <div className="max-w-3xl mx-auto text-center lp-reveal">
              <span className="lp-section-label">ABOUT THE PROJECT</span>

              <h2 className="lp-section-title mt-5">
                Bringing Laboratory Operations
                <span className="lp-gradient-text"> Into One System.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-8 mt-6">
                Traditional laboratory management often relies on
                handwritten registers and disconnected spreadsheets.
                This makes it difficult to monitor calibration deadlines,
                maintain equipment history, and respond to faults
                efficiently.
                <br /><br />
                Our solution connects equipment identification,
                calibration records, and digital fault reporting in one
                centralized web application, helping laboratory teams
                maintain organized and traceable operations.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="lp-reveal">
            <span className="lp-section-label">CORE CAPABILITIES</span>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mt-5">
              <h2 className="lp-section-title max-w-2xl">
                Everything Your Laboratory Needs
                <span className="lp-gradient-text"> In One Place.</span>
              </h2>

              <p className="max-w-sm text-sm text-slate-400 leading-7">
                Designed to simplify equipment management,
                calibration monitoring and maintenance coordination.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={`lp-feature-card lp-accent-${feature.color} lp-reveal`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="lp-feature-icon">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-7 font-semibold text-[17px]">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm text-slate-400 leading-7">
                    {feature.description}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-slate-300">
                    Smart Lab Management
                    <ChevronRight size={15} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Workflow */}
        <section
          id="workflow"
          className="lp-section border-y border-white/[0.06] bg-white/[0.018]"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
            <div className="text-center max-w-3xl mx-auto lp-reveal">
              <span className="lp-section-label">HOW IT WORKS</span>

              <h2 className="lp-section-title mt-5">
                From Equipment Registration
                <br />
                to <span className="lp-gradient-text">Fault Resolution.</span>
              </h2>

              <p className="text-sm text-slate-400 leading-7 mt-5">
                A connected workflow that makes equipment identification
                and maintenance reporting easier.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
              {workflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="lp-workflow-card lp-reveal"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-black text-white/[0.13]">
                        {step.number}
                      </span>
                      <div className="lp-workflow-icon">
                        <Icon size={21} />
                      </div>
                    </div>

                    <h3 className="mt-7 font-semibold text-base">
                      {step.title}
                    </h3>

                    <p className="text-sm text-slate-400 mt-3 leading-7">
                      {step.description}
                    </p>

                    {index !== workflow.length - 1 && (
                      <ArrowRight
                        size={16}
                        className="hidden lg:block text-cyan-500/50 absolute -right-3 top-1/2 z-10"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Portals */}
        <section id="portals" className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto lp-reveal">
            <span className="lp-section-label">ACCESS PORTALS</span>

            <h2 className="lp-section-title mt-5">
              One Platform.
              <span className="lp-gradient-text"> Three Experiences.</span>
            </h2>

            <p className="mt-5 text-sm text-slate-400 leading-7">
              Dedicated access for administrators, laboratory assistants,
              and students, with permissions based on their responsibilities.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-14">
            {portals.map((portal, index) => {
              const Icon = portal.icon;

              return (
                <article
                  key={portal.title}
                  className={`lp-portal-card lp-portal-${portal.accent} lp-reveal`}
                  style={{ animationDelay: `${index * 130}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="lp-portal-icon">
                      <Icon size={26} />
                    </div>

                    <span className="lp-portal-number">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400 mt-7">
                    {portal.subtitle}
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    {portal.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-7 mt-4 min-h-[78px]">
                    {portal.description}
                  </p>

                  <div className="border-t border-white/10 mt-6 pt-6 space-y-4">
                    {portal.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-center gap-3 text-sm text-slate-300"
                      >
                        <CheckCircle2
                          size={15}
                          className="lp-portal-check shrink-0"
                        />
                        {point}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={portal.to}
                    className="lp-portal-button mt-9"
                  >
                    {portal.action}
                    <ArrowUpRight size={17} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
          <div className="lp-final-cta rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="lp-cta-icon mx-auto">
                <Activity size={25} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mt-7">
                Better Visibility.
                <span className="lp-gradient-text">
                  {" "}Better Maintenance.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-7 mt-5">
                Access the appropriate portal to manage laboratory
                equipment, review maintenance information, or track
                a submitted fault report.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login" className="lp-primary-button">
                  Staff Login
                  <ArrowRight size={17} />
                </Link>

                <Link to="/track-ticket" className="lp-secondary-button">
                  Track a Ticket
                  <Search size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="lp-footer border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-7">
          <div className="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 pb-12">

            {/* Project Identity */}
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="lp-logo">
                  <FlaskConical size={22} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Lab<span className="text-cyan-400">Track</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 tracking-wider">
                    LABORATORY MANAGEMENT
                  </p>
                </div>
              </Link>

              <p className="text-sm text-slate-400 leading-7 mt-5 max-w-sm">
                A centralized platform for laboratory equipment
                identification, calibration visibility, and digital
                fault management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="lp-footer-heading">Quick Links</h4>
              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <a className="lp-footer-link block" href="#overview">Overview</a>
                <a className="lp-footer-link block" href="#features">Features</a>
                <a className="lp-footer-link block" href="#workflow">Workflow</a>
                <a className="lp-footer-link block" href="#portals">Portals</a>
              </div>
            </div>

            {/* Portals */}
            <div>
              <h4 className="lp-footer-heading">Access Portals</h4>
              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <Link className="lp-footer-link block" to="/login?role=Admin">
                  Administrator
                </Link>
                <Link className="lp-footer-link block" to="/login?role=Assistant">
                  Lab Assistant
                </Link>
                <Link className="lp-footer-link block" to="/track-ticket">
                  Student Ticket Tracking
                </Link>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h4 className="lp-footer-heading">Project Details</h4>
              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-cyan-400" />
                  B.Tech Major Project
                </p>
                <p className="flex items-center gap-2">
                  <FlaskConical size={16} className="text-cyan-400" />
                  GLA University
                </p>
                <p className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-cyan-400" />
                  Group G137
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} Local Lab Equipment Calibration
              & Fault Tracking System.
            </p>

            <p className="flex items-center gap-2">
              Designed for smarter laboratory operations
              <Sparkles size={13} className="text-cyan-400" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
