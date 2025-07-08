import { validateACmanager } from "@/actions/validateACmanager";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/ACmanager/ACmanagerSidebarContainer";

export default async function Dashboard() {
    const isAdmin = await validateACmanager();
    if (!isAdmin) redirect("/login");
    return <SidebarContainer />
}