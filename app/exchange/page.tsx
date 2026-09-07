import { Suspense } from "react";
import { ExchangePage } from "@/features/exchange/pages";

export default function Page() {
  return (
    <Suspense>
      <ExchangePage />
    </Suspense>
  );
}
