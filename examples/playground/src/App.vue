<script setup lang="ts">
/**
 * 演示页：展示音频资源相关信息
 * Demo page: show audio asset metadata.
 */
import { computed, onMounted, ref } from "vue";
import beepUrl from "./assets/muisc.mp3";

const audioRef = ref<HTMLAudioElement | null>(null);
const durationSec = ref<number | null>(null);
const readyStateLabel = ref<string>("—");
const headContentType = ref<string>("—");
const headContentLength = ref<string>("—");
const fetchError = ref<string>("");

const extension = computed(() => {
  const match = beepUrl.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
  return match ? match[1].toUpperCase() : "—";
});

function updateReadyState() {
  const el = audioRef.value;
  if (!el) {
    return;
  }
  const labels = ["HAVE_NOTHING", "HAVE_METADATA", "HAVE_CURRENT_DATA", "HAVE_FUTURE_DATA", "HAVE_ENOUGH_DATA"];
  readyStateLabel.value = labels[el.readyState] ?? String(el.readyState);
}

function onLoadedMetadata() {
  const el = audioRef.value;
  if (!el || !Number.isFinite(el.duration)) {
    durationSec.value = null;
    return;
  }
  durationSec.value = el.duration;
  updateReadyState();
}

onMounted(async () => {
  updateReadyState();
  try {
    const res = await fetch(beepUrl, { method: "HEAD" });
    headContentType.value = res.headers.get("content-type") ?? "—";
    headContentLength.value = res.headers.get("content-length") ?? "—";
  } catch (err) {
    fetchError.value = err instanceof Error ? err.message : String(err);
  }
});
</script>

<template>
  <main class="page">
    <h1>Audio playground（Vue）</h1>
    <p class="hint">开发模式下由插件中间件返回压缩后的音频；打包后引用会变为目标格式（默认 mp3）。</p>

    <section class="panel">
      <h2>音频信息 / Audio info</h2>
      <dl class="grid">
        <dt>资源 URL（import ?url）/ Asset URL</dt>
        <dd><code>{{ beepUrl }}</code></dd>

        <dt>扩展名（从 URL 推断）/ Extension</dt>
        <dd>{{ extension }}</dd>

        <dt>时长（秒）/ Duration (s)</dt>
        <dd>{{ durationSec != null ? durationSec.toFixed(2) : "—" }}</dd>

        <dt>readyState / Ready state</dt>
        <dd>{{ readyStateLabel }}</dd>

        <dt>HEAD Content-Type</dt>
        <dd>{{ headContentType }}</dd>

        <dt>HEAD Content-Length</dt>
        <dd>{{ headContentLength }}</dd>

        <dt>HEAD 请求错误 / HEAD error</dt>
        <dd>{{ fetchError || "—" }}</dd>
      </dl>
    </section>

    <section class="panel">
      <h2>播放器 / Player</h2>
      <audio
        ref="audioRef"
        controls
        :src="beepUrl"
        @loadedmetadata="onLoadedMetadata"
        @canplay="updateReadyState"
      />
    </section>

    <section class="panel demo-bg">
      <h2>CSS <code>url()</code></h2>
      <p>背景引用同一音频资源（构建后路径会随插件重写）。</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.hint {
  color: #475569;
  line-height: 1.5;
}

.panel {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 8px 16px;
}

.grid dt {
  font-weight: 600;
  color: #334155;
}

.grid dd {
  margin: 0;
  word-break: break-all;
}

code {
  font-size: 0.85rem;
}

.demo-bg {
  min-height: 100px;
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 56px 56px;
}
</style>
