
const intervalMap: Record<number, NodeJS.Timeout> = {};

export function setRaidInterval(messageId: number, interval: NodeJS.Timeout) {
  intervalMap[messageId] = interval;
}
export function clearRaidInterval(messageId: number) {
  const interval = intervalMap[messageId];
  if (interval) {
    clearInterval(interval);
    delete intervalMap[messageId];
  }
}
