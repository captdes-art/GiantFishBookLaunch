import {
  CONTENT_STATUSES,
  LAUNCH_TEAM_STATUSES,
  OUTREACH_STATUSES,
  PURCHASE_COUPON_STATUSES,
  PURCHASE_VERIFICATION_STATUSES,
  REVIEW_STATUSES,
  TASK_CATEGORIES,
  TASK_PHASES,
  TASK_STATUSES
} from "@/lib/constants";

function OptionList({ values }: { values: readonly string[] }) {
  return (
    <>
      {values.map((value) => (
        <option key={value} value={value}>
          {value.replaceAll("_", " ")}
        </option>
      ))}
    </>
  );
}

export function TaskCreateForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} method="post" className="form-grid">
      <input type="hidden" name="owner" value="Des" />
      <input type="hidden" name="category" value="build" />
      <input type="hidden" name="phase" value="foundation" />
      <input type="hidden" name="priority" value="medium" />
      <input type="hidden" name="status" value="not_started" />
      <div className="field">
        <label htmlFor="task-title">Title</label>
        <input id="task-title" name="title" required placeholder="What needs to get done?" />
      </div>
      <div className="field">
        <label htmlFor="task-due-date">Due date</label>
        <input id="task-due-date" type="date" name="due_date" />
      </div>
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label htmlFor="task-notes">Notes</label>
        <textarea id="task-notes" name="notes" placeholder="Optional details..." style={{ minHeight: 80 }} />
      </div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}>
        <button className="button" type="submit">Add task</button>
      </div>
    </form>
  );
}

export function LaunchTeamCreateForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="form-grid compact">
      <div className="field"><label htmlFor="lt-name">Full name</label><input id="lt-name" name="full_name" required /></div>
      <div className="field"><label htmlFor="lt-email">Email</label><input id="lt-email" name="email" type="email" /></div>
      <div className="field"><label htmlFor="lt-phone">Phone</label><input id="lt-phone" name="phone" /></div>
      <input type="hidden" name="source" value="" />
      <input type="hidden" name="category" value="friend" />
      <input type="hidden" name="status" value="prospect" />
      <div className="field">
        <label htmlFor="lt-follow-up">Follow-up due</label>
        <input id="lt-follow-up" type="date" name="follow_up_due" />
      </div>
      <div className="field">
        <label htmlFor="lt-agreed">Agreed to read/review</label>
        <select id="lt-agreed" name="agreed_to_read_review" defaultValue="false">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="lt-notes">Notes</label><textarea id="lt-notes" name="notes" /></div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}><button className="button" type="submit">Add person</button></div>
    </form>
  );
}

export function OutreachCreateForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="form-grid compact">
      <div className="field"><label htmlFor="out-contact-name">Contact name</label><input id="out-contact-name" name="contact_name" required /></div>
      <div className="field"><label htmlFor="out-org">Organization</label><input id="out-org" name="organization_name" /></div>
      <div className="field">
        <label htmlFor="out-category">Category</label>
        <select id="out-category" name="category" defaultValue="podcast">
          <option value="podcast">podcast</option>
          <option value="media">media</option>
          <option value="reviewer">reviewer</option>
          <option value="influencer">influencer</option>
          <option value="faith">faith</option>
          <option value="fishing">fishing</option>
          <option value="wellness">wellness</option>
          <option value="other">other</option>
        </select>
      </div>
      <div className="field"><label htmlFor="out-email">Email</label><input id="out-email" name="contact_email" type="email" /></div>
      <div className="field"><label htmlFor="out-website">Website</label><input id="out-website" name="website" /></div>
      <div className="field"><label htmlFor="out-platform">Platform</label><input id="out-platform" name="platform" /></div>
      <div className="field">
        <label htmlFor="out-status">Status</label>
        <select id="out-status" name="status" defaultValue="researching">
          <OptionList values={OUTREACH_STATUSES} />
        </select>
      </div>
      <div className="field">
        <label htmlFor="out-approval-status">Approval status</label>
        <select id="out-approval-status" name="approval_status" defaultValue="pending">
          <option value="not_needed">not_needed</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </div>
      <div className="field"><label htmlFor="out-follow-up">Follow-up due</label><input id="out-follow-up" type="date" name="follow_up_due" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="out-fit">Audience fit notes</label><textarea id="out-fit" name="audience_fit_notes" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="out-angle">Pitch angle</label><textarea id="out-angle" name="pitch_angle" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="out-draft">Draft copy</label><textarea id="out-draft" name="draft_copy" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="out-notes">Notes</label><textarea id="out-notes" name="notes" /></div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}><button className="button" type="submit">Add outreach contact</button></div>
    </form>
  );
}

