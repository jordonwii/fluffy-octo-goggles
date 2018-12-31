export function rand(n:number, low?:number): number {
  if (low === undefined) low = 0;
  return Math.round((Math.random() * (n - low))) + low;
}