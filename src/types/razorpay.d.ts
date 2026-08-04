// Razorpay's checkout.js is loaded via a plain <script> tag in index.html
// (not an npm package), so it attaches `Razorpay` to `window` at runtime
// with no types of its own. This declares just enough of its shape for
// what PaymentPage.tsx uses - not a full/official type definition.

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
