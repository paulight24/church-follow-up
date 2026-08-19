import type { Translations } from '../types';

/**
 * Spanish — lazy-loaded chunk (see i18n/index.ts). Typed as Translations, so
 * this file cannot drift out of sync with en.ts without failing the build.
 *
 * Register terminology: "hermano/hermana" and other church-specific address
 * forms are deliberately avoided — this copy is read by first-time visitors
 * as often as by members, so it stays warm but plain.
 */
const es: Translations = {
  'common.language': 'Idioma',
  'common.chooseLanguage': 'Elige tu idioma',

  'listen.liveNow': 'EN VIVO',
  'listen.startingSoon': 'Comienza pronto',
  'listen.chooseLanguage': 'Elige tu idioma',
  'listen.yourLanguage': 'Tu idioma',
  'listen.earphonesHint': 'Usa tus propios audífonos — AirPods, con cable, cualquiera funciona.',
  'listen.listen': 'ESCUCHAR',
  'listen.pause': 'PAUSA',
  'listen.listenAria': 'Escuchar',
  'listen.pauseAria': 'Pausar',
  'listen.connecting': 'Conectando…',
  'listen.reconnecting': 'Reconectando…',
  'listen.waiting': 'El servicio comenzará pronto — no cierres esta página.',
  'listen.paused': 'En pausa',
  'listen.speaking': 'El pastor está hablando…',
  'listen.worshipPaused': 'Alabanza en curso — la traducción continuará en breve.',
  'listen.unavailable':
    'La traducción a tu idioma no está disponible en este momento. Por favor, permanece conectado.',
  'listen.showCaptions': 'Mostrar subtítulos',
  'listen.hideCaptions': 'Ocultar subtítulos',
  'listen.captionsPlaceholder': 'Los subtítulos aparecerán mientras se predica el mensaje…',
  'listen.listenersCount': '{count} escuchando en tu idioma',
  'listen.changeLanguage': 'Cambiar idioma',
  'listen.endedTitle': 'El servicio en vivo ha terminado.',
  'listen.endedBody': 'Gracias por acompañarnos. ¡Dios te bendiga!',
  'listen.noServiceTitle': 'No hay servicio en vivo ahora mismo',
  'listen.noServiceBody':
    'Cuando comience el servicio, esta página se actualizará sola — déjala abierta.',
  'listen.notFoundTitle': 'Página no encontrada',
  'listen.notFoundBody': 'Verifica el enlace con el equipo de medios de tu iglesia.',
  'listen.header': 'Traducción en vivo',

  // Sermon notes shown to members on the public listener page.
  'notes.heading': 'Apuntes de este mensaje',
  'notes.keyPoints': 'Puntos principales',
  'notes.scriptures': 'Pasajes bíblicos',
  'notes.declarations': 'Declaraciones',
  'notes.prayerPoints': 'Peticiones de oración',
  'notes.actionPoints': 'Pasos a seguir',
  'notes.disclaimer': 'Escritos automáticamente a partir del mensaje. Léelos junto con tus propios apuntes.',

  'event.register': 'Registrarme',
  'event.notFoundTitle': 'No encontramos ese evento',
  'event.notFoundBody':
    'Puede que este enlace ya no esté vigente o que el evento aún no se haya publicado. Consulta con la oficina de la iglesia para obtener el enlace actual.',
  'event.errorTitle': 'Algo salió mal',
  'event.errorBody': 'Tuvimos problemas para cargar esta página. Inténtalo de nuevo en un momento.',
  'event.fullTitle': 'Este evento está lleno',
  'event.fullBody':
    '{event} ha alcanzado su capacidad máxima. Comunícate con la oficina de la iglesia para preguntar por la lista de espera.',
  'event.closedTitle': 'El registro está cerrado',
  'event.closedBody': 'El registro para {event} no está abierto en este momento.',
  'event.successTitle': '¡Ya estás registrado!',
  'event.successTitleNamed': '¡Ya estás registrado, {name}!',
  'event.alreadyTitle': '¡Ya estabas en la lista!',
  'event.alreadyTitleNamed': '¡Ya estabas en la lista, {name}!',
  'event.alreadyNote': 'Actualizamos tus datos en lugar de registrarte dos veces. ',
  'event.seeYou': 'Nos vemos el {when}.',
  'event.seeYouAt': 'Nos vemos el {when} en {location}.',
  'event.submitError':
    'No pudimos enviar tu registro. Por favor revisa el formulario e inténtalo de nuevo.',
  'event.smsConsent':
    'Al proporcionar tu número de teléfono aceptas recibir mensajes de texto de {church} sobre este evento, recordatorios de servicios y mensajes pastorales. La frecuencia de los mensajes varía. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar la suscripción o HELP para obtener ayuda. El consentimiento no es requisito para asistir.',
  'event.smsConsentChurchFallback': 'esta iglesia',

  'field.firstName': 'Nombre',
  'field.lastName': 'Apellido',
  'field.email': 'Correo electrónico',
  'field.phone': 'Teléfono',
  'field.dateOfBirth': 'Fecha de nacimiento',
  'field.weddingAnniversary': 'Aniversario de bodas',
  'field.prayerRequest': 'Cuéntanos cómo podemos orar por ti',
  'field.optional': 'opcional',
  'field.placeholder.firstName': 'María',
  'field.placeholder.lastName': 'García',
  'field.placeholder.email': 'maria@ejemplo.com',
  'field.placeholder.phone': '+1 (555) 123-4567',
  'field.placeholder.prayerRequest': 'Comparte cualquier cosa por la que quieras que el equipo ore contigo (opcional)...',
  'field.select.placeholder': 'Selecciona...',
  // ── landing page (public marketing funnel) ──
  'landing.seoTitle': 'Software de cuidado de miembros para iglesias — Seguimiento, asistencia y traducción del mensaje en vivo',
  'landing.seoDescription':
    'Software gratuito de gestión para iglesias: seguimiento de miembros, atención a los que visitan por primera vez, asistencia, células, eventos y traducción del mensaje en vivo a cualquier idioma. Cada miembro conocido, cada alma acompañada.',
  'landing.nav.features': 'Funciones',
  'landing.nav.contact': 'Contacto',
  'landing.nav.howItWorks': 'Cómo funciona',
  'landing.nav.signIn': 'Iniciar sesión',
  'landing.nav.getStarted': 'Comenzar',
  'landing.hero.badge': 'Hecho para iglesias que aman a su gente',
  'landing.hero.titleLine1': 'Cada miembro conocido.',
  'landing.hero.titleLine2': 'Cada alma acompañada.',
  'landing.hero.subtitle':
    'Member Care ayuda a tu iglesia a recordar cumpleaños, dar seguimiento a los que visitan por primera vez, animar a los miembros y organizar equipos de cuidado — para que las personas sean amadas, alimentadas y se queden.',
  'landing.hero.ctaRegister': 'Registra tu iglesia',
  'landing.hero.ctaSignIn': 'Inicia sesión en tu iglesia',
  'landing.hero.trust': 'Gratis para empezar · Sin tarjeta · Tus datos siempre son tuyos',
  'landing.proof.multiChurch': 'Lista para varias iglesias',
  'landing.proof.roles': 'Acceso por roles',
  'landing.proof.encrypted': 'Notas pastorales cifradas',
  'landing.proof.export': 'Exporta todos tus datos con un clic',
  'landing.features.heading': 'Cuidado que hace crecer a tu iglesia',
  'landing.features.subheading':
    'Las personas se quedan donde son amadas. Member Care convierte las buenas intenciones en un sistema que todo tu equipo puede seguir.',
  'landing.features.birthdays.title': 'Recordatorios de cumpleaños y aniversarios',
  'landing.features.birthdays.body':
    'Saludos automáticos por SMS y correo el mismo día. Una iglesia que recuerda tu cumpleaños es una iglesia en la que te quedas.',
  'landing.features.followUp.title': 'Seguimiento de nuevos visitantes',
  'landing.features.followUp.body':
    'Ciclos de seguimiento estructurados con guías de llamada, asignación de tareas y escalamiento a los pastores — ningún visitante se pierde.',
  'landing.features.encouragement.title': 'Mensajes de ánimo',
  'landing.features.encouragement.body':
    'Palabra y ánimo a los miembros correctos por el canal correcto — en la app, correo, SMS o WhatsApp.',
  'landing.features.teams.title': 'Equipos y departamentos',
  'landing.features.teams.body':
    'Células, ujieres, equipos de seguimiento — organizados con responsabilidades claras y disponibilidad de cada obrero.',
  'landing.features.foundation.title': 'Seguimiento de la Escuela de Fundamentos',
  'landing.features.foundation.body':
    'De la inscripción a la graduación: el camino de cada nuevo convertido, clase por clase y grupo por grupo.',
  'landing.features.services.title': 'Servicios, eventos y asistencia',
  'landing.features.services.body':
    'Servicios recurrentes, registro de eventos con códigos QR, estadísticas de asistencia y captura de fotos de invitados.',
  'landing.lt.badge': 'Traducción del mensaje en vivo',
  'landing.lt.heading': 'Todos escuchan el mensaje en su propio idioma',
  'landing.lt.body':
    'Tu equipo de medios envía el micrófono del pastor a Member Care. Los miembros escanean un código QR en la pantalla, eligen su idioma y escuchan el mensaje interpretado en vivo con sus propios audífonos — con subtítulos si prefieren leer.',
  'landing.lt.point1Strong': 'Sin instalar ninguna app.',
  'landing.lt.point1': 'Escanear, elegir idioma, escuchar. Funciona en cualquier teléfono.',
  'landing.lt.point2Strong': 'Sin equipo especial.',
  'landing.lt.point2':
    'Sin receptores que comprar, cargar o recoger en la puerta — cada persona usa sus propios audífonos.',
  'landing.lt.point3Strong': 'Español, chino, francés, portugués, igbo, yoruba, hausa',
  'landing.lt.point3': 'y más — varios idiomas a la vez.',
  'landing.lt.cta': 'Llévalo a tu iglesia',
  'landing.lt.mockService': 'Servicio dominical',
  'landing.lt.mockChoose': 'Elige tu idioma',
  'landing.lt.mockHint': 'Usa tus propios audífonos — cualquiera funciona',
  'landing.how.heading': 'Funcionando en un solo día',
  'landing.how.step1Title': 'Registra tu iglesia',
  'landing.how.step1Body':
    'Dos minutos: nombre de la iglesia, ciudad y tu cuenta de administrador. Revisamos y aprobamos las nuevas iglesias rápidamente.',
  'landing.how.step2Title': 'Ingresa a tus miembros',
  'landing.how.step2Body':
    'Importa desde una hoja de cálculo o agrégalos sobre la marcha. Departamentos, estados y categorías de oración vienen preconfigurados.',
  'landing.how.step3Title': 'Que comience el cuidado',
  'landing.how.step3Body':
    'Asigna equipos de seguimiento, programa mensajes de ánimo y observa cómo crece la participación semana tras semana.',
  'landing.security.badge': 'Seguridad y propiedad de los datos',
  'landing.security.heading': 'La confianza de tus miembros, protegida',
  'landing.security.subheading': 'La información pastoral es delicada. La tratamos como tal.',
  'landing.security.point1': 'Los datos de cada iglesia están totalmente aislados — ninguna otra iglesia puede verlos',
  'landing.security.point2': 'Las notas pastorales y las peticiones de oración se cifran con claves propias de cada iglesia',
  'landing.security.point3': 'Permisos por rol: cada obrero ve solo lo que su función necesita',
  'landing.security.point4': 'Exporta todo lo que tu iglesia posee en un ZIP, cuando quieras, con un clic',
  'landing.security.quote': '«Apacienta mis corderos… Cuida de mis ovejas.»',
  'landing.security.quoteRef': 'Juan 21:15–17',
  'landing.security.quoteBody':
    'Pastorear a muchos requiere más que memoria. Member Care es la herramienta que hace posible un seguimiento fiel para cada persona que entra por tus puertas.',
  'landing.cta.heading': '¿Listo para amar mejor a tus miembros?',
  'landing.cta.subheading': 'Registra tu iglesia hoy y comienza a cuidar en minutos.',
  'landing.footer.contact': 'Contáctanos',
  'landing.footer.copyright': '© {year} Member Care. Hecho para iglesias que cuidan.',

  // ── church sign-up ──
  'signup.seoTitle': 'Registra tu iglesia — Software gratuito de gestión para iglesias',
  'signup.seoDescription':
    'Crea una cuenta gratuita de Member Care para tu iglesia en dos minutos. Seguimiento de miembros, atención a nuevos visitantes, asistencia, eventos y traducción del mensaje en vivo — sin tarjeta.',
  'signup.back': 'Volver',
  'signup.heading': 'Registra tu iglesia',
  'signup.subheading': 'Gratis para empezar. Tu iglesia tendrá su propio espacio privado y seguro.',
  'signup.sectionChurch': 'Tu iglesia',
  'signup.sectionAdmin': 'Tu cuenta de administrador',
  'signup.churchName': 'Nombre de la iglesia',
  'signup.city': 'Ciudad',
  'signup.state': 'Estado / Provincia',
  'signup.firstName': 'Nombre',
  'signup.lastName': 'Apellido',
  'signup.email': 'Correo electrónico',
  'signup.phone': 'Teléfono (opcional)',
  'signup.password': 'Contraseña',
  'signup.confirmPassword': 'Confirmar contraseña',
  'signup.submit': 'Registrar iglesia',
  'signup.alreadyUsing': '¿Ya usas Member Care?',
  'signup.signIn': 'Iniciar sesión',
  'signup.successTitle': '¡Bienvenido, {name}!',
  'signup.successBody':
    'Tu iglesia está registrada y pendiente de una breve revisión. Puedes iniciar sesión ahora mismo para importar miembros y configurar todo — la activaremos en breve.',
  'signup.successCta': 'Inicia sesión para comenzar',

  // ── sign in (doorway to the English application) ──
  'auth.tagline': 'Sistema de seguimiento y cuidado de miembros',
  'auth.welcomeBack': 'Bienvenido de nuevo',
  'auth.welcomeSub': 'Inicia sesión en tu cuenta para continuar',
  'auth.signIn': 'Iniciar sesión',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.passwordPlaceholder': 'Escribe tu contraseña',
  'auth.showPassword': 'Mostrar contraseña',
  'auth.hidePassword': 'Ocultar contraseña',
  'auth.rememberMe': 'Recordarme',
  'auth.forgotPassword': '¿Olvidaste tu contraseña?',
  'auth.featTeams': 'Gestión de equipos',
  'auth.featTeamsSub': 'Organiza equipos de seguimiento',
  'auth.featAlerts': 'Alertas inteligentes',
  'auth.featAlertsSub': 'Nunca pierdas un seguimiento',
  'auth.featSecure': 'Seguro y privado',
  'auth.featSecureSub': 'Acceso según el rol de cada persona',
  'auth.featCare': 'Cuidado de miembros',
  'auth.featCareSub': 'Seguimiento del acompañamiento pastoral',
  'auth.forgotTitle': '¿Olvidaste tu contraseña?',
  'auth.forgotBody': 'Escribe tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
  'auth.sendResetLink': 'Enviar enlace',
  'auth.backToSignIn': 'Volver a iniciar sesión',
  'auth.checkEmailTitle': 'Revisa tu correo',
  'auth.checkEmailBody': 'Si existe una cuenta con ese correo, te hemos enviado las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.',
};

export default es;
