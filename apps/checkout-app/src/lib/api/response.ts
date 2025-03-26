import { NextResponse } from 'next/server'

interface SuccessResponse<T> {
  data: T;
  code: string;
  msg: string;
  serverTime: number;
  success: boolean;
}

interface ErrorResponse {
  code: number
  message: string
  errors?: unknown
  success?: boolean
}

export function successResponse<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    data,
    code: "0",
    msg: "Success",
    serverTime: Date.now(),
    success: true,
  })
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  errors?: unknown
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      code: statusCode,
      message,
      ...(errors ? { errors } : {}),
    },
    { status: statusCode } as ResponseInit
  )
}
