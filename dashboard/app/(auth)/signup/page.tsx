import { SignupForm } from "@/components/auth/sigin-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Sellzy admin account.",
};

export default function SignupPage() {
  return <SignupForm />;
}
