/**
 * English — the source of truth for public-page copy.
 *
 * Statically imported (never lazy) so the common case renders instantly with
 * no loading flash and no extra network request. Every other locale is typed
 * against this object, so a missing translation fails `tsc` instead of
 * quietly showing English to a Spanish speaker mid-service.
 *
 * Keys are flat and dot-namespaced rather than nested: it keeps the type a
 * simple string union, makes `t('event.register')` greppable, and avoids
 * deep-path type gymnastics for no practical gain.
 */
const en = {
  // ── shared ──
  'common.language': 'Language',
  'common.chooseLanguage': 'Choose your language',

  // ── public listener page (live sermon translation) ──
  'listen.liveNow': 'LIVE NOW',
  'listen.startingSoon': 'Starting soon',
  'listen.chooseLanguage': 'Choose your language',
  'listen.yourLanguage': 'Your language',
  'listen.earphonesHint': 'Use your own earphones — AirPods, wired, anything works.',
  'listen.listen': 'LISTEN',
  'listen.pause': 'PAUSE',
  'listen.listenAria': 'Listen',
  'listen.pauseAria': 'Pause',
  'listen.connecting': 'Connecting…',
  'listen.reconnecting': 'Reconnecting…',
  'listen.waiting': 'The service will start soon — stay on this page.',
  'listen.paused': 'Paused',
  'listen.speaking': 'Pastor is speaking…',
  'listen.worshipPaused': 'Worship in progress — translation resumes shortly.',
  'listen.unavailable': 'Translation for your language is temporarily unavailable. Please stay connected.',
  'listen.showCaptions': 'Show captions',
  'listen.hideCaptions': 'Hide captions',
  'listen.captionsPlaceholder': 'Captions appear as the message is preached…',
  'listen.listenersCount': '{count} listening in your language',
  'listen.changeLanguage': 'Change language',
  'listen.endedTitle': 'The live service has ended.',
  'listen.endedBody': 'Thank you for joining. God bless you!',
  'listen.noServiceTitle': 'No live service right now',
  'listen.noServiceBody': 'When the service starts, this page will update by itself — keep it open.',
  'listen.notFoundTitle': 'Page not found',
  'listen.notFoundBody': "Check the link with your church's media team.",
  'listen.header': 'Live Translation',

  // ── public event registration ──
  'event.register': 'Register',
  'event.notFoundTitle': 'We can’t find that event',
  'event.notFoundBody':
    'This link may be out of date, or the event isn’t published yet. Check with the church office for the current link.',
  'event.errorTitle': 'Something went wrong',
  'event.errorBody': 'We had trouble loading this page. Please try again in a moment.',
  'event.fullTitle': 'This event is full',
  'event.fullBody':
    '{event} has reached capacity. Please reach out to the church office to ask about a waiting list.',
  'event.closedTitle': 'Registration is closed',
  'event.closedBody': "Registration for {event} isn't open right now.",
  'event.successTitle': 'We’ve got you!',
  'event.successTitleNamed': 'We’ve got you, {name}!',
  'event.alreadyTitle': 'You’re already on the list!',
  'event.alreadyTitleNamed': 'You’re already on the list, {name}!',
  'event.alreadyNote': 'We updated your details rather than registering you twice. ',
  'event.seeYou': 'See you {when}.',
  'event.seeYouAt': 'See you {when} at {location}.',
  'event.submitError': 'We could not submit your registration. Please check the form and try again.',
  'event.smsConsent':
    'By giving your phone number you agree to receive text messages from {church} about this event, service reminders and pastoral messages. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help. Consent is not a condition of attending.',
  'event.smsConsentChurchFallback': 'this church',

  // ── form field labels (shared with the event form) ──
  'field.firstName': 'First Name',
  'field.lastName': 'Last Name',
  'field.email': 'Email',
  'field.phone': 'Phone',
  'field.dateOfBirth': 'Date of Birth',
  'field.weddingAnniversary': 'Wedding Anniversary',
  'field.prayerRequest': 'Tell us how we can pray for you',
  'field.optional': 'optional',
} as const;

export default en;
