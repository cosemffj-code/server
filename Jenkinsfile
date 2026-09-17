pipeline {
    agent any

    tools {
        nodejs 'node20'   // Jenkins Tools 에 등록한 NodeJS 이름
    }

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        REGISTRY   = 'ghcr.io'
        IMAGE_NAME = 'ghcr.io/cosemffj-code/myapp-backend'
        // 빌드 번호를 태그로 써서 어느 빌드의 이미지인지 추적 가능하게 한다
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                bat 'node -v'    // bat 명령어가 실패하면 여기서 멈춘다.
                bat 'docker -v'  // 
                
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

        stage('Docker Build') {
            steps {
                // 빌드번호 태그와 latest 태그를 동시에 붙인다
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest ."
                bat "docker images %IMAGE_NAME%"
            }
        }

        stage('Push to GHCR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'e8c086af-da2f-4153-be7c-93e3a1a204c6',
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_TOKEN'
                )]) {
                    // --password-stdin 을 써야 토큰이 명령행(로그)에 남지 않는다
                    // echo 뒤에 공백을 두면 토큰에 공백이 섞이므로 %GHCR_TOKEN%| 로 붙여 쓴다
                    bat 'echo %GHCR_TOKEN%| docker login %REGISTRY% -u %GHCR_USER% --password-stdin'
                    bat 'docker push %IMAGE_NAME%:%IMAGE_TAG%'
                    bat 'docker push %IMAGE_NAME%:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                // docker-compose.yml 의 backend 이미지(= IMAGE_NAME:latest)를 받아서
                // 실행 중인 컨테이너를 새 이미지로 교체한다.
                // (Push 단계의 docker login 이 아직 유효하므로 private 패키지도 pull 가능)
                bat 'docker compose pull backend'
                bat 'docker compose up -d backend'
                bat 'docker compose ps'
            }
        }
    }

    post {
        always {
            // 자격증명이 남지 않도록 항상 로그아웃
            bat returnStatus: true, script: 'docker logout %REGISTRY%'
            // 빌드마다 이미지가 쌓이므로 참조되지 않는 것들을 정리
            bat returnStatus: true, script: 'docker image prune -f'
        }
        success {
            echo "푸시 및 배포 완료: ${env.IMAGE_NAME}:${env.IMAGE_TAG} -> http://localhost:4000/api"
        }
    }
}
