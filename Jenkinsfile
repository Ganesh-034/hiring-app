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
                withCredentials([string(credentialsId: 'Dockerhub', variable: 'hubPwd')]) {
                    sh '''
                        echo "${hubPwd}" | docker login -u ganesh034 --password-stdin
                    '''
                    sh "docker push ganesh034/hiring-app:$BUILD_NUMBER"
                }
            }
        }
        stage('Checkout K8S manifest SCM') {
            steps {
                git branch: 'main', url: 'https://github.com/Ganesh-034/hiring-app.git'
            }
        }
        stage('Update K8S manifest & push to Repo') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'Github_server', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) { 
                        def deploymentFile = "${env.WORKSPACE}/dev/deployment.yaml"
                        sh "cat ${deploymentFile}"
                        sh "sed -i 's/5/${BUILD_NUMBER}/g' ${deploymentFile}"
                        sh "cat ${deploymentFile}"
                        sh "git clean -fd"
                        sh "git add ."
                        sh "git commit -m 'Updated the deploy yaml | Jenkins Pipeline' || exit 0"
                        sh "git remote -v"
                        sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/betawins/Hiring-app-argocd.git main || exit 1"
                    }
                }
            }   
        }
    }
}
