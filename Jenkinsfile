pipeline {
    agent any

    tools {
        nodejs 'node20'   // Jenkins Tools 에 등록한 NodeJS 이름
    }

    environment {
        // pm2 데이터 위치를 보호된 시스템 폴더 밖으로 옮긴다.
        // 기본값인 C:\windows\system32\config\systemprofile\.pm2 는
        // 윈도우가 보호하는 경로라 로그 파일 쓰기가 EPERM 으로 막힌다.
        PM2_HOME = 'C:\\pm2'

        // 운영 서버가 쓸 포트 (스모크 테스트는 4999 를 따로 사용)
        PORT = '4000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm   // GitHub에서 코드 받아오기
            }
        }

        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                // 이미 떠 있으면 재시작, 없으면 새로 띄운다
                bat 'pm2 restart server --update-env || pm2 start app.js --name server'
                // 배포 후 실제 상태를 로그에 남긴다
                bat 'pm2 list'
            }
        }
    }
} 

