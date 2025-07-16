import CandidateList from '@/components/Recruiter/content/CandidateList';
import Dashboard from '@/components/Admin/Sidebar';
import Customerlist from '@/components/Admin/Content/Customerlist';
import InvoiceForm from '@/components/Admin/Content/Invoice';

export default function CustomerAddPage() {
    return <Dashboard editContent={<InvoiceForm />} />
