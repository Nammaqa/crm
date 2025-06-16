import { validateBdSales } from "@/actions/validateBdSales";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/Bdsales/SidebarContainer";

export default async function Dashboard() {

    const isSales = await validateBdSales();
    if (!isSales) redirect("/login");

    return <SidebarContainer />
}