// 서버를 실제로 띄워서 /api 가 정상 응답하는지 확인하는 최소 테스트
// 운영 서버(4000)와 충돌하지 않도록 전용 포트를 사용한다
const { spawn } = require('child_process');

const PORT = process.env.TEST_PORT || 4999;
const URL = `http://127.0.0.1:${PORT}/api`;
const MAX_TRY = 20;
const INTERVAL = 500;

// 테스트 시작 전에 포트가 비어 있는지 먼저 확인한다.
// 누가 쓰고 있으면 우리 서버가 아닌 남의 응답을 검사하게 되므로 즉시 중단.
async function ensurePortIsFree() {
  try {
    await fetch(URL, { signal: AbortSignal.timeout(1000) });
  } catch {
    return; // 연결 실패 = 비어 있음 = 정상
  }
  console.error(`[실패] 포트 ${PORT} 를 이미 누군가 사용 중입니다. 테스트를 신뢰할 수 없어 중단합니다.`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await ensurePortIsFree();

  const server = spawn(process.execPath, ['app.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  let exited = false;
  server.on('exit', (code) => {
    exited = true;
    // 서버가 스스로 죽었다면 테스트할 대상이 없다
    console.error(`[실패] 서버 프로세스가 종료되었습니다 (코드 ${code})`);
    process.exit(1);
  });

  const finish = (code, message) => {
    console.log(message);
    server.removeAllListeners('exit');
    server.kill();
    process.exit(code);
  };

  for (let i = 1; i <= MAX_TRY; i++) {
    await sleep(INTERVAL);
    if (exited) return;

    try {
      const res = await fetch(URL);
      const body = await res.text();

      if (res.status !== 200) {
        return finish(1, `[실패] 상태코드가 ${res.status} 입니다`);
      }
      if (!body.includes('Express')) {
        return finish(1, `[실패] 예상과 다른 응답입니다 -> ${body}`);
      }
      return finish(0, `[통과] 포트 ${PORT} / ${res.status} ${body}`);
    } catch {
      // 아직 뜨는 중일 수 있으므로 재시도
    }
  }

  finish(1, `[실패] ${(MAX_TRY * INTERVAL) / 1000}초 안에 서버가 응답하지 않았습니다`);
})();
