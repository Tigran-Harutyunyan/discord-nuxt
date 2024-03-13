<script setup lang="ts">
/* ==================  

 !!! Video conference is at an very early STAGE of migration to Vue.JS components ==== !!! 

================== */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type SimulationScenario } from "@/types";

import {
  ConnectionQuality,
  ConnectionState,
  DisconnectReason,
  ExternalE2EEKeyProvider,
  LocalAudioTrack,
  LocalParticipant,
  LogLevel,
  MediaDeviceFailure,
  Participant,
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
  type RoomConnectOptions,
  RoomEvent,
  type RoomOptions,
  ScreenSharePresets,
  Track,
  TrackPublication,
  type VideoCaptureOptions,
  type VideoCodec,
  VideoPresets,
  VideoQuality,
  createAudioAnalyser,
  setLogLevel,
  supportsAV1,
  supportsVP9,
} from "livekit-client";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

const { chatId, video, audio } = defineProps<MediaRoomProps>();

declare global {
  interface Window {
    currentRoom: any;
    appActions: typeof appActions;
  }
}

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

const state = {
  isFrontFacing: false,
  encoder: new TextEncoder(),
  decoder: new TextDecoder(),
  defaultDevices: new Map<MediaDeviceKind, string>(),
  bitrateInterval: undefined as any,
  e2eeKeyProvider: new ExternalE2EEKeyProvider(),
};
let currentRoom = ref<Room | undefined>();

const allDeviceTypes = ref({});

const numParticipants = computed(() => {
  return currentRoom.value?.roomInfo?.numParticipants;
});

const selectedDevices = ref({});
const isConnected = ref(false);
let startTime: number;

