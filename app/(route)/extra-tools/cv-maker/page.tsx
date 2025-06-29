"use client";

import React, { useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import ToolWrapper from "@/components/shared/tool-wrapper";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import PersonalInfoForm from "@/components/layout/forms/PersonalInfoForm";
import SummaryForm from "@/components/layout/forms/SummaryForm";
import WorkExperienceForm from "@/components/layout/forms/WorkExperienceForm";
import SkillsForm from "@/components/layout/forms/SkillsForm";
import EducationForm from "@/components/layout/forms/EducationForm";

import ResumePreviewSection from "@/components/layout/ResumePreview";

import { ResumeValues } from "@/lib/cv-validation";
import { useReactToPrint } from "react-to-print";

export default function CvMakerPage() {
  const [resumeData, setResumeData] = useState<ResumeValues>({
    title: "",
    description: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    photo: null,
    summary: "",
    workExperiences: [],
    skills: [],
    educations: [],
    colorHex: "#000000",
    borderStyle: "rounded",
  });

  const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
      contentRef,
      documentTitle: resumeData.firstName + "_" + resumeData.lastName || "Resume",
    });

  return (
    <div className="container py-6 md:py-8 relative">
      <PageHeader title="CV Maker" description="Build your resume with ease" />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Preview & Export - now takes up 3 columns */}
        <div className="lg:col-span-3 space-y-6 order-1 lg:order-none">
          <ToolWrapper title="CV Preview">
            <div className="space-y-4">
              <ResumePreviewSection
                resumeData={resumeData}
                setResumeData={setResumeData}
                previewRef={contentRef}
              />
              <div className="flex justify-between">
                <Button onClick={reactToPrintFn}>Download PDF</Button>
              </div>
            </div>
          </ToolWrapper>
        </div>

        {/* Forms Editor - now takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-none max-h-[150vh] overflow-y-auto pr-2">
          <PersonalInfoForm resumeData={resumeData} setResumeData={setResumeData} />
          <SummaryForm resumeData={resumeData} setResumeData={setResumeData} />
          <WorkExperienceForm resumeData={resumeData} setResumeData={setResumeData} />
          <SkillsForm resumeData={resumeData} setResumeData={setResumeData} />
          <EducationForm resumeData={resumeData} setResumeData={setResumeData} />
        </div>
      </div>
    </div>
  );
}
