import { CartItem } from "./cart";
import { Car } from "./car";
import { Contact } from "./contact";

export interface Order {
  id: string;
  contact: Contact;
  car: Car;
  items: CartItem[];
  total: number;
}
