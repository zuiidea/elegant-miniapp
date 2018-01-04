import { Promise } from './index'

const chooseAddress = () => {
  return new Promise(function (resolve, reject) {
    wx.chooseAddress({
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res.errMsg)
      }
    })
  })
}

const handleModal = ({ content, key }) => {
  return new Promise(function (resolve, reject) {
    wx.showModal({
      title: '',
      content,
      showCancel: true,
      confirmText: '前去设置',
      confirmColor: '#09bb37',
      success: (res) => {
        if (res.confirm) {
          resolve()
        } else {
          reject({ errMsg: key + ':cancelSetting' })
        }
      }
    })
  })
}

const handleOpenSetting = () => {
  return new Promise((resolve, reject) => {
    wx.openSetting({
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  })
}

const getAuthWritePhotosAlbum = () => {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  })
}

const authImageToPhotosAlbum = () => {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          getAuthWritePhotosAlbum()
            .then(() => {
              resolve(res)
            })
            .catch(({ errMsg }) => {
              if (errMsg === 'authorize:fail auth deny') {
                handleModal({ content: '请先完成授权！在设置页面中勾选"保存到相册"选项，否则无法保存图片。', key: 'writePhotosAlbum' })
                  .then(rres => {
                    return handleOpenSetting()
                  })
                  .then((rres) => {
                    if (rres.authSetting['scope.writePhotosAlbum']) {
                      resolve(rres)
                    } else {
                      rres.errMsg = 'saveImageToPhotosAlbum:fail unauthorize'
                      reject(rres)
                    }
                  })
                  .catch(rres => {
                    reject(rres)
                  })
              }
            })
        } else {
          resolve(res)
        }
      }
    })
  })
}


const getUserInfo = () => {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  })
}


const authGetUserInfo = () => {
  return new Promise(function (resolve, reject) {
    getUserInfo()
      .then(res => {
        resolve(res)
      })
      .catch(({ errMsg }) => {
        if (errMsg === 'getUserInfo:fail auth deny') {
          handleModal({ content: '请先完成授权！在设置页面中勾选"用户信息"选项，否则部分功能将受限。', key: 'userInfo' })
            .then(res => {
              return handleOpenSetting()
            })
            .then((res) => {
              if (res.authSetting['scope.userInfo']) {
                getUserInfo().then(res => {
                  resolve(res)
                })
              } else {
                res.errMsg = 'userInfo:fail unauthorize'
                reject(res)
              }
            })
            .catch(res => {
              reject(res)
            })
        }

      })
  })
}


module.exports = {
  authImageToPhotosAlbum,
  authGetUserInfo,
}