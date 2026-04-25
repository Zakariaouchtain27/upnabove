"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThumbsUp, ThumbsDown, Send, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  body: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  candidates: { first_name: string; last_name: string; avatar_url: string | null } | null;
  myVote?: 1 | -1 | null;
}

interface EntryCommentsProps {
  entryId: string;
  currentUserId?: string;
  entryCodename: string;
}

export function EntryComments({ entryId, currentUserId, entryCodename }: EntryCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('forge_comments')
      .select('id, body, upvotes, downvotes, created_at, candidates(first_name, last_name, avatar_url)')
      .eq('entry_id', entryId)
      .order('upvotes', { ascending: false });

    if (!data) return;

    // Fetch user's own votes if logged in
    let myVotes: Record<string, 1 | -1> = {};
    if (currentUserId && data.length > 0) {
      const commentIds = data.map(c => c.id);
      const { data: voteData } = await supabase
        .from('forge_comment_votes')
        .select('comment_id, vote')
        .eq('candidate_id', currentUserId)
        .in('comment_id', commentIds);
      if (voteData) voteData.forEach(v => { if (v.comment_id) myVotes[v.comment_id] = v.vote as 1 | -1; });
    }

    setComments(data.map(c => ({ ...c, myVote: myVotes[c.id] ?? null })) as unknown as Comment[]);
  };

  useEffect(() => { fetchComments(); }, [entryId, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !currentUserId) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/forge/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, body: body.trim() }),
    });

    if (res.ok) {
      setBody('');
      fetchComments();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to post comment.');
    }
    setSubmitting(false);
  };

  const handleVote = async (commentId: string, vote: 1 | -1, current: 1 | -1 | null) => {
    if (!currentUserId) return;
    const action = current === vote ? 'remove' : vote === 1 ? 'up' : 'down';

    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      let { upvotes, downvotes, myVote } = c;
      if (current === 1) upvotes--;
      if (current === -1) downvotes--;
      if (action !== 'remove') { if (vote === 1) upvotes++; else downvotes++; }
      return { ...c, upvotes, downvotes, myVote: action === 'remove' ? null : vote };
    }));

    await fetch('/api/forge/comment-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, vote: action === 'remove' ? 0 : vote }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold uppercase tracking-widest text-sm text-gray-900 dark:text-zinc-900 dark:text-white">
          Feedback for {entryCodename}
        </h3>
        <span className="text-xs text-muted-foreground font-mono">({comments.length})</span>
      </div>

      {/* Comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Leave feedback on this entry..."
            maxLength={1000}
            rows={3}
            className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl resize-none focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <span className="text-xs text-muted-foreground font-mono">{body.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-primary/90"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground italic">Sign in to leave feedback.</p>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        <AnimatePresence>
          {comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="p-4 bg-surface border border-border rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {comment.candidates?.first_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {comment.candidates ? `${comment.candidates.first_name} ${comment.candidates.last_name}` : 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">{comment.body}</p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleVote(comment.id, 1, comment.myVote ?? null)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${comment.myVote === 1 ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500'}`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {comment.upvotes}
                </button>
                <button
                  onClick={() => handleVote(comment.id, -1, comment.myVote ?? null)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${comment.myVote === -1 ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {comment.downvotes}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 font-mono">No feedback yet. Be the first.</p>
        )}
      </div>
    </div>
  );
}
