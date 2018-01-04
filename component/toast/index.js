/**
 * WeToast by kiinlam
 * WeApp Toast add-ons
 * 微信小程序toast增强插件
 * Github: https://github.com/kiinlam/wetoast
 * LICENSE: MIT
 */

function Toast() {

  //构造函数
  function WeToast() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    this.__page = curPage
    this.__timeout = null

    //附加到page上，方便访问
    curPage.toast = this

    return this
  }

  //切换显示/隐藏
  WeToast.prototype.toast = function (data) {
    try {
      if (!data) {
        this.hide()
      } else {
        this.show(data)
      }
    } catch (err) {
      console.error(err)

      // fail callback
      data && typeof data.fail === 'function' && data.fail(data)
    } finally {
      // complete callback
      data && typeof data.complete === 'function' && data.complete(data)
    }
  }

  WeToast.prototype.info = function (data) {
    this.toast({
      title: '提示信息',
      icon: 'https://www.kkguan.com/miniapp/image/toast/info.svg',
      iconClass: 'icon-toast-info',
      ...data
    })
  }

  WeToast.prototype.success = function (data) {
    this.toast({
      title: '成功信息',
      icon: 'https://www.kkguan.com/miniapp/image/toast/success.png',
      iconClass: 'icon-toast-success',
      ...data
    })
  }

  WeToast.prototype.fail = function (data) {
    this.toast({
      title: '失败信息',
      icon: 'https://www.kkguan.com/miniapp/image/toast/fail.png',
      iconClass: 'icon-toast-fail',
      ...data
    })
  }

  WeToast.prototype.loading = function (data) {
    this.toast({
      icon: 'https://www.kkguan.com/miniapp/image/toast/loading.png',
      iconClass: 'icon-toast-loading',
      title: '处理中...',
      duration: 200000,
      ...data
    })
  }

  //显示
  WeToast.prototype.show = function (data) {
    let page = this.__page

    clearTimeout(this.__timeout)

    //display需要先设置为block之后，才能执行动画
    page.setData({
      __wetoast__: {
        reveal: true,
        ...data
      }
    })

    setTimeout(() => {
      let animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in-out'
      })
      animation.opacity(1).step()
      data.animationData = animation.export()
      data.reveal = true
      page.setData({
        __wetoast__: data
      })
    }, 300)

    if (data.duration === 0) {
      // success callback after toast showed
      setTimeout(() => {
        typeof data.success === 'function' && data.success(data)
      }, 230)
    } else {
      this.__timeout = setTimeout(() => {
        this.toast()

        // success callback
        typeof data.success === 'function' && data.success(data)
      }, (data.duration || 1000) + 200)
    }

  }

  //隐藏
  WeToast.prototype.hide = function () {
    let page = this.__page

    clearTimeout(this.__timeout)

    if (!page.data.__wetoast__.reveal) {
      return
    }

    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    animation.opacity(0).step()
    page.setData({
      '__wetoast__.animationData': animation.export()
    })

    setTimeout(() => {
      page.setData({
        __wetoast__: { 'reveal': false }
      })
    }, 300)
  }

  return new WeToast()
}

module.exports = Toast