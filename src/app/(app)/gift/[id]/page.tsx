import { GiftDetailScreen } from "@/features/gift-detail/gift-detail-screen";

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const giftId = Number.parseInt(resolved.id, 10);

  if (Number.isNaN(giftId)) {
    return <main className="page">Некорректный id подарка</main>;
  }

  return <GiftDetailScreen giftId={giftId} />;
}
