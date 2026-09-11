pipeline {
    agent any

    tools {
        nodejs 'node20'   // 1단계에서 등록한 NodeJS 이름
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm   // GitHub에서 코드 받아오기
            }
        }
        stage('Install') {
            steps {
                bat 'npm ci'   // Windows면 bat, Linux면 sh
            }
        }
        stage('Test') {
            steps {
                bat 'npm test'
            }
        }
        stage('Deploy') {
            steps {
                bat 'pm2 restart server || pm2 start app.js --name server'
            }
        }
    }
}