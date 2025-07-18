import validateSuperAdmin from "@/actions/validateInvoice";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/Invoice/InvoiceSidebarContainer";

export default async function Dashboard() {
    const isAdmin = await validateInvoice();
    if (!isAdmin) redirect("/login");
    return <SidebarContainer />
}
