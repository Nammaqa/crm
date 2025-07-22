import RequirementList from '@/components/Recruiter/content/RequirementList';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';
import { Suspense } from 'react';

export default function CandidateFormPage() {


  return (
    <Suspense fallback={<div>Loading candidate form...</div>}>
      <SidebarContainer editContent={<RequirementList   />} />
    </Suspense>
  );
}
