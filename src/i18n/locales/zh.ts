import type { Translations } from '../types';

/**
 * Simplified Chinese — lazy-loaded chunk (see i18n/index.ts). Typed as
 * Translations so it cannot drift out of sync with en.ts.
 *
 * Chinese punctuation (，。、！) is used rather than ASCII equivalents, and
 * sentences stay short: this is read on a phone, in a service, often by
 * someone who arrived five minutes ago.
 */
const zh: Translations = {
  'common.language': '语言',
  'common.chooseLanguage': '选择您的语言',

  'listen.liveNow': '正在直播',
  'listen.startingSoon': '即将开始',
  'listen.chooseLanguage': '选择您的语言',
  'listen.yourLanguage': '您的语言',
  'listen.earphonesHint': '请使用您自己的耳机——AirPods、有线耳机都可以。',
  'listen.listen': '收听',
  'listen.pause': '暂停',
  'listen.listenAria': '收听',
  'listen.pauseAria': '暂停',
  'listen.connecting': '正在连接…',
  'listen.reconnecting': '正在重新连接…',
  'listen.waiting': '聚会即将开始——请保持此页面打开。',
  'listen.paused': '已暂停',
  'listen.speaking': '牧师正在讲道…',
  'listen.worshipPaused': '正在敬拜——翻译稍后继续。',
  'listen.unavailable': '您所选语言的翻译暂时不可用，请保持连接。',
  'listen.showCaptions': '显示字幕',
  'listen.hideCaptions': '隐藏字幕',
  'listen.captionsPlaceholder': '讲道过程中将显示字幕…',
  'listen.listenersCount': '{count} 人正在收听您的语言',
  'listen.changeLanguage': '更改语言',
  'listen.endedTitle': '本次直播聚会已结束。',
  'listen.endedBody': '感谢您的参与，愿神赐福与您！',
  'listen.noServiceTitle': '目前没有正在直播的聚会',
  'listen.noServiceBody': '聚会开始后，此页面会自动更新——请保持打开。',
  'listen.notFoundTitle': '页面未找到',
  'listen.notFoundBody': '请与教会的媒体团队核对链接。',
  'listen.header': '实时翻译',

  'event.register': '报名',
  'event.notFoundTitle': '未找到该活动',
  'event.notFoundBody': '此链接可能已过期，或活动尚未发布。请向教会办公室索取最新链接。',
  'event.errorTitle': '出现问题',
  'event.errorBody': '加载此页面时遇到问题，请稍后再试。',
  'event.fullTitle': '本活动名额已满',
  'event.fullBody': '{event} 的名额已满。请联系教会办公室咨询候补名单。',
  'event.closedTitle': '报名已关闭',
  'event.closedBody': '{event} 目前未开放报名。',
  'event.successTitle': '报名成功！',
  'event.successTitleNamed': '{name}，报名成功！',
  'event.alreadyTitle': '您已在名单中！',
  'event.alreadyTitleNamed': '{name}，您已在名单中！',
  'event.alreadyNote': '我们已更新您的信息，未重复报名。',
  'event.seeYou': '{when} 见。',
  'event.seeYouAt': '{when} 在 {location} 见。',
  'event.submitError': '无法提交您的报名，请检查表单后重试。',
  'event.smsConsent':
    '提供电话号码即表示您同意接收来自 {church} 的短信，内容包括本活动通知、聚会提醒及牧养信息。发送频率不定，可能产生短信和数据费用。回复 STOP 退订，回复 HELP 获取帮助。同意接收短信并非参加活动的条件。',
  'event.smsConsentChurchFallback': '本教会',

  'field.firstName': '名字',
  'field.lastName': '姓氏',
  'field.email': '电子邮箱',
  'field.phone': '电话',
  'field.dateOfBirth': '出生日期',
  'field.weddingAnniversary': '结婚纪念日',
  'field.prayerRequest': '请告诉我们如何为您代祷',
  'field.optional': '选填',
};

export default zh;
