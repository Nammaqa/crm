import validateSuperAdmin from "@/actions/validateInvoiceAdmin";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/Invoice/InvoiceSidebarContainer";
import { validateInvoiceAdmin } from "@/actions/validateInvoiceAdmin";

export default async function Dashboard() {
    const isAdmin = await validateInvoiceAdmin();
    if (!isAdmin) redirect("/login");
    return <SidebarContainer />
}
