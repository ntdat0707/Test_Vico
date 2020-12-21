export function checkInteger(value: any) {
  const checkIntRegex = /^[0-9]+$/;
  return checkIntRegex.test(value);
}
