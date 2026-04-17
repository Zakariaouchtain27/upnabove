"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CalendarPlus } from "lucide-react";

interface HireFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  entryId: string;
  challengeId: string;
  onSuccess: () => void;
}

export function HireFlowModal({
  isOpen,
  onClose,
  candidateName,
  entryId,
  challengeId,
  onSuccess
}: HireFlowModalProps) {
  const [message, setMessage] = useState("Your entry was outstanding. We’d love to speak with you about joining the team!");
  const [proposedTimes, setProposedTimes] = useState("E.g., Thursday 2pm - 5pm EST\nFriday 10am - 12pm EST");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/forge/hire/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, challengeId, message, proposedTimes }),
      });

      if (!res.ok) {
        throw new Error("Failed to send invite");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="bg-[#0a0a0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 pointer-events-auto shadow-2xl shadow-violet-900/20 flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-violet-500/20 p-3 rounded-xl border border-violet-500/30">
                   <CalendarPlus className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Interview Invite</h2>
                   <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400 mt-1">To: {candidateName}</p>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-zinc-600 dark:text-zinc-400 mb-2">Custom Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-zinc-600 dark:text-zinc-400 mb-2">Proposed Times & Next Steps</label>
                  <textarea
                    value={proposedTimes}
                    onChange={(e) => setProposedTimes(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800/50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
