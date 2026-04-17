"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { EntryModal } from "@/components/forge/EntryModal";
import { Sword } from "lucide-react";

export function ClientActions({ challengeId, status }: { challengeId: string; status: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canEnter = status === "live";

  return (
    <>
      <Button 
        size="lg" 
        onClick={() => setIsModalOpen(true)}
        disabled={!canEnter}
        className={canEnter ? "btn-glow" : ""}
      >
        <Sword className="w-5 h-5 mr-2" />
        {canEnter ? "Enter The Forge" : "Submissions Closed"}
      </Button>

      <EntryModal 
        challengeId={challengeId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
