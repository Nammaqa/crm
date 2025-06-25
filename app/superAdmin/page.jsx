import validateSuperAdmin from "@/actions/validateSuperAdmin";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/SuperAdmin/SuperAdminSidebarContainer";

export default async function Dashboard() {
    const isAdmin = await validateSuperAdmin();
    if (!isAdmin) redirect("/login");
    return <SidebarContainer />
}




