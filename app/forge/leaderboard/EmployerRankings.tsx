"use client";

import React, { useMemo } from "react";
import { Briefcase, Building2 } from "lucide-react";

export function EmployerRankings({ rawEntries }: { rawEntries: any[] }) {
  
  const employerRankings = useMemo(() => {
     const counts = new Map<string, { id: string, name: string, entryCount: number }>();

     rawEntries.forEach(entry => {
        const empId = entry.forge_challenges?.employer_id;
        const empName = entry.forge_challenges?.employers?.company_name;

        if (empId && empName) {
           if (!counts.has(empId)) {
              counts.set(empId, { id: empId, name: empName, entryCount: 0 });
           }
           counts.get(empId)!.entryCount += 1;
        }
     });

     return Array.from(counts.values())
        .sort((a, b) => b.entryCount - a.entryCount)
        .slice(0, 5); // top 5
  }, [rawEntries]);

  if (employerRankings.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
         <Building2 className="w-5 h-5 text-indigo-500" />
         <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">Top Employers</h4>
      </div>

      <div className="space-y-4">
         {employerRankings.map((emp, i) => (
            <div key={emp.id} className="flex items-center justify-between group">
               <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground w-4">{i + 1}.</span>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                     {emp.name}
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <span className="font-mono text-emerald-500 font-bold block">{emp.entryCount}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Entries</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
