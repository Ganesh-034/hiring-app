pipeline {
    agent any

        environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        
       
        stage('Docker Build') {
            steps {
                sh "docker build . -t ganesh034/hiring-app:$BUILD_NUMBER"
            }
        }
    stage('Docker Push') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'Dockerhub1', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'hubPwd')]) {
            sh '''
                echo "${hubPwd}" | docker login -u ${DOCKER_USERNAME} --password-stdin
            '''
            sh "docker push ganesh034/hiring-app:$BUILD_NUMBER"
        }
    }
}
