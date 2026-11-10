import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Wrench,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Sparkles
} from 'lucide-react';

const RaiseTicketPage = () => {
  const { publicId } = useParams();

  // Equipment info state
  const [equipment, setEquipment] = useState(null);
  const [loadingEq, setLoadingEq] = useState(true);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/public/${publicId}`);
        setEquipment(res.data.data);
      } catch (err) {
        setError('Equipment details could not be retrieved.');
      } finally {
        setLoadingEq(false);
      }
    };
    fetchEquipment();
  }, [publicId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return setError('Please select an image file (JPEG, PNG, WebP)');
      }
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!photo) {
      return setError('Please upload or take a photograph of the damaged instrument.');
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('publicId', publicId);
      formData.append('studentName', studentName);
      formData.append('rollNumber', rollNumber);
      formData.append('mobile', mobile);
      if (email) formData.append('email', email);
      formData.append('description', description);
      formData.append('photo', photo);

      const res = await api.post('/tickets/public', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmittedTicket(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit fault ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (submittedTicket?.ticketId) {
      navigator.clipboard.writeText(submittedTicket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F20] text-white py-10 px-4 flex flex-col justify-between relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-rose-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        <Link
          to={`/equipment/${publicId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 mb-5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment View
        </Link>

        {submittedTicket ? (
          /* Confirmation Screen */
          <div className="bg-[#0f1d38]/90 border border-white/15 rounded-3xl p-7 shadow-2xl backdrop-blur-xl text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-extrabold text-white">Fault Ticket Submitted!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your report has been dispatched to the lab technician. Please copy and save your Ticket Reference ID for tracking:
            </p>

            <div className="p-4 bg-[#081124] rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  Ticket Reference ID
                </span>
                <span className="font-mono text-base font-bold text-cyan-400">
                  {submittedTicket.ticketId}
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="px-3 py-1.5 bg-white/10 border border-white/15 hover:bg-white/15 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                to={`/track-ticket?ticketId=${submittedTicket.ticketId}&rollNumber=${rollNumber}`}
                className="w-full inline-block py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
              >
                Track Repair Progress
              </Link>
              <Link
                to="/"
                className="w-full inline-block py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Ticket Submission Form */
          <div className="bg-[#0f1d38]/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Report Broken Equipment</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {equipment ? `${equipment.name} (${equipment.labName})` : 'Loading equipment details...'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohit Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2315001383"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Describe Fault / Damage
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Channel 1 probe jack is loose and displaying noise artifacts. Screen flickers on power-up."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                ></textarea>
              </div>

              {/* Damage Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Photograph of Damaged Equipment (Required)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-4 text-center bg-[#081124] hover:bg-white/[0.04] transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Damage preview"
                        className="w-32 h-32 object-cover mx-auto rounded-xl border border-white/15 shadow"
                      />
                      <span className="text-xs text-cyan-400 font-bold block">
                        Change Photo
                      </span>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Camera className="w-8 h-8 text-cyan-400 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-white block">
                        Tap to Snap Photo with Camera
                      </span>
                      <span className="text-[11px] text-slate-400">or upload from device gallery</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-600/30 disabled:opacity-50 mt-4"
              >
                {submitting ? 'Submitting Report...' : 'Submit Fault Ticket'}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-slate-500 py-4 mt-8 relative z-10">
        Local Lab Equipment Calibration & Fault Tracking System • Group G137
      </footer>
    </div>
  );
};

export default RaiseTicketPage;
