import { useSeo } from '@/lib/seo';
import { LegalPageShell } from '../components/LegalPageShell';

/**
 * Privacy policy. Written to describe what this application actually does —
 * the specific data it holds, the specific processors it sends it to, and
 * the specific things it deliberately does not do — rather than the generic
 * template a reader learns nothing from.
 *
 * Two audiences: a pastor deciding whether to trust the platform with their
 * congregation's details, and a carrier/compliance reviewer checking an SMS
 * programme, who needs the messaging and opt-out sections to be explicit.
 */
export function PrivacyPage() {
  useSeo({
    title: 'Privacy Policy — Church Member Care',
    description:
      'How Member Care handles church member data: what is collected, who processes it, how text-message consent works, and how to opt out.',
    path: '/privacy',
  });

  return (
    <LegalPageShell
      title="Privacy Policy"
      lastUpdated="15 August 2026"
      intro="Member Care is a church member-care platform operated by Excellent Vision Real Estate, LLC. This policy explains what personal information the platform holds, why, who else sees it, and what control you have over it."
    >
      <section>
        <h2>Who is responsible for your information</h2>
        <p>
          Member Care is software that churches use to care for their members. When your church
          uses it, <strong>your church decides</strong> what information to record about you and
          how it is used. Excellent Vision Real Estate, LLC operates the platform and processes
          that information on the church's behalf and under its instructions.
        </p>
        <p>
          This means that if you want your details corrected or removed, the fastest route is to
          contact your church directly. You can also reach us at{' '}
          <a href="mailto:support@churchmembercare.com">support@churchmembercare.com</a> and we
          will work with them.
        </p>
      </section>

      <section>
        <h2>What the platform holds</h2>
        <p>Depending on what your church records, this can include:</p>
        <ul>
          <li><strong>Contact and identity details</strong> — name, email address, phone numbers, date of birth, wedding anniversary, household and address.</li>
          <li><strong>Church life</strong> — attendance, service visits, department and fellowship group membership, event registrations, foundation school progress.</li>
          <li><strong>Pastoral records</strong> — follow-up notes, call outcomes, prayer requests and pastoral notes.</li>
          <li><strong>Messages</strong> — messages the church sent you, their delivery outcome, and any replies you sent back to the church's number.</li>
          <li><strong>Photos</strong> — where a church uploads a guest photo or event image.</li>
        </ul>
        <p>
          <strong>Pastoral notes and prayer requests are encrypted at rest</strong> with a key
          derived separately for each church, because they are the most sensitive things the
          platform holds.
        </p>
      </section>

      <section>
        <h2>Each church is separated from every other</h2>
        <p>
          The platform is multi-tenant: every record belongs to exactly one church, and every
          query is scoped to that church at the database layer. One church cannot see another
          church's members, notes, messages or events. A request that arrives without a valid
          church context is refused rather than served.
        </p>
      </section>

      <section>
        <h2>Text messages, email and WhatsApp</h2>
        <p>
          Churches use Member Care to send service reminders, event confirmations, birthday and
          anniversary greetings, and pastoral messages. You give your number to your church — on
          a registration form, a connection card, or by telling a member of staff.
        </p>
        <ul>
          <li><strong>Message frequency varies.</strong> Message and data rates may apply.</li>
          <li><strong>Reply STOP</strong> to any text to stop receiving them. This is honoured automatically and recorded against your record, so the church cannot text you again by mistake.</li>
          <li><strong>Reply HELP</strong> for information about who is messaging you.</li>
          <li>Consent to texts is never a condition of attending an event or being part of a church.</li>
          <li><strong>Phone numbers are never sold, rented or shared for anyone else's marketing.</strong> Text-message consent is not shared with third parties for their own purposes.</li>
        </ul>
      </section>

      <section>
        <h2>Who else processes your information</h2>
        <p>
          The platform relies on a small number of service providers, each of which sees only
          what it needs to do its job:
        </p>
        <ul>
          <li><strong>Twilio</strong> — sends and receives text messages.</li>
          <li><strong>Resend</strong> — delivers email.</li>
          <li><strong>Meta (WhatsApp Business Platform)</strong> — delivers WhatsApp messages, where a church has enabled it.</li>
          <li><strong>Hostinger</strong> — hosts the application and its database.</li>
          <li><strong>Google Firebase</strong> — hosts the web application and delivers push notifications.</li>
          <li><strong>Cloudflare R2</strong> — stores uploaded images and files.</li>
          <li><strong>Google Analytics</strong> — anonymous usage statistics, described below.</li>
        </ul>
        <p>
          A church may connect <strong>its own</strong> Twilio, email or WhatsApp account instead,
          in which case messages are sent through that account and its provider's terms apply.
        </p>
      </section>

      <section>
        <h2>What we deliberately do not send to analytics</h2>
        <p>
          The platform uses Google Analytics to understand which screens are used. Before any
          page view leaves the browser, the address is stripped of identifiers — a page about a
          specific member is reported as <code>/members/:id</code>, never with the real
          identifier — and query strings are discarded entirely, so invitation and password-reset
          links can never appear in analytics. No names, email addresses, phone numbers or church
          identifiers are ever sent.
        </p>
      </section>

      <section>
        <h2>How long information is kept</h2>
        <p>
          Member records are kept for as long as the church keeps using the platform, because
          member care is a long-term relationship and a church needs its history. Churches can
          archive individual members at any time. When a church leaves the platform, it can
          export everything it holds first — that export is always available, including while an
          account is unpaid, because a church's records belong to the church.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Ask your church to correct or delete your details, or contact us and we will work with them.</li>
          <li>Reply STOP to any text message to stop text messages.</li>
          <li>Ask your church to stop emailing you, or use the reply address in any message.</li>
          <li>Ask what the platform holds about you — your church can produce it, and we can help.</li>
        </ul>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Churches sometimes record children as part of a household or an event registration,
          provided by a parent or guardian. The platform does not knowingly collect information
          directly from children, and does not send messages to a number unless it was given by
          the person responsible for it.
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
