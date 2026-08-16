import { useSeo } from '@/lib/seo';
import { LegalPageShell } from '../components/LegalPageShell';

/**
 * Terms of service. Deliberately describes the arrangement as it actually
 * is today — free during launch, church owns its data, export always
 * available — rather than promising a paid product that does not exist yet.
 */
export function TermsPage() {
  useSeo({
    title: 'Terms of Service — Church Member Care',
    description:
      'The terms on which churches use Member Care: who owns the data, what the service does, messaging responsibilities, and how to leave with your records.',
    path: '/terms',
  });

  return (
    <LegalPageShell
      title="Terms of Service"
      lastUpdated="15 August 2026"
      intro="These terms cover the use of Member Care, a church member-care platform operated by Excellent Vision Real Estate, LLC. They are written to be read, not to be survived."
    >
      <section>
        <h2>What the service is</h2>
        <p>
          Member Care helps a church look after the people in it: tracking follow-up with
          first-time visitors, recording attendance and pastoral care, remembering birthdays and
          anniversaries, running event registration, and sending messages by email, text and
          WhatsApp.
        </p>
      </section>

      <section>
        <h2>Cost</h2>
        <p>
          The platform is <strong>free to use during launch</strong>. If charges are introduced
          later, existing churches will be told in advance and will never be billed without
          agreeing first. Messaging sent through a church's own Twilio, email or WhatsApp account
          is billed by that provider directly, not by us.
        </p>
      </section>

      <section>
        <h2>Your data is yours</h2>
        <p>
          A church's member records belong to that church. Two commitments follow from that:
        </p>
        <ul>
          <li><strong>Export is always available.</strong> An administrator can download everything the church holds — every record, as spreadsheets and as a complete data file — at any time, without asking us.</li>
          <li><strong>Non-payment never locks a church out of its own data.</strong> If billing ever exists and an account lapses, the member list and the full export stay available. Church work does not stop because of an invoice.</li>
        </ul>
      </section>

      <section>
        <h2>What we ask of you</h2>
        <ul>
          <li>Only add people's details where you have a legitimate reason to — they are members of, visitors to, or people who registered with your church.</li>
          <li>Only send messages people would expect from you. No promotional content to people who did not ask for it, and nothing unlawful, deceptive or harassing.</li>
          <li>Honour opt-outs. The platform does this automatically for texts; do not work around it.</li>
          <li>Keep your account credentials to yourself, and remove staff access when they leave.</li>
          <li>Do not attempt to reach another church's data, or probe the platform for ways to.</li>
        </ul>
        <p>
          Accounts used to send spam or unlawful messages will be suspended. This is not
          negotiable: one church's misuse degrades message delivery for every other church on the
          platform.
        </p>
      </section>

      <section>
        <h2>Messaging responsibilities</h2>
        <p>
          Where a church sends text messages, the church is responsible for having permission
          from the people it is messaging. The platform records consent, displays the required
          disclosure wherever it collects a phone number, and honours STOP, START and HELP
          automatically — but it cannot know whether a number written on a paper card was given
          willingly. That part is yours.
        </p>
      </section>

      <section>
        <h2>Availability</h2>
        <p>
          We work to keep the platform running and to fix problems quickly, but the service is
          provided as it is, without a guaranteed uptime commitment. Keep your own export if a
          record matters to you — the export exists precisely so that your church is never
          dependent on us being available.
        </p>
      </section>

      <section>
        <h2>Ending it</h2>
        <p>
          A church can stop using the platform whenever it likes. Export your data first; once an
          account is closed and its data deleted, we cannot recover it. We may suspend or end
          access where these terms are broken, or where continuing would put other churches on
          the platform at risk.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If these terms change materially, churches using the platform will be told by email
          before the change takes effect.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Excellent Vision Real Estate, LLC, operating as Member Care.{' '}
          <a href="mailto:support@churchmembercare.com">support@churchmembercare.com</a>
        </p>
      </section>
    </LegalPageShell>
  );
}
