import validateItAdmin from "@/actions/validateItAdmin";
import { redirect } from "next/navigation";
import SidebarContainer from "../../components/ItTeam/Sidebar.js";


export default async function Dashboard() {

    const isSales = await validateItAdmin();
    if (!isSales) redirect("/login");

    return <SidebarContainer />
}