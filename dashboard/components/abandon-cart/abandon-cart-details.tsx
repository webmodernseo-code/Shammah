"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

import { Mail01Icon, PhoneIcon, MapMarkerIcon } from "@/icons";
import AbandonCartDetailsTable from "./abandon-cart-details-table";

export default function AbandonCartDetails() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <PageHeader
          title="Abandoned cart Details"
          backHref="/abandon-cart"
          className="gap-4"
        />
      </div>

      {/* Customer Info Card */}
      <div className="bg-accent-7/60 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10 w-full">
          {/* Avatar Placeholder */}
          <div className="size-16 sm:size-20 lg:w-25 lg:h-25 border-3 border-white rounded-lg relative overflow-hidden shrink-0">
            <Image
              src="/images/user/user_05.png"
              alt="Profile"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-lg font-bold text-light-primary-text">
              Jenny Wilson
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-light-primary-text w-full">
              <div className="flex items-center gap-2">
                <Mail01Icon className="w-4 h-4" />
                <span>jackson.graham@example.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>(405) 555-0128</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <MapMarkerIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  3517 W. Gray St. Utica, Pennsylvania 57867
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection and Table */}
      <AbandonCartDetailsTable />

      {/* Order Summary */}
      <div className="border border-gray-500/20 rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg font-bold text-light-primary-text mb-4">
          Order Summary
        </h3>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-base ">
            <span className="text-light-secondary-text">Sub-Total</span>
            <span className=" font-medium text-light-primary-text">$20.00</span>
          </div>
          <div className="flex justify-between text-base ">
            <span className="text-light-secondary-text">VAT (40%)</span>
            <span className="text-light-primary-text font-medium">$4.00</span>
          </div>
          <div className="flex justify-between text-base ">
            <span className="text-light-secondary-text">Discount</span>
            <span className="text-light-primary-text font-medium">-$4.00</span>
          </div>
          <div className="flex justify-between text-base ">
            <span className="text-light-secondary-text">Shipment</span>
            <span className="text-light-primary-text font-medium">$0.00</span>
          </div>
          <div className="flex justify-between text-base ">
            <span className="text-light-secondary-text">Tax</span>
            <span className="text-light-primary-text font-medium">$0.00</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-500/20">
            <span className="font-bold text-light-primary-text">Total</span>
            <span className="font-bold text-light-primary-text">$20.00</span>
          </div>
        </div>
        <Button className="w-full h-11 rounded-full text-white font-medium">
          Place Order
        </Button>
      </div>
    </div>
  );
}
