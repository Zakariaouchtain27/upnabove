"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft, Lock, DollarSign, Link2, Clock, FileText,
  CheckCircle2, Loader2, ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

const PLATFORM_FEE_RATE = 0.05;

const DEADLINES = [
  { label: "24 Hours", value: "24h" },
  { label: "3 Days",   value: "3d"  },
  { label: "1 Week",   value: "7d"  },
];

const schema = z.object({
  title:       z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please describe the bounty in more detail"),
  ref_url:     z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
  deadline:    z.enum(["24h", "3d", "7d"], { required_error: "Please select a deadline" }),
  amount:      z.number({ invalid_type_error: "Enter a number" }).min(10, "Minimum bounty is $10"),
});

type FormData = z.infer<typeof schema>;

function deadlineToDate(value: string): string {
  const d = new Date();
  if (value === "24h") d.setHours(d.getHours() + 24);
  else if (value === "3d") d.setDate(d.getDate() + 3);
  else d.setDate(d.getDate() + 7);
  return d.toISOString();
}

export default function NewBountyPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", ref_url: "", deadline: "3d", amount: undefined },
  });

  const amount = watch("amount") ?? 0;
  const fee = amount > 0 ? +(amount * PLATFORM_FEE_RATE).toFixed(2) : 0;
  const total = amount > 0 ? +(amount + fee).toFixed(2) : 0;

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { addToast("You must be signed in", "error"); return; }

      const { data: employer } = await supabase
        .from("employers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!employer) { addToast("Employer profile not found", "error"); return; }

      const { data: challenge, error } = await supabase
        .from("forge_challenges")
        .insert({
          employer_id:    employer.id,
          title:          data.title,
          description:    data.description,
          purpose:        "bounty",
          bounty_amount:  data.amount,
          platform_fee:   fee,
          escrow_status:  "pending",
          challenge_type: "bounty",
          difficulty:     "mid",
          prize_value:    data.amount,
          prize_type:     "Cash",
          time_limit_minutes: data.deadline === "24h" ? 1440 : data.deadline === "3d" ? 4320 : 10080,
          expires_at:     deadlineToDate(data.deadline),
          status:         "live",
        })
        .select("id")
        .single();

      if (error) throw error;

      addToast("Bounty launched! Awaiting escrow funding.", "success");
      router.push(`/employer/forge/${challenge.id}`);
    } catch {
      addToast("Failed to launch bounty. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 md:px-8">

      {/* Back link */}
      <Link
        href="/employer"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Page header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Bounty Board</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100 mb-2">
          Post a Bounty
        </h1>
        <p className="text-zinc-500 text-sm">
          Describe the task, set a reward, and funds are held in escrow until you approve the work.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── LEFT COLUMN — Form ────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Title */}
            <Field label="Bounty Title" icon={<FileText className="w-3.5 h-3.5" />} error={errors.title?.message}>
              <input
                {...register("title")}
                placeholder="e.g. Fix authentication bug in Next.js app"
                className={inputCls(!!errors.title)}
              />
            </Field>

            {/* Description */}
            <Field label="Description" icon={<FileText className="w-3.5 h-3.5" />} error={errors.description?.message}>
              <textarea
                {...register("description")}
                rows={6}
                placeholder="Describe the task in detail — what needs to be done, what success looks like, and any technical context."
                className={`${inputCls(!!errors.description)} resize-none`}
              />
            </Field>

            {/* Reference link */}
            <Field
              label="GitHub Issue / Reference Link"
              icon={<Link2 className="w-3.5 h-3.5" />}
              hint="Optional"
              error={errors.ref_url?.message}
            >
              <input
                {...register("ref_url")}
                placeholder="https://github.com/org/repo/issues/123"
                className={inputCls(!!errors.ref_url)}
              />
            </Field>

            {/* Deadline */}
            <Field label="Deadline" icon={<Clock className="w-3.5 h-3.5" />} error={errors.deadline?.message}>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-3">
                    {DEADLINES.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => field.onChange(d.value)}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                          field.value === d.value
                            ? "border-emerald-500/50 bg-emerald-500/12 text-emerald-300 shadow-[0_0_20px_-6px_rgba(16,185,129,0.4)]"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

            {/* Reward Amount */}
            <Field label="Reward Amount" icon={<DollarSign className="w-3.5 h-3.5" />} error={errors.amount?.message}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-lg">$</span>
                <input
                  type="number"
                  min={10}
                  step="1"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="500"
                  className={`${inputCls(!!errors.amount)} pl-9 text-lg font-black text-emerald-300 placeholder:text-zinc-700`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-mono">USD</span>
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">Minimum $10 · Funds held in escrow until you approve.</p>
            </Field>
          </div>

          {/* ── RIGHT COLUMN — Receipt ────────────────────────────── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_-20px_rgba(16,185,129,0.2)]">

              {/* Receipt header */}
              <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Checkout Receipt</span>
                </div>
                <p className="text-[11px] text-zinc-500">Calculated live · nothing charged yet</p>
              </div>

              {/* Line items */}
              <div className="px-6 py-5 space-y-3">
                <LineItem
                  label="Base Bounty"
                  value={amount > 0 ? `$${amount.toLocaleString()}` : "—"}
                  muted={amount <= 0}
                />
                <LineItem
                  label="Platform Escrow Fee (5%)"
                  value={fee > 0 ? `$${fee.toLocaleString()}` : "—"}
                  muted={fee <= 0}
                  sub
                />

                <div className="h-px bg-zinc-800 my-1" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-zinc-100">Total Due Today</span>
                  <span className={`text-2xl font-black tabular-nums ${total > 0 ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "text-zinc-700"}`}>
                    {total > 0 ? `$${total.toLocaleString()}` : "$0"}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-700/60 hover:-translate-y-px flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Launching…</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Fund &amp; Launch Bounty</>
                  )}
                </button>

                {/* Security badge */}
                <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <Lock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Funds are held securely in <span className="text-zinc-400 font-semibold">Escrow</span> until you review and approve the submitted work.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

function Field({
  label, icon, hint, error, children,
}: {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
          {icon}
          {label}
        </label>
        {hint && <span className="text-[10px] text-zinc-600 font-mono">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-[11px] text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}

function LineItem({ label, value, muted = false, sub = false }: {
  label: string; value: string; muted?: boolean; sub?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${sub ? "text-zinc-600" : "text-zinc-400"}`}>{label}</span>
      <span className={`text-sm font-bold tabular-nums ${muted ? "text-zinc-700" : sub ? "text-zinc-400" : "text-zinc-200"}`}>
        {value}
      </span>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-3 rounded-xl bg-zinc-900 border ${
    hasError ? "border-red-500/50 focus:border-red-500" : "border-zinc-800 focus:border-emerald-500/50"
  } text-zinc-100 placeholder:text-zinc-700 text-sm outline-none transition-colors focus:ring-1 focus:ring-emerald-500/20`;
}
