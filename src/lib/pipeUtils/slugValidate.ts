export function checkSlug(slug: string) {
  const slugContainErrorCharacter: number = slug.search('%');
  return slugContainErrorCharacter !== -1 ? false : true;
}
