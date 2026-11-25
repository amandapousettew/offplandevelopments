import { z } from "zod";
import { getDb } from "../../../db";
import { inquiries } from "../../../db/schema";

const submission = z.object({
  kind: z.enum(["Buyer", "Agency partner", "Developer", "Project updates"]),
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254),
  language: z.enum(["English", "Svenska", "Nederlands", "Português", "Français"]),
  company: z.string().trim().max(200),
  project: z.string().max(200),
  message: z.string().max(2000),
  project_details: z.string().max(16000).optional(),
  updates: z.boolean()
}).refine(data => data.kind !== "Agency partner" || Boolean(data.company));

export async function POST(request: Request) {
  if (new URL(request.url).origin !== request.headers.get("origin")) {
    return new Response(null, { status: 403 });
  }
  const parsed = submission.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const {project_details, ...data} = parsed.data;
  await getDb().insert(inquiries).values({
    ...data, id: crypto.randomUUID(), email: data.email.toLowerCase(),
    message: [data.message, project_details].filter(Boolean).join("\n\n"),
    updates: data.updates || data.kind === "Project updates" ? 1 : 0,
    created: new Date().toISOString()
  });
  return Response.json({received: true}, {status: 201});
}
