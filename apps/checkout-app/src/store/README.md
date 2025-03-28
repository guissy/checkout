# 结账应用状态管理

本目录包含使用 Zustand 实现的状态管理方案。相比于传统的 Redux 或 Context API，Zustand 提供了更简单、更灵活的状态管理体验。

## 状态仓库结构

### 1. 订单状态 (`useOrderStore.ts`)

管理支付订单的基本信息，包括：
- 订单金额和币种
- 商户信息
- 订单参考号
- 网络请求状态和错误处理

```typescript
const { 
  token, 
  paymentOrderInfo,
  netError, 
  setNetError 
} = useOrderStore();
```

### 2. 支付方式状态 (`usePaymentMethodStore.ts`)

管理可用的支付方式列表和当前选择的支付方式：
- 可用支付方式列表
- 当前选择的支付方式
- 支付方式加载状态
- 支持的国家和币种

```typescript
const { 
  currentPay, 
  setCurrentPay, 
  paymentMethods, 
  hasPaymentMethod 
} = usePaymentMethodStore();
```

### 3. 表单状态 (`useFormStore.ts`)

管理用户输入的表单数据：
- 信用卡、银行账号等支付信息
- 用户基本信息
- 表单提交状态
- 重定向状态

```typescript
const { 
  formValue, 
  setFormValue, 
  submitting, 
  redirecting, 
  handleFormSubmit 
} = useFormStore();
```

### 4. 货币状态 (`useCurrencyStore.ts`)

管理货币选择和兑换相关的状态：
- 当前选择的货币
- 兑换金额
- 兑换汇率信息
- 货币弹窗状态

```typescript
const { 
  currency, 
  setCurrency, 
  outAmount, 
  currencyLoading 
} = useCurrencyStore();
```

## 中央提供者 (`StoreProvider.tsx`)

提供状态上下文和初始化功能：
- 初始化订单和支付方式数据
- 处理全局加载状态
- 提供统一的错误处理

```tsx
<StoreProvider>
  <App />
</StoreProvider>
```

## 使用示例

### 基本状态使用

```tsx
// 在组件中使用状态
const MyComponent = () => {
  // 获取订单和支付方式信息
  const { paymentOrderInfo } = useOrderStore();
  const { currentPay, setCurrentPay } = usePaymentMethodStore();
  
  // 获取表单状态
  const { formValue, setFormValue, submitting } = useFormStore();
  
  // 获取货币状态
  const { currency, setCurrency } = useCurrencyStore();
  
  // 使用状态...
  return (
    <div>
      <h1>{paymentOrderInfo?.productName}</h1>
      {/* 组件内容 */}
    </div>
  );
};
```

### 表单提交处理

```tsx
// 使用表单提交方法
const CheckoutForm = () => {
  const { token, paymentOrderInfo, setNetError } = useOrderStore();
  const { currentPay } = usePaymentMethodStore(); 
  const { 
    formValue, 
    submitting, 
    redirecting,
    handleFormSubmit 
  } = useFormStore();
  const { currency, outAmount } = useCurrencyStore();
  const navigate = useRouter().push;
  const { validateFieldList } = useValidator();
  const { country } = useCountry();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleFormSubmit(e, {
      token,
      currentPay,
      paymentOrderInfo,
      country,
      currency,
      outAmount,
      validateFieldList,
      navigate,
      setNetError,
      goToSuccess: (data) => {
        // 处理成功回调
        navigate(`/success?reference=${data.pspReference}`);
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
      <button 
        type="submit" 
        id="pay-btn"
        disabled={submitting || redirecting}
      >
        支付
      </button>
    </form>
  );
};
```

## 基于 Token 的状态隔离

### 问题背景

在结账应用中，多个不同的订单可能使用同一个浏览器窗口打开。如果使用普通的持久化机制，不同订单的状态会相互覆盖，导致数据混乱。为解决这个问题，我们实现了基于 token 的状态隔离机制。

### 实现原理

1. **存储键名生成**：为每个存储键名添加 token 前缀
   ```typescript
   // 从 token 中提取前8位作为键名前缀
   const tokenPrefix = token.slice(0, 8);
   const storageKey = `payment-method-storage-${tokenPrefix}`;
   ```

2. **动态存储实例**：根据 token 创建不同的存储实例
   ```typescript
   // 创建带有指定token的存储实例
   const store = createTokenBasedPaymentMethodStore(token);
   ```

3. **状态追踪**：在每个状态存储中添加 `currentToken` 字段，用于跟踪 token 变化
   ```typescript
   // 检查token是否变化
   if (get().currentToken !== token) {
     console.log('Token已更新，重置状态');
     set({ 
       currentToken: token,
       // 重置其他状态...
     });
   }
   ```

4. **自动清理**：当 token 变化时，通过设置新的存储键名，自动隔离旧数据

### 工具函数

为支持基于 token 的存储管理，我们提供以下工具函数：

```typescript
// 生成带有token的存储键
const storageKey = getStorageKeyWithToken('payment-method-storage', token);

// 清除特定token的存储
clearStorageByToken(token);
```

### 各存储的持久化字段

1. **订单状态** (`order-storage-[tokenPrefix]`):
   - `token`: 订单标识
   - `paymentOrderInfo`: 订单详细信息
   - `isInitialized`: 是否已初始化

2. **支付方式状态** (`payment-method-storage-[tokenPrefix]`):
   - `currentPay`: 当前选择的支付方式
   - `currentPayN`: 当前支付方式索引
   - `isLoaded`: 是否已加载
   - `paymentMethods`: 可用支付方式列表
   - `paymentMethodsRaw`: 原始支付方式列表
   - `hasPaymentMethod`: 是否有可用支付方式
   - `currentToken`: 当前使用的token

3. **表单状态** (`form-storage-[tokenPrefix]`):
   - `formValue`: 表单值
   - `currentToken`: 当前使用的token

4. **货币状态** (`currency-storage-[tokenPrefix]`):
   - `currency`: 当前选择的货币
   - `currentToken`: 当前使用的token

### 刷新页面流程

当用户刷新页面时：

1. 首先从 sessionStorage 恢复所有存储的状态
2. StoreProvider 检查 token 是否与存储的 token 一致：
   - 如果一致，直接使用缓存的数据
   - 如果不一致，清除旧数据并初始化新数据
3. 即使刷新页面，也能保持用户之前的选择和输入，前提是 token 未变化

## 全局重置

可以通过 `resetAllStores` 函数重置所有状态：

```typescript
import { resetAllStores } from '@/store';

// 重置所有状态
resetAllStores();
```

此外，还可以清除特定 token 的存储：

```typescript
import { clearStorageByToken } from '@/store';

// 清除特定token的所有存储
clearStorageByToken(token);
```

## 注意事项

- 对于包含复杂结构（如 Map）的状态，需要在持久化前进行特殊处理
- 只持久化必要的字段，避免存储过多数据
- 使用 `sessionStorage` 而非 `localStorage`，确保用户关闭标签页后数据会被清除
- 不同 token 的状态相互隔离，确保数据安全性 