// 서버를 실제로 띄워서 /api 가 정상 응답하는지 확인하는 최소 테스트
const { spawn } = require('child_process');

const URL = 'http://127.0.0.1:4000/api';
const MAX_TRY = 20;        // 최대 20회
const INTERVAL = 500;      // 0.5초 간격 (최대 10초 대기)

const server = spawn(process.execPath, ['app.js'], { stdio: 'inherit' });

function finish(code, message) {
  console.log(message);
  server.kill();
  process.exit(code);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (let i = 1; i <= MAX_TRY; i++) {
    await sleep(INTERVAL);
    try {
      const res = await fetch(URL);
      const body = await res.text();

      if (res.status !== 200) {
        return finish(1, `[실패] 상태코드가 ${res.status} 입니다`);
      }
      if (!body.includes('Express')) {
        return finish(1, `[실패] 예상과 다른 응답입니다 -> ${body}`);
      }
      return finish(0, `[통과] ${res.status} ${body}`);
    } catch (err) {
      // 아직 서버가 뜨는 중일 수 있으므로 재시도
    }
  }
  finish(1, `[실패] ${(MAX_TRY * INTERVAL) / 1000}초 안에 서버가 응답하지 않았습니다`);
})();
