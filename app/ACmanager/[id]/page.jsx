import { validateACmanager } from "@/actions/validateACmanager";
import { redirect } from "next/navigation";
import SidebarContainer from "@components/ACmanager/ACmanagerSidebarContainer";
import CandidateEditForm from "@/components/ACmanager/content/CandidateEditForm";

export default async function EditACmanager() {

    const isAdmin = await validateACmanager();
    if (!isAdmin) redirect("/login");
    return <SidebarContainer  editContent={<CandidateEditForm />}/>
}