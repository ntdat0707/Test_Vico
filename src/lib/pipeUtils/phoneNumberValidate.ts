export function checkPhoneNumber(phoneNumber: string) {
  const phoneNumberRegex = /^\d+$/;
  return phoneNumberRegex.test(phoneNumber);
}
