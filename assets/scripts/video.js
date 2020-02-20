var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
  extends: cc.Component,
  properties: {
    videoPlayer: cc.Node,
    btn: cc.Sprite,
    slider: cc.Node,
    sliderProgressBg: cc.Node,
    timeLabel: cc.Label,
    btnSF: [cc.SpriteFrame],
  },

  start() {

  },
  onLoad() {
    this.gotoGameData = gameLocalData.GotoGameData;
    this.data = gameLocalData.GameData.exercise.exerciseState[this.gotoGameData.sectionId];
    this.currentTime = 0;
    this.timeLabel.string = "00:00/00:00";
    this.slider.getComponent(cc.Slider).progress = 0;
    this.sliderProgressBg.width = 0;
    this.isLoaded = false;
    this.videoPlayer.getComponent(cc.VideoPlayer).remoteURL = this.data.url;//"https://scratch-videos.hetao101.com/469d3d02264cb5b955ee63472c33f2fe_vd12_uid2375193.mp4"
    this.videoPlayer.getComponent(cc.VideoPlayer).play();
    this.videoPlayer.getComponent(cc.VideoPlayer).stop();
    this.videoPlayer.on("meta-loaded", () => {
      this.isLoaded = true;
      this.duration = this.videoPlayer.getComponent(cc.VideoPlayer).getDuration();
      cc.log("this.duration======" + this.duration + " url=" + this.data.url)
      this.refreshVideoTime();
    })
    this.videoPlayer.on("paused", () => {
      cc.log("pause")
      this.btn.spriteFrame = this.btnSF[0];
    })
    this.videoPlayer.on("stopped", () => {
      cc.log("stopped")
      this.btn.spriteFrame = this.btnSF[0];
    })
    this.videoPlayer.on("playing", () => {
      cc.log("play")
      this.btn.spriteFrame = this.btnSF[1];
    })
    this.videoPlayer.on("completed", () => {
      cc.log("completed")
    })
  },
  refreshVideoTime() {
    if (!this.duration) return;
    this.currentTime = this.videoPlayer.getComponent(cc.VideoPlayer).currentTime;
    this.refreshTimeLabel();
    let progress = this.currentTime / this.duration;
    progress = Math.min(progress, 1);
    this.slider.getComponent(cc.Slider).progress = progress;
    this.sliderProgressBg.width = progress * this.slider.width;
  },
  refreshTimeLabel() {
    let currentTime = Math.min(this.currentTime, this.duration);
    this.timeLabel.string = this.secondToTime(currentTime) + "/" + this.secondToTime(this.duration);
  },
  secondToTime(second) {
    second = Math.ceil(second);
    let m = Math.floor(second / 60);
    if (m < 10) m = "0" + m;
    let s = second % 60;
    if (s < 10) s = "0" + s;
    return m + ":" + s;
  },
  secondToTimesecondToTime(second) {
    second = Math.ceil(second);
    let m = Math.floor(second / 60);
    if (m < 10) m = "0" + m;
    let s = second % 60;
    if (s < 10) s = "0" + s;
    return m + ":" + s;
  },
  videoPlayCallback() {
    let isPlaying = this.videoPlayer.getComponent(cc.VideoPlayer).isPlaying();
    if (isPlaying) {
      this.videoPlayer.getComponent(cc.VideoPlayer).pause();
      this.btn.spriteFrame = this.btnSF[0];
    } else {
      let eventStr = this.isCreate ? "learning_create_video_play_click" : "learning_work_video_play_click";
      let putData = {
        //id: this.workData.id
      }
      //window.ShellJS().requestTrack(eventStr, null, null, this.isCreate ? null : putData, null, null, null, this.isCreate ? putData : null);
      this.videoPlayer.getComponent(cc.VideoPlayer).resume();
      this.btn.spriteFrame = this.btnSF[1];
    }
  },
  sliderEvent() {
    if (!this.isLoaded) {
      this.slider.getComponent(cc.Slider).progress = 0;
      return;
    }
    var progress = this.slider.getComponent(cc.Slider).progress;
    this.videoPlayer.getComponent(cc.VideoPlayer)._impl._video.currentTime = this.currentTime = this.duration * progress;
    this.refreshTimeLabel();
    this.sliderProgressBg.width = progress * this.slider.width;
  },
  update() {
    let isPlaying = this.videoPlayer.getComponent(cc.VideoPlayer).isPlaying();
    if (!isPlaying) return;
    this.refreshVideoTime();
  },
});
