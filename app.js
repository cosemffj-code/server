const express = require('express');
const cors = require('cors');
const app = express();

// 포트를 환경변수로 받는다 (없으면 4000)
// 테스트는 다른 포트로 띄워서 운영 중인 서버와 충돌하지 않게 한다
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get('/api', (req, res) => {
  res.send('안녕하세요, Express!');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
