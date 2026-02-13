export const clone = <T = any>(obj: any) => JSON.parse(JSON.stringify(obj)) as T
