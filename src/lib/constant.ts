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
enum EProductSugarOpt {
  NATURAL,
  SUGAR_5ML,
  SUGAR_10ML,
}

export { EShippingPlace, EOrderSource, EBlogStatus, EPaymentType, EProductSugarOpt };
