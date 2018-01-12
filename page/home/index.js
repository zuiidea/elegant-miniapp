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
      url: 'provider',
      data:{
        limit:100
      }
    }).then(({ data, success }) => {
      this.setData({
        data
      })
    })
  },
  onShareAppMessage(){
    
  }

})
