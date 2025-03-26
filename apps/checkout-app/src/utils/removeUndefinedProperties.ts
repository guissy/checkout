// 定义一个泛型类型，移除值为 undefined 的属性
type NoUndefined<T> = {
  [K in keyof T]: T[K] extends object ? NoUndefined<T[K]> : Exclude<T[K], undefined>;
};

// 主函数
function removeUndefinedProperties<T>(obj: T): NoUndefined<T> {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      removeUndefinedProperties(obj[key] as T); // 递归调用
      // 如果子对象在递归后变为空，则删除该键
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
  return obj as NoUndefined<T>;
}

export default removeUndefinedProperties;
