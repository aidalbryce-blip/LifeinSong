import type { Metadata } from "next";
import IntakeForm from "./intake-form";

export const metadata: Metadata = {
  title: "Create Your Song — Life in Song",
};

export default function IntakePage() {
  return <IntakeForm />;
}
