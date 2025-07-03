'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';
import CandidateEditForm from '@/components/Recruiter/content/CandidateEditForm';

export default function EditRecruiterPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id;

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const validate = async () => {
      const res = await fetch("/api/validateRecruiter");
      const data = await res.json();
      if (data.valid) {
        setAuthorized(true);
      } else {
        router.push("/login");
      }
    };

    validate();
  }, [router]);

  if (!authorized) return <div>Checking access...</div>;

  return (
    <SidebarContainer editContent={<CandidateEditForm candidateId={candidateId} />} />
  );
}
