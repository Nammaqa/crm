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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch("/api/validateRecruiter");
        const data = await res.json();

        if (data.valid) {
          setAuthorized(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Validation error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [router]);

  if (loading) return <div>Checking access...</div>;
  if (!authorized) return null;
  if (!candidateId) {
    router.push("/404");
    return null;
  }

  return (
    <SidebarContainer editContent={<CandidateEditForm />} />
  );
}
