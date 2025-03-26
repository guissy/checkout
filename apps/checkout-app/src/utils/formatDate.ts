const formatDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

export const formatDateNum = (): string => {
  return formatDate(new Date()).replace(/\D/g, "");
};

export default formatDate;
