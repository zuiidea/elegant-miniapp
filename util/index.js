import { host } from './config'
import Promise from './es6-promise'

const request = (config = {}) => {
  return new Promise((resolve, reject) => {
    const cloneConfig = { ...config }
    if (cloneConfig.data) {
      const { data } = cloneConfig
      for (let [key, value] of Object.entries(data)) {
        if (cloneConfig.url.indexOf(`:${key}`) > 0) {
          cloneConfig.url = cloneConfig.url.replace(`:${key}`, value)
          delete data[key]
        }
      }
    }

    if (cloneConfig.url.indexOf('http') < 0) {
      cloneConfig.url = host + cloneConfig.url
    }


    wx.request({
      ...cloneConfig,
      success(res) {
        if (res.statusCode < 300) {
          resolve({
            data: res.data,
            success: true
          })
        } else {
          resolve({
            data: res.data,
            success: false
          })
        }
      }
    })
  })
}

Promise.prototype.finally = function (fn) {
  function finFn() {
    setTimeout(fn)
  }
  this.then(finFn, finFn)
  return this
}



const formatTime = (timestamp, relativeTimestamp = true) => {
  const currentDate = new Date()
  const current = currentDate.getTime()
  const diff = current - timestamp
  if (relativeTimestamp) {
    if (diff <= (60 * 1000)) {
      return '刚刚'
    } else if (diff <= (60 * 60 * 1000)) {
      return Math.floor(diff / (60 * 1000)) + ' 分钟前'
    } else if (diff <= (24 * 60 * 60 * 1000)) {
      return Math.floor(diff / (60 * 60 * 1000)) + ' 小时前'
    } else if (diff <= (7 * 24 * 60 * 60 * 1000)) {
      return Math.floor(diff / (24 * 60 * 60 * 1000)) + ' 天前'
    }
  }

  const date = new Date(timestamp)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  if (!relativeTimestamp &&
    currentDate.getDate() === day &&
    (currentDate.getMonth() + 1) === month &&
    currentDate.getFullYear() === year) {
    const h = date.getHours() < 10 ? '0' + date.getHours() : '' + date.getHours()
    const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : '' + date.getMinutes()
    return h + ':' + m
  }

  if (year == currentDate.getFullYear()) {
    return month + '月' + day + '日'
  }

  return year + '年' + month + '月' + day + '日'
}



module.exports = {
  request,
  Promise,
  formatTime
}
