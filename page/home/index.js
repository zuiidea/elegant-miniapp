import { request, handleUrl } from '../../util/index'

Page({

  data: {
    data: []
  },

  onLoad() {
    this.fetch()
  },

  fetch() {
    request({
      url: 'category.list',
    }).then(({ data, success }) => {
      this.setData({
        data: data.categories.reverse()
      })
    })
  },
  onShareAppMessage(){
    
  }

})
