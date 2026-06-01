import { AdminCandidateDetailScreen } from "@/features/admin/admin-candidate-detail-screen";

export default async function AdminCandidateDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCandidateDetailScreen candidateId={Number(id)} />;
}