// handles actions from the HTML
const appActions = {
  connectWithFormInput: async () => {
    const url = "https://discord-r2m02yzv.livekit.cloud";
    const token = (await $fetch(`/api/livekit?room=${chatId}`)) as string;
    const simulcast = true;
    const dynacast = true;
    const forceTURN = false;
    const adaptiveStream = true;
    const shouldPublish = true;
    const preferredCodec = (<HTMLSelectElement>$("preferred-codec"))
      .value as VideoCodec;
    const autoSubscribe = true;
    //const e2eeEnabled = (<HTMLInputElement>$('e2ee')).checked;
    const audioOutputId = (<HTMLSelectElement>$("audio-output")).value;

    setLogLevel(LogLevel.debug);
    //updateSearchParams(url, token, cryptoKey);

    const roomOpts: RoomOptions = {
      adaptiveStream,
      dynacast,
      audioOutput: {
        deviceId: audioOutputId,
      },
      publishDefaults: {
        simulcast,
        videoSimulcastLayers: [VideoPresets.h90, VideoPresets.h216],
        videoCodec: preferredCodec || "vp8",
        dtx: true,
        red: true,
        forceStereo: false,
        screenShareEncoding: ScreenSharePresets.h1080fps30.encoding,
      },
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
      //   e2ee: e2eeEnabled
      //     ? { keyProvider: state.e2eeKeyProvider, worker: new E2EEWorker() }
      //     : undefined,
    };
    if (
      roomOpts.publishDefaults?.videoCodec === "av1" ||
      roomOpts.publishDefaults?.videoCodec === "vp9"
    ) {
      roomOpts.publishDefaults.backupCodec = true;
    }

    const connectOpts: RoomConnectOptions = {
      autoSubscribe: autoSubscribe,
    };
    if (forceTURN) {
      connectOpts.rtcConfig = {
        iceTransportPolicy: "relay",
      };
    }
    await appActions.connectToRoom(
      url,
      token,
      roomOpts,
      connectOpts,
      shouldPublish
    );

    state.bitrateInterval = setInterval(renderBitrate, 1000);
  },

  connectToRoom: async (
    url: string,
    token: string,
    roomOptions?: RoomOptions,
    connectOptions?: RoomConnectOptions,
    shouldPublish?: boolean
  ): Promise<Room | undefined> => {
    const room = new Room(roomOptions);

    startTime = Date.now();
    await room.prepareConnection(url, token);
    const prewarmTime = Date.now() - startTime;
    appendLog(`prewarmed connection in ${prewarmTime}ms`);

    room
      .on(RoomEvent.ParticipantConnected, participantConnected)
      .on(RoomEvent.ParticipantDisconnected, participantDisconnected)
      .on(RoomEvent.DataReceived, handleData)
      .on(RoomEvent.Disconnected, handleRoomDisconnect)
      .on(RoomEvent.Reconnecting, () => appendLog("Reconnecting to room"))
      .on(RoomEvent.Reconnected, async () => {
        appendLog(
          "Successfully reconnected. server",
          await room.engine.getConnectedServerAddress()
        );
      })
      .on(RoomEvent.LocalTrackPublished, (pub) => {
        const track = pub.track as LocalAudioTrack;

        if (track instanceof LocalAudioTrack) {
          const { calculateVolume } = createAudioAnalyser(track);

          setInterval(() => {
            $("local-volume")?.setAttribute(
              "value",
              calculateVolume().toFixed(4)
            );
          }, 200);
        }
        renderParticipant(room.localParticipant);
        updateButtonsForPublishState();
        renderScreenShare(room);
      })
      .on(RoomEvent.LocalTrackUnpublished, () => {
        renderParticipant(room.localParticipant);
        updateButtonsForPublishState();
        renderScreenShare(room);
      })
      .on(RoomEvent.RoomMetadataChanged, (metadata) => {
        appendLog("new metadata for room", metadata);
      })
      .on(RoomEvent.MediaDevicesChanged, handleDevicesChanged)
      .on(RoomEvent.AudioPlaybackStatusChanged, () => {
        if (room.canPlaybackAudio) {
          $("start-audio-button")?.setAttribute("disabled", "true");
        } else {
          $("start-audio-button")?.removeAttribute("disabled");
        }
      })
      .on(RoomEvent.MediaDevicesError, (e: Error) => {
        const failure = MediaDeviceFailure.getFailure(e);
        appendLog("media device failure", failure);
      })
      .on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality, participant?: Participant) => {
          appendLog(
            "connection quality changed",
            participant?.identity,
            quality
          );
        }
      )
      .on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
        appendLog("subscribed to track", pub.trackSid, participant.identity);
        renderParticipant(participant);
        renderScreenShare(room);
      })
      .on(RoomEvent.TrackUnsubscribed, (_, pub, participant) => {
        appendLog("unsubscribed from track", pub.trackSid);
        renderParticipant(participant);
        renderScreenShare(room);
      })
      .on(RoomEvent.SignalConnected, async () => {
        const signalConnectionTime = Date.now() - startTime;
        appendLog(`signal connection established in ${signalConnectionTime}ms`);
        // speed up publishing by starting to publish before it's fully connected
        // publishing is accepted as soon as signal connection has established
        if (shouldPublish) {
          await room.localParticipant.enableCameraAndMicrophone();
          appendLog(`tracks published in ${Date.now() - startTime}ms`);
          updateButtonsForPublishState();
        }
      })
      .on(RoomEvent.ParticipantEncryptionStatusChanged, () => {
        updateButtonsForPublishState();
      })
      .on(
        RoomEvent.TrackStreamStateChanged,
        (pub, streamState, participant) => {
          appendLog(
            `stream state changed for ${pub.trackSid} (${
              participant.identity
            }) to ${streamState.toString()}`
          );
        }
      );

    try {
      // read and set current key from input
      const cryptoKey = (<HTMLSelectElement>$("crypto-key")).value;
      state.e2eeKeyProvider.setKey(cryptoKey);
      //   if ((<HTMLInputElement>$("e2ee")).checked) {
      //     await room.setE2EEEnabled(true);
      //   }

      await room.connect(url, token, connectOptions);
      const elapsed = Date.now() - startTime;
      appendLog(
        `successfully connected to ${room.name} in ${Math.round(elapsed)}ms`,
        await room.engine.getConnectedServerAddress()
      );
    } catch (error: any) {
      let message: any = error;
      if (error.message) {
        message = error.message;
      }
      appendLog("could not connect:", message);
      return;
    }
    currentRoom.value = room;
    window.currentRoom = room;
    setButtonsForState(true);
    isConnected.value = true;
    room.remoteParticipants.forEach((participant) => {
      participantConnected(participant);
    });
    participantConnected(room.localParticipant);

    return room;
  },

  toggleE2EE: async () => {
    if (!currentRoom.value || !currentRoom?.value?.options.e2ee) {
      return;
    }
    // read and set current key from input
    const cryptoKey = (<HTMLSelectElement>$("crypto-key")).value;
    state.e2eeKeyProvider.setKey(cryptoKey);

    await currentRoom.value.setE2EEEnabled(!currentRoom.value.isE2EEEnabled);
  },

  ratchetE2EEKey: async () => {
    if (!currentRoom.value || !currentRoom.value?.options.e2ee) {
      return;
    }
    await state.e2eeKeyProvider.ratchetKey();
  },

  toggleAudio: async () => {
    if (!currentRoom.value) return;
    const enabled = currentRoom.value.localParticipant.isMicrophoneEnabled;
    setButtonDisabled("toggle-audio-button", true);
    if (enabled) {
      appendLog("disabling audio");
    } else {
      appendLog("enabling audio");
    }
    await currentRoom.value.localParticipant.setMicrophoneEnabled(!enabled);
    setButtonDisabled("toggle-audio-button", false);
    updateButtonsForPublishState();
  },

  toggleVideo: async () => {
    if (!currentRoom.value) return;
    setButtonDisabled("toggle-video-button", true);
    const enabled = currentRoom.value.localParticipant.isCameraEnabled;
    if (enabled) {
      appendLog("disabling video");
    } else {
      appendLog("enabling video");
    }
    await currentRoom.value.localParticipant.setCameraEnabled(!enabled);
    setButtonDisabled("toggle-video-button", false);
    renderParticipant(currentRoom.value.localParticipant);

    // update display
    updateButtonsForPublishState();
  },

  flipVideo: () => {
    const videoPub = currentRoom.value?.localParticipant.getTrackPublication(
      Track.Source.Camera
    );
    if (!videoPub) {
      return;
    }
    if (state.isFrontFacing) {
      setButtonState("flip-video-button", "Front Camera", false);
    } else {
      setButtonState("flip-video-button", "Back Camera", false);
    }
    state.isFrontFacing = !state.isFrontFacing;
    const options: VideoCaptureOptions = {
      resolution: VideoPresets.h720.resolution,
      facingMode: state.isFrontFacing ? "user" : "environment",
    };
    videoPub.videoTrack?.restartTrack(options);
  },

  shareScreen: async () => {
    if (!currentRoom.value) return;

    const enabled = currentRoom.value.localParticipant.isScreenShareEnabled;
    appendLog(`${enabled ? "stopping" : "starting"} screen share`);
    setButtonDisabled("share-screen-button", true);
    await currentRoom.value.localParticipant.setScreenShareEnabled(!enabled, {
      audio: true,
    });
    setButtonDisabled("share-screen-button", false);
    updateButtonsForPublishState();
  },

  startAudio: () => {
    currentRoom.value?.startAudio();
  },

  enterText: () => {
    if (!currentRoom.value) return;
    const textField = <HTMLInputElement>$("entry");
    if (textField.value) {
      const msg = state.encoder.encode(textField.value);
      currentRoom.value.localParticipant.publishData(msg, { reliable: true });
      (<HTMLTextAreaElement>(
        $("chat")
      )).value += `${currentRoom.value.localParticipant.identity} (me): ${textField.value}\n`;
      textField.value = "";
    }
  },

  disconnectRoom: () => {
    if (currentRoom.value) {
      currentRoom.value.disconnect();
    }
    if (state.bitrateInterval) {
      clearInterval(state.bitrateInterval);
    }
  },

  handleScenario: (e: Event) => {
    const scenario = (<HTMLSelectElement>e.target).value;
    if (scenario === "subscribe-all") {
      currentRoom.value?.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((rp) => rp.setSubscribed(true));
      });
    } else if (scenario === "unsubscribe-all") {
      currentRoom.value?.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((rp) => rp.setSubscribed(false));
      });
    } else if (scenario !== "") {
      currentRoom.value?.simulateScenario(scenario as SimulationScenario);
      (<HTMLSelectElement>e.target).value = "";
    }
  },

  handleDeviceSelected: async (kind: MediaDeviceKind, deviceId: string) => {
    if (!kind) {
      return;
    }

    state.defaultDevices.set(kind, deviceId);

    if (currentRoom.value) {
      await currentRoom.value.switchActiveDevice(kind, deviceId);
    }
  },

  handlePreferredQuality: (e: Event) => {
    const quality = (<HTMLSelectElement>e.target).value;
    let q = VideoQuality.HIGH;
    switch (quality) {
      case "low":
        q = VideoQuality.LOW;
        break;
      case "medium":
        q = VideoQuality.MEDIUM;
        break;
      case "high":
        q = VideoQuality.HIGH;
        break;
      default:
        break;
    }
    if (currentRoom.value) {
      currentRoom.value.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((track) => {
          track.setVideoQuality(q);
        });
      });
    }
  },

  handlePreferredFPS: (e: Event) => {
    const fps = +(<HTMLSelectElement>e.target).value;
    if (currentRoom.value) {
      currentRoom.value.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((track) => {
          track.setVideoFPS(fps);
        });
      });
    }
  },
};

