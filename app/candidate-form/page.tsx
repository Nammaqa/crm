import CandidateForm from '@/components/Recruiter/content/CandidateForm';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';
import { Suspense } from 'react';

export default function CandidateFormPage() {


  return (
    <Suspense fallback={<div>Loading candidate form...</div>}>
      <SidebarContainer editContent={<CandidateForm />} />
    </Suspense>
  );
}
