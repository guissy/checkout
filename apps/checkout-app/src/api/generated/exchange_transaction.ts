// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v5.27.3
// source: exchange_transaction.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "./google/protobuf/timestamp";

export const protobufPackage = "exchange";

/** 汇兑交易输入参数 */
export interface ExchangeTransactionInput {
  token: string;
  /** 源币种代码，例如 "USD" */
  in: string;
  /** 目标币种代码，例如 "CNY" */
  out: string;
  /** 加价率，范围 0-1 */
  markup: number;
  paymentMethod: string;
}

/** 汇兑交易完整信息 */
export interface ExchangeTransaction {
  /** 唯一标识符 (UUID) */
  id: string;
  /** Token 值 */
  token: string;
  /** 源币种代码，例如 "USD" */
  in: string;
  /** 目标币种代码，例如 "CNY" */
  out: string;
  /** 当前汇率，例如 7.283803 */
  exRate: number;
  /** 预付汇率，例如 7.356641 */
  futurePayRate: number;
  /** 创建时间 */
  createdAt: Date | undefined;
}

/** 汇兑交易输出信息 */
export interface ExchangeTransactionOutput {
  /** 源币种代码，例如 "USD" */
  in: string;
  /** 目标币种代码，例如 "CNY" */
  out: string;
  /** 当前汇率，例如 7.283803 */
  exRate: number;
  /** 预付汇率，例如 7.356641 */
  futurePayRate: number;
}

export interface ExchangeTransactionRes {
  data: ExchangeTransactionOutput | undefined;
  code: string;
  msg: string;
  serverTime: string;
  success: boolean;
}

function createBaseExchangeTransactionInput(): ExchangeTransactionInput {
  return { token: "", in: "", out: "", markup: 0, paymentMethod: "" };
}

