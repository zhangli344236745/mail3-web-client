export interface MessageListResponse {
  messages: Message[] | null
  next_cursor: string
}

export interface Message {
  created_at: string
  read_count: number
  subject: string
  uuid: string
}
