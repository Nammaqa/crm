import validateAdmin from "@/actions/validateAdmin";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/Admin/AdminSidebarContainer";

export default async function Dashboard() {
    const isAdmin = await validateAdmin();
    if (!isAdmin) redirect("/login");
    return <SidebarContainer />
}




