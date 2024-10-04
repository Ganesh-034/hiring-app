pipeline {
    agent any

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Docker Build') {
            steps {
                sh "docker build . -t ganesh034/hiring-app:${IMAGE_TAG}"
            }
        }
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'Dockerhub1', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'hubPwd')]) {
                    sh '''
                        echo "${hubPwd}" | docker login -u ${DOCKER_USERNAME} --password-stdin
                    '''
                    sh "docker push ganesh034/hiring-app:${IMAGE_TAG}"
                }
            }
        }
    }
}
 stage('Checkout K8S manifest SCM'){
            steps {
              git branch: 'main', url: 'https://github.com/Ganesh-034/hiring-app.git'
            }
        } 
        stage('Update K8S manifest & push to Repo'){
            steps {
                script{
                   withCredentials([usernamePassword(credentialsId: 'Github_server', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) { 
                        sh '''
                        cat /var/lib/jenkins/workspace/$JOB_NAME/dev/deployment.yaml
                        sed -i "s/5/${BUILD_NUMBER}/g" /var/lib/jenkins/workspace/$JOB_NAME/dev/deployment.yaml
                        cat /var/lib/jenkins/workspace/$JOB_NAME/dev/deployment.yaml
                        git add .
                        git commit -m 'Updated the deploy yaml | Jenkins Pipeline'
                        git remote -v
                        git push https://$GIT_USERNAME:$GIT_PASSWORD@github.com/betawins/Hiring-app-argocd.git main
                        '''                        
                      }
                  }
            }   
        }
            }
} 
