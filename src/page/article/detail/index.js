import { request, handleUrl, formatTime } from '../../../util/index'
Page({

  data: {
  },

  onLoad(options) {
    this.setData(options, () => {
      this.fetch()
    })
  },


  fetch() {
    const { id } = this.data
    request({
      url: 'article/:id',
      data: {
        id
      }
    })
      .then(({ data, success }) => {
        if (success) {

          wx.setNavigationBarTitle({
            title: data.title,
          })

          data.date = formatTime(data.publishTimestamp)
          this.setData(data)
        }
      })
  },

})