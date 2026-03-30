import { getDashboardData } from "@/lib/data";
import { getCountdown } from "@/lib/utils";
import { MetricCard, PageHeader, Badge, DateCell } from "@/components/ui";

export default async function DashboardPage() {
  const { settings, tasks, launchTeam, outreach, purchases, reviews, activity } = await getDashboardData();
  const countdown = getCountdown(settings.launch_target_date);
  const topPriorities = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const priorityOrder = ["critical", "high", "medium", "low"];
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    })
    .slice(0, 5);
  const blockers = tasks.filter((task) => task.status === "blocked");
  const overdueTasks = tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== "done");
  const officialLaunchTeam = launchTeam.filter((member) => member.agreed_to_read_review);
  const arcSentCount = launchTeam.filter((member) => member.arc_sent).length;
  const reviewsPosted = reviews.filter((review) => ["posted", "verified"].includes(review.status)).length;
  const outreachPending = outreach.filter((contact) => ["draft_ready", "awaiting_approval", "approved_to_send", "follow_up_due"].includes(contact.status)).length;
  const pendingPurchases = purchases.filter((purchase) => purchase.verification_status === "pending").length;

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        description="High-signal summary of what matters now, what is blocked, and what still needs human action."
      />

      <div className="card-grid compact-cards">
        <MetricCard label="Launch date" value={settings.launch_target_date} note={`${countdown} days • ${settings.launch_phase.replaceAll("_", " ")}`} />
        <MetricCard label="Overdue tasks" value={overdueTasks.length} />
        <MetricCard label="Open blockers" value={blockers.length} />
        <MetricCard label="Launch team count" value={officialLaunchTeam.length} note="Counts only people who explicitly agreed to read and review." />
        <MetricCard label="ARC sent count" value={arcSentCount} />
        <MetricCard label="Reviews posted" value={reviewsPosted} />
        <MetricCard label="Outreach pending" value={outreachPending} />
        <MetricCard label="Purchase verifications pending" value={pendingPurchases} />
      </div>

      <div className="split">
        <section className="panel">
          <h3>Top 5 priorities this week</h3>
          <ul className="list">
            {topPriorities.map((task) => (
              <li key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <div className="small">{task.owner} • due <DateCell value={task.due_date} /></div>
                </div>
                <Badge label={task.status.replaceAll("_", " ")} tone={task.status === "blocked" ? "danger" : task.priority === "critical" ? "warning" : "neutral"} />
              </li>
            ))}
          </ul>
        </section>

        <section className="stack">
          <section className="panel">
            <h3>Open blockers</h3>
            {blockers.length ? (
              <ul className="list">
                {blockers.map((task) => (
                  <li key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <div className="small">{task.dependency_notes || task.notes || "No blocker note recorded."}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small">No blocked tasks right now.</p>
            )}
          </section>

          <section className="panel">
            <h3>Recent activity</h3>
            <ul className="list">
              {activity.slice(0, 6).map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.summary}</strong>
                    <div className="small">{entry.details || entry.entity_type || "Operational note"}</div>
                  </div>
                  <div className="small">
                    <DateCell value={entry.created_at} time />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>
      </div>
    </div>
  );
}
