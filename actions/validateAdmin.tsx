"use server";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/jwt";

export default async function validateAdmin() {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) return false;

    try {
        const data = await verifyJwtToken(token);

        return data?.role === 'ADMIN';
    } catch {
        return false;
    }
}