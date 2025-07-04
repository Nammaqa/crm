import CandidateForm from '@/components/Recruiter/content/CandidateForm';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';

export default function CandidateFormPage() {


  return (
    <SidebarContainer editContent={<CandidateForm  />} />
  );
}
