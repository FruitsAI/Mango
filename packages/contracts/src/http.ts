export interface PaginationMeta {
  nextCursor?: string
  total?: number
}

export interface PaginatedResponse<TItem> {
  items: TItem[]
  page: PaginationMeta
}

export interface ApiEnvelope<TData> {
  data: TData
  requestId: string
}
