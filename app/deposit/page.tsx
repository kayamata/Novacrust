import { Suspense } from "react";
import { DepositPage } from "@/features/deposit/pages";

export default function Page() {
  return (
    <Suspense>
      <DepositPage />
    </Suspense>
  );
}
