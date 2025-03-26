import { useEffect, useState } from 'react';
import isMobileScreen from './isMobileScreen';

const useKeyboardStatus = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  // const initialHeight = window.innerHeight;
  const [initialHeight, setInitialHeight] = useState(0);
  useEffect(() => {
    setInitialHeight(window.innerHeight)
  }, []);
  // const [type, setType] = useState('');
  useEffect(() => {
    // const handleFocus = () => {
    //   setType('focus')
    //   setKeyboardVisible(true);
    // };
    //
    // const handleBlur = () => {
    //   setKeyboardVisible(false);
    // };

    const handleResize = () => {
      if (window.visualViewport) {
        // 使用 visualViewport API 检测键盘弹出
        // setType('visualViewport')
        setKeyboardVisible(window.visualViewport.height < initialHeight);
      } else {
        // 通过窗口高度变化检测键盘弹出
        // setKeyboardVisible(window.innerHeight < initialHeight);
      }
    };

    // const inputElements = document.querySelectorAll('input[type=text], textarea');
    //
    // // 添加 focus 和 blur 事件监听器
    // inputElements.forEach((input) => {
    //   input.addEventListener('focus', handleFocus);
    //   input.addEventListener('blur', handleBlur);
    // });

    // 添加 resize 事件监听器
    window.addEventListener('resize', handleResize);

    // 如果支持 visualViewport API，监听其变化
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    // 清除事件监听器
    return () => {
      // inputElements.forEach((input) => {
      //   input.removeEventListener('focus', handleFocus);
      //   input.removeEventListener('blur', handleBlur);
      // });
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [initialHeight]);
  const isMobile = isMobileScreen();

  return isMobile && isKeyboardVisible;
};

export default useKeyboardStatus;
