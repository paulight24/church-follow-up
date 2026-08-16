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
  // ── landing page (public marketing funnel) ──
  'landing.seoTitle': 'Church Member Care Software — Follow-Up, Attendance & Live Sermon Translation',
  'landing.seoDescription':
    'Free church management software for member follow-up, first-timer care, attendance, cell groups, events and live sermon translation into any language. Every member known, every soul followed up.',
  'landing.nav.features': 'Features',
  'landing.nav.contact': 'Contact',
  'landing.nav.howItWorks': 'How it works',
  'landing.nav.signIn': 'Sign in',
  'landing.nav.getStarted': 'Get started',
  'landing.hero.badge': 'Built for churches that love their people',
  'landing.hero.titleLine1': 'Every member known.',
  'landing.hero.titleLine2': 'Every soul followed up.',
  'landing.hero.subtitle':
    'Member Care helps your church remember birthdays, follow up first-timers, encourage members, and organise care teams — so people are loved, fed, and they stay.',
  'landing.hero.ctaRegister': 'Register your church',
  'landing.hero.ctaSignIn': 'Sign in to your church',
  'landing.hero.trust': 'Free to get started · No card required · Your data stays yours, always',
  'landing.proof.multiChurch': 'Multi-church ready',
  'landing.proof.roles': 'Role-based access',
  'landing.proof.encrypted': 'Encrypted pastoral notes',
  'landing.proof.export': 'One-click full data export',
  'landing.features.heading': 'Care that grows your church',
  'landing.features.subheading':
    'People stay where they are loved. Member Care turns good intentions into a system your whole team can run.',
  'landing.features.birthdays.title': 'Birthday & anniversary reminders',
  'landing.features.birthdays.body':
    'Automatic greetings by SMS and email on the day. A church that remembers your birthday is a church you stay in.',
  'landing.features.followUp.title': 'First-timer follow-up',
  'landing.features.followUp.body':
    'Structured follow-up cycles with call guides, task assignments and escalation to pastors — no visitor falls through the cracks.',
  'landing.features.encouragement.title': 'Encouragement messaging',
  'landing.features.encouragement.body':
    'Scripture and encouragement to the right members on the right channel — in-app, email, SMS or WhatsApp.',
  'landing.features.teams.title': 'Teams & departments',
  'landing.features.teams.body':
    'Fellowship groups, ushering, follow-up teams — organised with clear responsibilities and worker availability.',
  'landing.features.foundation.title': 'Foundation School tracking',
  'landing.features.foundation.body':
    "Enrolment to graduation: every new convert's journey tracked class by class, cohort by cohort.",
  'landing.features.services.title': 'Services, events & attendance',
  'landing.features.services.body':
    'Recurring services, event registration with QR codes, attendance insights and guest photo capture.',
  'landing.lt.badge': 'Live sermon translation',
  'landing.lt.heading': 'Everyone hears the message in their own language',
  'landing.lt.body':
    "Your media team sends the pastor's microphone into Member Care. Members scan a QR code on the screen, choose their language, and hear the message interpreted live through their own earphones — with captions if they prefer to read.",
  'landing.lt.point1Strong': 'No app to install.',
  'landing.lt.point1': 'Scan, choose a language, listen. It works on any phone.',
  'landing.lt.point2Strong': 'No special hardware.',
  'landing.lt.point2':
    'No receivers to buy, charge or collect at the door — members use their own earbuds.',
  'landing.lt.point3Strong': 'Spanish, Chinese, French, Portuguese, Igbo, Yoruba, Hausa',
  'landing.lt.point3': 'and more — run several at once.',
  'landing.lt.cta': 'Bring it to your church',
  'landing.lt.mockService': 'Sunday Service',
  'landing.lt.mockChoose': 'Choose your language',
  'landing.lt.mockHint': 'Use your own earphones — anything works',
  'landing.how.heading': 'Up and running in a day',
  'landing.how.step1Title': 'Register your church',
  'landing.how.step1Body':
    'Two minutes: church name, city, and your admin account. We review and approve new churches quickly.',
  'landing.how.step2Title': 'Bring your members in',
  'landing.how.step2Body':
    'Import from a spreadsheet or add as you go. Departments, statuses and prayer categories come pre-configured.',
  'landing.how.step3Title': 'Let the caring begin',
  'landing.how.step3Body':
    'Assign follow-up teams, schedule encouragements, and watch engagement grow week after week.',
  'landing.security.badge': 'Security & data ownership',
  'landing.security.heading': "Your members' trust, protected",
  'landing.security.subheading': 'Pastoral information is sensitive. We treat it that way.',
  'landing.security.point1': "Each church's data is fully isolated — no other church can ever see it",
  'landing.security.point2': 'Pastoral notes and prayer requests are encrypted with per-church keys',
  'landing.security.point3': 'Role-based permissions: workers see only what their role needs',
  'landing.security.point4': 'Export everything your church owns as a ZIP, any time, with one click',
  'landing.security.quote': '“Feed my lambs… Take care of my sheep.”',
  'landing.security.quoteRef': 'John 21:15–17',
  'landing.security.quoteBody':
    'Shepherding at scale needs more than memory. Member Care is the tool that makes faithful follow-up possible for every single person who walks through your doors.',
  'landing.cta.heading': 'Ready to love your members better?',
  'landing.cta.subheading': 'Register your church today and start caring in minutes.',
  'landing.footer.contact': 'Contact us',
  'landing.footer.copyright': '© {year} Member Care. Built for churches that care.',

  // ── church sign-up (the landing page's conversion path) ──
  'signup.seoTitle': 'Register Your Church — Free Church Management Software',
  'signup.seoDescription':
    'Create a free Member Care account for your church in two minutes. Member follow-up, first-timer care, attendance, events and live sermon translation — no card required.',
  'signup.back': 'Back',
  'signup.heading': 'Register your church',
  'signup.subheading': 'Free to get started. Your church gets its own private, secure space.',
  'signup.sectionChurch': 'Your church',
  'signup.sectionAdmin': 'Your admin account',
  'signup.churchName': 'Church name',
  'signup.city': 'City',
  'signup.state': 'State / Province',
  'signup.firstName': 'First name',
  'signup.lastName': 'Last name',
  'signup.email': 'Email address',
  'signup.phone': 'Phone (optional)',
  'signup.password': 'Password',
  'signup.confirmPassword': 'Confirm password',
  'signup.submit': 'Register church',
  'signup.alreadyUsing': 'Already using Member Care?',
  'signup.signIn': 'Sign in',
  'signup.successTitle': 'Welcome, {name}!',
  'signup.successBody':
    "Your church is registered and pending a quick review. You can sign in right now to import members and set things up — we'll activate everything shortly.",
  'signup.successCta': 'Sign in to get started',

  // ── sign in (doorway to the English application) ──
  'auth.tagline': 'Church Follow-Up Management System',
  'auth.welcomeBack': 'Welcome back',
  'auth.welcomeSub': 'Sign in to your account to continue',
  'auth.signIn': 'Sign in',
  'auth.email': 'Email address',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
  'auth.rememberMe': 'Remember me',
  'auth.forgotPassword': 'Forgot password?',
  'auth.featTeams': 'Team Management',
  'auth.featTeamsSub': 'Organize follow-up teams',
  'auth.featAlerts': 'Smart Alerts',
  'auth.featAlertsSub': 'Never miss a follow-up',
  'auth.featSecure': 'Secure & Private',
  'auth.featSecureSub': 'Role-based access control',
  'auth.featCare': 'Member Care',
  'auth.featCareSub': 'Pastoral support tracking',
  'auth.forgotTitle': 'Forgot password?',
  'auth.forgotBody': "Enter your email address and we'll send you a link to reset your password.",
  'auth.sendResetLink': 'Send reset link',
  'auth.backToSignIn': 'Back to sign in',
  'auth.checkEmailTitle': 'Check your email',
  'auth.checkEmailBody': "If an account exists with that email, we've sent password reset instructions. Please check your inbox and spam folder.",
} as const;

export default en;
