import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const project = await db.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="w-full">
      <ProjectForm project={project} />
    </div>
  );
}
