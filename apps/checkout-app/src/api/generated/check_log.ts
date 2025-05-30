// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v5.27.3
// source: check_log.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "log";

export interface CheckoutLog {
  requestTag: string;
  requestMethod: string;
  requestUrl: string;
  requestTime: string;
  requestHeader: string;
  requestBody: string;
  responseTime: string;
  responseMessage: string;
  responseStatus: string;
  responseInterval: number;
  remark: string;
  token: string;
  downstreamOrderNo: string;
  details: string;
}

export interface CheckoutLogList {
  data: CheckoutLog[];
  code: string;
  msg: string;
  serverTime: string;
  success: boolean;
}

function createBaseCheckoutLog(): CheckoutLog {
  return {
    requestTag: "",
    requestMethod: "",
    requestUrl: "",
    requestTime: "",
    requestHeader: "",
    requestBody: "",
    responseTime: "",
    responseMessage: "",
    responseStatus: "",
    responseInterval: 0,
    remark: "",
    token: "",
    downstreamOrderNo: "",
    details: "",
  };
}

export const CheckoutLog: MessageFns<CheckoutLog> = {
  encode(message: CheckoutLog, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.requestTag !== "") {
      writer.uint32(10).string(message.requestTag);
    }
    if (message.requestMethod !== "") {
      writer.uint32(18).string(message.requestMethod);
    }
    if (message.requestUrl !== "") {
      writer.uint32(26).string(message.requestUrl);
    }
    if (message.requestTime !== "") {
      writer.uint32(34).string(message.requestTime);
    }
    if (message.requestHeader !== "") {
      writer.uint32(42).string(message.requestHeader);
    }
    if (message.requestBody !== "") {
      writer.uint32(50).string(message.requestBody);
    }
    if (message.responseTime !== "") {
      writer.uint32(58).string(message.responseTime);
    }
    if (message.responseMessage !== "") {
      writer.uint32(66).string(message.responseMessage);
    }
    if (message.responseStatus !== "") {
      writer.uint32(74).string(message.responseStatus);
    }
    if (message.responseInterval !== 0) {
      writer.uint32(80).int32(message.responseInterval);
    }
    if (message.remark !== "") {
      writer.uint32(90).string(message.remark);
    }
    if (message.token !== "") {
      writer.uint32(98).string(message.token);
    }
    if (message.downstreamOrderNo !== "") {
      writer.uint32(106).string(message.downstreamOrderNo);
    }
    if (message.details !== "") {
      writer.uint32(114).string(message.details);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CheckoutLog {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckoutLog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.requestTag = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.requestMethod = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.requestUrl = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.requestTime = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.requestHeader = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.requestBody = reader.string();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.responseTime = reader.string();
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }

          message.responseMessage = reader.string();
          continue;
        }
        case 9: {
          if (tag !== 74) {
            break;
          }

          message.responseStatus = reader.string();
          continue;
        }
        case 10: {
          if (tag !== 80) {
            break;
          }

          message.responseInterval = reader.int32();
          continue;
        }
        case 11: {
          if (tag !== 90) {
            break;
          }

          message.remark = reader.string();
          continue;
        }
        case 12: {
          if (tag !== 98) {
            break;
          }

          message.token = reader.string();
          continue;
        }
        case 13: {
          if (tag !== 106) {
            break;
          }

          message.downstreamOrderNo = reader.string();
          continue;
        }
        case 14: {
          if (tag !== 114) {
            break;
          }

          message.details = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CheckoutLog {
    return {
      requestTag: isSet(object.requestTag) ? globalThis.String(object.requestTag) : "",
      requestMethod: isSet(object.requestMethod) ? globalThis.String(object.requestMethod) : "",
      requestUrl: isSet(object.requestUrl) ? globalThis.String(object.requestUrl) : "",
      requestTime: isSet(object.requestTime) ? globalThis.String(object.requestTime) : "",
      requestHeader: isSet(object.requestHeader) ? globalThis.String(object.requestHeader) : "",
      requestBody: isSet(object.requestBody) ? globalThis.String(object.requestBody) : "",
      responseTime: isSet(object.responseTime) ? globalThis.String(object.responseTime) : "",
      responseMessage: isSet(object.responseMessage) ? globalThis.String(object.responseMessage) : "",
      responseStatus: isSet(object.responseStatus) ? globalThis.String(object.responseStatus) : "",
      responseInterval: isSet(object.responseInterval) ? globalThis.Number(object.responseInterval) : 0,
      remark: isSet(object.remark) ? globalThis.String(object.remark) : "",
      token: isSet(object.token) ? globalThis.String(object.token) : "",
      downstreamOrderNo: isSet(object.downstreamOrderNo) ? globalThis.String(object.downstreamOrderNo) : "",
      details: isSet(object.details) ? globalThis.String(object.details) : "",
    };
  },

  toJSON(message: CheckoutLog): unknown {
    const obj: any = {};
    if (message.requestTag !== "") {
      obj.requestTag = message.requestTag;
    }
    if (message.requestMethod !== "") {
      obj.requestMethod = message.requestMethod;
    }
    if (message.requestUrl !== "") {
      obj.requestUrl = message.requestUrl;
    }
    if (message.requestTime !== "") {
      obj.requestTime = message.requestTime;
    }
    if (message.requestHeader !== "") {
      obj.requestHeader = message.requestHeader;
    }
    if (message.requestBody !== "") {
      obj.requestBody = message.requestBody;
    }
    if (message.responseTime !== "") {
      obj.responseTime = message.responseTime;
    }
    if (message.responseMessage !== "") {
      obj.responseMessage = message.responseMessage;
    }
    if (message.responseStatus !== "") {
      obj.responseStatus = message.responseStatus;
    }
    if (message.responseInterval !== 0) {
      obj.responseInterval = Math.round(message.responseInterval);
    }
    if (message.remark !== "") {
      obj.remark = message.remark;
    }
    if (message.token !== "") {
      obj.token = message.token;
    }
    if (message.downstreamOrderNo !== "") {
      obj.downstreamOrderNo = message.downstreamOrderNo;
    }
    if (message.details !== "") {
      obj.details = message.details;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CheckoutLog>, I>>(base?: I): CheckoutLog {
    return CheckoutLog.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CheckoutLog>, I>>(object: I): CheckoutLog {
    const message = createBaseCheckoutLog();
    message.requestTag = object.requestTag ?? "";
    message.requestMethod = object.requestMethod ?? "";
    message.requestUrl = object.requestUrl ?? "";
    message.requestTime = object.requestTime ?? "";
    message.requestHeader = object.requestHeader ?? "";
    message.requestBody = object.requestBody ?? "";
    message.responseTime = object.responseTime ?? "";
    message.responseMessage = object.responseMessage ?? "";
    message.responseStatus = object.responseStatus ?? "";
    message.responseInterval = object.responseInterval ?? 0;
    message.remark = object.remark ?? "";
    message.token = object.token ?? "";
    message.downstreamOrderNo = object.downstreamOrderNo ?? "";
    message.details = object.details ?? "";
    return message;
  },
};

function createBaseCheckoutLogList(): CheckoutLogList {
  return { data: [], code: "", msg: "", serverTime: "0", success: false };
}

export const CheckoutLogList: MessageFns<CheckoutLogList> = {
  encode(message: CheckoutLogList, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    for (const v of message.data) {
      CheckoutLog.encode(v!, writer.uint32(10).fork()).join();
    }
    if (message.code !== "") {
      writer.uint32(18).string(message.code);
    }
    if (message.msg !== "") {
      writer.uint32(26).string(message.msg);
    }
    if (message.serverTime !== "0") {
      writer.uint32(32).uint64(message.serverTime);
    }
    if (message.success !== false) {
      writer.uint32(40).bool(message.success);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CheckoutLogList {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckoutLogList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.data.push(CheckoutLog.decode(reader, reader.uint32()));
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.code = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.msg = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }

          message.serverTime = reader.uint64().toString();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.success = reader.bool();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CheckoutLogList {
    return {
      data: globalThis.Array.isArray(object?.data) ? object.data.map((e: any) => CheckoutLog.fromJSON(e)) : [],
      code: isSet(object.code) ? globalThis.String(object.code) : "",
      msg: isSet(object.msg) ? globalThis.String(object.msg) : "",
      serverTime: isSet(object.serverTime) ? globalThis.String(object.serverTime) : "0",
      success: isSet(object.success) ? globalThis.Boolean(object.success) : false,
    };
  },

  toJSON(message: CheckoutLogList): unknown {
    const obj: any = {};
    if (message.data?.length) {
      obj.data = message.data.map((e) => CheckoutLog.toJSON(e));
    }
    if (message.code !== "") {
      obj.code = message.code;
    }
    if (message.msg !== "") {
      obj.msg = message.msg;
    }
    if (message.serverTime !== "0") {
      obj.serverTime = message.serverTime;
    }
    if (message.success !== false) {
      obj.success = message.success;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CheckoutLogList>, I>>(base?: I): CheckoutLogList {
    return CheckoutLogList.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CheckoutLogList>, I>>(object: I): CheckoutLogList {
    const message = createBaseCheckoutLogList();
    message.data = object.data?.map((e) => CheckoutLog.fromPartial(e)) || [];
    message.code = object.code ?? "";
    message.msg = object.msg ?? "";
    message.serverTime = object.serverTime ?? "0";
    message.success = object.success ?? false;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
