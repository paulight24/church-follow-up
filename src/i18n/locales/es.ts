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
};

export default es;
