"use client";

import React from "react";
import Image from "next/image";
import { Mail01Icon, PhoneIcon, MapMarkerIcon } from "@/icons";

export default function OrderInformation() {
  return (
    <div className="border border-gray-500/20 rounded-2xl w-full">
      <h3 className="text-lg sm:text-xl font-bold text-light-primary-text py-4 px-6 border-b border-gray-500/20  ">
        Customer Information
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4  sm:gap-6 p-4 sm:p-6">
        <div className="size-20 sm:size-25 ring-2 ring-white rounded-lg relative overflow-hidden shrink-0">
          <Image
            src="/images/user/user_10.png"
            fill
            className="object-cover rounded-lg"
            alt="Customer Avatar"
          />
        </div>

        {/* Details */}
        <div className="flex-1">
          <h4 className="text-xl font-bold text-light-primary-text mb-3">
            Jenny Wilson
          </h4>

          <div className="flex flex-wrap gap-y-2 gap-x-5">
            <div className="flex items-center gap-2 text-light-primary-text">
              <Mail01Icon className="size-4 shrink-0" />
              <span className="text-sm">jackson.graham@example.com</span>
            </div>
            <div className="flex items-center gap-2 text-light-primary-text">
              <PhoneIcon className="size-4 shrink-0" />
              <span className="text-sm">(405) 555-0128</span>
            </div>
            <div className="flex items-center gap-2 text-light-primary-text">
              <MapMarkerIcon className="size-4 shrink-0" />
              <span className="text-sm">
                3517 W. Gray St. Utica, Pennsylvania 57867
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
