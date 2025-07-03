import { validateRecruiter } from "@/actions/validateRecruiter";

export async function GET() {
  const isValid = await validateRecruiter();

  return new Response(JSON.stringify({ valid: isValid }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
