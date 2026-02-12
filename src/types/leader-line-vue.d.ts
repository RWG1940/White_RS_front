declare module 'leader-line-vue' {
  class LeaderLine {
    constructor(start: HTMLElement, end: HTMLElement, options?: any)
    remove(): void
    setOption(option: string, value: any): void
    [key: string]: any
  }

  const lib: {
    setLine(start: HTMLElement, end: HTMLElement, config?: any): LeaderLine
    obj: typeof LeaderLine
  }

  export default lib
}