export function ContentCreateForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="form-grid compact">
      <div className="field"><label htmlFor="content-title">Title</label><input id="content-title" name="title" required /></div>
      <div className="field">
        <label htmlFor="content-type">Content type</label>
        <select id="content-type" name="content_type" defaultValue="email">
          <option value="email">email</option>
          <option value="post">post</option>
          <option value="reel">reel</option>
          <option value="quote">quote</option>
          <option value="story">story</option>
          <option value="article">article</option>
          <option value="other">other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="content-platform">Platform</label>
        <select id="content-platform" name="platform" defaultValue="email">
          <option value="email">email</option>
          <option value="facebook">facebook</option>
          <option value="instagram">instagram</option>
          <option value="x">x</option>
          <option value="linkedin">linkedin</option>
          <option value="youtube">youtube</option>
          <option value="website">website</option>
          <option value="other">other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="content-theme">Theme</label>
        <select id="content-theme" name="theme" defaultValue="launch">
          <option value="gratitude">gratitude</option>
          <option value="calling">calling</option>
          <option value="fishing">fishing</option>
          <option value="healing">healing</option>
          <option value="faith">faith</option>
          <option value="family">family</option>
          <option value="happiness">happiness</option>
          <option value="launch">launch</option>
          <option value="review">review</option>
          <option value="raffle">raffle</option>
          <option value="fathers_day">fathers_day</option>
          <option value="other">other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="content-status">Status</label>
        <select id="content-status" name="status" defaultValue="idea">
          <OptionList values={CONTENT_STATUSES} />
        </select>
      </div>
      <div className="field">
        <label htmlFor="content-asset-needed">Asset needed</label>
        <select id="content-asset-needed" name="asset_needed" defaultValue="false">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div className="field"><label htmlFor="content-scheduled">Scheduled for</label><input id="content-scheduled" type="datetime-local" name="scheduled_for" /></div>
      <div className="field"><label htmlFor="content-cta">CTA</label><input id="content-cta" name="cta" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="content-draft">Draft copy</label><textarea id="content-draft" name="draft_copy" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="content-asset-notes">Asset notes</label><textarea id="content-asset-notes" name="asset_notes" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="content-notes">Notes</label><textarea id="content-notes" name="notes" /></div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}><button className="button" type="submit">Add content item</button></div>
    </form>
  );
}

export function ReviewCreateForm({
  action,
  launchTeamMembers
}: {
  action: (formData: FormData) => Promise<void>;
  launchTeamMembers: Array<{ id: string; full_name: string }>;
}) {
  return (
    <form action={action} className="form-grid compact">
      <div className="field">
        <label htmlFor="review-member">Launch team member</label>
        <select id="review-member" name="launch_team_member_id" defaultValue="">
          <option value="">Select member</option>
          {launchTeamMembers.map((member) => (
            <option key={member.id} value={member.id}>{member.full_name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="review-type">Review type</label>
        <select id="review-type" name="review_type" defaultValue="amazon">
          <option value="amazon">amazon</option>
          <option value="goodreads">goodreads</option>
          <option value="testimonial">testimonial</option>
          <option value="social">social</option>
          <option value="other">other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="review-status">Status</label>
        <select id="review-status" name="status" defaultValue="not_started">
          <OptionList values={REVIEW_STATUSES} />
        </select>
      </div>
      <div className="field"><label htmlFor="review-link">Review link</label><input id="review-link" name="review_link" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="review-excerpt">Excerpt</label><textarea id="review-excerpt" name="review_excerpt" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="review-notes">Notes</label><textarea id="review-notes" name="notes" /></div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}><button className="button" type="submit">Add review record</button></div>
    </form>
  );
}

export function ActivityNoteForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="form-grid compact">
      <div className="field"><label htmlFor="activity-summary">Summary</label><input id="activity-summary" name="summary" required /></div>
      <div className="field"><label htmlFor="activity-entity-type">Entity type</label><input id="activity-entity-type" name="entity_type" placeholder="Optional" /></div>
      <div className="field"><label htmlFor="activity-entity-id">Entity id</label><input id="activity-entity-id" name="entity_id" placeholder="Optional" /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="activity-details">Details</label><textarea id="activity-details" name="details" /></div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}><button className="button" type="submit">Add note</button></div>
    </form>
  );
}

