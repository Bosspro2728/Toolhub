export default function compressFileName(fileName: string): string {
  const maxSubstrLength = 18;

  if (fileName.length > maxSubstrLength) {
    const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
    const fileExtension = fileName.split('.').pop() as string;
    const charsToKeep = maxSubstrLength - (fileExtension.length + 3);

    const compressed =
      fileNameWithoutExtension.substring(0, charsToKeep) +
      '...' +
      fileExtension;

    return compressed;
  }

  return fileName.trim();
}