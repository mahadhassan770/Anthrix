import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ClientForm from "@/components/admin/ClientForm";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const client = await db.client.findUnique({
    where: { id },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="w-full">
      <ClientForm client={client} />
    </div>
  );
}