// --------------------------- event handlers ------------------------------- //

function handleData(msg: Uint8Array, participant?: RemoteParticipant) {
  const str = state.decoder.decode(msg);
  const chat = <HTMLTextAreaElement>$("chat");
  let from = "server";
  if (participant) {
    from = participant.identity;
  }
  chat.value += `${from}: ${str}\n`;
}

function participantConnected(participant: Participant) {
  appendLog(
    "participant",
    participant.identity,
    "connected",
    participant.metadata
  );
  console.log("tracks", participant.trackPublications);
  participant
    .on(ParticipantEvent.TrackMuted, (pub: TrackPublication) => {
      appendLog("track was muted", pub.trackSid, participant.identity);
      renderParticipant(participant);
    })
    .on(ParticipantEvent.TrackUnmuted, (pub: TrackPublication) => {
      appendLog("track was unmuted", pub.trackSid, participant.identity);
      renderParticipant(participant);
    })
    .on(ParticipantEvent.IsSpeakingChanged, () => {
      renderParticipant(participant);
    })
    .on(ParticipantEvent.ConnectionQualityChanged, () => {
      renderParticipant(participant);
    });
}

function participantDisconnected(participant: RemoteParticipant) {
  appendLog("participant", participant.sid, "disconnected");

  renderParticipant(participant, true);
}

