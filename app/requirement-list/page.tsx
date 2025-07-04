import RequirementList from '@/components/Recruiter/content/RequirementList';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';

export default function CandidateFormPage() {


  return (
    <SidebarContainer editContent={<RequirementList   />} />
  );
}
