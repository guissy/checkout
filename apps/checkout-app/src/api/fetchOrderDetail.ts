import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";
import { setStorage } from '@/lib/storage';

export interface OrderDetailParams {
  token: string;
}

export interface OrderDetailRes {
  id: string;
  amount: {
    currency: string;
    value: number;
  };
  description: string;
  reference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  paymentMethods: Array<{
    id: string;
    name: string;
    type: string;
    icon: string;
    fee: number;
    discount: number;
    isRecommended: boolean;
  }>;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  items: Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
    currency: string;
    imageUrl: string;
  }>;
  metadata: Record<string, string>;
}

/**
 * 获取订单详情API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchOrderDetail(
  data: OrderDetailParams
): Promise<FpResponse<OrderDetailRes>> {
  setStorage("token", data.token);
  return createApiRequest<OrderDetailRes>({
    url: getApi() + "/checkout/orderDetails",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: data.token,
    },
    queryParams: {
      token: data.token,
    },
    name: "orderDetail",
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    cacheKey: "o_d_o",
  });
}
