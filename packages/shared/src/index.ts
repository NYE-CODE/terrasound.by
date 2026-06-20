export type { Product } from "./product";
export type { Contact } from "./contact";
export type { Car } from "./car";
export type { CartItem, CartContextItem } from "./cart";
export { toCartItem, toCartItems } from "./cart";
export type { Order } from "./order";
export { PAYMENT_METHODS_INFO } from "./paymentMethods";
export type { ProductReview, ServiceReview } from "./review";
export { getPublishedReviews } from "./review";
export {
  PHONE_INPUT_PLACEHOLDER,
  normalizeCarModel,
  normalizePersonName,
  normalizePhone,
  validateCarModel,
  validateOptionalCarModel,
  validatePersonName,
  validatePhone,
} from "./validation";
export type { ValidationResult } from "./validation";
