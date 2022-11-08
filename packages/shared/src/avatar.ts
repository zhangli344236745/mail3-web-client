import axios from 'axios'
import { CybertionConnect } from 'models'

export const cybertinoConnectAvatarQuery = (
  address: string,
  chain = 'ETH'
) => `query FullIdentityQuery {
  identity(
    address: "${address}"
    network: ${chain}
  ) {
    address
    domain
    avatar
    joinTime
  }
}`

export const getCybertinoConnect = (address: string) =>
  axios.post<CybertionConnect.GetCybertinoConnect>(
    'https://api.cybertino.io/connect/',
    JSON.stringify({ query: cybertinoConnectAvatarQuery(address) }),
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )

export const generateAvatarSrc = (address: string) =>
  `https://source.boringavatars.com/marble/120/${address}?colors=92A1C6,146A7C,F0AB3D,C271B4,C20D90&square=false`

class SomeUrl {
  private serverUrl: string

  constructor() {
    this.serverUrl = 'https://api.mail3.me/api/v1'
  }

  public setServerUrl(url: string) {
    this.serverUrl = url
  }

  public getServerUrl() {
    return this.serverUrl
  }
}

export const ShareSomeUrl = new SomeUrl()

export const getMail3Avatar = (address: string) =>
  axios.get<{ avatar: string }>(
    `${ShareSomeUrl.getServerUrl()}/avatar/${address}`
  )

export const getPrimitiveAddress = (domain: string) =>
  axios.get<{ eth_address: string }>(
    `${ShareSomeUrl.getServerUrl()}/addresses/${domain}`
  )
