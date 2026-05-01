import { GiftDetailScreen } from "@/features/gift-detail/gift-detail-screen";

export default function GiftPage({ params }: { params: { id: string } }) {
  const giftId = Number.parseInt(params.id, 10);

  if (Number.isNaN(giftId)) {
    return <main className="page">Некорректный id подарка</main>;
  }

  return <GiftDetailScreen giftId={giftId} />;
}
