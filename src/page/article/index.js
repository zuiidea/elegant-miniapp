import { request, formatTime } from '../../util/index'
import videoPlayer from '../../component/videoPlayer/index'
import scrollTag from '../../component/scrollTag/index'

let timeId = 0
let beforeScrollTop = 0
let startX = 0
let startY = 0

Page({
  ...scrollTag,
  ...videoPlayer,

  data: {
    currentPlayId: null,
    current: null,
    data: {

    }
  },

  onLoad(options) {
    this.setData(options, () => {
      this.fetchCategory().then(() => {
        this.fetch()
      })
    })
  },

  fetchCategory() {
    const { id } = this.data
    return new Promise((resolve, reject) => {
      request({
        url: 'provider/:id',
        data: {
          id
        }
      }).then(({ data, success }) => {
        if (success) {
          wx.setNavigationBarTitle({
            title: data.name,
          })
          this.setData({
            current: data.categories[0].categoryId,
            categories: data.categories.map(item => ({
              ...item,
              id: item.categoryId
            }))
          }, () => {
            resolve()
          })
        }
      })
    })

  },

  handleData(odata) {
    const { data, current } = this.data
    const currentData = data[current] || {}
    const { list = [] } = currentData
    const { offset } = odata
    this.setData({
      data: {
        ...data,
        [current]: {
          ...data[current],
          hasMore: odata.list.length === 10,
          loading: false,
          offset,
          list: (offset === 0 ? [] : list).concat(odata.list).map(item => ({
            ...item,
            date: formatTime(item.publishTimestamp)
          }))
        }
      }
    })
  },

  fetch(options = {}) {

    const { current, data, id } = this.data
    const { offset = 0 } = options

    if (!data[current]) {
      this.setData({
        data: {
          ...this.data.data,
          loading: true,
          [current]: {}
        },
      })
    }

    request({
      url: 'article',
      data: {
        provider: id,
        categoryId: current,
        offset
      }
    }).then(({ data, success }) => {
      if (success) {
        this.handleData({
          list: data,
          offset: offset,
        })
      }
    })
      .finally(() => {
        this.setData({
          loading: false
        })
      })

  },

  onPageScroll(options) {
    const { data, current } = this.data
    const { hasMore, offset = 0, loading } = data[current]
    const { scrollTop } = options
    const { windowHeight } = wx.getSystemInfoSync()

    const delta = scrollTop - beforeScrollTop
    this.setData({
      scrollDirection: delta > 0 ? 'down' : 'up',
      scrollTop,
    })

    beforeScrollTop = scrollTop
    wx.createSelectorQuery().select('#container').boundingClientRect(({ height }) => {
      if ((height - scrollTop - windowHeight - 2000) < 0) {
        if (hasMore && !loading) {
          clearTimeout(timeId)
          timeId = setTimeout(() => {
            this.fetch({
              offset: offset + 10
            })
          }, 300)
        }
      }
    }).exec()
  },

  handleVideoCover(e) {
    this.handleGoDetail(e)
  },

  handleGoDetail(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      currentPlayId: null,
    })
    wx.navigateTo({
      url: '/page/article/detail/index?id=' + id,
    })
  },

  handleSrollTagTap(e) {
    const { id } = e.currentTarget.dataset
    this.handleSetCurrent(id)
  },

  handleTouchStart(e) {
    const { touches, currentTarget } = e
    startX = touches[0].clientX
    startY = touches[0].clientY

  },
  handleTouchEnd(e) {
    const { changedTouches, currentTarget } = e
    const endX = changedTouches[0].clientX
    const endY = changedTouches[0].clientY

    const deltaY = startY - endY
    const deltaX = startX - endX

    if (deltaY > -20 && deltaY < 20) {
      if (deltaX > 50) {
        this.handleNext()
      }
      if (deltaX < -50) {
        this.handlePre()
      }
    }
  },

  handleSetCurrent(id) {
    this.setData({
      current: id
    }, () => {
      this.handleScrollTagScroll()
      if (!this.data.data[id]) {
        this.fetch()
      }
    })
  },

  handleNext() {
    const { current, categories } = this.data
    let currentIndex = 0

    categories.forEach((item, index) => {
      if (item.id === current) {
        currentIndex = index
      }
    })

    const nextIndex = (currentIndex + 1) === categories.length ? currentIndex : (currentIndex + 1)
    this.handleSetCurrent(categories[nextIndex].id)
  },

  handlePre() {
    const { current, categories } = this.data
    let currentIndex = 0

    categories.forEach((item, index) => {
      if (item.id === current) {
        currentIndex = index
      }
    })

    const nextIndex = currentIndex === 0 ? 0 : (currentIndex - 1)
    this.handleSetCurrent(categories[nextIndex].id)
  }

})
