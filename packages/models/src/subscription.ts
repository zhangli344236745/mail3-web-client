export namespace Subscription {
  export interface MessageResp {
    uuid: string
    subject: string
    writer: string
    seen: boolean
    created_at: string
  }

  export interface MessageStatsResp {
    unread_count: number
  }

  export interface MessageListResp {
    messages: MessageResp[]
    next_cursor: string
  }

  export interface MessageDetailResp {
    uuid: string
    subject: string
    writer_name: string
    writer_uuid: string
    content: string
    created_at: string
  }

  export interface MessagesReq {
    cursor: string
    count: number
  }
}
