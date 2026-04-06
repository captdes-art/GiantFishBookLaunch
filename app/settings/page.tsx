import { updateSettings } from "@/app/actions";
import { SettingsForm } from "@/components/forms";
import { ArcPdfUpload } from "@/components/arc-pdf-upload";
import { PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="page">
      <PageHeader title="Settings" description="Lightweight V1 settings for launch target date, current phase, and the Memorial Day launch constraint." />
      <section className="panel">
        <h3>Launch configuration</h3>
        <SettingsForm
          action={updateSettings}
          launchTargetDate={settings.launch_target_date}
          launchPhase={settings.launch_phase}
          adminContact={settings.admin_contact}
          memorialDayNote={settings.memorial_day_note}
        />
      </section>
      <section className="panel">
        <h3>ARC PDF</h3>
        <p className="small" style={{ marginBottom: 12 }}>Upload a new version of the book PDF. This is the file that gets emailed to launch team members.</p>
        <ArcPdfUpload />
      </section>
    </div>
  );
}
