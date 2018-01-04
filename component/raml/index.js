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

      for (let item of articleContent) {
        switch (item.type) {
          case 1:
            {
              const { image } = item.image;
              const fullWidth = 750
              if (image.width * 4 < fullWidth) {
                image.height = image.height * 2
                image.width = image.width * 2
              } else {
                image.height = (image.height * fullWidth) / image.width
                image.width = fullWidth
              }
            }
            break;
        }
      }

      console.log(articleContent)


      this.setData({
        nodes: articleContent
      })
    }
  },

  ready() {
    this.init()
  },
})
