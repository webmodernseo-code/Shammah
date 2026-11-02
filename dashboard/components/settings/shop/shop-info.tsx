"use client";

import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import FileUploader from "@/components/ui/file-uploader";

export default function ShopInfo() {
  return (
    <div className="bg-white rounded-2xl border border-gray-500/20">
      <h2 className="text-lg font-bold text-light-primary-text  border-gray-500/20 px-6 py-6">
        Shop Information
      </h2>
      <div className="px-6 pb-6 space-y-6">
        {/* Upload Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FileUploader
            title="Shop Cover Image"
            description="Allowed *.jpeg, *.jpg, *.png, *.gif Max size of 3.1 MB"
          />
          <FileUploader
            title="Shop Logo"
            description="Allowed *.jpeg, *.jpg, *.png, *.gif Max size of 3.1 MB"
          />
        </div>

        {/* Shop Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FloatingInput label="Shop Name" />
          <FloatingInput label="Shop Slug" />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FloatingInput label="Phone Number" />
          <FloatingInput label="Email Address" />
        </div>

        {/* County & State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FloatingInput label="County" />
          <FloatingInput label="State" />
        </div>

        {/* City & ZIP Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FloatingInput label="City" />
          <FloatingInput label="ZIP Code" />
        </div>

        {/* Shop Description */}
        <FloatingTextarea label="Shop Description" className="h-32" />
      </div>
    </div>
  );
}
