"use client";

import { useState } from "react";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { DataBadge } from "@/components/viz/DataBadge";
import { facetNames, facetDescriptions, facetsByDomain } from "@/data/facet-names";
import type { BigFiveFacets } from "@/lib/tests/bigfive";

interface FacetsDisplayProps {
  facets: BigFiveFacets;
  domain: "neuroticism" | "extraversion" | "openness" | "agreeableness" | "conscientiousness";
  domainName: string;
  color: "blue" | "pink" | "green" | "orange" | "black";
}

export function FacetsDisplay({ facets, domain, domainName, color }: FacetsDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const domainFacets = facetsByDomain[domain];

  // ファセットスコアを0-100パーセンテージに変換 (4-20 → 0-100)
  const toPercentage = (score: number) => ((score - 4) / 16) * 100;

  return (
    <div className="card-brutal p-6 bg-brutal-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display text-brutal-black">
            {domainName}の詳細 (6ファセット)
          </h3>
          <div className="flex items-center gap-3">
            <DataBadge color={color}>
              {expanded ? "隠す" : "表示"}
            </DataBadge>
            <span className="text-2xl">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-6 space-y-4 animate-slide-in-up">
          {domainFacets.map((facetKey) => {
            const score = facets[facetKey];
            const percentage = toPercentage(score);

            return (
              <div key={facetKey} className="border-l-4 border-brutal-black pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-brutal-black">
                      {facetNames[facetKey]}
                    </h4>
                    <p className="text-sm text-brutal-gray-800">
                      {facetDescriptions[facetKey]}
                    </p>
                  </div>
                  <DataBadge color={color} size="sm">
                    {score} / 20
                  </DataBadge>
                </div>

                <BrutalProgressBar
                  value={percentage}
                  color={color}
                  label=""
                  height="sm"
                />

                <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-1">
                  <span>低 (4-8)</span>
                  <span>中 (9-15)</span>
                  <span>高 (16-20)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
