// components/layout/CvPreview.tsx
import { BorderStyles } from "@/components/shared/BorderStyleButton";
import useDimensions from "@/hooks/use-dimensions";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/cv-validation";
import { format as formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export function CvPreview({ resumeData, contentRef, className }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className
      )}
      ref={containerRef}
    >
      <div
        id="resumePreviewContent"
        ref={contentRef}
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{ zoom: (1 / 794) * width }}
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
}

function PersonalInfoHeader({ resumeData }: { resumeData: ResumeValues }) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex,
    borderStyle,
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState( typeof photo === "string" ? photo : "" );

  useEffect(() => {
    if (photo instanceof File) {
      const objectUrl = URL.createObjectURL(photo);
      setPhotoSrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Profile photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                ? "9999px"
                : "10%",
            border: `2px solid ${colorHex}`,
          }}
        />
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-3xl font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {[city, country].filter(Boolean).join(", ")}
          {([city, country].filter(Boolean).length && (phone || email)) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: { resumeData: ResumeValues }) {
  const { summary, colorHex } = resumeData;
  if (!summary) return null;
  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Professional Profile
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: { resumeData: ResumeValues }) {
  const { workExperiences, colorHex } = resumeData;
  const items = workExperiences!.filter((e) => Object.values(e).some(Boolean));
  if (!items.length) return null;
  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Work Experience
        </p>
        {items.map((exp, i) => (
          <div key={i} className="break-inside-avoid space-y-1">
            <div
              className="flex justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{exp.position}</span>
              <span>
                {exp.startDate && formatDate(exp.startDate, "MM/yyyy")} -{' '}
                {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : 'Present'}
              </span>
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            <p className="whitespace-pre-line text-xs">{exp.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: { resumeData: ResumeValues }) {
  const { educations, colorHex } = resumeData;
  const items = educations!.filter((e) => Object.values(e).some(Boolean));
  if (!items.length) return null;
  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Education
        </p>
        {items.map((edu, i) => (
          <div key={i} className="break-inside-avoid space-y-1">
            <div
              className="flex justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{edu.degree}</span>
              <span>
                {edu.startDate && formatDate(edu.startDate, "MM/yyyy")}
                {edu.endDate ? ` - ${formatDate(edu.endDate, "MM/yyyy")}` : ''}
              </span>
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsSection({ resumeData }: { resumeData: ResumeValues }) {
  const { skills, colorHex, borderStyle } = resumeData;
  if (!skills!.length) return null;
  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {skills!.map((skill, i) => (
            <Badge
              key={i}
              className="rounded-md text-white"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? '0px'
                    : borderStyle === BorderStyles.CIRCLE
                    ? '9999px'
                    : '8px',
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
