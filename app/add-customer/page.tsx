
import { validateInvoiceAdmin } from '@/actions/validateInvoiceAdmin';
import InvoiceSidebar from '@/components/Invoice/Sidebar';
import { redirect } from 'next/navigation';

export default async function CustomerAddPage() {
    const isSales = await validateInvoiceAdmin();
    if (!isSales) redirect("/login");
    return <InvoiceSidebar url='customer' />
}
