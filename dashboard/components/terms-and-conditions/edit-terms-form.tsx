"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import StatusSelect, { Option } from "@/components/ui/status-select";

const statusOptions: Option[] = [
  { value: 1, label: "Published" },
  { value: 2, label: "Draft" },
];

const languageOptions = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
];

export default function EditTermsForm() {
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [language, setLanguage] = useState("english");

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center justify-between">
        <PageHeader
          title="Edit Terms & Conditions"
          backHref="/terms-and-conditions"
          className="gap-4"
        />
        <div className="w-32">
          <StatusSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="rounded-2xl p-4 sm:p-6 border border-gray-500/20">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingInput label="Title" defaultValue="Title" />
              <FloatingInput label="Short Order" defaultValue="2" />
              <CustomFloatingSelect
                label="Language"
                options={languageOptions}
                value={language}
                onChange={setLanguage}
              />
              <div className=" col-span-full">
                <FloatingTextarea label="Details" className="h-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button variant="primary" size="sm">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
