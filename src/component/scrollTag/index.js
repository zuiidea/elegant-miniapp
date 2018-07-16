const ScrollTag = {
  handleScrollTagScroll () {
    const { current } = this.data
    wx.createSelectorQuery().select('#scrollTag' + current).boundingClientRect((rect) => {
      wx.createSelectorQuery().select('#scrollTagSwiperTabs').scrollOffset((res) => {
        wx.createSelectorQuery().selectViewport().boundingClientRect(rres => {
          this.setData({
            scrollLeft: res.scrollLeft + rect.left - rres.width / 2 + rect.width / 2
          })
        }).exec()
      }).exec()
    }).exec()
  }
}

module.exports = ScrollTag