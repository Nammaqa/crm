"use server";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/jwt";

export default async function validateSuperAdmin() {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) return false;
    try {
        const data = await verifyJwtToken(token);
        return data?.email == "tilak@wizzybox.com"
        // return data?.role === "SUPERADMIN";
    } catch {
        return false;
    }
}