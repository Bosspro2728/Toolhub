import { CvPreview } from "@/components/layout/CvPreview";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/cv-validation";
import BorderStyleButton from "@/components/shared/BorderStyleButton";
import ColorPicker from "@/components/shared/ColorPicker";

interface ResumePreviewSectionProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
  className?: string;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ResumePreviewSection({
  resumeData,
  setResumeData,
  className,
  previewRef
}: ResumePreviewSectionProps) {
  return (
    <div
      className={cn(
        "group relative w-full flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="absolute left-2 top-2 flex flex-col gap-3 opacity-60 transition-opacity group-hover:opacity-100 z-10">
        <ColorPicker
          color={resumeData.colorHex}
          onChange={(color: any) =>
            setResumeData({ ...resumeData, colorHex: color.hex })
          }
        />
        <BorderStyleButton
          borderStyle={resumeData.borderStyle}
          onChange={(borderStyle) =>
            setResumeData({ ...resumeData, borderStyle })
          }
        />
      </div>
      <div className="flex w-full justify-center">
        <div
          className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-2xl w-full min-h-[800px] flex items-center justify-center transition-all duration-300 hover:shadow-2xl"
        >
            <CvPreview contentRef={previewRef} resumeData={resumeData} className="w-full" />
        </div>
      </div>
    </div>
  );
}