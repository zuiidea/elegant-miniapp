import { host } from './config'
import Promise from './es6-promise'

let tid = 0
let loginTimes = 0

const apiToken = 'c400a7e21688496ca3e7f17c6b0d1846'

const request = (config = {}) => {
  return new Promise((resolve, reject) => {
    let token = ''
    try {
      token = wx.getStorageSync('token')
    } catch (e) {
    }

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

    cloneConfig.data = {
      ...cloneConfig.data,
      token: 'c400a7e21688496ca3e7f17c6b0d1846'
    }

    wx.request({
      ...cloneConfig,
      header: {
        authorization: `Bearar ${token}`
      },
      success(res) {
        if (res.statusCode === 401) {
          tid = setTimeout(() => {
            clearTimeout(tid)
            if (loginTimes < 4) {
              login().then(rres => {
                console.log(rres)
                request(cloneConfig).then(reresult => {
                  resolve(reresult)
                })
              })

              loginTimes = loginTimes + 1
            } else {
              wx.showToast({
                title: '多次登录未成功，请稍后再试或者重启',
                icon: 'fail',
                duration: 2000
              })
            }
          }, 300)
        }

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


const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        if (res.code) {
          request({
            url: '/user/login',
            data: {
              code: res.code
            },
            method: 'post',
          })
            .then(({ data }) => {
              resolve(data.userInfo)
              wx.setStorageSync('token', data.token)
            })
        }
      }
    });
  })
}

const updateUserInfo = (data) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/user',
      data,
      method: 'put',
    })
      .then(data => {
        resolve(data)
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


const getRandomNum = (Min, Max) => {
  const Range = Max - Min;
  const Rand = Math.random();
  return (Min + Math.round(Rand * Range))
}

const handleUrl = (str) => {
  return str.replace(new RegExp(/api.qingmang.me\/v1/, 'g'), 'journal.zuiidea.com/api')
    .replace(new RegExp(/qiniuimg.qingmang.mobi/, 'g'), 'journal.zuiidea.com')
    .replace(new RegExp(/api.qingmang.me\/v2/, 'g'), 'journal.zuiidea.com/api')
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
  updateUserInfo,
  Promise,
  login,
  getRandomNum,
  handleUrl,
  formatTime
}
