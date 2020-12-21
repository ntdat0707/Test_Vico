enum EShippingPlace {
  HOME = 'home',
  OFFICE = 'office',
}

enum EOrderSource {
  WEBSITE = 'website',
  FACEBOOK = 'facebook',
  NOW = 'now',
  BAEMIN = 'baemin',
  GOJECK = 'gojeck',
  GRAB = 'grab',
  POS = 'pos',
}

enum EBlogStatus {
  PUBLISH = 'publish',
  PRIVATE = 'private',
}

enum EPaymentType {
  COD = 'COD',
  BANKING = 'banking',
}

export { EShippingPlace, EOrderSource, EBlogStatus, EPaymentType };
