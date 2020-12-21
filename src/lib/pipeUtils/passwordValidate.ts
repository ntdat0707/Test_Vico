export function checkPassword(password: string) {
  const checkLength = password.length >= 8 && password.length <= 20;
  return checkLength;
}