function handleRoomDisconnect(reason?: DisconnectReason) {
  if (!currentRoom.value) return;

  appendLog("disconnected from room", { reason });
  setButtonsForState(false);
  isConnected.value = false;
  renderParticipant(currentRoom.value.localParticipant, true);
  currentRoom.value.remoteParticipants.forEach((p) => {
    renderParticipant(p, true);
  });
  renderScreenShare(currentRoom.value);

  const container = $("participants-area");
  if (container) {
    container.innerHTML = "";
  }

  // clear the chat area on disconnect
  const chat = <HTMLTextAreaElement>$("chat");
  chat.value = "";

  currentRoom.value = undefined;
  window.currentRoom = undefined;
}

// -------------------------- rendering helpers ----------------------------- //

function appendLog(...args: any[]) {
  const logger = $("log")!;
  for (let i = 0; i < arguments.length; i += 1) {
    if (typeof args[i] === "object") {
      logger.innerHTML += `${
        JSON && JSON.stringify ? JSON.stringify(args[i], undefined, 2) : args[i]
      } `;
    } else {
      logger.innerHTML += `${args[i]} `;
    }
  }
  logger.innerHTML += "\n";
  (() => {
    logger.scrollTop = logger.scrollHeight;
  })();
}

// updates participant UI
function renderParticipant(participant: Participant, remove: boolean = false) {
  const container = $("participants-area");
  if (!container) return;
  const { identity } = participant;
  let div = $(`participant-${identity}`);
  if (!div && !remove) {
    div = document.createElement("div");
    div.id = `participant-${identity}`;
    div.className = "participant";
    div.innerHTML = `
      <video id="video-${identity}"></video>
      <audio id="audio-${identity}"></audio>
      
      <div class="info-bar" style="display:none">
        <div id="name-${identity}" class="name">
        </div>
        <div style="text-align: center;">
          <span id="codec-${identity}" class="codec">
          </span>
          <span id="size-${identity}" class="size">
          </span>
          <span id="bitrate-${identity}" class="bitrate">
          </span>
        </div>
        <div class="right">
          <span id="signal-${identity}"></span>
          <span id="mic-${identity}" class="mic-on"></span>
          <span id="e2ee-${identity}" class="e2ee-on"></span>
        </div>
      </div>
      ${
        participant instanceof RemoteParticipant
          ? `<div class="volume-control">
        <input id="volume-${identity}" type="range" min="0" max="1" step="0.1" value="1" orient="vertical" />
      </div>`
          : `<progress id="local-volume" max="1" value="0" style="display:none"/>`
      }

    `;
    container.appendChild(div);

    const sizeElm = $(`size-${identity}`);
    const videoElm = <HTMLVideoElement>$(`video-${identity}`);
    videoElm.onresize = () => {
      updateVideoSize(videoElm!, sizeElm!);
    };
  }
  const videoElm = <HTMLVideoElement>$(`video-${identity}`);
  const audioELm = <HTMLAudioElement>$(`audio-${identity}`);
  if (remove) {
    div?.remove();
    if (videoElm) {
      videoElm.srcObject = null;
      videoElm.src = "";
    }
    if (audioELm) {
      audioELm.srcObject = null;
      audioELm.src = "";
    }
    return;
  }

  // update properties
  $(`name-${identity}`)!.innerHTML = participant.identity;
  if (participant instanceof LocalParticipant) {
    $(`name-${identity}`)!.innerHTML += " (you)";
  }
  const micElm = $(`mic-${identity}`)!;
  const signalElm = $(`signal-${identity}`)!;
  const cameraPub = participant.getTrackPublication(Track.Source.Camera);
  const micPub = participant.getTrackPublication(Track.Source.Microphone);
  if (participant.isSpeaking) {
    div!.classList.add("speaking");
  } else {
    div!.classList.remove("speaking");
  }

  if (participant instanceof RemoteParticipant) {
    const volumeSlider = <HTMLInputElement>$(`volume-${identity}`);
    volumeSlider.addEventListener("input", (ev) => {
      participant.setVolume(
        Number.parseFloat((ev.target as HTMLInputElement).value)
      );
    });
  }

  const cameraEnabled =
    cameraPub && cameraPub.isSubscribed && !cameraPub.isMuted;
  if (cameraEnabled) {
    if (participant instanceof LocalParticipant) {
      // flip
      videoElm.style.transform = "scale(-1, 1)";
    } else if (!cameraPub?.videoTrack?.attachedElements.includes(videoElm)) {
      const renderStartTime = Date.now();
      // measure time to render
      videoElm.onloadeddata = () => {
        const elapsed = Date.now() - renderStartTime;
        let fromJoin = 0;
        if (
          participant.joinedAt &&
          participant.joinedAt.getTime() < startTime
        ) {
          fromJoin = Date.now() - startTime;
        }
        appendLog(
          `RemoteVideoTrack ${cameraPub?.trackSid} (${videoElm.videoWidth}x${videoElm.videoHeight}) rendered in ${elapsed}ms`,
          fromJoin > 0 ? `, ${fromJoin}ms from start` : ""
        );
      };
    }
    cameraPub?.videoTrack?.attach(videoElm);
  } else {
    // clear information display
    $(`size-${identity}`)!.innerHTML = "";
    if (cameraPub?.videoTrack) {
      // detach manually whenever possible
      cameraPub.videoTrack?.detach(videoElm);
    } else {
      videoElm.src = "";
      videoElm.srcObject = null;
    }
  }

  const micEnabled = micPub && micPub.isSubscribed && !micPub.isMuted;
  if (micEnabled) {
    if (!(participant instanceof LocalParticipant)) {
      // don't attach local audio
      audioELm.onloadeddata = () => {
        if (
          participant.joinedAt &&
          participant.joinedAt.getTime() < startTime
        ) {
          const fromJoin = Date.now() - startTime;
          appendLog(
            `RemoteAudioTrack ${micPub?.trackSid} played ${fromJoin}ms from start`
          );
        }
      };
      micPub?.audioTrack?.attach(audioELm);
    }
    micElm.className = "mic-on";
    micElm.innerHTML = '<i class="fas fa-microphone"></i>';
  } else {
    micElm.className = "mic-off";
    micElm.innerHTML = '<i class="fas fa-microphone-slash"></i>';
  }

  const e2eeElm = $(`e2ee-${identity}`)!;
  if (participant.isEncrypted) {
    e2eeElm.className = "e2ee-on";
    e2eeElm.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e2eeElm.className = "e2ee-off";
    e2eeElm.innerHTML = '<i class="fas fa-unlock"></i>';
  }

  switch (participant.connectionQuality) {
    case ConnectionQuality.Excellent:
    case ConnectionQuality.Good:
    case ConnectionQuality.Poor:
      signalElm.className = `connection-${participant.connectionQuality}`;
      signalElm.innerHTML = '<i class="fas fa-circle"></i>';
      break;
    default:
      signalElm.innerHTML = "";
    // do nothing
  }
}

