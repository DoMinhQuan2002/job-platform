"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

interface JobSkillsCollapseProps {
  skills: string[];
  className?: string;
  tagClassName?: string;
  badgeClassName?: string;
}

export function JobSkillsCollapse({
  skills,
  className = "flex items-center gap-2 overflow-hidden min-w-0 flex-nowrap",
  tagClassName = "rounded-md bg-slate-100 px-2 py-1 text-[9px] text-muted whitespace-nowrap shrink-0",
  badgeClassName = "rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold text-muted whitespace-nowrap shrink-0 hover:bg-slate-200 hover:text-slate-800 active:scale-95 transition-all duration-150 cursor-pointer select-none",
}: JobSkillsCollapseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(skills.length);
  const [isMeasured, setIsMeasured] = useState(false);
  const componentId = useId();

  useEffect(() => {
    const container = containerRef.current;
    const measurer = measurerRef.current;
    if (!container || !measurer || skills.length === 0) return;

    const calculateVisibleCount = () => {
      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      const tagElements = measurer.querySelectorAll<HTMLElement>(
        `[data-skill-item="${componentId}"]`
      );
      const badgeElement = measurer.querySelector<HTMLElement>(
        `[data-skill-badge="${componentId}"]`
      );

      if (tagElements.length === 0) return;

      const tagWidths: number[] = Array.from(tagElements).map(
        (el) => el.offsetWidth
      );
      const badgeWidth = badgeElement ? badgeElement.offsetWidth : 28;
      const gap = 8; // gap-2 in Tailwind = 8px

      let accumulatedWidth = 0;
      let count = 0;

      for (let i = 0; i < tagWidths.length; i++) {
        const itemWidth = tagWidths[i];
        const widthIfLast =
          accumulatedWidth + (i > 0 ? gap : 0) + itemWidth;

        // If this is the last skill and it fits without badge
        if (i === tagWidths.length - 1) {
          if (widthIfLast <= containerWidth) {
            count = tagWidths.length;
            break;
          }
        }

        // If there are more skills after this one, we must fit current skill + badge
        const widthWithBadge = widthIfLast + gap + badgeWidth;

        if (widthWithBadge <= containerWidth) {
          count = i + 1;
          accumulatedWidth = widthIfLast;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, count));
      setIsMeasured(true);
    };

    calculateVisibleCount();

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleCount();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [skills, componentId]);

  if (!skills || skills.length === 0) return null;

  const visibleSkills = isMeasured
    ? skills.slice(0, visibleCount)
    : skills.slice(0, 3);
  const hiddenSkills = isMeasured
    ? skills.slice(visibleCount)
    : skills.slice(3);
  const hiddenCount = hiddenSkills.length;

  return (
    <>
      {/* Offscreen hidden measurer to compute exact pixel widths with real styles */}
      <div
        ref={measurerRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] -top-[9999px] flex items-center gap-2 visibility-hidden"
        style={{ visibility: "hidden" }}
      >
        {skills.map((skill, idx) => (
          <span
            key={`measurer-${idx}-${skill}`}
            data-skill-item={componentId}
            className={tagClassName}
          >
            {skill}
          </span>
        ))}
        <span data-skill-badge={componentId} className={badgeClassName}>
          +{skills.length}
        </span>
      </div>

      {/* Main Visible Container */}
      <div ref={containerRef} className={className}>
        {visibleSkills.map((skill, idx) => (
          <span key={`skill-${idx}-${skill}`} className={tagClassName}>
            {skill}
          </span>
        ))}

        {hiddenCount > 0 && (
          <HoverCard>
            <HoverCardTrigger
              delay={0}
              closeDelay={50}
              className={badgeClassName}
              onClick={(e) => e.stopPropagation()}
              aria-label={`${hiddenCount} kỹ năng khác: ${hiddenSkills.join(", ")}`}
            >
              +{hiddenCount}
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="start"
              sideOffset={6}
              className="z-50 flex max-w-[280px] flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-md"
            >
              {hiddenSkills.map((skill, idx) => (
                <span
                  key={`hidden-${idx}-${skill}`}
                  className={tagClassName}
                >
                  {skill}
                </span>
              ))}
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
    </>
  );
}
