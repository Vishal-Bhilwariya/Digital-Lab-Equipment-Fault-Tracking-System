import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  Layers3,
  Menu,
  MessageSquareHeart,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  GraduationCap,
  HelpCircle,
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
      "The Lab Assistant adds equipment details directly into their assigned laboratory inventory.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate & Scan QR",
    description:
      "A unique QR label is generated. Students scan it via camera or Google Lens to view instrument details.",
  },
  {
    number: "03",
    icon: FileClock,
    title: "Report a Fault",
    description:
      "Students submit a fault description and damage photo. The system creates a traceable ticket and notifies staff.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Resolve & Maintain",
    description:
      "The Lab Assistant reviews the ticket, manages repairs, and updates the status with real-time email alerts to the student.",
  },
];

const portals = [
  {
    title: "Administrator",
    subtitle: "System Management",
    description:
      "Manage laboratories, archive and restore labs, create Lab Assistant accounts, and monitor global read-only reports.",
    icon: ShieldCheck,
    accent: "blue",
    action: "Access Admin Portal",
    to: "/login?role=Admin",
    points: [
      "Create, archive and restore laboratories",
      "Direct Lab Assistant account creation",
      "Automatic credentials dispatch via email",
      "Calibrated and damaged equipment reports",
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
      "Strict lab-isolated inventory control",
      "Generate and print high-res QR codes",
      "Optional calibration scheduling",
      "Receive real-time fault email notifications",
    ],
  },
  {
    title: "Student",
    subtitle: "Fault Reporting & Dashboard",
    description:
      "Scan equipment QR codes to report faults with photographs. Automatically receive login credentials and track all your tickets.",
    icon: GraduationCap,
    accent: "violet",
    action: "Login as Student",
    to: "/login?role=Student",
    points: [
      "Instant QR scan fault submission",
      "Damage photo attachment",
      "Personal Student Dashboard access",
      "Automated email updates on ticket progress",
    ],
  },
];

