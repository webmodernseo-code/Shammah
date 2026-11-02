import { Button } from "@/components/ui/button";
import { PageHeader } from "../ui/page-header";

export default function TicketDetails() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Details" backHref="/support" />
        <div className="flex gap-3">
          <Button variant="outline" size="xs">
            View
          </Button>
          <Button variant="outline" size="xs">
            Dismiss
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border border-gray-500/20 rounded-2xl">
        <div className="flex px-4  sm:px-6 py-4 items-center justify-between  border-b border-gray-500/20">
          <h2 className="text-lg font-bold text-text-primary-text">
            Support & Ticket Information
          </h2>
          <Button variant="outline" size="xs">
            Reply
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="bg-white border border-gray-500/20 rounded-xl p-4 sm:p-6">
            <h3 className="font-bold text-light-primary-text mb-1 text-sm">
              Payment
            </h3>
            <p className="txt-sm sm:text-base text-light-primary-text leading-6">
              Delivery usually takes 2–5 business days, depending on your
              location and the selected shipping method. You'll receive a
              tracking number once your order is shipped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
