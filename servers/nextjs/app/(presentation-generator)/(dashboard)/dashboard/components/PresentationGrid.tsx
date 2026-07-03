import React from "react";
import { PresentationCard } from "./PresentationCard";
import { PresentationResponse } from "@/app/(presentation-generator)/services/api/dashboard";
import { EmptyState } from "./EmptyState";

interface PresentationGridProps {
  presentations: PresentationResponse[];
  isLoading?: boolean;
  error?: string | null;
  onPresentationDeleted?: (presentationId: string) => void;
}

export const PresentationGrid = ({
  presentations,
  isLoading = false,
  error = null,
  onPresentationDeleted,
}: PresentationGridProps) => {
  const ShimmerCard = () => (
    <div className="aippt-soft-card flex min-h-[286px] animate-pulse flex-col overflow-hidden rounded-[24px]">
      <div className="relative flex-1 overflow-hidden bg-slate-100 p-4">
        <div className="mx-auto aspect-video w-full rounded-2xl border border-slate-200 bg-slate-200" />
      </div>
      <div className="border-t border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {[...Array(12)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="aippt-soft-card flex min-h-[220px] items-center justify-center rounded-[24px]">
        <div className="text-center text-gray-500">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!presentations || presentations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {presentations.map((presentation) => (
        <PresentationCard
          key={presentation.id}
          id={presentation.id}
          title={presentation.title}
          presentation={presentation}
          onDeleted={onPresentationDeleted}
        />
      ))}
    </div>
  );
};
