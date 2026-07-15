pipeline {
    agent any

    environment {
        DOCKER_REPO = "sarojbehera"
        DOCKER_USER = "node-app"
        IMAGE_NAME = "node-app"
        CONTAINER_NAME = "node-container"
        AWS_REGION = "ap-south-1"
        EKS_CLUSTER_NAME = "demo-ekscluster"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/sarojbehera0610/node-app.git'
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                echo "Node Version:"
                node -v

                echo "NPM Version:"
                npm -v

                echo "Docker Version:"
                docker --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t ${DOCKER_REPO}:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Docker login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: '5a8681ed-42dd-49c0-9e0f-52570c302a3f',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh 'docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}'
                }
            }
        }

        stage('Docker push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: '5a8681ed-42dd-49c0-9e0f-52570c302a3f',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        docker tag ${DOCKER_REPO}:${BUILD_NUMBER} \
                        ${DOCKER_REPO}/${DOCKER_USER}:${BUILD_NUMBER}

                        docker push ${DOCKER_REPO}/${DOCKER_USER}:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('EKS Configure') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'aws-creds', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}
                        kubectl config current-context
                        kubectl get nodes
                    '''
                }
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'aws-creds', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        sed -i "s|image:.*|image: ${DOCKER_REPO}/${DOCKER_USER}:${BUILD_NUMBER}|g" deployment.yaml
                    '''

                    sh 'cat deployment.yaml'

                    sh '''
                        kubectl apply -f deployment.yaml
                        kubectl rollout status deployment/my-deploy --timeout=120s
                        kubectl get pods
                    '''
                }
            }
        }
    }
}