import { GlobalSearch } from "@/components/beranda/global-search";
import { QuickActions } from "@/components/beranda/quick-actions";
import { ProgressSummary } from "@/components/beranda/progress-summary";
import { NotificationsPanel } from "@/components/beranda/notifications-panel";
import { RecentActivity } from "@/components/beranda/recent-activity";
import { QuizScores } from "@/components/beranda/quiz-scores";

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      <GlobalSearch />
      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProgressSummary />
          <NotificationsPanel />
        </div>
        <div className="space-y-6">
          <QuizScores />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
