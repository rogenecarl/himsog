import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProviderById } from "@/actions/provider/create-provider-profile-actions";
import ProviderDetailsContentComponent from "@/components/(public)/provider-details-component/provider-details";
import { ProviderDetailsSkeleton } from "@/components/(public)/provider-details-component/provider-details-skeleton";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

async function ProviderDetailsContent({ uuid }: { uuid: string }) {
  const result = await getProviderById(uuid);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProviderDetailsContentComponent provider={result.data} />;
}

export default async function ProviderDetailsPage({ params }: PageProps) {
  const { uuid } = await params;

  return (
    <Suspense fallback={<ProviderDetailsSkeleton />}>
      <ProviderDetailsContent uuid={uuid} />
    </Suspense>
  );
}
