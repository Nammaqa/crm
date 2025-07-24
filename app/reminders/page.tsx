import { Suspense } from 'react';
import SidebarContainer from '@/components/Recruiter/HrSidbarContainer';
import ReminderDashboard from '@/components/Bdsales/Content/ReminderDashboard';

export default function RemindersPage() {
  return (
    <Suspense fallback={<div>Loading reminders...</div>}>

    <SidebarContainer
      editContent={
          <ReminderDashboard />
        }
    />
        </Suspense>

  );
}