const faqs = [
  {
    question: "How do I use this application to report a damaged lab instrument?",
    answer:
      "Simply point your smartphone camera or Google Lens at the physical QR code sticker on the laboratory instrument. The QR code opens the equipment's public view page. Click 'Report Fault / Damage', fill in your student details, describe the malfunction, attach a photograph, and submit. The assigned Lab Assistant is instantly alerted via automated email.",
  },
  {
    question: "How does Student Login work?",
    answer:
      "When you submit your first fault report, the system automatically creates a Student account for you and emails your login credentials (your Student Roll Number and a secure temporary password). You can then click 'Login' on the top navigation, switch to 'Student Login', enter your Roll Number and password, and access your dedicated dashboard to track all your submitted tickets.",
  },
  {
    question: "What functionality is available to Lab Assistants?",
    answer:
      "Lab Assistants have strict laboratory-isolated access. Once assigned to a lab (e.g., Chemistry Lab 1), they can register equipment (with optional calibration requirements), generate and print QR codes, maintain immutable calibration logs, and manage the fault ticket queue (transitioning status from Open to Under Review, In Repair, or Resolved).",
  },
  {
    question: "How does ticket tracking work?",
    answer:
      "Students can log into their Student Dashboard to view the live status, submission dates, photos, and resolution notes for all their reported tickets. Whenever a Lab Assistant updates a ticket status, the system automatically dispatches an email notification to the student with the latest progress.",
  },
  {
    question: "What do the different ticket statuses mean?",
    answer:
      "• Open: Ticket has been created and assigned to the lab's assistant.\n• Under Review: The assistant is inspecting the reported issue.\n• In Repair: The instrument is currently being serviced or repaired.\n• Resolved: The fault has been repaired, verified, and closed with notes.\n• Expired: The ticket has lapsed or was superseded by scheduled replacement.",
  },
  {
    question: "How does the Forgot Password feature work?",
    answer:
      "If you forget your password (whether you are an Administrator, Lab Assistant, or Student), click 'Forgot Password?' on the Login page. Enter your registered email address to receive a secure 6-digit OTP code valid for 5 minutes. Enter the OTP to verify your identity, then create and confirm your new password.",
  },
];

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lp-container">
      {/* Background Decor */}
      <div className="lp-ambient-light" />
      <div className="lp-grid-overlay" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.08] bg-[#070d1d]/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="lp-logo">
                <FlaskConical size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                  Lab<span className="text-cyan-400">Track</span>
                </h1>
                <p className="text-[10px] text-slate-400 tracking-wider font-semibold">
                  DIGITAL LAB MANAGEMENT
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
              <a className="lp-nav-link" href="#faqs">
                FAQ
              </a>
            </nav>

            {/* Header Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-500/25"
              >
                Login
                <ArrowRight size={15} />
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
              <a href="#faqs" onClick={closeMenu}>FAQ</a>

              <Link
                to="/login"
                onClick={closeMenu}
                className="text-center py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold"
              >
                Login
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section
          id="overview"
          className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-24"
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-14">
            <div className="lp-reveal">
              <div className="lp-badge">
                <Sparkles size={14} className="text-cyan-400" />
                Modern Laboratory Operations
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-6 leading-tight">
                Digital Lab Equipment
                <span className="lp-gradient-text block">
                  Fault & Calibration Tracking
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 mt-6 leading-8 max-w-xl">
                A unified platform connecting Administrators, Lab Assistants,
                and Students. Scan physical QR labels with any smartphone to
                report faulty hardware, receive real-time email updates, and
                maintain complete audit compliance.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="lp-primary-button"
                >
                  Sign In to Portal
                  <ArrowRight size={17} />
                </Link>

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
                  "Automated Email Alerts",
                  "Student Ticket Dashboard",
                  "QR-Based Identification",
                  "Strict Lab Isolation",
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

            {/* Hero Visual Card */}
            <div className="lp-reveal lp-delay-2 relative">
              <div className="lp-dashboard-glow" />

              <div className="lp-preview-card relative rounded-3xl border border-white/10 p-5 sm:p-7 shadow-2xl bg-[#0b1428]/90 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs text-slate-400 font-mono">
                      SYSTEM MONITORING
                    </p>
                    <h3 className="font-semibold text-lg text-white mt-1">
                      Lab Infrastructure
                    </h3>
                  </div>

                  <div className="lp-preview-badge">
                    <Activity size={14} />
                    Active Services
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="lp-preview-tile bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <Layers3 className="text-cyan-400" size={20} />
                      <span className="text-[10px] text-slate-500 font-mono">
                        INVENTORY
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-4">Smart Labs</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Centralized tracking
                    </p>
                  </div>

                  <div className="lp-preview-tile bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <QrCode className="text-blue-400" size={20} />
                      <span className="text-[10px] text-slate-500 font-mono">
                        QR SCAN
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-4">Google Lens</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Instant profile view
                    </p>
                  </div>

                  <div className="lp-preview-tile bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <CalendarClock className="text-violet-400" size={20} />
                      <span className="text-[10px] text-slate-500 font-mono">
                        CALIBRATION
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-4">Automated</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Overdue alerts
                    </p>
                  </div>

                  <div className="lp-preview-tile bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <ClipboardCheck className="text-emerald-400" size={20} />
                      <span className="text-[10px] text-slate-500 font-mono">
                        MAINTENANCE
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-4">Fault Tickets</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Real-time updates
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-cyan-500/[0.06] border border-cyan-400/20 text-xs text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Automated Nodemailer Gmail Integration
                  </span>
                  <span className="text-cyan-400 font-bold font-mono">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="lp-badge mx-auto">Core Capabilities</div>
            <h2 className="text-3xl sm:text-4xl font-bold mt-5 text-white">
              Built for Modern Technical Labs
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-7">
              Streamline laboratory inventory control, calibration audits, and
              fault troubleshooting with integrated role-based security.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="lp-feature-card p-6 rounded-3xl border border-white/10 bg-[#0d172e]/80 backdrop-blur-xl">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-cyan-400 flex items-center justify-center mb-5">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-white text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-6">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="lp-badge mx-auto">Step-by-Step Architecture</div>
            <h2 className="text-3xl sm:text-4xl font-bold mt-5 text-white">
              How the System Operates
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-7">
              A transparent fault tracking and calibration lifecycle from
              hardware registration to student issue reporting and final resolution.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="p-6 rounded-3xl border border-white/10 bg-[#0d172e]/80 backdrop-blur-xl relative">
                  <span className="font-mono text-cyan-400 text-xs font-bold tracking-widest block mb-3">
                    STEP {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="lp-badge mx-auto">Role-Based Access</div>
            <h2 className="text-3xl sm:text-4xl font-bold mt-5 text-white">
              Tailored Portals for Every User
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-7">
              Dedicated interfaces ensure that Administrators, Lab Assistants,
              and Students have the exact tools and security boundaries they need.
            </p>
          </div>

          <div className="mt-14 grid lg:grid-cols-3 gap-7">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.title}
                  className="rounded-3xl border border-white/10 bg-[#0d182e]/90 p-7 flex flex-col justify-between backdrop-blur-xl shadow-xl hover:border-cyan-400/40 transition group"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{portal.title}</h3>
                        <p className="text-xs text-cyan-300 font-medium">
                          {portal.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-6 mb-6">
                      {portal.description}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-white/10 mb-7">
                      {portal.points.map((pt) => (
                        <div key={pt} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={portal.to}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white/[0.05] hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 text-white rounded-xl text-xs font-bold border border-white/10 hover:border-transparent transition shadow-lg"
                  >
                    {portal.action}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section (Accordion) */}
        <section id="faqs" className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="lp-badge mx-auto">
              <HelpCircle size={14} className="text-cyan-400" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mt-5 text-white">
              Questions & Answers
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Everything you need to know about navigating the system, reporting
              faults, tracking ticket status, and password management.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-white hover:text-cyan-400 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.06] whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
          <div className="rounded-3xl p-8 sm:p-12 border border-white/10 bg-gradient-to-r from-blue-900/30 via-[#0d1a38]/80 to-cyan-900/30 backdrop-blur-xl text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto relative z-10 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 mx-auto flex items-center justify-center">
                <MessageSquareHeart size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Help Us Improve the Platform
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                Your feedback drives new laboratory features, mobile scanning
                optimizations, and faster repair turnaround. We appreciate your
                thoughts and suggestions.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => alert("Feedback portal URL will be linked here soon. Thank you for your support!")}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl text-sm font-bold shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <MessageSquareHeart size={18} />
                  Share Your Feedback
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
          <div className="lp-final-cta rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="lp-cta-icon mx-auto">
                <Activity size={25} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mt-7 text-white">
                Better Visibility.
                <span className="lp-gradient-text">
                  {" "}Better Maintenance.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-7 mt-5">
                Sign in to manage laboratory inventory, maintain equipment
                calibrations, or review your student fault tickets.
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Link to="/login" className="lp-primary-button">
                  Sign In to System
                  <ArrowRight size={17} />
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
                  <h3 className="font-bold text-white">
                    Lab<span className="text-cyan-400">Track</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 tracking-wider font-semibold">
                    LABORATORY MANAGEMENT
                  </p>
                </div>
              </Link>
              <p className="text-sm text-slate-400 leading-7 mt-5 max-w-sm">
                A centralized platform for laboratory equipment
                identification, calibration visibility, and digital
                fault management with automated email notifications.
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
                <a className="lp-footer-link block" href="#faqs">FAQ</a>
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
                <Link className="lp-footer-link block" to="/login?role=Student">
                  Student Portal
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
              © {new Date().getFullYear()} Digital Lab Equipment Fault Tracking System.
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
