import videoPlayer from '../videoPlayer/index'

Component({
  properties: {
    currentPlayId: String,
    content: {
      type: String,
      value: '',
      observer(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      }
    },
    nodes: {
      type: Object,
    }
  },

  data: {
    nodes: {}
  },

  methods: {

    ...videoPlayer,
    handleVideoCover(){},

    init() {
      const content = this.data.content || '[]'
      const articleContent = JSON.parse(content)

      this.setData({
        nodes: articleContent
      })
    }
  },

  ready() {
    this.init()
  },
})
