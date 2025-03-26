import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { CountryInfo } from "@/api/fetchCountryInfoList";

// 处理获取国家列表的请求
export async function GET() {
  try {
    // 查询所有国家信息
    const countries = (await prisma.country.findMany()) as unknown as CountryInfo[];

    // 格式化数据
    const formattedCountries = countries.map((country) => ({
      ...country,
      countryId: parseInt(country.countryId as unknown as string),
      iso3Code: country.countryCode,
      imgUrl: "",
      label: 0,
      flag: 0,
      operator: 0,
      createTime: 0,
      updateTime: 0,
    }));

    // 返回成功响应
    return successResponse(formattedCountries);
  } catch (error) {
    console.error("获取国家列表失败:", error);
    return errorResponse("服务器内部错误", 500);
  }
}
