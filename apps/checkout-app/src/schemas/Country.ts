import { z } from "zod";

export const CountrySchema = z
  .object({
    id: z.number(),
    countryId: z.string().min(1).max(3),
    iso2Code: z.string().length(2),
    countryCode: z.string().length(2),
    countryNameEn: z.string().max(256),
    countryNameCn: z.string().max(256),
  })
  .strict();

const CountrySchemaIdStr = z.object({
  ...CountrySchema.shape,
  iso3Code: z.string().length(3),
  countryId: z.number(),
  imgUrl: z.string(),
  label: z.number(),
  flag: z.number(),
  operator: z.number(),
  createTime: z.number(),
  updateTime: z.number(),
});

export const CountryOutputSchema = z.array(CountrySchemaIdStr);

export type Country = z.infer<typeof CountrySchema>;
export type CountryOutput = z.infer<typeof CountryOutputSchema>;
