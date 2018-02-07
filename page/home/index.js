import { request, handleUrl } from '../../util/index'

const blackList = [
  'acom.aol.mobile.engadget',
  'acom.bdatu.geography',
  'acom.businessvalue.android.app',
  'acom.caing.news',
  'acom.baozoumanhua.android',
  'acom.fivehundredpx.viewer',
  'acom.happyjuzi.apps.juzi',
  'acom.neihanshe.intention'
  ]

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
      const list = data.filter(item => blackList.indexOf(item.packageName) < 0)

      const result = [];
      for (var i = 0; i < list.length; i += 20) {
        result.push(list.slice(i, i + 20))
      }

    
      this.setData({
        data: result
      })
    })
  },
  onShareAppMessage(){
    
  }

})
