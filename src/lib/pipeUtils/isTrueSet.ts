export function isTrueSet(value: any) {
  const isTrueSet = value && (value === true || value === 'true') ? true : false;
  return isTrueSet;
}
