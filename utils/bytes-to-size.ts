export default function bytesToSize(bytes: number): string {
  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
  const size: string = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${size} ${sizes[i]}`;
}