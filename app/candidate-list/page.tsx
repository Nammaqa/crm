import CandidateList from '@/components/Recruiter/content/CandidateList';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';
import { Suspense } from 'react';

export default function CandidateFormPage() {


  return (
    <Suspense>
      <SidebarContainer editContent={<CandidateList   />} />
    </Suspense>
  );
}
