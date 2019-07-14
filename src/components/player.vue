<template>
  <div
    class="player_wrapper"
    :id="'player-wrapper-' + videoId"
    :data-aspect-ratio="`${aspectRatio}`"
    tabindex="1"
  >
    <div
      class="video_container"
      :id="'video-container-' + videoId"
      :class="{
        preloaded: this.playerStatus.status === 'preloaded',
        error: this.playerStatus.status === 'error',
        loaded:
          this.playerStatus.status === 'loaded' &&
          !this.playerStatus.isBuffering,
        playing: this.playerStatus.status === 'playing',
        paused: this.playerStatus.status === 'paused',
        buffer: this.playerStatus.isBuffering,
        overlay_on: this.playerEvents.isMouseOver,
        overlay_off: this.playerEvents.isFadeIn,
        settings_on: this.playerStatus.settings.status
      }"
    >
      <div class="buffer_container">
        <div class="buffer_wrap">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      <div class="error_container">
        <div class="error_wrap" v-html="text.error"></div>
      </div>

      <div class="video_wrapper" :id="'video-wrapper-' + videoId"></div>
      <div
        class="video_overlay"
        :class="{
          loaded:
            this.playerStatus.status === 'loaded' &&
            !this.playerStatus.isBuffering
        }"
        @click.self="togglePlayPause"
        :id="'player-overlay-' + videoId"
        @mouseover="(playerEvents.isMouseOver = true), mouseIsOver()"
        @mouseleave="playerEvents.isMouseOver = false"
      >
        <div class="settings_container" v-if="playerStatus.settings.status">
          <div class="settings_wrapper">
            <div class="settings_top">
              <div
                class="settings_back"
                v-if="playerStatus.settings.onestep"
                @click="stepBack"
              >
                <ArrowLeft />
              </div>
              <div
                class="settings_title"
                v-html="playerStatus.settings.title"
              ></div>
              <div class="settings_close" @click="toggleSettings">
                <Close />
              </div>
            </div>
            <div class="ovf">
              <ul
                class="settings_content"
                :class="{ onestep: playerStatus.settings.onestep }"
              >
                <li class="lista" @click.stop="settingsSlide('quality')">
                  <div class="cnt" v-html="text.quality"></div>
                  <div
                    class="settings_status"
                    v-html="playerStatus.quality.current"
                  ></div>
                  <div class="icon">
                    <ArrowRight />
                  </div>
                  <ul
                    class="sublista"
                    v-if="playerStatus.settings.currentTab === 1"
                  >
                    <li
                      class="lista"
                      v-for="(q, index) in playerStatus.quality.video"
                      :key="index"
                    >
                      <div
                        @click.self.stop="changeQuality(q)"
                        class="cnt"
                        v-html="q"
                      ></div>
                      <div
                        class="icon"
                        v-if="playerStatus.quality.current === q"
                      >
                        <Checked />
                      </div>
                    </li>
                  </ul>
                </li>
                <li class="lista" @click="settingsSlide('speed')">
                  <div class="cnt" v-html="text.speed"></div>
                  <div
                    class="settings_status"
                    v-html="playerStatus.speed.current"
                  ></div>
                  <div class="icon">
                    <ArrowRight />
                  </div>
                  <ul
                    class="sublista spd"
                    v-if="playerStatus.settings.currentTab === 2"
                  >
                    <li
                      class="lista"
                      v-for="(s, index) in playerStatus.speed.speeds"
                      :key="index"
                    >
                      <div
                        @click.self.stop="changeSpeed(s)"
                        class="cnt"
                        v-html="s"
                      ></div>
                      <div class="icon" v-if="playerStatus.speed.current === s">
                        <Checked />
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="gradient_container"></div>
        <div class="play_btn_wrapper">
          <PlayCircle class="play" />
          <PauseCircle class="pause" />
        </div>
        <div class="controls_container">
          <div class="controls_wrapper">
            <div class="seek_wrapper">
              <div
                class="seek-wrapper"
                :id="'seek-wrapper-seekbar-' + videoId"
                :class="{ preview: this.seekbar.preview }"
                @click.stop="seekControl"
                @mouseover="seekbar.preview = true"
                @mouseout="seekbar.preview = false"
                @mousemove="seekOver"
                @mousedown="seekDown('seekbar')"
                @touchmove="seekDown('seekbar')"
              >
                <div
                  class="seek_preview"
                  :data-aspect-ratio="`${aspectRatio}`"
                  :style="{
                    left: this.seekbar.previewPosition + 'px',
                    'background-image':
                      'url(' + this.videoData.filmstripUrl + ')',
                    'background-position':
                      this.seekbar.filmstripPosition + 'px 0'
                  }"
                >
                  <div
                    class="time_location"
                    v-html="this.seekbar.seekTimePosition"
                  ></div>
                </div>
                <div class="seek-bar" :class="{ nt: this.seekbar.isDraging }">
                  <div
                    class="buffer-bar"
                    :id="'buffer_' + videoId"
                    :style="{ width: this.seekbar.bufferPosition + '%' }"
                  ></div>
                  <div
                    class="play-bar"
                    :style="{ width: this.seekbar.seekPosition + '%' }"
                  ></div>
                  <div
                    class="handle-circle"
                    :style="{ left: this.seekbar.seekPosition + '%' }"
                  >
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="controls_buttons">
              <div class="btns_wrapper">
                <div class="left_btns">
                  <div class="play_pause" @click.stop="togglePlayPause">
                    <Play v-if="playerStatus.status === 'paused'" />
                    <Pause v-if="playerStatus.status === 'playing'" />
                  </div>
                  <a
                    class="next_btn"
                    v-if="playerStatus.next.status"
                    :href="this.playerStatus.next.nextUrl"
                  >
                    <div class="next_wrapper" :data-ratio="`${aspectRatio}`">
                      <div
                        class="image_wrapper"
                        :data-aspect-ratio="`${aspectRatio}`"
                      >
                        <div>
                          <img :src="playerStatus.next.nextThumb" />
                        </div>
                      </div>
                      <div
                        class="text_wrapper"
                        :data-aspect-ratio="`${aspectRatio}`"
                      >
                        <div class="text">
                          <div
                            class="title"
                            v-html="this.playerStatus.next.nextTitle"
                          ></div>
                          <div
                            class="subtitle"
                            v-html="this.playerStatus.next.nextSubTitle"
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Next />
                  </a>
                  <!-- </div> -->
                  <div
                    class="volume_btn"
                    :class="{ nt: this.playerStatus.volume.isDraging }"
                    @click.self="setVolume('mute')"
                  >
                    <div
                      class="volume_slider"
                      :class="{ nt: this.playerStatus.volume.isDraging }"
                    >
                      <div
                        class="seek-wrapper"
                        :id="'seek-wrapper-volume-' + videoId"
                        :class="{ nt: this.playerStatus.volume.isDraging }"
                        @click="setVolume"
                        @mousedown="seekDown('volumebar')"
                      >
                        <div class="seek-bar">
                          <div
                            class="play-bar"
                            :style="{
                              height: this.playerStatus.volume.status + '%'
                            }"
                          ></div>
                          <div
                            class="handle-circle"
                            :style="{
                              top: 100 - this.playerStatus.volume.status + '%'
                            }"
                          >
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <VolumeUp v-if="playerStatus.volume.status > 59" />
                    <VolumeMiddle
                      v-if="
                        playerStatus.volume.status > 29 &&
                          playerStatus.volume.status < 60
                      "
                    />
                    <VolumeDown
                      v-if="
                        playerStatus.volume.status > 0 &&
                          playerStatus.volume.status < 30
                      "
                    />
                    <VolumeMute v-if="playerStatus.volume.status < 1" />
                  </div>
                </div>
                <div class="center_btns">
                  <div class="duration_wrapper">
                    <div class="passed">{{ passedTimeFormat }}</div>
                    <div class="duration">{{ timeFormat }}</div>
                  </div>
                </div>
                <div class="right_btns">
                  <div class="settings_btn" id="chromecast"></div>
                  <div class="settings_btn" @click="toggleSettings">
                    <Settings class="settings" />
                  </div>
                  <div class="fullscreen_btn" @click="togglePip">
                    <Pip class="pip_btn" />
                  </div>
                  <div class="fullscreen_btn" @click="toggleFullscreen">
                    <FullscreenExit v-if="playerStatus.isFullscreen" />
                    <Fullscreen v-else />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ad_wrapper"></div>
    </div>
  </div>
