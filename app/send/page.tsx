import { Suspense } from "react";
import { SendPage } from "@/features/send/pages";

export default function Page() {
  return (
    <Suspense>
      <SendPage />
    </Suspense>
  );
}
