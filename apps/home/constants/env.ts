export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.mail3.me'
export const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/mail3dao'
export const DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/equB6RTCHR'
export const LIGHT_PAPER_URL =
  process.env.NEXT_PUBLIC_LIGHT_PAPER_URL || '/mail3-litepaper.pdf'
export const WHITE_LIST_URL =
  process.env.NEXT_PUBLIC_WHITE_LIST_URL || `${APP_URL}/whitelist`
export const LAUNCH_URL = WHITE_LIST_URL
export const MIRROR_URL =
  process.env.NEXT_PUBLIC_MIRROR_URL || 'https://mirror.xyz/mail3.eth'
export const MEDIUM_URL =
  process.env.NEXT_PUBLIC_MEDIUM_URL || 'https://medium.com/@mail3'
export const CONTACT_US_URL =
  process.env.NEXT_PUBLIC_CONTACT_US_URL || 'mailto:mail3.eth@mail3.me'
export const IS_FORCE_WHITELIST = true
export const WHITE_LIST_APPLY_DATE_RANGE: [Date, Date] = [
  new Date('2022-6-7'),
  new Date('2022-6-14'),
]

export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const MAIL_SERVER_URL =
  process.env.NEXT_PUBLIC_MAIL_SERVER_URL || 'mail3.me'
