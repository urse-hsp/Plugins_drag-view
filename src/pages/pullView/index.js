import { useState, useEffect } from 'react'
import { View, Image } from '@tarojs/components'
import { getSystemInfo, throttleLimit } from '../utils'

import './index.scss'
import bottomIcon from '../bottom.png'

// 注意：需要页面配置整体不能上下滚动。wx是 disableScroll: true
// 位置方便根据自己的需要 进行适配
function PullView(props) {
  // calculation 滑动的点范围倍数。spot视图点。checked选中点
  const { spot = [0, 112, 531], calculation = 2, checked = 1, showHead = true } = props
  const [depositSpot, setDepositSpot] = useState([]) // 固定点
  const [location, setLocation] = useState(84) // 视图定位
  const [position, setPosition] = useState(0) // 移动前的定位 用于后续判断
  const [pageY, setPageY] = useState(0) // 触摸开始坐标
  const [time, setTime] = useState(0) // 滑动时间
  const [differenceNum, setDifferenceNum] = useState(0) // 移动的距离 判断上下

  useEffect(() => {
    let newSpot = [...spot]
    const yes = getSystemInfo() // 判断苹果x及以上环境 
    if (yes)
      newSpot = newSpot.map((item, index) => {
        if (!index) item
        else item += 20
        return item
      })

    setDepositSpot(newSpot)
    setLocation(newSpot[checked >= newSpot.length ? 0 : checked])
  }, [])

  // 手指触摸 划动起始坐标方法
  const touchStart = e => {
    console.log(e, '触摸')
    setPosition(location)
    setPageY(e.touches[0].pageY)
    setTime(e.timeStamp)
  }

  // 触摸后移动
  const touchMove = e => {
    throttleLimit(() => {
      let difference = e.touches[0].pageY - pageY // 移动后和起始值的差值
      if (position + difference <= depositSpot[0] || position + difference >= depositSpot[depositSpot.length - 1]) return // 限制滑动最大最小距离
      setLocation(position + difference)
      setDifferenceNum(difference)
    }, 17)
  }
  // 结束
  const touchEnd = e => {
    console.log(e, '结束', e.timeStamp - time < 700, e.timeStamp, time, e.timeStamp - time)

    // 判断七百毫米  40px  此功能是滑动一点距离视图就换位置
    if (e.timeStamp - time < 700 && Math.abs(differenceNum) > 40) {
      console.log('跳动')
      let inx = ''
      depositSpot.map((item, index) => {
        // 第一个点
        if (!index && position >= 0 && position <= depositSpot[0]) {
          if (differenceNum > 0) timeSet(depositSpot[1])
          console.log('第一个')
          return
        }
        // 第n个点
        if (index && position > depositSpot[index - 1] && position <= depositSpot[index]) {
          inx = index
          if (differenceNum > 0) {
            inx++
            console.log(depositSpot[inx], '下拉')
            timeSet(depositSpot[inx < depositSpot.length - 1 ? inx : depositSpot.length - 1])
          } else if (differenceNum < 0) {
            inx--
            console.log(depositSpot[inx], '下拉')
            timeSet(depositSpot[inx > 0 ? inx : 0])
          }
        }
      })
      return
    }
    // 与点击事件冲突，限制有滑动时才触发
    if (Math.abs(differenceNum) > 0) setViewLocation()
  }
  // 设置位置
  const setViewLocation = () => {
    depositSpot.map((item, index) => {
      // 第一个
      if (location <= depositSpot[0] * calculation) return timeSet(depositSpot[0])
      // 第n个
      if (index && location > depositSpot[index - 1] * calculation && location <= depositSpot[index] * calculation) timeSet(depositSpot[index])
    })
  }

  // 有时候轻微滑动出现位置没有改变的情况。设置延时渲染，
  const timeSet = n => {
    let timeSetValid = setTimeout(() => {
      setLocation(n)
      timeSetValid = null
      clearTimeout(timeSetValid)
    }, 50)
  }

  // 点击
  const click = () => {
    depositSpot.map((item, index) => {
      // 第一个
      if (location === depositSpot[0]) return timeSet(depositSpot[1])
      // 第n个
      if (index && item === location) {
        timeSet(location == depositSpot[depositSpot.length - 1] ? depositSpot[index - 1] : depositSpot[index + 1])
      }
    })
  }

  return (
    <View
      className='pullView'
      style={`transform: translateY(${location * 2}rpx);`}
      ontouchstart={touchStart}
      ontouchmove={touchMove}
      ontouchend={touchEnd}
    >
      {showHead && (
        <View className='head' onClick={click}>
          <Image src={bottomIcon} style={location === depositSpot[depositSpot.length - 1] ? 'transform: rotate(180deg);' : ''} />
        </View>
      )}
      {props.children}
    </View>
  )
}

export default PullView
