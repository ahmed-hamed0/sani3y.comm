
import { useAuth } from "@/hooks/auth";
import { useJobApplications } from "@/hooks/useJobApplications";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationsLoading } from "./ApplicationsLoading";
import { EmptyApplications } from "./EmptyApplications";

export interface JobApplicationsListProps {
  jobId: string;
  isMyJob: boolean;
  onRefreshNeeded?: () => void;
}

export function JobApplicationsList({ jobId, isMyJob, onRefreshNeeded }: JobApplicationsListProps) {
  const { user } = useAuth();
  const { applications, loading, handleAccept, handleReject } = useJobApplications(
    jobId,
    isMyJob && !!user,
    onRefreshNeeded
  );

  if (loading) {
    return <ApplicationsLoading />;
  }

  if (applications.length === 0) {
    return <EmptyApplications />;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          isMyJob={isMyJob}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}

export default JobApplicationsList;
