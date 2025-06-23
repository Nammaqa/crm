import { validateRecruiter } from "@/actions/validateRecruiter";
import { redirect } from "next/navigation";
import SidebarContainer from "../../components/Recruiter/HrSidbarContainer";


export default async function Dashboard() {

    const isSales = await validateRecruiter();
    if (!isSales) redirect("/login");

    return <SidebarContainer />
}