</template>

<script>
import PlayCircle from "@/assets/svg/material/round-play-circle.svg";
import Play from "@/assets/svg/material/round-play.svg";
import PauseCircle from "@/assets/svg/material/round-pause-circle.svg";
import Pause from "@/assets/svg/material/round-pause.svg";
import Next from "@/assets/svg/material/round-next.svg";
import VolumeUp from "@/assets/svg/material/round-volume-up.svg";
import VolumeMiddle from "@/assets/svg/material/round-volume-down.svg";
import VolumeDown from "@/assets/svg/material/round-volume-mute.svg";
import VolumeMute from "@/assets/svg/material/round-volume-off.svg";
import Settings from "@/assets/svg/material/sliders-v.svg";
import Fullscreen from "@/assets/svg/material/round-fullscreen.svg";
import FullscreenExit from "@/assets/svg/material/round-fullscreen-exit.svg";
import ArrowLeft from "@/assets/svg/material/round-arrow-left.svg";
import ArrowRight from "@/assets/svg/material/round-arrow-right.svg";
import Close from "@/assets/svg/material/round-close.svg";
import Checked from "@/assets/svg/material/round-checked.svg";
import Pip from "@/assets/svg/material/round-pip-alt.svg";
export default {
  name: "Player",
  components: {
    PlayCircle,
    Play,
    PauseCircle,
    Pause,
    Next,
    VolumeUp,
    VolumeMiddle,
    VolumeDown,
    VolumeMute,
    Settings,
    FullscreenExit,
    Fullscreen,
    ArrowLeft,
    Close,
    ArrowRight,
    Checked,
    Pip
  },
  props: {
    videoId: {
      default: null,
      type: String
    },
    aspectRatio: {
      default: "16:9",
      type: String,
      validator(prop) {
        return (
          [
            "3:1",
            "2:1",
            "16:9",
            "3:2",
            "4:3",
            "1:1",
            "3:4",
            "2:3",
            "9:16",
            "1:2",
            "1:3"
          ].indexOf(prop) > -1
        );
      }
    }
  },
  data() {
    return {
      text: {
        quality: "Quality",
        speed: "Speed",
        settings: "Settings",
        error: "Error loading video"
      },
      playerStatus: {
        videoElement: false,
        status: "preloaded",
        isFullscreen: false,
        isBuffering: false,
        next: {
          status: true,
          nextThumb: "https://placeimg.com/160/90/nature",
          nextTitle: "NEXT (SHIFT+N)",
          nextSubTitle:
            "Taie COPACUL din faţa casei şi îi rămâne un ciot urât ieşit din pământ! Când am văzut că bate câteva şipci pe el am zis că nu văd bine, dar iată ce a cre... - Video WOW",
          nextUrl: "https://google.ro"
        },
        volume: {
          status: 60,
          previous: 60,
          isDraging: false
        },
        settings: {
          status: false,
          title: false,
          currentTab: false,
          onestep: false
        },
        quality: {
          current: "auto",
          video: {
            1: "auto",
            2: 4320,
            3: 2160,
            4: 1440,
            5: 1080,
            6: 720,
            7: 480,
            8: 360,
            9: 240,
            10: 144
          }
        },
        speed: {
          current: "Normal",
          speeds: {
            1: 0.25,
            2: 0.5,
            3: 0.75,
            4: "Normal",
            5: 1.25,
            6: 1.5,
            7: 1.75,
            8: 2
          }
        }
      },
      playerEvents: {
        isMouseOver: false,
        isFadeIn: false,
        isOverlayVisible: false,
        overflowtimer: false
      },
      seekbar: {
        seekPosition: 0,
        seekTimePosition: false,
        bufferPosition: 0,
        previewPosition: 0,
        preview: false,
        filmstripPosition: 0,
        isDraging: false
      },
      videoData: {
        type: false,
        sourceUrl: false,
        posterUrl: false,
        filmstripUrl: "//thenutz.ro/samples/film_sprite.png",
        duration: 0,
        currentTime: 0
      }
    };
  },
  computed: {
    timeFormat() {
      let d = Number(this.videoData.duration);
      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);
      if (("0" + h).slice(-2) === "00") {
        return ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
      } else {
        return (
          ("0" + h).slice(-2) +
          ":" +
          ("0" + m).slice(-2) +
          ":" +
          ("0" + s).slice(-2)
        );
      }
    },
    passedTimeFormat() {
      let d = Number(this.videoData.currentTime);
      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);
      if (("0" + h).slice(-2) === "00") {
        return ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
      } else {
        return (
          ("0" + h).slice(-2) +
          ":" +
          ("0" + m).slice(-2) +
          ":" +
          ("0" + s).slice(-2)
        );
      }
    }
  },
  mounted() {
    [
      ("fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "msfullscreenchange")
    ].forEach(eventType =>
      document.addEventListener(
        eventType,
        () => {
          if (
            !document.isFullScreen &&
            !document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement
          ) {
            this.playerStatus.isFullscreen = false;
          }
        },
        false
      )
    );
    setTimeout(() => {
      let videoObject = {
        type: false,
        sourceUrl: "//player.thenutz.ro/samples/sample.mp4",
        posterUrl:
          "//player.thenutz.ro/samples/93d1b16a81c9180a637b4dc6eade947d-xlarge.jpg",
        filmstripUrl: "//player.thenutz.ro/samples/film_sprite.png",
        duration: 0
      };
      let videoElement = document.createElement("video");
      let canPlay_MP4 = videoElement.canPlayType(
        'video/mp4; codecs="avc1.42E01E,mp4a.40.2"'
      );
      if (canPlay_MP4) {
        // create video element
        videoElement.className = "oxiplay-video";
        videoElement.id = "th-video-" + this.videoId;
        // videoElement.setAttribute("videoid", this.videoId);
        videoElement.setAttribute("crossorigin", "anonymous"); // anonymous|use-credentials
        videoElement.setAttribute("webkit-playsinline", "true");
        videoElement.setAttribute("playsinline", "true");
        videoElement.setAttribute("preload", "auto"); // auto|metadata|none
        // videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("poster", videoObject.posterUrl);
        videoElement.controls = false;
        // videoElement.muted = true;
        // create source element
        let videoElementSource = document.createElement("source");
        videoElementSource.type = "video/mp4";
        videoElementSource.src = videoObject.sourceUrl;
        videoElement.appendChild(videoElementSource);

        try {
          document
            .getElementById("video-wrapper-" + this.videoId)
            .appendChild(videoElement);
          /// this.playerStatus.videoElement = videoElement;
        } catch (err) {
          console.log("Error: " + err + ".");
          this.playerStatus.status = "error";
          return;
        }

        // this.playerStatus.videoElement.load();
        // this.playerStatus.status = "loaded";

        // event listeners

        videoElement.addEventListener(
          "waiting",
          this.toggleBuffer("waiting"),
          false
        );
        videoElement.addEventListener(
          "playing",
          this.toggleBuffer("playing"),
          false
        );
        videoElement.addEventListener("timeupdate", this.onTimeUpdate, false);
        videoElement.addEventListener("progress", this.onProgress, false);
        videoElement.addEventListener(
          "loadedmetadata",
          this.metadataLoaded,
          false
        );
      } else {
        console.log("cant play mp4");
      }
      this.playerStatus.status = "loaded";
    }, 1000);
  },
  created() {},
  methods: {
    togglePip() {
      console.log("pip");
      let videoELM = document.getElementById("th-video-" + this.videoId);
      videoELM.requestPictureInPicture();
    },
    timeFormated(seconds) {
      let d = Number(seconds);
      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);
      if (("0" + h).slice(-2) === "00") {
        return ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
      } else {
        return (
          ("0" + h).slice(-2) +
          ":" +
          ("0" + m).slice(-2) +
          ":" +
          ("0" + s).slice(-2)
        );
      }
    },
    onProgress() {
      console.log("on progress function");
      if (event.srcElement.readyState === 4) {
        var bufferProgress =
          (100 * event.srcElement.buffered.end(0)) / event.srcElement.duration;
        //(100 / event.srcElement.duration) * event.srcElement.buffered.end(0);
        this.seekbar.bufferPosition = bufferProgress;
      }
    },
    metadataLoaded() {
      console.log("metadata loaded");
      console.log(event);
      if (event.srcElement.muted) {
        this.playerStatus.volume.status = 0;
      }
      this.videoData.duration = event.srcElement.duration;
      this.videoData.currentTime = event.srcElement.currentTime;
      //this.playerStatus.videoElement.play();
    },
    onTimeUpdate() {
      let progress =
        (100 / event.srcElement.duration) * event.srcElement.currentTime;
      this.seekbar.seekPosition = progress;
      this.videoData.currentTime = event.srcElement.currentTime;
      // console.log(event);
    },
    toggleBuffer(tip) {
      console.log("toggle buffer " + tip);
      console.log(event);
      if (tip === "waiting") {
        this.playerStatus.isBuffering = true;
      } else if (tip === "playing") {
        this.playerStatus.isBuffering = false;
        // this.playerStatus.status = true;
      }
    },
    changeSpeed(s) {
      console.log("speed change" + s);
      this.playerStatus.speed.current = s;
    },
    changeQuality(q) {
      console.log(q);
      this.playerStatus.quality.current = q;
    },
    stepBack() {
      if (this.playerStatus.settings.onestep) {
        this.playerStatus.settings.onestep = false;
        this.playerStatus.settings.title = this.text.settings;
        setTimeout(() => {
          this.playerStatus.settings.currentTab = false;
        }, 170);
      }
    },
    settingsSlide(type) {
      if (type === "quality") {
        this.playerStatus.settings.title = this.text.quality;
        this.playerStatus.settings.currentTab = 1;
        this.playerStatus.settings.onestep = true;
        console.log("quality");
      } else if (type === "speed") {
        this.playerStatus.settings.title = this.text.speed;
        this.playerStatus.settings.currentTab = 2;
        this.playerStatus.settings.onestep = true;
        console.log("speed");
      }
    },
    toggleSettings() {
      if (this.playerStatus.settings.status) {
        console.log("reset all settings windows");
        this.playerStatus.settings.onestep = false;
        this.playerStatus.settings.status = false;
      } else {
        this.playerStatus.settings.title = this.text.settings;
        this.playerStatus.settings.status = true;
      }
    },
    toggleFullscreen() {
      if (this.playerStatus.isFullscreen) {
        if (document.cancelFullscreen) {
          document.cancelFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.playerStatus.isFullscreen = false;
      } else {
        let container = document.getElementById(
          "player-wrapper-" + this.videoId
        );
        if (container.requestFullScreen) {
          container.requestFullScreen();
        } else if (container.webkitRequestFullScreen) {
          container.webkitRequestFullScreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        } else {
          /* if (navigator.userAgent.match(/iPad|iPhone|iPod/i)) {
					  container.webkitEnterFullscreen();
					} */
        }
        this.playerStatus.isFullscreen = true;
      }
    },
    setVolume(mute = false) {
      let videoELM = document.getElementById("th-video-" + this.videoId);
      if (mute === "mute") {
        if (this.playerStatus.volume.status === 0) {
          videoELM.muted = false;
          videoELM.volume = (1 * this.playerStatus.volume.previous) / 100;
          this.playerStatus.volume.status = this.playerStatus.volume.previous;
        } else {
          videoELM.muted = true;
          videoELM.volume = 0;
          this.playerStatus.volume.status = 0;
        }
      } else {
        let y = event.pageY; //Y click position on entire page
        let xyz = event.srcElement.getBoundingClientRect(); //element x,y,z,width and height
        let clickPosition = y - xyz.y; // click position on the element
        let perc = ((clickPosition * 100) / xyz.height - 100) * -1;
        this.playerStatus.volume.status = Math.round(perc);
        this.playerStatus.volume.previous = Math.round(perc);
        if (videoELM.muted) {
          videoELM.muted = false;
        }
      }
    },
    seekOver() {
      let previewWidth = 160;
      let x = event.pageX; //Y click position on entire page
      let xyz = event.srcElement.getBoundingClientRect(); //element x,y,z,width and height
      let mousePosition = x - xyz.x; // click position on the element
      let perc = (mousePosition * 100) / xyz.width;
      if (mousePosition < previewWidth / 2) {
        this.seekbar.previewPosition = 0;
      } else if (xyz.width - 80 > mousePosition) {
        this.seekbar.previewPosition = mousePosition - previewWidth / 2;
      } else {
        this.seekbar.previewPosition = xyz.width - previewWidth;
      }

      this.seekbar.filmstripPosition = Math.floor(perc / 4) * 160 * -1;
      this.seekbar.seekTimePosition = this.timeFormated(
        (this.videoData.duration * perc) / 100
      );
    },
    seekDown(location) {
      console.log("seekdown");
      if (location === "seekbar") {
        document.addEventListener("mousemove", this.checkSeekbarDrag, false);
        this.seekbar.isDraging = true;
        document.addEventListener(
          "mouseup",
          () => {
            // videoELM.play();
            document.removeEventListener("mousemove", this.checkSeekbarDrag);
            this.seekbar.isDraging = false;
          },
          false
        );
      }
      if (location === "volumebar") {
        document.addEventListener("mousemove", this.checkVolumeDrag, false);
        this.playerStatus.volume.isDraging = true;
        document.addEventListener(
          "mouseup",
          () => {
            document.removeEventListener("mousemove", this.checkVolumeDrag);
            this.playerStatus.volume.isDraging = false;
          },
          false
        );
      }
    },
    setPause() {
      // console.log("video paused");
      let videoELM = document.getElementById("th-video-" + this.videoId);
      videoELM.pause();
      this.playerStatus.status = "paused";
    },
    setPlay() {
      // console.log("video start to play");
      let videoELM = document.getElementById("th-video-" + this.videoId);
      videoELM.play();
      this.playerStatus.status = "playing";
    },
    checkSeekbarDrag() {
      console.log("check drag");
      let videoELM = document.getElementById("th-video-" + this.videoId);
      this.setPause();
      let x = event.pageX; //Y click position on entire page
      let xyz = document
        .getElementById("seek-wrapper-seekbar-" + this.videoId)
        .getBoundingClientRect(); //element x,y,z,width and height
      let clickPosition = x - xyz.x; // click position on the element
      let perc = (clickPosition * 100) / xyz.width;

      if (perc < 1) {
        this.seekbar.seekPosition = 0;
        videoELM.currentTime = 0;
      } else if (perc > 99) {
        videoELM.currentTime = this.videoData.duration;
        this.seekbar.seekPosition = 100;
      } else {
        this.seekbar.seekPosition = perc;
        videoELM.currentTime = (this.videoData.duration * perc) / 100;
      }
    },
    checkVolumeDrag() {
      let videoELM = document.getElementById("th-video-" + this.videoId);
      let y = event.pageY; //Y click position on entire page
      let xyz = document
        .getElementById("seek-wrapper-volume-" + this.videoId)
        .getBoundingClientRect(); //element x,y,z,width and height
      let clickPosition = y - xyz.y; // click position on the element
      let perc = ((clickPosition * 100) / xyz.height - 100) * -1;

      if (perc < 1) {
        videoELM.volume = 0;
        this.playerStatus.volume.status = 0;
      } else if (perc > 99) {
        if (videoELM.muted) {
          videoELM.muted = false;
        }
        videoELM.volume = 1;
        this.playerStatus.volume.status = 100;
        this.playerStatus.volume.previous = 100;
      } else {
        if (videoELM.muted) {
          videoELM.muted = false;
        }
        this.playerStatus.volume.status = Math.round(perc);
        this.playerStatus.volume.previous = Math.round(perc);
        videoELM.volume = (1 * perc) / 100;
      }
    },
    seekControl() {
      console.log("seek control");
      let videoELEM = document.getElementById("th-video-" + this.videoId);
      let x = event.pageX; //Y click position on entire page
      let xyz = event.srcElement.getBoundingClientRect(); //element x,y,z,width and height
      let clickPosition = x - xyz.x; // click position on the element
      let perc = (clickPosition * 100) / xyz.width;
      this.seekbar.seekPosition = perc;
      let next = (this.videoData.duration * perc) / 100;
      videoELEM.currentTime = next;
      if (videoELEM.paused) {
        this.setPlay();
      }
    },
    mouseIsOver() {
      /* let x;
      event.target.addEventListener(
        "mousemove",
        () => {
          if (!this.playerEvents.isFadeIn) {
            if (x) {
              clearTimeout(x._id);
            }
          } else {
            this.playerEvents.isFadeIn = false;
          }

          x = setTimeout(() => {
            this.playerEvents.isFadeIn = true;
          }, 2000);
        },
        false
      ); */
    },
    togglePlayPause() {
      if (this.playerEvents.isFadeIn && this.playerStatus.status !== "loaded") {
        this.playerEvents.isFadeIn = false;
        return;
      }
      let videoELM = document.getElementById("th-video-" + this.videoId);
      if (this.playerStatus.status === "loaded") {
        this.setPlay();
      } else if (videoELM.paused === false) {
        this.setPause();
      } else if (videoELM.paused === true) {
        this.setPlay();
      }
    }
    /* makeHash(str, seed = 0) {
		  if (str) {
		    let h1 = 0xdeadbeef ^ seed;
		    let h2 = 0x41c6ce57 ^ seed;
		    for (let i = 0, ch; i < str.length; i++) {
		      ch = str.charCodeAt(i);
		      h1 = Math.imul(h1 ^ ch, 2654435761);
		      h2 = Math.imul(h2 ^ ch, 1597334677);
		    }
		    h1 =
		      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
		      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		    h2 =
		      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
		      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
		    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
		  }
		} */
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/player";
root {
  --padding: 15px;
}
</style>
