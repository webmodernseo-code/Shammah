"use client";

import React from "react";
import Image from "next/image";

const summaryItems = [
  { label: "Sub-Total", value: "$20.00" },
  { label: "VAT (40%)", value: "$4.00" },
  { label: "Discount", value: "-$4.00" },
  { label: "Shipment", value: "$0.00" },
  { label: "Tax", value: "$0.00" },
];

export default function OrderDetailsSummary() {
  return (
    <div className="bg-accent-2 rounded-2xl p-4  sm:p-6 w-full">
      {/* Header */}
      <h3 className="text-lg sm:text-xl font-bold text-light-primary-text mb-4 sm:mb-6">
        Order Summary
      </h3>

      {/* Summary Items */}
      <div className="space-y-4 mb-8 sm:mb-12">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-base text-light-secondary-text">
              {item.label}
            </span>
            <span className="text-base font-medium text-light-primary-text">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-500/20 pt-2 mb-4 sm:mb-6">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold leading-7 text-light-primary-text">
            Total
          </span>
          <span className="text-lg font-bold leading-7 text-light-primary-text">
            $20.00
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-light-primary-text leading-5.5">
          Pay with Paypal
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="24"
          viewBox="0 0 36 24"
          fill="none"
        >
          <rect width="36" height="24" rx="4" fill="white" />
          <path
            d="M14.3405 21.3197L14.6905 19.1197H13.9105H10.2305L12.7905 2.85969C12.7973 2.80931 12.8222 2.76312 12.8605 2.72969C12.9007 2.69862 12.9497 2.68112 13.0005 2.67969H19.2105C21.2805 2.67969 22.7005 3.10969 23.4505 3.95969C23.7823 4.31622 24.0135 4.75449 24.1205 5.22969C24.2371 5.80719 24.2371 6.40218 24.1205 6.97969V7.47969L24.4705 7.67969C24.7369 7.81249 24.9774 7.992 25.1805 8.20969C25.4861 8.57868 25.6835 9.02524 25.7505 9.49969C25.8254 10.1199 25.7984 10.7482 25.6705 11.3597C25.5386 12.1025 25.278 12.8165 24.9005 13.4697C24.5954 13.9933 24.183 14.4466 23.6905 14.7997C23.1947 15.1377 22.6428 15.3849 22.0605 15.5297C21.4068 15.6946 20.7346 15.7752 20.0605 15.7697H19.5705C19.227 15.7697 18.8945 15.89 18.6305 16.1097C18.3651 16.3333 18.1908 16.6463 18.1405 16.9897V17.1897L17.5305 21.0697V21.2197C17.5377 21.2459 17.5377 21.2735 17.5305 21.2997H17.4705L14.3405 21.3197Z"
            fill="#253D80"
          />
          <path
            d="M24.8002 7.08008L24.7402 7.45008C23.9202 11.6501 21.1102 13.1101 17.5302 13.1101H15.7102C15.2724 13.1095 14.8991 13.4276 14.8302 13.8601L13.9002 19.7801L13.6302 21.4601C13.61 21.5946 13.649 21.7313 13.7372 21.8349C13.8254 21.9384 13.9542 21.9987 14.0902 22.0001H17.3302C17.7144 21.9997 18.0411 21.7197 18.1002 21.3401V21.1801L18.7102 17.3101V17.1001C18.7648 16.722 19.0883 16.4411 19.4702 16.4401H20.0002C23.1302 16.4401 25.5902 15.1701 26.3002 11.4401C26.6844 10.1652 26.4474 8.78395 25.6602 7.71008C25.4105 7.45389 25.1198 7.24099 24.8002 7.08008V7.08008Z"
            fill="#189BD7"
          />
          <path
            d="M23.9404 6.73984L23.5604 6.63984L23.1404 6.55984C22.6108 6.48066 22.0758 6.44387 21.5404 6.44984H16.6604C16.5464 6.44672 16.4333 6.47071 16.3304 6.51984C16.0985 6.6284 15.9369 6.84642 15.9004 7.09984L14.9004 13.6698V13.8598C14.9693 13.4274 15.3425 13.1093 15.7804 13.1098H17.6004C21.1804 13.1098 23.9904 11.6498 24.8104 7.44984L24.8704 7.07984C24.655 6.96854 24.4309 6.87489 24.2004 6.79984L23.9404 6.73984Z"
            fill="#242E65"
          />
          <path
            d="M15.9004 7.1C15.9369 6.84658 16.0985 6.62856 16.3304 6.52C16.4333 6.47086 16.5464 6.44687 16.6604 6.45H21.5404C22.0758 6.44403 22.6108 6.48081 23.1404 6.56L23.5604 6.64L23.9404 6.74L24.1304 6.8C24.3609 6.87505 24.585 6.96869 24.8004 7.08C25.1254 5.83063 24.8275 4.50118 24.0004 3.51C23.0004 2.45 21.3604 2 19.2204 2H13.0004C12.5625 1.99947 12.1893 2.31756 12.1204 2.75L9.53038 19.16C9.50719 19.3148 9.55227 19.472 9.65395 19.5909C9.75563 19.7098 9.9039 19.7788 10.0604 19.78H13.9004L14.9004 13.67L15.9004 7.1Z"
            fill="#253D80"
          />
        </svg>
      </div>
    </div>
  );
}
