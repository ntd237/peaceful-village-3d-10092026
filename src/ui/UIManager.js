import * as THREE from 'three';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.speechBubble = document.getElementById('speech-bubble');
    this.loader = document.getElementById('loader');

    this.activePov = 'overview';
    this.isTransitioningCamera = false;
    this.cameraAnim = null;

    this.speechTargetWorldPos = null;
    this.speechTimeout = null;

    this.initTimeControls();
    this.initAudioControls();
    this.initPovControls();
  }

  hideLoader() {
    if (this.loader) {
      this.loader.style.opacity = '0';
      setTimeout(() => {
        this.loader.style.visibility = 'hidden';
      }, 800);
    }
  }

  initTimeControls() {
    const buttons = document.querySelectorAll('.time-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const timeKey = btn.getAttribute('data-time');
        this.app.setTimeOfDay(timeKey);
      });
    });
  }

  initAudioControls() {
    const audioBtn = document.getElementById('btn-audio');
    const audioIcon = document.getElementById('audio-icon');
    const audioText = document.getElementById('audio-text');

    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      const isPlaying = this.app.soundManager.toggleMute();
      if (isPlaying) {
        audioIcon.textContent = '🔊';
        audioText.textContent = 'Đang Bật';
        audioBtn.style.background = '#d8f3dc';
        audioBtn.style.borderColor = '#2b9348';
      } else {
        audioIcon.textContent = '🔇';
        audioText.textContent = 'Âm thanh';
        audioBtn.style.background = '';
        audioBtn.style.borderColor = '';
      }
    });
  }

  initPovControls() {
    const povButtons = document.querySelectorAll('.pov-btn');

    this.povConfigs = {
      overview: {
        pos: new THREE.Vector3(18, 14, 20),
        target: new THREE.Vector3(0, 1, 0)
      },
      windmill: {
        pos: new THREE.Vector3(-11.5, 4.2, -1.8),
        target: new THREE.Vector3(-6.5, 3.2, -4.5)
      },
      bridge: {
        pos: new THREE.Vector3(-3.2, 3.0, 5.2),
        target: new THREE.Vector3(-0.5, 0.6, 0.0)
      },
      farm: {
        pos: new THREE.Vector3(10.2, 3.8, -2.8),
        target: new THREE.Vector3(5.8, 0.8, -6.5)
      }
    };

    povButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        povButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const povKey = btn.getAttribute('data-pov');
        this.transitionCameraTo(povKey);
      });
    });
  }

  transitionCameraTo(povKey) {
    const targetConfig = this.povConfigs[povKey];
    if (!targetConfig) return;

    this.activePov = povKey;
    const controls = this.app.controls;
    const camera = this.app.camera;

    const startPos = camera.position.clone();
    const endPos = targetConfig.pos.clone();

    const startTarget = controls.target.clone();
    const endTarget = targetConfig.target.clone();

    const startTime = performance.now();
    const duration = 1400; // ms

    this.isTransitioningCamera = true;
    controls.enabled = false;

    const animateCamera = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);
      // Smooth cubic easeInOut
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(startPos, endPos, ease);
      controls.target.lerpVectors(startTarget, endTarget, ease);
      controls.update();

      if (t < 1.0) {
        requestAnimationFrame(animateCamera);
      } else {
        this.isTransitioningCamera = false;
        controls.enabled = true;
      }
    };

    requestAnimationFrame(animateCamera);
  }

  showSpeechBubble(worldPosition, text, duration = 3000) {
    if (!this.speechBubble) return;

    this.speechTargetWorldPos = worldPosition.clone();
    this.speechBubble.textContent = text;
    this.speechBubble.style.display = 'block';
    this.speechBubble.style.opacity = '1';

    this.updateSpeechBubblePosition();

    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      this.hideSpeechBubble();
    }, duration);
  }

  hideSpeechBubble() {
    if (!this.speechBubble) return;
    this.speechBubble.style.opacity = '0';
    setTimeout(() => {
      if (this.speechBubble.style.opacity === '0') {
        this.speechBubble.style.display = 'none';
        this.speechTargetWorldPos = null;
      }
    }, 250);
  }

  updateSpeechBubblePosition() {
    if (!this.speechBubble || !this.speechTargetWorldPos) return;

    const vector = this.speechTargetWorldPos.clone();
    vector.project(this.app.camera);

    // Behind camera check
    if (vector.z > 1) {
      this.speechBubble.style.display = 'none';
      return;
    }

    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    const screenX = vector.x * halfWidth + halfWidth;
    const screenY = -vector.y * halfHeight + halfHeight;

    this.speechBubble.style.left = `${screenX}px`;
    this.speechBubble.style.top = `${screenY}px`;
    this.speechBubble.style.display = 'block';
  }

  update() {
    if (this.speechTargetWorldPos) {
      this.updateSpeechBubblePosition();
    }
  }
}
