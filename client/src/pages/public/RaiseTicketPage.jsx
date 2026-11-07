import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Wrench,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Clock
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
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full">
        <Link
          to={`/equipment/${publicId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment View
        </Link>

        {submittedTicket ? (
          /* Confirmation Screen */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">Fault Ticket Submitted!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your report has been dispatched directly to the lab technician. Please save your Ticket Reference ID below for tracking:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                  Ticket Reference ID
                </span>
                <span className="font-mono text-base font-bold text-blue-600">
                  {submittedTicket.ticketId}
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="pt-3 space-y-2">
              <Link
                to={`/track-ticket?ticketId=${submittedTicket.ticketId}&rollNumber=${rollNumber}`}
                className="w-full inline-block py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20"
              >
                Track Repair Progress
              </Link>
              <Link
                to="/"
                className="w-full inline-block py-2 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Ticket Submission Form */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Report Broken Equipment</h2>
                <p className="text-xs text-slate-500">
                  {equipment ? `${equipment.name} (${equipment.labName})` : 'Loading...'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohit Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2315001383"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe What Happened / Damage Details
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Channel 1 probe jack is loose and displaying noise artifacts. Screen flickers on power-up."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Damage Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photograph of Damaged Equipment (Required)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer relative">
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
                        className="w-32 h-32 object-cover mx-auto rounded-lg border border-slate-200"
                      />
                      <span className="text-[11px] text-blue-600 font-semibold block">
                        Change Photo
                      </span>
                    </div>
                  ) : (
                    <div className="py-3">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-slate-700 block">
                        Tap to Snap Photo with Camera
                      </span>
                      <span className="text-[10px] text-slate-400">or upload from device gallery</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-600/20 disabled:opacity-50 mt-4"
              >
                {submitting ? 'Submitting Report...' : 'Submit Fault Ticket'}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-4 mt-8">
        Local Lab Equipment Calibration & Fault Tracking System
      </footer>
    </div>
  );
};

export default RaiseTicketPage;
