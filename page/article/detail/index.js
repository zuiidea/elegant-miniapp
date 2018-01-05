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
      url: '/article.get',
      data: {
        id,
        format: 'raml'
      }
    })
      .then(({ data, success }) => {
        if (success) {
          const article = JSON.parse(handleUrl(JSON.stringify(data.article)))
          wx.setNavigationBarTitle({
            title: article.title,
          })

          article.date = formatTime(article.publishTimestamp)
          this.setData(article)
        }
      })
  },

})