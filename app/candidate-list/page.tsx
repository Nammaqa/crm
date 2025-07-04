import CandidateList from '@/components/Recruiter/content/CandidateList';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';

export default function CandidateFormPage() {


  return (
    <SidebarContainer editContent={<CandidateList   />} />
  );
}