function renderScreenShare(room: Room) {
  const div = $("screenshare-area")!;
  if (room.state !== ConnectionState.Connected) {
    div.style.display = "none";
    return;
  }
  let participant: Participant | undefined;
  let screenSharePub: TrackPublication | undefined =
    room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
  let screenShareAudioPub: RemoteTrackPublication | undefined;
  if (!screenSharePub) {
    room.remoteParticipants.forEach((p) => {
      if (screenSharePub) {
        return;
      }
      participant = p;
      const pub = p.getTrackPublication(Track.Source.ScreenShare);
      if (pub?.isSubscribed) {
        screenSharePub = pub;
      }
      const audioPub = p.getTrackPublication(Track.Source.ScreenShareAudio);
      if (audioPub?.isSubscribed) {
        screenShareAudioPub = audioPub;
      }
    });
  } else {
    participant = room.localParticipant;
  }

  if (screenSharePub && participant) {
    div.style.display = "block";
    const videoElm = <HTMLVideoElement>$("screenshare-video");
    screenSharePub.videoTrack?.attach(videoElm);
    if (screenShareAudioPub) {
      screenShareAudioPub.audioTrack?.attach(videoElm);
    }
    videoElm.onresize = () => {
      updateVideoSize(videoElm, <HTMLSpanElement>$("screenshare-resolution"));
    };
    const infoElm = $("screenshare-info")!;
    infoElm.innerHTML = `Screenshare from ${participant.identity}`;
  } else {
    div.style.display = "none";
  }
}

