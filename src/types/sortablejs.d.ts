declare module 'sortablejs' {
  export interface SortableEvent {
    item: HTMLElement
    oldIndex: number | null
    newIndex: number | null
  }

  export interface SortableOptions {
    animation?: number
    handle?: string
    onStart?: (event: SortableEvent) => void
    onEnd?: (event: SortableEvent) => void
  }

  export default class Sortable {
    constructor(el: HTMLElement, options?: SortableOptions)
    static create(el: HTMLElement, options?: SortableOptions): Sortable
    destroy(): void
  }
}
