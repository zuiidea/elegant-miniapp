import { request, handleUrl, formatTime } from '../../../util/index'

const app = getApp()

Page({

  data: {
  },

  onLoad(options) {
    new app.Toast()
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