export function SettingsForm({
  action,
  launchTargetDate,
  launchPhase,
  adminContact,
  memorialDayNote
}: {
  action: (formData: FormData) => Promise<void>;
  launchTargetDate: string;
  launchPhase: string;
  adminContact: string | null;
  memorialDayNote: string | null;
}) {
  return (
    <form action={action} className="form-grid compact">
      <div className="field"><label htmlFor="settings-launch-date">Launch target date</label><input id="settings-launch-date" type="date" name="launch_target_date" defaultValue={launchTargetDate} required /></div>
      <div className="field">
        <label htmlFor="settings-launch-phase">Launch phase</label>
        <select id="settings-launch-phase" name="launch_phase" defaultValue={launchPhase}>
          <option value="foundation">foundation</option>
          <option value="recruitment">recruitment</option>
          <option value="arc">arc</option>
          <option value="outreach">outreach</option>
          <option value="content">content</option>
          <option value="launch_week">launch_week</option>
          <option value="fathers_day">fathers_day</option>
        </select>
      </div>
      <div className="field"><label htmlFor="settings-admin-contact">Admin contact</label><input id="settings-admin-contact" name="admin_contact" defaultValue={adminContact || ""} /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor="settings-memorial-day-note">Memorial Day note</label><textarea id="settings-memorial-day-note" name="memorial_day_note" defaultValue={memorialDayNote || ""} /></div>
      <div className="actions" style={{ gridColumn: "1 / -1" }}><button className="button" type="submit">Save settings</button></div>
    </form>
  );
}

export function TaskEditForm({
  action,
  task
}: {
  action: (formData: FormData) => Promise<void>;
  task: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    phase: string;
    status: string;
    priority: string;
    owner: string;
    due_date: string | null;
    start_date?: string | null;
    dependency_notes?: string | null;
    notes?: string | null;
  };
}) {
  return (
    <>
    <form action={action} method="post" className="task-edit-grid">
      <input type="hidden" name="id" value={task.id} />
      <input type="hidden" name="owner" value={task.owner} />
      <input type="hidden" name="category" value={task.category} />
      <input type="hidden" name="phase" value={task.phase} />
      <input type="hidden" name="priority" value={task.priority} />
      <input type="hidden" name="start_date" value={task.start_date || ""} />
      <input type="hidden" name="description" value={task.description || ""} />
      <input name="title" defaultValue={task.title} placeholder="Title" required />
      <select name="status" defaultValue={task.status}>
        <OptionList values={TASK_STATUSES} />
      </select>
      <input type="date" name="due_date" defaultValue={task.due_date || ""} />
      <input name="notes" defaultValue={task.notes || ""} placeholder="Notes" />
      <button className="ghost-button" type="submit">Save</button>
    </form>
    {task.status !== "done" && (
      <form action={action} method="post" style={{ display: "inline" }}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="title" value={task.title} />
        <input type="hidden" name="owner" value={task.owner} />
        <input type="hidden" name="category" value={task.category} />
        <input type="hidden" name="phase" value={task.phase} />
        <input type="hidden" name="priority" value={task.priority} />
        <input type="hidden" name="start_date" value={task.start_date || ""} />
        <input type="hidden" name="description" value={task.description || ""} />
        <input type="hidden" name="due_date" value={task.due_date || ""} />
        <input type="hidden" name="notes" value={task.notes || ""} />
        <input type="hidden" name="status" value="done" />
        <button className="button" type="submit">Complete</button>
      </form>
    )}
    </>
  );
}

export function PurchaseUpdateForm({
  action,
  id,
  verificationStatus,
  couponStatus,
  couponCode
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  verificationStatus: string;
  couponStatus: string;
  couponCode: string | null;
}) {
  return (
    <form action={action} className="actions">
      <input type="hidden" name="id" value={id} />
      <select name="verification_status" defaultValue={verificationStatus}>
        <OptionList values={PURCHASE_VERIFICATION_STATUSES} />
      </select>
      <select name="coupon_status" defaultValue={couponStatus}>
        <OptionList values={PURCHASE_COUPON_STATUSES} />
      </select>
      <input name="coupon_code" defaultValue={couponCode || ""} placeholder="Coupon code" />
      <button className="ghost-button" type="submit">Save</button>
    </form>
  );
}
