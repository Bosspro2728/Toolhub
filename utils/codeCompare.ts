import { diffLines, Change } from 'diff';

interface CodeDiff {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function compareCode(oldCode: string, newCode: string): CodeDiff[] {
  const diffs: Change[] = diffLines(oldCode, newCode);
  return diffs.map(part => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
  }));
}
