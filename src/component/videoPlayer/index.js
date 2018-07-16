const videoPlayer = {
  handleVideoPlay(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      currentPlayId: id,
    })
  },

  handleVideoClose() {
    this.setData({
      currentPlayId: null,
    })
  },
}

module.exports = videoPlayer