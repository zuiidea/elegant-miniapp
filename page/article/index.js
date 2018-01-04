import { request, handleUrl, formatTime } from '../../util/index'
import videoPlayer from '../../component/videoPlayer/index'
import scrollTag from '../../component/scrollTag/index'
console.log(videoPlayer)

let timeId = 0

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
            categories: data.category.subCategories
          }, () => {
            resolve()
          })
        }
      })
    })

  },

  handleData(odata) {
    const { data, current } = this.data
    const { list = [] } = data
    const { hasMore, hasPreMore, nextUrl } = odata
    this.setData({
      dataLoading: false,
      data: {
        ...data,
        [current]: {
          ...data[current],
          hasPreMore,
          hasMore,
          nextUrl,
          list: odata.list,
          list: (hasPreMore ? list : []).concat(odata.list).map(item => ({
            ...item,
            date: formatTime(item.crawlerTimestamp)
          }))
        }
      }
    })
  },

  fetch(options = {}) {
    const { current } = this.data
    const { nextUrl = '' } = options
    this.setData({
      dataLoading: true,
    })

    request({
      url: nextUrl.replace('https://api.qingmang.me/v2/', '') || 'article.list',
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
    const { hasMore, nextUrl, dataLoading } = this.data
    const { scrollTop } = options
    const { windowHeight } = wx.getSystemInfoSync()

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
    wx.navigateTo({
      url: '/page/article/detail/index?id=' + id,
    })
  }

})
