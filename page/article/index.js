import { request, handleUrl, formatTime } from '../../util/index'
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
    loading: true,
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
        url: 'category.get',
        data: {
          category_id: id
        }
      }).then(({ data, success }) => {
        if (success) {
          wx.setNavigationBarTitle({
            title: data.category.name,
          })
          this.setData({
            current: data.category.subCategories[0].categoryId,
            categories: data.category.subCategories.map(item => ({
              id: item.categoryId,
              name: item.name
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
    const { hasMore, hasPreMore, nextUrl } = odata
    this.setData({
      data: {
        ...data,
        [current]: {
          loading: false,
          ...data[current],
          hasPreMore,
          hasMore,
          nextUrl,
          // list: odata.list,
          list: (hasPreMore ? list : []).concat(odata.list).map(item => ({
            ...item,
            date: formatTime(item.crawlerTimestamp)
          }))
        }
      }
    })
  },

  fetch(options = {}) {
    const { current, data } = this.data
    const { nextUrl = '' } = options

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
      url: nextUrl || 'article.list',
      data: {
        category_id: current
      }
    }).then(({ data, success }) => {
      if (success) {
        data = JSON.parse(handleUrl(JSON.stringify(data)))
        this.handleData({
          list: data.articles,
          hasMore: data.hasMore,
          nextUrl: data.nextUrl,
          hasPreMore: data.hasPreMore
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
    const { hasMore, nextUrl, dataLoading } = data[current]
    const { scrollTop } = options
    const { windowHeight } = wx.getSystemInfoSync()

    const delta = scrollTop - beforeScrollTop
    this.setData({
      scrollDirection: delta > 0 ? 'down' : 'up',
      scrollTop,
    })

    beforeScrollTop = scrollTop

    wx.createSelectorQuery().select('#container').boundingClientRect(({ height }) => {
      if ((height - scrollTop - windowHeight - 335) < 0) {
        if (hasMore && !dataLoading) {
          clearTimeout(timeId)
          timeId = setTimeout(() => {
            this.fetch({
              nextUrl
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
