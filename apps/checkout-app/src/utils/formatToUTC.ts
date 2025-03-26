/**
 * @example
 * ```ts
 * const expiresAt = "2024-08-13T07:47:00.316";
 * const formattedDate = formatToUTC(expiresAt);
 * console.log(formattedDate);  // Output: "2024-08-13 07:47:00 UTC"
 * ```
 */
const formatToUTC = (expiresAt: string | number): string => {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  // Extracting parts of the date
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  // Formatting into the desired string format
  return year > 0 ? `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC` : expiresAt as string;
};

export default formatToUTC;


