import Taro from '@tarojs/taro'

export const getSystemInfo = () => {
  let yes = false
  Taro.getSystemInfo({
    success: res => {
      // 判断苹果x及以上机型 x及以上的异形屏top为44，非异形屏为20
      if (res.safeArea.top > 20) yes = true
    }
  })
  return yes
}

let valid = false
// 节流阀
export const throttleLimit = (fn, delay) => {
  if (valid) return
  valid = setTimeout(() => {
    fn()
    valid = false
    clearTimeout(valid)
  }, delay)
}