function renderBitrate() {
  if (
    !currentRoom.value ||
    currentRoom.value.state !== ConnectionState.Connected
  ) {
    return;
  }
  const participants: Participant[] = [
    ...currentRoom.value.remoteParticipants.values(),
  ];
  participants.push(currentRoom.value.localParticipant);

  for (const p of participants) {
    const elm = $(`bitrate-${p.identity}`);
    let totalBitrate = 0;
    for (const t of p.trackPublications.values()) {
      if (t.track) {
        totalBitrate += t.track.currentBitrate;
      }

      if (t.source === Track.Source.Camera) {
        if (t.videoTrack instanceof RemoteVideoTrack) {
          const codecElm = $(`codec-${p.identity}`)!;
          codecElm.innerHTML = t.videoTrack.getDecoderImplementation() ?? "";
        }
      }
    }
    let displayText = "";
    if (totalBitrate > 0) {
      displayText = `${Math.round(totalBitrate / 1024).toLocaleString()} kbps`;
    }
    if (elm) {
      elm.innerHTML = displayText;
    }
  }
}

function updateVideoSize(element: HTMLVideoElement, target: HTMLElement) {
  target.innerHTML = `(${element.videoWidth}x${element.videoHeight})`;
}

function setButtonState(
  buttonId: string,
  buttonText: string,
  isActive: boolean,
  isDisabled: boolean | undefined = undefined
) {
  const el = $(buttonId) as HTMLButtonElement;
  if (!el) return;
  if (isDisabled !== undefined) {
    el.disabled = isDisabled;
  }
  el.innerHTML = buttonText;
  if (isActive) {
    el.classList.add("active");
  } else {
    el.classList.remove("active");
  }
}

function setButtonDisabled(buttonId: string, isDisabled: boolean) {
  const el = $(buttonId) as HTMLButtonElement;
  el.disabled = isDisabled;
}

setTimeout(handleDevicesChanged, 100);

function setButtonsForState(connected: boolean) {
  const connectedSet = [
    "toggle-video-button",
    "toggle-audio-button",
    "share-screen-button",
    "disconnect-ws-button",
    "disconnect-room-button",
    "flip-video-button",
    "send-button",
  ];
  if (currentRoom.value && currentRoom.value.options.e2ee) {
    connectedSet.push("toggle-e2ee-button", "e2ee-ratchet-button");
  }
  const disconnectedSet = ["connect-button"];

  const toRemove = connected ? connectedSet : disconnectedSet;
  const toAdd = connected ? disconnectedSet : connectedSet;

  toRemove.forEach((id) => $(id)?.removeAttribute("disabled"));
  toAdd.forEach((id) => $(id)?.setAttribute("disabled", "true"));
}

const elementMapping: { [k: string]: MediaDeviceKind } = {
  "video-input": "videoinput",
  "audio-input": "audioinput",
  "audio-output": "audiooutput",
};

async function handleDevicesChanged() {
  Promise.all(
    Object.keys(elementMapping).map(async (id) => {
      const kind = elementMapping[id];
      if (!kind) {
        return;
      }
      const devices = await Room.getLocalDevices(kind);
      const element = <HTMLSelectElement>$(id);
      populateSelect(element, devices, state.defaultDevices.get(kind));
    })
  );
}

function populateSelect(
  element: HTMLSelectElement,
  devices: MediaDeviceInfo[],
  selectedDeviceId?: string
) {
  // clear all elements
  element.innerHTML = "";

  if (devices[0] && "kind" in devices[0] && devices[0].kind !== "audiooutput") {
    const kind = devices[0].kind;
    allDeviceTypes.value[kind] = devices;
    selectedDevices.value[kind] = devices[0].deviceId;
  }

  for (const device of devices) {
    const option = document.createElement("option");
    option.text = device.label;
    option.value = device.deviceId;
    if (device.deviceId === selectedDeviceId) {
      option.selected = true;
    }
    element.appendChild(option);
  }
}

