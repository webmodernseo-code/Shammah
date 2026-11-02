"use client";

import { useSearchParams } from "next/navigation";
import FaqForm from "./faq-form";

export default function EditFaqForm() {
  const id = useSearchParams().get("id");
  return <FaqForm id={id || undefined} />;
}
