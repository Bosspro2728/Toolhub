interface CollatzResult {
  sequence: number[];
  numLoop: number;
}

function collatzSequence(
  n: number,
  a: number,
  b: number,
  expectedValue: number,
  divider: number
): CollatzResult {
  let numLoop = 0;
  const sequence: number[] = [n];

  while (n !== expectedValue && numLoop <= 10000) {
    if (n % divider === 0) {
      n = Math.floor(n / divider);
    } else {
      n = a * n + b;
    }
    sequence.push(n);
    numLoop++;
  }

  return { sequence, numLoop };
}

export default collatzSequence;