function updateButtonsForPublishState() {
  if (!currentRoom.value) {
    return;
  }
  const lp = currentRoom.value.localParticipant;

  // video
  setButtonState(
    "toggle-video-button",
    `${lp.isCameraEnabled ? "Disable" : "Enable"} Video`,
    lp.isCameraEnabled
  );

  // audio
  setButtonState(
    "toggle-audio-button",
    `${lp.isMicrophoneEnabled ? "Disable" : "Enable"} Audio`,
    lp.isMicrophoneEnabled
  );

  // screen share
  setButtonState(
    "share-screen-button",
    lp.isScreenShareEnabled ? "Stop Screen Share" : "Share Screen",
    lp.isScreenShareEnabled
  );

  // e2ee
  setButtonState(
    "toggle-e2ee-button",
    `${currentRoom.value.isE2EEEnabled ? "Disable" : "Enable"} E2EE`,
    currentRoom.value.isE2EEEnabled
  );
}

async function acquireDeviceList() {
  handleDevicesChanged();
}

function populateSupportedCodecs() {
  /*
<option value="" selected>PreferredCodec</option>
                <option value="vp8">VP8</option>
                <option value="h264">H.264</option>
                <option value="vp9">VP9</option>
                <option value="av1">AV1</option>
*/
  const codecSelect = $("preferred-codec");
  const options: string[][] = [
    ["", "Preferred codec"],
    ["h264", "H.264"],
    ["vp8", "VP8"],
  ];
  if (supportsVP9()) {
    options.push(["vp9", "VP9"]);
  }
  if (supportsAV1()) {
    options.push(["av1", "AV1"]);
  }
  for (const o of options) {
    const n = document.createElement("option");
    n.value = o[0];
    n.appendChild(document.createTextNode(o[1]));
    codecSelect.appendChild(n);
  }
}

// acquireDeviceList();
// populateSupportedCodecs();
const show = ref(false);
onMounted(async () => {
  appActions.connectWithFormInput();
});

onBeforeUnmount(async () => {
  appActions.disconnectRoom();
});
</script>

<template>
  <div>
    <div class="row">
      <div class="col-md-8">
        <div id="connect-area" v-show="show">
          <div>
            <input type="text" class="form-control" id="url" value="" />
          </div>
          <div>
            <input type="text" class="form-control" id="token" />
          </div>
          <div>
            <input type="text" class="form-control" id="crypto-key" />
          </div>
        </div>

        <!-- connect options -->
        <div id="options-area" v-show="show">
          <div>
            <select
              id="preferred-codec"
              class="custom-select"
              style="width: auto"
            ></select>
          </div>
        </div>

        <!-- actions -->

        <div class="flex gap-2"></div>
        <div id="inputs-area" v-show="show">
          <div>
            <select
              id="video-input"
              class="custom-select"
              onchange="appActions.handleDeviceSelected(event)"
            >
              <option selected>Video Input (default)</option>
            </select>
          </div>
          <div>
            <select
              id="audio-input"
              class="custom-select"
              onchange="appActions.handleDeviceSelected(event)"
            >
              <option selected>Audio Input (default)</option>
            </select>
          </div>
          <div v-show="false">
            <select
              id="audio-output"
              class="custom-select"
              onchange="appActions.handleDeviceSelected(event)"
            >
              <option selected>Audio Output (default)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="col-md-4" v-show="show">
        <h3>Chat</h3>
        <div id="chat-area">
          <textarea class="form-control" id="chat" rows="9"></textarea>
          <div id="chat-input-area">
            <div>
              <input
                type="text"
                class="form-control"
                id="entry"
                placeholder="Type your message here"
              />
            </div>
            <div>
              <button
                id="send-button"
                class="btn btn-primary"
                type="button"
                @click="appActions.enterText()"
                disabled
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="screenshare-area">
      <div>
        <span id="screenshare-info"> </span>
        <span id="screenshare-resolution"> </span>
      </div>
      <video id="screenshare-video" autoplay playsinline></video>
    </div>

    <div id="participants-area"></div>

    <div id="actions-area">
      <div class="flex gap-1 p-2 align-center">
        <template
          v-for="(devices, kind) in allDeviceTypes"
          v-show="isConnected"
        >
          <Select
            v-model="selectedDevices[kind]"
            @update:model-value="
              (e) => appActions.handleDeviceSelected(kind, e)
            "
          >
            <SelectTrigger class="w-[180px] min-h-[42px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="device?.deviceId" v-for="device in devices">
                {{ device?.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </template>
        <Button
          id="connect-button"
          class=""
          type="button"
          @click="appActions.connectWithFormInput()"
        >
          Connect
        </Button>
        <Button
          v-show="show"
          id="toggle-audio-button"
          class=""
          disabled
          type="button"
          @click="appActions.toggleAudio()"
        >
          Enable Mic
        </Button>
        <Button
          v-show="show"
          id="toggle-video-button"
          class=""
          disabled
          type="button"
          @click="appActions.toggleVideo()"
        >
          Enable Camera
        </Button>
        <Button
          v-show="show"
          id="flip-video-button"
          class=""
          disabled
          type="button"
          @click="appActions.flipVideo()"
        >
          Flip Camera
        </Button>
        <Button
          id="share-screen-button"
          class=""
          disabled
          type="button"
          @click="appActions.shareScreen()"
        >
          Share Screen
        </Button>

        <Button
          id="disconnect-room-button"
          disabled
          type="button"
          @click="appActions.disconnectRoom()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M2 2.75A2.75 2.75 0 0 1 4.75 0h6.5A2.75 2.75 0 0 1 14 2.75v10.5A2.75 2.75 0 0 1 11.25 16h-6.5A2.75 2.75 0 0 1 2 13.25v-.5a.75.75 0 0 1 1.5 0v.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25h-6.5c-.69 0-1.25.56-1.25 1.25v.5a.75.75 0 0 1-1.5 0v-.5Z"
              clip-rule="evenodd"
            ></path>
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M8.78 7.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H1.75a.75.75 0 0 1 0-1.5h4.69l-.97-.97a.75.75 0 0 1 1.06-1.06l2.25 2.25Z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Leave
        </Button>

        <Button
          v-show="show"
          id="start-audio-button"
          class=""
          disabled
          type="button"
          @click="appActions.startAudio()"
        >
          Start Audio
        </Button>
        <select
          v-show="show"
          id="preferred-quality"
          class="custom-select"
          style="width: auto"
          onchange="appActions.handlePreferredQuality(event)"
        >
          <option value="" selected>PreferredQuality</option>
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
        <select
          v-show="show"
          id="preferred-fps"
          class="custom-select"
          style="width: auto"
          onchange="appActions.handlePreferredFPS(event)"
        >
          <option value="" selected>PreferredFPS</option>
          <option value="30">30</option>
          <option value="15">15</option>
          <option value="8">8</option>
        </select>
      </div>
    </div>

    <div id="log-area" v-show="show">
      <textarea id="log"></textarea>
    </div>
  </div>
</template>

<style scoped>
#connect-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: min-content min-content;
  grid-auto-flow: column;
  grid-gap: 10px;
  margin-bottom: 15px;
}

#options-area {
  display: flex;
  flex-wrap: wrap;
  margin-left: 1.25rem;
  margin-right: 1.25rem;
  column-gap: 3rem;
  row-gap: 1rem;
  margin-bottom: 10px;
}