export const ExchangeTransactionInput: MessageFns<ExchangeTransactionInput> = {
  encode(message: ExchangeTransactionInput, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.in !== "") {
      writer.uint32(18).string(message.in);
    }
    if (message.out !== "") {
      writer.uint32(26).string(message.out);
    }
    if (message.markup !== 0) {
      writer.uint32(33).double(message.markup);
    }
    if (message.paymentMethod !== "") {
      writer.uint32(42).string(message.paymentMethod);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ExchangeTransactionInput {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExchangeTransactionInput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.token = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.in = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.out = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 33) {
            break;
          }

          message.markup = reader.double();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.paymentMethod = reader.string();
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

  fromJSON(object: any): ExchangeTransactionInput {
    return {
      token: isSet(object.token) ? globalThis.String(object.token) : "",
      in: isSet(object.in) ? globalThis.String(object.in) : "",
      out: isSet(object.out) ? globalThis.String(object.out) : "",
      markup: isSet(object.markup) ? globalThis.Number(object.markup) : 0,
      paymentMethod: isSet(object.paymentMethod) ? globalThis.String(object.paymentMethod) : "",
    };
  },

  toJSON(message: ExchangeTransactionInput): unknown {
    const obj: any = {};
    if (message.token !== "") {
      obj.token = message.token;
    }
    if (message.in !== "") {
      obj.in = message.in;
    }
    if (message.out !== "") {
      obj.out = message.out;
    }
    if (message.markup !== 0) {
      obj.markup = message.markup;
    }
    if (message.paymentMethod !== "") {
      obj.paymentMethod = message.paymentMethod;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ExchangeTransactionInput>, I>>(base?: I): ExchangeTransactionInput {
    return ExchangeTransactionInput.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ExchangeTransactionInput>, I>>(object: I): ExchangeTransactionInput {
    const message = createBaseExchangeTransactionInput();
    message.token = object.token ?? "";
    message.in = object.in ?? "";
    message.out = object.out ?? "";
    message.markup = object.markup ?? 0;
    message.paymentMethod = object.paymentMethod ?? "";
    return message;
  },
};

function createBaseExchangeTransaction(): ExchangeTransaction {
  return { id: "", token: "", in: "", out: "", exRate: 0, futurePayRate: 0, createdAt: undefined };
}

export const ExchangeTransaction: MessageFns<ExchangeTransaction> = {
  encode(message: ExchangeTransaction, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.token !== "") {
      writer.uint32(18).string(message.token);
    }
    if (message.in !== "") {
      writer.uint32(26).string(message.in);
    }
    if (message.out !== "") {
      writer.uint32(34).string(message.out);
    }
    if (message.exRate !== 0) {
      writer.uint32(41).double(message.exRate);
    }
    if (message.futurePayRate !== 0) {
      writer.uint32(49).double(message.futurePayRate);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(58).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ExchangeTransaction {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExchangeTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.token = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.in = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.out = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 41) {
            break;
          }

          message.exRate = reader.double();
          continue;
        }
        case 6: {
          if (tag !== 49) {
            break;
          }

          message.futurePayRate = reader.double();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
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

  fromJSON(object: any): ExchangeTransaction {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      token: isSet(object.token) ? globalThis.String(object.token) : "",
      in: isSet(object.in) ? globalThis.String(object.in) : "",
      out: isSet(object.out) ? globalThis.String(object.out) : "",
      exRate: isSet(object.exRate) ? globalThis.Number(object.exRate) : 0,
      futurePayRate: isSet(object.futurePayRate) ? globalThis.Number(object.futurePayRate) : 0,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
    };
  },

  toJSON(message: ExchangeTransaction): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.token !== "") {
      obj.token = message.token;
    }
    if (message.in !== "") {
      obj.in = message.in;
    }
    if (message.out !== "") {
      obj.out = message.out;
    }
    if (message.exRate !== 0) {
      obj.exRate = message.exRate;
    }
    if (message.futurePayRate !== 0) {
      obj.futurePayRate = message.futurePayRate;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ExchangeTransaction>, I>>(base?: I): ExchangeTransaction {
    return ExchangeTransaction.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ExchangeTransaction>, I>>(object: I): ExchangeTransaction {
    const message = createBaseExchangeTransaction();
    message.id = object.id ?? "";
    message.token = object.token ?? "";
    message.in = object.in ?? "";
    message.out = object.out ?? "";
    message.exRate = object.exRate ?? 0;
    message.futurePayRate = object.futurePayRate ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    return message;
  },
};

function createBaseExchangeTransactionOutput(): ExchangeTransactionOutput {
  return { in: "", out: "", exRate: 0, futurePayRate: 0 };
}

export const ExchangeTransactionOutput: MessageFns<ExchangeTransactionOutput> = {
  encode(message: ExchangeTransactionOutput, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.in !== "") {
      writer.uint32(10).string(message.in);
    }
    if (message.out !== "") {
      writer.uint32(18).string(message.out);
    }
    if (message.exRate !== 0) {
      writer.uint32(25).double(message.exRate);
    }
    if (message.futurePayRate !== 0) {
      writer.uint32(33).double(message.futurePayRate);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ExchangeTransactionOutput {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExchangeTransactionOutput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.in = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.out = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 25) {
            break;
          }

          message.exRate = reader.double();
          continue;
        }
        case 4: {
          if (tag !== 33) {
            break;
          }

          message.futurePayRate = reader.double();
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

  fromJSON(object: any): ExchangeTransactionOutput {
    return {
      in: isSet(object.in) ? globalThis.String(object.in) : "",
      out: isSet(object.out) ? globalThis.String(object.out) : "",
      exRate: isSet(object.exRate) ? globalThis.Number(object.exRate) : 0,
      futurePayRate: isSet(object.futurePayRate) ? globalThis.Number(object.futurePayRate) : 0,
    };
  },

  toJSON(message: ExchangeTransactionOutput): unknown {
    const obj: any = {};
    if (message.in !== "") {
      obj.in = message.in;
    }
    if (message.out !== "") {
      obj.out = message.out;
    }
    if (message.exRate !== 0) {
      obj.exRate = message.exRate;
    }
    if (message.futurePayRate !== 0) {
      obj.futurePayRate = message.futurePayRate;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ExchangeTransactionOutput>, I>>(base?: I): ExchangeTransactionOutput {
    return ExchangeTransactionOutput.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ExchangeTransactionOutput>, I>>(object: I): ExchangeTransactionOutput {
    const message = createBaseExchangeTransactionOutput();
    message.in = object.in ?? "";
    message.out = object.out ?? "";
    message.exRate = object.exRate ?? 0;
    message.futurePayRate = object.futurePayRate ?? 0;
    return message;
  },
};

function createBaseExchangeTransactionRes(): ExchangeTransactionRes {
  return { data: undefined, code: "", msg: "", serverTime: "0", success: false };
}

export const ExchangeTransactionRes: MessageFns<ExchangeTransactionRes> = {
  encode(message: ExchangeTransactionRes, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.data !== undefined) {
      ExchangeTransactionOutput.encode(message.data, writer.uint32(10).fork()).join();
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

  decode(input: BinaryReader | Uint8Array, length?: number): ExchangeTransactionRes {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExchangeTransactionRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.data = ExchangeTransactionOutput.decode(reader, reader.uint32());
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

  fromJSON(object: any): ExchangeTransactionRes {
    return {
      data: isSet(object.data) ? ExchangeTransactionOutput.fromJSON(object.data) : undefined,
      code: isSet(object.code) ? globalThis.String(object.code) : "",
      msg: isSet(object.msg) ? globalThis.String(object.msg) : "",
      serverTime: isSet(object.serverTime) ? globalThis.String(object.serverTime) : "0",
      success: isSet(object.success) ? globalThis.Boolean(object.success) : false,
    };
  },

  toJSON(message: ExchangeTransactionRes): unknown {
    const obj: any = {};
    if (message.data !== undefined) {
      obj.data = ExchangeTransactionOutput.toJSON(message.data);
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

  create<I extends Exact<DeepPartial<ExchangeTransactionRes>, I>>(base?: I): ExchangeTransactionRes {
    return ExchangeTransactionRes.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ExchangeTransactionRes>, I>>(object: I): ExchangeTransactionRes {
    const message = createBaseExchangeTransactionRes();
    message.data = (object.data !== undefined && object.data !== null)
      ? ExchangeTransactionOutput.fromPartial(object.data)
      : undefined;
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

function toTimestamp(date: Date): Timestamp {
  const seconds = Math.trunc(date.getTime() / 1_000).toString();
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (globalThis.Number(t.seconds) || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

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
