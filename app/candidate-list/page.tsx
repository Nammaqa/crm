// app/candidate-list/page.tsx
import { Suspense } from 'react';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';
import CandidateListContent from '@/components/Recruiter/content/CandidateListContent';

export default function CandidateListPage() {
  return (
    <Suspense fallback={<div>Loading candidate list...</div>}>
    <SidebarContainer
      editContent={
        
          <CandidateListContent />
    
      }
    />   </Suspense>
  );
}