#inputs-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1.25rem;
  margin-bottom: 10px;
}

#chat-input-area {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: auto min-content;
  gap: 1.25rem;
}

#screenshare-area {
  position: relative;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  display: none;
}

#screenshare-area video {
  max-width: 900px;
  max-height: 900px;
  border: 3px solid rgba(0, 0, 0, 0.5);
}

#participants-area {
  display: flex;
}

#participants-area > .participant {
  flex-direction: column;
}

#participants-area > .participant::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 0;
  padding-bottom: calc(100% / (16 / 9));
}

#log-area {
  margin-top: 1.25rem;
  margin-bottom: 1rem;
}

#log {
  width: 66.6%;
  height: 100px;
}

.participant {
  position: relative;
  padding: 0;
  margin: 0;
  border-radius: 5px;
  border: 3px solid rgba(0, 0, 0, 0);
  overflow: hidden;
}

.participant video {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #aaa;
  object-fit: cover;
  border-radius: 5px;
}

.participant .info-bar {
  position: absolute;
  width: 100%;
  bottom: 0;
  display: grid;
  color: #eee;
  padding: 2px 8px 2px 8px;
  background-color: rgba(0, 0, 0, 0.35);
  grid-template-columns: minmax(50px, auto) 1fr minmax(50px, auto);
  z-index: 5;
}

.participant .size {
  text-align: center;
}

.participant .right {
  text-align: right;
}

.participant.speaking {
  border: 3px solid rgba(94, 166, 190, 0.7);
}

.participant .mic-off {
  color: #d33;
  text-align: right;
}

.participant .mic-on {
  text-align: right;
}

.participant .connection-excellent {
  color: green;
}

.participant .connection-good {
  color: orange;
}

.participant .connection-poor {
  color: red;
}

.participant .volume-control {
  position: absolute;
  top: 4px;
  right: 2px;
  display: flex;
  z-index: 4;
  height: 100%;
}

.participant .volume-control > input {
  width: 16px;
  height: 40%;
  -webkit-appearance: slider-vertical; /* Chromium */
}

.participant .volume-meter {
  position: absolute;
  z-index: 4;
}

.info-bar,
#local-volume {
  display: none;
}

#actions-area button:disabled,
.info-bar,
#local-volume,
progress {
  display: none !important;
}
</style>
