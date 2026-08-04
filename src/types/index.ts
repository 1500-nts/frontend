// Mirrors com.banking.authservice.entity.Role
export type Role = "ADMIN" | "USER";

// Mirrors com.banking.accountservice.entity.AccountType
export type AccountType = "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT";

// Mirrors com.banking.accountservice.entity.AccountStatus
export type AccountStatus = "ACTIVE" | "BLOCKED" | "CLOSED" | "DORMANT";

// Mirrors com.banking.transactionservice.entity.TransactionType
export type TransactionType = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";

// Mirrors com.banking.transactionservice.entity.TransactionStatus
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED"
  | "AWAITING_OTP";

// ---- Auth ----

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminCreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// ---- Accounts ----

export interface AccountResponse {
  id: string;
  accountNumber: string;
  userId: string;
  accountHolderName: string;
  email: string;
  phone: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  dailyTransactionLimit: number;
  createdAt: string;
}

export interface CreateAccountRequest {
  userId: string;
  accountHolderName: string;
  email: string;
  phone: string;
  accountType: AccountType;
  initialDeposit: number;
}

// ---- Transactions ----

export interface TransactionResponse {
  id: string;
  initiatedByUserId: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  failureReason?: string;
  referenceNumber?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransferRequest {
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  description?: string;
}

// ---- API error shape (GlobalExceptionHandler) ----

export interface ApiErrorBody {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

// ---- Payments (Razorpay top-ups via payment-service) ----

export interface CreatePaymentRequest {
  accountNumber: string;
  amount: number;
  description?: string;
}

export interface PaymentOrderResponse {
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: string;
  razorpayKeyId: string;
}

// Shape of the object Razorpay's checkout.js hands back on success -
// NOT defined by our backend, this is Razorpay's own contract.
export interface RazorpayCheckoutSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
